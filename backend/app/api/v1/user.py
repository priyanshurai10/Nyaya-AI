import uuid
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models import User, SavedCase, CourtBookmark, SearchHistory, Court, Transaction, ConsultationRequest, UserProgress
from app.core.auth import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter()

# ─── Pydantic Schemas ───
class UserRegister(BaseModel):
    name: str
    email: Optional[EmailStr] = None
    mobile: Optional[str] = None
    password: str
    language_preference: str = "en"

class UserLogin(BaseModel):
    username: str  # Can be email or mobile
    password: str

class OTPSendRequest(BaseModel):
    mobile: str

class OTPVerifyRequest(BaseModel):
    mobile: str
    otp: str

class CaseSavePayload(BaseModel):
    title: str
    category: str
    summary: Optional[str] = None

class BookmarkTogglePayload(BaseModel):
    court_id: str

class LocationUpdatePayload(BaseModel):
    village: Optional[str] = None
    town: Optional[str] = None
    city: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class ResolvedLocationSchema(BaseModel):
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    city: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    village: Optional[str] = None
    town: Optional[str] = None
    display_name: Optional[str] = None

class ResolvedLocationPayload(BaseModel):
    location: ResolvedLocationSchema

# ─── Auth Routes ───

@router.post("/register")
def register_user(payload: UserRegister, db: Session = Depends(get_db)):
    # Validate payload (must have email or mobile)
    if not payload.email and not payload.mobile:
        raise HTTPException(
            status_code=400,
            detail="Registration requires either an email address or mobile number."
        )

    # Check for existing email/mobile - Enforce unique register messages
    if payload.email:
        existing_email = db.query(User).filter(User.email == payload.email).first()
        if existing_email:
            raise HTTPException(status_code=400, detail="Account already exists. Please login.")
            
    if payload.mobile:
        existing_mobile = db.query(User).filter(User.mobile == payload.mobile).first()
        if existing_mobile:
            raise HTTPException(status_code=400, detail="Account already exists. Please login.")

    hashed = hash_password(payload.password)
    user_id = str(uuid.uuid4())
    
    new_user = User(
        id=user_id,
        name=payload.name,
        email=payload.email,
        mobile=payload.mobile,
        password_hash=hashed,
        language_preference=payload.language_preference,
        last_login=datetime.utcnow()
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Generate Token
    token = create_access_token(data={"sub": user_id})
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user_id,
            "name": new_user.name,
            "email": new_user.email,
            "mobile": new_user.mobile,
            "language_preference": new_user.language_preference,
            "location_village": new_user.location_village,
            "location_town": new_user.location_town,
            "location_city": new_user.location_city,
            "location_district": new_user.location_district,
            "location_state": new_user.location_state,
            "location_pincode": new_user.location_pincode,
            "location_latitude": new_user.location_latitude,
            "location_longitude": new_user.location_longitude,
            "last_login": new_user.last_login.isoformat() if new_user.last_login else None
        }
    }

@router.post("/login")
def login_user(payload: UserLogin, db: Session = Depends(get_db)):
    # Try searching by email first, then mobile
    user = db.query(User).filter(
        (User.email == payload.username) | (User.mobile == payload.username)
    ).first()
    
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username (email/mobile) or password",
        )
        
    # Update last login time
    user.last_login = datetime.utcnow()
    db.commit()
    db.refresh(user)

    token = create_access_token(data={"sub": user.id})
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "mobile": user.mobile,
            "language_preference": user.language_preference,
            "location_village": user.location_village,
            "location_town": user.location_town,
            "location_city": user.location_city,
            "location_district": user.location_district,
            "location_state": user.location_state,
            "location_pincode": user.location_pincode,
            "location_latitude": user.location_latitude,
            "location_longitude": user.location_longitude,
            "last_login": user.last_login.isoformat() if user.last_login else None
        }
    }

@router.post("/otp/send")
def send_otp(payload: OTPSendRequest):
    # Simulated OTP dispatcher
    print(f"[OTP SIMULATOR] Dispatched OTP code 123456 to {payload.mobile}")
    return {"status": "success", "message": "OTP verification code sent to mobile number."}

