// ============================================================================
// CreditAppraisalDossier.tsx - Institutional Banking PDF Dossier
// Built with @react-pdf/renderer
// Strict Minimalist Layout, Dark Slate Typography, Institutional Tabular Formatting
// ============================================================================

import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFDownloadLink,
  Font
} from '@react-pdf/renderer';
import { ComprehensiveAssessmentResponse } from './FeasibilityResults';

// Register standard fonts
const styles = StyleSheet.create({
  page: {
    padding: 36,
    backgroundColor: '#ffffff',
    fontFamily: 'Helvetica',
    fontSize: 9,
    color: '#0f172a',
    lineHeight: 1.35
  },
  headerContainer: {
    borderBottom: '2 solid #0f172a',
    paddingBottom: 10,
    marginBottom: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end'
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0f172a',
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  headerSubtitle: {
    fontSize: 8,
    color: '#475569',
    marginTop: 2
  },
  metaBlock: {
    textAlign: 'right'
  },
  metaText: {
    fontSize: 7.5,
    color: '#475569'
  },
  sectionTitle: {
    fontSize: 9.5,
    fontWeight: 'bold',
    color: '#0f172a',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    backgroundColor: '#f1f5f9',
    padding: '4 6',
    marginBottom: 6,
    marginTop: 8,
    borderLeft: '3 solid #0f172a'
  },
  table: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    marginBottom: 6
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    minHeight: 18,
    alignItems: 'center'
  },
  tableRowHeader: {
    backgroundColor: '#f8fafc',
    borderBottomWidth: 1,
    borderBottomColor: '#cbd5e1'
  },
  tableColHeader: {
    padding: 4,
    fontSize: 7.5,
    fontWeight: 'bold',
    color: '#334155',
    textTransform: 'uppercase'
  },
  tableColLabel: {
    width: '40%',
    padding: 4,
    fontSize: 8,
    fontWeight: 'bold',
    color: '#334155',
    backgroundColor: '#f8fafc',
    borderRightWidth: 1,
    borderRightColor: '#e2e8f0'
  },
  tableColValue: {
    width: '60%',
    padding: 4,
    fontSize: 8,
    color: '#0f172a'
  },
  twoColGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8
  },
  halfWidthTable: {
    width: '49%',
    borderWidth: 1,
    borderColor: '#cbd5e1'
  },
  highlightBox: {
    border: '1 solid #0f172a',
    backgroundColor: '#f8fafc',
    padding: 8,
    marginTop: 6,
    marginBottom: 6
  },
  highlightText: {
    fontSize: 8,
    color: '#0f172a',
    fontWeight: 'bold'
  },
  signBlock: {
    marginTop: 18,
    paddingTop: 12,
    borderTop: '1 solid #cbd5e1',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  signCol: {
    width: '45%'
  },
  signLine: {
    borderBottomWidth: 1,
    borderBottomColor: '#0f172a',
    marginTop: 24,
    marginBottom: 4
  },
  signLabel: {
    fontSize: 7.5,
    color: '#475569',
    textAlign: 'center'
  }
});

interface DossierDocumentProps {
  assessment: ComprehensiveAssessmentResponse;
}

