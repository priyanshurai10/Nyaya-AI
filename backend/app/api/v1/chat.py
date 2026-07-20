from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
import uuid
from datetime import datetime
from pydantic import BaseModel
from typing import Optional

from app.core.database import get_db
from app.models import ChatSession, ChatMessage, Document, SkillInvocationLog
from app.schemas.chat import MessageCreate, MessageResponse, SessionHistory
from app.agents.orchestrator import orchestrator_service

router = APIRouter()

class DraftApprovalPayload(BaseModel):
    session_id: str
    document_type: str
    draft_content: str

@router.post("/message", response_model=MessageResponse)
async def send_message(payload: MessageCreate, request: Request, db: Session = Depends(get_db)):
    session_id = payload.session_id
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

    # 2. Build history for orchestrator
    history = []
    sorted_msgs = sorted(session.messages, key=lambda x: x.created_at)
    for msg in sorted_msgs:
        history.append({
            "role": msg.role,
            "content": msg.content
        })

    # 3. Retrieve document context if linked
    document_context = None
    if payload.document_id:
        doc = db.query(Document).filter(Document.id == payload.document_id).first()
        if doc:
            document_context = f"Document Filename: {doc.filename}\nDocument Type: {doc.document_type}\nExtracted Text:\n{doc.extracted_text}"

    # 4. Process the query using orchestrator service with security and evals enabled
    try:
        result = await orchestrator_service.process_message(
            user_message=payload.message,
            current_summary=session.summary,
            chat_history=history,
            mother_mode=payload.mother_mode,
            document_context=document_context,
            db=db,
            client_ip=client_ip,
            session_id=session_id
        )
    except ValueError as val_err:
        from fastapi.responses import JSONResponse
        return JSONResponse(
            status_code=400,
            content={
                "success": False,
                "message": str(val_err),
                "error": {"code": "CONFIG_ERROR", "detail": str(val_err)}
            }
        )
    except Exception as e:
        from fastapi.responses import JSONResponse
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "message": f"AI Assistant Error: {str(e)}",
                "error": {"code": "LLM_ERROR", "detail": str(e)}
            }
        )

    # 5. Save user message to database
    user_msg = ChatMessage(
        id=str(uuid.uuid4()),
        session_id=session_id,
        role="user",
        content=payload.message,
        detected_language=result["detected_language"],
        created_at=datetime.utcnow()
    )
    db.add(user_msg)

    # 6. Save assistant response to database
    ai_msg = ChatMessage(
        id=str(uuid.uuid4()),
        session_id=session_id,
        role="assistant",
        content=result["response"],
        detected_language=result["detected_language"],
        laws_cited=result["laws_cited"],
        sections_cited=result["sections_cited"],
        next_steps=result["next_steps"],
        created_at=datetime.utcnow()
    )
    db.add(ai_msg)

    # 7. Update session summary and language
    session.summary = result["updated_summary"]
    session.language = result["detected_language"]

    # 8. Log Skill Invocation if active
    if result.get("active_skill_id"):
        skill_log = SkillInvocationLog(
            id=str(uuid.uuid4()),
            session_id=session_id,
            skill_id=result["active_skill_id"],
            query_text=payload.message,
            execution_time_ms=100,
            status="success"
        )
        db.add(skill_log)

    db.commit()

    return MessageResponse(
        session_id=session_id,
        detected_language=result["detected_language"],
        response=result["response"],
        laws_cited=result["laws_cited"],
        sections_cited=result["sections_cited"],
        next_steps=result["next_steps"],
        disclaimer=result["disclaimer"],
        active_skill=result.get("active_skill"),
        requires_approval=result.get("requires_approval", False),
        classification_confidence=result.get("classification_confidence", 0.0),
        risk_confidence=result.get("risk_confidence", 0.0),
        translation_confidence=result.get("translation_confidence", 0.0)
    )

@router.post("/approve-draft")
def approve_draft(payload: DraftApprovalPayload, request: Request, db: Session = Depends(get_db)):
    from app.core.security import log_audit_event
    client_ip = request.client.host if request.client else "127.0.0.1"
    
    log_audit_event(
        db=db,
        action_type="approval",
        action_description=f"User confirmed and approved generated draft for: {payload.document_type}",
        session_id=payload.session_id,
        agent_used="human_in_the_loop",
        result_status="success",
        client_ip=client_ip
    )
    return {"status": "approved", "message": "Draft approval saved to audit trail successfully."}

@router.get("/sessions/{session_id}", response_model=SessionHistory)
def get_session_history(session_id: str, db: Session = Depends(get_db)):
    session = db.query(ChatSession).filter(ChatSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Chat session not found")

    sorted_messages = sorted(session.messages, key=lambda x: x.created_at)

    return SessionHistory(
        session_id=session_id,
        messages=sorted_messages
    )
