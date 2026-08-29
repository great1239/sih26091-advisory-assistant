import React, { useState, useEffect } from 'react';
import { Target, Trophy, Sparkles, TrendingUp, Calendar, CheckCircle2, IndianRupee } from 'lucide-react';
import confetti from 'canvas-confetti';
import { calculateSavingsTracker } from '../services/api';
import { translations } from '../translations';

export default function SavingsGoalTracker({ language }) {
  const [targetCost, setTargetCost] = useState(150000);
  const [currentSavings, setCurrentSavings] = useState(6000);
  const [weeklySaving, setWeeklySaving] = useState(500);
  const [trackerData, setTrackerData] = useState(null);

  const t = translations[language] || translations.English;

  useEffect(() => {
    async function updateTracker() {
      const res = await calculateSavingsTracker({
        target_project_cost: Number(targetCost),
        current_savings: Number(currentSavings),
        weekly_savings_capacity: Number(weeklySaving)
      });
      setTrackerData(res);

      if (res.savings_gap_inr === 0) {
        confetti({ particleCount: 50, spread: 60 });
      }
    }
    updateTracker();
  }, [targetCost, currentSavings, weeklySaving]);

  if (!trackerData) return null;

  const progressPercent = Math.min(100, Math.round((currentSavings / trackerData.required_margin_capital) * 100));

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
      <div>
        <div className="flex items-center space-x-2">
          <span className="px-2.5 py-0.5 rounded text-xs font-black uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-200">
            QoL Edge-Case: Micro-Savings Planner
          </span>
          <span className="text-xs text-slate-500">| Margin Capital Goal Tracker</span>
        </div>
        <h3 className="text-xl font-black text-slate-900 mt-1">
          {t.savingsTracker}
        </h3>
        <p className="text-xs text-slate-600">
          Enables aspiring entrepreneurs lacking the 10% equity cash to systematically close the savings gap with gamified milestones.
        </p>
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
            Target Project Value (INR)
          </label>
          <div className="relative">
            <input
              type="number"
              step="10000"
              value={targetCost}
              onChange={(e) => setTargetCost(e.target.value)}
              className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-300 bg-slate-50 font-bold text-sm"
            />
            <IndianRupee className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
          </div>
          <span className="text-[10px] text-blue-600 font-semibold">
            Requires ₹{(targetCost * 0.1).toLocaleString()} Margin (10%)
          </span>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
            Current Savings (INR)
          </label>
          <div className="relative">
            <input
              type="number"
              step="500"
              value={currentSavings}
              onChange={(e) => setCurrentSavings(e.target.value)}
              className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-300 bg-slate-50 font-bold text-sm"
            />
            <IndianRupee className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
            Weekly Savings Capacity (INR)
          </label>
          <div className="relative">
            <input
              type="number"
              step="100"
              value={weeklySaving}
              onChange={(e) => setWeeklySaving(e.target.value)}
              className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-300 bg-slate-50 font-bold text-sm"
            />
            <IndianRupee className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
          </div>
          <span className="text-[10px] text-slate-500">
            e.g. ₹{weeklySaving}/week = ₹{weeklySaving * 4}/month
          </span>
        </div>
      </div>

      {/* Progress Card */}
      <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-2xl p-5 text-white shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider">
              Goal Progress: {progressPercent}%
            </span>
            <h4 className="text-xl font-black text-white mt-0.5">
              {trackerData.savings_gap_inr > 0
                ? `Save ₹${trackerData.savings_gap_inr.toLocaleString()} more to unlock ₹${(targetCost * 0.9).toLocaleString()} Loan!`
                : 'Congratulations! You have 100% of required Margin Capital!'}
            </h4>
          </div>
          <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-extrabold text-center">
            {trackerData.gamified_badge}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-800 rounded-full h-3.5 overflow-hidden p-0.5 border border-slate-700">
          <div
            className="bg-gradient-to-r from-amber-400 via-emerald-400 to-teal-300 h-full rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Time Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700">
            <span className="text-[10px] text-slate-400 font-bold block">Required 10%</span>
            <span className="text-sm font-black text-white">₹{trackerData.required_margin_capital.toLocaleString()}</span>
          </div>
          <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700">
            <span className="text-[10px] text-slate-400 font-bold block">Current Cash</span>
            <span className="text-sm font-black text-emerald-400">₹{trackerData.current_savings.toLocaleString()}</span>
          </div>
          <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700">
            <span className="text-[10px] text-slate-400 font-bold block">Weeks to Goal</span>
            <span className="text-sm font-black text-amber-400">{trackerData.weeks_to_goal} Weeks</span>
          </div>
          <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700">
            <span className="text-[10px] text-slate-400 font-bold block">Months Runway</span>
            <span className="text-sm font-black text-purple-400">{trackerData.months_to_goal} Months</span>
          </div>
        </div>
      </div>

      {/* Gamified Milestones */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {trackerData.milestones.map((ms, idx) => (
          <div
            key={idx}
            className={`p-3.5 rounded-xl border transition-all ${
              ms.is_achieved
                ? 'bg-emerald-50 border-emerald-300 shadow-sm'
                : 'bg-slate-50 border-slate-200 opacity-70'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-black uppercase text-slate-500">{ms.percentage}% Target</span>
              {ms.is_achieved && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
            </div>
            <p className="text-xs font-black text-slate-900">{ms.badge_name}</p>
            <p className="text-xs font-bold text-slate-600 mt-1">₹{ms.target_amount_inr.toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
