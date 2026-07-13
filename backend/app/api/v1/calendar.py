from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import uuid

from app.core.database import get_db
from app.models import User, LegalCalendarEvent
from app.core.auth import get_current_user

router = APIRouter()

@router.get("/")
def get_calendar_events(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")
        
    query = db.query(LegalCalendarEvent).filter(LegalCalendarEvent.user_id == user.id)
    if start_date:
        try:
            start_dt = datetime.fromisoformat(start_date)
            query = query.filter(LegalCalendarEvent.start_time >= start_dt)
        except ValueError:
            pass
    if end_date:
        try:
            end_dt = datetime.fromisoformat(end_date)
            query = query.filter(LegalCalendarEvent.end_time <= end_dt)
        except ValueError:
            pass
            
    events = query.order_by(LegalCalendarEvent.start_time).all()
    
    return {
        "success": True,
        "data": [
            {
                "id": e.id,
                "title": e.title,
                "type": e.event_type,
                "date": e.start_time.isoformat() if e.start_time else None,
                "end_time": e.end_time.isoformat() if e.end_time else None,
                "location": e.location,
                "description": e.description,
                "related_case_id": e.related_case_id
            } for e in events
        ]
    }
