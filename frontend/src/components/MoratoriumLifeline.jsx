import React, { useState } from 'react';
import { Bell, BellRing, CheckCircle, Clock, AlertCircle, ShieldCheck, Sparkles, Smartphone } from 'lucide-react';
import confetti from 'canvas-confetti';
import { usePushNotifications } from '../hooks/usePushNotifications';
import { translations } from '../translations';

export default function MoratoriumLifeline({ milestones, beneficiaryName, language }) {
  const [selectedMilestone, setSelectedMilestone] = useState(milestones?.[0] || null);
  const [testSent, setTestSent] = useState(false);
  const { isSubscribed, subscribeToPush, triggerTestPush, loading } = usePushNotifications();
  const t = translations[language] || translations.English;

  if (!milestones || milestones.length === 0) return null;

  const handleSubscribe = async () => {
    const success = await subscribeToPush(beneficiaryName);
    if (success) {
      confetti({ particleCount: 60, spread: 60 });
    }
  };

  const handleSendTestPush = async () => {
    if (!selectedMilestone) return;
    const ok = await triggerTestPush(
      selectedMilestone.period_title,
      selectedMilestone.hindi_message
    );
    if (ok) {
      setTestSent(true);
      confetti({ particleCount: 40, spread: 50 });
      setTimeout(() => setTestSent(false), 4000);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded text-xs font-black uppercase tracking-wider bg-purple-100 text-purple-800 border border-purple-200">
              Module 4: Moratorium Survival Engine
            </span>
            <span className="text-xs text-slate-500">| PWA Web Push Notifications</span>
          </div>
          <h3 className="text-xl font-black text-slate-900 mt-1">
            Moratorium Survival Engine & Push Notification Lifeline
          </h3>
          <p className="text-xs text-slate-600">
            Delivers critical operational alerts and NACH debit reminders directly to the beneficiary's device lock screen during the 3-to-6 month grace period.
          </p>
        </div>

        {/* Push Notification Toggle Button */}
        {isSubscribed ? (
          <div className="px-3.5 py-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-300 flex items-center space-x-2 text-xs font-black flex-shrink-0">
            <BellRing className="w-4 h-4 text-emerald-600 animate-pulse" />
            <span>PWA Push Alerts Active</span>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleSubscribe}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-wider shadow-md flex items-center space-x-2 transition-all transform active:scale-95 flex-shrink-0"
          >
            <Bell className="w-4 h-4" />
            <span>{loading ? 'Registering...' : 'Enable Device Push Alerts'}</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Milestones List */}
        <div className="lg:col-span-5 space-y-3">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-500">
            Moratorium Grace Milestones:
          </h4>

          {milestones.map((m) => {
            const isSelected = selectedMilestone?.nudge_id === m.nudge_id;

            return (
              <div
                key={m.nudge_id}
                onClick={() => setSelectedMilestone(m)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-blue-50 border-blue-400 shadow-sm'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                      m.criticality === 'Urgent'
                        ? 'bg-rose-100 text-rose-800 border border-rose-200'
                        : 'bg-blue-100 text-blue-800 border border-blue-200'
                    }`}>
                      Day {m.day_milestone}
                    </span>
                    <span className="text-xs font-bold text-slate-900">
                      {m.period_title.split(':')[1] || m.period_title}
                    </span>
                  </div>
                  <span className="text-[10px] font-medium text-slate-400">Scheduled</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Device Lock Screen Preview & Push Trigger */}
        <div className="lg:col-span-7 bg-slate-950 rounded-2xl p-5 text-white shadow-xl flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-black text-xs shadow-md">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black">PWA Device Push Notification Preview</h4>
                  <span className="text-[10px] text-slate-400">VAPID Protocol / W3C Push API</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSendTestPush}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center space-x-1.5 transition-all shadow-sm"
              >
                <BellRing className="w-3.5 h-3.5" />
                <span>Test Live Push</span>
              </button>
            </div>

            {/* Lock Screen Notification Box */}
            {selectedMilestone && (
              <div className="mt-4 space-y-3">
                <div className="bg-slate-900/90 border border-slate-700/80 p-4 rounded-2xl text-xs space-y-2 shadow-inner">
                  <div className="flex items-center justify-between text-slate-400 text-[10px]">
                    <span className="font-bold text-blue-400 flex items-center space-x-1">
                      <span>🇮🇳</span>
                      <span>MoSJE Vikas Sarthi Lifeline</span>
                    </span>
                    <span>Just now</span>
                  </div>
                  <h5 className="font-extrabold text-sm text-white">
                    {selectedMilestone.period_title}
                  </h5>
                  <p className="text-slate-200 leading-relaxed font-sans text-xs">
                    {selectedMilestone.hindi_message}
                  </p>
                  <p className="text-slate-400 text-[11px] italic border-t border-slate-800 pt-1.5">
                    EN: {selectedMilestone.english_message}
                  </p>
                </div>

                {/* Milestone Checklist */}
                <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
                  <span className="text-[11px] font-black text-amber-400 uppercase tracking-wider block mb-2">
                    Actionable Milestone Checklist:
                  </span>
                  <div className="space-y-1.5">
                    {selectedMilestone.checklist?.map((chk, i) => (
                      <div key={i} className="flex items-start space-x-2 text-xs text-slate-300">
                        <input type="checkbox" defaultChecked={i === 0} className="mt-0.5 accent-emerald-500 rounded" />
                        <span>{chk}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {testSent && (
                  <div className="p-2.5 rounded-xl bg-emerald-950/70 border border-emerald-500 text-emerald-300 text-xs font-bold text-center animate-fadeIn">
                    ✓ Web Push notification delivered to browser notification tray!
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-slate-800 text-center">
            <span className="text-[10px] text-slate-500 font-mono">
              Offline-ready Service Worker Push Handler registered in /public/sw.js
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
