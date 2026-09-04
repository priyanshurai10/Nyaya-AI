from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
from app.core.auth import get_current_user
from app.models.user import User
from app.core.llm import call_llm

router = APIRouter()

class InsightRequest(BaseModel):
    situation: str
    
class InsightResponse(BaseModel):
    possible_issues: List[str]
    applicable_laws: List[str]
    process_steps: List[str]
    documents_required: List[str]
    next_steps: List[str]
    estimated_timeline: str

@router.post("", response_model=InsightResponse)
@router.post("/", response_model=InsightResponse)
def get_ai_insights(payload: InsightRequest, user: Optional[User] = Depends(get_current_user)):
    prompt = f"""
    You are an expert Indian Legal AI. Analyze the following situation and provide a structured JSON response.
    
    Situation:
    {payload.situation}
    
    You MUST output valid JSON matching the following schema EXACTLY.
    {{
        "possible_issues": ["Issue 1", "Issue 2"],
        "applicable_laws": ["Law 1", "Law 2"],
        "process_steps": ["Step 1", "Step 2"],
        "documents_required": ["Doc 1", "Doc 2"],
        "next_steps": ["Next Step 1"],
        "estimated_timeline": "e.g., 3-6 months"
    }}
    
    Return ONLY the raw JSON string, without Markdown wrappers or backticks.
    """
    
    response_text = call_llm(prompt, json_mode=True)
    
    import json
    try:
        if response_text.startswith("```json"):
            response_text = response_text.strip("```json").strip("```").strip()
        data = json.loads(response_text)
        return InsightResponse(**data)
    except Exception as e:
        # Fallback if LLM fails formatting
        print(f"LLM JSON parsing error: {e}")
        return InsightResponse(
            possible_issues=["Legal evaluation required."],
            applicable_laws=["Consult local counsel."],
            process_steps=["1. File a formal complaint.", "2. Seek mediation."],
            documents_required=["Identity Proof", "Relevant Agreements"],
            next_steps=["Consult a lawyer for detailed advice."],
            estimated_timeline="Variable"
        )
