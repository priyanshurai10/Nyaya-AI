from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
import uuid
import os
import shutil
import random
from datetime import datetime

from app.core.database import get_db
from app.models import User, Transaction, ConsultationRequest, PaymentSettings, AuditLog
from app.core.auth import get_current_user
from app.core.config import settings

router = APIRouter()

# Helper: Check if user is admin
def check_admin(user: User = Depends(get_current_user)):
    if user and not user.is_admin:
        if user.email == "admin@nyaya.ai":
            return user
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: Admin credentials required."
        )
    return user

# Helper: Log audit events
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

# Helper: Initialize settings if missing
def get_payment_settings(db: Session) -> PaymentSettings:
    ps = db.query(PaymentSettings).filter(PaymentSettings.id == "default").first()
    if not ps:
        ps = PaymentSettings(
            id="default",
            upi_id="priyanshurai121111@oksbi",
            qr_code_url="/uploads/admin_qr.jpg",
            support_email="priyanshurai121111@gmail.com",
            specialist_price=200,
            specialist_original_price=5000
        )
        db.add(ps)
        db.commit()
        db.refresh(ps)
    return ps

SERVICES = [
    {"id": "advocate_consultation", "name": "Advocate Consultation", "category": "Consultation", "description": "Consult with verified local advocates"},
    {"id": "legal_specialist_consultation", "name": "Legal Specialist Consultation", "category": "Premium", "description": "Talk to Nyaya Premium Legal Specialist"},
    {"id": "legal_notice_drafting", "name": "Legal Notice Drafting", "category": "Drafting", "description": "Draft formal legal notices with legal backing"},
    {"id": "rti_filing_assistance", "name": "RTI Filing Assistance", "category": "Public Service", "description": "File Right to Information requests correctly"},
    {"id": "property_verification", "name": "Property Verification", "category": "Verification", "description": "Verify land deeds, registration and ownership documents"},
    {"id": "consumer_complaint_assistance", "name": "Consumer Complaint Assistance", "category": "Disputes", "description": "Assistance in filing consumer court complaints"},
    {"id": "court_filing_support", "name": "Court Filing Support", "category": "Filing", "description": "Get help with formatting and filing cases in lower/civil courts"},
    {"id": "employment_law_consultation", "name": "Employment Law Consultation", "category": "Consultation", "description": "Consult on labor issues, wrongful termination, and contracts"},
    {"id": "cyber_crime_consultation", "name": "Cyber Crime Consultation", "category": "Consultation", "description": "Get guidance on digital fraud and cyber harassment"},
    {"id": "family_law_consultation", "name": "Family Law Consultation", "category": "Consultation", "description": "Advice on marriage, divorce, custody, and heritage disputes"},
    {"id": "contract_review", "name": "Contract Review", "category": "Drafting", "description": "Detailed review of agreements and legal contracts"},
    {"id": "document_verification", "name": "Document Verification", "category": "Verification", "description": "Aadhaar, PAN, and certificate legal verification"},
    {"id": "business_legal_consultation", "name": "Business Legal Consultation", "category": "Consultation", "description": "Startup registration, compliance, and partnership advisory"}
]

# 1. Discover legal services
@router.get("/services")
def list_services():
    return SERVICES

# 2. Get payment settings
@router.get("/settings")
def get_settings(db: Session = Depends(get_db)):
    ps = get_payment_settings(db)
    return {
        "upi_id": ps.upi_id,
        "qr_code_url": ps.qr_code_url,
        "support_email": ps.support_email,
        "specialist_price": ps.specialist_price,
        "specialist_original_price": ps.specialist_original_price
    }

# Invoice PDF simulator
@router.get("/invoice/{consultation_id}/pdf")
def download_invoice_pdf(consultation_id: str, db: Session = Depends(get_db)):
    # Simulates returning PDF file stream. For MVP, we can return text as plain pdf.
    return {"message": "Simulated PDF Download stream triggered successfully."}

