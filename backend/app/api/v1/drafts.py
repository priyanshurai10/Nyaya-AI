from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
import uuid

from app.core.database import get_db
from app.models import User, DraftDocument
from app.core.auth import get_current_user

router = APIRouter()

class DraftCreate(BaseModel):
    template_type: str
    title: str
    content_json: Optional[Dict[str, Any]] = None
    generated_text: Optional[str] = None
    status: Optional[str] = "draft"

class DraftUpdate(BaseModel):
    title: Optional[str] = None
    content_json: Optional[Dict[str, Any]] = None
    generated_text: Optional[str] = None
    status: Optional[str] = None

@router.get("/")
def get_drafts(
    template_type: Optional[str] = None,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")
        
    query = db.query(DraftDocument).filter(DraftDocument.user_id == user.id)
    if template_type:
        query = query.filter(DraftDocument.template_type == template_type)
        
    drafts = query.order_by(DraftDocument.updated_at.desc()).all()
    
    return {
        "success": True,
        "data": [
            {
                "id": d.id,
                "template_type": d.template_type,
                "title": d.title,
                "status": d.status,
                "created_at": d.created_at.isoformat() if d.created_at else None,
                "updated_at": d.updated_at.isoformat() if d.updated_at else None
            } for d in drafts
        ]
    }

@router.get("/{id}")
def get_draft(
    id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")
        
    d = db.query(DraftDocument).filter(DraftDocument.id == id, DraftDocument.user_id == user.id).first()
    if not d:
        raise HTTPException(status_code=404, detail="Draft not found")
        
    return {
        "success": True,
        "data": {
            "id": d.id,
            "template_type": d.template_type,
            "title": d.title,
            "content_json": d.content_json,
            "generated_text": d.generated_text,
            "status": d.status,
            "created_at": d.created_at.isoformat() if d.created_at else None,
            "updated_at": d.updated_at.isoformat() if d.updated_at else None
        }
    }

@router.post("/")
def create_draft(
    data: DraftCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")
        
    draft_id = str(uuid.uuid4())
    draft = DraftDocument(
        id=draft_id,
        user_id=user.id,
        template_type=data.template_type,
        title=data.title,
        content_json=data.content_json,
        generated_text=data.generated_text,
        status=data.status
    )
    
    db.add(draft)
    db.commit()
    
    return {
        "success": True,
        "message": "Draft created successfully",
        "data": {"id": draft.id}
    }

@router.put("/{id}")
def update_draft(
    id: str,
    data: DraftUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")
        
    draft = db.query(DraftDocument).filter(DraftDocument.id == id, DraftDocument.user_id == user.id).first()
    if not draft:
        raise HTTPException(status_code=404, detail="Draft not found")
        
    if data.title is not None:
        draft.title = data.title
    if data.content_json is not None:
        draft.content_json = data.content_json
    if data.generated_text is not None:
        draft.generated_text = data.generated_text
    if data.status is not None:
        draft.status = data.status
        
    db.commit()
    
    return {"success": True, "message": "Draft updated successfully"}

@router.delete("/{id}")
def delete_draft(
    id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")
        
    draft = db.query(DraftDocument).filter(DraftDocument.id == id, DraftDocument.user_id == user.id).first()
    if not draft:
        raise HTTPException(status_code=404, detail="Draft not found")
        
    db.delete(draft)
    db.commit()
    
    return {"success": True, "message": "Draft deleted successfully"}
