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
    
    if not judgments:
        return {
            "success": True,
            "data": [
                {
                    "id": "mock-1",
                    "case_name": "Kesavananda Bharati v. State of Kerala",
                    "court": "Supreme Court of India",
                    "bench": "13-Judge Bench",
                    "citation": "AIR 1973 SC 1461",
                    "date": "1973-04-24",
                    "legal_issue": "Can the Parliament amend the basic structure of the Constitution?",
                    "decision": "Parliament cannot alter the 'Basic Structure' of the Constitution.",
                    "impact": "Saved Indian democracy from absolute parliamentary power.",
                    "related_laws": ["Article 368"],
                    "related_judgments": []
                },
                {
                    "id": "mock-2",
                    "case_name": "Justice K. S. Puttaswamy (Retd.) and Anr. vs Union Of India",
                    "court": "Supreme Court of India",
                    "bench": "9-Judge Bench",
                    "citation": "(2017) 10 SCC 1",
                    "date": "2017-08-24",
                    "legal_issue": "Is the Right to Privacy a fundamental right?",
                    "decision": "Right to Privacy is recognized as a fundamental right under Article 21.",
                    "impact": "Revolutionized data privacy and shaped the DPDP Act.",
                    "related_laws": ["Article 21"],
                    "related_judgments": []
                }
            ]
        }

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
