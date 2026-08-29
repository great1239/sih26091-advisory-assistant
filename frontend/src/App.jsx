import React, { useState } from 'react';
import Navbar from './components/Navbar';
import AppDashboard from './components/AppDashboard';
import EquipmentCatalog from './components/EquipmentCatalog';
import SCALocator from './components/SCALocator';
import KioskSimulator from './components/KioskSimulator';
import SavingsGoalTracker from './components/SavingsGoalTracker';
import MoratoriumLifeline from './components/MoratoriumLifeline';
import { SpeechProvider } from './context/SpeechContext';

export default function App() {
  const [language, setLanguage] = useState('English');
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <SpeechProvider initialLanguage="en-US">
      <div className="min-h-screen bg-[#FBFBFA] text-slate-900 flex flex-col font-sans">
        <Navbar
          language={language}
          setLanguage={setLanguage}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

        <main className="flex-1 w-full">
          {/* TAB 1: Primary Split-Screen Workstation */}
          {(activeTab === 'dashboard' || activeTab === 'assessment') && (
            <AppDashboard language={language} />
          )}

          {/* TAB 2: Certified Machinery GeM Catalog */}
          {activeTab === 'equipment' && (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <EquipmentCatalog
                selectedCategory="Tailoring & Readymade Garments"
                totalProjectCost={140000}
              />
            </div>
          )}

          {/* TAB 3: MoSJE State Channelizing Agency Directory */}
          {activeTab === 'sca' && (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <SCALocator />
            </div>
          )}

          {/* TAB 4: Gram Panchayat Kiosk Simulator */}
          {activeTab === 'kiosk' && (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <KioskSimulator
                onSelectKioskProfile={() => setActiveTab('dashboard')}
                language={language}
              />
            </div>
          )}

          {/* TAB 5: Micro-Savings Goal Tracker */}
          {activeTab === 'savings' && (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <SavingsGoalTracker language={language} />
            </div>
          )}

          {/* TAB 6: Moratorium Lifeline Alerts */}
          {activeTab === 'moratorium' && (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <MoratoriumLifeline
                milestones={[
                  {
                    nudge_id: "mora-01",
                    day_milestone: 15,
                    period_title: "Day 15: Vendor Invoices & Machinery Sourcing Verification",
                    hindi_message: "नमस्ते! अपने GeM कोटेशन और मशीनरी रसीदों को संभाल कर रखें।",
                    english_message: "Ensure all machinery procurement receipts from GeM are archived.",
                    criticality: "Normal",
                    checklist: ["Verify machinery delivery status", "Inspect power connection"]
                  },
                  {
                    nudge_id: "mora-02",
                    day_milestone: 60,
                    period_title: "Day 60: Working Capital Runway & NACH Mandate Readiness",
                    hindi_message: "मोराटोरियम समाप्त होने से पहले अपने बैंक खाते में NACH ई-मैंडेट बैलेंस सुनिश्चित करें।",
                    english_message: "Check your NACH e-mandate registration for post-grace EMI auto-debit.",
                    criticality: "Urgent",
                    checklist: ["Confirm NACH auto-debit active", "Maintain 1-month EMI liquidity"]
                  }
                ]}
                beneficiaryName="Beneficiary"
                language={language}
              />
            </div>
          )}
        </main>

        <footer className="bg-white border-t border-slate-200 py-4 mt-8">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
            <p className="font-semibold text-slate-700">
              Ministry of Social Justice and Empowerment (MoSJE) • National Rural Enterprise Appraisal System (SIH26091)
            </p>
            <p className="font-mono text-slate-400">
              5.0km Catchment Telemetry • CGWB Safe Aquifer Index • NBCFDC / NSFDC Direct
            </p>
          </div>
        </footer>
      </div>
    </SpeechProvider>
  );
}
