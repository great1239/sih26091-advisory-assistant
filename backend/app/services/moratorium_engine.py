"""
Moratorium Survival Engine (Post-Disbursement Advisory Lifeline)
Generates dialect-native pre-scheduled WhatsApp / SMS nudges and operational checklists
to eliminate enterprise mortality during the critical 3-to-6 month grace period.
"""
from typing import List, Dict, Any
from app.models.schemas import MoratoriumNudge

class MoratoriumSurvivalEngine:
    def generate_nudges(
        self,
        beneficiary_name: str,
        business_category: str,
        quarterly_emi: float,
        monthly_emi: float,
        moratorium_months: int,
        preferred_language: str = "Hindi"
    ) -> List[MoratoriumNudge]:
        nudges: List[MoratoriumNudge] = []
        
        # Day 15: Post-Disbursement Equipment Setup
        nudges.append(
            MoratoriumNudge(
                nudge_id="ndg-d15",
                day_milestone=15,
                period_title="Day 15: Capital Deployment & Vendor Onboarding",
                hindi_message=f"नमस्ते {beneficiary_name} जी! ऋण राशि से उपकरण खरीद और वेंडर बिल सुरक्षित रखें। राज्य चैनलाइजिंग एजेंसी (SCA) ऑडिट हेतु सभी GST/पक्की रसीदें फाइल करें।",
                english_message=f"Greetings {beneficiary_name}! Ensure all equipment purchases and vendor invoices are securely filed for the State Channelizing Agency (SCA) audit.",
                regional_message=f"வணக்கம் {beneficiary_name}! உங்கள் உபகரண ரசீதுகளை பாதுகாப்பாக வைக்கவும்." if preferred_language == "Tamil" else None,
                checklist=[
                    "Verify machine delivery and serial warranty cards",
                    "Submit disbursement utilization voucher to District SCA Officer",
                    "Establish secondary raw material supplier terms"
                ],
                criticality="Normal",
                status="Scheduled"
            )
        )

        # Day 30: Trial Production & Digital Payments Setup
        nudges.append(
            MoratoriumNudge(
                nudge_id="ndg-d30",
                day_milestone=30,
                period_title="Day 30: Trial Run & Digital QR Activation",
                hindi_message=f"पहला महीना पूर्ण: क्या आपकी उत्पादन यूनिट चालू है? अपनी दुकान पर 4G साउंडबॉक्स / UPI QR लगाएं ताकि आपका डिजिटल क्रेडिट स्कोर मजबूत हो सके।",
                english_message=f"Month 1 Check: Is trial production live? Activate your dual-SIM UPI soundbox to establish a digital transaction trail for future credit expansion.",
                checklist=[
                    "Conduct test production batch and quality inspection",
                    "Display merchant UPI QR code and soundbox at counter",
                    "Record daily cash inflows in physical/digital ledger"
                ],
                criticality="Normal",
                status="Scheduled"
            )
        )

        # Day 60: Runway Check & Working Capital Audit
        nudges.append(
            MoratoriumNudge(
                nudge_id="ndg-d60",
                day_milestone=60,
                period_title="Day 60: Working Capital & Break-even Review",
                hindi_message=f"सावधान {beneficiary_name} जी! मोराटोरियम के 2 महीने बीत चुके हैं। क्या आपकी मासिक परिचालन लागत (OPEX) बजट के अनुसार है? फालतू खर्च रोकें।",
                english_message=f"Attention {beneficiary_name}! 60 days into your grace period. Audit your monthly operating burn against your initial financial blueprint.",
                checklist=[
                    "Calculate net operating margin on monthly sales",
                    "Verify minimum working capital buffer for the next 60 days",
                    "Review customer repeat rate and weekly haat orders"
                ],
                criticality="High",
                status="Scheduled"
            )
        )

        # Day 90: Moratorium Expiry (For 3-Month Micro Finance) or Mid-Term Check
        if moratorium_months == 3:
            nudges.append(
                MoratoriumNudge(
                    nudge_id="ndg-d90",
                    day_milestone=90,
                    period_title="Day 90: Moratorium Concluded - First EMI Readiness",
                    hindi_message=f"महत्वपूर्ण: आपकी 3 महीने की ग्रेस अवधि समाप्त हो रही है। आपकी पहली मासिक EMI ₹{monthly_emi:,.0f} (या त्रैमासिक ₹{quarterly_emi:,.0f}) 15 दिनों में देय है। बैंक खाते में राशि सुनिश्चित करें।",
                    english_message=f"CRITICAL: 3-month moratorium concludes. Your first EMI of ₹{monthly_emi:,.0f} (or Quarterly ₹{quarterly_emi:,.0f}) is due in 15 days. Fund your bank account to protect your CIBIL score.",
                    checklist=[
                        f"Ensure minimum balance of ₹{monthly_emi:,.0f} in bank account for auto-debit (NACH)",
                        "Collect pending client receivables from local mandi",
                        "Confirm bank NACH mandate clearance with branch manager"
                    ],
                    criticality="Urgent",
                    status="Scheduled"
                )
            )
        else:
            # For 6-month term loans
            nudges.append(
                MoratoriumNudge(
                    nudge_id="ndg-d90",
                    day_milestone=90,
                    period_title="Day 90: Halfway Grace Milestone - Production Scaling",
                    hindi_message=f"{beneficiary_name} जी, 6 माह के मोराटोरियम का आधा समय पूरा हुआ। अब आपकी मासिक बिक्री से लाभ निकलना शुरू होना चाहिए।",
                    english_message=f"{beneficiary_name}, halfway through your 6-month moratorium. Focus on securing long-term institutional buyers and advance orders.",
                    checklist=[
                        "Secure at least 3 institutional or bulk commercial contracts",
                        "Optimize raw material waste reduction",
                        "Set aside 20% of net margin into a dedicated EMI sinking reserve"
                    ],
                    criticality="Normal",
                    status="Scheduled"
                )
            )
            
            # Day 150: 30 Days before Term Loan EMI
            nudges.append(
                MoratoriumNudge(
                    nudge_id="ndg-d150",
                    day_milestone=150,
                    period_title="Day 150: 30-Day EMI Warning & Account Funding",
                    hindi_message=f"अति आवश्यक: आपका 6 महीने का मोराटोरियम 30 दिनों में समाप्त होगा। पहली बड़ी EMI ₹{monthly_emi:,.0f} अगले महीने कटेगी। रिपेमेंट रिजर्व अलग रखें।",
                    english_message=f"URGENT: 6-month grace period ends in 30 days. First major EMI of ₹{monthly_emi:,.0f} (Quarterly ₹{quarterly_emi:,.0f}) will be debited. Verify repayment sinking reserve.",
                    checklist=[
                        f"Deposit ₹{quarterly_emi:,.0f} into dedicated SCA loan repayment escrow account",
                        "Review cash flow buffer with local Panchayat Business Sakhi",
                        "Confirm bank auto-debit standing instructions"
                    ],
                    criticality="Urgent",
                    status="Scheduled"
                )
            )

        return nudges

moratorium_engine = MoratoriumSurvivalEngine()
