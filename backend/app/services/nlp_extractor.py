"""
# COST GUARDRAIL: Free tier only
# Conversational NLP & Interactive AI Advisory Engine (nlp_extractor.py)
# Powered by Google AI Studio (Gemini 2.5 Flash / Gemini Flash Latest) Native Structured JSON Engine.
# Features empathetic mentor persona, dynamic Indic advice, contextual quick-replies, and strict parameter grounding.
"""
import os
import re
import json
import logging
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from dotenv import load_dotenv
import google.generativeai as genai

# Explicitly load .env
load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("VikasSarthi.InteractiveNLP")

# Default Google AI Studio Developer Key loaded from environment
DEFAULT_GOOGLE_KEY = os.getenv("GOOGLE_API_KEY", "")

class ExtractedOnboardingParameters(BaseModel):
    latitude: Optional[float] = Field(
        default=None,
        description="Exact GPS latitude from map pin-drop"
    )
    longitude: Optional[float] = Field(
        default=None,
        description="Exact GPS longitude from map pin-drop"
    )
    geographic_location: Optional[str] = Field(
        default=None,
        description="Descriptive location name or landmark"
    )
    margin_capital: Optional[float] = Field(
        default=None,
        description="Available cash / margin capital in INR e.g. 10000, 15000, 25000."
    )
    business_category: Optional[str] = Field(
        default=None,
        description="Target enterprise sector e.g. 'Kirana & General Provision Store', 'Commercial Dairy (10+ Cattle)', 'Tailoring & Readymade Garments'"
    )
    social_category: Optional[str] = Field(
        default=None,
        description="MoSJE beneficiary category: 'General', 'SC', 'ST', 'OBC', 'Women', 'PwD', 'Transgender', 'Safai Karamchari'"
    )
    land_asset_status: Optional[str] = Field(
        default="Owned",
        description="Land status: 'Owned', 'Leased', or 'None'"
    )
    years_in_industry: Optional[int] = Field(
        default=0,
        description="Prior founder experience in years."
    )
    specific_skillsets: Optional[List[str]] = Field(
        default=[],
        description="List of specific vocational skills."
    )
    beneficiary_name: Optional[str] = Field(
        default="Beneficiary",
        description="Name of the applicant."
    )

class ConversationalExtractionResponse(BaseModel):
    is_complete: bool
    missing_parameters: List[str]
    conversational_reply: str
    suggested_quick_replies: List[str] = []
    extracted_parameters: ExtractedOnboardingParameters

