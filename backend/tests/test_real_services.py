"""
Unit tests for real product and service integrations:
- GeM Equipment Catalog
- NPCI UPI QR code generator
- MoSJE SCA State Directory
- WhatsApp Cloud Dispatch
"""
import pytest
from app.services.equipment_catalog import equipment_service
from app.services.payment_gateway import payment_service
from app.services.sca_directory import sca_service
from app.services.whatsapp_service import whatsapp_service

def test_gem_equipment_catalog():
    items = equipment_service.get_equipment_for_sector("Tailoring & Readymade Garments", 140000.0)
    assert len(items) >= 2
    assert any("Juki" in item["item_name"] for item in items)
    assert any(item["gem_item_code"].startswith("GEM/") for item in items)
    assert sum(item["total_price_inr"] for item in items) <= 140000.0 * 1.2

def test_npci_upi_qr_generation():
    res = payment_service.generate_upi_qr(14000.0, "Sunita Devi")
    assert res["vpa"] == "mosje.escrow@sbi"
    assert res["amount_inr"] == 14000.0
    assert res["qr_base64"].startswith("data:image/png;base64,")
    assert "upi://pay" in res["upi_uri"]

def test_sca_directory_lookup():
    rajasthan_sca = sca_service.get_sca_by_state("Rajasthan")
    assert "Jaipur" in rajasthan_sca["head_office"]
    assert "NSFDC" in rajasthan_sca["corporations"]
    assert "+91-141" in rajasthan_sca["helpline_phone"]

    bihar_sca = sca_service.get_sca_by_state("Bihar")
    assert "Patna" in bihar_sca["head_office"]
    assert "NBCFDC" in bihar_sca["corporations"]

@pytest.mark.anyio
async def test_whatsapp_cloud_dispatch():
    res = await whatsapp_service.send_moratorium_nudge(
        recipient_phone="9876543210",
        beneficiary_name="Sunita Devi",
        nudge_title="Day 15 Check",
        nudge_message="Please keep vendor bills safe",
        quarterly_emi=4500.0
    )
    assert res["status"] in ["SIMULATED_DISPATCH_SUCCESS", "DISPATCHED_LIVE"]
    assert res["recipient"].endswith("9876543210")
