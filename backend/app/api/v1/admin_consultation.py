"""
Enhanced Admin Consultation API with full RBAC, CRUD, email triggers, and audit logs.
Super Admin only: priyanshurai121111@gmail.com
"""
from fastapi import APIRouter, Depends, HTTPException, status, Form, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc, or_, func
from datetime import datetime, timedelta
from typing import Optional, List
import uuid
import os

from app.core.database import get_db
from app.models import User, ConsultationRequest, Transaction, AuditLog, Notification
from app.core.auth import get_current_user
from app.core.email_service import (
    send_user_payment_verified,
    send_user_payment_declined,
    send_user_consultation_scheduled,
    send_user_consultation_completed,
)

SUPER_ADMIN_EMAIL = "priyanshurai121111@gmail.com"

router = APIRouter()


def require_super_admin(user: Optional[User] = Depends(get_current_user)) -> User:
    """Enforce super-admin check by email on EVERY admin route."""
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required."
        )
    if user.email != SUPER_ADMIN_EMAIL:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Super Admin access required. This action is restricted to the system administrator."
        )
    return user


def _create_notification(db: Session, user_id: str, title: str, message: str, category: str, payment_id: Optional[str] = None, consultation_id: Optional[str] = None):
    notif = Notification(
        id=str(uuid.uuid4()),
        user_id=user_id,
        title=title,
        message=message,
        category=category,
        is_read=False,
        created_at=datetime.utcnow(),
    )
    db.add(notif)


def _audit(db: Session, admin_email: str, action: str, target_id: str, notes: str = ""):
    log = AuditLog(
        id=str(uuid.uuid4()),
        timestamp=datetime.utcnow(),
        user_id=admin_email,
        action_type=action,
        action_description=f"[{target_id}] {notes}",
        result_status="success"
    )
    db.add(log)


# ─────────────────────────────────────────────
# PAYMENT MANAGEMENT
# ─────────────────────────────────────────────

@router.get("/payments")
def list_all_payments(
    status_filter: Optional[str] = Query(None, alias="status"),
    search: Optional[str] = Query(None),
    skip: int = Query(0),
    limit: int = Query(50),
    db: Session = Depends(get_db),
    admin: User = Depends(require_super_admin),
):
    """List all payment requests with optional filter and search."""
    query = db.query(Transaction)

    if status_filter and status_filter != "ALL":
        query = query.filter(Transaction.status == status_filter.lower())

    if search:
        s = f"%{search}%"
        # Join with ConsultationRequest to search by name/email/mobile/UTR
        query = query.join(
            ConsultationRequest,
            ConsultationRequest.transaction_id == Transaction.id,
            isouter=True
        ).filter(
            or_(
                ConsultationRequest.full_name.ilike(s),
                ConsultationRequest.email.ilike(s),
                ConsultationRequest.mobile_number.ilike(s),
                Transaction.utr_number.ilike(s),
                Transaction.id.ilike(s),
            )
        )

    total = query.count()
    transactions = query.order_by(desc(Transaction.created_at)).offset(skip).limit(limit).all()

    result = []
    for tx in transactions:
        req = db.query(ConsultationRequest).filter(ConsultationRequest.transaction_id == tx.id).first()
        user = db.query(User).filter(User.id == tx.user_id).first() if tx.user_id else None
        result.append({
            "payment_id": tx.id,
            "user_id": tx.user_id,
            "user_name": req.full_name if req else (user.name if user else "Unknown"),
            "user_email": req.email if req else (user.email if user else ""),
            "user_mobile": req.mobile_number if req else "",
            "legal_issue": req.legal_issue_type if req else "",
            "description": req.description if req else "",
            "amount": tx.amount,
            "utr_number": tx.utr_number,
            "screenshot_url": tx.screenshot_path,
            "status": tx.status,
            "payment_method": tx.payment_method,
            "consultation_id": req.id if req else None,
            "consultation_display_id": req.consultation_id if req else None,
            "created_at": tx.created_at.isoformat() if tx.created_at else None,
            "updated_at": tx.updated_at.isoformat() if tx.updated_at else None,
        })

    return {"success": True, "total": total, "data": result}


@router.post("/payments/{payment_id}/verify")
def verify_payment(
    payment_id: str,
    admin_notes: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    admin: User = Depends(require_super_admin),
):
    """Mark a payment as verified, trigger email + notification."""
    tx = db.query(Transaction).filter(Transaction.id == payment_id).first()
    if not tx:
        raise HTTPException(status_code=404, detail="Payment not found.")
    if tx.status == "verified":
        raise HTTPException(status_code=400, detail="Payment already verified.")

    tx.status = "verified"
    tx.updated_at = datetime.utcnow()

    req = db.query(ConsultationRequest).filter(ConsultationRequest.transaction_id == tx.id).first()
    if req:
        req.status = "Payment Verified – Awaiting Schedule"
        req.updated_at = datetime.utcnow()

    _audit(db, admin.email, "PAYMENT_VERIFIED", payment_id, admin_notes or "")

    # Fetch user for notification + email
    user = db.query(User).filter(User.id == tx.user_id).first()
    if user:
        _create_notification(
            db, user.id,
            "✅ Payment Verified!",
            f"Your payment of ₹{tx.amount:.0f} has been verified. Your consultation will be scheduled soon.",
            "PAYMENT",
        )
        send_user_payment_verified(
            user_email=user.email or "",
            user_name=user.name,
            payment_id=payment_id,
            amount=tx.amount,
        )

    db.commit()
    return {"success": True, "message": "Payment verified successfully. User notified via email."}


