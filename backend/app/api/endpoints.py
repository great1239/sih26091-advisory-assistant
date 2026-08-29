"""
# COST GUARDRAIL: Free tier only
# FastAPI REST Endpoints with Free-Tier Rate Limiting & data.gov.in Integration
"""
import os
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import FileResponse
from app.middleware.rate_limit import limiter
from app.models.schemas import (
    OnboardingInput, AssessmentResponse, SavingsTrackerInput,
    SavingsTrackerResponse, KioskTapInput, KioskTapResponse
)
from app.services.geo_engine import geo_engine, DISTRICT_BENCHMARKS
from app.services.void_analysis import void_engine
from app.services.risk_engine import risk_engine
from app.services.finance_service import finance_service
from app.services.feasibility_service import feasibility_service
from app.services.financial_calculator import financial_engine
from app.services.pivot_engine import pivot_engine
from app.services.moratorium_engine import moratorium_engine
from app.services.dpr_generator import dpr_generator
from app.services.data_ingestion_service import data_ingestion_service
from app.services.data_gov_client import data_gov_client
from app.services.push_notification_service import push_service
from app.services.equipment_catalog import equipment_service
from app.services.payment_gateway import payment_service
from app.services.sca_directory import sca_service
from app.services.nlp_extractor import nlp_extractor, ExtractedOnboardingParameters

router = APIRouter()

class ChatExtractRequest(BaseModel):
    message: str
    current_state: Optional[Dict[str, Any]] = None
    conversation_history: Optional[List[Dict[str, Any]]] = None

class ChatExtractResponse(BaseModel):
    is_complete: bool
    missing_parameters: List[str]
    conversational_reply: str
    suggested_quick_replies: List[str] = []
    extracted_parameters: Dict[str, Any]
    assessment_result: Optional[AssessmentResponse] = None

class PushSubscribeRequest(BaseModel):
    beneficiary_name: str
    subscription: Dict[str, Any]

class PushTestRequest(BaseModel):
    title: str
    body: str
    target_beneficiary: Optional[str] = None

class LiveOSMQueryRequest(BaseModel):
    min_lat: float
    min_lon: float
    max_lat: float
    max_lon: float

class DataGovQueryRequest(BaseModel):
    resource_id: str
    filters: Optional[Dict[str, str]] = None
    limit: int = 10
    offset: int = 0

class UPIQRRequest(BaseModel):
    amount_inr: float
    beneficiary_name: str
    transaction_note: Optional[str] = "Margin Capital Escrow Deposit"

