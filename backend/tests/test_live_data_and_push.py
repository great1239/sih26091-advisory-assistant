"""
Unit tests for Live Overpass Data Ingestion, CGWB Ecological Query, and PWA Web Push Service.
"""
import pytest
from app.services.data_ingestion_service import data_ingestion_service
from app.services.push_notification_service import push_service

def test_overpass_query_builder():
    query = data_ingestion_service.build_overpass_query(26.15, 72.95, 26.32, 73.10)
    assert "[out:json]" in query
    assert 'node["shop"]' in query
    assert 'node["craft"]' in query
    assert 'node["amenity"~"marketplace|bank|fuel|atm"]' in query
    assert 'way["highway"' in query

@pytest.mark.anyio
async def test_live_cgwb_ecological_query():
    jodhpur_res = await data_ingestion_service.query_live_cgwb_ecological_data("Jodhpur", "Rajasthan")
    assert jodhpur_res["is_dark_zone"] is True
    assert "Over-Exploited" in jodhpur_res["cgwb_classification"]
    assert jodhpur_res["veto_required_for_water_intensive"] is True

    varanasi_res = await data_ingestion_service.query_live_cgwb_ecological_data("Varanasi", "Uttar Pradesh")
    assert varanasi_res["is_dark_zone"] is False
    assert "Safe" in varanasi_res["cgwb_classification"]

def test_push_service_vapid_key():
    public_key = push_service.get_public_key()
    assert len(public_key) > 20
    
    reg_res = push_service.register_subscription(
        "Sunita Devi",
        {
            "endpoint": "https://fcm.googleapis.com/fcm/send/sample-token",
            "keys": {"p256dh": "sample_p256dh", "auth": "sample_auth"}
        }
    )
    assert reg_res["status"] == "SUBSCRIBED"
    assert reg_res["beneficiary_name"] == "Sunita Devi"

    dispatch_res = push_service.send_push_notification("Test Title", "Test Body", "Sunita Devi")
    assert dispatch_res["status"] == "DISPATCH_PROCESSED"