@router.post("/payments/{payment_id}/decline")
def decline_payment(
    payment_id: str,
    reason: str = Form(...),
    db: Session = Depends(get_db),
    admin: User = Depends(require_super_admin),
):
    """Decline a payment with a reason, trigger email + notification."""
    tx = db.query(Transaction).filter(Transaction.id == payment_id).first()
    if not tx:
        raise HTTPException(status_code=404, detail="Payment not found.")

    tx.status = "declined"
    tx.updated_at = datetime.utcnow()

    req = db.query(ConsultationRequest).filter(ConsultationRequest.transaction_id == tx.id).first()
    if req:
        req.status = "Payment Declined"
        req.updated_at = datetime.utcnow()

    _audit(db, admin.email, "PAYMENT_DECLINED", payment_id, reason)

    user = db.query(User).filter(User.id == tx.user_id).first()
    if user:
        _create_notification(
            db, user.id,
            "❌ Payment Declined",
            f"Your payment for ₹{tx.amount:.0f} could not be verified. Reason: {reason}",
            "PAYMENT",
        )
        send_user_payment_declined(
            user_email=user.email or "",
            user_name=user.name,
            payment_id=payment_id,
            reason=reason,
        )

    db.commit()
    return {"success": True, "message": "Payment declined. User notified via email."}


# ─────────────────────────────────────────────
# CONSULTATION MANAGEMENT
# ─────────────────────────────────────────────

@router.get("/consultations")
def list_all_consultations(
    status_filter: Optional[str] = Query(None, alias="status"),
    search: Optional[str] = Query(None),
    skip: int = Query(0),
    limit: int = Query(50),
    db: Session = Depends(get_db),
    admin: User = Depends(require_super_admin),
):
    """List all consultations with optional status filter and search."""
    query = db.query(ConsultationRequest)

    if status_filter and status_filter != "ALL":
        query = query.filter(ConsultationRequest.status.ilike(f"%{status_filter}%"))

    if search:
        s = f"%{search}%"
        query = query.filter(
            or_(
                ConsultationRequest.full_name.ilike(s),
                ConsultationRequest.email.ilike(s),
                ConsultationRequest.mobile_number.ilike(s),
                ConsultationRequest.consultation_id.ilike(s),
                ConsultationRequest.id.ilike(s),
            )
        )

    total = query.count()
    consultations = query.order_by(desc(ConsultationRequest.created_at)).offset(skip).limit(limit).all()

    result = []
    for c in consultations:
        tx = db.query(Transaction).filter(Transaction.id == c.transaction_id).first() if c.transaction_id else None
        result.append({
            "id": c.id,
            "consultation_id": c.consultation_id,
            "user_id": c.user_id,
            "full_name": c.full_name,
            "email": c.email,
            "mobile": c.mobile_number,
            "legal_issue": c.legal_issue_type,
            "description": c.description,
            "preferred_language": c.preferred_language,
            "status": c.status,
            "scheduled_date": getattr(c, "scheduled_date", None),
            "scheduled_time": getattr(c, "scheduled_time", None),
            "meeting_mode": getattr(c, "meeting_mode", "PHONE"),
            "amount": tx.amount if tx else None,
            "utr_number": tx.utr_number if tx else None,
            "screenshot_url": tx.screenshot_path if tx else None,
            "created_at": c.created_at.isoformat() if c.created_at else None,
            "updated_at": c.updated_at.isoformat() if c.updated_at else None,
        })

    return {"success": True, "total": total, "data": result}


