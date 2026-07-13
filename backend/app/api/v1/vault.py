from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import uuid
import os
import shutil

from app.core.database import get_db
from app.models import User, Document, DocumentAnalysis
from app.core.auth import get_current_user
from app.core.config import settings

router = APIRouter()

@router.get("/")
def list_documents(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")
        
    documents = db.query(Document).filter(Document.user_id == user.id).order_by(Document.created_at.desc()).all()
    
    return {
        "success": True,
        "data": [
            {
                "id": d.id,
                "filename": d.filename,
                "file_type": d.file_type,
                "upload_path": d.upload_path,
                "vault_category": d.vault_category,
                "document_type": d.document_type,
                "file_size": d.file_size,
                "created_at": d.created_at.isoformat() if d.created_at else None
            } for d in documents
        ]
    }

@router.post("/upload")
def upload_document(
    file: UploadFile = File(...),
    vault_category: Optional[str] = Form("Other"),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")
        
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    
    doc_id = str(uuid.uuid4())
    file_ext = os.path.splitext(file.filename)[1].lower() if file.filename else ""
    safe_filename = f"doc_{doc_id}{file_ext}"
    file_path = os.path.join(settings.UPLOAD_DIR, safe_filename)
    
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload document: {str(e)}")
        
    doc = Document(
        id=doc_id,
        user_id=user.id,
        filename=file.filename or "Unknown Document",
        upload_path=f"/uploads/{safe_filename}",
        file_type=file.content_type or "application/octet-stream",
        file_size=os.path.getsize(file_path),
        vault_category=vault_category
    )
    db.add(doc)
    db.commit()
    
    return {
        "success": True,
        "message": "Document uploaded successfully",
        "data": {
            "id": doc.id,
            "filename": doc.filename,
            "upload_path": doc.upload_path,
            "vault_category": doc.vault_category
        }
    }

@router.delete("/{id}")
def delete_document(
    id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")
        
    doc = db.query(Document).filter(Document.id == id, Document.user_id == user.id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
        
    # Physically delete file if it exists
    if doc.upload_path and doc.upload_path.startswith("/uploads/"):
        filename = doc.upload_path.replace("/uploads/", "")
        phys_path = os.path.join(settings.UPLOAD_DIR, filename)
        if os.path.exists(phys_path):
            os.remove(phys_path)
            
    db.delete(doc)
    db.commit()
    
    return {"success": True, "message": "Document deleted successfully"}
