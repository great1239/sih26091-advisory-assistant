import React from 'react';
import { Sparkles, ArrowRight, ShieldCheck, CheckCircle2, RefreshCw } from 'lucide-react';
import { translations } from '../translations';

export default function PivotAdvisor({ pivots, onSelectPivot, language }) {
  if (!pivots || pivots.length === 0) return null;

  const t = translations[language] || translations.English;

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded text-xs font-black uppercase tracking-wider bg-purple-100 text-purple-800 border border-purple-200">
              Module 2.5: AI Strategic Redirection
            </span>
            <span className="text-xs text-slate-500">| Eliminates Bank Rejection</span>
          </div>
          <h3 className="text-xl font-black text-slate-900 mt-1">
            {t.pivotsTitle}
          </h3>
          <p className="text-xs text-slate-600">
            When market void is saturated or environmental/asset constraints hit, our AI dynamically structures viable sector-adjacent, budget-scaled, and mobile asset alternatives.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        {pivots.map((p) => {
          const isSector = p.pivot_type === 'Sector-Adjacent';
          const isBudget = p.pivot_type === 'Budget-Driven';
          const isAsset = p.pivot_type === 'Asset-Driven';

          const badgeColor = isSector
            ? 'bg-blue-100 text-blue-800 border-blue-200'
            : isBudget
            ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
            : 'bg-amber-100 text-amber-800 border-amber-200';

          return (
            <div
              key={p.pivot_id}
              className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 flex flex-col justify-between hover:border-blue-300 hover:shadow-md transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase border ${badgeColor}`}>
                    {p.pivot_type}
                  </span>
                  <span className="text-xs font-extrabold text-emerald-700">
                    Viability: {p.expected_viability_score}%
                  </span>
                </div>

                <h4 className="text-sm font-black text-slate-900 leading-tight">
                  {p.title}
                </h4>
                <p className="text-xs font-bold text-blue-700 mt-1">
                  👉 {p.recommended_category}
                </p>

                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  {p.rationale}
                </p>

                {/* Key Advantages */}
                <div className="mt-3 space-y-1">
                  {p.key_advantages?.map((adv, idx) => (
                    <div key={idx} className="flex items-start space-x-1.5 text-[11px] text-slate-700 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span>{adv}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action */}
              <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">Project Cost</span>
                  <span className="text-xs font-black text-slate-900">₹{p.estimated_project_cost.toLocaleString()}</span>
                </div>

                <button
                  type="button"
                  onClick={() => onSelectPivot && onSelectPivot(p.recommended_category)}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center space-x-1 shadow-sm transition-all"
                >
                  <span>Adopt Pivot</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
