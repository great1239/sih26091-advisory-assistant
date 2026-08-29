import React, { useState, useEffect } from 'react';
import { Building2, Phone, MapPin, ExternalLink, ShieldCheck, Search, Users } from 'lucide-react';
import axios from 'axios';

export default function SCALocator() {
  const [scaList, setScaList] = useState({});
  const [selectedState, setSelectedState] = useState('Rajasthan');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSCAs() {
      try {
        const res = await axios.get('/api/sca/directory');
        setScaList(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchSCAs();
  }, []);

  const states = Object.keys(scaList);
  const activeSCA = scaList[selectedState] || {};

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded text-xs font-black uppercase tracking-wider bg-blue-100 text-blue-800 border border-blue-200">
              Direct Application Gate
            </span>
            <span className="text-xs text-slate-500">| MoSJE State Channelizing Agencies</span>
          </div>
          <h3 className="text-xl font-black text-slate-900 mt-1">
            State Channelizing Agency (SCA) Directory & Helplines
          </h3>
          <p className="text-xs text-slate-600">
            Submit your Detailed Project Report (DPR) directly to your state nodal channelizing agency (NBCFDC, NSFDC, NSKFDC) for priority loan disbursement.
          </p>
        </div>

        <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-extrabold border border-emerald-200 flex items-center space-x-1.5 flex-shrink-0">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Verified Government SCAs</span>
        </span>
      </div>

      {/* State Selector */}
      <div className="flex flex-wrap gap-2 pt-1 border-b border-slate-200 pb-3">
        {states.map((st) => (
          <button
            key={st}
            type="button"
            onClick={() => setSelectedState(st)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedState === st
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Active SCA Card */}
      {activeSCA.state && (
        <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 text-white rounded-2xl p-6 shadow-xl border border-blue-900/50 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[11px] font-bold text-blue-300 uppercase tracking-wider">
                State Nodal Disbursement Authority
              </span>
              <h4 className="text-lg font-black text-white mt-0.5">
                {activeSCA.sca_name}
              </h4>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {activeSCA.corporations?.map((corp) => (
                <span key={corp} className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-blue-500/30 text-blue-200 border border-blue-400/30">
                  {corp}
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-slate-800 text-xs">
            <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700">
              <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Head Office Address</span>
              <p className="text-slate-200 font-medium leading-relaxed">{activeSCA.head_office}</p>
            </div>

            <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700">
              <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Nodal Contact & Helpline</span>
              <p className="text-white font-bold">{activeSCA.nodal_officer}</p>
              <p className="text-emerald-400 font-bold mt-1 flex items-center space-x-1">
                <Phone className="w-3.5 h-3.5" />
                <span>{activeSCA.helpline_phone}</span>
              </p>
            </div>

            <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700 flex flex-col justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Online Application Portal</span>
                <p className="text-blue-300 font-mono text-[11px] truncate">{activeSCA.portal_url}</p>
              </div>

              <a
                href={activeSCA.portal_url}
                target="_blank"
                rel="noreferrer"
                className="mt-3 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center space-x-1.5 transition-all"
              >
                <span>Visit Official Portal</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
