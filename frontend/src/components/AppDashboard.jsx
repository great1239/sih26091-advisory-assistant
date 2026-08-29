import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  MapPin,
  IndianRupee,
  ShieldCheck,
  TrendingUp,
  Percent,
  FileDown,
  Building2,
  QrCode,
  Droplets,
  Zap,
  Activity,
  Layers,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Compass,
  Map as MapIcon,
  Store,
  Tag
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import axios from 'axios';
import confetti from 'canvas-confetti';
import ChatOnboarding from './ChatOnboarding';
import LiveLocationMap from './LiveLocationMap';
import PaymentQRModal from './PaymentQRModal';

export default function AppDashboard({ language }) {
  // Clean Empty State: No pre-populated mock data
  const [assessment, setAssessment] = useState(null);
  const [selectedCoords, setSelectedCoords] = useState({ lat: 28.6139, lng: 77.2090 });
  const [activeCockpitView, setActiveCockpitView] = useState('map'); // 'map' | 'analysis'
  const [mandiPricing, setMandiPricing] = useState(null);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [isDownloadingDPR, setIsDownloadingDPR] = useState(false);

  // When user selects location on Map
  const handleLocationSelect = (loc, maybeLng) => {
    if (!loc) return;
    let lat = 28.6139;
    let lng = 77.2090;

    if (typeof loc === 'object') {
      lat = loc.latitude ?? loc.lat ?? 28.6139;
      lng = loc.longitude ?? loc.lng ?? 77.2090;
    } else if (typeof loc === 'number' || !isNaN(parseFloat(loc))) {
      lat = parseFloat(loc);
      lng = maybeLng !== undefined ? parseFloat(maybeLng) : 77.2090;
    }

    setSelectedCoords({
      lat: typeof lat === 'number' && !isNaN(lat) ? lat : 28.6139,
      lng: typeof lng === 'number' && !isNaN(lng) ? lng : 77.2090
    });
  };

  // When conversational NLP completes and triggers assessment
  const handleAssessmentUpdate = async (newAssessment) => {
    setAssessment(newAssessment);
    setActiveCockpitView('analysis');

    // Fetch live Agmarknet mandi wholesale prices from data.gov.in
    try {
      const dist = newAssessment.geo_bounding?.district || 'Jodhpur';
      const state = newAssessment.geo_bounding?.state || 'Rajasthan';
      const res = await axios.get(`/api/data/mandi-pricing?district=${encodeURIComponent(dist)}&state=${encodeURIComponent(state)}`);
      setMandiPricing(res.data);
    } catch (e) {
      console.warn('Mandi pricing fetch note:', e);
    }
  };

  const handleReset = () => {
    setAssessment(null);
    setMandiPricing(null);
    setActiveCockpitView('map');
  };

  const handleDownloadDPR = () => {
    if (!assessment) return;
    setIsDownloadingDPR(true);
    confetti({ particleCount: 80, spread: 70 });

    const safeName = (assessment?.beneficiary_name || 'Beneficiary').replace(/ /g, '_').replace(/\./g, '');
    const url = `/api/dpr/download/${safeName}`;

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `MoSJE_DPR_${safeName}.pdf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => setIsDownloadingDPR(false), 2000);
  };

  const fin = assessment?.financial_structuring;
  const voidData = assessment?.void_analysis;
  const risk = assessment?.risk_assessment;
  const geo = assessment?.geo_bounding;

  const chartData = voidData ? [
    { name: 'Demand', amount: voidData?.baseline_demographic_demand_inr || 0, fill: '#3B82F6' },
    { name: 'Formal Supply', amount: voidData?.formal_supply_inr || 0, fill: '#10B981' },
    { name: 'Informal Supply', amount: voidData?.proxy_informal_supply_inr || 0, fill: '#F59E0B' },
    { name: 'Net Void', amount: Math.max(0, voidData?.market_void_inr || 0), fill: '#8B5CF6' }
  ] : [];

  const cashRunwayData = fin?.amortization_schedule ? fin.amortization_schedule.slice(0, 8).map((item) => ({
    quarter: item?.period_label || 'Qtr',
    revenue: item?.projected_revenue || 0,
    opex: item?.operating_expenses || 0,
    emi: item?.total_emi || 0,
    netCashflow: item?.net_operating_cashflow || 0
  })) : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-6">
      
      {/* Top Header */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white rounded-3xl p-4 sm:p-5 shadow-xl border border-blue-900/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-500/30 text-blue-200 border border-blue-400/30">
              MoSJE Concessional Credit Intelligence
            </span>
            <span className="text-xs text-slate-400">| SIH26091 Advisory Platform</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white mt-1 tracking-tight">
            {assessment ? `${assessment?.beneficiary_name || 'Beneficiary'} • ${assessment?.business_category || 'Enterprise'}` : 'Rural Enterprise Feasibility Cockpit'}
          </h2>
          <p className="text-xs text-slate-300 mt-0.5 flex items-center space-x-1">
            <MapPin className="w-3.5 h-3.5 text-rose-400" />
            <span>
              Center-Point: ({Number(selectedCoords?.lat || 28.6139).toFixed(4)}, {Number(selectedCoords?.lng || 77.2090).toFixed(4)}) • 5.0 km Micro-Market
            </span>
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {assessment && (
            <>
              <button
                type="button"
                onClick={() => setActiveCockpitView(activeCockpitView === 'map' ? 'analysis' : 'map')}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center space-x-1.5 border border-slate-700 transition-all"
              >
                <MapIcon className="w-3.5 h-3.5 text-blue-400" />
                <span>{activeCockpitView === 'map' ? 'Show Analytics' : 'View Map'}</span>
              </button>

              {fin && (
                <button
                  type="button"
                  onClick={() => setIsQRModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-md transition-all transform active:scale-95"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>Deposit 10% Margin (₹{(fin?.available_margin_capital || 0).toLocaleString()})</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleDownloadDPR}
                disabled={isDownloadingDPR}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 flex items-center space-x-1.5 transition-all transform active:scale-95"
              >
                <FileDown className="w-4 h-4" />
                <span>{isDownloadingDPR ? 'Generating...' : 'Download Bank-Ready DPR'}</span>
              </button>
            </>
          )}

          {assessment && (
            <button
              type="button"
              onClick={handleReset}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
              title="Reset Consultation"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Split-Screen Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column (45%): Conversational Stream */}
        <div className="lg:col-span-5 sticky top-20">
          <ChatOnboarding
            onAssessmentComplete={handleAssessmentUpdate}
            language={language}
          />
        </div>

        {/* Right Column (55%): Dynamic Cockpit */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* VIEW 1: Clean Empty State -> Live Roadmap Component */}
          {(!assessment || activeCockpitView === 'map') && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-3"
            >
              <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="p-1.5 rounded-lg bg-blue-100 text-blue-700">
                      <MapPin className="w-4 h-4" />
                    </span>
                    <h3 className="text-sm font-black text-slate-900">
                      Live Roadmap & 5km Radius Feeder
                    </h3>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    OpenStreetMap / CartoDB Active
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  Click anywhere on the map to place your pin or use your device GPS. The 5km micro-market void analysis will center on these exact coordinates.
                </p>
              </div>

              <div className="h-[520px]">
                <LiveLocationMap
                  onLocationSelect={handleLocationSelect}
                  initialCoords={selectedCoords}
                />
              </div>
            </motion.div>
          )}

          {/* VIEW 2: Analytical Results (Rendered once assessment triggered) */}
          {assessment && activeCockpitView === 'analysis' && fin && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* 1. Core Financial Blueprint Card */}
              <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      MoSJE Concessional Credit Routing
                    </span>
                    <h3 className="text-lg font-black text-slate-900 mt-1">
                      {fin?.scheme_tier || 'MoSJE Concessional Loan'}
                    </h3>
                  </div>

                  <span className="px-3 py-1 rounded-xl bg-emerald-50 text-emerald-800 font-extrabold text-xs border border-emerald-200">
                    {fin?.moratorium_months || 3} Months Grace Period
                  </span>
                </div>

                {/* 4 Financial Metric Tiles */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Total Project</span>
                    <p className="text-base font-black text-slate-900 mt-0.5">₹{(fin?.total_project_cost || 0).toLocaleString()}</p>
                    <span className="text-[9px] text-blue-600 font-semibold">10x Margin Cash</span>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">90% Loan Value</span>
                    <p className="text-base font-black text-emerald-700 mt-0.5">₹{(fin?.concessional_loan_eligibility || 0).toLocaleString()}</p>
                    <span className="text-[9px] text-slate-500 font-medium">SCA Direct Credit</span>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Subvented Rate</span>
                    <p className="text-base font-black text-purple-700 mt-0.5">{fin?.final_subvented_interest_rate || 7.0}% p.a.</p>
                    <span className="text-[9px] text-slate-500">Base {fin?.base_interest_rate || 8.0}% (-{fin?.demographic_subvention_discount || 1.0}%)</span>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Monthly EMI</span>
                    <p className="text-base font-black text-slate-900 mt-0.5">₹{(fin?.monthly_emi_post_moratorium || 0).toLocaleString()}</p>
                    <span className="text-[9px] text-amber-600 font-medium">Post-Grace</span>
                  </div>
                </div>

                {/* Subvention Banner */}
                <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between">
                  <span className="font-bold flex items-center space-x-1">
                    <Percent className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{assessment?.social_category || 'Demographic'} Subvention saves ₹{(fin?.subvention_savings_inr || 0).toLocaleString()}!</span>
                  </span>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-emerald-200 text-emerald-900">
                    -{fin?.demographic_subvention_discount || 1.0}% Discount Active
                  </span>
                </div>
              </div>

              {/* 2. 5km Market Void Bar Chart */}
              {voidData && (
                <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                        5.0 km Micro-Market Void
                      </span>
                      <h3 className="text-sm font-black text-slate-900 mt-1">
                        Local Demand vs Total Supply
                      </h3>
                    </div>

                    <span className="text-xs font-black text-purple-900 bg-purple-100 px-2.5 py-1 rounded-xl">
                      Net Void: ₹{(voidData?.market_void_inr || 0).toLocaleString()} ({Math.round((voidData?.void_index_ratio || 0) * 100)}%)
                    </span>
                  </div>

                  <div className="h-48 w-full pt-1">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 10 }}>
                        <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                        <YAxis tickFormatter={(v) => `₹${(v/100000).toFixed(1)}L`} tick={{ fontSize: 9 }} />
                        <Tooltip formatter={(v) => [`₹${Number(v).toLocaleString()}`, 'Value']} />
                        <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-xs">
                    <div className="bg-slate-50 p-2 rounded-xl border border-slate-200/60 text-center">
                      <span className="text-[9px] text-slate-400 font-bold block uppercase">Formal Udyam</span>
                      <span className="font-extrabold text-slate-800">{voidData?.formal_udyam_poi_count || 0} Units</span>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-xl border border-slate-200/60 text-center">
                      <span className="text-[9px] text-slate-400 font-bold block uppercase">Informal Nodes</span>
                      <span className="font-extrabold text-slate-800">{voidData?.informal_merchant_nodes || 0} Nodes</span>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-xl border border-slate-200/60 text-center">
                      <span className="text-[9px] text-slate-400 font-bold block uppercase">Competitor Density</span>
                      <span className="font-extrabold text-slate-800">{voidData?.competitor_density_per_sqkm || 0} / km²</span>
                    </div>
                  </div>
                </div>
              )}

              {/* 3. Live Mandi Wholesale Sourcing (data.gov.in Integration) */}
              {mandiPricing && (
                <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="p-1.5 rounded-lg bg-amber-100 text-amber-800">
                        <Store className="w-4 h-4" />
                      </span>
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          data.gov.in Real-Time Mandis
                        </span>
                        <h3 className="text-sm font-black text-slate-900 mt-0.5">
                          {mandiPricing?.district || 'District'} APMC Wholesale Benchmark
                        </h3>
                      </div>
                    </div>
                    <span className="text-xs font-black text-slate-700 bg-slate-100 px-2.5 py-1 rounded-xl">
                      {mandiPricing?.total_mandi_arrivals || 0} Active Mandis
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {mandiPricing?.mandi_listings && mandiPricing.mandi_listings.slice(0, 4).map((m, idx) => (
                      <div key={idx} className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200/70 text-xs space-y-1">
                        <div className="flex justify-between font-bold text-slate-800">
                          <span className="truncate">{m?.commodity || 'Produce'}</span>
                          <span className="text-emerald-700 font-black">₹{m?.modal_price || 0}/Qtl</span>
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-500">
                          <span className="truncate">{m?.market || 'APMC'}</span>
                          <span>Range: ₹{m?.min_price || 0} - ₹{m?.max_price || 0}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 4. 5D Risk Scorecard */}
              {risk && (
                <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                        5-Dimensional Risk Clearance
                      </span>
                      <h3 className="text-sm font-black text-slate-900 mt-0.5">
                        Ecological, Grid & Regulatory Veto
                      </h3>
                    </div>

                    <span className={`text-xs font-black px-2.5 py-1 rounded-xl ${
                      risk?.hard_veto_active ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {risk?.hard_veto_active ? 'VETO ACTIVE' : 'CLEARANCE APPROVED'}
                    </span>
                  </div>

                  <div className="space-y-2.5 pt-1">
                    <div>
                      <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                        <span className="flex items-center space-x-1">
                          <Droplets className="w-3.5 h-3.5 text-blue-600" />
                          <span>CGWB Groundwater / Aquifer</span>
                        </span>
                        <span className={risk?.water_risk?.is_dark_zone ? 'text-rose-600' : 'text-emerald-600'}>
                          {risk?.water_risk?.is_dark_zone ? 'Over-Exploited (Dark Zone)' : 'Safe Aquifer Table'}
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className={`h-full ${risk?.water_risk?.is_dark_zone ? 'bg-rose-500' : 'bg-emerald-500'} rounded-full`} style={{ width: `${risk?.water_risk?.is_dark_zone ? 90 : 25}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                        <span className="flex items-center space-x-1">
                          <Zap className="w-3.5 h-3.5 text-amber-600" />
                          <span>Rural 3-Phase Power Reliability</span>
                        </span>
                        <span className={risk?.power_risk?.is_power_stressed ? 'text-amber-600' : 'text-emerald-600'}>
                          {risk?.power_risk?.is_power_stressed ? 'Backup Inverter Buffer' : 'Stable 3-Phase Grid'}
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className={`h-full ${risk?.power_risk?.is_power_stressed ? 'bg-amber-500' : 'bg-emerald-500'} rounded-full`} style={{ width: `${risk?.power_risk?.is_power_stressed ? 70 : 20}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 5. Cash Runway Curve */}
              {cashRunwayData.length > 0 && (
                <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                        Amortization & Cash Runway
                      </span>
                      <h3 className="text-sm font-black text-slate-900 mt-0.5">
                        Net Operating Cashflow Projection
                      </h3>
                    </div>

                    <span className="text-[11px] font-bold text-slate-500">
                      Break-Even: Month {fin?.break_even_month || 4}
                    </span>
                  </div>

                  <div className="h-44 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={cashRunwayData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                        <defs>
                          <linearGradient id="netCf" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.6}/>
                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="quarter" tick={{ fontSize: 9 }} />
                        <YAxis tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} tick={{ fontSize: 9 }} />
                        <Tooltip formatter={(v) => [`₹${Number(v).toLocaleString()}`, '']} />
                        <Area type="monotone" dataKey="netCashflow" name="Net Cashflow" stroke="#3B82F6" fillOpacity={1} fill="url(#netCf)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </motion.div>
          )}

        </div>
      </div>

      {/* UPI QR Payment Modal */}
      {fin && (
        <PaymentQRModal
          isOpen={isQRModalOpen}
          onClose={() => setIsQRModalOpen(false)}
          amount={fin?.available_margin_capital || 14000}
          beneficiaryName={assessment?.beneficiary_name}
        />
      )}

    </div>
  );
}
