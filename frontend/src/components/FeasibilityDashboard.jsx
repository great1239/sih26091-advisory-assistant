import React from 'react';
import { motion } from 'framer-motion';
import {
  MapPin,
  Compass,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
  Zap,
  Droplets,
  Layers,
  Activity,
  Award,
  Sparkles,
  Info
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend
} from 'recharts';
import { translations } from '../translations';

export default function FeasibilityDashboard({ assessment, language }) {
  if (!assessment) return null;
  const t = translations[language] || translations.English;

  const voidData = assessment.void_analysis;
  const risk = assessment.risk_assessment;
  const geo = assessment.geo_bounding;
  const swot = assessment.swot_analysis;

  // Chart Data: Demand vs Supply
  const chartData = [
    {
      name: 'Baseline Demand',
      amount: voidData.baseline_demographic_demand_inr,
      fill: '#3B82F6'
    },
    {
      name: 'Formal Supply',
      amount: voidData.formal_supply_inr,
      fill: '#10B981'
    },
    {
      name: 'Informal Supply',
      amount: voidData.proxy_informal_supply_inr,
      fill: '#F59E0B'
    },
    {
      name: 'Net Market Void',
      amount: Math.max(0, voidData.market_void_inr),
      fill: '#8B5CF6'
    }
  ];

  // Risk Scores Breakdown
  const riskBars = [
    {
      label: 'Groundwater / Aquifer Risk',
      score: risk.water_risk.risk_score,
      status: risk.water_risk.is_dark_zone ? 'Over-Exploited VETO' : 'Safe Aquifer',
      color: risk.water_risk.is_dark_zone ? 'bg-rose-500' : 'bg-emerald-500',
      icon: Droplets
    },
    {
      label: 'Power Grid Reliability',
      score: risk.power_risk.risk_score,
      status: risk.power_risk.is_power_stressed ? 'Frequent Outages (+Buffer)' : 'Stable 3-Phase',
      color: risk.power_risk.is_power_stressed ? 'bg-amber-500' : 'bg-emerald-500',
      icon: Zap
    },
    {
      label: 'Cyber & UPI Stability',
      score: risk.connectivity_risk.risk_score,
      status: '4G/5G Network Active',
      color: 'bg-blue-500',
      icon: Activity
    },
    {
      label: 'Regulatory & EoDB Friction',
      score: risk.eodb_risk.risk_score,
      status: 'SCA Fast-Track Eligible',
      color: 'bg-indigo-500',
      icon: Layers
    }
  ];

  return (
    <div className="space-y-6">
      
      {/* Top Banner: Composite Feasibility Scorecard */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-3 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-blue-100 text-blue-800 border border-blue-200">
                Module 1: Hyper-Local Spatial Intelligence
              </span>
              <span className="text-xs text-slate-500">| Live OSM Overpass & CGWB Data</span>
            </div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight mt-1.5">
              {assessment.business_category} Feasibility Report
            </h3>
            <p className="text-xs text-slate-600 flex items-center space-x-1.5 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-blue-600" />
              <span>
                {geo.district}, {geo.state} • {geo.radius_km} km Trade Catchment Radius
              </span>
            </p>
          </div>

          {/* Composite Feasibility Badge */}
          <div className="flex items-center space-x-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
            <div className="text-right">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Viability Rating
              </span>
              <span className="text-xl font-black text-slate-900">
                {risk.overall_feasibility_tier}
              </span>
            </div>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-md ${
              risk.overall_feasibility_tier.includes('High') ? 'bg-emerald-600' : risk.overall_feasibility_tier.includes('Moderate') ? 'bg-blue-600' : 'bg-rose-600'
            }`}>
              {Math.round(100 - risk.composite_risk_score)}%
            </div>
          </div>
        </div>

        {/* CGWB Dark Zone Alert Banner if Veto is Active */}
        {risk.water_risk.is_dark_zone && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <span className="font-extrabold block">
                ⚠️ CGWB Over-Exploited / Dark Zone Water Veto Triggered
              </span>
              <p className="leading-relaxed text-rose-800">
                {geo.district} is classified by the Central Ground Water Board (CGWB) as an Over-Exploited aquifer table.
                Water-intensive businesses are restricted under MoSJE guidelines. Strategic eco-friendly pivots are recommended below.
              </p>
            </div>
          </div>
        )}
      </motion.div>

      {/* Grid: Void Bar Chart + 5D Risk Scorecard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Market Void Analysis Card */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-500">
                Market Void Equation
              </h4>
              <p className="text-base font-black text-slate-900 mt-0.5">
                Demand vs Total Market Supply
              </p>
            </div>
            <span className="text-xs font-extrabold px-3 py-1 rounded-xl bg-purple-50 text-purple-800 border border-purple-200">
              Void: ₹{voidData.market_void_inr.toLocaleString()} ({Math.round(voidData.void_index_ratio * 100)}%)
            </span>
          </div>

          <div className="h-60 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tickFormatter={(v) => `₹${(v/100000).toFixed(1)}L`} tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v) => [`₹${Number(v).toLocaleString()}`, 'Value']} />
                <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Spatial Node Footnotes */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100 text-xs">
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/70">
              <span className="text-[10px] text-slate-400 block font-bold uppercase">Formal POIs</span>
              <span className="font-extrabold text-slate-800">{voidData.formal_udyam_poi_count} Registered Units</span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/70">
              <span className="text-[10px] text-slate-400 block font-bold uppercase">Informal Nodes (OSM)</span>
              <span className="font-extrabold text-slate-800">{voidData.informal_merchant_nodes} Active Nodes</span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/70">
              <span className="text-[10px] text-slate-400 block font-bold uppercase">Density</span>
              <span className="font-extrabold text-slate-800">{voidData.competitor_density_per_sqkm} per sq.km</span>
            </div>
          </div>
        </motion.div>

        {/* 5-Dimensional Risk Scorecard */}
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-500">
                  5-Dimensional Risk Model
                </h4>
                <p className="text-base font-black text-slate-900 mt-0.5">
                  Infrastructure & Ecological Clearance
                </p>
              </div>
              <span className="text-xs font-black text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                Score: {Math.round(risk.composite_risk_score)}/100
              </span>
            </div>

            <div className="space-y-3.5">
              {riskBars.map((rb, idx) => {
                const Icon = rb.icon;
                return (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <div className="flex items-center space-x-1.5 text-slate-700">
                        <Icon className="w-3.5 h-3.5 text-slate-500" />
                        <span>{rb.label}</span>
                      </div>
                      <span className="text-[11px] text-slate-600">{rb.status}</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${rb.color} rounded-full transition-all duration-500`}
                        style={{ width: `${Math.max(10, rb.score)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-blue-50/80 border border-blue-200 text-blue-900 text-xs space-y-1">
            <span className="font-extrabold flex items-center space-x-1">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Founder Competency Discount</span>
            </span>
            <p className="text-[11px] text-blue-800">
              {assessment.financial_structuring.competency_discount_percent}% OPEX waste reduction applied based on {assessment.years_experience || 4} years founder experience.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Dynamic SWOT Matrix Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4"
      >
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded text-xs font-black uppercase tracking-wider bg-indigo-100 text-indigo-800 border border-indigo-200">
              Dynamic LangChain Intelligence
            </span>
            <span className="text-xs text-slate-500">| Experience-Weighted SWOT Matrix</span>
          </div>
          <h4 className="text-lg font-black text-slate-900 mt-1">
            Rebalanced SWOT Assessment Matrix
          </h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Strengths */}
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2">
            <span className="text-xs font-black text-emerald-900 uppercase tracking-wider flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Strengths</span>
            </span>
            <ul className="text-xs text-emerald-950 space-y-1 pl-1">
              {swot.strengths?.map((s, i) => (
                <li key={i} className="flex items-start space-x-1.5">
                  <span className="text-emerald-500 font-bold">•</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Weaknesses */}
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
            <span className="text-xs font-black text-amber-900 uppercase tracking-wider flex items-center space-x-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Weaknesses</span>
            </span>
            <ul className="text-xs text-amber-950 space-y-1 pl-1">
              {swot.weaknesses?.map((w, i) => (
                <li key={i} className="flex items-start space-x-1.5">
                  <span className="text-amber-500 font-bold">•</span>
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Opportunities */}
          <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-2">
            <span className="text-xs font-black text-blue-900 uppercase tracking-wider flex items-center space-x-1.5">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <span>Opportunities</span>
            </span>
            <ul className="text-xs text-blue-950 space-y-1 pl-1">
              {swot.opportunities?.map((o, i) => (
                <li key={i} className="flex items-start space-x-1.5">
                  <span className="text-blue-500 font-bold">•</span>
                  <span>{o}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Threats */}
          <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200 space-y-2">
            <span className="text-xs font-black text-rose-900 uppercase tracking-wider flex items-center space-x-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>Threats & Mitigations</span>
            </span>
            <ul className="text-xs text-rose-950 space-y-1 pl-1">
              {swot.threats?.map((t, i) => (
                <li key={i} className="flex items-start space-x-1.5">
                  <span className="text-rose-500 font-bold">•</span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </motion.div>

    </div>
  );
}
