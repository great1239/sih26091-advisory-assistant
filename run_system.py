"""
# COST GUARDRAIL: Free tier only
# SIH26091 Advisory Assistant - Master System Launcher
# Starts FastAPI Backend (Port 8000) and React PWA Frontend (Port 5173) concurrently.
"""
import os
import sys
import subprocess
import threading
import time
from dotenv import load_dotenv

# Ensure backend directory is in sys.path and .env is loaded
root_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.join(root_dir, "backend")
frontend_dir = os.path.join(root_dir, "frontend")
load_dotenv(dotenv_path=os.path.join(backend_dir, ".env"))

def run_backend():
    sys.path.insert(0, backend_dir)
    import uvicorn
    print("  [+] FastAPI Backend running on http://127.0.0.1:8000 (API Docs: /docs)")
    uvicorn.run(
        "app.main:app",
        host="127.0.0.1",
        port=8000,
        reload=False,
        app_dir=backend_dir,
        log_level="info"
    )

def run_frontend():
    time.sleep(1.5)
    print("  [+] Starting React PWA Frontend on http://localhost:5173...")
    try:
        subprocess.run(["npm.cmd", "run", "dev"], cwd=frontend_dir, shell=True)
    except Exception as e:
        print(f"  [!] Frontend error: {e}")

def main():
    print("=" * 65)
    print("   SIH26091 AI-DRIVEN BUSINESS ADVISORY ASSISTANT")
    print("   Ministry of Social Justice and Empowerment (MoSJE)")
    print("   ZERO-COST FINANCIAL LOCKDOWN: FREE TIERS ONLY")
    print("=" * 65)
    
    key_status = "LOADED (Google AI Studio Active)" if os.getenv("GOOGLE_API_KEY") else "FALLBACK KEY LOADED"
    print(f"  AI Engine      : Google AI Studio (Gemini 3.6 Flash) - {key_status}")
    print("  Open Data      : Open Government Data India (data.gov.in Mandis)")
    print("  Maps Engine    : Leaflet / OpenStreetMap Real Roadmap Tiles")
    print("=" * 65)

    # Start frontend in separate thread
    frontend_thread = threading.Thread(target=run_frontend, daemon=True)
    frontend_thread.start()

    # Run backend in main thread
    run_backend()

if __name__ == "__main__":
    main()