# COST GUARDRAIL: Free tier only - Capped at 20 req/min
@router.post("/chat/extract", response_model=ChatExtractResponse)
@limiter.limit("20/minute")
async def extract_conversational_parameters(request: Request, payload: ChatExtractRequest):
    """
    Conversational NLP Endpoint: Extracts parameters using Google Gemini 3.6 Flash with full dialog history.
    """
    try:
        current_pydantic = None
        if payload.current_state:
            current_pydantic = ExtractedOnboardingParameters(**payload.current_state)

        result = await nlp_extractor.parse_conversational_input(
            user_message=payload.message,
            current_state=current_pydantic,
            conversation_history=payload.conversation_history
        )

        assessment = None
        if result.is_complete and result.extracted_parameters.margin_capital:
            p = result.extracted_parameters
            onboarding_input = OnboardingInput(
                beneficiary_name=p.beneficiary_name or "Beneficiary",
                latitude=float(p.latitude or 26.2389),
                longitude=float(p.longitude or 73.0243),
                geographic_location=p.geographic_location or "Jodhpur, Rajasthan",
                margin_capital=float(p.margin_capital),
                business_category=p.business_category or "Tailoring & Readymade Garments",
                social_category=p.social_category or "General",
                land_asset_status=p.land_asset_status or "Owned",
                years_in_industry=int(p.years_in_industry or 0),
                specific_skillsets=p.specific_skillsets or [],
                ui_translation_language=p.ui_translation_language or "hi-IN"
            )
            assessment = await assess_enterprise(request, onboarding_input)

        return ChatExtractResponse(
            is_complete=result.is_complete,
            missing_parameters=result.missing_parameters,
            conversational_reply=result.conversational_reply,
            suggested_quick_replies=result.suggested_quick_replies,
            extracted_parameters=result.extracted_parameters.model_dump(),
            assessment_result=assessment
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Conversational Extraction Error: {str(e)}")

# COST GUARDRAIL: Free tier only - Capped at 30 req/min
@router.post("/assess", response_model=AssessmentResponse)
@limiter.limit("30/minute")
async def assess_enterprise(request: Request, payload: OnboardingInput):
    """
    Main Hyper-Local Feasibility & Deterministic MoSJE Financial Structuring Pipeline.
    Uses exact GPS latitude and longitude for a 5.0 km micro-market radius.
    """
    try:
        # Process coordinates: if default lat/lng but specific location text provided, resolve
        if payload.latitude == 26.2389 and payload.longitude == 73.0243 and payload.geographic_location and "jodhpur" not in payload.geographic_location.lower():
            geo_bounding = geo_engine.process_location(payload.geographic_location, custom_radius_km=5.0)
        else:
            geo_bounding = geo_engine.process_coordinates(
                latitude=payload.latitude,
                longitude=payload.longitude,
                location_label=payload.geographic_location or f"GPS Plot ({payload.latitude:.4f}, {payload.longitude:.4f})",
                custom_radius_km=5.0
            )
        
        void_result = void_engine.calculate_void(geo_bounding, payload.business_category)
        
        risk_result = risk_engine.evaluate_risks(
            geo=geo_bounding,
            business_category=payload.business_category,
            margin_capital=payload.margin_capital,
            years_experience=payload.years_in_industry,
            land_status=payload.land_asset_status
        )
        
        fin_result = financial_engine.calculate_structure(
            margin_capital=payload.margin_capital,
            social_category=payload.social_category,
            years_experience=payload.years_in_industry
        )
        
        swot_matrix = pivot_engine.generate_swot(
            business_category=payload.business_category,
            years_experience=payload.years_in_industry,
            social_category=payload.social_category,
            void_result=void_result,
            risk_result=risk_result,
            land_status=payload.land_asset_status
        )
        
        pivot_recs = pivot_engine.generate_pivots(
            original_category=payload.business_category,
            margin_capital=payload.margin_capital,
            land_status=payload.land_asset_status,
            void_result=void_result,
            risk_result=risk_result
        )
        
        nudges = moratorium_engine.generate_nudges(
            beneficiary_name=payload.beneficiary_name or "Beneficiary",
            business_category=payload.business_category,
            quarterly_emi=fin_result.quarterly_emi_post_moratorium,
            monthly_emi=fin_result.monthly_emi_post_moratorium,
            moratorium_months=fin_result.moratorium_months,
            preferred_language=payload.preferred_language
        )
        
        if payload.preferred_language == "Hindi":
            audio_text = (
                f"नमस्ते {payload.beneficiary_name} जी। ({payload.latitude:.2f}, {payload.longitude:.2f}) के 5 किलोमीटर दायरे में आपके {payload.business_category} उद्यम का कुल प्रोजेक्ट खर्च "
                f"₹{fin_result.total_project_cost:,.0f} तय हुआ है। आपके {payload.social_category} वर्ग के तहत आपको {fin_result.final_subvented_interest_rate}% "
                f"की रियायती ब्याज दर पर ₹{fin_result.concessional_loan_eligibility:,.0f} का लोन मिलेगा, जिसमें {fin_result.moratorium_months} महीने का मोराटोरियम शामिल है।"
            )
        else:
            audio_text = (
                f"Greetings {payload.beneficiary_name}. For your 5km micro-market centered at ({payload.latitude:.2f}, {payload.longitude:.2f}), "
                f"the total project cost for {payload.business_category} is ₹{fin_result.total_project_cost:,.0f}. Under your {payload.social_category} category, "
                f"you are eligible for a concessional loan of ₹{fin_result.concessional_loan_eligibility:,.0f} at {fin_result.final_subvented_interest_rate}% interest "
                f"with a {fin_result.moratorium_months}-month repayment grace period."
            )

        response = AssessmentResponse(
            status="SUCCESS",
            beneficiary_name=payload.beneficiary_name or "Smt. / Sh. Beneficiary",
            social_category=payload.social_category,
            geographic_location=geo_bounding.query_location,
            business_category=payload.business_category,
            geo_bounding=geo_bounding,
            void_analysis=void_result,
            risk_assessment=risk_result,
            financial_structuring=fin_result,
            swot_analysis=swot_matrix,
            pivot_recommendations=pivot_recs,
            moratorium_milestones=nudges,
            dpr_report_available=True,
            summary_audio_text=audio_text,
            ui_translation_language=payload.ui_translation_language or "hi-IN"
        )
        
        try:
            dpr_generator.generate_dpr_pdf(response)
        except Exception as e:
            print(f"Warning: DPR PDF generation error: {e}")
            
        return response

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Assessment Pipeline Error: {str(e)}")

# ==============================================================================
# Open Government Data (data.gov.in) Endpoints with 24-Hour Caching
# ==============================================================================

# COST GUARDRAIL: Free tier only - 15 req/min
@router.post("/data/gov-query")
@limiter.limit("15/minute")
async def query_data_gov_in(request: Request, payload: DataGovQueryRequest):
    """
    Queries any public data.gov.in resource ID with filters and 24h caching.
    """
    return await data_gov_client.query_dataset(
        resource_id=payload.resource_id,
        filters=payload.filters,
        limit=payload.limit,
        offset=payload.offset
    )

@router.get("/data/mandi-pricing")
@limiter.limit("20/minute")
async def get_mandi_pricing(request: Request, district: str, state: str = "Rajasthan", commodity: Optional[str] = None):
    """
    Pulls live Agmarknet wholesale mandi pricing for agricultural/food processing inputs.
    """
    return await data_gov_client.get_mandi_commodity_pricing(
        district=district,
        state=state,
        commodity=commodity
    )

# Web Push Notification Endpoints
@router.get("/push/vapid-public-key")
async def get_vapid_public_key():
    return {"public_key": push_service.get_public_key()}

@router.post("/push/subscribe")
async def subscribe_push_notifications(payload: PushSubscribeRequest):
    return push_service.register_subscription(
        beneficiary_name=payload.beneficiary_name,
        subscription_info=payload.subscription
    )

@router.post("/push/send-test")
async def send_test_push(payload: PushTestRequest):
    return push_service.send_push_notification(
        title=payload.title,
        body=payload.body,
        target_beneficiary=payload.target_beneficiary
    )

# COST GUARDRAIL: Free tier only - Capped at 15 req/min
@router.post("/data/live-osm-query")
@limiter.limit("15/minute")
async def query_live_osm(request: Request, payload: LiveOSMQueryRequest):
    return await data_ingestion_service.query_live_osm_commercial_nodes(
        min_lat=payload.min_lat,
        min_lon=payload.min_lon,
        max_lat=payload.max_lat,
        max_lon=payload.max_lon
    )

# COST GUARDRAIL: Free tier only - Capped at 15 req/min
@router.get("/data/live-cgwb-query")
@limiter.limit("15/minute")
async def query_live_cgwb(request: Request, district: str, state: str = "Rajasthan"):
    return await data_ingestion_service.query_live_cgwb_ecological_data(district, state)

@router.get("/dpr/download/{beneficiary_name}")
async def download_dpr(beneficiary_name: str):
    safe_name = beneficiary_name.replace(" ", "_").replace(".", "")
    reports_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "static", "reports")
    
    if os.path.exists(reports_dir):
        for f in os.listdir(reports_dir):
            if safe_name.lower() in f.lower() and f.endswith(".pdf"):
                return FileResponse(
                    os.path.join(reports_dir, f),
                    media_type="application/pdf",
                    filename=f
                )
    raise HTTPException(status_code=404, detail="DPR Report PDF not found. Run /api/assess first.")

