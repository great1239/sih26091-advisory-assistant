import React, { useState } from 'react';
import {
  Landmark,
  FileDown,
  Percent,
  Calendar,
  DollarSign,
  TrendingDown,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  QrCode
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import confetti from 'canvas-confetti';
import PaymentQRModal from './PaymentQRModal';
import { translations } from '../translations';

export default function FinancialBlueprint({ assessment, language }) {
  const [downloading, setDownloading] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const t = translations[language] || translations.English;

  if (!assessment) return null;
  const fin = assessment.financial_structuring;

  const handleDownloadDPR = () => {
    setDownloading(true);
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });

    const safeName = assessment.beneficiary_name.replace(/ /g, '_').replace(/\./g, '');
    const url = `/api/dpr/download/${safeName}`;

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `MoSJE_DPR_${safeName}.pdf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => setDownloading(false), 2000);
  };

  const cashRunwayData = fin.amortization_schedule.map((item) => ({
    quarter: item.period_label,
    revenue: item.projected_revenue,
    opex: item.operating_expenses,
    emi: item.total_emi,
    netCashflow: item.net_operating_cashflow,
    isMoratorium: item.is_moratorium
  }));

  return (
    <div className="space-y-6">
      {/* Top Scheme Card */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 rounded-2xl text-white p-6 shadow-xl border border-blue-900/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-3 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-blue-500/30 text-blue-200 border border-blue-400/30">
                Module 2: Smart Financial Calculator
              </span>
              <span className="text-xs text-slate-300">| MoSJE Statutory Compliance</span>
            </div>
            <h3 className="text-2xl font-black tracking-tight mt-1.5 text-white">
              {fin.scheme_tier}
            </h3>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              100% deterministic mathematical execution complying with Ministry of Social Justice & Empowerment credit allocation guidelines.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* NPCI UPI Deposit Button */}
            <button
              type="button"
              onClick={() => setQrModalOpen(true)}
              className="px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-wider shadow-md flex items-center space-x-1.5 transition-all transform active:scale-95"
            >
              <QrCode className="w-4 h-4" />
              <span>Deposit 10% Margin (UPI)</span>
            </button>

            {/* 1-Click DPR PDF Button */}
            <button
              type="button"
              onClick={handleDownloadDPR}
              disabled={downloading}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 flex items-center justify-center space-x-2 transition-all transform active:scale-95"
            >
              <FileDown className="w-4 h-4" />
              <span>{downloading ? 'Compiling Dossier...' : t.downloadDPR}</span>
            </button>
          </div>
        </div>

        {/* 4-Stat Core Financial Metric Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800">
          <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/60">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Total Project Cost</span>
            <p className="text-xl font-black text-white mt-1">₹{fin.total_project_cost.toLocaleString()}</p>
            <span className="text-[10px] text-blue-400 font-semibold">10x Available Margin</span>
          </div>

          <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/60">
            <span className="text-[11px] font-bold text-slate-400 uppercase">90% Loan Eligibility</span>
            <p className="text-xl font-black text-emerald-400 mt-1">₹{fin.concessional_loan_eligibility.toLocaleString()}</p>
            <span className="text-[10px] text-slate-400 font-medium">Concessional Credit</span>
          </div>

          <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/60">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Subvented Interest</span>
            <p className="text-xl font-black text-amber-400 mt-1">{fin.final_subvented_interest_rate}% p.a.</p>
            <span className="text-[10px] text-slate-400">Base {fin.base_interest_rate}% (-{fin.demographic_subvention_discount}%)</span>
          </div>

          <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/60">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Moratorium Period</span>
            <p className="text-xl font-black text-purple-400 mt-1">{fin.moratorium_months} Months</p>
            <span className="text-[10px] text-slate-400">Zero Principal Grace</span>
          </div>
        </div>
      </div>

      {/* Subvention & Competency Savings Badges */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl">
              <Percent className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-emerald-800">
                MoSJE Demographic Subvention Benefit
              </span>
              <p className="text-xs font-bold text-slate-700 mt-0.5">
                {assessment.social_category} Category saves ₹{fin.subvention_savings_inr.toLocaleString()} over loan tenure!
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-900 font-extrabold text-xs">
            -{fin.demographic_subvention_discount}% Off
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-blue-50 text-blue-700 rounded-xl">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-blue-800">
                Founder Experience Competency Discount
              </span>
              <p className="text-xs font-bold text-slate-700 mt-0.5">
                Reduces annual operating waste by ₹{fin.annual_competency_savings_inr.toLocaleString()}
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-lg bg-blue-100 text-blue-900 font-extrabold text-xs">
            {fin.competency_discount_percent}% OPEX Saving
          </span>
        </div>
      </div>

      {/* Cash Runway & Breakeven Area Chart */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-500">
              Moratorium Cash Runway & Net Cashflow Projection
            </h4>
            <p className="text-xs font-bold text-slate-800">
              Projected Break-Even at Month {fin.break_even_month} | Required Buffer: ₹{fin.required_runway_buffer_inr.toLocaleString()}
            </p>
          </div>
          <span className="text-xs font-extrabold px-3 py-1 rounded-lg bg-indigo-50 text-indigo-800 border border-indigo-200">
            Monthly EMI Post-Grace: ₹{fin.monthly_emi_post_moratorium.toLocaleString()}
          </span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={cashRunwayData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="opexGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="cfGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.6}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="quarter" tick={{ fontSize: 10 }} />
              <YAxis tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} tick={{ fontSize: 10 }} />
              <Tooltip formatter={(v) => [`₹${Number(v).toLocaleString()}`, '']} />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Area type="monotone" dataKey="revenue" name="Quarterly Revenue" stroke="#10B981" fillOpacity={1} fill="url(#revGrad)" />
              <Area type="monotone" dataKey="opex" name="Operating Expenses" stroke="#F59E0B" fillOpacity={1} fill="url(#opexGrad)" />
              <Area type="monotone" dataKey="netCashflow" name="Net Operating Cashflow" stroke="#3B82F6" fillOpacity={1} fill="url(#cfGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Amortization Schedule Table */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm overflow-hidden">
        <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-3">
          Quarterly Amortization Schedule (Bank Appraisal Format)
        </h4>
        <div className="overflow-x-auto max-h-72">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-extrabold sticky top-0">
                <th className="p-2.5 border-b border-slate-300">Period</th>
                <th className="p-2.5 border-b border-slate-300">Beginning Principal</th>
                <th className="p-2.5 border-b border-slate-300">Interest Due</th>
                <th className="p-2.5 border-b border-slate-300">Principal Paid</th>
                <th className="p-2.5 border-b border-slate-300">Quarterly EMI</th>
                <th className="p-2.5 border-b border-slate-300">Ending Balance</th>
                <th className="p-2.5 border-b border-slate-300">Net Cashflow</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {fin.amortization_schedule.map((item, idx) => (
                <tr key={idx} className={item.is_moratorium ? 'bg-amber-50/50' : 'hover:bg-slate-50'}>
                  <td className="p-2.5 font-bold text-slate-900">
                    {item.period_label}
                    {item.is_moratorium && (
                      <span className="ml-1.5 px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-amber-200 text-amber-900">
                        Grace
                      </span>
                    )}
                  </td>
                  <td className="p-2.5 text-slate-700">₹{item.beginning_principal.toLocaleString()}</td>
                  <td className="p-2.5 text-rose-700 font-medium">₹{item.interest_due.toLocaleString()}</td>
                  <td className="p-2.5 text-emerald-700 font-medium">₹{item.principal_repaid.toLocaleString()}</td>
                  <td className="p-2.5 font-bold text-slate-900">₹{item.total_emi.toLocaleString()}</td>
                  <td className="p-2.5 text-slate-700">₹{item.ending_principal.toLocaleString()}</td>
                  <td className={`p-2.5 font-bold ${item.net_operating_cashflow >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    ₹{item.net_operating_cashflow.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment QR Modal */}
      <PaymentQRModal
        isOpen={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
        amount={fin.available_margin_capital}
        beneficiaryName={assessment.beneficiary_name}
      />
    </div>
  );
}
