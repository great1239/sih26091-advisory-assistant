"""
Unit tests for MoSJE Financial Calculator, Equity Rule, Scheme Routing, Subventions, and Amortization.
"""
import pytest
from app.services.financial_calculator import financial_engine
from app.core.config import settings

def test_micro_finance_tier_routing():
    # Margin: ₹12,000 -> Total Project Cost: ₹1,20,000 (<= ₹1.40L)
    res = financial_engine.calculate_structure(margin_capital=12000.0, social_category="General", years_experience=0)
    
    assert res.total_project_cost == 120000.0
    assert res.concessional_loan_eligibility == 108000.0  # 90%
    assert "Micro Finance" in res.scheme_tier
    assert res.base_interest_rate == 6.5
    assert res.repayment_tenure_months == 36
    assert res.moratorium_months == 3
    assert res.final_subvented_interest_rate == 6.5
    assert len(res.amortization_schedule) == 12  # 36 / 3 = 12 quarters
    assert res.amortization_schedule[0].is_moratorium is True
    assert res.amortization_schedule[0].principal_repaid == 0.0

def test_term_loan_tier_routing():
    # Margin: ₹2,00,000 -> Total Project Cost: ₹20,00,000 (> ₹1.40L and <= ₹50L)
    res = financial_engine.calculate_structure(margin_capital=200000.0, social_category="General", years_experience=0)
    
    assert res.total_project_cost == 2000000.0
    assert res.concessional_loan_eligibility == 1800000.0 # 90%
    assert "Term Loan" in res.scheme_tier
    assert res.base_interest_rate == 8.0
    assert res.repayment_tenure_months == 84
    assert res.moratorium_months == 6
    assert len(res.amortization_schedule) == 28  # 84 / 3 = 28 quarters
    assert res.amortization_schedule[0].is_moratorium is True
    assert res.amortization_schedule[1].is_moratorium is True
    assert res.amortization_schedule[2].is_moratorium is False

def test_demographic_subventions():
    # Women category: -1.0% subvention
    res_women = financial_engine.calculate_structure(margin_capital=12000.0, social_category="Women", years_experience=0)
    assert res_women.final_subvented_interest_rate == 5.5  # 6.5% - 1.0%
    assert res_women.subvention_savings_inr > 0

    # SC category: -1.0% subvention
    res_sc = financial_engine.calculate_structure(margin_capital=200000.0, social_category="SC", years_experience=0)
    assert res_sc.final_subvented_interest_rate == 7.0   # 8.0% - 1.0%
    assert res_sc.subvention_savings_inr > 0

    # Safai Karamchari category: -1.5% subvention
    res_sk = financial_engine.calculate_structure(margin_capital=200000.0, social_category="Safai Karamchari", years_experience=0)
    assert res_sk.final_subvented_interest_rate == 6.5   # 8.0% - 1.5%

def test_founder_experience_discount():
    # 5 years experience gives 15% competency discount on waste/burn
    res_exp = financial_engine.calculate_structure(margin_capital=50000.0, social_category="General", years_experience=5)
    assert res_exp.competency_discount_percent == 15.0
    assert res_exp.annual_competency_savings_inr > 0

def test_pmeqp_fallback_routing():
    # Margin: ₹6,00,000 -> Total Project Cost: ₹60,00,000 (> ₹50L)
    res = financial_engine.calculate_structure(margin_capital=600000.0, social_category="General", years_experience=0)
    assert "Fallback" in res.scheme_tier
    assert res.base_interest_rate == 9.5
