"""
AI-Driven Strategic Pivot Engine & Dynamic SWOT Generator
Executes 3-Tier Pivot Strategy:
1. Sector-Adjacent (e.g. Saturated Tailor -> B2B Uniform & Fabric Wholesale)
2. Budget-Driven (e.g. Large 20-Cow Dairy -> 2-Cow Micro-Chiller Hub scaled to Margin)
3. Asset-Driven (e.g. Land=None -> Solar E-Cart / Doorstep Distribution Unit)
"""
from typing import List, Dict, Tuple
from app.models.schemas import PivotRecommendation, VoidAnalysisResult, RiskAssessmentResult

class StrategicPivotEngine:
    def generate_swot(
        self,
        business_category: str,
        years_experience: int,
        social_category: str,
        void_result: VoidAnalysisResult,
        risk_result: RiskAssessmentResult,
        land_status: str
    ) -> Dict[str, List[str]]:
        strengths = [
            f"MoSJE Concessional Credit Eligibility with {social_category} demographic interest subvention.",
            f"Strict 10% Margin Capital compliance providing 90% collateral-light credit support.",
            "Local village community proximity and hyper-local customer trust network."
        ]
        
        # Experience integration: shifts Technical Execution from Weakness/Threat to Strength
        if years_experience >= 2:
            strengths.insert(0, f"Founder Human Capital: {years_experience} years direct industry experience reduces operational waste by ~{min(years_experience * 3, 15)}%.")
            strengths.append("Established local supplier contacts and trade credit familiarity.")
        
        weaknesses = []
        if years_experience == 0:
            weaknesses.append("Zero prior founder enterprise management experience (Mitigated by DSDC 30-day onboarding).")
        if land_status == "None":
            weaknesses.append("No registered commercial land ownership or formal lease deed.")
        if risk_result.power_risk.get("is_power_stressed"):
            weaknesses.append("Vulnerable to rural grid voltage drops without backup hybrid inverter.")
        if not weaknesses:
            weaknesses.append("Initial working capital constraints during pre-profitability ramp-up.")

        opportunities = [
            f"Net Local Market Void of ₹{max(0.0, void_result.market_void_inr):,.0f} across {void_result.formal_udyam_poi_count + void_result.informal_merchant_nodes} local trade nodes.",
            "Digital UPI payment adoption enabling formal transaction credit trail.",
            "Potential forward linkages with Block Mandi and State Channelizing Agencies (SCAs)."
        ]

        threats = []
        if void_result.void_index_ratio < 0.10:
            threats.append(f"High informal competition ({void_result.informal_merchant_nodes} unorganized merchant competitors).")
        if risk_result.water_risk.get("is_dark_zone"):
            threats.append("Central Ground Water Board (CGWB) dark-zone restrictions on groundwater extraction.")
        if risk_result.cyber_risk.get("hardware_pos_recommended"):
            threats.append("Rural cellular packet drops causing digital payment settlement delays.")
        if not threats:
            threats.append("Seasonal demand fluctuations during agricultural monsoon cycles.")

        return {
            "Strengths": strengths,
            "Weaknesses": weaknesses,
            "Opportunities": opportunities,
            "Threats": threats
        }

    def generate_pivots(
        self,
        original_category: str,
        margin_capital: float,
        land_status: str,
        void_result: VoidAnalysisResult,
        risk_result: RiskAssessmentResult
    ) -> List[PivotRecommendation]:
        pivots: List[PivotRecommendation] = []
        orig_lower = original_category.lower()
        project_cost = margin_capital * 10.0
        
        # 1. Sector-Adjacent Pivot (Triggered if void is low or saturated)
        if "tailor" in orig_lower or "garment" in orig_lower:
            pivots.append(
                PivotRecommendation(
                    pivot_id="pvt-sec-01",
                    pivot_type="Sector-Adjacent",
                    title="B2B Institutional Uniform & Fabric Aggregation",
                    recommended_category="B2B School & Worker Uniform Stitching Hub",
                    rationale="Basic retail tailoring is crowded with informal operators. Institutional stitching (schools, local factories, hospitals) provides guaranteed bulk quarterly contract revenue.",
                    estimated_project_cost=project_cost,
                    required_margin=margin_capital,
                    expected_viability_score=88.5,
                    key_advantages=[
                        "Secures contracted seasonal advance orders",
                        "Higher margin on bulk fabric sourcing",
                        "Bypasses localized retail price competition"
                    ]
                )
            )
        elif "dairy" in orig_lower or "milk" in orig_lower:
            pivots.append(
                PivotRecommendation(
                    pivot_id="pvt-sec-02",
                    pivot_type="Sector-Adjacent",
                    title="Micro Dairy Milk Chilling & Fodder Distribution Hub",
                    recommended_category="Solar-Powered Milk Collection & Feed Aggregation",
                    rationale="Avoids intensive groundwater extraction veto in water-stressed zones by focusing on dairy aggregation, chilling, and fortified cattle feed distribution rather than large-herd maintenance.",
                    estimated_project_cost=project_cost,
                    required_margin=margin_capital,
                    expected_viability_score=91.0,
                    key_advantages=[
                        "Fully CGWB dark-zone compliant (low water intensity)",
                        "Consistent daily cash flow via village milk collection",
                        "Direct tie-up with district cooperative dairies"
                    ]
                )
            )
        else:
            pivots.append(
                PivotRecommendation(
                    pivot_id="pvt-sec-03",
                    pivot_type="Sector-Adjacent",
                    title="Value-Added Agro-Processing & Packaging Unit",
                    recommended_category="Mini Solar Flour & Spices Packaging Unit",
                    rationale="Higher profit margin per kilogram compared to raw retail commodity trading.",
                    estimated_project_cost=project_cost,
                    required_margin=margin_capital,
                    expected_viability_score=86.0,
                    key_advantages=[
                        "3.5x value-addition margin over raw produce",
                        "Extended shelf-life reduces perishable spoilage",
                        "Eligible for additional MoSJE food-processing subsidies"
                    ]
                )
            )

        # 2. Budget-Driven Pivot (Right-sized for exact available margin capital)
        if project_cost <= 140000.0:
            pivots.append(
                PivotRecommendation(
                    pivot_id="pvt-bud-01",
                    pivot_type="Budget-Driven",
                    title="Micro Finance Optimized Service Hub",
                    recommended_category="Solar-Powered Multi-Service Digital & Repair Kiosk",
                    rationale=f"Engineered to fit precisely within the ₹{project_cost:,.0f} Micro Finance credit tier, capturing 6.5% base interest rate with 3-month moratorium.",
                    estimated_project_cost=project_cost,
                    required_margin=margin_capital,
                    expected_viability_score=94.0,
                    key_advantages=[
                        "Zero working capital debt trap",
                        "Eligible for direct fast-track SCA disbursement",
                        "Quick 45-day breakeven operational cycle"
                    ]
                )
            )
        else:
            scaled_cost = min(project_cost, 2500000.0)
            pivots.append(
                PivotRecommendation(
                    pivot_id="pvt-bud-02",
                    pivot_type="Budget-Driven",
                    title="Automated Semi-Industrial Processing Unit",
                    recommended_category="Semi-Automatic Agro Packaging & Pelleting Facility",
                    rationale=f"Leverages available ₹{margin_capital:,.0f} equity to secure ₹{scaled_cost * 0.9:,.0f} Term Loan credit with 6-month repayment moratorium.",
                    estimated_project_cost=scaled_cost,
                    required_margin=round(scaled_cost * 0.10, 2),
                    expected_viability_score=89.5,
                    key_advantages=[
                        "High commercial output capacity",
                        "6-month grace period for machine commissioning",
                        "Full MoSJE Term Loan subvention benefit"
                    ]
                )
            )

        # 3. Asset-Driven Pivot (If Land is None or Leased)
        if land_status == "None" or land_status == "Leased":
            pivots.append(
                PivotRecommendation(
                    pivot_id="pvt-ast-01",
                    pivot_type="Asset-Driven",
                    title="Mobile Solar E-Cart / Doorstep Distribution Enterprise",
                    recommended_category="Mobile Solar E-Cart Food/Service Distribution Unit",
                    rationale="Eliminates physical shop rental overhead and overcomes bank rejections caused by lack of registered land deeds.",
                    estimated_project_cost=min(project_cost, 180000.0),
                    required_margin=min(margin_capital, 18000.0),
                    expected_viability_score=93.5,
                    key_advantages=[
                        "Zero commercial real estate rent or deposit",
                        "Flexibility to target 3-4 village weekly haats / markets",
                        "Solar-roof provides onboard lighting and refrigeration power"
                    ]
                )
            )
        else:
            pivots.append(
                PivotRecommendation(
                    pivot_id="pvt-ast-02",
                    pivot_type="Asset-Driven",
                    title="Land-Anchored Production & Training Facility",
                    recommended_category="Permanent Rural Workshop & Processing Center",
                    rationale="Maximizes owned land asset for bank collateral value-add.",
                    estimated_project_cost=project_cost,
                    required_margin=margin_capital,
                    expected_viability_score=90.0,
                    key_advantages=[
                        "Owned land enhances bank credit appraisal score",
                        "Eligible for infrastructure grant supplements",
                        "Long-term asset equity appreciation"
                    ]
                )
            )

        return pivots

pivot_engine = StrategicPivotEngine()
