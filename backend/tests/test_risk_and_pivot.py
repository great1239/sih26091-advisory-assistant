"""
Unit tests for 5-Dimensional Risk Engine, CGWB Groundwater Veto, and Strategic Pivots.
"""
import pytest
from app.services.geo_engine import geo_engine
from app.services.risk_engine import risk_engine
from app.services.void_analysis import void_engine
from app.services.pivot_engine import pivot_engine

def test_cgwb_groundwater_dark_zone_veto():
    # Jodhpur is a known CGWB Dark Zone. Commercial Dairy is water-intensive -> Hard Veto
    geo = geo_engine.process_location("Jodhpur, Rajasthan")
    risk_res = risk_engine.evaluate_risks(
        geo=geo,
        business_category="Commercial Dairy (10+ Cattle)",
        margin_capital=100000.0,
        years_experience=1,
        land_status="Owned"
    )
    
    assert risk_res.hard_veto_active is True
    assert "Critical" in risk_res.risk_level
    assert risk_res.water_risk["veto_triggered"] is True
    assert any("CGWB" in v for v in risk_res.veto_reasons)

def test_safe_zone_water_clearance():
    # Varanasi is CGWB Safe zone
    geo = geo_engine.process_location("Varanasi, UP")
    risk_res = risk_engine.evaluate_risks(
        geo=geo,
        business_category="Commercial Dairy (10+ Cattle)",
        margin_capital=100000.0,
        years_experience=1,
        land_status="Owned"
    )
    assert risk_res.water_risk["veto_triggered"] is False
    assert risk_res.hard_veto_active is False

def test_power_stressed_capex_adder():
    # Purnia, Bihar is power stressed -> generator/inverter CAPEX adder
    geo = geo_engine.process_location("Purnia, Bihar")
    risk_res = risk_engine.evaluate_risks(
        geo=geo,
        business_category="Mini Flour & Spice Processing Mill",
        margin_capital=30000.0,
        years_experience=2,
        land_status="Owned"
    )
    assert risk_res.power_risk["is_power_stressed"] is True
    assert risk_res.power_risk["generator_capex_added_inr"] > 0

def test_strategic_pivots_generation():
    geo = geo_engine.process_location("Jodhpur, Rajasthan")
    void_res = void_engine.calculate_void(geo, "Tailoring & Readymade Garments")
    risk_res = risk_engine.evaluate_risks(
        geo=geo,
        business_category="Tailoring & Readymade Garments",
        margin_capital=15000.0,
        years_experience=0,
        land_status="None"
    )
    
    pivots = pivot_engine.generate_pivots(
        original_category="Tailoring & Readymade Garments",
        margin_capital=15000.0,
        land_status="None",
        void_result=void_res,
        risk_result=risk_res
    )
    
    types = [p.pivot_type for p in pivots]
    assert "Sector-Adjacent" in types
    assert "Budget-Driven" in types
    assert "Asset-Driven" in types
