"""
SQLAlchemy Database Models for SIH26091 MoSJE AI Advisory Assistant
PostgreSQL / SQLite compatible schemas for User, Business_Profile, and Financial_Plan.
"""
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Enum, JSON, Text
)
from sqlalchemy.orm import declarative_base, relationship
from datetime import datetime
import enum

Base = declarative_base()

class SocialCategoryEnum(str, enum.Enum):
    GENERAL = "General"
    SC = "SC"
    ST = "ST"
    OBC = "OBC"
    WOMEN = "Women"
    PWD = "PwD"
    TRANSGENDER = "Transgender"

class LandAssetStatusEnum(str, enum.Enum):
    OWNED = "Owned"
    LEASED = "Leased"
    NONE = "None"

class SchemeTierEnum(str, enum.Enum):
    MICRO_FINANCE = "Micro Finance"
    TERM_LOAN = "Term Loan"
    FALLBACK_PMEGP_MUDRA = "Fallback scheme required (PMEGP/MUDRA)"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(255), nullable=False)
    phone_number = Column(String(20), unique=True, index=True, nullable=True)
    social_category = Column(Enum(SocialCategoryEnum), default=SocialCategoryEnum.GENERAL, nullable=False)
    preferred_language = Column(String(50), default="hi-IN", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    business_profiles = relationship("BusinessProfile", back_populates="user", cascade="all, delete-orphan")


class BusinessProfile(Base):
    __tablename__ = "business_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    geographic_location = Column(String(255), nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    margin_capital = Column(Float, nullable=False)
    business_category = Column(String(150), nullable=False)
    land_asset_status = Column(Enum(LandAssetStatusEnum), default=LandAssetStatusEnum.OWNED, nullable=False)
    years_in_industry = Column(Integer, default=0, nullable=False)
    specific_skillsets = Column(JSON, default=list, nullable=False)
    
    # Feasibility & Risk Outputs
    market_void_inr = Column(Float, nullable=True)
    is_ecological_veto = Column(Boolean, default=False)
    veto_reason = Column(Text, nullable=True)
    swot_analysis = Column(JSON, nullable=True)
    suggested_pivots = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="business_profiles")
    financial_plans = relationship("FinancialPlan", back_populates="business_profile", cascade="all, delete-orphan")


class FinancialPlan(Base):
    __tablename__ = "financial_plans"

    id = Column(Integer, primary_key=True, index=True)
    business_profile_id = Column(Integer, ForeignKey("business_profiles.id"), nullable=False)
    
    # MoSJE Deterministic Math
    total_project_cost = Column(Float, nullable=False)
    loan_eligibility = Column(Float, nullable=False)
    scheme_tier = Column(Enum(SchemeTierEnum), nullable=False)
    base_interest_rate = Column(Float, nullable=False)
    subvented_interest_rate = Column(Float, nullable=False)
    repayment_tenure_months = Column(Integer, nullable=False)
    moratorium_months = Column(Integer, nullable=False)
    monthly_emi = Column(Float, nullable=False)
    quarterly_emi = Column(Float, nullable=False)
    competency_discount_applied = Column(Float, default=0.0)
    
    # Amortization Table & Moratorium Schedule
    amortization_schedule = Column(JSON, nullable=False)
    disbursement_date = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)

    # Relationships
    business_profile = relationship("BusinessProfile", back_populates="financial_plans")
