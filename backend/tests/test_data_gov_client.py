"""
Unit & Integration Tests for data.gov.in Client (data_gov_client.py)
Tests schema inspection, filtered querying, 24-hour caching, and Void Analysis integration.
"""
import pytest
from app.services.data_gov_client import data_gov_client, DataGovClient

@pytest.mark.anyio
async def test_get_dataset_fields_metadata():
    """Test 2(a): Metadata inspection of dataset schema fields"""
    resource_id = DataGovClient.RESOURCE_AGMARKNET_MANDI
    fields = await data_gov_client.get_dataset_fields(resource_id)
    
    assert isinstance(fields, list)
    if fields:
        field_names = [f["name"] for f in fields]
        assert any("state" in f.lower() for f in field_names)
        assert any("commodity" in f.lower() or "market" in f.lower() for f in field_names)

@pytest.mark.anyio
async def test_query_dataset_with_filters_and_caching():
    """Test 2(b) & 3: Filtered query and 24-hour caching layer"""
    resource_id = DataGovClient.RESOURCE_AGMARKNET_MANDI
    filters = {"state": "Rajasthan"}

    # 1. Initial network query
    res1 = await data_gov_client.query_dataset(
        resource_id=resource_id,
        filters=filters,
        limit=3
    )
    assert res1["status"] == "SUCCESS"
    assert "records" in res1
    assert len(res1["records"]) <= 3

    # 2. Subsequent call must be served from 24h cache
    res2 = await data_gov_client.query_dataset(
        resource_id=resource_id,
        filters=filters,
        limit=3
    )
    assert res2["status"] == "SUCCESS"
    assert len(res2["records"]) == len(res1["records"])

@pytest.mark.anyio
async def test_void_analysis_economic_enrichment():
    """Test 4: Integration with Void Analysis Module"""
    enrichment = await data_gov_client.enrich_void_analysis_demographics(
        district="Jodhpur",
        state="Rajasthan",
        business_category="Mini Flour & Spice Processing Mill"
    )
    assert enrichment["data_gov_in_connected"] is True
    assert enrichment["district_economic_anchor"] == "Jodhpur"
    assert enrichment["benchmark_raw_material_price_inr_per_qtl"] > 0
    assert "Active (24h Cache)" in enrichment["cached_ttl_status"]
