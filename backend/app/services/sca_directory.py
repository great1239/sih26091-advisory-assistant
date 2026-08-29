"""
Ministry of Social Justice & Empowerment (MoSJE) State Channelizing Agency (SCA) Directory
Provides official state-by-state office addresses, nodal officer contacts, and portal links
for NBCFDC, NSFDC, and NSKFDC concessional credit disbursement.
"""
from typing import Dict, List, Any

SCA_STATE_DIRECTORY: Dict[str, Dict[str, Any]] = {
    "Rajasthan": {
        "state": "Rajasthan",
        "sca_name": "Rajasthan SC and ST Development Cooperative Corporation (Anuprati / RCDF)",
        "corporations": ["NSFDC", "NBCFDC", "NSKFDC"],
        "head_office": "Nehru Sahkar Bhawan, 4th Floor, 22 Godam Circle, Jaipur - 302001",
        "nodal_officer": "Sh. R. K. Sharma (Joint Director, SCA)",
        "helpline_phone": "+91-141-2740234",
        "portal_url": "https://sje.rajasthan.gov.in",
        "district_offices": {
            "Jodhpur": "Collectorate Campus, Paota Circle, Jodhpur - 342001",
            "Jaipur": "Mini Secretariat, Bani Park, Jaipur - 302016"
        }
    },
    "Bihar": {
        "state": "Bihar",
        "sca_name": "Bihar State Backward Classes Finance & Development Corporation (BSBCFDC)",
        "corporations": ["NBCFDC", "NSFDC", "NSKFDC"],
        "head_office": "Sardar Patel Bhawan, 6th Floor, Bailey Road, Patna - 800023",
        "nodal_officer": "Dr. Anirudh Prasad (Managing Director)",
        "helpline_phone": "+91-612-2215682",
        "portal_url": "https://state.bihar.gov.in/scst",
        "district_offices": {
            "Purnia": "District Welfare Office, Collectorate, Purnia - 854301",
            "Patna": "Vikas Bhawan, Bailey Road, Patna - 800001"
        }
    },
    "Uttar Pradesh": {
        "state": "Uttar Pradesh",
        "sca_name": "Uttar Pradesh Scheduled Castes Finance & Development Corporation (UPSCFDC)",
        "corporations": ["NSFDC", "NBCFDC", "NSKFDC"],
        "head_office": "B-2, Pragati Deep Building, Laxmi Nagar / Gomti Nagar, Lucknow - 226010",
        "nodal_officer": "Smt. Manju Lata (General Manager Credit)",
        "helpline_phone": "+91-522-2307845",
        "portal_url": "https://upsdfc.gov.in",
        "district_offices": {
            "Varanasi": "Vikas Bhawan, Kutchery Campus, Varanasi - 221002",
            "Lucknow": "Kaiserbagh District Complex, Lucknow - 226001"
        }
    },
    "Tamil Nadu": {
        "state": "Tamil Nadu",
        "sca_name": "Tamil Nadu Adi Dravidar Housing & Development Corporation (TAHDCO)",
        "corporations": ["NSFDC", "NBCFDC", "NSKFDC"],
        "head_office": "Cenotaph Road, Teynampet, Chennai - 600018",
        "nodal_officer": "Thiru K. Senthil Kumar, IAS (Managing Director)",
        "helpline_phone": "+91-44-24310502",
        "portal_url": "https://tahdco.tn.gov.in",
        "district_offices": {
            "Salem": "Collectorate Complex, Bretts Road, Salem - 636001",
            "Coimbatore": "Collectorate Office, State Bank Road, Coimbatore - 641018"
        }
    },
    "Maharashtra": {
        "state": "Maharashtra",
        "sca_name": "Mahatma Phule Backward Class Development Corporation Ltd (MPBCDC)",
        "corporations": ["NSFDC", "NBCFDC", "NSKFDC"],
        "head_office": "Supreme Shopping Centre, Gulmohar Cross Rd 9, Juhu, Mumbai - 400049",
        "nodal_officer": "Sh. Sanjay Shinde (Chief General Manager)",
        "helpline_phone": "+91-22-26200234",
        "portal_url": "https://mpbcdc.maharashtra.gov.in",
        "district_offices": {
            "Kolhapur": "Tarabai Park, Old Pune-Bangalore Highway, Kolhapur - 416003",
            "Latur": "Bhadgaon Road, Latur - 413512"
        }
    }
}

class SCADirectoryService:
    def get_sca_by_state(self, state_name: str) -> Dict[str, Any]:
        for state, data in SCA_STATE_DIRECTORY.items():
            if state.lower() in state_name.lower() or state_name.lower() in state.lower():
                return data
        
        # Fallback to Central MoSJE Nodal Desk
        return {
            "state": state_name or "National Rural Zone",
            "sca_name": "Ministry of Social Justice & Empowerment Central Channelizing Desk",
            "corporations": ["NSFDC", "NBCFDC", "NSKFDC"],
            "head_office": "Shastri Bhawan, Dr. Rajendra Prasad Road, New Delhi - 110001",
            "nodal_officer": "Director (Concessional Credit Division, MoSJE)",
            "helpline_phone": "1800-11-0031 (National Toll-Free)",
            "portal_url": "https://socialjustice.gov.in",
            "district_offices": {}
        }

    def get_all_scas(self) -> Dict[str, Dict[str, Any]]:
        return SCA_STATE_DIRECTORY

sca_service = SCADirectoryService()
