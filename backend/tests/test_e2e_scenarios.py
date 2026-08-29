"""
End-to-End Scenarios Test Suite for SIH26091 Advisory Assistant
Validates Sunita Devi, Rameshwar Prasad, and Dark Zone Veto scenarios.
"""
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "ONLINE"

def test_scenario_sunita_devi_microfinance():
    payload = {
        "beneficiary_name": "Sunita Devi",
        "geographic_location": "Jodhpur, Rajasthan",
        "margin_capital": 14000.0,
        "business_category": "Tailoring & Readymade Garments",
        "social_category": "Women",
        "land_asset_status": "None",
        "years_in_industry": 4,
        "specific_skillsets": ["Pattern Cutting", "Finishing"],
        "preferred_language": "Hindi"
    }
    response = client.post("/api/assess", json=payload)
    assert response.status_code == 200
    data = response.json()
    
    assert data["status"] == "SUCCESS"
    assert data["beneficiary_name"] == "Sunita Devi"
    assert data["financial_structuring"]["total_project_cost"] == 140000.0
    assert data["financial_structuring"]["concessional_loan_eligibility"] == 125000.0 # Capped at 1.25L for micro tier
    assert "Micro Finance" in data["financial_structuring"]["scheme_tier"]
    assert data["financial_structuring"]["final_subvented_interest_rate"] == 5.5 # 6.5% - 1.0% Women subvention
    assert data["financial_structuring"]["moratorium_months"] == 3
    assert data["financial_structuring"]["competency_discount_percent"] == 12.0 # 4 yrs * 3%
    assert len(data["pivot_recommendations"]) >= 2
    assert len(data["moratorium_milestones"]) >= 3
    assert data["dpr_report_available"] is True

def test_scenario_rameshwar_term_loan():
    payload = {
        "beneficiary_name": "Rameshwar Prasad",
        "geographic_location": "Purnia, Bihar",
        "margin_capital": 25000.0,
        "business_category": "Mini Flour & Spice Processing Mill",
        "social_category": "SC",
        "land_asset_status": "Owned",
        "years_in_industry": 2,
        "specific_skillsets": ["Grain Processing"],
        "preferred_language": "Hindi"
    }
    response = client.post("/api/assess", json=payload)
    assert response.status_code == 200
    data = response.json()
    
    assert data["financial_structuring"]["total_project_cost"] == 250000.0
    assert "Term Loan" in data["financial_structuring"]["scheme_tier"]
    assert data["financial_structuring"]["final_subvented_interest_rate"] == 7.0 # 8.0% - 1.0% SC subvention
    assert data["financial_structuring"]["moratorium_months"] == 6
    assert data["risk_assessment"]["power_risk"]["is_power_stressed"] is True
    assert data["risk_assessment"]["power_risk"]["generator_capex_added_inr"] > 0

def test_scenario_dark_zone_water_veto():
    payload = {
        "beneficiary_name": "Kailash Meena",
        "geographic_location": "Jodhpur, Rajasthan",
        "margin_capital": 80000.0,
        "business_category": "Commercial Dairy (10+ Cattle)",
        "social_category": "ST",
        "land_asset_status": "Owned",
        "years_in_industry": 1,
        "specific_skillsets": ["Cattle Care"],
        "preferred_language": "Hindi"
    }
    response = client.post("/api/assess", json=payload)
    assert response.status_code == 200
    data = response.json()
    
    assert data["risk_assessment"]["hard_veto_active"] is True
    assert data["risk_assessment"]["water_risk"]["veto_triggered"] is True
    assert "Critical" in data["risk_assessment"]["risk_level"]
    # Check that sector-adjacent pivot was generated
    assert any(p["pivot_type"] == "Sector-Adjacent" for p in data["pivot_recommendations"])

def test_savings_tracker_endpoint():
    payload = {
        "target_project_cost": 200000.0,
        "current_savings": 5000.0,
        "weekly_savings_capacity": 500.0
    }
    response = client.post("/api/savings-tracker", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["required_margin_capital"] == 20000.0
    assert data["savings_gap_inr"] == 15000.0
    assert data["weeks_to_goal"] == 30

def test_kiosk_tap_endpoint():
    payload = {"rfid_card_uid": "RFID-MOSJE-001"}
    response = client.post("/api/kiosk/tap", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["beneficiary_name"] == "Sunita Devi"
    assert "GRAM PANCHAYAT" in data["thermal_receipt_payload"]