@router.post("/consultations/{consultation_id}/schedule")
def schedule_consultation(
    consultation_id: str,
    scheduled_date: str = Form(...),
    scheduled_time: str = Form(...),
    meeting_mode: str = Form("PHONE"),  # PHONE, WHATSAPP, GOOGLE_MEET
    admin_notes: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    admin: User = Depends(require_super_admin),
):
    """Schedule a consultation with date, time, and meeting mode."""
    if meeting_mode not in ("PHONE", "WHATSAPP", "GOOGLE_MEET"):
        raise HTTPException(status_code=400, detail="meeting_mode must be PHONE, WHATSAPP, or GOOGLE_MEET")

    req = db.query(ConsultationRequest).filter(ConsultationRequest.id == consultation_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Consultation not found.")

    # Dynamically add scheduling columns if they don't exist via setattr
    req.status = "Consultation Scheduled"
    req.updated_at = datetime.utcnow()
    try:
        req.scheduled_date = scheduled_date
        req.scheduled_time = scheduled_time
        req.meeting_mode = meeting_mode
        req.assigned_specialist = admin.name if hasattr(admin, "name") else "Senior Legal Specialist"
    except Exception:
        pass

    _audit(db, admin.email, "CONSULTATION_SCHEDULED", consultation_id,
           f"Date: {scheduled_date} {scheduled_time}, Mode: {meeting_mode}")

    user = db.query(User).filter(User.id == req.user_id).first()
    if user:
        _create_notification(
            db, user.id,
            "📅 Consultation Scheduled!",
            f"Your consultation has been scheduled for {scheduled_date} at {scheduled_time} via {meeting_mode.replace('_', ' ').title()}.",
            "CONSULTATION",
        )
        send_user_consultation_scheduled(
            user_email=user.email or "",
            user_name=user.name,
            payment_id=req.transaction_id or "",
            consultation_id=req.consultation_id or req.id,
            scheduled_date=scheduled_date,
            scheduled_time=scheduled_time,
            meeting_mode=meeting_mode,
        )

    db.commit()
    return {"success": True, "message": "Consultation scheduled. User notified via email."}


@router.post("/consultations/{consultation_id}/complete")
def complete_consultation(
    consultation_id: str,
    admin_notes: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    admin: User = Depends(require_super_admin),
):
    """Mark a consultation as completed."""
    req = db.query(ConsultationRequest).filter(ConsultationRequest.id == consultation_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Consultation not found.")

    req.status = "Consultation Completed"
    req.updated_at = datetime.utcnow()

    _audit(db, admin.email, "CONSULTATION_COMPLETED", consultation_id, admin_notes or "")

    user = db.query(User).filter(User.id == req.user_id).first()
    if user:
        _create_notification(
            db, user.id,
            "✅ Consultation Completed!",
            "Your legal consultation has been completed. Thank you for trusting Nyaya AI.",
            "CONSULTATION",
        )
        send_user_consultation_completed(
            user_email=user.email or "",
            user_name=user.name,
            consultation_id=req.consultation_id or req.id,
        )

    db.commit()
    return {"success": True, "message": "Consultation marked as completed. User notified."}


# ─────────────────────────────────────────────
# ANALYTICS
# ─────────────────────────────────────────────

@router.get("/consultation-stats")
def consultation_stats(
    db: Session = Depends(get_db),
    admin: User = Depends(require_super_admin),
):
    """Real dashboard stats from the database."""
    total_users = db.query(User).count()
    total_payments = db.query(Transaction).count()
    pending_payments = db.query(Transaction).filter(Transaction.status == "pending").count()
    under_review = db.query(Transaction).filter(Transaction.status == "under_review").count()
    verified_payments = db.query(Transaction).filter(Transaction.status == "verified").count()
    declined_payments = db.query(Transaction).filter(Transaction.status == "declined").count()

    total_consultations = db.query(ConsultationRequest).count()
    waiting = db.query(ConsultationRequest).filter(ConsultationRequest.status.ilike("%waiting%")).count()
    scheduled = db.query(ConsultationRequest).filter(ConsultationRequest.status.ilike("%Scheduled%")).count()
    completed = db.query(ConsultationRequest).filter(ConsultationRequest.status.ilike("%Completed%")).count()

    # Revenue from verified payments
    revenue_result = db.query(func.sum(Transaction.amount)).filter(Transaction.status == "verified").scalar()
    total_revenue = float(revenue_result) if revenue_result else 0.0

    # Signups last 7 days
    today = datetime.utcnow().date()
    signups_chart = []
    for i in range(6, -1, -1):
        day = today - timedelta(days=i)
        start_dt = datetime.combine(day, datetime.min.time())
        end_dt = datetime.combine(day, datetime.max.time())
        count = db.query(User).filter(User.created_at >= start_dt, User.created_at <= end_dt).count()
        signups_chart.append({"day": day.strftime("%a"), "date": day.strftime("%d %b"), "count": count})

    return {
        "success": True,
        "data": {
            "total_users": total_users,
            "total_payments": total_payments,
            "pending_payments": pending_payments + under_review,
            "verified_payments": verified_payments,
            "declined_payments": declined_payments,
            "total_consultations": total_consultations,
            "waiting_consultations": waiting,
            "scheduled_consultations": scheduled,
            "completed_consultations": completed,
            "total_revenue": total_revenue,
            "signups_chart": signups_chart,
        }
    }


@router.get("/audit-trail")
def get_audit_trail(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    admin: User = Depends(require_super_admin),
):
    """Full audit trail of all admin actions."""
    logs = db.query(AuditLog).order_by(desc(AuditLog.timestamp)).offset(skip).limit(limit).all()
    return {
        "success": True,
        "data": [
            {
                "id": l.id,
                "action": l.action_type,
                "description": l.action_description,
                "admin": l.user_id,
                "timestamp": l.timestamp.isoformat() if l.timestamp else None,
            }
            for l in logs
        ]
    }
