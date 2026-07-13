from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import uuid

from app.core.database import get_db
from app.models import User, KnowledgeArticle
from app.core.auth import get_current_user

router = APIRouter()

@router.get("/")
def get_articles(
    category: Optional[str] = None,
    q: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(KnowledgeArticle)
    
    if category:
        query = query.filter(KnowledgeArticle.category == category)
        
    if q:
        query = query.filter(
            (KnowledgeArticle.title.ilike(f"%{q}%")) |
            (KnowledgeArticle.content.ilike(f"%{q}%"))
        )
        
    articles = query.limit(50).all()
    
    return {
        "success": True,
        "data": [
            {
                "id": a.id,
                "title": a.title,
                "category": a.category,
                "tags": a.tags,
                "content": a.content,
                "bookmark_count": a.bookmark_count,
                "created_at": a.created_at.isoformat() if a.created_at else None
            } for a in articles
        ]
    }

@router.get("/{id}")
def get_article(id: str, db: Session = Depends(get_db)):
    a = db.query(KnowledgeArticle).filter(KnowledgeArticle.id == id).first()
    if not a:
        raise HTTPException(status_code=404, detail="Article not found")
        
    return {
        "success": True,
        "data": {
            "id": a.id,
            "title": a.title,
            "category": a.category,
            "tags": a.tags,
            "content": a.content,
            "bookmark_count": a.bookmark_count,
            "created_at": a.created_at.isoformat() if a.created_at else None
        }
    }