@router.post("/otp/verify")
def verify_otp(payload: OTPVerifyRequest, db: Session = Depends(get_db)):
    # Simple simulated OTP check
    if payload.otp != "123456":
        raise HTTPException(status_code=400, detail="Invalid OTP code entered.")
        
    # Check if user already exists
    user = db.query(User).filter(User.mobile == payload.mobile).first()
    
    token = None
    user_data = None
    if user:
        user.last_login = datetime.utcnow()
        db.commit()
        db.refresh(user)
        
        token = create_access_token(data={"sub": user.id})
        user_data = {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "mobile": user.mobile,
            "language_preference": user.language_preference,
            "location_village": user.location_village,
            "location_town": user.location_town,
            "location_city": user.location_city,
            "location_district": user.location_district,
            "location_state": user.location_state,
            "location_pincode": user.location_pincode,
            "location_latitude": user.location_latitude,
            "location_longitude": user.location_longitude,
            "last_login": user.last_login.isoformat() if user.last_login else None
        }
        
    return {
        "status": "verified",
        "registered": bool(user),
        "access_token": token,
        "user": user_data
    }

# ─── User Profile & Dashboard Data ───

@router.get("/profile")
def get_profile(user: User = Depends(get_current_user)):
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required for profile access.")
        
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "mobile": user.mobile,
        "language_preference": user.language_preference,
        "location_village": user.location_village,
        "location_town": user.location_town,
        "location_city": user.location_city,
        "location_district": user.location_district,
        "location_state": user.location_state,
        "location_pincode": user.location_pincode,
        "location_latitude": user.location_latitude,
        "location_longitude": user.location_longitude,
        "last_login": user.last_login.isoformat() if user.last_login else None,
        "created_at": user.created_at.isoformat()
    }

