import React from 'react';
import { Landmark, ShoppingBag, Building2, Terminal, Target, Clock, Globe } from 'lucide-react';
import { useSpeech } from '../context/SpeechContext';

export default function Navbar({ language, setLanguage, activeTab, setActiveTab }) {
  const { currentLanguage, setLanguage: setSpeechLanguage, t } = useSpeech();

  const handleLanguageChange = (e) => {
    const selected = e.target.value;
    setLanguage(selected);
    const langCodeMap = {
      English: 'en-US',
      Hindi: 'hi-IN',
      Bengali: 'bn-IN',
      Telugu: 'te-IN',
      Marathi: 'mr-IN',
      Tamil: 'ta-IN',
      Gujarati: 'gu-IN',
      Kannada: 'kn-IN',
      Malayalam: 'ml-IN',
      Punjabi: 'pa-IN',
      Odia: 'or-IN',
      Assamese: 'as-IN',
      Urdu: 'ur-IN'
    };
    if (langCodeMap[selected]) {
      setSpeechLanguage(langCodeMap[selected]);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Institutional Header & Logo */}
          <div
            className="flex items-center space-x-3 cursor-pointer select-none"
            onClick={() => setActiveTab('assessment')}
          >
            <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white">
              <Landmark className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-sm text-slate-900 tracking-tight">
                  MoSJE Advisory System
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                  SIH26091
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                National Rural Enterprise Feasibility & Concessional Credit Appraisal
              </p>
            </div>
          </div>

          {/* Operational Module Tabs */}
          <nav className="hidden lg:flex items-center space-x-1">
            <button
              onClick={() => setActiveTab('assessment')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'assessment' || activeTab === 'dashboard'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Appraisal Workstation
            </button>
            <button
              onClick={() => setActiveTab('equipment')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors ${
                activeTab === 'equipment'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>GeM Machinery</span>
            </button>
            <button
              onClick={() => setActiveTab('sca')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors ${
                activeTab === 'sca'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>SCA Directory</span>
            </button>
            <button
              onClick={() => setActiveTab('kiosk')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors ${
                activeTab === 'kiosk'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Kiosk Node</span>
            </button>
            <button
              onClick={() => setActiveTab('savings')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors ${
                activeTab === 'savings'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Target className="w-3.5 h-3.5" />
              <span>Equity Accumulator</span>
            </button>
            <button
              onClick={() => setActiveTab('moratorium')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors ${
                activeTab === 'moratorium'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Moratorium Ledger</span>
            </button>
          </nav>

          {/* Institutional Language & Node Status */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1">
              <Globe className="w-3.5 h-3.5 text-slate-500" />
              <select
                value={language}
                onChange={handleLanguageChange}
                className="bg-transparent text-xs font-semibold text-slate-700 outline-none cursor-pointer"
              >
                <option value="English">English</option>
                <option value="Hindi">हिंदी (Hindi)</option>
                <option value="Bengali">বাংলা (Bengali)</option>
                <option value="Telugu">తెలుగు (Telugu)</option>
                <option value="Marathi">मराठी (Marathi)</option>
                <option value="Tamil">தமிழ் (Tamil)</option>
                <option value="Gujarati">ગુજરાતી (Gujarati)</option>
                <option value="Kannada">ಕನ್ನಡ (Kannada)</option>
                <option value="Malayalam">മലയാളം (Malayalam)</option>
                <option value="Punjabi">ਪੰਜਾਬੀ (Punjabi)</option>
                <option value="Odia">ଓଡ଼ିଆ (Odia)</option>
                <option value="Assamese">অসমীয়া (Assamese)</option>
                <option value="Urdu">اردو (Urdu)</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
