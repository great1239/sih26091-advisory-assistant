import React, { useState } from 'react';
import { CreditCard, Printer, Sparkles, CheckCircle2, RefreshCw, Smartphone, Laptop } from 'lucide-react';
import confetti from 'canvas-confetti';
import { tapKioskRFID } from '../services/api';
import { translations } from '../translations';

export default function KioskSimulator({ onSelectKioskProfile, language }) {
  const [selectedCard, setSelectedCard] = useState('RFID-MOSJE-001');
  const [kioskData, setKioskData] = useState(null);
  const [tapping, setTapping] = useState(false);
  const [printed, setPrinted] = useState(false);

  const t = translations[language] || translations.English;

  const handleTap = async (cardUid) => {
    setTapping(true);
    setPrinted(false);
    setSelectedCard(cardUid);

    setTimeout(async () => {
      const res = await tapKioskRFID(cardUid);
      setKioskData(res);
      setTapping(false);
      setPrinted(true);
      confetti({ particleCount: 60, spread: 50 });
    }, 800);
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
      <div>
        <div className="flex items-center space-x-2">
          <span className="px-2.5 py-0.5 rounded text-xs font-black uppercase tracking-wider bg-indigo-100 text-indigo-800 border border-indigo-200">
            Physical-Digital Bridge
          </span>
          <span className="text-xs text-slate-500">| Gram Panchayat Station Hardware Emulator</span>
        </div>
        <h3 className="text-xl font-black text-slate-900 mt-1">
          {t.kioskMode} & Beneficiary Smart Card Terminal
        </h3>
        <p className="text-xs text-slate-600">
          Simulates the live Arduino Uno C++ hardware station deployed at Gram Panchayat centers for rural beneficiaries without smartphones.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Card Selection & RFID Sensor */}
        <div className="lg:col-span-6 space-y-4">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-500">
            1. Select Demonstration RFID Smart Card:
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { id: 'RFID-MOSJE-001', name: 'Sunita Devi', role: 'Women / SC', margin: '₹14,000' },
              { id: 'RFID-MOSJE-002', name: 'Rameshwar', role: 'SC', margin: '₹25,000' },
              { id: 'RFID-MOSJE-003', name: 'Kavitha M.', role: 'Women / OBC', margin: '₹12,000' },
            ].map((c) => (
              <div
                key={c.id}
                onClick={() => handleTap(c.id)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  selectedCard === c.id
                    ? 'bg-blue-50 border-blue-500 shadow-md ring-2 ring-blue-400/20'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <CreditCard className={`w-4 h-4 ${selectedCard === c.id ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span className="text-[10px] font-mono font-bold text-slate-500">{c.id.slice(-3)}</span>
                </div>
                <p className="text-xs font-black text-slate-900">{c.name}</p>
                <p className="text-[10px] text-slate-500 font-semibold">{c.role}</p>
                <p className="text-[11px] font-extrabold text-blue-700 mt-1">{c.margin}</p>
              </div>
            ))}
          </div>

          {/* Virtual RFID Sensor Pad */}
          <div
            onClick={() => handleTap(selectedCard)}
            className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-2 ${
              tapping
                ? 'bg-emerald-50 border-emerald-500 animate-pulse'
                : 'bg-slate-900 border-slate-700 text-white hover:border-blue-400'
            }`}
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              tapping ? 'bg-emerald-500 text-white' : 'bg-blue-600/30 text-blue-400'
            }`}>
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-slate-200">
                {tapping ? 'Reading MFRC522 Smart Card...' : 'Tap RFID Badge on Sensor'}
              </p>
              <span className="text-[10px] text-slate-400">
                Simulates SPI RC522 Card Read @ 13.56 MHz
              </span>
            </div>
          </div>

          {/* Virtual 16x2 LCD Matrix Display */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-emerald-400 text-xs shadow-inner">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">
              Virtual LCD1602 (I2C: 0x27):
            </span>
            <div className="bg-emerald-950/60 p-2.5 rounded border border-emerald-800/60 leading-relaxed">
              <div>&gt; {kioskData ? `${kioskData.beneficiary_name.slice(0, 16)}` : 'MoSJE KIOSK v1.0'}</div>
              <div>&gt; {kioskData ? `Loan: Rs.${(kioskData.margin_capital * 9).toLocaleString()}` : 'READY: TAP CARD'}</div>
            </div>
          </div>
        </div>

        {/* Right: Thermal Printer Receipt Output */}
        <div className="lg:col-span-6 bg-slate-100 rounded-2xl p-4 border border-slate-300 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-300">
              <div className="flex items-center space-x-2">
                <Printer className="w-4 h-4 text-slate-700" />
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                  Thermal Printer Output (Adafruit ESC/POS)
                </h4>
              </div>
              <span className="text-[10px] font-mono bg-slate-200 px-2 py-0.5 rounded text-slate-700">
                TTL Serial 9600 Baud
              </span>
            </div>

            {/* Receipt Paper Simulation */}
            <div className="mt-3 bg-white p-4 rounded-lg shadow-sm border border-slate-200 font-mono text-[11px] text-slate-900 whitespace-pre-wrap leading-tight">
              {kioskData ? (
                kioskData.thermal_receipt_payload
              ) : (
                <div className="text-slate-400 text-center py-10 font-sans text-xs">
                  Tap an RFID card on the left to print a physical MoSJE Concessional Credit Receipt!
                </div>
              )}
            </div>
          </div>

          {/* Action button to load this into main wizard */}
          {kioskData && (
            <div className="mt-4 pt-3 border-t border-slate-300 flex justify-end">
              <button
                type="button"
                onClick={() => onSelectKioskProfile && onSelectKioskProfile({
                  beneficiary_name: kioskData.beneficiary_name,
                  social_category: kioskData.social_category.includes('SC') ? 'SC' : 'Women',
                  geographic_location: `${kioskData.registered_district}, India`,
                  margin_capital: kioskData.margin_capital,
                  business_category: kioskData.preferred_category,
                  years_in_industry: kioskData.years_experience
                })}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center space-x-1.5 shadow-sm transition-all"
              >
                <span>Load Profile into Full Advisory Engine</span>
                <Sparkles className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
