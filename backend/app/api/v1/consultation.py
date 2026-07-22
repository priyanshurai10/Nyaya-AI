from fastapi import APIRouter, Depends, HTTPException, status, Form, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import uuid
import random
import os
import shutil
import re

from app.core.database import get_db
from app.models import User, ConsultationRequest, Transaction, AuditLog, PaymentSettings, Notification
from app.core.auth import get_current_user
from app.core.config import settings
from app.core.email_service import send_admin_new_payment_request

router = APIRouter()

def log_audit(db: Session, action_type: str, action_desc: str, user_id: Optional[str] = None):
    audit = AuditLog(
        id=str(uuid.uuid4()),
        timestamp=datetime.utcnow(),
        user_id=user_id,
        action_type=action_type,
        action_description=action_desc,
        result_status="success"
    )
    db.add(audit)
    db.commit()

@router.post("/request")
def create_consultation_request(
    request_type: str = Form(...), # "callback", "email", "pay_now"
    service_name: str = Form(...),
    full_name: str = Form(...),
    mobile_number: Optional[str] = Form(None),
    email: Optional[str] = Form(None),
    preferred_language: Optional[str] = Form(None),
    legal_issue_type: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")
        
    clean_name = full_name.strip()
    if not clean_name:
        raise HTTPException(status_code=400, detail="Full name is required and cannot be empty.")

    if request_type == "callback":
        if not mobile_number:
            raise HTTPException(status_code=400, detail="Mobile number is required for callback requests.")
        clean_mobile = re.sub(r"\D", "", mobile_number)
        if len(clean_mobile) != 10:
            raise HTTPException(status_code=400, detail="Please enter a valid 10-digit mobile number.")
        mobile_number = clean_mobile
    elif request_type == "email":
        if not email:
            raise HTTPException(status_code=400, detail="Email address is required for email consultations.")
        clean_email = email.strip()
        email_regex = r"^[\w\.-]+@[\w\.-]+\.\w+$"
        if not re.match(email_regex, clean_email):
            raise HTTPException(status_code=400, detail="Please enter a valid email address.")
        email = clean_email
        
    req_id = str(uuid.uuid4())
    display_id = f"NYA-{datetime.now().year}-{random.randint(100000, 999999)}"
    
    status_str = "Callback Requested" if request_type == "callback" else "Email Consultation Requested" if request_type == "email" else "Requested"
    
    new_req = ConsultationRequest(
        id=req_id,
        consultation_id=display_id,
        user_id=user.id,
        service_name=service_name,
        request_type=request_type,
        full_name=clean_name,
        mobile_number=mobile_number,
        email=email,
        preferred_language=preferred_language,
        legal_issue_type=legal_issue_type,
        description=description,
        status=status_str
    )
    db.add(new_req)
    
    log_audit(db, "Consultation Request Created", f"Created {request_type} consultation request for {service_name}", user.id)
    
    return {
        "success": True,
        "message": "Consultation requested successfully",
        "data": {
            "id": req_id,
            "consultation_id": display_id,
            "status": status_str
        }
    }

@router.post("/payment/submit")
def submit_payment(
    service_name: str = Form(...),
    amount: int = Form(...),
    payment_method: str = Form(...), # "upi", "qr", "card", "netbanking"
    full_name: Optional[str] = Form(None),
    mobile_number: Optional[str] = Form(None),
    preferred_language: Optional[str] = Form(None),
    legal_issue_type: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    tx_id = str(uuid.uuid4())
    tx = Transaction(
        id=tx_id,
        user_id=user.id,
        amount=amount,
        payment_method=payment_method,
        status="pending",
        created_at=datetime.utcnow()
    )
    db.add(tx)
    
    # Use provided details or fallback to logged-in user details
    clean_name = full_name.strip() if (full_name and full_name.strip()) else user.name
    clean_mobile = mobile_number if mobile_number else user.mobile
    
    req_id = str(uuid.uuid4())
    display_id = f"NYA-{datetime.now().year}-{random.randint(100000, 999999)}"
    req = ConsultationRequest(
        id=req_id,
        consultation_id=display_id,
        user_id=user.id,
        service_name=service_name,
        request_type="pay_now",
        full_name=clean_name,
        mobile_number=clean_mobile,
        email=user.email,
        preferred_language=preferred_language,
        legal_issue_type=legal_issue_type,
        description=description,
        status="Pending Payment Verification",
        transaction_id=tx_id,
        created_at=datetime.utcnow()
    )
    db.add(req)
    db.commit()
    
    log_audit(db, "Payment Initiated", f"Initiated {payment_method} payment for {service_name}", user.id)
    return {"success": True, "transaction_id": tx_id, "consultation_id": req_id, "display_id": display_id, "message": "Payment initiated."}

@router.post("/payment/verify/{tx_id}")
def verify_payment(
    tx_id: str,
    utr_number: str = Form(...),
    screenshot: UploadFile = File(...),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    tx = db.query(Transaction).filter(Transaction.id == tx_id, Transaction.user_id == user.id).first()
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found.")
        
    req = db.query(ConsultationRequest).filter(ConsultationRequest.transaction_id == tx_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Consultation Request not found.")

    if not screenshot.filename:
        raise HTTPException(status_code=400, detail="Screenshot is required.")

    # Save screenshot
    ext = os.path.splitext(screenshot.filename)[1]
    filename = f"tx_{tx_id}{ext}"
    filepath = os.path.join(settings.UPLOAD_DIR, filename)
    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(screenshot.file, buffer)

    tx.utr_number = utr_number
    tx.screenshot_path = f"/uploads/{filename}"
    tx.status = "under_review"
    
    req.status = "Payment Under Review"

    # Create user notification in DB
    notif = Notification(
        id=str(uuid.uuid4()),
        user_id=user.id,
        title="Payment Submitted",
        message=f"Your payment request for {req.service_name} (UTR: {utr_number}) has been submitted and is under review.",
        category="PAYMENT",
        is_read=False,
        created_at=datetime.utcnow()
    )
    db.add(notif)
    db.commit()

    # Automatically send email to Admin immediately after payment request
    try:
        send_admin_new_payment_request(
            user_name=req.full_name or user.name,
            user_email=req.email or user.email or "",
            user_mobile=req.mobile_number or getattr(user, "phone", "") or "",
            legal_issue=req.legal_issue_type or req.service_name,
            amount=float(tx.amount),
            utr_number=utr_number,
            payment_id=tx.id,
            screenshot_path=filepath,
            submitted_at=tx.created_at or datetime.utcnow()
        )
    except Exception as e:
        print(f"[ADMIN_EMAIL_ERROR] {e}")
    
    log_audit(db, "Payment Verified", f"Submitted UTR {utr_number} for review", user.id)
    return {"success": True, "message": "Payment details submitted for review successfully."}

@router.get("/orders")
def list_orders(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    orders = db.query(ConsultationRequest).filter(ConsultationRequest.user_id == user.id).order_by(ConsultationRequest.created_at.desc()).all()
    res = []
    for o in orders:
        res.append({
            "id": o.id,
            "consultation_id": o.consultation_id,
            "service_name": o.service_name,
            "request_type": o.request_type,
            "status": o.status,
            "created_at": o.created_at.isoformat(),
            "transaction": None # simplified
        })
    return {"success": True, "data": res}
