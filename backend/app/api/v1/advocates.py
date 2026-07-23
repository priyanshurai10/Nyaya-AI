import uuid
from typing import Optional, List
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime

from app.core.database import get_db
from app.models import User
from app.core.auth import get_current_user
from app.api.v1.navigation import haversine_distance

router = APIRouter()

# ─── Pydantic Schemas ───
class AdvocateSearchPayload(BaseModel):
    query: Optional[str] = None
    practice_area: Optional[str] = None
    rating_min: Optional[float] = None
    experience_min: Optional[int] = None
    fees_max: Optional[int] = None
    language: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class AppointmentBookPayload(BaseModel):
    advocate_id: str
    date: str
    time: str
    fees: int

# In-Memory Fallback Advocate Data
MOCK_ADVOCATES = [
    {
        "id": "adv-001",
        "name": "Adv. Rajesh Sharma",
        "bar_council_id": "D/1234/2010",
        "experience_years": 14,
        "rating": 4.9,
        "review_count": 86,
        "consultation_fees": 1500,
        "practice_areas": ["Constitutional Law", "Civil Litigation", "Property Disputes"],
        "languages": ["English", "Hindi"],
        "city": "New Delhi",
        "state": "Delhi",
        "latitude": 28.6139,
        "longitude": 77.2090,
        "is_verified": True,
        "phone": "+91 9876543210",
        "email": "rajesh.sharma@advocates.in"
    },
    {
        "id": "adv-002",
        "name": "Adv. Priya Ananth",
        "bar_council_id": "MAH/5678/2015",
        "experience_years": 9,
        "rating": 4.8,
        "review_count": 54,
        "consultation_fees": 1200,
        "practice_areas": ["Family Law", "Consumer Disputes", "Cyber Crime"],
        "languages": ["English", "Marathi", "Hindi"],
        "city": "Mumbai",
        "state": "Maharashtra",
        "latitude": 18.9220,
        "longitude": 72.8347,
        "is_verified": True,
        "phone": "+91 9812345678",
        "email": "priya.ananth@advocates.in"
    }
]

IN_MEMORY_APPOINTMENTS = []

@router.post("/search")
def search_advocates(payload: AdvocateSearchPayload):
    user_lat = payload.latitude or 28.6139
    user_lon = payload.longitude or 77.2090

    results = []
    for adv in MOCK_ADVOCATES:
        dist = haversine_distance(user_lat, user_lon, adv["latitude"], adv["longitude"])
        adv_copy = dict(adv)
        adv_copy["distance_km"] = round(dist, 1)
        results.append(adv_copy)

    return results

@router.post("/book")
def book_appointment(payload: AppointmentBookPayload, user: User = Depends(get_current_user)):
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")
        
    appt = {
        "id": f"apt-{uuid.uuid4().hex[:8]}",
        "user_id": user.id,
        "advocate_id": payload.advocate_id,
        "date": payload.date,
        "time": payload.time,
        "fees": payload.fees,
        "status": "CONFIRMED",
        "created_at": datetime.utcnow().isoformat()
    }
    IN_MEMORY_APPOINTMENTS.append(appt)
    return {"success": True, "appointment": appt, "message": "Appointment booked successfully."}

@router.get("/my-appointments")
def my_appointments(user: User = Depends(get_current_user)):
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")
        
    user_appts = [a for a in IN_MEMORY_APPOINTMENTS if a["user_id"] == user.id]
    return {"success": True, "appointments": user_appts}
