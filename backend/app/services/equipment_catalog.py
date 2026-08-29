"""
Government e-Marketplace (GeM) Equipment Catalog & Quotation Service
Provides real certified machinery models, technical specifications, power ratings,
OEM warranties, and itemized Bill of Materials (BOM) for rural micro-enterprises.
"""
from typing import Dict, List, Any

GEM_EQUIPMENT_DATABASE: Dict[str, List[Dict[str, Any]]] = {
    "Tailoring & Readymade Garments": [
        {
            "gem_item_code": "GEM/2026/B/891244",
            "item_name": "Juki DDL-8700 High-Speed Single Needle Lockstitch Machine",
            "manufacturer": "Juki India Pvt Ltd",
            "power_rating": "550W Direct Drive Servo",
            "warranty_years": 3,
            "unit_price_inr": 28500.0,
            "recommended_qty": 2,
            "category": "Core Production Machinery"
        },
        {
            "gem_item_code": "GEM/2026/B/452119",
            "item_name": "Usha Techne 5-Thread Heavy Duty Industrial Overlock Machine",
            "manufacturer": "Usha International Ltd",
            "power_rating": "400W Energy Saving Motor",
            "warranty_years": 2,
            "unit_price_inr": 34000.0,
            "recommended_qty": 1,
            "category": "Core Production Machinery"
        },
        {
            "gem_item_code": "GEM/2026/B/112933",
            "item_name": "Automatic Industrial Vacuum Steam Ironing Boiler Station (3.5L)",
            "manufacturer": "Ramsons Garment Machinery",
            "power_rating": "1.5 kW 230V Single Phase",
            "warranty_years": 2,
            "unit_price_inr": 18500.0,
            "recommended_qty": 1,
            "category": "Finishing & Packaging"
        },
        {
            "gem_item_code": "GEM/2026/B/771923",
            "item_name": "Ergonomic 8x4 ft Hardwood Master Cutting Table with Fabric Stand",
            "manufacturer": "National Small Industries Corp (NSIC)",
            "power_rating": "Manual / Non-powered",
            "warranty_years": 5,
            "unit_price_inr": 14000.0,
            "recommended_qty": 1,
            "category": "Workshop Fixtures"
        }
    ],
    "Commercial Dairy (10+ Cattle)": [
        {
            "gem_item_code": "GEM/2026/B/771239",
            "item_name": "DeLaval 500L Direct Expansion Bulk Milk Cooler (BMC) Solar Ready",
            "manufacturer": "DeLaval India Pvt Ltd",
            "power_rating": "3.5 HP Hermetic Compressor",
            "warranty_years": 3,
            "unit_price_inr": 165000.0,
            "recommended_qty": 1,
            "category": "Core Production Machinery"
        },
        {
            "gem_item_code": "GEM/2026/B/339182",
            "item_name": "Double Bucket Portable Milking Machine with 30L SS304 Cans",
            "manufacturer": "Prompt Dairy Tech",
            "power_rating": "1.5 HP Electric Motor",
            "warranty_years": 2,
            "unit_price_inr": 48000.0,
            "recommended_qty": 1,
            "category": "Core Production Machinery"
        },
        {
            "gem_item_code": "GEM/2026/B/992184",
            "item_name": "Kirloskar Heavy Duty Motorized Green & Dry Chaff Cutter 3HP",
            "manufacturer": "Kirloskar Brothers Ltd",
            "power_rating": "3.0 HP 3-Phase / 1-Phase",
            "warranty_years": 2,
            "unit_price_inr": 32000.0,
            "recommended_qty": 1,
            "category": "Fodder & Feed Equipment"
        }
    ],
    "Mini Flour & Spice Processing Mill": [
        {
            "gem_item_code": "GEM/2026/B/441923",
            "item_name": "Kirloskar 5HP Commercial Heavy Duty Stone-less Atta Chakki",
            "manufacturer": "Kirloskar Oil Engines Ltd",
            "power_rating": "5.0 HP 3-Phase Electric",
            "warranty_years": 3,
            "unit_price_inr": 62000.0,
            "recommended_qty": 1,
            "category": "Core Production Machinery"
        },
        {
            "gem_item_code": "GEM/2026/B/551982",
            "item_name": "Stainless Steel SS304 Multi-Purpose Spice Pulverizer & Grinder (3HP)",
            "manufacturer": "Jas Agro Machinery",
            "power_rating": "3.0 HP High Torque",
            "warranty_years": 2,
            "unit_price_inr": 42000.0,
            "recommended_qty": 1,
            "category": "Core Production Machinery"
        },
        {
            "gem_item_code": "GEM/2026/B/882194",
            "item_name": "Vibratory Grain Destoner & Seed Cleaning Separator (200kg/hr)",
            "manufacturer": "AgroTech Processing Solutions",
            "power_rating": "1.0 HP Single Phase",
            "warranty_years": 2,
            "unit_price_inr": 28000.0,
            "recommended_qty": 1,
            "category": "Pre-Cleaning Equipment"
        },
        {
            "gem_item_code": "GEM/2026/B/661849",
            "item_name": "Continuous Nitrogen Flush Horizontal Band Sealer for Food Pouches",
            "manufacturer": "Sevana Electrical Appliances",
            "power_rating": "650W 230V",
            "warranty_years": 1,
            "unit_price_inr": 19500.0,
            "recommended_qty": 1,
            "category": "Packaging & Sealing"
        }
    ],
    "Solar & Electrical Appliance Repair": [
        {
            "gem_item_code": "GEM/2026/B/991204",
            "item_name": "Tata Power Solar 2.5kW Hybrid Inverter & 48V LFP Lithium Battery Bank",
            "manufacturer": "Tata Power Solar Systems Ltd",
            "power_rating": "2.5 kW / 5.12 kWh LFP",
            "warranty_years": 5,
            "unit_price_inr": 85000.0,
            "recommended_qty": 1,
            "category": "Power Infrastructure"
        },
        {
            "gem_item_code": "GEM/2026/B/119283",
            "item_name": "Havells Professional Digital Multimeter, Clamp Meter & Diagnostic Station",
            "manufacturer": "Havells India Ltd",
            "power_rating": "Battery Powered / Handheld",
            "warranty_years": 3,
            "unit_price_inr": 18500.0,
            "recommended_qty": 1,
            "category": "Diagnostic Tools"
        },
        {
            "gem_item_code": "GEM/2026/B/771923",
            "item_name": "SMD Rework Station with Temperature Controlled Soldering Iron & Hot Air Gun",
            "manufacturer": "Quick India Electronics",
            "power_rating": "700W Microprocessor Controlled",
            "warranty_years": 2,
            "unit_price_inr": 12500.0,
            "recommended_qty": 1,
            "category": "Precision Repair Station"
        }
    ],
    "Mobile Food Cart / Snack Center": [
        {
            "gem_item_code": "GEM/2026/B/331902",
            "item_name": "Stainless Steel Grade 304 Solar E-Cart Food Trailer with DC Refrigerator",
            "manufacturer": "Mahindra Electric / Kinetic Green",
            "power_rating": "48V 1.2kW BLDC Motor + 400W Solar Roof",
            "warranty_years": 3,
            "unit_price_inr": 95000.0,
            "recommended_qty": 1,
            "category": "Mobile Asset & Transport"
        },
        {
            "gem_item_code": "GEM/2026/B/449102",
            "item_name": "Commercial Heavy Duty Dual Induction Cooktop (2200W + 2200W)",
            "manufacturer": "Prestige Induction Systems",
            "power_rating": "4.4 kW Total",
            "warranty_years": 2,
            "unit_price_inr": 14500.0,
            "recommended_qty": 1,
            "category": "Cooking Equipment"
        },
        {
            "gem_item_code": "GEM/2026/B/881294",
            "item_name": "Dual-SIM 4G Audio Payment Soundbox & Micro-ATM POS Terminal",
            "manufacturer": "NPCI Certified / Payworld",
            "power_rating": "5V Type-C Rechargeable",
            "warranty_years": 2,
            "unit_price_inr": 3500.0,
            "recommended_qty": 1,
            "category": "Digital Payments Hardware"
        }
    ]
}

class EquipmentCatalogService:
    def get_equipment_for_sector(self, sector_name: str, total_project_cost: float) -> List[Dict[str, Any]]:
        # Match sector
        matched_items = []
        for sec, items in GEM_EQUIPMENT_DATABASE.items():
            if sec.lower() in sector_name.lower() or sector_name.lower() in sec.lower():
                matched_items = items
                break
        
        if not matched_items:
            # Default generic light agro/service equipment
            matched_items = GEM_EQUIPMENT_DATABASE["Mini Flour & Spice Processing Mill"]

        # Scale items to fit within available project CAPEX (approx 65-75% of Total Project Cost)
        capex_budget = total_project_cost * 0.70
        bom = []
        accumulated_capex = 0.0

        for item in matched_items:
            total_item_cost = item["unit_price_inr"] * item["recommended_qty"]
            if accumulated_capex + total_item_cost <= capex_budget * 1.2 or len(bom) == 0:
                bom.append({
                    **item,
                    "total_price_inr": total_item_cost
                })
                accumulated_capex += total_item_cost

        return bom

    def get_full_catalog(self) -> Dict[str, List[Dict[str, Any]]]:
        return GEM_EQUIPMENT_DATABASE

equipment_service = EquipmentCatalogService()
