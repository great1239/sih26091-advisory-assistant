"""
Feasibility & AI Advisory Service (feasibility_service.py)
LangChain orchestration for localized Void Analysis, CGWB Ecological Veto,
Dynamic SWOT rebalancing based on founder experience, and Automated Strategic Pivots.
"""
import math
from typing import Dict, List, Any, Optional

# Simulated Central Ground Water Board (CGWB) Over-Exploited / Dark Zone Registry
CGWB_DARK_ZONES = {
    "jodhpur", "jaipur", "sangrur", "moga", "patiala", 
    "mehsana", "banaskantha", "anantapur", "chittoor",
    "osmanabad", "latur", "dindigul", "coimbatore", "salem"
}

WATER_INTENSIVE_CATEGORIES = {
    "commercial dairy", "dairy", "textile dyeing", "dyeing",
    "ice plant", "water bottling", "tannery", "intensive aquaculture"
}

class FeasibilityService:
    def __init__(self):
        self.default_radius_km = 7.5  # 5-10km trade bounding

    def get_geospatial_bounding_box(self, location_name: str, lat: float = 26.2389, lon: float = 73.0243, radius_km: float = 7.5) -> Dict[str, Any]:
        """
        Draws strict 5-10km geospatial bounding box around target rural location.
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
        Rejects water-intensive projects in CGWB Over-Exploited / Dark Zones.
        """
        loc_clean = location_str.lower()
        cat_clean = business_category.lower()

        is_dark_zone = any(dz in loc_clean for dz in CGWB_DARK_ZONES)
        is_water_intensive = any(wi in cat_clean for wi in WATER_INTENSIVE_CATEGORIES)

        if is_dark_zone and is_water_intensive:
            return {
                "veto_triggered": True,
                "reason": f"CRITICAL CGWB VETO: {location_str.title()} is in a Central Ground Water Board Over-Exploited / Dark Zone. Water extraction for '{business_category}' is legally prohibited.",
                "is_dark_zone": True,
                "is_water_intensive": True
            }
        return {
            "veto_triggered": False,
            "reason": "Ecological clearance granted. Safe groundwater aquifer capacity.",
            "is_dark_zone": is_dark_zone,
            "is_water_intensive": is_water_intensive
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
        """
        demographic_demand = round(catchment_pop * per_capita_annual_spend, 2)
        
        # Formal registered supply average (approx ₹12 Lakh annual)
        formal_supply = round(formal_merchant_count * 1200000.0, 2)
        
        # Synthetic informal supply average (approx ₹6.5 Lakh annual)
        synthetic_informal_supply = round(informal_merchant_count * 650000.0, 2)
        
        total_supply = formal_supply + synthetic_informal_supply
        market_void = round(demographic_demand - total_supply, 2)
        void_ratio = round(market_void / max(demographic_demand, 1.0), 3)

        return {
            "demographic_demand_inr": demographic_demand,
            "formal_supply_inr": formal_supply,
            "synthetic_informal_supply_inr": synthetic_informal_supply,
            "total_supply_inr": total_supply,
            "market_void_inr": market_void,
            "void_ratio": void_ratio,
            "is_saturated": market_void <= 0
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
        elif "dairy" in orig_lower or veto_active:
            pivots.append({
                "pivot_type": "Sector-Adjacent (Ecological Compliant)",
                "recommended_category": "Solar Milk Chilling & Fortified Feed Aggregation Node",
                "rationale": "Bypasses CGWB borehole restrictions by focusing on dairy aggregation and feed distribution rather than herd maintenance.",
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
        if land_asset_status == "None":
            pivots.append({
                "pivot_type": "Mobile/Cart-Based (Zero Real-Estate Overhead)",
                "recommended_category": "Mobile Solar E-Cart Food/Service Distribution Unit",
                "rationale": "Eliminates physical shop rental overhead and prevents bank rejection due to lack of registered land deeds.",
                "estimated_project_cost": min(project_cost, 180000.0),
                "advantage": "Access to 3-4 weekly village haats; rooftop solar power."
            })

        return pivots

    def build_dynamic_swot_prompt_template(
        self,
        beneficiary_name: str,
        business_category: str,
        location: str,
        industry_experience_years: int,
        social_category: str,
        land_status: str,
        market_void_inr: float
    ) -> str:
        """
        LangChain prompt template that dynamically shifts 'Technical Execution' from Threat to Strength
        if founder has industry experience, and reweights supply chain bottlenecks.
        """
        exp_instruction = (
            f"- Founder has {industry_experience_years} years of direct trade experience. "
            f"MANDATE: Shift 'Technical Execution & Quality Control' to a primary STRENGTH. "
            f"Apply a 15% competency discount to operational friction in the analysis."
            if industry_experience_years > 2 else
            "- Founder has minimal prior trade experience. Classify technical execution as a manageable Weakness with DSDC 30-day onboarding recommendation."
        )

        land_instruction = (
            "- Land Status is NONE. Flag lack of commercial collateral under Weaknesses and mandate mobile/cart pivot."
            if land_status == "None" else
            f"- Land Status is {land_status}. Leverage as bank collateral security under Strengths."
        )

        prompt = f"""
System: You are an expert Rural Enterprise Advisory Specialist operating under the Ministry of Social Justice and Empowerment (MoSJE) mandate.
Task: Generate a rigorous, hyper-localized SWOT analysis for a micro-enterprise applicant.

Applicant Profile:
- Name: {beneficiary_name}
- Social Category: {social_category} (MoSJE Concessional Subvention Eligible)
- Target Sector: {business_category}
- Location: {location}
- Industry Experience: {industry_experience_years} Years
- Land Asset Status: {land_status}
- Local Market Void: ₹{market_void_inr:,.2f}

Dynamic Rebalancing Rules:
{exp_instruction}
{land_instruction}

Formatting Instructions:
Output exactly 4 sections: STRENGTHS, WEAKNESSES, OPPORTUNITIES, THREATS.
Ensure all bullet points cite quantitative financial, demographic, or spatial feasibility metrics.
"""
        return prompt.strip()

feasibility_service = FeasibilityService()