@router.post("/location/update")
def update_user_location(payload: LocationUpdatePayload, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required to update location.")
        
    user.location_village = payload.village
    user.location_town = payload.town
    user.location_city = payload.city
    user.location_district = payload.district
    user.location_state = payload.state
    user.location_pincode = payload.pincode
    user.location_latitude = payload.latitude
    user.location_longitude = payload.longitude
    
    db.commit()
    db.refresh(user)
    
    return {
        "status": "success",
        "message": "User location updated successfully.",
        "location": {
            "village": user.location_village,
            "town": user.location_town,
            "city": user.location_city,
            "district": user.location_district,
            "state": user.location_state,
            "pincode": user.location_pincode,
            "latitude": user.location_latitude,
            "longitude": user.location_longitude
        }
    }

# ─── Saved Cases / Disputes ───

@router.post("/case/save")
def save_case(payload: CaseSavePayload, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required to save cases.")
        
    case_id = str(uuid.uuid4())
    new_case = SavedCase(
        id=case_id,
        user_id=user.id,
        title=payload.title,
        category=payload.category,
        summary=payload.summary
    )
    
    db.add(new_case)
    db.commit()
    db.refresh(new_case)
    
    return {"status": "success", "case_id": case_id, "message": "Case saved to profile successfully."}

@router.get("/cases")
def get_cases(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not user:
        return []
    cases = db.query(SavedCase).filter(SavedCase.user_id == user.id).order_by(SavedCase.created_at.desc()).all()
    return [
        {
            "id": c.id,
            "title": c.title,
            "category": c.category,
            "summary": c.summary,
            "status": c.status,
            "created_at": c.created_at.isoformat()
        }
        for c in cases
    ]

# ─── Court Bookmarks ───

@router.post("/bookmark/toggle")
def toggle_bookmark(payload: BookmarkTogglePayload, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required to bookmark courts.")
        
    existing = db.query(CourtBookmark).filter(
        CourtBookmark.user_id == user.id,
        CourtBookmark.court_id == payload.court_id
    ).first()
    
    if existing:
        db.delete(existing)
        db.commit()
        return {"status": "removed", "message": "Court bookmark removed successfully."}
    else:
        new_bookmark = CourtBookmark(
            id=str(uuid.uuid4()),
            user_id=user.id,
            court_id=payload.court_id
        )
        db.add(new_bookmark)
        db.commit()
        return {"status": "added", "message": "Court bookmarked successfully."}

@router.get("/bookmarks")
def get_bookmarks(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not user:
        return []
    bookmarks = db.query(CourtBookmark).filter(CourtBookmark.user_id == user.id).all()
    res = []
    for b in bookmarks:
        court = db.query(Court).filter(Court.id == b.court_id).first()
        if court:
            res.append({
                "bookmark_id": b.id,
                "court_id": court.id,
                "name": court.name,
                "court_type": court.court_type,
                "address": court.address,
                "latitude": court.latitude,
                "longitude": court.longitude
            })
    return res

@router.delete("/wipe-profile")
def wipe_user_profile(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required.")
        
    db.delete(user)
    db.commit()
    
    return {
        "status": "success", 
        "message": "All profile credentials, document logs, case files, and geocoding history have been permanently wiped."
    }

@router.get("/dashboard")
def get_dashboard(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")
        
    consultations = db.query(ConsultationRequest).filter(ConsultationRequest.user_id == user.id).order_by(ConsultationRequest.created_at.desc()).all()
    transactions = db.query(Transaction).filter(Transaction.user_id == user.id).order_by(Transaction.created_at.desc()).all()
    bookmarks = db.query(CourtBookmark).filter(CourtBookmark.user_id == user.id).order_by(CourtBookmark.created_at.desc()).all()
    progress = db.query(UserProgress).filter(UserProgress.user_id == user.id).order_by(UserProgress.last_accessed.desc()).all()
    
    # Map snake_case to camelCase
    mapped_consultations = []
    for c in consultations:
        mapped_consultations.append({
            "id": c.id,
            "userId": c.user_id,
            "name": c.name,
            "mobile": c.mobile,
            "language": c.language,
            "time": c.time,
            "category": c.category,
            "summary": c.summary,
            "status": c.status,
            "upiId": c.upi_id,
            "utr": c.utr,
            "screenshotUrl": c.screenshot_url,
            "adminRemarks": c.admin_remarks,
            "createdAt": c.created_at.isoformat() if c.created_at else None,
            "updatedAt": c.updated_at.isoformat() if c.updated_at else None,
        })
        
    mapped_transactions = []
    for t in transactions:
        mapped_transactions.append({
            "id": t.id,
            "userId": t.user_id,
            "consultationId": t.consultation_id,
            "amount": t.amount,
            "utr": t.utr,
            "screenshotUrl": t.screenshot_url,
            "status": t.status,
            "paymentMethod": t.payment_method,
            "remarks": t.remarks,
            "createdAt": t.created_at.isoformat() if t.created_at else None,
            "updatedAt": t.updated_at.isoformat() if t.updated_at else None,
            "approvedAt": t.approved_at.isoformat() if t.approved_at else None,
            "approvedBy": t.approved_by,
        })
        
    mapped_bookmarks = []
    for b in bookmarks:
        mapped_bookmarks.append({
            "id": b.id,
            "userId": b.user_id,
            "type": "court",
            "contentId": b.court_id,
            "createdAt": b.created_at.isoformat() if b.created_at else None,
        })
        
    mapped_progress = []
    for p in progress:
        mapped_progress.append({
            "id": p.id,
            "userId": p.user_id,
            "courseId": p.course_id,
            "lessonId": p.lesson_id,
            "moduleId": p.module_id,
            "status": p.status,
            "progressPct": p.progress_pct,
            "lastAccessed": p.last_accessed.isoformat() if p.last_accessed else None,
            "quizScore": p.quiz_score,
        })
        
    return {
        "success": True,
        "data": {
            "consultations": mapped_consultations,
            "transactions": mapped_transactions,
            "bookmarks": mapped_bookmarks,
            "progress": mapped_progress
        },
        "message": "Dashboard data retrieved."
    }

@router.post("/location")
def save_location(payload: ResolvedLocationPayload, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")
        
    loc = payload.location
    user.location_village = loc.village
    user.location_town = loc.town
    user.location_city = loc.city
    user.location_district = loc.district
    user.location_state = loc.state
    user.location_pincode = loc.pincode
    user.location_latitude = loc.latitude
    user.location_longitude = loc.longitude
    
    db.commit()
    db.refresh(user)
    
    return {
        "success": True,
        "message": "Location saved successfully"
    }

