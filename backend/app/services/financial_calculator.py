"""
Deterministic MoSJE Financial Calculator & Scheme Router
Enforces the strict 10% equity rule, automated scheme tier routing, demographic subventions,
experience-adjusted competency discounts, and quarterly/monthly moratorium amortization schedules.
"""
from typing import List, Dict, Tuple
from app.core.config import settings
from app.models.schemas import FinancialStructuringResult, AmortizationScheduleItem

class FinancialStructuringEngine:
    def calculate_structure(
        self,
        margin_capital: float,
        social_category: str = "General",
        years_experience: int = 0
    ) -> FinancialStructuringResult:
        # 1. MoSJE Deterministic 10% Equity Rule
        total_project_cost = round(margin_capital * 10.0, 2)
        nominal_loan = round(total_project_cost * settings.CONCESSIONAL_LOAN_RATIO, 2)
        
        # 2. Automated Scheme Tier Routing Gate
        if total_project_cost <= settings.MICRO_FINANCE_THRESHOLD:
            scheme_tier = "MoSJE Micro Finance Scheme (Direct Lending / SCA)"
            base_interest_rate = settings.MICRO_FINANCE_BASE_RATE
            tenure_months = settings.MICRO_FINANCE_TENURE_MONTHS
            moratorium_months = settings.MICRO_FINANCE_MORATORIUM_MONTHS
            loan_principal = min(nominal_loan, settings.MICRO_FINANCE_MAX_LOAN)
        elif total_project_cost <= settings.TERM_LOAN_THRESHOLD:
            scheme_tier = "MoSJE Term Loan Concessional Credit Tier"
            base_interest_rate = settings.TERM_LOAN_BASE_RATE
            tenure_months = settings.TERM_LOAN_TENURE_MONTHS
            moratorium_months = settings.TERM_LOAN_MORATORIUM_MONTHS
            loan_principal = min(nominal_loan, settings.TERM_LOAN_MAX_LOAN)
        else:
            scheme_tier = settings.FALLBACK_SCHEME_NAME
            base_interest_rate = settings.FALLBACK_BASE_RATE
            tenure_months = settings.FALLBACK_TENURE_MONTHS
            moratorium_months = settings.FALLBACK_MORATORIUM_MONTHS
            loan_principal = nominal_loan
            
        # 3. Demographic Interest Subvention Logic
        subvention_discount = settings.SUBVENTIONS.get(social_category, 0.0)
        final_interest_rate = max(
            settings.MIN_INTEREST_RATE,
            round(base_interest_rate - subvention_discount, 2)
        )
        
        # 4. Founder Experience Competency Discount (up to 15% reduction in material waste/opex)
        competency_discount_pct = min(years_experience * 3.0, 15.0)
        
        # 5. Amortization Schedule Calculation
        repayment_months = tenure_months - moratorium_months
        monthly_rate = (final_interest_rate / 100.0) / 12.0
        
        # Standard Annuity Formula for Post-Moratorium EMI
        if monthly_rate > 0 and repayment_months > 0:
            monthly_emi = (
                loan_principal
                * monthly_rate
                * ((1.0 + monthly_rate) ** repayment_months)
                / (((1.0 + monthly_rate) ** repayment_months) - 1.0)
            )
        else:
            monthly_emi = loan_principal / max(repayment_months, 1)
            
        monthly_emi = round(monthly_emi, 2)
        quarterly_emi = round(monthly_emi * 3.0, 2)
        
        # Baseline monthly operational estimates
        monthly_estimated_revenue = round((total_project_cost * 0.18), 2)  # ~18% project cost monthly gross revenue
        base_monthly_burn = round((total_project_cost * 0.11), 2)          # ~11% operational burn
        
        # Apply competency discount to burn
        experience_burn_saving = round(base_monthly_burn * (competency_discount_pct / 100.0), 2)
        adjusted_monthly_burn = round(base_monthly_burn - experience_burn_saving, 2)
        annual_competency_savings = round(experience_burn_saving * 12.0, 2)
        
        # Moratorium burn rate
        moratorium_interest_monthly = round(loan_principal * monthly_rate, 2)
        moratorium_total_monthly_burn = round(adjusted_monthly_burn + moratorium_interest_monthly, 2)
        required_runway_buffer = round(moratorium_total_monthly_burn * (moratorium_months + 1), 2)
        
        # Generate Amortization Schedule Table (Quarterly intervals for bank presentation)
        total_quarters = tenure_months // 3
        moratorium_quarters = moratorium_months // 3
        
        schedule: List[AmortizationScheduleItem] = []
        current_principal = loan_principal
        total_interest_subvented = 0.0
        
        for q in range(1, total_quarters + 1):
            is_mora = q <= moratorium_quarters
            period_label = f"Q{q} (M{((q-1)*3)+1}-M{q*3})"
            
            # 3-month quarter calculations
            quarter_interest = 0.0
            quarter_principal_repaid = 0.0
            quarter_emi = 0.0
            
            for m in range(3):
                month_interest = current_principal * monthly_rate
                quarter_interest += month_interest
                
                if not is_mora:
                    month_principal = monthly_emi - month_interest
                    if current_principal - month_principal < 0:
                        month_principal = current_principal
                    current_principal -= month_principal
                    quarter_principal_repaid += month_principal
                    quarter_emi += monthly_emi
                else:
                    # Moratorium: Interest-only payment
                    quarter_emi += month_interest
                    
            total_interest_subvented += quarter_interest
            
            q_revenue = monthly_estimated_revenue * 3.0 if not is_mora else (monthly_estimated_revenue * 0.4 * 3.0)
            q_opex = adjusted_monthly_burn * 3.0
            q_net_cashflow = q_revenue - q_opex - quarter_emi
            
            schedule.append(
                AmortizationScheduleItem(
                    period_number=q,
                    period_label=period_label,
                    is_moratorium=is_mora,
                    beginning_principal=round(current_principal + quarter_principal_repaid, 2),
                    interest_due=round(quarter_interest, 2),
                    principal_repaid=round(quarter_principal_repaid, 2),
                    total_emi=round(quarter_emi, 2),
                    ending_principal=round(max(0.0, current_principal), 2),
                    projected_revenue=round(q_revenue, 2),
                    operating_expenses=round(q_opex, 2),
                    net_operating_cashflow=round(q_net_cashflow, 2)
                )
            )
            
        # Calculate Subvention Savings compared to Base Rate
        base_monthly_rate = (base_interest_rate / 100.0) / 12.0
        if base_monthly_rate > 0 and repayment_months > 0:
            base_emi = (
                loan_principal
                * base_monthly_rate
                * ((1.0 + base_monthly_rate) ** repayment_months)
                / (((1.0 + base_monthly_rate) ** repayment_months) - 1.0)
            )
            total_base_interest = (base_emi * repayment_months) + (loan_principal * base_monthly_rate * moratorium_months) - loan_principal
        else:
            total_base_interest = 0.0
            
        subvention_savings = max(0.0, round(total_base_interest - total_interest_subvented, 2))
        break_even_month = moratorium_months + (2 if competency_discount_pct > 0 else 4)

        return FinancialStructuringResult(
            available_margin_capital=margin_capital,
            total_project_cost=total_project_cost,
            concessional_loan_eligibility=loan_principal,
            scheme_tier=scheme_tier,
            base_interest_rate=base_interest_rate,
            demographic_subvention_discount=subvention_discount,
            final_subvented_interest_rate=final_interest_rate,
            repayment_tenure_months=tenure_months,
            moratorium_months=moratorium_months,
            monthly_emi_post_moratorium=monthly_emi,
            quarterly_emi_post_moratorium=quarterly_emi,
            total_interest_payable=round(total_interest_subvented, 2),
            subvention_savings_inr=subvention_savings,
            competency_discount_percent=competency_discount_pct,
            annual_competency_savings_inr=annual_competency_savings,
            moratorium_burn_rate_monthly=moratorium_total_monthly_burn,
            required_runway_buffer_inr=required_runway_buffer,
            break_even_month=break_even_month,
            amortization_schedule=schedule
        )

financial_engine = FinancialStructuringEngine()
