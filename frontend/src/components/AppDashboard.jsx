import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Building2,
  QrCode,
  RotateCcw,
  Map as MapIcon,
  Crosshair,
  FileCheck,
  CreditCard,
  FileDown
} from 'lucide-react';
import axios from 'axios';
import confetti from 'canvas-confetti';
import FieldVerificationConsole from './FieldVerificationConsole';
import LiveLocationMap from './LiveLocationMap';
import PaymentQRModal from './PaymentQRModal';
import FeasibilityResults from './FeasibilityResults';
import { CreditAppraisalDossierPDFButton } from './CreditAppraisalDossier';

export default function AppDashboard({ language }) {
  const [assessment, setAssessment] = useState(null);
  const [selectedCoords, setSelectedCoords] = useState({ lat: 28.6139, lng: 77.2090 });
  const [activeCockpitView, setActiveCockpitView] = useState('map'); // 'map' | 'analysis'
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);

  // When user selects location on Map
  const handleLocationSelect = (loc, maybeLng) => {
    if (!loc) return;
    let lat = 28.6139;
    let lng = 77.2090;

    if (typeof loc === 'object') {
      lat = loc.latitude ?? loc.lat ?? 28.6139;
      lng = loc.longitude ?? loc.lng ?? 77.2090;
    } else if (typeof loc === 'number' || !isNaN(parseFloat(loc))) {
      lat = parseFloat(loc);
      lng = maybeLng !== undefined ? parseFloat(maybeLng) : 77.2090;
    }

    setSelectedCoords({
      lat: typeof lat === 'number' && !isNaN(lat) ? lat : 28.6139,
      lng: typeof lng === 'number' && !isNaN(lng) ? lng : 77.2090
    });
  };

  // When field verification engine extracts and completes assessment
  const handleAssessmentUpdate = (newAssessment) => {
    setAssessment(newAssessment);
    setActiveCockpitView('analysis');
  };

  const handleApplyPivot = (pivot) => {
    if (!pivot) return;
    // Re-evaluate assessment with sector pivot
    axios
      .post('/api/assess', {
        latitude: selectedCoords.lat,
        longitude: selectedCoords.lng,
        geographic_location: assessment?.geographic_location || 'Selected Map Plot',
        margin_capital: assessment?.financial_structuring?.available_margin_capital || 25000,
        business_category: pivot.recommended_category || pivot.title,
        social_category: assessment?.social_category || 'General',
        years_in_industry: 2
      })
      .then((res) => {
        setAssessment(res.data);
        setActiveCockpitView('analysis');
      })
      .catch((err) => console.error('[Pivot Application Error]', err));
  };

  const handleDownloadDPR = () => {
    if (!assessment) return;
    confetti({ particleCount: 50, spread: 60 });
    const safeName = (assessment?.beneficiary_name || 'Beneficiary').replace(/ /g, '_').replace(/\./g, '');
    const url = `/api/dpr/download/${safeName}`;
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `MoSJE_DPR_${safeName}.pdf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReset = () => {
    setAssessment(null);
    setActiveCockpitView('map');
  };

  const fin = assessment?.financial_structuring;
  const voidData = assessment?.void_analysis;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-4 font-sans text-slate-800">
      {/* 1. INSTITUTIONAL TOP WORKSTATION CONTROL BAR */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-institutional flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
              NATIONAL APPRAISAL WORKSTATION
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              GPS: {selectedCoords.lat.toFixed(4)}°N, {selectedCoords.lng.toFixed(4)}°E
            </span>
          </div>

          <h1 className="text-base font-bold text-slate-900 tracking-tight mt-1">
            {assessment
              ? `${assessment?.beneficiary_name || 'Beneficiary'} • ${assessment?.business_category}`
              : 'Rural Micro-Enterprise Appraisal & Credit Structuring'}
          </h1>
          <p className="text-[11px] text-slate-500">
            5.0 km micro-market radius catchment • MoSJE concessional credit eligibility benchmark
          </p>
        </div>

        {/* Workstation Actions */}
        <div className="flex items-center space-x-2 shrink-0">
          <button
            type="button"
            onClick={() => setActiveCockpitView(activeCockpitView === 'map' ? 'analysis' : 'map')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border flex items-center space-x-1.5 transition-colors ${
              activeCockpitView === 'analysis'
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
            }`}
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span>{activeCockpitView === 'map' ? 'Switch to Dossier' : 'Switch to Evidence Map'}</span>
          </button>

          {assessment && fin && (
            <>
              <button
                type="button"
                onClick={() => setIsQRModalOpen(true)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white flex items-center space-x-1 transition-colors"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span className="font-mono">Deposit 10% Margin (₹{Math.round(fin.available_margin_capital || 0).toLocaleString()})</span>
              </button>

              <CreditAppraisalDossierPDFButton
                assessment={assessment}
                buttonLabel="PDF Dossier"
              />
            </>
          )}

          {assessment && (
            <button
              type="button"
              onClick={handleReset}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              title="Reset Workstation"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 2. MAIN SPLIT-SCREEN WORKSTATION GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* LEFT COLUMN (5 of 12 Cols): Field Verification Console */}
        <div className="lg:col-span-5 sticky top-18">
          <FieldVerificationConsole
            onAssessmentComplete={handleAssessmentUpdate}
            selectedCoords={selectedCoords}
            onLocationChange={handleLocationSelect}
          />
        </div>

        {/* RIGHT COLUMN (7 of 12 Cols): Geospatial & Evidence Cockpit */}
        <div className="lg:col-span-7 space-y-4">
          {/* VIEW 1: Spatial Evidence Roadmap */}
          {(!assessment || activeCockpitView === 'map') && (
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-institutional space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <div className="p-1 rounded bg-slate-100 text-slate-700">
                    <Crosshair className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-bold text-xs text-slate-900 block">
                      Geospatial Evidence & Competitor Pin-Drop
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Center-point coordinates define the 5.0 km micro-market radius
                    </span>
                  </div>
                </div>

                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-50 text-slate-700 border border-slate-200">
                  {selectedCoords.lat.toFixed(4)}, {selectedCoords.lng.toFixed(4)}
                </span>
              </div>

              {/* Map View Box */}
              <div className="h-[680px] rounded-lg overflow-hidden border border-slate-200">
                <LiveLocationMap
                  onLocationSelect={handleLocationSelect}
                  initialCoords={selectedCoords}
                  competitorPins={voidData?.scouted_competitor_pins || []}
                />
              </div>
            </div>
          )}

          {/* VIEW 2: Institutional Analytical Dossier */}
          {assessment && activeCockpitView === 'analysis' && (
            <div className="space-y-4">
              <FeasibilityResults
                assessment={assessment}
                onApplyPivot={handleApplyPivot}
                onGenerateDPR={handleDownloadDPR}
              />
            </div>
          )}
        </div>
      </div>

      {/* Margin Equity Deposit Modal */}
      {fin && (
        <PaymentQRModal
          isOpen={isQRModalOpen}
          onClose={() => setIsQRModalOpen(false)}
          amount={fin?.available_margin_capital || 14000}
          beneficiaryName={assessment?.beneficiary_name}
        />
      )}
    </div>
  );
}
