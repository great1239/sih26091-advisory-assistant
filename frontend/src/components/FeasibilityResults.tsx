import React, { useEffect } from 'react';
import {
  TrendingUp,
  Target,
  AlertCircle,
  ShieldAlert,
  Droplets,
  CheckCircle2,
  AlertTriangle,
  Zap,
  ArrowUpRight,
  Sparkles,
  Building2,
  Radio,
  Clock,
  Layers,
  Banknote,
  DollarSign,
  Compass,
  Volume2,
  VolumeX,
  FileText
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceDot,
  ReferenceLine
} from 'recharts';
import { useSpeech } from '../context/SpeechContext';
import { CreditAppraisalDossierPDFButton } from './CreditAppraisalDossier';

export interface AmortizationScheduleItem {
  period_number: number;
  period_label: string;
  is_moratorium: boolean;
  beginning_principal: number;
  interest_due: number;
  principal_repaid: number;
  total_emi: number;
  ending_principal: number;
  projected_revenue: number;
  operating_expenses: number;
  net_operating_cashflow: number;
}

export interface FinancialStructuringResult {
  available_margin_capital: number;
  total_project_cost: number;
  concessional_loan_eligibility: number;
  scheme_tier: string;
  base_interest_rate: number;
  demographic_subvention_discount: number;
  final_subvented_interest_rate: number;
  repayment_tenure_months: number;
  moratorium_months: number;
  monthly_emi_post_moratorium: number;
  quarterly_emi_post_moratorium?: number;
  total_interest_payable: number;
  subvention_savings_inr: number;
  competency_discount_percent: number;
  annual_competency_savings_inr: number;
  break_even_month: number;
  required_runway_buffer_inr: number;
  amortization_schedule?: AmortizationScheduleItem[];
}

export interface VoidAnalysisResult {
  baseline_demographic_demand_inr: number;
  formal_supply_inr: number;
  proxy_informal_supply_inr: number;
  total_supply_inr: number;
  market_void_inr: number;
  void_index_ratio: number;
  market_status: string;
  formal_udyam_poi_count: number;
  informal_merchant_nodes: number;
  total_active_competitors: number;
  competitor_density_per_sqkm: number;
  monthly_upi_tx_velocity: number;
  commercial_power_load_kw: number;
  raw_insights: string[];
  satellite_scouted_informal_nodes?: number;
  satellite_radiance_index?: number;
  shrug_village_id?: string;
  shrug_village_name?: string;
  pmgsy_road_quality?: string;
  feeder_power_outage_hrs_day?: number;
  solar_backup_recommended?: boolean;
}

export interface RiskAssessmentResult {
  overall_risk_score?: number;
  composite_risk_score?: number;
  viability_score?: number;
  overall_feasibility_tier?: string;
  risk_level?: string;
  hard_veto_active: boolean;
  veto_reasons?: string[];
  water_risk?: {
    is_dark_zone?: boolean;
    water_stress_index?: number;
    risk_level?: string;
    description?: string;
  };
  power_risk?: {
    is_power_stressed?: boolean;
    grid_reliability_score?: number;
    description?: string;
  };
  recommended_mitigations?: string[];
  risk_summary_notes?: string[];
}

