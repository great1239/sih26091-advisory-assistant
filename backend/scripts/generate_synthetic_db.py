"""
Synthetic Informal Economy & Competitor Generator (Pandas & Faker)
Generates 500 unregistered local micro-businesses with simulated UPI transaction volumes
and commercial grid load telemetry to feed the Void Analysis Engine.
"""
import random
import pandas as pd
from faker import Faker
from sqlalchemy import create_engine, Column, Integer, String, Float, Boolean
from sqlalchemy.orm import declarative_base, sessionmaker

fake = Faker('en_IN')
Base = declarative_base()

class SyntheticMerchant(Base):
    __tablename__ = "synthetic_merchants"

    id = Column(Integer, primary_key=True, autoincrement=True)
    merchant_name = Column(String(200), nullable=False)
    district = Column(String(100), nullable=False)
    state = Column(String(100), nullable=False)
    business_sector = Column(String(150), nullable=False)
    is_udyam_registered = Column(Boolean, default=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    monthly_upi_tx_count = Column(Integer, nullable=False)
    avg_upi_ticket_size_inr = Column(Float, nullable=False)
    monthly_upi_volume_inr = Column(Float, nullable=False)
    commercial_grid_load_kw = Column(Float, nullable=False)
    estimated_annual_turnover_inr = Column(Float, nullable=False)

def generate_mock_informal_database(db_url: str = "sqlite:///informal_economy.db", count: int = 500):
    random.seed(42)
    Faker.seed(42)

    districts = [
        {"district": "Jodhpur", "state": "Rajasthan", "lat": 26.2389, "lon": 73.0243},
        {"district": "Varanasi", "state": "Uttar Pradesh", "lat": 25.3176, "lon": 82.9739},
        {"district": "Purnia", "state": "Bihar", "lat": 25.7771, "lon": 87.4753},
        {"district": "Salem", "state": "Tamil Nadu", "lat": 11.6643, "lon": 78.1460},
        {"district": "Kolhapur", "state": "Maharashtra", "lat": 16.7050, "lon": 74.2433},
        {"district": "Gwalior", "state": "Madhya Pradesh", "lat": 26.2183, "lon": 78.1828}
    ]

    sectors = [
        "Tailoring & Readymade Garments",
        "Commercial Dairy (10+ Cattle)",
        "Mini Flour & Spice Processing Mill",
        "Kirana & General Provision Store",
        "Mobile Food Cart / Snack Center",
        "Solar & Electrical Appliance Repair",
        "Handloom & Khadi Weaving",
        "Welding, Fabrication & Farm Tool Repair",
        "Poultry Broiler / Layer Unit"
    ]

    records = []
    for _ in range(count):
        d = random.choice(districts)
        sec = random.choice(sectors)
        
        # Only ~20% of rural businesses are formal Udyam registered
        is_formal = random.random() < 0.20
        
        lat_offset = random.uniform(-0.08, 0.08)
        lon_offset = random.uniform(-0.08, 0.08)
        
        monthly_tx = random.randint(40, 2400) if random.random() > 0.10 else 0
        ticket_size = round(random.uniform(50.0, 1200.0), 2)
        monthly_upi_vol = round(monthly_tx * ticket_size, 2)
        grid_load = round(random.uniform(0.5, 9.5), 2)
        
        # Proxy turnover modeled from UPI + cash multiplier + grid load
        cash_multiplier = random.uniform(1.8, 3.5)
        monthly_turnover = round(max(monthly_upi_vol * cash_multiplier, grid_load * 12000.0), 2)
        annual_turnover = round(monthly_turnover * 12.0, 2)

        records.append({
            "merchant_name": f"{fake.first_name()} {sec.split()[0]} Works",
            "district": d["district"],
            "state": d["state"],
            "business_sector": sec,
            "is_udyam_registered": is_formal,
            "latitude": round(d["lat"] + lat_offset, 6),
            "longitude": round(d["lon"] + lon_offset, 6),
            "monthly_upi_tx_count": monthly_tx,
            "avg_upi_ticket_size_inr": ticket_size,
            "monthly_upi_volume_inr": monthly_upi_vol,
            "commercial_grid_load_kw": grid_load,
            "estimated_annual_turnover_inr": annual_turnover
        })

    df = pd.DataFrame(records)
    print(f"Generated DataFrame with {len(df)} synthetic businesses.")
    print(df.head(3))

    # Persist to database
    engine = create_engine(db_url)
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    session = Session()

    for r in records:
        merchant = SyntheticMerchant(**r)
        session.add(merchant)
    session.commit()
    session.close()
    print(f"Successfully committed 500 mock informal enterprises to {db_url}")
    return df

if __name__ == "__main__":
    generate_mock_informal_database()
