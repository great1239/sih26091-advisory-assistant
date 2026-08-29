"""
Unit tests for ReportLab MoSJE Detailed Project Report (DPR) PDF generation.
"""
import os
import pytest
from app.services.geo_engine import geo_engine
from app.services.void_analysis import void_engine
from app.services.risk_engine import risk_engine
from app.services.financial_calculator import financial_engine
from app.services.pivot_engine import pivot_engine
from app.services.moratorium_engine import moratorium_engine
from app.services.dpr_generator import dpr_generator
from app.models.schemas import AssessmentResponse

def test_dpr_pdf_creation():
    geo = geo_engine.process_location("Salem, Tamil Nadu")
    void_res = void_engine.calculate_void(geo, "Tailoring & Readymade Garments")
    risk_res = risk_engine.evaluate_risks(geo, "Tailoring & Readymade Garments", 12000.0, 3, "Owned")
    fin_res = financial_engine.calculate_structure(12000.0, "Women", 3)
    swot = pivot_engine.generate_swot("Tailoring & Readymade Garments", 3, "Women", void_res, risk_res, "Owned")
    pivots = pivot_engine.generate_pivots("Tailoring & Readymade Garments", 12000.0, "Owned", void_res, risk_res)
    nudges = moratorium_engine.generate_nudges("Kavitha Devi", "Tailoring & Readymade Garments", fin_res.quarterly_emi_post_moratorium, fin_res.monthly_emi_post_moratorium, fin_res.moratorium_months)
    
    assessment = AssessmentResponse(
        status="SUCCESS",
        beneficiary_name="Kavitha Devi",
        social_category="Women",
        geographic_location="Salem, Tamil Nadu",
        business_category="Tailoring & Readymade Garments",
        geo_bounding=geo,
        void_analysis=void_res,
        risk_assessment=risk_res,
        financial_structuring=fin_res,
        swot_analysis=swot,
        pivot_recommendations=pivots,
        moratorium_milestones=nudges,
        dpr_report_available=True,
        summary_audio_text="Test Audio"
    )
    
    pdf_path = dpr_generator.generate_dpr_pdf(assessment, "test_kavitha_dpr.pdf")
    
    assert os.path.exists(pdf_path)
    assert os.path.getsize(pdf_path) > 1000  # Generated valid PDF file > 1KB
