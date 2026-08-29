"""
Synthetic Informal Economy & Formal POI Data Generator (Faker / Pandas simulation)
Simulates formal Udyam POIs (approx 20% of rural volume) + 500+ informal micro-merchants
with UPI transaction volume, power load telemetry, and e-NAM wholesale logs.
"""
import random
from typing import List, Dict, Any

class SyntheticMarketDatabase:
    def __init__(self):
        self.sectors = [
            "Tailoring & Readymade Garments",
            "Commercial Dairy & Milk Collection",
            "Kirana & General Provision Store",
            "Mini Flour & Spice Processing Mill",
            "Welding, Fabrication & Farm Tool Repair",
            "Mobile Food Cart / Snack Center",
            "Solar & Electrical Appliance Repair",
            "Poultry Broiler / Layer Unit",
            "Vegetable & Fruit Wholesale Aggregation",
            "Pottery & Terracotta Handicrafts",
            "Handloom & Khadi Weaving",
            "Motorcycle & Tractor Servicing"
        ]
        
        self.district_benchmarks = {
            "jodhpur": {"state": "Rajasthan", "lat": 26.2389, "lon": 73.0243, "pop_density": 180, "road_density": 1.1, "water_stress": "Over-Exploited (Dark Zone)", "power_stress": "Low"},
            "jaipur": {"state": "Rajasthan", "lat": 26.9124, "lon": 75.7873, "pop_density": 598, "road_density": 2.4, "water_stress": "Over-Exploited (Dark Zone)", "power_stress": "Low"},
            "varanasi": {"state": "Uttar Pradesh", "lat": 25.3176, "lon": 82.9739, "pop_density": 2395, "road_density": 3.8, "water_stress": "Safe", "power_stress": "Moderate"},
            "purnia": {"state": "Bihar", "lat": 25.7771, "lon": 87.4753, "pop_density": 1014, "road_density": 1.6, "water_stress": "Safe", "power_stress": "Critical (High Drop Freq)"},
            "saharsa": {"state": "Bihar", "lat": 25.8835, "lon": 86.5985, "pop_density": 1127, "road_density": 1.4, "water_stress": "Safe", "power_stress": "Critical (High Drop Freq)"},
            "salem": {"state": "Tamil Nadu", "lat": 11.6643, "lon": 78.1460, "pop_density": 663, "road_density": 2.9, "water_stress": "Over-Exploited (Dark Zone)", "power_stress": "Low"},
            "coimbatore": {"state": "Tamil Nadu", "lat": 11.0168, "lon": 76.9558, "pop_density": 732, "road_density": 3.2, "water_stress": "Over-Exploited (Dark Zone)", "power_stress": "Low"},
            "kolhapur": {"state": "Maharashtra", "lat": 16.7050, "lon": 74.2433, "pop_density": 504, "road_density": 2.1, "water_stress": "Semi-Critical", "power_stress": "Low"},
            "latur": {"state": "Maharashtra", "lat": 18.4088, "lon": 76.5604, "pop_density": 343, "road_density": 1.7, "water_stress": "Over-Exploited (Dark Zone)", "power_stress": "Moderate"},
            "gwalior": {"state": "Madhya Pradesh", "lat": 26.2183, "lon": 78.1828, "pop_density": 446, "road_density": 1.8, "water_stress": "Critical", "power_stress": "Moderate"},
            "anantapur": {"state": "Andhra Pradesh", "lat": 14.6819, "lon": 77.6006, "pop_density": 213, "road_density": 1.5, "water_stress": "Over-Exploited (Dark Zone)", "power_stress": "Low"},
            "burdwan": {"state": "West Bengal", "lat": 23.2324, "lon": 87.8615, "pop_density": 1099, "road_density": 2.7, "water_stress": "Safe", "power_stress": "Low"}
        }

        # Seed 500+ synthetic enterprises in memory
        self.enterprise_registry = self._seed_synthetic_registry(550)

    def _seed_synthetic_registry(self, count: int) -> List[Dict[str, Any]]:
        registry = []
        random.seed(42)  # Deterministic seed for reproducible testing
        
        districts = list(self.district_benchmarks.keys())
        
        for i in range(count):
            district = random.choice(districts)
            sector = random.choice(self.sectors)
            is_formal = random.random() < 0.22  # Only ~22% are formally registered in Udyam
            
            # Informal proxy metrics
            monthly_upi_tx = random.randint(40, 1800) if random.random() > 0.15 else 0
            commercial_power_kw = round(random.uniform(0.5, 7.5), 2)
            monthly_turnover_inr = round(random.uniform(15000, 350000), 2)
            
            lat_offset = random.uniform(-0.06, 0.06)
            lon_offset = random.uniform(-0.06, 0.06)
            
            benchmark = self.district_benchmarks[district]
            
            registry.append({
                "enterprise_id": f"ENT-{district[:3].upper()}-{1000 + i}",
                "district": district,
                "sector": sector,
                "is_formal_udyam": is_formal,
                "udyam_reg_no": f"UDYAM-{district[:2].upper()}-{random.randint(100000, 999999)}" if is_formal else None,
                "latitude": round(benchmark["lat"] + lat_offset, 5),
                "longitude": round(benchmark["lon"] + lon_offset, 5),
                "monthly_upi_tx": monthly_upi_tx,
                "commercial_power_kw": commercial_power_kw,
                "estimated_monthly_turnover": monthly_turnover_inr,
                "estimated_annual_turnover": monthly_turnover_inr * 12
            })
        return registry

    def get_district_info(self, location_query: str) -> Dict[str, Any]:
        cleaned = location_query.lower()
        for district, data in self.district_benchmarks.items():
            if district in cleaned:
                return {"district": district.capitalize(), **data}
        
        # Default fallback (rural composite)
        return {
            "district": "Composite Rural Cluster",
            "state": "National Rural Zone",
            "lat": 23.5937,
            "lon": 78.9629,
            "pop_density": 450,
            "road_density": 1.8,
            "water_stress": "Safe",
            "power_stress": "Moderate"
        }

    def filter_enterprises(self, district: str, sector: str, radius_km: float = 10.0) -> List[Dict[str, Any]]:
        district_clean = district.lower()
        matches = []
        for ent in self.enterprise_registry:
            if ent["district"] == district_clean or district_clean not in self.district_benchmarks:
                # Approximate sector match
                if sector.lower() in ent["sector"].lower() or ent["sector"].lower() in sector.lower():
                    matches.append(ent)
        # If too few, return relevant subset
        if len(matches) < 5:
            matches = [e for e in self.enterprise_registry if e["district"] == district_clean][:12]
        return matches

synthetic_db = SyntheticMarketDatabase()
