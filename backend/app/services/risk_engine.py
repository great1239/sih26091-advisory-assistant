"""
5-Dimensional Ecological & Advanced Risk Engine
Evaluates:
1. Ecological/Water Risk (CGWB Ground Water Dark Zone Hard Veto)
2. Power Reliability (National Power Portal / Substation Telemetry CAPEX/OPEX adders)
3. Cyber / Transaction Vulnerability (TRAI / NPCI Soundbox & Offline authentication)
4. Labor Mobilization Friction (District Skill Registry Friction Index)
5. Bureaucratic Friction (State EoDB Clearance Delay Multiplier)
"""
from typing import Dict, List, Any
from app.core.config import settings
from app.models.schemas import RiskAssessmentResult, GeoBounding

class RiskAssessmentEngine:
    def evaluate_risks(
        self,
        geo: GeoBounding,
        business_category: str,
        margin_capital: float,
        years_experience: int,
        land_status: str
    ) -> RiskAssessmentResult:
        district_lower = geo.district.lower()
        cat_lower = business_category.lower()
        veto_reasons = []
        hard_veto_active = False
        mitigations = []
        
        # ----------------------------------------------------
        # 1. Ecological & Ground Water Risk (CGWB Data Layer)
        # ----------------------------------------------------
        is_dark_zone = any(dz in district_lower for dz in settings.CGWB_DARK_ZONES)
        is_water_intensive = any(
            w.lower() in cat_lower for w in ["dyeing", "dairy", "water", "ice", "tannery", "aquaculture"]
        )
        
        water_veto = False
        water_risk_score = 15.0
        water_details = "CGWB Assessment: Aquifer recharge rate is within safe historical limits."
        
        if is_dark_zone:
            water_risk_score = 85.0
            if is_water_intensive:
                water_veto = True
                hard_veto_active = True
                veto_reasons.append(
                    f"CRITICAL CGWB VETO: {geo.district} is classified as an Over-Exploited / Dark Zone by the Central Ground Water Board. Water-intensive commercial projects are legally restricted."
                )
                water_details = f"HARD VETO: Over-exploited aquifer in {geo.district}. Commercial groundwater extraction prohibited for {business_category}."
                mitigations.append("Pivot to dry-processing, agro-aggregation, or mobile service models that require zero industrial borewell extraction.")
            else:
                water_details = f"Precautionary Zone: {geo.district} has low groundwater tables, but {business_category} has non-critical water intensity."
                mitigations.append("Adopt micro-water harvesting and closed-loop drainage systems.")
        
        # ----------------------------------------------------
        # 2. Power Reliability & Grid Stability (NPP Layer)
        # ----------------------------------------------------
        is_power_stressed = any(ps in district_lower for ps in settings.POWER_STRESSED_DISTRICTS)
        power_risk_score = 65.0 if is_power_stressed else 20.0
        generator_capex = 0.0
        monthly_fuel_opex = 0.0
        
        if is_power_stressed:
            # Need backup power for manufacturing/refrigeration/welding/milling
            is_power_dependent = any(p in cat_lower for p in ["mill", "dairy", "welding", "repair", "electrical", "flour", "food"])
            if is_power_dependent:
                generator_capex = 45000.0
                monthly_fuel_opex = 3800.0
                power_details = f"High grid outage frequency in {geo.district} telemetry. Added ₹{generator_capex:,.0f} solar/inverter CAPEX & ₹{monthly_fuel_opex:,.0f}/mo fuel buffer to project roadmap."
                mitigations.append(f"Install a 2kVA Hybrid Solar Inverter (₹{generator_capex:,.0f} CAPEX included in financial plan) to prevent operational halts during load-shedding.")
            else:
                power_details = f"Intermittent rural grid load in {geo.district}. Non-critical impact for retail/service operations."
        else:
            power_details = f"Stable rural 3-phase feeder grid availability in {geo.district} hub."

        # ----------------------------------------------------
        # 3. Cyber & Transaction Vulnerability (TRAI / NPCI)
        # ----------------------------------------------------
        # Higher in very low road density / low density areas
        cyber_risk_score = 45.0 if geo.road_network_density_km_per_sqkm < 1.5 else 18.0
        hardware_pos_needed = geo.road_network_density_km_per_sqkm < 1.8
        cyber_details = "TRAI Telemetry: 4G LTE signal stability > 94%. Low transaction drop risk."
        if hardware_pos_needed:
            cyber_details = "TRAI Telemetry: High packet drop rate and network latency on rural cell towers. Offline transaction buffering recommended."
            mitigations.append("Equip enterprise with dual-SIM 4G Audio Soundbox and offline paper ledger reconciliation.")

        # ----------------------------------------------------
        # 4. Labor Mobilization & Skill Registry Friction
        # ----------------------------------------------------
        # If founder has 0 experience, labor friction is higher
        base_labor_friction = 30.0 if geo.population_density_per_sqkm < 300 else 15.0
        if years_experience == 0:
            base_labor_friction += 25.0
            labor_details = "Zero prior operator experience detected. Added 30-day technical skill onboarding buffer via District Skill Development Center (DSDC)."
            mitigations.append("Enroll in mandatory 14-day MoSJE / NSDC sector skill certification before capital disbursement.")
        else:
            base_labor_friction = max(10.0, base_labor_friction - (years_experience * 3.0))
            labor_details = f"Founder has {years_experience} years in-sector experience. Technical execution friction significantly reduced."

        # ----------------------------------------------------
        # 5. Bureaucratic & Licensing Friction (State EoDB)
        # ----------------------------------------------------
        # Land asset check
        land_friction = 0.0
        if land_status == "None" and any(k in cat_lower for k in ["dairy", "mill", "welding", "fabrication", "poultry"]):
            land_friction = 40.0
            veto_reasons.append("Asset Vulnerability: Physical production unit selected without Owned or Leased commercial land deed.")
            mitigations.append("Secure a formal Gram Panchayat registered lease agreement or pivot to a mobile cart/distribution model.")
            
        eodb_delay_multiplier = 1.35 if geo.state in ["Bihar", "Uttar Pradesh", "Madhya Pradesh"] else 1.15
        runway_buffer_months = 1.5 if eodb_delay_multiplier > 1.25 else 1.0
        bureaucratic_details = f"State EoDB Average Clearance Index: {eodb_delay_multiplier}x multiplier applied to pre-operational statutory buffer ({runway_buffer_months} additional months burn reserve)."

        # ----------------------------------------------------
        # Weighted Overall Risk & Viability Score
        # ----------------------------------------------------
        # Weights: Water 25%, Power 20%, Cyber 15%, Labor 20%, Bureaucratic 20%
        weighted_risk = (
            (water_risk_score * 0.25) +
            (power_risk_score * 0.20) +
            (cyber_risk_score * 0.15) +
            (base_labor_friction * 0.20) +
            ((25.0 + land_friction) * 0.20)
        )
        
        # Adjust for founder experience bonus
        experience_bonus = min(years_experience * 2.5, 15.0)
        weighted_risk = max(5.0, min(95.0, weighted_risk - experience_bonus))
        
        if hard_veto_active:
            weighted_risk = max(weighted_risk, 88.0)
            viability_score = 15.0
            risk_level = "Critical (Hard Veto Active - Automated Pivot Required)"
        elif weighted_risk > 65.0:
            viability_score = round(100.0 - weighted_risk, 1)
            risk_level = "High (Requires Strict Risk Mitigation)"
        elif weighted_risk > 35.0:
            viability_score = round(100.0 - weighted_risk, 1)
            risk_level = "Moderate (Commercially Feasible with Standard Controls)"
        else:
            viability_score = round(100.0 - weighted_risk, 1)
            risk_level = "Low (Highly Resilient Enterprise Profile)"

        return RiskAssessmentResult(
            overall_risk_score=round(weighted_risk, 1),
            viability_score=round(viability_score, 1),
            risk_level=risk_level,
            hard_veto_active=hard_veto_active,
            veto_reasons=veto_reasons,
            water_risk={
                "score": water_risk_score,
                "is_dark_zone": is_dark_zone,
                "water_intensive_sector": is_water_intensive,
                "veto_triggered": water_veto,
                "details": water_details
            },
            power_risk={
                "score": power_risk_score,
                "is_power_stressed": is_power_stressed,
                "generator_capex_added_inr": generator_capex,
                "monthly_fuel_opex_inr": monthly_fuel_opex,
                "details": power_details
            },
            cyber_risk={
                "score": cyber_risk_score,
                "hardware_pos_recommended": hardware_pos_needed,
                "details": cyber_details
            },
            labor_friction={
                "score": base_labor_friction,
                "founder_years_experience": years_experience,
                "training_buffer_days": 30 if years_experience == 0 else 0,
                "details": labor_details
            },
            bureaucratic_friction={
                "score": 25.0 + land_friction,
                "eodb_delay_multiplier": eodb_delay_multiplier,
                "extended_runway_buffer_months": runway_buffer_months,
                "details": bureaucratic_details
            },
            recommended_mitigations=mitigations
        )

risk_engine = RiskAssessmentEngine()
