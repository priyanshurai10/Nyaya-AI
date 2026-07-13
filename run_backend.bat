@echo off
echo Starting Nyaya AI FastAPI Backend on Port 8000...
cd backend
"C:\Program Files\Python312\python.exe" -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
pause
