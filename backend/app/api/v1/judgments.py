from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import uuid

from app.core.database import get_db
from app.models import User, LandmarkJudgment
from app.core.auth import get_current_user

router = APIRouter()

@router.get("/")
def get_judgments(
    q: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(LandmarkJudgment)
    
    if q:
        query = query.filter(
            (LandmarkJudgment.case_name.ilike(f"%{q}%")) |
            (LandmarkJudgment.legal_issue.ilike(f"%{q}%")) |
            (LandmarkJudgment.impact.ilike(f"%{q}%"))
        )
        
    judgments = query.order_by(LandmarkJudgment.date.desc()).limit(50).all()
    
    return {
        "success": True,
        "data": [
            {
                "id": j.id,
                "case_name": j.case_name,
                "court": j.court,
                "bench": j.bench,
                "citation": j.citation,
                "date": j.date,
                "legal_issue": j.legal_issue,
                "decision": j.decision,
                "impact": j.impact,
                "related_laws": j.related_laws,
                "related_judgments": j.related_judgments
            } for j in judgments
        ]
    }

@router.get("/{id}")
def get_judgment(id: str, db: Session = Depends(get_db)):
    j = db.query(LandmarkJudgment).filter(LandmarkJudgment.id == id).first()
    if not j:
        raise HTTPException(status_code=404, detail="Judgment not found")
        
    return {
        "success": True,
        "data": {
            "id": j.id,
            "case_name": j.case_name,
            "court": j.court,
            "bench": j.bench,
            "citation": j.citation,
            "date": j.date,
            "legal_issue": j.legal_issue,
            "decision": j.decision,
            "impact": j.impact,
            "related_laws": j.related_laws,
            "related_judgments": j.related_judgments
        }
    }
