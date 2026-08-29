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
      <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans">
      <Navbar
        language={language}
        setLanguage={setLanguage}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <main className="flex-1 w-full">
        {/* TAB 1: Primary Split-Screen Dashboard */}
        {(activeTab === 'dashboard' || activeTab === 'assessment') && (
          <AppDashboard language={language} />
        )}

        {/* TAB 2: Certified Machinery GeM Catalog */}
        {activeTab === 'equipment' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 animate-fadeIn">
            <EquipmentCatalog
              selectedCategory="Tailoring & Readymade Garments"
              totalProjectCost={140000}
            />
          </div>
        )}

        {/* TAB 3: MoSJE State Channelizing Agency Directory */}
        {activeTab === 'sca' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 animate-fadeIn">
            <SCALocator />
          </div>
        )}

        {/* TAB 4: Gram Panchayat Kiosk Simulator */}
        {activeTab === 'kiosk' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 animate-fadeIn">
            <KioskSimulator
              onSelectKioskProfile={() => setActiveTab('dashboard')}
              language={language}
            />
          </div>
        )}

        {/* TAB 5: Micro-Savings Goal Tracker */}
        {activeTab === 'savings' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 animate-fadeIn">
            <SavingsGoalTracker language={language} />
          </div>
        )}

        {/* TAB 6: Moratorium Lifeline Alerts */}
        {activeTab === 'moratorium' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 animate-fadeIn">
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

      <footer className="bg-white border-t border-slate-200 py-5 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-500 space-y-1">
          <p className="font-extrabold text-slate-700">
            SIH26091 AI-Driven Business Advisory Assistant | Ministry of Social Justice and Empowerment (MoSJE)
          </p>
          <p>
            Split-Screen Dashboard • Native Browser Geolocation (HTML5 / Google Maps) • Live Overpass POIs • 10% Equity Concessional Routing
          </p>
        </div>
      </footer>
    </div>
    </SpeechProvider>
  );
}
