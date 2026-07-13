from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import uuid

from app.core.database import get_db
from app.models import User, Notification
from app.core.auth import get_current_user

router = APIRouter()

@router.get("/")
def get_notifications(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")
        
    notifications = db.query(Notification).filter(Notification.user_id == user.id).order_by(Notification.created_at.desc()).all()
    
    return {
        "success": True,
        "data": [
            {
                "id": n.id,
                "title": n.title,
                "message": n.message,
                "category": n.category,
                "is_read": n.is_read,
                "created_at": n.created_at.isoformat() if n.created_at else None
            } for n in notifications
        ]
    }

@router.put("/{id}/read")
def mark_notification_read(
    id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")
        
    notification = db.query(Notification).filter(Notification.id == id, Notification.user_id == user.id).first()
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
        
    notification.is_read = True
    db.commit()
    
    return {"success": True, "message": "Notification marked as read"}

@router.delete("/{id}")
def delete_notification(
    id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")
        
    notification = db.query(Notification).filter(Notification.id == id, Notification.user_id == user.id).first()
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
        
    db.delete(notification)
    db.commit()
    
    return {"success": True, "message": "Notification deleted"}

@router.put("/read-all")
def mark_all_read(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")
        
    db.query(Notification).filter(Notification.user_id == user.id, Notification.is_read == False).update({"is_read": True})
    db.commit()
    
    return {"success": True, "message": "All notifications marked as read"}
