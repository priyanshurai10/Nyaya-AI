from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime, timedelta
import uuid
from pydantic import BaseModel

from app.core.database import get_db
from app.models import User, LegalCalendarEvent
from app.core.auth import get_current_user

router = APIRouter()

class EventCreate(BaseModel):
    title: str
    event_type: str  # "hearing", "filing", "notice_deadline", "rti_deadline", "consultation"
    event_date: str  # ISO date string e.g. "2026-08-15"

@router.get("/")
def get_calendar_events(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")
        
    events = db.query(LegalCalendarEvent).filter(
        LegalCalendarEvent.user_id == user.id
    ).order_by(LegalCalendarEvent.event_date).all()

    # Auto-seed demo events if user has none
    if len(events) == 0:
        now = datetime.utcnow()
        demo_events = [
            LegalCalendarEvent(
                id=str(uuid.uuid4()),
                user_id=user.id,
                title="Property Dispute Case — Delhi District Court",
                event_type="hearing",
                event_date=(now + timedelta(days=5)).strftime("%Y-%m-%d"),
                reminded=False,
                created_at=now
            ),
            LegalCalendarEvent(
                id=str(uuid.uuid4()),
                user_id=user.id,
                title="RTI Application Reply Deadline — Ministry of Finance",
                event_type="rti_deadline",
                event_date=(now + timedelta(days=12)).strftime("%Y-%m-%d"),
                reminded=False,
                created_at=now
            ),
            LegalCalendarEvent(
                id=str(uuid.uuid4()),
                user_id=user.id,
                title="Consumer Forum Hearing — TechCorp Laptop Refund",
                event_type="hearing",
                event_date=(now + timedelta(days=18)).strftime("%Y-%m-%d"),
                reminded=False,
                created_at=now
            ),
            LegalCalendarEvent(
                id=str(uuid.uuid4()),
                user_id=user.id,
                title="Advocate Consultation — Labour Dispute Filing Strategy",
                event_type="consultation",
                event_date=(now + timedelta(days=3)).strftime("%Y-%m-%d"),
                reminded=False,
                created_at=now
            ),
        ]
        for e in demo_events:
            db.add(e)
        db.commit()
        events = db.query(LegalCalendarEvent).filter(
            LegalCalendarEvent.user_id == user.id
        ).order_by(LegalCalendarEvent.event_date).all()

    return {
        "success": True,
        "data": [
            {
                "id": e.id,
                "title": e.title,
                "type": e.event_type,
                "date": e.event_date,
                "reminded": e.reminded,
                "created_at": e.created_at.isoformat() if e.created_at else None
            } for e in events
        ]
    }

@router.post("/")
def create_calendar_event(
    data: EventCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")

    event = LegalCalendarEvent(
        id=str(uuid.uuid4()),
        user_id=user.id,
        title=data.title,
        event_type=data.event_type,
        event_date=data.event_date,
        reminded=False,
        created_at=datetime.utcnow()
    )
    db.add(event)
    db.commit()
    db.refresh(event)

    return {
        "success": True,
        "message": "Event created successfully",
        "data": {
            "id": event.id,
            "title": event.title,
            "type": event.event_type,
            "date": event.event_date
        }
    }

@router.delete("/{id}")
def delete_calendar_event(
    id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")

    event = db.query(LegalCalendarEvent).filter(
        LegalCalendarEvent.id == id,
        LegalCalendarEvent.user_id == user.id
    ).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    db.delete(event)
    db.commit()
    return {"success": True, "message": "Event deleted"}