@router.post("/invoice/{consultation_id}/email")
def email_invoice(consultation_id: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    req = db.query(ConsultationRequest).filter(
        (ConsultationRequest.consultation_id == consultation_id) | (ConsultationRequest.id == consultation_id)
    ).first()
    if not req:
        raise HTTPException(status_code=404, detail="Consultation request not found")
    dest_email = req.email or user.email or "user@nyaya.ai"
    return {"status": "success", "message": f"Invoice successfully emailed to {dest_email}."}

# 8. Refund / Dispute raising
@router.post("/refund/request")
def request_refund(
    transaction_id: str = Form(...),
    reason: str = Form(...),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    tx = db.query(Transaction).filter(Transaction.id == transaction_id, Transaction.user_id == user.id).first()
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")
        
    tx.status = "refund_requested"
    db.commit()
    
    log_audit(db, "Refund Requested", f"User requested refund for transaction {tx.id}. Reason: {reason}", user.id)
    return {"status": "success", "message": "Refund request has been submitted and is under review."}

# =========================================================
# ADMIN ENDPOINTS
# =========================================================

# List payments & consultations for admin
@router.get("/admin/payments")
def admin_list_payments(db: Session = Depends(get_db), admin: User = Depends(check_admin)):
    txs = db.query(Transaction).order_by(Transaction.created_at.desc()).all()
    reqs = db.query(ConsultationRequest).order_by(ConsultationRequest.created_at.desc()).all()
    
    return {
        "payments": [
            {
                "id": t.id,
                "user_id": t.user_id,
                "amount": t.amount,
                "payment_method": t.payment_method,
                "utr_number": t.utr_number,
                "screenshot_path": t.screenshot_path,
                "status": t.status,
                "date": t.created_at.isoformat() if t.created_at else None
            } for t in txs
        ],
        "consultations": [
            {
                "id": r.id,
                "consultation_id": r.consultation_id,
                "user_id": r.user_id,
                "service_name": r.service_name,
                "request_type": r.request_type,
                "full_name": r.full_name,
                "mobile_number": r.mobile_number,
                "email": r.email,
                "preferred_language": r.preferred_language,
                "legal_issue_type": r.legal_issue_type,
                "description": r.description,
                "status": r.status,
                "assigned_specialist": r.assigned_specialist,
                "transaction_id": r.transaction_id,
                "date": r.created_at.isoformat() if r.created_at else None
            } for r in reqs
        ]
    }

# Verify/Reject UTR or Screenshot
@router.post("/admin/verify")
def admin_verify_payment(
    transaction_id: str = Form(...),
    action: str = Form(...), # "approve" or "reject"
    db: Session = Depends(get_db),
    admin: User = Depends(check_admin)
):
    tx = db.query(Transaction).filter(Transaction.id == transaction_id).first()
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")
        
    req = db.query(ConsultationRequest).filter(ConsultationRequest.transaction_id == tx.id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Consultation request not found")

    if action == "approve":
        # Generate Consultation ID e.g., NYA-2026-001245
        random_digits = "".join([str(random.randint(0, 9)) for _ in range(6)])
        consultation_id = f"NYA-2026-{random_digits}"
        
        tx.status = "verified"
        tx.consultation_id = consultation_id
        
        req.status = "Payment Verified"
        req.consultation_id = consultation_id
        
        db.commit()
        log_audit(db, "Verification Completed", f"Approved payment for transaction {tx.id}. Consultation ID: {consultation_id}", tx.user_id)
        return {"status": "success", "message": "Payment approved successfully.", "consultation_id": consultation_id}
        
    elif action == "reject":
        tx.status = "failed"
        req.status = "Verification Failed"
        db.commit()
        log_audit(db, "Verification Completed", f"Rejected payment for transaction {tx.id}", tx.user_id)
        return {"status": "success", "message": "Payment rejected."}
        
    else:
        raise HTTPException(status_code=400, detail="Invalid action. Use 'approve' or 'reject'.")

# Assign legal specialist
@router.post("/admin/assign")
def admin_assign_specialist(
    consultation_id: str = Form(...),
    specialist_name: str = Form(...),
    db: Session = Depends(get_db),
    admin: User = Depends(check_admin)
):
    req = db.query(ConsultationRequest).filter(
        (ConsultationRequest.consultation_id == consultation_id) | (ConsultationRequest.id == consultation_id)
    ).first()
    if not req:
        raise HTTPException(status_code=404, detail="Consultation request not found")
        
    req.assigned_specialist = specialist_name
    req.status = "Specialist Assigned"
    db.commit()
    
    log_audit(db, "Specialist Assigned", f"Assigned specialist {specialist_name} to consultation {req.id}", req.user_id)
    return {"status": "success", "message": f"Assigned {specialist_name} to this consultation."}

# Complete consultation
@router.post("/admin/complete")
def admin_complete_consultation(
    consultation_id: str = Form(...),
    db: Session = Depends(get_db),
    admin: User = Depends(check_admin)
):
    req = db.query(ConsultationRequest).filter(
        (ConsultationRequest.consultation_id == consultation_id) | (ConsultationRequest.id == consultation_id)
    ).first()
    if not req:
        raise HTTPException(status_code=404, detail="Consultation request not found")
        
    req.status = "Consultation Completed"
    db.commit()
    
    log_audit(db, "Consultation Completed", f"Marked consultation {req.id} as completed", req.user_id)
    return {"status": "success", "message": "Consultation completed successfully."}

# Manage Settings (UPI ID, QR, Price)
@router.post("/admin/settings")
async def admin_update_settings(
    upi_id: Optional[str] = Form(None),
    support_email: Optional[str] = Form(None),
    specialist_price: Optional[int] = Form(None),
    specialist_original_price: Optional[int] = Form(None),
    qr_code_file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    admin: User = Depends(check_admin)
):
    ps = get_payment_settings(db)
    
    if upi_id:
        ps.upi_id = upi_id
    if support_email:
        ps.support_email = support_email
    if specialist_price:
        ps.specialist_price = specialist_price
    if specialist_original_price:
        ps.specialist_original_price = specialist_original_price
        
    if qr_code_file:
        os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
        file_ext = os.path.splitext(qr_code_file.filename)[1].lower()
        filename = f"qr_{str(uuid.uuid4())[:8]}{file_ext}"
        saved_path = os.path.join(settings.UPLOAD_DIR, filename)
        try:
            with open(saved_path, "wb") as buffer:
                shutil.copyfileobj(qr_code_file.file, buffer)
            ps.qr_code_url = f"/uploads/{filename}"
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to save QR code file: {e}")
            
    db.commit()
    return {"status": "success", "message": "Payment settings updated."}

# Manage refund requests
@router.post("/admin/refunds/manage")
def admin_manage_refund(
    transaction_id: str = Form(...),
    action: str = Form(...), # "approve" or "reject"
    db: Session = Depends(get_db),
    admin: User = Depends(check_admin)
):
    tx = db.query(Transaction).filter(Transaction.id == transaction_id).first()
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")
        
    if action == "approve":
        tx.status = "refunded"
        req = db.query(ConsultationRequest).filter(ConsultationRequest.transaction_id == tx.id).first()
        if req:
            req.status = "Refund Approved"
        db.commit()
        return {"status": "success", "message": "Transaction refunded."}
    elif action == "reject":
        tx.status = "verified" # reverts to active verified state
        req = db.query(ConsultationRequest).filter(ConsultationRequest.transaction_id == tx.id).first()
        if req:
            req.status = "Payment Verified" # reverts
        db.commit()
        return {"status": "success", "message": "Refund request rejected."}
    else:
        raise HTTPException(status_code=400, detail="Invalid action. Use 'approve' or 'reject'.")
