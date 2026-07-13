from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Request
from sqlalchemy.orm import Session
import uuid
import os
import shutil
from datetime import datetime
from typing import Optional

from app.core.database import get_db
from app.core.config import settings
from app.models import ChatSession, Document, DocumentAnalysis
from app.schemas.document import DocumentResponse
from app.agents.orchestrator import orchestrator_service
from app.core.security import verify_document_integrity, log_audit_event

router = APIRouter()

@router.post("/upload", response_model=DocumentResponse)
async def upload_document(
    request: Request,
    file: UploadFile = File(...),
    session_id: Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    client_ip = request.client.host if request.client else "127.0.0.1"

    # 1. Resolve or create chat session
    if not session_id:
        session_id = str(uuid.uuid4())
        session = ChatSession(id=session_id)
        db.add(session)
        db.commit()
        db.refresh(session)
    else:
        session = db.query(ChatSession).filter(ChatSession.id == session_id).first()
        if not session:
            session = ChatSession(id=session_id)
            db.add(session)
            db.commit()
            db.refresh(session)

    # 2. Read file bytes and scan integrity (Magic Bytes & File Size)
    try:
        file_bytes = await file.read()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to read file: {e}")

    is_valid, err_msg = verify_document_integrity(file_bytes, file.filename)
    if not is_valid:
        # Log failed integrity scan in audit
        log_audit_event(
            db=db,
            action_type="upload",
            action_description=f"File upload blocked by integrity scanner: {file.filename}. Error: {err_msg}",
            session_id=session_id,
            agent_used="integrity_scanner",
            result_status="blocked",
            client_ip=client_ip
        )
        raise HTTPException(status_code=400, detail=f"Security Alert: {err_msg}")

    # Reset file cursor for saving
    await file.seek(0)

    # 3. Save the uploaded file to disk
    doc_id = str(uuid.uuid4())
    file_ext = os.path.splitext(file.filename)[1].lower()
    saved_filename = f"{doc_id}{file_ext}"
    saved_path = os.path.join(settings.UPLOAD_DIR, saved_filename)

    try:
        with open(saved_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save uploaded file: {str(e)}")

    # 4. Extract text based on file type
    file_type = file.content_type or "application/octet-stream"
    extracted_text = ""

    if file_ext == ".pdf":
        extracted_text = orchestrator_service.document_agent.extract_text_from_pdf(saved_path)
    elif file_ext in [".png", ".jpg", ".jpeg"]:
        extracted_text = orchestrator_service.document_agent.extract_text_from_image(saved_path)
    else:
        # Try reading as plain text
        try:
            with open(saved_path, "r", encoding="utf-8") as f:
                extracted_text = f.read()
        except Exception:
            extracted_text = "Unsupported file type for text extraction."

    # 5. Run Document Analysis Agent
    analysis_res = await orchestrator_service.document_agent.analyze_document(extracted_text, file.filename)

    # 6. Run Risk Detection Agent
    risk_res = await orchestrator_service.risk_agent.analyze_risks(extracted_text, analysis_res.document_type)

    # 7. Save Document to Database
    db_document = Document(
        id=doc_id,
        session_id=session_id,
        filename=file.filename,
        file_type=file_type,
        file_size=os.path.getsize(saved_path),
        extracted_text=extracted_text,
        document_type=analysis_res.document_type,
        upload_path=saved_path,
        created_at=datetime.utcnow()
    )
    db.add(db_document)
    db.commit()

    # Serialize risks for JSON storage in DB
    risks_data = [
        {
            "category": r.category,
            "clause_text": r.clause_text,
            "risk_level": r.risk_level,
            "explanation": r.explanation,
            "mitigation": r.mitigation
        }
        for r in risk_res.risks
    ]

    # Save Document Analysis to Database
    db_analysis = DocumentAnalysis(
        id=str(uuid.uuid4()),
        document_id=doc_id,
        summary=analysis_res.summary,
        key_points=analysis_res.key_points,
        risks=risks_data,
        risk_score=risk_res.risk_score,
        risk_level=risk_res.risk_level,
        clauses=analysis_res.clauses,
        recommended_steps=analysis_res.recommended_steps,
        legal_implications=analysis_res.legal_implications,
        created_at=datetime.utcnow()
    )
    db.add(db_analysis)
    
    # Log successful upload in audit trail
    log_audit_event(
        db=db,
        action_type="upload",
        action_description=f"Successfully uploaded and analyzed file: {file.filename}. Detected classification: {analysis_res.document_type}.",
        session_id=session_id,
        agent_used="document_agent",
        result_status="success",
        client_ip=client_ip
    )

    db.commit()
    db.refresh(db_document)

    return db_document

@router.get("/{doc_id}", response_model=DocumentResponse)
def get_document(doc_id: str, db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc

@router.get("/session/{session_id}")
def get_session_documents(session_id: str, db: Session = Depends(get_db)):
    docs = db.query(Document).filter(Document.session_id == session_id).all()
    return docs
