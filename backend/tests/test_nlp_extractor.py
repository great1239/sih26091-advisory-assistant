"""
# COST GUARDRAIL: Free tier only
# Unit tests for Conversational NLP Extraction Service & Multi-Turn Looping Fix
"""
import pytest
from app.services.nlp_extractor import nlp_extractor, ExtractedOnboardingParameters

@pytest.mark.anyio
async def test_full_conversational_extraction_with_location():
    prompt = "I live in rural Haryana, I have ₹15,000 saved, I want to start a dairy, I belong to the OBC category, and I have 5 years working with cattle."
    res = await nlp_extractor.parse_conversational_input(prompt)
    
    assert res.is_complete is True
    p = res.extracted_parameters
    assert p.margin_capital == 15000.0
    assert p.social_category == "OBC"
    assert "Dairy" in p.business_category
    assert p.latitude is not None
    assert p.longitude is not None
    assert p.years_in_industry == 5

@pytest.mark.anyio
async def test_general_store_comma_currency_and_multi_turn_loop_fix():
    """
    Tests: 'i have 10,000 rs and want to setup a general store'
    Verifies:
    1. 10,000 rs is extracted as 10000.0 (no loop)
    2. 'general store' is extracted as Kirana & General Provision Store
    3. Social category 'General' is NOT falsely triggered
    4. Multi-turn completes smoothly when OBC is provided
    """
    # Turn 1: user provides capital + business category
    turn1_input = "i have 10,000 rs and want to setup a general store"
    t1 = await nlp_extractor.parse_conversational_input(turn1_input)

    assert t1.extracted_parameters.margin_capital == 10000.0
    assert "General" in t1.extracted_parameters.business_category or "Kirana" in t1.extracted_parameters.business_category
    assert t1.extracted_parameters.social_category is None  # Must NOT be falsely set to 'General'
    assert t1.is_complete is False
    assert any("Social Category" in m for m in t1.missing_parameters)

    # Turn 2: user provides social category
    turn2_input = "I belong to OBC category in Jodhpur"
    t2 = await nlp_extractor.parse_conversational_input(turn2_input, current_state=t1.extracted_parameters)

    assert t2.is_complete is True
    assert t2.extracted_parameters.margin_capital == 10000.0
    assert "General" in t2.extracted_parameters.business_category or "Kirana" in t2.extracted_parameters.business_category
    assert t2.extracted_parameters.social_category == "OBC"
    assert t2.extracted_parameters.latitude == 26.2389
    assert t2.extracted_parameters.longitude == 73.0243

@pytest.mark.anyio
async def test_pin_drop_coordinate_merging():
    prompt = "I have ₹14,000 saved, I want to start a tailoring unit, Women SC category, 4 years experience."
    res = await nlp_extractor.parse_conversational_input(prompt)
    
    assert res.extracted_parameters.margin_capital == 14000.0
    assert res.extracted_parameters.social_category == "Women"

    pinned_state = res.extracted_parameters
    pinned_state.latitude = 26.2389
    pinned_state.longitude = 73.0243
    pinned_state.geographic_location = "Jodhpur Rural Plot"

    followup = "Confirmed my pin on the map"
    merged = await nlp_extractor.parse_conversational_input(followup, current_state=pinned_state)
    assert merged.is_complete is True
    assert merged.extracted_parameters.latitude == 26.2389
    assert merged.extracted_parameters.longitude == 73.0243
    assert merged.extracted_parameters.margin_capital == 14000.0