@router.get("/equipment/catalog")
async def get_equipment_catalog():
    return equipment_service.get_full_catalog()

@router.post("/upi/generate-qr")
async def generate_upi_qr(payload: UPIQRRequest):
    return payment_service.generate_upi_qr(
        amount_inr=payload.amount_inr,
        beneficiary_name=payload.beneficiary_name,
        transaction_note=payload.transaction_note or "Margin Capital Deposit"
    )

@router.get("/sca/directory")
async def get_sca_directory():
    return sca_service.get_all_scas()

@router.post("/savings-tracker", response_model=SavingsTrackerResponse)
async def track_savings_goal(payload: SavingsTrackerInput):
    required_margin = round(payload.target_project_cost * 0.10, 2)
    gap = max(0.0, round(required_margin - payload.current_savings, 2))
    weeks = int(gap / payload.weekly_savings_capacity) + (1 if gap % payload.weekly_savings_capacity != 0 else 0) if payload.weekly_savings_capacity > 0 and gap > 0 else 0
    months = round(weeks / 4.33, 1)
    
    milestones = []
    for pct in [25, 50, 75, 100]:
        target_amt = round(required_margin * (pct / 100.0), 2)
        milestones.append({
            "percentage": pct,
            "target_amount_inr": target_amt,
            "is_achieved": payload.current_savings >= target_amt,
            "badge_name": f"Stage {pct//25}: {'Panchayat Saver' if pct==25 else 'Udyam Builder' if pct==50 else 'Vikas Sarthi' if pct==75 else 'MoSJE Loan Ready!'}"
        })
        
    return SavingsTrackerResponse(
        target_project_cost=payload.target_project_cost,
        required_margin_capital=required_margin,
        current_savings=payload.current_savings,
        savings_gap_inr=gap,
        weeks_to_goal=weeks,
        months_to_goal=months,
        milestones=milestones,
        gamified_badge="MoSJE Loan Ready! 🚀" if gap == 0 else "Udyam Sarthi in Progress 🌟"
    )

