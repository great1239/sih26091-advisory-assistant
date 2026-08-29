import React, { useEffect, useState } from 'react';
import { Sparkles, MapPin, IndianRupee, Briefcase, Users, Award, ShieldAlert, CheckCircle2, Wifi, WifiOff } from 'lucide-react';
import VoiceAssistant from './VoiceAssistant';
import { offlineStorage } from '../services/offlineStorage';
import { translations } from '../translations';

export default function OnboardingWizard({
  formData,
  setFormData,
  onSubmit,
  loading,
  language
}) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const t = translations[language] || translations.English;

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Load draft from IndexedDB if available
    offlineStorage.getDraft().then((draft) => {
      if (draft) {
        setFormData((prev) => ({ ...prev, ...draft }));
      }
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Auto-save form inputs to IndexedDB
  const updateFormField = (key, value) => {
    const updated = { ...formData, [key]: value };
    setFormData(updated);
    offlineStorage.saveDraft(updated);
  };

  const loadPersona = (type) => {
    let persona = {};
    if (type === 'sunita') {
      persona = {
        beneficiary_name: 'Sunita Devi',
        geographic_location: 'Jodhpur, Rajasthan',
        margin_capital: 14000,
        business_category: 'Tailoring & Readymade Garments',
        social_category: 'Women',
        land_asset_status: 'None',
        years_in_industry: 4,
        specific_skillsets: ['Pattern Cutting', 'Finishing'],
        preferred_language: 'Hindi'
      };
    } else if (type === 'rameshwar') {
      persona = {
        beneficiary_name: 'Rameshwar Prasad',
        geographic_location: 'Purnia, Bihar',
        margin_capital: 25000,
        business_category: 'Mini Flour & Spice Processing Mill',
        social_category: 'SC',
        land_asset_status: 'Owned',
        years_in_industry: 2,
        specific_skillsets: ['Grain Processing'],
        preferred_language: 'Hindi'
      };
    } else if (type === 'dairy_veto') {
      persona = {
        beneficiary_name: 'Kailash Meena',
        geographic_location: 'Jodhpur, Rajasthan',
        margin_capital: 80000,
        business_category: 'Commercial Dairy (10+ Cattle)',
        social_category: 'ST',
        land_asset_status: 'Owned',
        years_in_industry: 1,
        specific_skillsets: ['Cattle Care'],
        preferred_language: 'Hindi'
      };
    }
    setFormData(persona);
    offlineStorage.saveDraft(persona);
  };

  const projectCost = (Number(formData.margin_capital) || 0) * 10;
  const loanEligible = projectCost * 0.9;
  const isMicro = projectCost <= 140000;

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-900 text-white p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/30 text-blue-200 border border-blue-400/30">
                Deterministic Parameter Gateway
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center space-x-1 ${
                isOnline ? 'bg-emerald-500/30 text-emerald-300' : 'bg-amber-500/30 text-amber-300'
              }`}>
                {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                <span>{isOnline ? 'Online (Live OSM)' : 'Offline (IndexedDB Active)'}</span>
              </span>
            </div>
            <h2 className="text-2xl font-black tracking-tight mt-1">
              Beneficiary Onboarding & Profile Gateway
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Rigid demographic, financial, and spatial inputs with zero-bandwidth offline IndexedDB caching.
            </p>
          </div>

          {/* Quick Persona Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-800/80 p-1.5 rounded-xl border border-slate-700">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">Demo Profiles:</span>
            <button
              type="button"
              onClick={() => loadPersona('sunita')}
              className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-pink-500/20 text-pink-300 hover:bg-pink-500/30 border border-pink-500/30 transition-all"
            >
              👩 Sunita (Women/SC)
            </button>
            <button
              type="button"
              onClick={() => loadPersona('rameshwar')}
              className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30 transition-all"
            >
              🌾 Rameshwar (SC Mill)
            </button>
            <button
              type="button"
              onClick={() => loadPersona('dairy_veto')}
              className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/30 transition-all"
            >
              ⚠️ Dark Zone Veto
            </button>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <form onSubmit={onSubmit} className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Beneficiary Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              {t.applicantName}
            </label>
            <input
              type="text"
              required
              value={formData.beneficiary_name}
              onChange={(e) => updateFormField('beneficiary_name', e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm"
              placeholder="e.g. Smt. Sunita Devi"
            />
          </div>

          {/* Location with Voice Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                {t.location}
              </label>
              <VoiceAssistant
                language={language}
                onVoiceInput={(text) => updateFormField('geographic_location', text)}
              />
            </div>
            <div className="relative">
              <input
                type="text"
                required
                value={formData.geographic_location}
                onChange={(e) => updateFormField('geographic_location', e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm"
                placeholder="e.g. Jodhpur, Rajasthan"
              />
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          {/* Available Margin Capital (10%) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              {t.marginCapital}
            </label>
            <div className="relative">
              <input
                type="number"
                required
                min="1000"
                step="500"
                value={formData.margin_capital}
                onChange={(e) => updateFormField('margin_capital', Number(e.target.value))}
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 font-bold focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm"
                placeholder="14000"
              />
              <IndianRupee className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
            <p className="text-[11px] text-blue-600 font-semibold mt-1">
              {t.marginNote}
            </p>
          </div>

          {/* Target Business Sector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              {t.businessCategory}
            </label>
            <select
              value={formData.business_category}
              onChange={(e) => updateFormField('business_category', e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 font-semibold focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm"
            >
              <option value="Tailoring & Readymade Garments">Tailoring & Readymade Garments</option>
              <option value="Commercial Dairy (10+ Cattle)">Commercial Dairy (10+ Cattle)</option>
              <option value="Mini Flour & Spice Processing Mill">Mini Flour & Spice Processing Mill</option>
              <option value="Mobile Food Cart / Snack Center">Mobile Food Cart / Snack Center</option>
              <option value="Solar & Electrical Appliance Repair">Solar & Electrical Appliance Repair</option>
              <option value="Handloom & Khadi Weaving">Handloom & Khadi Weaving</option>
              <option value="Welding, Fabrication & Farm Tool Repair">Welding, Fabrication & Farm Tool Repair</option>
            </select>
          </div>

          {/* Social Category */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              {t.socialCategory}
            </label>
            <select
              value={formData.social_category}
              onChange={(e) => updateFormField('social_category', e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 font-semibold focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm"
            >
              <option value="Women">Women (-1.0% Subvention)</option>
              <option value="SC">Scheduled Caste (SC) (-1.0% Subvention)</option>
              <option value="ST">Scheduled Tribe (ST) (-1.0% Subvention)</option>
              <option value="PwD">Person with Disability (PwD) (-1.0% Subvention)</option>
              <option value="Transgender">Transgender (-1.0% Subvention)</option>
              <option value="OBC">Other Backward Class (OBC) (-0.5% Subvention)</option>
              <option value="General">General (Standard Base Rate)</option>
            </select>
          </div>

          {/* Land Asset Status */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              {t.landStatus}
            </label>
            <select
              value={formData.land_asset_status}
              onChange={(e) => updateFormField('land_asset_status', e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 font-semibold focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm"
            >
              <option value="Owned">Owned Commercial/Homestead Land</option>
              <option value="Leased">Leased (Registered Agreement)</option>
              <option value="None">None (Mobile/Cart or Unregistered)</option>
            </select>
          </div>

          {/* Founder Experience */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              {t.experience}
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="range"
                min="0"
                max="10"
                value={formData.years_in_industry}
                onChange={(e) => updateFormField('years_in_industry', Number(e.target.value))}
                className="w-full accent-blue-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
              />
              <span className="px-3 py-1 rounded-lg bg-blue-100 text-blue-900 font-extrabold text-sm min-w-[3.5rem] text-center">
                {formData.years_in_industry} Yrs
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {formData.years_in_industry > 2
                ? '⚡ 15% OPEX Competency Discount Active'
                : 'Standard DSDC 30-day onboarding buffer'}
            </p>
          </div>

          {/* Live Mathematical Preview */}
          <div className="md:col-span-2 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-extrabold text-blue-900 uppercase tracking-wider">
                  MoSJE Statutory Equity Sizing
                </span>
              </div>
              <div className="flex items-baseline space-x-3 mt-1">
                <span className="text-xl font-black text-slate-900">
                  Project: ₹{projectCost.toLocaleString()}
                </span>
                <span className="text-sm font-bold text-emerald-700">
                  Loan: ₹{loanEligible.toLocaleString()} (90%)
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-black uppercase ${
                isMicro ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-blue-100 text-blue-800 border border-blue-300'
              }`}>
                {isMicro ? 'Micro Finance Tier (<= ₹1.40L)' : 'Term Loan Tier (> ₹1.40L)'}
              </span>
              <p className="text-[11px] text-slate-600 mt-0.5">
                {isMicro ? '6.5% Base | 3-Mo Moratorium' : '8.0% Base | 6-Mo Moratorium'}
              </p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-4 border-t border-slate-200 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white font-black text-sm tracking-wide shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 transform active:scale-98 transition-all flex items-center justify-center space-x-2.5"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>{t.processing}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>{t.runAssessment}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
