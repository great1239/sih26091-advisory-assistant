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
import ChatOnboarding from './ChatOnboarding';
import LiveLocationMap from './LiveLocationMap';
import PaymentQRModal from './PaymentQRModal';
import FeasibilityResults from './FeasibilityResults';

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
                  competitorPins={voidData?.scouted_competitor_pins || []}
                />
              </div>
            </motion.div>
          )}

          {/* VIEW 2: Analytical Results (Rendered once assessment triggered) */}
          {assessment && activeCockpitView === 'analysis' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <FeasibilityResults
                assessment={assessment}
                onApplyPivot={handleApplyPivot}
                onGenerateDPR={handleDownloadDPR}
              />
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