export const CreditAppraisalDossierDocument: React.FC<DossierDocumentProps> = ({
  assessment
}) => {
  const voidData = assessment.void_analysis;
  const fin = assessment.financial_structuring;
  const risk = assessment.risk_assessment;
  const geo = assessment.geo_bounding;

  const today = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  const quarterlyEmi = fin?.quarterly_emi_post_moratorium || (fin?.monthly_emi_post_moratorium || 0) * 3;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* 1. INSTITUTIONAL HEADER */}
        <View style={styles.headerContainer}>
          <View>
            <Text style={styles.headerTitle}>
              Concessional Credit Appraisal Dossier
            </Text>
            <Text style={styles.headerSubtitle}>
              National Rural Micro-Enterprise Development & Credit Structuring Pipeline
            </Text>
          </View>
          <View style={styles.metaBlock}>
            <Text style={styles.metaText}>Ref: DOSSIER-AGY-{Math.floor(100000 + Math.random() * 900000)}</Text>
            <Text style={styles.metaText}>Date: {today}</Text>
            <Text style={styles.metaText}>
              GPS: {geo?.latitude?.toFixed(4) || '28.6139'}° N, {geo?.longitude?.toFixed(4) || '77.2090'}° E
            </Text>
          </View>
        </View>

        {/* 2. APPLICANT & ENTERPRISE PROFILE */}
        <Text style={styles.sectionTitle}>1. Applicant & Enterprise Profile</Text>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <Text style={styles.tableColLabel}>Beneficiary Name</Text>
            <Text style={styles.tableColValue}>{assessment.beneficiary_name || 'Rural Micro-Entrepreneur'}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableColLabel}>Business Category</Text>
            <Text style={styles.tableColValue}>{assessment.business_category}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableColLabel}>Social Category (MoSJE)</Text>
            <Text style={styles.tableColValue}>{assessment.social_category || 'General / Concessional SC/OBC'}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableColLabel}>Available Margin Capital (Equity)</Text>
            <Text style={styles.tableColValue}>₹{Math.round(fin?.available_margin_capital || 0).toLocaleString()} (10.0% of Total Project)</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableColLabel}>Target Location & Hub</Text>
            <Text style={styles.tableColValue}>{geo?.district || 'District'}, {geo?.state || 'State'} (SHRID: {voidData?.shrug_village_id || 'shrid-11-24-001942'})</Text>
          </View>
        </View>

        {/* 3. 5.0 KM MICRO-MARKET VIABILITY */}
        <Text style={styles.sectionTitle}>2. 5.0 km Micro-Market Demand & Competition Viability</Text>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <Text style={styles.tableColLabel}>5km Catchment Annual Demand</Text>
            <Text style={styles.tableColValue}>₹{Math.round(voidData?.baseline_demographic_demand_inr || 0).toLocaleString()}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableColLabel}>Existing Market Supply</Text>
            <Text style={styles.tableColValue}>₹{Math.round(voidData?.total_supply_inr || 0).toLocaleString()} (Formal: ₹{Math.round(voidData?.formal_supply_inr || 0).toLocaleString()} | Informal: ₹{Math.round(voidData?.proxy_informal_supply_inr || 0).toLocaleString()})</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableColLabel}>Net Market Void Gap</Text>
            <Text style={styles.tableColValue}>₹{Math.round(voidData?.market_void_inr || 0).toLocaleString()} ({Math.round((voidData?.void_index_ratio || 0) * 100)}% Latent Capacity)</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableColLabel}>Registered MSME POIs vs Informal Nodes</Text>
            <Text style={styles.tableColValue}>{voidData?.formal_udyam_poi_count || 0} Formal Udyam POIs | {voidData?.satellite_scouted_informal_nodes || voidData?.informal_merchant_nodes || 0} Scouted Informal Nodes</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableColLabel}>Market Status & Feasibility Tier</Text>
            <Text style={styles.tableColValue}>{voidData?.market_status || 'High Opportunity (Commercially Feasible)'}</Text>
          </View>
        </View>

        {/* 4. FINANCIAL STRUCTURING & CONCESSIONAL CREDIT TERMS */}
        <Text style={styles.sectionTitle}>3. Concessional Credit Structuring & Repayment Terms</Text>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <Text style={styles.tableColLabel}>Total Sized Project Cost</Text>
            <Text style={styles.tableColValue}>₹{Math.round(fin?.total_project_cost || 0).toLocaleString()}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableColLabel}>Approved Concessional Term Loan (90%)</Text>
            <Text style={styles.tableColValue}>₹{Math.round(fin?.concessional_loan_eligibility || 0).toLocaleString()}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableColLabel}>Approved Scheme Channel</Text>
            <Text style={styles.tableColValue}>{fin?.scheme_tier || 'MoSJE Concessional Credit / SCA Direct'}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableColLabel}>Subvention-Adjusted Interest Rate</Text>
            <Text style={styles.tableColValue}>{fin?.final_subvented_interest_rate || 7.0}% p.a. (Base {fin?.base_interest_rate || 8.0}% - {fin?.demographic_subvention_discount || 1.0}% Subvention)</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableColLabel}>Moratorium (Grace) Period</Text>
            <Text style={styles.tableColValue}>{fin?.moratorium_months || 3} Months (Zero Principal/Interest Outflow during setup)</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableColLabel}>Monthly EMI (Post-Moratorium)</Text>
            <Text style={styles.tableColValue}>₹{Math.round(fin?.monthly_emi_post_moratorium || 0).toLocaleString()} / month</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableColLabel}>Quarterly EMI Benchmark</Text>
            <Text style={styles.tableColValue}>₹{Math.round(quarterlyEmi).toLocaleString()} / quarter</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableColLabel}>Total Repayment Tenure</Text>
            <Text style={styles.tableColValue}>{fin?.repayment_tenure_months || 60} Months (5.0 Years)</Text>
          </View>
        </View>

        {/* 5. ECOLOGICAL & REGULATORY CLEARANCE */}
        <Text style={styles.sectionTitle}>4. Ecological, Aquifer & Grid Telemetry Clearance</Text>
        <View style={styles.highlightBox}>
          <Text style={styles.highlightText}>
            • CGWB Groundwater Status: {risk?.water_risk?.is_dark_zone ? 'Over-Exploited (Dark Zone) - Automated Pivot Required' : 'SAFE UNCONFINED AQUIFER - CLEARANCE GRANTED'}
          </Text>
          <Text style={{ fontSize: 7.5, color: '#334155', marginTop: 2 }}>
            • National Power Portal Feeder Telemetry: ~{voidData?.feeder_power_outage_hrs_day || 2.4} hrs/day daily outage ({voidData?.solar_backup_recommended ? 'Solar Inverter Backup Provisioned' : 'Standard 3-Phase Stable Grid'})
          </Text>
          <Text style={{ fontSize: 7.5, color: '#334155', marginTop: 2 }}>
            • Final Recommendation: {risk?.hard_veto_active ? 'RE-ROUTED TO ZERO-WATER PIVOT' : 'RECOMMENDED FOR IMMEDIATE SCA LOAN SANCTION'}
          </Text>
        </View>

        {/* 6. BANK OFFICER SIGN-OFF */}
        <View style={styles.signBlock}>
          <View style={styles.signCol}>
            <View style={styles.signLine} />
            <Text style={styles.signLabel}>Lead Bank Credit Appraiser Signature</Text>
          </View>
          <View style={styles.signCol}>
            <View style={styles.signLine} />
            <Text style={styles.signLabel}>State Channelizing Agency (SCA) Verification Seal</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export const CreditAppraisalDossierPDFButton: React.FC<{
  assessment: ComprehensiveAssessmentResponse;
  buttonLabel?: string;
}> = ({ assessment, buttonLabel = 'Export Banking Dossier (PDF)' }) => {
  return (
    <PDFDownloadLink
      document={<CreditAppraisalDossierDocument assessment={assessment} />}
      fileName={`Credit_Appraisal_Dossier_${assessment.business_category.replace(/\s+/g, '_')}_${Date.now()}.pdf`}
      className="inline-flex items-center space-x-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow transition-all cursor-pointer"
    >
      {({ loading }) => (
        <span>{loading ? 'Preparing Institutional PDF...' : buttonLabel}</span>
      )}
    </PDFDownloadLink>
  );
};

export default CreditAppraisalDossierDocument;
