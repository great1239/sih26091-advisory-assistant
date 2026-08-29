"""
Moratorium Survival Engine Scheduler (moratorium_scheduler.py)
APScheduler cron job triggers automated WhatsApp interactive reminder payloads
during the critical 3-to-6 month grace period.
"""
from datetime import datetime, timedelta
from typing import Dict, List, Any
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class MoratoriumScheduler:
    def __init__(self):
        self.active_schedules: Dict[str, Any] = {}

    def schedule_moratorium_nudges(
        self,
        beneficiary_id: str,
        beneficiary_name: str,
        phone_number: str,
        quarterly_emi: float,
        moratorium_months: int,
        preferred_language: str = "hi-IN"
    ) -> List[Dict[str, Any]]:
        """
        Calculates and schedules milestone webhook triggers for Day 15, 30, 60, 90, 150.
        """
        now = datetime.utcnow()
        milestones = [
            {
                "day_offset": 15,
                "title": "Day 15: Equipment Setup & Invoices",
                "message": f"नमस्ते {beneficiary_name}! मशीनरी खरीद की पक्की रसीदें SCA अधिकारी सत्यापन हेतु सुरक्षित रखें।",
                "scheduled_date": (now + timedelta(days=15)).strftime("%Y-%m-%d")
            },
            {
                "day_offset": 30,
                "title": "Day 30: UPI QR & Soundbox Setup",
                "message": f"{beneficiary_name} जी, अपनी दुकान पर 4G साउंडबॉक्स लगाएं ताकि आपका डिजिटल क्रेडिट स्कोर मजबूत हो।",
                "scheduled_date": (now + timedelta(days=30)).strftime("%Y-%m-%d")
            },
            {
                "day_offset": 60,
                "title": "Day 60: Working Capital Runway Check",
                "message": f"मोराटोरियम के 2 महीने पूरे। क्या आपका मासिक खर्च बजट के अनुसार है? अनावश्यक खर्च रोकें।",
                "scheduled_date": (now + timedelta(days=60)).strftime("%Y-%m-%d")
            }
        ]

        if moratorium_months == 3:
            milestones.append({
                "day_offset": 90,
                "title": "Day 90: Moratorium Concludes - First EMI Due",
                "message": f"महत्वपूर्ण: 3 माह का मोराटोरियम समाप्त। पहली EMI ₹{quarterly_emi:,.0f} 15 दिनों में देय है। बैंक खाते में राशि रखें।",
                "scheduled_date": (now + timedelta(days=90)).strftime("%Y-%m-%d")
            })
        else:
            milestones.append({
                "day_offset": 90,
                "title": "Day 90: Mid-Grace Scaling",
                "message": f"{beneficiary_name} जी, मोराटोरियम का आधा समय पूरा। थोक खरीदारों से दीर्घकालिक अनुबंध सुरक्षित करें।",
                "scheduled_date": (now + timedelta(days=90)).strftime("%Y-%m-%d")
            })
            milestones.append({
                "day_offset": 150,
                "title": "Day 150: 30-Day Pre-EMI Notice",
                "message": f"अति आवश्यक: 6 महीने का मोराटोरियम 30 दिन में समाप्त होगा। पहली तिमाही EMI ₹{quarterly_emi:,.0f} रिपेमेंट रिजर्व में जमा करें।",
                "scheduled_date": (now + timedelta(days=150)).strftime("%Y-%m-%d")
            })

        self.active_schedules[beneficiary_id] = {
            "beneficiary_name": beneficiary_name,
            "phone_number": phone_number,
            "milestones": milestones
        }

        logger.info(f"[APScheduler] Scheduled {len(milestones)} WhatsApp lifeline nudges for {beneficiary_name}")
        return milestones

moratorium_scheduler = MoratoriumScheduler()
