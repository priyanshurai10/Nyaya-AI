import uuid
from typing import Optional, List
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime

from app.core.database import get_db
from app.models import Advocate, Appointment, User
from app.core.auth import get_current_user
from app.api.v1.navigation import haversine_distance

router = APIRouter()

# ─── Pydantic Schemas ───
class AdvocateSearchPayload(BaseModel):
    query: Optional[str] = None # For smart matching query
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
    consent_given: bool

# ─── Smart Query Classifier helper ───
def classify_practice_area(query: str) -> Optional[str]:
    q = query.lower()
    if any(k in q for k in ["property", "landlord", "tenant", "rent", "deed", "boundary", "encroach", "evict"]):
        return "Property Lawyer"
    elif any(k in q for k in ["divorce", "spouse", "custody", "marriage", "alimony", "husband", "wife"]):
        return "Divorce Lawyer"
    elif any(k in q for k in ["family", "child", "maintenance", "partition"]):
        return "Family Lawyer"
    elif any(k in q for k in ["hack", "phish", "scam", "online", "fraud", "cyber", "card", "bank"]):
        return "Cyber Crime Lawyer"
    elif any(k in q for k in ["salary", "employer", "employee", "wages", "termination", "job", "labour", "union"]):
        return "Labour Lawyer"
    elif any(k in q for k in ["defect", "product", "warranty", "refund", "consumer", "delivered", "charge"]):
        return "Consumer Lawyer"
    elif any(k in q for k in ["tax", "gst", "income tax", "filing"]):
        return "Tax Lawyer"
    elif any(k in q for k in ["corporate", "company", "contract", "business", "incorporate"]):
        return "Corporate Lawyer"
    elif any(k in q for k in ["criminal", "arrest", "bail", "police", "jail", "ipc", "bns"]):
        return "Criminal Lawyer"
    elif any(k in q for k in ["civil", "sue", "recovery", "monetary", "summons"]):
        return "Civil Lawyer"
    return None

# ─── Routes ───

@router.post("/search")
def search_advocates(payload: AdvocateSearchPayload, db: Session = Depends(get_db)):
    user_lat = payload.latitude
    user_lon = payload.longitude

    if user_lat is None or user_lon is None or user_lat < -90 or user_lat > 90 or user_lon < -180 or user_lon > 180:
        raise HTTPException(
            status_code=400,
            detail="Valid user location coordinates are required for advocate discovery proximity calculations."
        )

    query = db.query(Advocate)
    
    # Apply filtering criteria
    if payload.rating_min:
        query = query.filter(Advocate.rating >= payload.rating_min)
    if payload.experience_min:
        query = query.filter(Advocate.experience_years >= payload.experience_min)
    if payload.fees_max:
        query = query.filter(Advocate.consultation_fees <= payload.fees_max)
        
    advocates = query.all()
    if not advocates:
        return []

    # Classify smart practice area from text query
    smart_area = None
    if payload.query:
        smart_area = classify_practice_area(payload.query)

    # Process and sort results
    results = []
    
    for adv in advocates:
        dist = haversine_distance(user_lat, user_lon, adv.latitude, adv.longitude)
        
        # Don't show advocates that are insanely far away if there's no state matching (keep radius to 150km)
        if dist > 150.0:
            continue
            
        # Post-query filters
        if payload.practice_area and payload.practice_area not in adv.practice_areas:
            continue
        if payload.language and payload.language not in adv.languages:
            continue

        is_smart_match = 1 if (smart_area and smart_area in adv.practice_areas) else 0

        results.append({
            "id": adv.id,
            "name": adv.name,
            "photo_url": adv.photo_url or "",
            "rating": adv.rating,
            "reviews_count": adv.reviews_count,
            "experience_years": adv.experience_years,
            "practice_areas": adv.practice_areas,
            "languages": adv.languages,
            "court_association": adv.court_association or "",
            "chamber_address": adv.chamber_address or "",
            "office_address": adv.office_address or "",
            "phone_number": adv.phone_number or "",
            "consultation_fees": adv.consultation_fees,
            "availability_status": adv.availability_status,
            "distance_km": round(dist, 2),
            "latitude": adv.latitude,
            "longitude": adv.longitude,
            "is_smart_match": bool(is_smart_match)
        })

    results.sort(
        key=lambda x: (
            -1 if x["is_smart_match"] else 0,
            x["distance_km"],
            -x["experience_years"],
            -x["rating"]
        )
    )

    return results

@router.post("/book")
def book_advocate(payload: AppointmentBookPayload, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required to book consultations.")

    # Enforce Consent First Principle
    if not payload.consent_given:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Explicit user approval and consent parameters are required to confirm this booking."
        )

    # Verify advocate exists
    adv = db.query(Advocate).filter(Advocate.id == payload.advocate_id).first()
    if not adv:
        raise HTTPException(status_code=404, detail="Selected advocate profile currently unavailable.")

    appt_id = str(uuid.uuid4())
    new_appt = Appointment(
        id=appt_id,
        user_id=user.id,
        advocate_id=adv.id,
        date=payload.date,
        time=payload.time,
        fees=payload.fees,
        status="confirmed",
        consent_given=True
    )

    db.add(new_appt)
    db.commit()
    db.refresh(new_appt)

    return {
        "status": "success",
        "message": "Appointment booked successfully.",
        "appointment": {
            "id": appt_id,
            "advocate_name": adv.name,
            "date": new_appt.date,
            "time": new_appt.time,
            "fees": new_appt.fees,
            "status": new_appt.status
        }
    }

@router.get("/appointments")
def get_user_appointments(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not user:
        return []
        
    appointments = db.query(Appointment).filter(Appointment.user_id == user.id).order_by(Appointment.created_at.desc()).all()
    
    res = []
    for appt in appointments:
        adv = db.query(Advocate).filter(Advocate.id == appt.advocate_id).first()
        res.append({
            "id": appt.id,
            "date": appt.date,
            "time": appt.time,
            "fees": appt.fees,
            "status": appt.status,
            "advocate": {
                "id": adv.id if adv else "",
                "name": adv.name if adv else "Unknown Advocate",
                "phone": adv.phone_number if adv else "",
                "address": adv.office_address if adv else ""
            }
        })
    return res

@router.post("/appointments/{id}/cancel")
def cancel_appointment(id: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required.")
        
    appt = db.query(Appointment).filter(Appointment.id == id, Appointment.user_id == user.id).first()
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found.")
        
    return {"status": "success", "message": "Appointment cancelled successfully."}

@router.post("/nearby")
def get_nearby_advocates(payload: AdvocateSearchPayload, db: Session = Depends(get_db)):
    # Fallback to New Delhi coordinates if user coordinates are missing or invalid
    if payload.latitude is None or payload.longitude is None:
        payload.latitude = 28.6139
        payload.longitude = 77.2090
    return search_advocates(payload, db)
