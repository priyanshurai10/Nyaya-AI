from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
import uuid
import json

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

@router.post("/{id}/generate")
def generate_draft_text(
    id: str,
    payload: Dict[str, Any],
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")
        
    draft = db.query(DraftDocument).filter(DraftDocument.id == id, DraftDocument.user_id == user.id).first()
    if not draft:
        raise HTTPException(status_code=404, detail="Draft not found")
        
    # Save the input values to content_json
    draft.content_json = payload
    
    template_type = draft.template_type
    
    # Construct the statutory drafting prompt
    prompt = ""
    if template_type == "legal_notice":
        prompt = (
            "You are an expert Indian Advocate drafting a Formal Legal Notice under Section 80 of the Code of Civil Procedure (CPC) "
            "or the Indian Contract Act. Use professional, legal drafting formatting (e.g. including 'LEGAL NOTICE', 'UNDER INSTRUCTIONS FROM...', "
            "'NOTICE IS HEREBY SERVED...', etc.) with numbered paragraphs.\n\n"
            f"Sender Details:\nName: {payload.get('sender_name')}\nAddress: {payload.get('sender_address')}\n\n"
            f"Recipient Details:\nName: {payload.get('recipient_name')}\nAddress: {payload.get('recipient_address')}\n\n"
            f"Facts of the Dispute:\n{payload.get('dispute_facts')}\n\n"
            f"Specific Demands (amount to refund/pay, actions to take, etc.):\n{payload.get('demands')}\n\n"
            "Include a statement that if the demands are not met within 15 days of receiving this notice, civil or criminal proceedings will be initiated at the recipient's cost and risk."
        )
    elif template_type == "rti":
        prompt = (
            "You are an expert in Right to Information (RTI) petitions in India. Draft a formal RTI application under Section 6(1) of the RTI Act, 2005 "
            "addressed to the Public Information Officer (PIO) of the target department.\n\n"
            f"Applicant Name: {payload.get('applicant_name')}\n"
            f"Applicant Address: {payload.get('applicant_address')}\n"
            f"Target Public Authority / Department: {payload.get('public_authority')}\n\n"
            f"Information Required:\n{payload.get('information_details')}\n\n"
            "Formatting requirements:\n"
            "1. Title: 'Application under Section 6(1) of the Right to Information Act, 2005'\n"
            "2. Formal salutation to the PIO.\n"
            "3. State that the applicant is a citizen of India.\n"
            "4. Specify that a standard fee of Rs. 10 is enclosed (postal order / court fee stamp).\n"
            "5. Number the requested details clearly."
        )
    elif template_type == "consumer_complaint":
        prompt = (
            "You are a legal advisor drafting a Consumer Complaint under Section 35 of the Consumer Protection Act, 2019 "
            "for filing in the District Consumer Disputes Redressal Commission.\n\n"
            f"Complainant (Consumer) Details:\nName: {payload.get('complainant_name')}\nAddress: {payload.get('complainant_address')}\n\n"
            f"Opposite Party (Seller/Service Provider) Details:\nName: {payload.get('opposite_party_name')}\nAddress: {payload.get('opposite_party_address')}\n\n"
            f"Transaction Details:\nDate of Purchase: {payload.get('purchase_date')}\nAmount Paid: Rs. {payload.get('amount_paid')}\n\n"
            f"Details of Defect / Deficiency in Service:\n{payload.get('dispute_details')}\n\n"
            f"Compensation and Relief Claimed:\n{payload.get('relief_claimed')}\n\n"
            "Format standard legal petition format including:\n"
            "- Court Header (District Commission name)\n"
            "- Name & Address details of parties\n"
            "- Heading: 'COMPLAINT UNDER SECTION 35 OF THE CONSUMER PROTECTION ACT, 2019'\n"
            "- Chronological statement of facts\n"
            "- Prayer section (relief claimed)"
        )
    elif template_type == "police_complaint":
        prompt = (
            "You are a legal technology advisor drafting a Police Complaint / Incident Report under Section 173 of the Bharatiya Nagarik Suraksha Sanhita (BNSS) / CrPC "
            "requesting the registration of a First Information Report (FIR).\n\n"
            f"Informant (Victim/Witness) Details:\nName: {payload.get('informant_name')}\nAddress: {payload.get('informant_address')}\n\n"
            f"Incident details:\nDate & Time: {payload.get('incident_time')}\nLocation: {payload.get('incident_location')}\n\n"
            f"Suspect Details (if known):\n{payload.get('suspect_details')}\n\n"
            f"Detailed Narrative of the Incident:\n{payload.get('incident_narrative')}\n\n"
            "Format standard police complaint letter format including:\n"
            "- Addressed to: The Station House Officer (SHO), Local Police Station\n"
            "- Subject: Complaint regarding [offense type] and request to register FIR\n"
            "- Narration of facts in detail\n"
            "- Formal request for action under the BNS"
        )
    else:
        # Fallback custom template
        prompt = (
            "Draft a professional Indian legal document based on the following details.\n\n"
            f"Title: {draft.title}\n"
            f"Details: {payload.get('custom_details') or json.dumps(payload)}"
        )
        
    from app.core.llm import call_llm
    try:
        generated_text = call_llm(prompt, json_mode=False)
        draft.generated_text = generated_text
        draft.status = "finalized"
        db.commit()
        return {"success": True, "generated_text": generated_text}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"LLM Generation Error: {str(e)}")
