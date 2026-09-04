import os
import sys
import subprocess
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent

def main():
    print("=" * 65)
    print(" 🌍 STARTING GLOBAL ANALYTICS ENGINE (GAE) CLOUD PLATFORM ")
    print("=" * 65)
    
    app_path = BASE_DIR / "app" / "main.py"
    
    cmd = [sys.executable, "-m", "streamlit", "run", str(app_path)]
    try:
        subprocess.run(cmd, check=True)
    except KeyboardInterrupt:
        print("\n[GAE] Application stopped gracefully.")

if __name__ == "__main__":
    main()
