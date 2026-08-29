import React from 'react';
import { Landmark, Sparkles, ShieldCheck, Laptop, ShoppingBag, Building2, MessageSquare, Target } from 'lucide-react';
import { translations } from '../translations';

export default function Navbar({ language, setLanguage, activeTab, setActiveTab }) {
  const t = translations[language] || translations.English;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & MoSJE Branding */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('assessment')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-sky-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg text-slate-900 tracking-tight">SIH26091</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                  MoSJE Mandate
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium hidden sm:block">
                AI Business Advisory & Concessional Credit Engine
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden lg:flex items-center space-x-1">
            <button
              onClick={() => setActiveTab('assessment')}
              className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'assessment'
                  ? 'bg-blue-50 text-blue-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Feasibility & Schemes
            </button>
            <button
              onClick={() => setActiveTab('equipment')}
              className={`px-3 py-2 rounded-lg text-xs font-bold flex items-center space-x-1 transition-all ${
                activeTab === 'equipment'
                  ? 'bg-blue-50 text-blue-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5 text-blue-600" />
              <span>Machinery (GeM)</span>
            </button>
            <button
              onClick={() => setActiveTab('sca')}
              className={`px-3 py-2 rounded-lg text-xs font-bold flex items-center space-x-1 transition-all ${
                activeTab === 'sca'
                  ? 'bg-blue-50 text-blue-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-indigo-600" />
              <span>SCA Directory</span>
            </button>
            <button
              onClick={() => setActiveTab('kiosk')}
              className={`px-3 py-2 rounded-lg text-xs font-bold flex items-center space-x-1 transition-all ${
                activeTab === 'kiosk'
                  ? 'bg-blue-50 text-blue-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Laptop className="w-3.5 h-3.5 text-emerald-600" />
              <span>Panchayat Kiosk</span>
            </button>
            <button
              onClick={() => setActiveTab('savings')}
              className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'savings'
                  ? 'bg-blue-50 text-blue-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Savings Tracker
            </button>
            <button
              onClick={() => setActiveTab('moratorium')}
              className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'moratorium'
                  ? 'bg-blue-50 text-blue-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Moratorium Lifeline
            </button>
          </nav>

          {/* Language Selector */}
          <div className="flex items-center space-x-2">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="text-xs font-black bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl px-3 py-1.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs transition-all cursor-pointer"
            >
              <option value="English">🇬🇧 English</option>
              <option value="Hindi">🇮🇳 हिन्दी (Hindi)</option>
              <option value="Bengali">🇮🇳 বাংলা (Bengali)</option>
              <option value="Telugu">🇮🇳 తెలుగు (Telugu)</option>
              <option value="Marathi">🇮🇳 मराठी (Marathi)</option>
              <option value="Tamil">🇮🇳 தமிழ் (Tamil)</option>
              <option value="Gujarati">🇮🇳 ગુજરાતી (Gujarati)</option>
              <option value="Kannada">🇮🇳 ಕನ್ನಡ (Kannada)</option>
              <option value="Malayalam">🇮🇳 മലയാളം (Malayalam)</option>
              <option value="Punjabi">🇮🇳 ਪੰਜਾਬੀ (Punjabi)</option>
              <option value="Odia">🇮🇳 ଓଡ଼ିଆ (Odia)</option>
              <option value="Assamese">🇮🇳 অসমীয়া (Assamese)</option>
              <option value="Urdu">🇮🇳 اردو (Urdu)</option>
            </select>
          </div>
        </div>
      </div>
    </header>
  );
}