class NLPExtractorService:
    def __init__(self):
        # COST GUARDRAIL: Free tier only - Google AI Studio API Key
        self.google_api_key = (
            os.getenv("GOOGLE_API_KEY") or
            os.getenv("GEMINI_API_KEY") or
            DEFAULT_GOOGLE_KEY
        )
        if self.google_api_key:
            try:
                genai.configure(api_key=self.google_api_key)
                logger.info(f"✨ [Google Gemini AI Studio] Initialized successfully with API Key: {self.google_api_key[:6]}...{self.google_api_key[-4:]}")
            except Exception as e:
                logger.warning(f"GenAI configure note: {e}")

    async def _call_gemini_llm(
        self,
        text: str,
        current_state: Optional[ExtractedOnboardingParameters] = None,
        conversation_history: Optional[List[Dict[str, Any]]] = None
    ) -> Optional[Dict[str, Any]]:
        """
        Primary Interactive LLM Layer:
        Calls Google Gemini 2.5 Flash / Flash Latest with Structured JSON Output and conversational personality.
        """
        if not self.google_api_key or len(self.google_api_key) < 20:
            logger.warning("❌ [Gemini LLM] No API key available!")
            return None

        # Build context from current conversation state
        context_parts = []
        if current_state:
            context_parts.append(
                f"Current Extracted Profile:\n"
                f"- Margin Capital: ₹{current_state.margin_capital:,.0f} (Project Outlay: ₹{(current_state.margin_capital or 0)*10:,.0f})\n" if current_state.margin_capital else "Current Extracted Profile:\n"
                f"- Business Sector: {current_state.business_category or 'Pending'}\n"
                f"- Social Category: {current_state.social_category or 'Pending'}\n"
                f"- Location: {current_state.geographic_location or 'Selected Plot'} ({current_state.latitude}, {current_state.longitude})\n"
                f"- Experience: {current_state.years_in_industry} years\n"
                f"- Land Status: {current_state.land_asset_status}"
            )

        # Build full transcript of chat dialogue
        if conversation_history:
            transcript_lines = []
            for msg in conversation_history[-8:]:
                sender = msg.get("sender") or msg.get("role") or "user"
                role_name = "User" if sender == "user" else "Advisor (Vikas Sarthi)"
                content = msg.get("text") or msg.get("content") or msg.get("rawText") or ""
                if isinstance(content, str) and content.strip():
                    transcript_lines.append(f"{role_name}: {content.strip()}")
            if transcript_lines:
                context_parts.append("Recent Chat History:\n" + "\n".join(transcript_lines))

        full_context_str = "\n\n".join(context_parts)

        system_instruction = f"""
You are Vikas Sarthi, an empathetic, highly knowledgeable, and friendly AI Business Advisory Assistant for the Ministry of Social Justice and Empowerment (MoSJE), Government of India.

Your Persona & Tone:
1. Act like a supportive, experienced business mentor sitting next to a rural/grassroots entrepreneur.
2. If the user mentions an enterprise idea (e.g. "kirana", "dairy", "tailoring", "flour mill"), praise their initiative, discuss the viability in 1-2 engaging sentences, explain the MoSJE 10% equity rule (their cash unlocks 10x project scale), and smoothly ask for any missing parameters.
3. If the user asks general advisory questions (e.g. interest rates, subsidies, no-land loans, machine procurement), answer clearly and authoritatively in fluent English, Hindi, or Hinglish (matching user's language).
4. Always generate 2 to 3 contextual, interactive "suggested_quick_replies" that the user can tap.

{full_context_str}

Analyze the user's latest input ("{text}") and output this JSON structure:
{{
  "conversational_reply": "Your warm, natural, interactive response answering questions and guiding next steps.",
  "suggested_quick_replies": ["2 to 3 interactive quick reply buttons for the user"],
  "beneficiary_name": string or null,
  "margin_capital": float in INR (e.g. 15000.0, 10000.0, 50000.0, 150000.0) or null,
  "business_category": string (e.g. Kirana & General Provision Store, Commercial Dairy (10+ Cattle), Tailoring & Readymade Garments, Mini Flour & Spice Processing Mill, Mobile Food Cart / Snack Center, Solar & Electrical Appliance Repair, Handloom & Khadi Weaving, Poultry Broiler / Layer Unit) or null,
  "social_category": one of ["SC", "ST", "OBC", "Women", "PwD", "Transgender", "Safai Karamchari", "General"] or null,
  "years_in_industry": integer (default 0),
  "geographic_location": string or null,
  "latitude": float or null,
  "longitude": float or null,
  "land_asset_status": "Owned" | "Leased" | "None"
}}

Extraction Rules:
- Autonomously parse Hindi/Hinglish numbers: "15 hazaar" / "15 hazar" -> 15000.0, "50 hazaar" -> 50000.0, "1.5 lakh" / "dedh lakh" -> 150000.0.
- "kirane ki dukaan", "kirana store", "general store", "grocery" -> Kirana & General Provision Store.
- If user replies with single words like "general", "gen", "ur", "open", "sc", "obc", "st", "women", "pwd" to answer a category prompt, extract into "social_category".
"""
        # Active free tier models with failover pool and 3.5s timeout per attempt
        models_pool = [
            "gemini-2.5-flash",
            "gemini-flash-latest",
            "gemini-2.5-flash-lite",
            "gemini-3.7-flash",
            "gemini-3.5-flash-lite"
        ]

        import asyncio
        for model_name in models_pool:
            try:
                logger.info(f"⚡ [Gemini Live Call] Model '{model_name}' on message: '{text}'")
                model = genai.GenerativeModel(
                    model_name=model_name,
                    generation_config={
                        "response_mime_type": "application/json",
                        "temperature": 0.7
                    },
                    system_instruction=system_instruction
                )
                response = await asyncio.wait_for(
                    model.generate_content_async(text),
                    timeout=3.8
                )
                if response and response.text:
                    logger.info(f"✅ [Gemini Success: {model_name}] Response received.")
                    parsed = json.loads(response.text)
                    return parsed
            except asyncio.TimeoutError:
                logger.warning(f"⚠️ [Gemini Model {model_name}] timed out after 3.8s, trying next model...")
                continue
            except Exception as e:
                logger.warning(f"⚠️ [Gemini Model {model_name}] failover note: {e}")
                continue

        return None

    def _fallback_regex_nlp_parse(self, text: str) -> ExtractedOnboardingParameters:
        """
        Secondary Backup: Deterministic semantic parser invoked only if completely offline.
        """
        text_lower = text.lower()
        
        capital = None
        if cur_match := re.search(r'(?:₹|rs\.?|inr|rupees?)\s*(\d{1,3}(?:,\d{2,3})*|\d+)', text, re.IGNORECASE):
            capital = float(cur_match.group(1).replace(",", ""))
        elif cur_suffix := re.search(r'(\d{1,3}(?:,\d{2,3})*|\d+)\s*(?:₹|rs\.?|inr|rupees?|bucks?|\/-)\b', text, re.IGNORECASE):
            capital = float(cur_suffix.group(1).replace(",", ""))
        elif lakh_match := re.search(r'(\d+(?:\.\d+)?)\s*(?:lakhs?|lac|lacs?)\b', text, re.IGNORECASE):
            capital = float(lakh_match.group(1)) * 100000.0
        elif k_match := re.search(r'(\d+(?:\.\d+)?)\s*(?:k|thousand|hazaar|hazar)\b', text, re.IGNORECASE):
            capital = float(k_match.group(1)) * 1000.0
        elif num_match := re.search(r'\b(\d{1,3}(?:,\d{3})+|\d{4,7})\b', text):
            capital = float(num_match.group(1).replace(",", ""))

        bus_cat = None
        if any(k in text_lower for k in ['general store', 'kirana', 'grocery', 'provision', 'ration', 'retail shop', 'dukaan', 'kirane ki dukaan', 'kirana dukan']):
            bus_cat = "Kirana & General Provision Store"
        elif any(k in text_lower for k in ['dairy', 'cow', 'milk', 'buffalo', 'cattle', 'goshala']):
            bus_cat = "Commercial Dairy (10+ Cattle)"
        elif any(k in text_lower for k in ['tailor', 'garment', 'stitch', 'cloth', 'boutique', 'sewing']):
            bus_cat = "Tailoring & Readymade Garments"
        elif any(k in text_lower for k in ['flour', 'spice', 'mill', 'chakki', 'atta', 'masala']):
            bus_cat = "Mini Flour & Spice Processing Mill"

        social_cat = None
        if any(k in text_lower for k in ['women', 'female', 'mahila', 'ladies']):
            social_cat = "Women"
        elif any(k in text_lower for k in ['safai', 'karamchari', 'swachhata']):
            social_cat = "Safai Karamchari"
        elif re.search(r'\b(sc|scheduled caste|dalit)\b', text_lower):
            social_cat = "SC"
        elif re.search(r'\b(st|scheduled tribe|adivasi|tribal)\b', text_lower):
            social_cat = "ST"
        elif re.search(r'\b(obc|other backward|backward class)\b', text_lower):
            social_cat = "OBC"
        elif any(k in text_lower for k in ['pwd', 'disability', 'handicap', 'divyang', 'disabled']):
            social_cat = "PwD"
        elif 'transgender' in text_lower:
            social_cat = "Transgender"
        elif text_lower.strip() in ['general', 'gen', 'ur', 'open', 'unreserved', 'general category']:
            social_cat = "General"
        elif re.search(r'\b(general category|general caste|open category|in general|i am general|general class|unreserved|ur category)\b', text_lower):
            social_cat = "General"
        elif 'general' in text_lower and not any(k in text_lower for k in ['general store', 'general merchant', 'general shop', 'general provision', 'general goods']):
            social_cat = "General"

        exp = 0
        if exp_match := re.search(r'(\d+)\s*(?:years?|yrs?)(?:\s*(?:of)?\s*experience|\s*working)?', text, re.IGNORECASE):
            exp = int(exp_match.group(1))

        lat, lon, loc_label = None, None, None
        if "jodhpur" in text_lower or "rajasthan" in text_lower:
            lat, lon, loc_label = 26.2389, 73.0243, "Jodhpur, Rajasthan"
        elif "haryana" in text_lower or "karnal" in text_lower:
            lat, lon, loc_label = 29.6857, 76.9905, "Rural Haryana (Karnal)"
        elif "purnia" in text_lower:
            lat, lon, loc_label = 25.7771, 87.4753, "Purnia, Bihar"
        elif "varanasi" in text_lower:
            lat, lon, loc_label = 25.3176, 82.9739, "Varanasi, Uttar Pradesh"

        return ExtractedOnboardingParameters(
            latitude=lat,
            longitude=lon,
            geographic_location=loc_label,
            margin_capital=capital,
            business_category=bus_cat,
            social_category=social_cat,
            land_asset_status="Owned",
            years_in_industry=exp,
            specific_skillsets=[],
            beneficiary_name="Beneficiary"
        )

    async def parse_conversational_input(
        self,
        user_message: str,
        current_state: Optional[ExtractedOnboardingParameters] = None,
        conversation_history: Optional[List[Dict[str, Any]]] = None
    ) -> ConversationalExtractionResponse:
        # 1. Primary: Dynamic Interactive Gemini LLM
        raw_llm_result = await self._call_gemini_llm(user_message, current_state, conversation_history)

        extracted = None
        dynamic_reply = None
        quick_replies = []

        if raw_llm_result:
            dynamic_reply = raw_llm_result.get("conversational_reply")
            quick_replies = raw_llm_result.get("suggested_quick_replies") or []

            cap = None
            if raw_llm_result.get("margin_capital") is not None:
                try:
                    cap = float(raw_llm_result["margin_capital"])
                except:
                    cap = None

            b_cat = raw_llm_result.get("business_category")
            if b_cat:
                b_lower = b_cat.lower()
                if any(k in b_lower for k in ['general store', 'kirana', 'grocery', 'provision', 'ration', 'dukaan']):
                    b_cat = "Kirana & General Provision Store"
                elif any(k in b_lower for k in ['dairy', 'cow', 'milk', 'buffalo', 'cattle']):
                    b_cat = "Commercial Dairy (10+ Cattle)"
                elif any(k in b_lower for k in ['tailor', 'garment', 'stitch', 'cloth', 'boutique', 'silai']):
                    b_cat = "Tailoring & Readymade Garments"
                elif any(k in b_lower for k in ['flour', 'spice', 'mill', 'chakki', 'atta']):
                    b_cat = "Mini Flour & Spice Processing Mill"

            extracted = ExtractedOnboardingParameters(
                latitude=raw_llm_result.get("latitude"),
                longitude=raw_llm_result.get("longitude"),
                geographic_location=raw_llm_result.get("geographic_location"),
                margin_capital=cap,
                business_category=b_cat,
                social_category=raw_llm_result.get("social_category"),
                land_asset_status=raw_llm_result.get("land_asset_status") or "Owned",
                years_in_industry=int(raw_llm_result.get("years_in_industry") or 0),
                beneficiary_name=raw_llm_result.get("beneficiary_name") or "Beneficiary"
            )

        # 2. Secondary: Fallback if LLM offline
        if not extracted:
            extracted = self._fallback_regex_nlp_parse(user_message)
        else:
            fallback = self._fallback_regex_nlp_parse(user_message)
            if extracted.margin_capital is None and fallback.margin_capital is not None:
                extracted.margin_capital = fallback.margin_capital
            if extracted.latitude is None and fallback.latitude is not None:
                extracted.latitude = fallback.latitude
                extracted.longitude = fallback.longitude
                extracted.geographic_location = fallback.geographic_location
            if not extracted.social_category and fallback.social_category:
                extracted.social_category = fallback.social_category
            if not extracted.business_category and fallback.business_category:
                extracted.business_category = fallback.business_category

        # 3. State Preservation across conversation turns
        if current_state:
            if extracted.latitude is None and current_state.latitude is not None:
                extracted.latitude = current_state.latitude
                extracted.longitude = current_state.longitude
                extracted.geographic_location = current_state.geographic_location
            if (extracted.margin_capital is None or extracted.margin_capital <= 0) and (current_state.margin_capital and current_state.margin_capital > 0):
                extracted.margin_capital = current_state.margin_capital
            if not extracted.business_category and current_state.business_category:
                extracted.business_category = current_state.business_category
            if not extracted.social_category and current_state.social_category:
                extracted.social_category = current_state.social_category
            if extracted.years_in_industry == 0 and current_state.years_in_industry > 0:
                extracted.years_in_industry = current_state.years_in_industry
            if extracted.beneficiary_name == "Beneficiary" and current_state.beneficiary_name != "Beneficiary":
                extracted.beneficiary_name = current_state.beneficiary_name

        # If location not set anywhere, anchor to default map center
        if extracted.latitude is None or extracted.longitude is None:
            extracted.latitude = 28.6139
            extracted.longitude = 77.2090
            extracted.geographic_location = "Selected Map Plot"

        # 4. Check for missing required parameters
        missing = []
        if extracted.margin_capital is None or extracted.margin_capital <= 0:
            missing.append("Available Margin Cash (₹)")
        if not extracted.business_category:
            missing.append("Business Category")
        if not extracted.social_category:
            missing.append("Social Category (e.g. SC, ST, OBC, Women, General)")

        # 5. Smart, Interactive Response Construction
        if missing:
            is_complete = False
            if not dynamic_reply or len(dynamic_reply.strip()) < 10:
                known_parts = []
                if extracted.business_category:
                    known_parts.append(f"**{extracted.business_category}**")
                if extracted.margin_capital and extracted.margin_capital > 0:
                    known_parts.append(f"**₹{extracted.margin_capital:,.0f} margin cash** *(unlocks a ₹{extracted.margin_capital*10:,.0f} project)*")
                if extracted.social_category:
                    known_parts.append(f"**{extracted.social_category} category**")

                known_summary = ""
                if known_parts:
                    known_summary = f"Got it! I've recorded your {', '.join(known_parts)}.\n\n"

                if len(missing) == 1 and "Social Category" in missing[0]:
                    dynamic_reply = (
                        f"{known_summary}"
                        f"To apply your **MoSJE interest subvention discount**, what is your **social category**? "
                        f"(e.g. *SC, ST, OBC, Women, PwD, Safai Karamchari, or General*)"
                    )
                elif len(missing) == 1 and "Available Margin Cash" in missing[0]:
                    dynamic_reply = (
                        f"{known_summary}"
                        f"How much **margin capital / cash savings (₹)** do you have available for this enterprise?"
                    )
                else:
                    missing_items = " and ".join(missing)
                    dynamic_reply = (
                        f"{known_summary}"
                        f"To structure your government concessional loan, please tell me your **{missing_items}**."
                    )
            
            # Contextual quick replies if not provided by Gemini
            if not quick_replies:
                if any("Social Category" in m for m in missing):
                    quick_replies = ["OBC Category", "SC Category", "Women / Mahila", "General Category"]
                elif any("Available Margin Cash" in m for m in missing):
                    quick_replies = ["₹10,000 Cash", "₹25,000 Cash", "₹50,000 Cash", "₹1.5 Lakh Savings"]
                else:
                    quick_replies = ["Kirana / General Store", "Dairy Farm", "Tailoring Unit", "Flour & Spice Mill"]
        else:
            is_complete = True
            if not dynamic_reply or "All Parameters" not in dynamic_reply:
                dynamic_reply = (
                    f"✅ **All Parameters Confirmed for MoSJE Feasibility Structuring!**\n\n"
                    f"• **Enterprise:** {extracted.business_category}\n"
                    f"• **Margin Capital:** ₹{extracted.margin_capital:,.0f} *(10% Equity Rule unlocks ₹{extracted.margin_capital*10:,.0f} Project)*\n"
                    f"• **Social Category:** {extracted.social_category} *(Interest Subvention Active)*\n"
                    f"• **GPS Plot:** ({extracted.latitude:.4f}, {extracted.longitude:.4f}) [{extracted.geographic_location or 'Micro-Market'}]\n"
                    f"• **Experience:** {extracted.years_in_industry} Years\n\n"
                    f"🚀 Structuring 5.0 km Market Void Analysis & 1-Click Bank-Ready DPR PDF..."
                )
            if not quick_replies:
                quick_replies = ["📄 Download Bank DPR PDF", "🗺️ View Competitor Saturation Map", "💰 Check Loan Moratorium Schedule"]

        return ConversationalExtractionResponse(
            is_complete=is_complete,
            missing_parameters=missing,
            conversational_reply=dynamic_reply,
            suggested_quick_replies=quick_replies,
            extracted_parameters=extracted
        )

nlp_extractor = NLPExtractorService()