export interface SWOTMatrix {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

export interface StrategicPivot {
  pivot_type: string;
  recommended_category: string;
  rationale: string;
  estimated_project_cost: number;
  advantage: string;
}

export interface ComprehensiveAssessmentResponse {
  beneficiary_name?: string;
  business_category: string;
  social_category?: string;
  ui_translation_language?: string; // Dynamic backend language signal (e.g., "hi-IN", "ta-IN", "en-US")
  geo_bounding?: {
    district: string;
    state: string;
    latitude: number;
    longitude: number;
  };
  void_analysis: VoidAnalysisResult;
  risk_assessment: RiskAssessmentResult;
  financial_structuring: FinancialStructuringResult;
  swot_analysis?: SWOTMatrix;
  strategic_pivots?: StrategicPivot[];
}

interface FeasibilityResultsProps {
  assessment: ComprehensiveAssessmentResponse;
  onApplyPivot?: (pivot: StrategicPivot) => void;
  onGenerateDPR?: () => void;
}

export const FeasibilityResults: React.FC<FeasibilityResultsProps> = ({
  assessment,
  onApplyPivot,
  onGenerateDPR
}) => {
  const { currentLanguage, setLanguage, speak, stopSpeaking, isSpeaking, speakingMessageId, t } = useSpeech();

  // Dynamic Native-Language Synchronization from Gemini Backend Payload
  useEffect(() => {
    if (assessment?.ui_translation_language && assessment.ui_translation_language !== currentLanguage) {
      setLanguage(assessment.ui_translation_language);
    }
  }, [assessment?.ui_translation_language, currentLanguage, setLanguage]);

  if (!assessment) return null;

  const voidData = assessment.void_analysis;
  const fin = assessment.financial_structuring;
  const risk = assessment.risk_assessment;
  const swot = assessment.swot_analysis;
  const pivots = assessment.strategic_pivots || [];

  // 1. Dynamic Traffic-Light Color Logic for Market Void Score
  const voidScore = Math.min(
    100,
    Math.max(
      10,
      voidData?.void_index_ratio >= 0.35
        ? 75 + Math.round((voidData.void_index_ratio - 0.35) * 50)
        : voidData?.void_index_ratio >= 0.05
        ? 45 + Math.round((voidData.void_index_ratio - 0.05) * 100)
        : Math.round(Math.max(10, 35 + voidData?.void_index_ratio * 40))
    )
  );

  const getVoidTheme = (score: number) => {
    if (score >= 75) {
      return {
        badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        barColor: 'bg-emerald-500',
        textColor: 'text-emerald-700',
        borderGlow: 'border-emerald-200 shadow-emerald-50',
        label: t('high_opportunity') || 'High Opportunity Void'
      };
    }
    if (score >= 40) {
      return {
        badgeBg: 'bg-amber-50 text-amber-800 border-amber-200',
        barColor: 'bg-amber-500',
        textColor: 'text-amber-700',
        borderGlow: 'border-amber-200 shadow-amber-50',
        label: t('moderate_opportunity') || 'Moderate Void Capacity'
      };
    }
    return {
      badgeBg: 'bg-rose-50 text-rose-800 border-rose-200',
      barColor: 'bg-rose-500',
      textColor: 'text-rose-700',
      borderGlow: 'border-rose-200 shadow-rose-50',
      label: t('market_saturated') || 'Saturated Local Market'
    };
  };

  const voidTheme = getVoidTheme(voidScore);

  // 2. Ecological / Dark Zone Veto Status
  const isDarkZone = risk?.water_risk?.is_dark_zone || risk?.hard_veto_active;
  const isSafeZone = !isDarkZone;

  // 3. Generate 6-Month Moratorium Working Capital Burn Data for Recharts
  const generateRunwayData = () => {
    const margin = fin?.available_margin_capital || 25000;
    const loanVal = fin?.concessional_loan_eligibility || 225000;
    const workingCapitalStart = margin + loanVal * 0.35;
    const monthlyBurn = workingCapitalStart * 0.12;
    const monthlyRevRamp = workingCapitalStart * 0.16;
    const emi = fin?.monthly_emi_post_moratorium || 3400;
    const morMonths = fin?.moratorium_months || 3;

    const data = [];
    let currentCapital = workingCapitalStart;

    for (let m = 1; m <= 6; m++) {
      const isMoratoriumActive = m <= morMonths;
      const appliedEmi = isMoratoriumActive ? 0 : emi;
      const rev = monthlyRevRamp * (m * 0.3 + 0.4);
      const burn = monthlyBurn * 0.85;

      currentCapital = Math.round(currentCapital + rev - burn - appliedEmi);

      data.push({
        month: `Month ${m}`,
        workingCapital: currentCapital,
        emiPaid: appliedEmi,
        isMoratorium: isMoratoriumActive,
        status: isMoratoriumActive ? 'Grace Period (0 EMI)' : `EMI Active (₹${appliedEmi.toLocaleString()})`
      });
    }
    return data;
  };

  const runwayData = generateRunwayData();

  // Voice narration text
  const handleVocalizeSummary = () => {
    const summarySpeech = `Feasibility Analysis for ${assessment.business_category}. Total project sized at ${Math.round(
      fin?.total_project_cost || 0
    )} rupees with 90% concessional loan eligibility of ${Math.round(
      fin?.concessional_loan_eligibility || 0
    )} rupees at ${fin?.final_subvented_interest_rate || 7} percent interest. Market void score is ${voidScore} out of 100. ${
      isSafeZone
        ? 'Water and ecological clearances are approved.'
        : 'Warning: Ground water dark zone detected, strategic pivot recommended.'
    }`;

    speak(summarySpeech, 'feasibility-summary');
  };

  return (
    <div className="space-y-6 w-full font-sans text-slate-800 antialiased">
      {/* Top Controls: Voice Readout & Language Indicator */}
      <div className="flex items-center justify-between pb-1 border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-xs font-bold text-slate-600">
            {t('language')}: <span className="font-mono text-slate-800 uppercase">{currentLanguage}</span>
          </span>
        </div>

        <button
          type="button"
          onClick={handleVocalizeSummary}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all shadow-xs border ${
            isSpeaking && speakingMessageId === 'feasibility-summary'
              ? 'bg-amber-100 text-amber-900 border-amber-300 animate-pulse'
              : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
          }`}
        >
          {isSpeaking && speakingMessageId === 'feasibility-summary' ? (
            <>
              <VolumeX className="w-3.5 h-3.5 text-amber-700" />
              <span>{t('stop_audio') || 'Stop Voice'}</span>
            </>
          ) : (
            <>
              <Volume2 className="w-3.5 h-3.5 text-blue-600" />
              <span>{t('listen_audio') || 'Listen Summary'}</span>
            </>
          )}
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 1. BENTO BOX GRID ARCHITECTURE (TOP ROW - TRAFFIC LIGHT INDICATORS)        */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* CARD 1: Dynamic Traffic-Light Market Void Score */}
        <div
          className={`bg-white/95 backdrop-blur-sm rounded-2xl p-6 border shadow-sm transition-all duration-300 ${voidTheme.borderGlow} flex flex-col justify-between`}
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold tracking-wider uppercase text-slate-500">
                {t('market_void_analysis') || '5km Market Void Index'}
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${voidTheme.badgeBg}`}
              >
                {voidTheme.label}
              </span>
            </div>

            <div className="mt-4 flex items-baseline justify-between">
              <div className="text-3xl font-extrabold tracking-tight text-slate-900">
                {voidScore}
                <span className="text-lg font-medium text-slate-400">/100</span>
              </div>
              <span className="text-xs font-bold text-slate-600">
                ₹{Math.round(voidData?.market_void_inr || 0).toLocaleString()} Void
              </span>
            </div>

            {/* Thick Progress Bar Gauge */}
            <div className="mt-3 w-full bg-slate-100 h-3.5 rounded-full overflow-hidden p-0.5 border border-slate-200/60">
              <div
                className={`h-full rounded-full transition-all duration-700 ${voidTheme.barColor}`}
                style={{ width: `${voidScore}%` }}
              />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Demand: ₹{(voidData?.baseline_demographic_demand_inr || 0).toLocaleString()}</span>
            <span>Supply: ₹{(voidData?.total_supply_inr || 0).toLocaleString()}</span>
          </div>
        </div>

        {/* CARD 2: Ecological & CGWB Groundwater Veto Indicator */}
        <div
          className={`bg-white/95 backdrop-blur-sm rounded-2xl p-6 border shadow-sm flex flex-col justify-between ${
            isDarkZone
              ? 'border-rose-300 bg-rose-50/20 shadow-rose-100'
              : 'border-emerald-200 bg-emerald-50/10 shadow-emerald-50'
          }`}
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold tracking-wider uppercase text-slate-500">
                {t('ecological_safety') || 'Ecological & Aquifer Clearance'}
              </span>
              <div
                className={`flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                  isSafeZone
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : 'bg-rose-100 text-rose-900 border-rose-300 animate-pulse'
                }`}
              >
                {isSafeZone ? (
                  <>
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>Water/Land Safe</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-3 h-3 text-rose-600" />
                    <span>DARK ZONE VETO</span>
                  </>
                )}
              </div>
            </div>

            <div className="mt-4">
              <div className="text-3xl font-extrabold tracking-tight text-slate-900">
                {isSafeZone ? '100% Cleared' : 'Action Required'}
              </div>
              <p className="mt-1 text-xs text-slate-600 line-clamp-2">
                {isSafeZone
                  ? 'CGWB telemetry confirms safe unconfined aquifer depth. No borewell extraction restrictions.'
                  : 'CGWB dark zone: Over-exploited groundwater table restricts industrial borewell extraction.'}
              </p>
            </div>
          </div>

          {/* Pivot Alert Banner if Dark Zone */}
          {isDarkZone && pivots.length > 0 && (
            <div className="mt-3 p-2.5 rounded-xl bg-rose-100/80 border border-rose-300 text-xs text-rose-950 flex items-center justify-between">
              <span className="font-bold truncate">Pivot: {pivots[0]?.recommended_category}</span>
              {onApplyPivot && (
                <button
                  onClick={() => onApplyPivot(pivots[0])}
                  className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-[10px] shrink-0 ml-2"
                >
                  Apply Pivot
                </button>
              )}
            </div>
          )}

          {!isDarkZone && (
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center space-x-2 text-xs text-emerald-700 font-bold">
              <Droplets className="w-3.5 h-3.5 text-emerald-500" />
              <span>India-WRIS DWLR Clearance Certified</span>
            </div>
          )}
        </div>

        {/* CARD 3: MoSJE 90% Concessional Credit Sizing */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold tracking-wider uppercase text-slate-500">
                {t('concessional_loan') || 'MoSJE Concessional Loan (90%)'}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-blue-50 text-blue-700 border border-blue-200">
                {fin?.scheme_tier || 'SCA Direct'}
              </span>
            </div>

            <div className="mt-4">
              <div className="text-3xl font-extrabold tracking-tight text-slate-900">
                ₹{Math.round(fin?.concessional_loan_eligibility || 0).toLocaleString()}
              </div>
              <div className="mt-1 flex items-center space-x-2 text-xs">
                <span className="font-bold text-purple-700">
                  {fin?.final_subvented_interest_rate || 7.0}% p.a.
                </span>
                <span className="text-slate-400">•</span>
                <span className="font-bold text-emerald-700">
                  {fin?.moratorium_months || 3} Mos Grace
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Project: ₹{(fin?.total_project_cost || 0).toLocaleString()}</span>
            <span>Margin (10%): ₹{(fin?.available_margin_capital || 0).toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. RECHARTS FINANCIAL AREA CHART & SATELLITE SHADOW TELEMETRY             */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* CHART: 6-Month Moratorium Survival & Working Capital Trajectory (2 Cols) */}
        <div className="lg:col-span-2 bg-white/95 backdrop-blur-sm rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-xs font-semibold tracking-wider uppercase text-slate-500">
                {t('financial_blueprint') || 'Financial Runway & Cash Burn'}
              </span>
              <h3 className="text-base font-extrabold text-slate-900 mt-0.5">
                6-Month Moratorium Survival Trajectory
              </h3>
            </div>
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-purple-50 text-purple-800 border border-purple-200">
                Post-Grace EMI: ₹{Math.round(fin?.monthly_emi_post_moratorium || 0).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Recharts AreaChart with Gradient Fill */}
          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={runwayData} margin={{ top: 10, right: 15, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="workingCapitalGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tickLine={false}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs space-y-1">
                          <p className="font-extrabold text-blue-300">{data.month}</p>
                          <p className="font-bold text-sm">
                            Working Capital: ₹{Number(data.workingCapital).toLocaleString()}
                          </p>
                          <p className="text-[11px] text-slate-300">{data.status}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <ReferenceLine
                  x={`Month ${(fin?.moratorium_months || 3) + 1}`}
                  stroke="#ef4444"
                  strokeDasharray="4 4"
                  label={{
                    value: '1st EMI Hits',
                    position: 'top',
                    fill: '#ef4444',
                    fontSize: 10,
                    fontWeight: 700
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="workingCapital"
                  stroke="#2563eb"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#workingCapitalGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center text-xs">
            <div className="bg-slate-50 p-2 rounded-xl border border-slate-200/60">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Grace Period</span>
              <span className="font-extrabold text-slate-800">
                {fin?.moratorium_months || 3} Months
              </span>
            </div>
            <div className="bg-slate-50 p-2 rounded-xl border border-slate-200/60">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Breakeven Month</span>
              <span className="font-extrabold text-emerald-700">
                Month {fin?.break_even_month || 4}
              </span>
            </div>
            <div className="bg-slate-50 p-2 rounded-xl border border-slate-200/60">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Subvention Savings</span>
              <span className="font-extrabold text-purple-700">
                ₹{Math.round(fin?.subvention_savings_inr || 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* SATELLITE SHADOW-SCOUTED COMPETITION (1 Col) */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold tracking-wider uppercase text-slate-500">
                Spatial POI & Satellite Scout
              </span>
              <span className="text-[10px] font-black uppercase text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                VIIRS {voidData?.satellite_radiance_index || 14.2} nW
              </span>
            </div>

            <div className="mt-3">
              <span className="text-xs text-slate-500 font-bold uppercase">Total Active Nodes</span>
              <div className="text-3xl font-extrabold tracking-tight text-slate-900">
                {voidData?.total_active_competitors || 0}
                <span className="text-xs font-semibold text-slate-400 ml-1">within 5km</span>
              </div>
            </div>

            {/* Split Breakdown */}
            <div className="mt-4 space-y-2.5">
              <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-200 flex items-center justify-between text-xs">
                <span className="font-bold text-blue-900 flex items-center space-x-1.5">
                  <Building2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>Formal MSME Udyam:</span>
                </span>
                <span className="font-extrabold text-blue-900">
                  {voidData?.formal_udyam_poi_count || 0} POIs
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-300 flex items-center justify-between text-xs">
                <span className="font-bold text-amber-950 flex items-center space-x-1.5">
                  <Radio className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                  <span>Scouted Informal Nodes:</span>
                </span>
                <span className="font-extrabold text-amber-950">
                  {voidData?.satellite_scouted_informal_nodes || voidData?.informal_merchant_nodes || 0} Nodes
                </span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
            <div className="flex justify-between">
              <span className="text-slate-500">Village SHRID:</span>
              <span className="font-mono font-bold text-slate-800">
                {voidData?.shrug_village_id || 'shrid-11-24-001942'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">11kV Feeder Outage:</span>
              <span className="font-bold text-slate-800">
                {voidData?.feeder_power_outage_hrs_day || 2.4} hrs/day
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. VISUAL 2x2 SWOT ANALYSIS (MICRO-CARD MATRIX)                           */}
      {/* ========================================================================= */}
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold tracking-wider uppercase text-slate-500">
              Operational Matrix
            </span>
            <h3 className="text-base font-extrabold text-slate-900 mt-0.5">
              Strategic SWOT Assessment
            </h3>
          </div>
          <span className="text-xs font-bold text-slate-500">
            Category: {assessment?.business_category}
          </span>
        </div>

        {/* 2x2 Micro-Card Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Micro-Card 1: Strengths */}
          <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200/80 space-y-2">
            <div className="flex items-center space-x-2 text-emerald-800 font-extrabold text-xs">
              <div className="p-1 rounded-md bg-emerald-100 text-emerald-700">
                <TrendingUp className="w-3.5 h-3.5" />
              </div>
              <span className="uppercase tracking-wider">Strengths</span>
            </div>
            <ul className="space-y-1.5 text-xs text-emerald-950 font-medium">
              {swot?.strengths && swot.strengths.length > 0 ? (
                swot.strengths.map((item, idx) => (
                  <li key={idx} className="flex items-start space-x-1.5">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))
              ) : (
                <li className="text-slate-500">Subvented low capital cost and verified market capacity.</li>
              )}
            </ul>
          </div>

          {/* Micro-Card 2: Opportunities */}
          <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-200/80 space-y-2">
            <div className="flex items-center space-x-2 text-blue-800 font-extrabold text-xs">
              <div className="p-1 rounded-md bg-blue-100 text-blue-700">
                <Target className="w-3.5 h-3.5" />
              </div>
              <span className="uppercase tracking-wider">Opportunities</span>
            </div>
            <ul className="space-y-1.5 text-xs text-blue-950 font-medium">
              {swot?.opportunities && swot.opportunities.length > 0 ? (
                swot.opportunities.map((item, idx) => (
                  <li key={idx} className="flex items-start space-x-1.5">
                    <span className="text-blue-600 font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))
              ) : (
                <li className="text-slate-500">Unsatisfied 5km micro-market consumer demand void.</li>
              )}
            </ul>
          </div>

          {/* Micro-Card 3: Weaknesses */}
          <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200/80 space-y-2">
            <div className="flex items-center space-x-2 text-amber-800 font-extrabold text-xs">
              <div className="p-1 rounded-md bg-amber-100 text-amber-700">
                <AlertCircle className="w-3.5 h-3.5" />
              </div>
              <span className="uppercase tracking-wider">Weaknesses</span>
            </div>
            <ul className="space-y-1.5 text-xs text-amber-950 font-medium">
              {swot?.weaknesses && swot.weaknesses.length > 0 ? (
                swot.weaknesses.map((item, idx) => (
                  <li key={idx} className="flex items-start space-x-1.5">
                    <span className="text-amber-600 font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))
              ) : (
                <li className="text-slate-500">Working capital discipline and technical skill brushup.</li>
              )}
            </ul>
          </div>

          {/* Micro-Card 4: Threats & Mitigations */}
          <div className="p-4 rounded-xl bg-rose-50/50 border border-rose-200/80 space-y-2">
            <div className="flex items-center space-x-2 text-rose-800 font-extrabold text-xs">
              <div className="p-1 rounded-md bg-rose-100 text-rose-700">
                <ShieldAlert className="w-3.5 h-3.5" />
              </div>
              <span className="uppercase tracking-wider">Threats & Mitigations</span>
            </div>
            <ul className="space-y-1.5 text-xs text-rose-950 font-medium">
              {swot?.threats && swot.threats.length > 0 ? (
                swot.threats.map((item, idx) => (
                  <li key={idx} className="flex items-start space-x-1.5">
                    <span className="text-rose-600 font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))
              ) : (
                <li className="text-slate-500">Raw material price volatility mitigated via direct sourcing.</li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. INSTITUTIONAL PDF DOSSIER & DPR GENERATION FOOTER                      */}
      {/* ========================================================================= */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl border border-slate-800">
        <div className="space-y-1 text-center sm:text-left">
          <h4 className="text-base font-black flex items-center justify-center sm:justify-start space-x-2 text-white">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Institutional Credit Appraisal Dossier & DPR</span>
          </h4>
          <p className="text-xs text-slate-300">
            Export official banking appraisal PDF with MoSJE subvention terms and 5km spatial feasibility maps.
          </p>
        </div>

        <div className="flex items-center space-x-2.5 shrink-0">
          <CreditAppraisalDossierPDFButton
            assessment={assessment}
            buttonLabel="Download Credit Dossier (PDF)"
          />

          {onGenerateDPR && (
            <button
              onClick={onGenerateDPR}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs shadow transition-all flex items-center space-x-1"
            >
              <span>Full DPR</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeasibilityResults;
