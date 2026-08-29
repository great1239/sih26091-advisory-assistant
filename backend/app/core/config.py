"""
Application configuration, MoSJE scheme constants, risk benchmarks, and domain models.
"""
from typing import Dict, List, Set

class Settings:
    PROJECT_NAME: str = "SIH26091 AI-Driven Business Advisory Assistant"
    API_V1_STR: str = "/api"
    VERSION: str = "1.0.0"
    
    # MoSJE Equity & Debt Contribution Ratios
    MANDATORY_MARGIN_CAPITAL_RATIO: float = 0.10  # 10% Margin Capital
    CONCESSIONAL_LOAN_RATIO: float = 0.90         # 90% Loan Eligibility
    
    # MoSJE Credit Tiers
    MICRO_FINANCE_THRESHOLD: float = 140000.0     # Up to ₹1.40 Lakh
    TERM_LOAN_THRESHOLD: float = 5000000.0        # Up to ₹50.00 Lakh
    
    # Micro Finance Tier Parameters
    MICRO_FINANCE_BASE_RATE: float = 6.5          # 6.5% p.a.
    MICRO_FINANCE_TENURE_MONTHS: int = 36         # 3 Years
    MICRO_FINANCE_MORATORIUM_MONTHS: int = 3      # 3 Months Grace Period
    MICRO_FINANCE_MAX_LOAN: float = 125000.0      # ₹1.25 Lakh
    
    # Term Loan Tier Parameters
    TERM_LOAN_BASE_RATE: float = 8.0              # 8.0% p.a.
    TERM_LOAN_TENURE_MONTHS: int = 84             # 7 Years
    TERM_LOAN_MORATORIUM_MONTHS: int = 6          # 6 Months Grace Period
    TERM_LOAN_MAX_LOAN: float = 4500000.0         # ₹45.00 Lakh
    
    # Fallback Scheme Parameters (> ₹50L)
    FALLBACK_SCHEME_NAME: str = "PMEGP / MUDRA Tarun+ Fallback"
    FALLBACK_BASE_RATE: float = 9.5
    FALLBACK_TENURE_MONTHS: int = 84
    FALLBACK_MORATORIUM_MONTHS: int = 6
    
    # Demographic Interest Subventions (MoSJE Mandate)
    SUBVENTIONS: Dict[str, float] = {
        "Women": 1.0,               # -1.0% interest discount
        "SC": 1.0,                  # -1.0% interest discount
        "ST": 1.0,                  # -1.0% interest discount
        "PwD": 1.0,                 # -1.0% interest discount
        "Safai Karamchari": 1.5,     # -1.5% interest discount
        "OBC": 0.5,                 # -0.5% interest discount
        "General": 0.0              # Baseline rate
    }
    
    # Interest Rate Floor (cannot drop below 4.0% p.a.)
    MIN_INTEREST_RATE: float = 4.0

    # Water-intensive sectors subject to CGWB "Dark Zone / Over-Exploited" veto
    WATER_INTENSIVE_SECTORS: Set[str] = {
        "Commercial Dairy (10+ Cattle)",
        "Textile Dyeing & Wet Processing",
        "Packaged Drinking Water & Ice Plant",
        "Commercial Leather Tannery",
        "Intensive Aquaculture"
    }

    # Known CGWB Dark / Over-Exploited Water Stressed Districts/Blocks (Sample Indian Ground Water Registry)
    CGWB_DARK_ZONES: Set[str] = {
        "jodhpur", "jaipur", "sangrur", "moga", "patiala", 
        "mehsana", "banaskantha", "anantapur", "chittoor",
        "osmanabad", "latur", "dindigul", "coimbatore",
        "salem", "gurugram", "kurukshetra", "faridabad"
    }

    # Power Stressed Districts requiring Backup Inverter/Generator CAPEX
    POWER_STRESSED_DISTRICTS: Set[str] = {
        "purnia", "madhubani", "saharsa", "gaya", "sitapur", 
        "hardoi", "bahraich", "dumka", "pakur", "barwani"
    }

settings = Settings()
