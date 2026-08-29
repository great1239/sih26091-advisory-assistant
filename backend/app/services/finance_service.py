"""
MoSJE Deterministic Financial Router Service (finance_service.py)
Strict mathematical execution for MoSJE concessional credit guidelines.
No LLM hallucination permitted in financial calculations.
"""
from typing import Dict, List, Any, Optional

class FinanceService:
    # Scheme thresholds
    MICRO_FINANCE_LIMIT = 140000.0      # ₹1.40 Lakh
    TERM_LOAN_LIMIT = 5000000.0         # ₹50.00 Lakh
    MICRO_MAX_LOAN = 125000.0           # ₹1.25 Lakh
    TERM_MAX_LOAN = 4500000.0           # ₹45.00 Lakh
    
    # Subvention eligible categories (-1.0% p.a. discount)
    SUBVENTION_CATEGORIES = {"Women", "SC", "PwD", "ST", "Transgender", "Safai Karamchari"}

    def calculate_financial_plan(
        self,
        margin_capital: float,
        social_category: str = "General",
        industry_experience: int = 0
    ) -> Dict[str, Any]:
        # 1. Deterministic Core Math
        total_project_cost = round(margin_capital * 10.0, 2)
        nominal_loan = round(total_project_cost * 0.90, 2)
        
        # 2. Scheme Routing Gate
        if total_project_cost <= self.MICRO_FINANCE_LIMIT:
            scheme_tier = "Micro Finance"
            base_rate = 6.5
            tenure_months = 36         # 3 Years
            moratorium_months = 3      # 3 Months Grace
            loan_eligibility = min(nominal_loan, self.MICRO_MAX_LOAN)
        elif total_project_cost <= self.TERM_LOAN_LIMIT:
            scheme_tier = "Term Loan"
            base_rate = 8.0
            tenure_months = 84         # 7 Years
            moratorium_months = 6      # 6 Months Grace
            loan_eligibility = min(nominal_loan, self.TERM_MAX_LOAN)
        else:
            scheme_tier = "Fallback scheme required (PMEGP/MUDRA)"
            base_rate = 9.5
            tenure_months = 84
            moratorium_months = 6
            loan_eligibility = nominal_loan

        # 3. Demographic Subvention Logic
        subvention_discount = 1.0 if social_category in self.SUBVENTION_CATEGORIES else 0.0
        final_interest_rate = max(4.0, round(base_rate - subvention_discount, 2))

        # 4. Experience Competency Discount (15% reduction to OPEX if experience > 2 years)
        competency_discount_pct = 15.0 if industry_experience > 2 else 0.0
        base_monthly_burn = round(total_project_cost * 0.10, 2)
        adjusted_monthly_burn = round(base_monthly_burn * (1.0 - (competency_discount_pct / 100.0)), 2)

        # 5. Amortization Schedule (Principal delayed by Moratorium length)
        repayment_months = tenure_months - moratorium_months
        monthly_rate = (final_interest_rate / 100.0) / 12.0
        
        # Standard French Annuity for Post-Moratorium EMI
        if monthly_rate > 0 and repayment_months > 0:
            monthly_emi = (
                loan_eligibility
                * monthly_rate
                * ((1.0 + monthly_rate) ** repayment_months)
                / (((1.0 + monthly_rate) ** repayment_months) - 1.0)
            )
        else:
            monthly_emi = loan_eligibility / max(repayment_months, 1)

        monthly_emi = round(monthly_emi, 2)
        quarterly_emi = round(monthly_emi * 3.0, 2)

        # Quarterly Amortization Breakdown Table
        schedule = []
        current_balance = loan_eligibility
        total_quarters = tenure_months // 3
        moratorium_quarters = moratorium_months // 3

        for q in range(1, total_quarters + 1):
            is_mora = q <= moratorium_quarters
            q_interest = 0.0
            q_principal = 0.0
            q_emi = 0.0

            for _ in range(3):
                m_interest = current_balance * monthly_rate
                q_interest += m_interest

                if not is_mora:
                    m_principal = monthly_emi - m_interest
                    if current_balance - m_principal < 0:
                        m_principal = current_balance
                    current_balance -= m_principal
                    q_principal += m_principal
                    q_emi += monthly_emi
                else:
                    # Moratorium: Zero principal repayment, interest-only grace
                    q_emi += m_interest

            schedule.append({
                "period": f"Quarter {q} (M{((q-1)*3)+1}-M{q*3})",
                "is_moratorium": is_mora,
                "beginning_principal": round(current_balance + q_principal, 2),
                "interest_due": round(q_interest, 2),
                "principal_repaid": round(q_principal, 2),
                "total_emi": round(q_emi, 2),
                "ending_principal": round(max(0.0, current_balance), 2),
                "operating_burn": round(adjusted_monthly_burn * 3.0, 2)
            })

        return {
            "available_margin_capital": margin_capital,
            "total_project_cost": total_project_cost,
            "loan_eligibility": loan_eligibility,
            "scheme_tier": scheme_tier,
            "base_interest_rate": base_rate,
            "subvention_discount": subvention_discount,
            "final_interest_rate": final_interest_rate,
            "repayment_tenure_months": tenure_months,
            "moratorium_months": moratorium_months,
            "monthly_emi": monthly_emi,
            "quarterly_emi": quarterly_emi,
            "competency_discount_percent": competency_discount_pct,
            "adjusted_monthly_burn": adjusted_monthly_burn,
            "amortization_schedule": schedule
        }

finance_service = FinanceService()
