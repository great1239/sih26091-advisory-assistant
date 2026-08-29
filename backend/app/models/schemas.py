"""
Pydantic Schemas for MoSJE SIH26091 AI Advisory Assistant
Supports exact GPS coordinates (latitude, longitude) for 5km micro-market void analysis.
"""
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class OnboardingInput(BaseModel):
    beneficiary_name: Optional[str] = Field(default="Beneficiary", description="Applicant Name")
    latitude: float = Field(default=26.2389, description="Exact latitude of enterprise plot")
    longitude: float = Field(default=73.0243, description="Exact longitude of enterprise plot")
    geographic_location: Optional[str] = Field(default="Jodhpur, Rajasthan", description="Descriptive address or village name")
    margin_capital: float = Field(..., gt=0, description="Available 10% cash equity in INR")
    business_category: str = Field(..., description="Target business sector")
    social_category: str = Field(default="General", description="MoSJE social category for subvention calculation")
    land_asset_status: str = Field(default="Owned", description="Owned, Leased, or None")
    years_in_industry: int = Field(default=0, ge=0, description="Prior industry experience in years")
    specific_skillsets: Optional[List[str]] = Field(default=[], description="Key artisan or technical skills")
    preferred_language: Optional[str] = Field(default="English", description="Preferred Indic dialect")

class GeoBounding(BaseModel):
    query_location: str
    latitude: float
    longitude: float
    radius_km: float = 5.0
    district: str
    state: str
    population_density_per_sqkm: int
    road_network_density_km_per_sqkm: float
    primary_hub: str

class VoidAnalysisResult(BaseModel):
    baseline_demographic_demand_inr: float
    formal_supply_inr: float
    proxy_informal_supply_inr: float
    total_supply_inr: float
    market_void_inr: float
    void_index_ratio: float
    market_status: str
    formal_udyam_poi_count: int
    informal_merchant_nodes: int
    total_active_competitors: int
    competitor_density_per_sqkm: float
    monthly_upi_tx_velocity: int
    commercial_power_load_kw: float
    raw_insights: List[str]
    satellite_scouted_informal_nodes: Optional[int] = Field(default=0)
    satellite_radiance_index: Optional[float] = Field(default=14.2)
    shrug_village_id: Optional[str] = Field(default="shrid-11-24-001942")
    shrug_village_name: Optional[str] = Field(default="Rural Gram Cluster")
    pmgsy_road_quality: Optional[str] = Field(default="All-Weather Paved Road")
    feeder_power_outage_hrs_day: Optional[float] = Field(default=2.4)
    solar_backup_recommended: Optional[bool] = Field(default=False)
    scouted_competitor_pins: Optional[List[Dict[str, Any]]] = Field(default=[])

class RiskAssessmentResult(BaseModel):
    overall_risk_score: float = Field(default=35.0)
    composite_risk_score: float = Field(default=35.0)
    viability_score: float = Field(default=65.0)
    overall_feasibility_tier: str = Field(default="High Opportunity (Commercially Feasible)")
    risk_level: str = Field(default="Moderate")
    hard_veto_active: bool = Field(default=False)
    veto_reasons: List[str] = Field(default=[])
    water_risk: Dict[str, Any] = Field(default={})
    power_risk: Dict[str, Any] = Field(default={})
    cyber_risk: Optional[Dict[str, Any]] = Field(default={})
    connectivity_risk: Optional[Dict[str, Any]] = Field(default={})
    labor_friction: Optional[Dict[str, Any]] = Field(default={})
    labor_risk: Optional[Dict[str, Any]] = Field(default={})
    bureaucratic_friction: Optional[Dict[str, Any]] = Field(default={})
    eodb_risk: Optional[Dict[str, Any]] = Field(default={})
    recommended_mitigations: List[str] = Field(default=[])
    risk_summary_notes: List[str] = Field(default=[])

    def model_post_init(self, __context: Any) -> None:
        if not self.composite_risk_score and self.overall_risk_score:
            self.composite_risk_score = self.overall_risk_score
        if not self.overall_risk_score and self.composite_risk_score:
            self.overall_risk_score = self.composite_risk_score
        if not self.overall_feasibility_tier and self.risk_level:
            self.overall_feasibility_tier = self.risk_level
        if not self.connectivity_risk and self.cyber_risk:
            self.connectivity_risk = self.cyber_risk
        if not self.cyber_risk and self.connectivity_risk:
            self.cyber_risk = self.connectivity_risk
        if not self.labor_risk and self.labor_friction:
            self.labor_risk = self.labor_friction
        if not self.eodb_risk and self.bureaucratic_friction:
            self.eodb_risk = self.bureaucratic_friction

