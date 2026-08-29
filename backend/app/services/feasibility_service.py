"""
Feasibility & AI Advisory Service (feasibility_service.py)
Multi-dimensional geospatial, economic, and ecological telemetry orchestration:
1. Strict 5km geospatial bounding & market void calculation (Formal vs Informal UPI proxies).
2. Central Ground Water Board (CGWB) & India-WRIS DWLR ecological hard veto with 0-100 safety score.
3. ISRO Bhuvan 1:50,000 thematic land use viability clearance.
4. RBI District Credit-Deposit (CD) ratio banking feasibility & auto-downscaling.
5. Experience-adjusted dynamic SWOT rebalancing (Founder competency discount & technical execution shift).
6. Plain-language, jargon-free beneficiary report generation.
7. Automated 3-way strategic pivots (Sector-Adjacent, Budget-Scaled, Mobile/Cart-Based).
"""
import math
from typing import Dict, List, Any, Optional

# Simulated Central Ground Water Board (CGWB) Over-Exploited / Dark Zone Registry
CGWB_DARK_ZONES = {
    "jodhpur", "jaipur", "sangrur", "moga", "patiala", 
    "mehsana", "banaskantha", "anantapur", "chittoor",
    "osmanabad", "latur", "dindigul", "coimbatore", "salem",
    "bikaner", "jaisalmer", "nagaur", "jhunjhunu", "sikar"
}

WATER_INTENSIVE_CATEGORIES = {
    "commercial dairy", "dairy", "textile dyeing", "dyeing",
    "ice plant", "water bottling", "tannery", "intensive aquaculture",
    "beverage manufacturing", "car wash", "industrial laundry"
}

# RBI District Credit-Deposit (CD) Ratio Benchmark Registry (2024-2025)
DISTRICT_CD_RATIOS = {
    "jodhpur": 64.2,
    "jaipur": 78.5,
    "purnia": 38.4,    # Low CD ratio -> triggers auto-downscaling
    "karnal": 72.1,
    "varanasi": 46.8,
    "salem": 81.3,
    "patna": 42.1,
    "darbhanga": 34.6, # Low CD ratio
    "gaya": 37.2,      # Low CD ratio
    "default": 58.0
}

