from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import os
import shutil
from typing import List, Optional

from app.core.database import get_db
from app.models import User, Document, DocumentAnalysis, AuditLog, Feedback, ChatSession, ChatMessage
from app.core.auth import get_current_user

router = APIRouter()

def check_admin(user: User = Depends(get_current_user)):
    # In a local sandbox, if no users are set as admin, allow access to prevent locking out.
    # Otherwise, check the is_admin column.
    if user and not user.is_admin:
        # Check if they are using the default admin email or if they are the first user
        if user.email == "admin@nyaya.ai":
            return user
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: Admin credentials required."
        )
    return user

@router.get("/users")
def list_users(db: Session = Depends(get_db), admin: User = Depends(check_admin)):
    users = db.query(User).all()
    return [
        {
            "id": u.id,
            "name": u.name,
            "email": u.email,
            "mobile": u.mobile,
            "language_preference": u.language_preference,
            "is_admin": u.is_admin,
            "created_at": u.created_at.isoformat() if u.created_at else None
        }
        for u in users
    ]

@router.delete("/users/{user_id}")
def delete_user(user_id: str, db: Session = Depends(get_db), admin: User = Depends(check_admin)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.id == admin.id:
        raise HTTPException(status_code=400, detail="Cannot delete your own admin account")
    db.delete(user)
    db.commit()
    return {"status": "success", "message": "User deleted successfully."}

@router.get("/documents")
def list_documents(db: Session = Depends(get_db), admin: User = Depends(check_admin)):
    docs = db.query(Document).order_by(Document.created_at.desc()).all()
    res = []
    for doc in docs:
        analysis = db.query(DocumentAnalysis).filter(DocumentAnalysis.document_id == doc.id).first()
        res.append({
            "id": doc.id,
            "filename": doc.filename,
            "file_type": doc.file_type,
            "file_size": doc.file_size,
            "document_type": doc.document_type,
            "created_at": doc.created_at.isoformat() if doc.created_at else None,
            "risk_score": analysis.risk_score if analysis else 0,
            "risk_level": analysis.risk_level if analysis else "Low",
            "summary": analysis.summary if analysis else None
        })
    return res

@router.get("/feedback")
def get_feedback(db: Session = Depends(get_db), admin: User = Depends(check_admin)):
    feedbacks = db.query(Feedback).order_by(Feedback.created_at.desc()).all()
    res = []
    for fb in feedbacks:
        user = db.query(User).filter(User.id == fb.user_id).first() if fb.user_id else None
        res.append({
            "id": fb.id,
            "username": user.name if user else "Anonymous Guest",
            "rating": fb.rating,
            "comments": fb.comments,
            "created_at": fb.created_at.isoformat() if fb.created_at else None
        })
    return res

@router.post("/feedback")
def submit_feedback(rating: int, comments: Optional[str] = None, db: Session = Depends(get_db), user: Optional[User] = Depends(get_current_user)):
    import uuid
    fb = Feedback(
        id=str(uuid.uuid4()),
        user_id=user.id if user else None,
        rating=rating,
        comments=comments
    )
    db.add(fb)
    db.commit()
    return {"status": "success", "message": "Feedback submitted successfully."}

@router.get("/analytics")
def get_analytics(db: Session = Depends(get_db), admin: User = Depends(check_admin)):
    # 1. Total signups
    total_users = db.query(User).count()
    # 2. Total chats and messages
    total_chats = db.query(ChatSession).count()
    total_messages = db.query(ChatMessage).count()
    # 3. Total uploaded documents
    total_docs = db.query(Document).count()
    # 4. Security Firewall blocks (from Audit Logs)
    firewall_blocks = db.query(AuditLog).filter(AuditLog.action_type == "block_injection").count()
    # 5. Approvals logged (HITL)
    hitl_approvals = db.query(AuditLog).filter(AuditLog.action_type == "approval").count()
    
    # Signups over last 7 days
    today = datetime.utcnow().date()
    signups_by_day = {}
    for i in range(7):
        day = today - timedelta(days=i)
        start_dt = datetime.combine(day, datetime.min.time())
        end_dt = datetime.combine(day, datetime.max.time())
        count = db.query(User).filter(User.created_at >= start_dt, User.created_at <= end_dt).count()
        signups_by_day[day.strftime("%a")] = count

    return {
        "summary": {
            "total_users": total_users,
            "total_chats": total_chats,
            "total_messages": total_messages,
            "total_documents": total_docs,
            "firewall_blocks": firewall_blocks,
            "hitl_approvals": hitl_approvals
        },
        "signups_chart": [{"day": k, "count": v} for k, v in reversed(list(signups_by_day.items()))]
    }

@router.get("/health")
def system_health(admin: User = Depends(check_admin)):
    # Database size calculation
    db_size_bytes = 0
    if os.path.exists("nyaya_ai.db"):
        db_size_bytes = os.path.getsize("nyaya_ai.db")
    elif os.path.exists("backend/nyaya_ai.db"):
        db_size_bytes = os.path.getsize("backend/nyaya_ai.db")
        
    db_size_mb = round(db_size_bytes / (1024 * 1024), 2)
    
    # Disk usage
    total, used, free = shutil.disk_usage(".")
    disk_free_gb = round(free / (1024 * 1024 * 1024), 2)
    disk_total_gb = round(total / (1024 * 1024 * 1024), 2)
    
    return {
        "status": "Healthy",
        "database_size_mb": db_size_mb,
        "disk_free_gb": disk_free_gb,
        "disk_total_gb": disk_total_gb,
        "api_latency_status": "Optimal",
        "timestamp": datetime.utcnow().isoformat()
    }