class AmortizationScheduleItem(BaseModel):
    period_number: int
    period_label: str
    is_moratorium: bool
    beginning_principal: float
    interest_due: float
    principal_repaid: float
    total_emi: float
    ending_principal: float
    projected_revenue: float
    operating_expenses: float
    net_operating_cashflow: float

class FinancialStructuringResult(BaseModel):
    available_margin_capital: float
    total_project_cost: float
    concessional_loan_eligibility: float
    scheme_tier: str
    base_interest_rate: float
    demographic_subvention_discount: float
    final_subvented_interest_rate: float
    repayment_tenure_months: int
    moratorium_months: int
    monthly_emi_post_moratorium: float
    quarterly_emi_post_moratorium: float
    total_interest_payable: float
    subvention_savings_inr: float
    competency_discount_percent: float
    annual_competency_savings_inr: float
    break_even_month: int
    required_runway_buffer_inr: float
    amortization_schedule: List[AmortizationScheduleItem]

class SWOTMatrix(BaseModel):
    strengths: List[str] = Field(default=[])
    weaknesses: List[str] = Field(default=[])
    opportunities: List[str] = Field(default=[])
    threats: List[str] = Field(default=[])
    Strengths: Optional[List[str]] = Field(default=None)
    Weaknesses: Optional[List[str]] = Field(default=None)
    Opportunities: Optional[List[str]] = Field(default=None)
    Threats: Optional[List[str]] = Field(default=None)

    def model_post_init(self, __context: Any) -> None:
        if self.Strengths and not self.strengths:
            self.strengths = self.Strengths
        if self.strengths and not self.Strengths:
            self.Strengths = self.strengths
        if self.Weaknesses and not self.weaknesses:
            self.weaknesses = self.Weaknesses
        if self.weaknesses and not self.Weaknesses:
            self.Weaknesses = self.weaknesses
        if self.Opportunities and not self.opportunities:
            self.opportunities = self.Opportunities
        if self.opportunities and not self.Opportunities:
            self.Opportunities = self.opportunities
        if self.Threats and not self.threats:
            self.threats = self.Threats
        if self.threats and not self.Threats:
            self.Threats = self.threats

class PivotRecommendation(BaseModel):
    pivot_id: str = Field(default="pvt-01")
    pivot_type: str = Field(default="Sector-Adjacent")
    title: str = Field(default="Strategic Enterprise Pivot")
    pivot_title: Optional[str] = Field(default=None)
    category: Optional[str] = Field(default=None)
    recommended_category: str = Field(default="Alternative Sector Hub")
    rationale: str = Field(default="Mitigates market saturation and ecological constraints.")
    estimated_project_cost: float = Field(default=140000.0)
    required_margin: float = Field(default=14000.0)
    expected_viability_score: float = Field(default=85.0)
    capex_saving_percent: float = Field(default=15.0)
    risk_reduction_points: float = Field(default=20.0)
    estimated_roi_months: int = Field(default=6)
    is_recommended: bool = Field(default=True)
    key_advantages: List[str] = Field(default=[])

    def model_post_init(self, __context: Any) -> None:
        if not self.pivot_title and self.title:
            self.pivot_title = self.title
        if not self.title and self.pivot_title:
            self.title = self.pivot_title
        if not self.category and self.recommended_category:
            self.category = self.recommended_category
        if not self.recommended_category and self.category:
            self.recommended_category = self.category

PivotOption = PivotRecommendation

class MoratoriumNudge(BaseModel):
    nudge_id: str
    day_milestone: int
    period_title: str
    hindi_message: str
    english_message: str
    criticality: str
    checklist: List[str]

class AssessmentResponse(BaseModel):
    status: str
    beneficiary_name: str
    social_category: str
    geographic_location: str
    business_category: str
    geo_bounding: GeoBounding
    void_analysis: VoidAnalysisResult
    risk_assessment: RiskAssessmentResult
    financial_structuring: FinancialStructuringResult
    swot_analysis: SWOTMatrix
    pivot_recommendations: List[PivotOption]
    moratorium_milestones: List[MoratoriumNudge]
    dpr_report_available: bool
    summary_audio_text: str

class SavingsTrackerInput(BaseModel):
    target_project_cost: float
    current_savings: float
    weekly_savings_capacity: float

class SavingsMilestone(BaseModel):
    percentage: int
    target_amount_inr: float
    is_achieved: bool
    badge_name: str

class SavingsTrackerResponse(BaseModel):
    target_project_cost: float
    required_margin_capital: float
    current_savings: float
    savings_gap_inr: float
    weeks_to_goal: int
    months_to_goal: float
    milestones: List[SavingsMilestone]
    gamified_badge: str

class KioskTapInput(BaseModel):
    rfid_card_uid: str

class KioskTapResponse(BaseModel):
    beneficiary_name: str
    social_category: str
    registered_district: str
    margin_capital: float
    preferred_category: str
    years_experience: int
    thermal_receipt_payload: str