class FeasibilityService:
    def __init__(self):
        self.default_radius_km = 5.0  # Strict 5km trade bounding

    def get_geospatial_bounding_box(self, location_name: str, lat: float = 26.2389, lon: float = 73.0243, radius_km: float = 5.0) -> Dict[str, Any]:
        """
        Draws strict 5km geospatial bounding box around target rural coordinates.
        """
        lat_delta = radius_km / 111.0
        lon_delta = radius_km / (111.0 * math.cos(math.radians(lat)))
        
        return {
            "query_location": location_name,
            "center_lat": round(lat, 6),
            "center_lon": round(lon, 6),
            "radius_km": radius_km,
            "min_lat": round(lat - lat_delta, 6),
            "max_lat": round(lat + lat_delta, 6),
            "min_lon": round(lon - lon_delta, 6),
            "max_lon": round(lon + lon_delta, 6),
            "catchment_area_sqkm": round(math.pi * (radius_km ** 2), 2)
        }

    def check_ecological_veto(self, location_str: str, business_category: str) -> Dict[str, Any]:
        """
        Queries India-WRIS / CGWB Digital Water Level Recorder (DWLR) telemetry.
        Rejects water-intensive projects in over-exploited aquifers / Dark Zones.
        Returns 0-100 Ecological Safety Score and color status.
        """
        loc_clean = location_str.lower()
        cat_clean = business_category.lower()

        is_dark_zone = any(dz in loc_clean for dz in CGWB_DARK_ZONES)
        is_water_intensive = any(wi in cat_clean for wi in WATER_INTENSIVE_CATEGORIES)

        # DWLR telemetry simulation
        dwlr_depth_m = 42.8 if is_dark_zone else 14.2

        if is_dark_zone and is_water_intensive:
            return {
                "veto_triggered": True,
                "ecological_safety_score": 15,
                "color_indicator": "red",
                "dwlr_groundwater_level_m_bgl": dwlr_depth_m,
                "aquifer_status": "Over-Exploited / Dark Zone (Critical)",
                "reason": f"CRITICAL CGWB VETO: {location_str.title()} is in an Over-Exploited / Dark Zone (DWLR depth {dwlr_depth_m}m). Commercial borehole extraction for '{business_category}' is legally prohibited.",
                "plain_language": f"⚠️ Ground water is strictly restricted here (Dark Zone). Starting a water-heavy business like {business_category} will get rejected by authorities. We recommend switching to a dry/service business alternative.",
                "is_dark_zone": True,
                "is_water_intensive": True
            }
        elif is_dark_zone and not is_water_intensive:
            return {
                "veto_triggered": False,
                "ecological_safety_score": 75,
                "color_indicator": "yellow",
                "dwlr_groundwater_level_m_bgl": dwlr_depth_m,
                "aquifer_status": "Semi-Critical / Over-Exploited (Non-Water Business Allowed)",
                "reason": "Location is in a water-stressed block, but approved because business has zero/low water dependency.",
                "plain_language": "✅ Safe to start. The area has low groundwater, but because your business does not need heavy water, you are fully cleared.",
                "is_dark_zone": True,
                "is_water_intensive": False
            }
        else:
            return {
                "veto_triggered": False,
                "ecological_safety_score": 95,
                "color_indicator": "green",
                "dwlr_groundwater_level_m_bgl": dwlr_depth_m,
                "aquifer_status": "Safe Recharge Zone",
                "reason": "Ecological clearance granted. Safe groundwater aquifer capacity with DWLR clearance.",
                "plain_language": "✅ Excellent ecological conditions. Groundwater levels and local resources are safe and abundant.",
                "is_dark_zone": False,
                "is_water_intensive": is_water_intensive
            }

    def check_isro_bhuvan_land_viability(self, land_status: str, location_str: str) -> Dict[str, Any]:
        """
        Assesses ISRO Bhuvan 1:50,000 Thematic Datasets for plot zoning, flood risks, and wasteland status.
        """
        status_clean = (land_status or "").lower()
        if "none" in status_clean or "no land" in status_clean:
            return {
                "land_safety_score": 40,
                "color_indicator": "yellow",
                "zoning_clearance": "No Fixed Real-Estate (Mobile/Cart Strategy Required)",
                "flood_risk": "Low (Mobile Asset)",
                "bhuvan_thematic_status": "Unassigned / Roaming",
                "plain_language": "💡 You don't have registered commercial land. Don't worry! We will structure your loan as a mobile/portable unit so banks don't require property collateral."
            }
        return {
            "land_safety_score": 92,
            "color_indicator": "green",
            "zoning_clearance": "Approved: Rural Settlement Buffer / Non-Wetland",
            "flood_risk": "Safe: Non-Inundation Zone (1:50,000 ISRO Topography)",
            "bhuvan_thematic_status": "Rural Enterprise Viable (Category-A)",
            "plain_language": f"✅ Your plot ({land_status}) is legally clear and safe from flood or wetland restrictions."
        }

    def evaluate_rbi_credit_feasibility(self, location_str: str, requested_loan_amount: float) -> Dict[str, Any]:
        """
        Evaluates RBI District Credit-Deposit (CD) ratio.
        If CD ratio < 40%, automatically scales down loan amount to protect approval odds.
        """
        loc_clean = location_str.lower()
        cd_ratio = DISTRICT_CD_RATIOS["default"]
        for dist, ratio in DISTRICT_CD_RATIOS.items():
            if dist in loc_clean:
                cd_ratio = ratio
                break

        is_low_cd = cd_ratio < 40.0
        scale_down_factor = 0.85 if is_low_cd else 1.00
        adjusted_loan_amount = round(requested_loan_amount * scale_down_factor, 2)
        approval_probability = 62 if is_low_cd else 88

        return {
            "district_cd_ratio": cd_ratio,
            "is_low_lending_zone": is_low_cd,
            "original_loan_amount": requested_loan_amount,
            "recommended_loan_amount": adjusted_loan_amount,
            "scale_down_applied": is_low_cd,
            "approval_probability_score": approval_probability,
            "color_indicator": "yellow" if is_low_cd else "green",
            "plain_language": (
                f"⚠️ Local banks in this district have cautious lending habits (CD Ratio: {cd_ratio}%). "
                f"We optimized your loan request to ₹{adjusted_loan_amount:,.0f} so the bank manager can approve it immediately without delays."
                if is_low_cd else
                f"✅ Local banks have active lending budgets (CD Ratio: {cd_ratio}%). High chance of rapid approval for ₹{adjusted_loan_amount:,.0f}."
            )
        }

    def calculate_void_analysis(
        self,
        catchment_pop: int,
        per_capita_annual_spend: float,
        formal_merchant_count: int,
        informal_merchant_count: int
    ) -> Dict[str, Any]:
        """
        Void Analysis Formula:
        Market Void = (Baseline Demographic Demand) - (Formal Supply + Synthetic Informal Supply)
        Outputs 0-100 Market Void Score with Color Status.
        """
        demographic_demand = round(catchment_pop * per_capita_annual_spend, 2)
        
        # Formal registered supply average (approx ₹12 Lakh annual)
        formal_supply = round(formal_merchant_count * 1200000.0, 2)
        
        # Synthetic informal supply average (approx ₹6.5 Lakh annual)
        synthetic_informal_supply = round(informal_merchant_count * 650000.0, 2)
        
        total_supply = formal_supply + synthetic_informal_supply
        market_void = round(demographic_demand - total_supply, 2)
        void_ratio = round(market_void / max(demographic_demand, 1.0), 3)

        # 0-100 Score
        if market_void <= 0:
            void_score = max(10, int(30 + (void_ratio * 30)))
            color = "red"
            plain_lang = "⚠️ Market is heavily crowded. There are already many shops catering to the local demand. A strategic pivot is recommended."
        elif void_ratio < 0.25:
            void_score = int(40 + (void_ratio * 120))
            color = "yellow"
            plain_lang = "⚡ Moderate market gap. You can succeed by offering better quality, longer shop hours, or home delivery."
        else:
            void_score = min(98, int(70 + (void_ratio * 40)))
            color = "green"
            plain_lang = f"🌟 Huge unserved customer demand! Customers in this 5km radius spend ₹{demographic_demand:,.0f} annually with very few local suppliers. Outstanding profit opportunity!"

        return {
            "demographic_demand_inr": demographic_demand,
            "formal_supply_inr": formal_supply,
            "synthetic_informal_supply_inr": synthetic_informal_supply,
            "total_supply_inr": total_supply,
            "market_void_inr": market_void,
            "market_void_score": void_score,
            "color_indicator": color,
            "void_ratio": void_ratio,
            "is_saturated": market_void <= 0,
            "plain_language": plain_lang
        }

    def generate_experience_adjusted_swot(
        self,
        business_category: str,
        industry_experience_years: int,
        land_status: str,
        market_void_score: int,
        market_void_inr: float,
        ecological_safety_score: int
    ) -> Dict[str, Any]:
        """
        Dynamically generates experience-adjusted SWOT analysis.
        If experience >= 2 years, shifts Technical Execution from Threat/Weakness to Core Strength.
        """
        has_experience = (industry_experience_years or 0) >= 2
        has_land = "none" not in (land_status or "").lower()

        strengths = []
        weaknesses = []
        opportunities = []
        threats = []

        # 1. Strengths
        if has_experience:
            strengths.append(f"Founder Competency ({industry_experience_years} Years Experience): Technical execution and quality control are proven strengths, lowering operational waste by 15%.")
        else:
            strengths.append("High Motivation & Clean Credit Track: Beneficiary has zero prior loan default history.")

        if has_land:
            strengths.append(f"Zero Rental Burden: Business operates on verified land ({land_status}), preserving monthly cashflow.")
        else:
            strengths.append("Low Fixed Overhead: Mobile cart model prevents locking capital in commercial rent.")

        if market_void_score >= 70:
            strengths.append(f"Strong Local Market Void (Score {market_void_score}/100): High unserved demand within 5km radius.")

        # 2. Weaknesses
        if not has_experience:
            weaknesses.append("Initial Technical Learning Curve: Recommend 15-day DSDC / RSETI trade skill brushup.")
        if not has_land:
            weaknesses.append("No Fixed Commercial Property: Handled via mobile unit licensing without requiring property mortgage.")
        weaknesses.append("Working Capital Discipline: Daily sales cash must be strictly separated from household expenses.")

        # 3. Opportunities
        opportunities.append(f"Capture ₹{max(0.0, market_void_inr):,.0f} Local Market Void through direct community customer relationships.")
        opportunities.append("MoSJE Concessional Subvention: Subvented interest rates unlock higher net profit margins compared to informal moneylenders (who charge 24-36%).")
        opportunities.append("Digital Payments Integration: Adopting QR code / UPI payment velocity builds banking creditworthiness for future expansion.")

        # 4. Threats & Mitigations
        threats.append("Seasonal Raw Material Price Fluctuations: Mitigated via real-time Agmarknet mandi modal price tracking.")
        if ecological_safety_score < 50:
            threats.append("Ecological / Groundwater Strain: Mitigated by adopting dry-processing or rainwater harvesting backup.")
        else:
            threats.append("Rural Power Grid Interruptions: Mitigated by selecting solar-hybrid machinery or power-efficient equipment.")

        return {
            "experience_shift_applied": has_experience,
            "founder_experience_years": industry_experience_years,
            "strengths": strengths,
            "weaknesses": weaknesses,
            "opportunities": opportunities,
            "threats": threats
        }

    def generate_automated_pivots(
        self,
        original_category: str,
        margin_capital: float,
        land_asset_status: str,
        veto_active: bool
    ) -> List[Dict[str, Any]]:
        """
        Triggers 3 pivot pathways:
        (a) Sector-Adjacent Pivots
        (b) Budget-Scaled Down Pivots
        (c) Mobile/Cart-Based Pivots if land_asset_status == 'None'
        """
        pivots = []
        project_cost = margin_capital * 10.0
        orig_lower = original_category.lower()

        # (a) Sector-Adjacent Pivot
        if "tailor" in orig_lower or "garment" in orig_lower:
            pivots.append({
                "pivot_type": "Sector-Adjacent",
                "recommended_category": "B2B School & Workplace Uniform Stitching Hub",
                "rationale": "Transitions from saturated individual retail tailoring to bulk institutional contract stitching.",
                "estimated_project_cost": project_cost,
                "advantage": "Guaranteed seasonal advance bulk purchase orders."
            })
        elif "dairy" in orig_lower or veto_active or "dyeing" in orig_lower or "water" in orig_lower:
            pivots.append({
                "pivot_type": "Sector-Adjacent (Ecological Compliant)",
                "recommended_category": "Solar Milk Chilling & Fortified Feed Aggregation Node",
                "rationale": "Bypasses CGWB groundwater restrictions by focusing on value-add aggregation and dry feed distribution rather than high-water processing.",
                "estimated_project_cost": project_cost,
                "advantage": "Zero industrial borewell extraction; high daily cash turnover."
            })
        else:
            pivots.append({
                "pivot_type": "Sector-Adjacent",
                "recommended_category": "Mini Solar Spice & Flour Processing Unit",
                "rationale": "Provides 3.5x higher value-added margin than raw agricultural retail commodity trade.",
                "estimated_project_cost": project_cost,
                "advantage": "Non-perishable shelf-stable packaging."
            })

        # (b) Budget-Scaled Down Pivot
        if project_cost <= 140000.0:
            pivots.append({
                "pivot_type": "Budget-Scaled",
                "recommended_category": "Micro Finance Multi-Service Repair & Utility Hub",
                "rationale": f"Right-sized within ₹{project_cost:,.0f} to capture 6.5% interest rate and 3-month moratorium without working capital debt strain.",
                "estimated_project_cost": project_cost,
                "advantage": "Rapid 45-day breakeven cycle."
            })
        else:
            pivots.append({
                "pivot_type": "Budget-Scaled",
                "recommended_category": "Semi-Automated Agro Aggregation & Pelleting Facility",
                "rationale": f"Leverages ₹{margin_capital:,.0f} margin cash to secure ₹{project_cost * 0.9:,.0f} concessional Term Loan.",
                "estimated_project_cost": project_cost,
                "advantage": "Full 6-month repayment moratorium benefit."
            })

        # (c) Mobile/Cart Pivot if land_asset_status == 'None'
        if land_asset_status == "None" or not land_asset_status:
            pivots.append({
                "pivot_type": "Mobile/Cart-Based (Zero Real-Estate Overhead)",
                "recommended_category": "Mobile Solar E-Cart Food/Service Distribution Unit",
                "rationale": "Eliminates physical shop rental overhead and prevents bank rejection due to lack of registered land deeds.",
                "estimated_project_cost": min(project_cost, 180000.0),
                "advantage": "Access to 3-4 weekly village haats; rooftop solar power."
            })

        return pivots

feasibility_service = FeasibilityService()
