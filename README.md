# SIH26091 AI-Driven Business Advisory Assistant

> **Ministry of Social Justice & Empowerment (MoSJE) - Concessional Credit Appraisal & Hyper-Local Feasibility System**

---

## 🌟 Executive Overview & Mandate

The **SIH26091 Advisory Assistant** is an end-to-end enterprise intelligence and financial structuring engine designed to eliminate high business stagnation rates among rural micro-entrepreneurs. It replaces anecdotal, speculative business selection with:
1. **Deterministic MoSJE Concessional Credit Structuring** (10% equity rule, Micro Finance vs Term Loan tier routing, demographic interest subventions).
2. **Hyper-Local Feasibility & Void Analysis** (5-10 km spatial bounding, mapping formal Udyam POIs vs informal proxy economies via UPI velocity and grid load).
3. **5-Dimensional Ecological & Advanced Risk Engine** (CGWB groundwater dark-zone hard vetoes, power outage CAPEX/OPEX adders, TRAI cyber stability, and State EoDB runway friction).
4. **AI-Augmented Strategic Pivots** (Sector-Adjacent, Budget-Driven, Asset-Driven redirection to prevent bank rejections).
5. **Bank-Ready DPR PDF Generator** (Instant MoSJE-compliant Detailed Project Report generation for State Channelizing Agencies).
6. **Moratorium Survival Engine** (Dialect-native WhatsApp nudges during the critical 3-to-6 month grace period).
7. **Gram Panchayat Hardware Kiosk Station** (Arduino Uno C++ firmware with RFID smart cards and ESC/POS thermal receipt printing for smartphone-less beneficiaries).

---

## 🏗️ System Architecture

```
+------------------------------------------------------------------------------------+
|                                 USER TOUCHPOINTS                                    |
|   +-----------------------+   +------------------------+   +-------------------+   |
|   |  React PWA Interface  |   | Gram Panchayat Kiosk   |   | WhatsApp Nudge    |   |
|   |  (Indic Voice/Text)   |   | (RFID + Thermal Print) |   | Webhook Lifeline  |   |
|   +-----------+-----------+   +-----------+------------+   +---------+---------+   |
+---------------|---------------------------|--------------------------|-------------+
                |                           |                          |
+---------------v---------------------------v--------------------------v-------------+
|                      DETERMINISTIC PARAMETER & ANTI-GIGO GATEWAY                    |
|   - Geographic Location (5-10km)      - Available Margin Capital (INR)              |
|   - Business Category                 - Social Category (SC/ST/Women/PwD/General)   |
|   - Land Status (Owned/Leased/None)   - Founder Experience (Years & Skills)        |
+-------------------------------------------+----------------------------------------+
                                            |
         +----------------------------------+----------------------------------+
         |                                                                     |
+--------v----------------------------------+       +--------------------------v-------------------+
|  MODULE 1: HYPER-LOCAL FEASIBILITY ENGINE |       | MODULE 2: SMART FINANCIAL CALCULATOR & ROUTER|
|  - 5-10km Radial Geospatial Bounding      |       | - Strict 10% Equity Rule (10x Project Cost)  |
|  - Void Analysis (Formal vs Informal UPI) |       | - MoSJE Scheme Tier Route (Micro / Term)     |
|  - 5D Risk Engine (CGWB Dark Zone Veto)   |       | - Demographic Subventions (-1.0% to -1.5%)   |
|  - Strategic Pivot Engine (Sector/Budget) |       | - Quarterly Amortization & Moratorium Burn   |
+-------------------------------------------+       +----------------------------------------------+
         |                                                                     |
         +----------------------------------+----------------------------------+
                                            |
+-------------------------------------------v----------------------------------------+
|                               OUTPUTS & ARTIFACTS                                  |
|   - Live Interactive Dashboard & Visual Charts                                     |
|   - Bank-Ready MoSJE Detailed Project Report (DPR PDF)                             |
|   - Moratorium Actionable WhatsApp Milestones (Days 15, 30, 60, 90, 150)           |
|   - Gamified Margin Capital Goal Tracker                                           |
|   - Arduino C++ Kiosk Firmware (RFID + Thermal Paper Roadmap)                      |
+------------------------------------------------------------------------------------+
```

---

## 📊 MoSJE Concessional Credit Tier Rules

| Scheme Tier | Project Cost Trigger | Base Interest Rate | Repayment Tenure | Moratorium (Grace Period) | Maximum Loan Eligibility |
|---|---|---|---|---|---|
| **Micro Finance** | $\le$ ₹1.40 Lakh | 6.5% p.a. | 3 Years (36 mos) | 3 Months Grace | ₹1.25 Lakh |
| **Term Loan** | > ₹1.40 Lakh to ₹50.00 Lakh | 8.0% p.a. | 7 Years (84 mos) | 6 Months Grace | ₹45.00 Lakh |
| **PMEGP / MUDRA Fallback** | > ₹50.00 Lakh | 9.5% p.a. | 7 Years | 6 Months | Sized by project |

### Demographic Interest Subventions:
- **Women / SC / ST / PwD**: -1.0% p.a. discount
- **Safai Karamchari Mandate**: -1.5% p.a. discount
- **OBC**: -0.5% p.a. discount
- *Floor rate: 4.0% p.a.*

---

## 🚀 Quickstart & Running the System

### 1. Start FastAPI Backend:
```powershell
cd backend
python -m uvicorn app.main:app --reload --port 8000
```
- Interactive Swagger API Docs: `http://127.0.0.1:8000/docs`
- Healthcheck: `http://127.0.0.1:8000/`

### 2. Start React + Vite Frontend:
```powershell
cd frontend
npm.cmd run dev
```
- Web Application: `http://localhost:5173`

### 3. Run Backend Automated Test Suite:
```powershell
cd backend
python -m pytest tests -v
```

---

## 📁 Repository Structure

```
sih26091-advisory-assistant/
├── backend/
│   ├── app/
│   │   ├── main.py                     # FastAPI application entrypoint
│   │   ├── core/config.py              # MoSJE scheme constants & risk benchmarks
│   │   ├── models/schemas.py           # Pydantic domain models
│   │   ├── services/
│   │   │   ├── geo_engine.py           # 5-10km spatial bounding & geocoder
│   │   │   ├── synthetic_data.py       # 500+ informal enterprise synthetic database
│   │   │   ├── void_analysis.py        # True market void & informal proxy calculator
│   │   │   ├── risk_engine.py          # 5D risk scorecard & CGWB dark-zone veto
│   │   │   ├── financial_calculator.py # 10% equity rule & subvented amortization
│   │   │   ├── pivot_engine.py         # Sector, budget, and asset pivot advisor
│   │   │   ├── dpr_generator.py        # ReportLab Bank-Ready DPR PDF engine
│   │   │   └── moratorium_engine.py    # Post-disbursement nudge sequence generator
│   │   └── api/endpoints.py            # REST API endpoints
│   ├── tests/                          # 100% passing Pytest suite
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/                 # React UI components (Wizard, Void, Charts, Kiosk, Moratorium)
│   │   ├── services/api.js             # API connector with offline resilience
│   │   ├── translations.js             # Multilingual Indic language dictionary
│   │   ├── App.jsx                     # Core application orchestrator
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── hardware/
│   ├── kiosk_firmware.ino              # Arduino Uno C++ sketch for RFID & Thermal Printer
│   └── README.md                       # Hardware wiring diagram & component list
└── README.md
```
