from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import uuid

from app.core.database import get_db
from app.models import User, SavedCase, CaseTask, CaseFolder
from app.core.auth import get_current_user

router = APIRouter()

@router.get("/")
def get_cases(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")
        
    cases = db.query(SavedCase).filter(SavedCase.user_id == user.id).order_by(SavedCase.created_at.desc()).all()
    
    return {
        "success": True,
        "data": [
            {
                "id": c.id,
                "title": c.title,
                "type": c.case_type,
                "status": c.status,
                "next_hearing": c.next_hearing,
                "court": c.court,
                "description": c.description,
                "created_at": c.created_at.isoformat() if c.created_at else None,
                "updated_at": c.updated_at.isoformat() if c.updated_at else None
            } for c in cases
        ]
    }

@router.get("/{id}")
def get_case(
    id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")
        
    c = db.query(SavedCase).filter(SavedCase.id == id, SavedCase.user_id == user.id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Case not found")
        
    tasks = db.query(CaseTask).filter(CaseTask.case_id == c.id).all()
        
    return {
        "success": True,
        "data": {
            "id": c.id,
            "title": c.title,
            "type": c.case_type,
            "status": c.status,
            "next_hearing": c.next_hearing,
            "court": c.court,
            "description": c.description,
            "created_at": c.created_at.isoformat() if c.created_at else None,
            "tasks": [
                {
                    "id": t.id,
                    "title": t.title,
                    "completed": t.completed,
                    "due_date": t.due_date.isoformat() if t.due_date else None
                } for t in tasks
            ]
        }
    }