@router.post("/kiosk/tap", response_model=KioskTapResponse)
async def kiosk_rfid_tap(payload: KioskTapInput):
    sample_cards = {
        "RFID-MOSJE-001": {
            "name": "Sunita Devi", "social_cat": "Women / SC", "district": "Jodhpur",
            "lat": 26.2389, "lon": 73.0243,
            "margin": 14000.0, "category": "Handloom & Khadi Weaving", "experience": 4
        }
    }
    card = sample_cards.get(payload.rfid_card_uid, {
        "name": "Sunita Devi", "social_cat": "Women / SC", "district": "Jodhpur",
        "lat": 26.2389, "lon": 73.0243,
        "margin": 14000.0, "category": "Handloom & Khadi Weaving", "experience": 4
    })
    receipt = (
        "================================\n"
        "   GRAM PANCHAYAT KIOSK STATION  \n"
        "    MoSJE ADVISORY RECEIPT       \n"
        "================================\n"
        f"BENEFICIARY : {card['name']}\n"
        f"GPS PIN     : {card['lat']}, {card['lon']}\n"
        f"MARGIN CASH : INR {card['margin']:,.0f}\n"
        f"PROJECT COST: INR {card['margin']*10:,.0f}\n"
        f"LOAN ELIG.  : INR {card['margin']*9:,.0f}\n"
        "STATUS      : PRE-APPROVED (100%)\n"
        "================================\n"
    )
    return KioskTapResponse(
        beneficiary_name=card["name"],
        social_category=card["social_cat"],
        registered_district=card["district"],
        margin_capital=card["margin"],
        preferred_category=card["category"],
        years_experience=card["experience"],
        thermal_receipt_payload=receipt
    )

@router.get("/districts")
async def list_districts():
    return DISTRICT_BENCHMARKS
