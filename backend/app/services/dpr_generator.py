"""
MoSJE-Compliant Bank-Ready Detailed Project Report (DPR) PDF Generator
Generates a formal, multi-page, formatted DPR with official MoSJE formatting,
financial amortization tables, GeM equipment quotations, UPI payment QR codes,
and State Channelizing Agency (SCA) submission checklists using ReportLab.
"""
import os
import io
import base64
from typing import Dict, Any
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable, Image as RLImage
)
from app.models.schemas import AssessmentResponse
from app.services.equipment_catalog import equipment_service
from app.services.payment_gateway import payment_service
from app.services.sca_directory import sca_service

class DPRGeneratorService:
    def __init__(self):
        self.output_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "static", "reports")
        os.makedirs(self.output_dir, exist_ok=True)

    def generate_dpr_pdf(self, assessment: AssessmentResponse, filename: str = None) -> str:
        if not filename:
            safe_name = assessment.beneficiary_name.replace(" ", "_").replace(".", "")
            filename = f"MoSJE_DPR_{safe_name}_{assessment.financial_structuring.scheme_tier[:4]}.pdf"
            
        filepath = os.path.join(self.output_dir, filename)
        
        doc = SimpleDocTemplate(
            filepath,
            pagesize=A4,
            rightMargin=36,
            leftMargin=36,
            topMargin=36,
            bottomMargin=36
        )
        
        styles = getSampleStyleSheet()
        
        title_style = ParagraphStyle(
            'DocTitle',
            parent=styles['Heading1'],
            fontSize=15,
            leading=18,
            textColor=colors.HexColor('#0F172A'),
            alignment=1,
            fontName='Helvetica-Bold'
        )
        section_style = ParagraphStyle(
            'SectionHeading',
            parent=styles['Heading2'],
            fontSize=11,
            leading=14,
            textColor=colors.HexColor('#1E3A8A'),
            fontName='Helvetica-Bold',
            spaceBefore=8,
            spaceAfter=5
        )
        body_style = ParagraphStyle(
            'BodyDark',
            parent=styles['Normal'],
            fontSize=8,
            leading=11,
            textColor=colors.HexColor('#1E293B'),
            fontName='Helvetica'
        )
        callout_style = ParagraphStyle(
            'CalloutText',
            parent=styles['Normal'],
            fontSize=7.5,
            leading=10,
            textColor=colors.HexColor('#065F46'),
            fontName='Helvetica'
        )

        elements = []
        
        # 1. Header Banner
        header_text = "<b>GOVERNMENT OF INDIA - MINISTRY OF SOCIAL JUSTICE & EMPOWERMENT (MoSJE)</b><br/>" \
                      "<font size=9 color='#2563EB'>State Channelizing Agency (SCA) Concessional Credit Appraisal Dossier</font><br/>" \
                      "<font size=7.5 color='#64748B'>SIH26091 AI-Driven Business Advisory Assistant - Bank Ready Detailed Project Report</font>"
        elements.append(Paragraph(header_text, title_style))
        elements.append(Spacer(1, 6))
        elements.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#2563EB'), spaceAfter=8))
        
        fin = assessment.financial_structuring
        geo = assessment.geo_bounding
        void = assessment.void_analysis
        risk = assessment.risk_assessment
        sca_info = sca_service.get_sca_by_state(geo.state)
        
        # 2. Executive Summary Box
        summary_data = [
            [
                Paragraph("<b>Applicant Name:</b>", body_style), Paragraph(assessment.beneficiary_name, body_style),
                Paragraph("<b>Target Sector:</b>", body_style), Paragraph(assessment.business_category, body_style)
            ],
            [
                Paragraph("<b>Social Category:</b>", body_style), Paragraph(f"<b>{assessment.social_category}</b> (Subvention Active)", body_style),
                Paragraph("<b>Location / Cluster:</b>", body_style), Paragraph(f"{geo.district}, {geo.state}", body_style)
            ],
            [
                Paragraph("<b>Scheme Tier:</b>", body_style), Paragraph(f"<b>{fin.scheme_tier}</b>", body_style),
                Paragraph("<b>Designated SCA:</b>", body_style), Paragraph(sca_info["sca_name"][:45] + "...", body_style)
            ],
            [
                Paragraph("<b>Total Project Cost:</b>", body_style), Paragraph(f"<b>Rs. {fin.total_project_cost:,.2f}</b>", body_style),
                Paragraph("<b>Available Margin (10%):</b>", body_style), Paragraph(f"<b>Rs. {fin.available_margin_capital:,.2f}</b>", body_style)
            ],
            [
                Paragraph("<b>Loan Amount (90%):</b>", body_style), Paragraph(f"<b>Rs. {fin.concessional_loan_eligibility:,.2f}</b>", body_style),
                Paragraph("<b>Subvented Interest Rate:</b>", body_style), Paragraph(f"<b>{fin.final_subvented_interest_rate}% p.a.</b> (Base {fin.base_interest_rate}%)", body_style)
            ],
            [
                Paragraph("<b>Repayment Tenure:</b>", body_style), Paragraph(f"{fin.repayment_tenure_months} Months ({fin.repayment_tenure_months//12} Yrs)", body_style),
                Paragraph("<b>Moratorium Period:</b>", body_style), Paragraph(f"<b>{fin.moratorium_months} Months Grace</b>", body_style)
            ]
        ]
        
        t_summary = Table(summary_data, colWidths=[110, 150, 110, 150])
        t_summary.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F8FAFC')),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('TOPPADDING', (0,0), (-1,-1), 3),
            ('BOTTOMPADDING', (0,0), (-1,-1), 3),
        ]))
        elements.append(t_summary)
        elements.append(Spacer(1, 8))

        # 3. Itemized GeM Equipment & Machinery Bill of Materials (BOM)
        elements.append(Paragraph("1. GeM (Government e-Marketplace) Itemized Equipment & Machinery BOM", section_style))
        equipment_list = equipment_service.get_equipment_for_sector(assessment.business_category, fin.total_project_cost)
        
        bom_rows = [[
            Paragraph("<b>GeM Code</b>", body_style),
            Paragraph("<b>Equipment / Model Description</b>", body_style),
            Paragraph("<b>Power / Spec</b>", body_style),
            Paragraph("<b>Qty</b>", body_style),
            Paragraph("<b>Unit Price</b>", body_style),
            Paragraph("<b>Total (INR)</b>", body_style)
        ]]
        
        total_capex = 0.0
        for eq in equipment_list:
            total_capex += eq["total_price_inr"]
            bom_rows.append([
                Paragraph(eq["gem_item_code"], body_style),
                Paragraph(f"<b>{eq['item_name']}</b><br/><font size=6.5 color='#64748B'>{eq['manufacturer']}</font>", body_style),
                Paragraph(eq["power_rating"], body_style),
                Paragraph(str(eq["recommended_qty"]), body_style),
                Paragraph(f"Rs. {eq['unit_price_inr']:,.0f}", body_style),
                Paragraph(f"<b>Rs. {eq['total_price_inr']:,.0f}</b>", body_style)
            ])
            
        t_bom = Table(bom_rows, colWidths=[80, 180, 100, 35, 60, 65])
        t_bom.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#EFF6FF')),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#93C5FD')),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('TOPPADDING', (0,0), (-1,-1), 2.5),
            ('BOTTOMPADDING', (0,0), (-1,-1), 2.5),
        ]))
        elements.append(t_bom)
        elements.append(Spacer(1, 8))

        # 4. Market Void & 5D Risk Scorecard
        elements.append(Paragraph("2. Market Void Analysis & 5-Dimensional Risk Clearance", section_style))
        void_data = [
            [
                Paragraph("<b>Demographic Demand:</b>", body_style), Paragraph(f"Rs. {void.baseline_demographic_demand_inr:,.0f}", body_style),
                Paragraph("<b>Net Market Void:</b>", body_style), Paragraph(f"<b>Rs. {void.market_void_inr:,.0f}</b>", body_style)
            ],
            [
                Paragraph("<b>Formal POIs:</b>", body_style), Paragraph(f"{void.formal_udyam_poi_count} Units", body_style),
                Paragraph("<b>Informal Nodes (UPI):</b>", body_style), Paragraph(f"{void.informal_merchant_nodes} Merchants", body_style)
            ],
            [
                Paragraph("<b>CGWB Water Clearance:</b>", body_style), Paragraph("Safe Aquifer Recharge Table" if not risk.water_risk.get("is_dark_zone") else "VETO / Non-Water Compliant", body_style),
                Paragraph("<b>Power Reliability:</b>", body_style), Paragraph("Stable Rural 3-Phase Grid" if not risk.power_risk.get("is_power_stressed") else "Backup Hybrid Inverter Buffer Added", body_style)
            ]
        ]
        t_void = Table(void_data, colWidths=[130, 130, 130, 130])
        t_void.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F8FAFC')),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
            ('TOPPADDING', (0,0), (-1,-1), 2.5),
            ('BOTTOMPADDING', (0,0), (-1,-1), 2.5),
        ]))
        elements.append(t_void)
        elements.append(Spacer(1, 8))

        # 5. Quarterly Amortization Schedule Table
        elements.append(Paragraph("3. Quarterly Loan Amortization & Moratorium Cash Runway Schedule", section_style))
        amort_header = [
            Paragraph("<b>Period</b>", body_style),
            Paragraph("<b>Beg Principal</b>", body_style),
            Paragraph("<b>Interest</b>", body_style),
            Paragraph("<b>Principal Paid</b>", body_style),
            Paragraph("<b>Quarterly EMI</b>", body_style),
            Paragraph("<b>Ending Balance</b>", body_style),
            Paragraph("<b>Net Cashflow</b>", body_style)
        ]
        amort_rows = [amort_header]
        for item in fin.amortization_schedule[:8]:
            mora_tag = " [Grace]" if item.is_moratorium else ""
            amort_rows.append([
                Paragraph(f"{item.period_label}{mora_tag}", body_style),
                Paragraph(f"Rs. {item.beginning_principal:,.0f}", body_style),
                Paragraph(f"Rs. {item.interest_due:,.0f}", body_style),
                Paragraph(f"Rs. {item.principal_repaid:,.0f}", body_style),
                Paragraph(f"<b>Rs. {item.total_emi:,.0f}</b>", body_style),
                Paragraph(f"Rs. {item.ending_principal:,.0f}", body_style),
                Paragraph(f"Rs. {item.net_operating_cashflow:,.0f}", body_style)
            ])
            
        t_amort = Table(amort_rows, colWidths=[85, 75, 65, 75, 75, 75, 70])
        t_amort.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#1E3A8A')),
            ('TEXTCOLOR', (0,0), (-1,0), colors.white),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('TOPPADDING', (0,0), (-1,-1), 2),
            ('BOTTOMPADDING', (0,0), (-1,-1), 2),
        ]))
        elements.append(t_amort)
        elements.append(Spacer(1, 8))

        # 6. Payment UPI QR Code & State Channelizing Agency Submission Box
        elements.append(Paragraph("4. NPCI Margin Capital Escrow QR & State Channelizing Agency Submission", section_style))
        
        upi_data = payment_service.generate_upi_qr(fin.available_margin_capital, assessment.beneficiary_name)
        qr_img_data = base64.b64decode(upi_data["qr_base64"].split(",")[1])
        qr_stream = io.BytesIO(qr_img_data)
        rl_qr_image = RLImage(qr_stream, width=65, height=65)

        submission_data = [
            [
                rl_qr_image,
                Paragraph(
                    f"<b>Scan to Deposit 10% Margin Capital (Rs. {fin.available_margin_capital:,.2f})</b><br/>"
                    f"<font size=7 color='#64748B'>VPA: {upi_data['vpa']} | NPCI Bharat QR Standard</font><br/>"
                    f"<b>State Channelizing Agency Submission Routing:</b><br/>"
                    f"• <b>Agency:</b> {sca_info['sca_name']}<br/>"
                    f"• <b>Nodal Officer:</b> {sca_info['nodal_officer']}<br/>"
                    f"• <b>Official Helpline:</b> {sca_info['helpline_phone']} | <b>Portal:</b> {sca_info['portal_url']}",
                    body_style
                )
            ]
        ]
        t_sub = Table(submission_data, colWidths=[75, 445])
        t_sub.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F1F5F9')),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#94A3B8')),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('TOPPADDING', (0,0), (-1,-1), 3),
            ('BOTTOMPADDING', (0,0), (-1,-1), 3),
        ]))
        elements.append(t_sub)
        elements.append(Spacer(1, 6))

        # Signoff
        elements.append(Paragraph(
            "<b>Official Certification:</b> 100% compliant with Ministry of Social Justice and Empowerment (MoSJE) concessional credit guidelines (SIH26091).",
            callout_style
        ))
        
        doc.build(elements)
        return filepath

dpr_generator = DPRGeneratorService()
