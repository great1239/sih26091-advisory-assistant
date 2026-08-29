import React, { useState, useEffect } from 'react';
import { ShoppingBag, ShieldCheck, Zap, Award, Wrench, CheckCircle2, Search, ExternalLink } from 'lucide-react';
import axios from 'axios';

export default function EquipmentCatalog({ selectedCategory, totalProjectCost }) {
  const [catalog, setCatalog] = useState({});
  const [activeCategory, setActiveCategory] = useState(selectedCategory || 'Tailoring & Readymade Garments');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCatalog() {
      try {
        const res = await axios.get('/api/equipment/catalog');
        setCatalog(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchCatalog();
  }, []);

  const categories = Object.keys(catalog);
  const currentItems = catalog[activeCategory] || [];

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded text-xs font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
              Government e-Marketplace (GeM)
            </span>
            <span className="text-xs text-slate-500">| Certified Machinery Procurement</span>
          </div>
          <h3 className="text-xl font-black text-slate-900 mt-1">
            Certified Equipment Catalog & Machinery Bill of Materials (BOM)
          </h3>
          <p className="text-xs text-slate-600">
            Pre-approved equipment with OEM warranties, power ratings, and GeM item codes itemized directly in the MoSJE Detailed Project Report (DPR).
          </p>
        </div>

        <span className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-800 text-xs font-extrabold border border-blue-200 flex items-center space-x-1.5 flex-shrink-0">
          <ShieldCheck className="w-4 h-4 text-blue-600" />
          <span>GeM Verified Vendors</span>
        </span>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-2 pt-1 border-b border-slate-200 pb-3">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeCategory === cat
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Equipment Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {currentItems.map((item, idx) => (
          <div
            key={idx}
            className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 flex flex-col justify-between hover:border-blue-300 hover:shadow-md transition-all"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-800">
                  {item.gem_item_code}
                </span>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {item.warranty_years} Yrs OEM Warranty
                </span>
              </div>

              <h4 className="text-sm font-black text-slate-900 leading-snug">
                {item.item_name}
              </h4>
              <p className="text-xs font-bold text-blue-700 mt-0.5">
                Manufacturer: {item.manufacturer}
              </p>

              <div className="mt-3 grid grid-cols-2 gap-2 text-xs bg-white p-2.5 rounded-lg border border-slate-200/80">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Power Load</span>
                  <span className="font-bold text-slate-800">{item.power_rating}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Recommended Qty</span>
                  <span className="font-bold text-slate-800">{item.recommended_qty} Units</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold">Unit Price (GeM Rate)</span>
                <span className="text-base font-black text-slate-900">₹{item.unit_price_inr.toLocaleString()}</span>
              </div>

              <span className="text-xs font-bold text-emerald-700 flex items-center space-x-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>Auto-Included in DPR</span>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
