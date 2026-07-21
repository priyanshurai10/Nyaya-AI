from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
import os
import httpx
import json

router = APIRouter()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_MODEL = "llama3-8b-8192"

class InsightRequest(BaseModel):
    situation: str
    language: Optional[str] = "en"

SYSTEM_PROMPT = """You are an expert Indian legal advisor. When given a legal situation or problem, you must respond with a structured JSON object. Do not include any text before or after the JSON. Your response must be a valid JSON object with these exact fields:
- possible_issues: array of strings (legal issues identified)
- applicable_laws: array of strings (relevant Indian laws, acts, sections)
- process_steps: array of strings (step-by-step process to resolve)
- documents_required: array of strings (documents needed)
- estimated_timeline: string (realistic timeline)
- next_steps: array of strings (immediate actions to take)

Be specific about Indian laws. Include section numbers (e.g., Section 420 IPC, Section 6 RTI Act 2005, Section 17 CPA 2019). Keep each item concise and actionable."""

@router.post("/")
async def get_ai_insights(payload: InsightRequest):
    if not payload.situation or len(payload.situation.strip()) < 10:
        raise HTTPException(status_code=400, detail="Please provide a detailed description of your legal situation.")
    
    # Call Groq API
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }
    
    body = {
        "model": GROQ_MODEL,
        "messages": [
            {
                "role": "system",
                "content": SYSTEM_PROMPT
            },
            {
                "role": "user",
                "content": f"Legal situation: {payload.situation}\n\nProvide a structured legal analysis as JSON."
            }
        ],
        "temperature": 0.2,
        "max_tokens": 1024
    }
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers=headers,
                json=body
            )
        
        if resp.status_code != 200:
            raise HTTPException(status_code=500, detail="AI service temporarily unavailable. Please try again.")
        
        result = resp.json()
        content = result["choices"][0]["message"]["content"].strip()
        
        # Try to parse JSON from response
        # Handle cases where model wraps in ```json ... ```
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0].strip()
        elif "```" in content:
            content = content.split("```")[1].split("```")[0].strip()
        
        parsed = json.loads(content)
        
        # Ensure all required fields exist
        return {
            "possible_issues": parsed.get("possible_issues", []),
            "applicable_laws": parsed.get("applicable_laws", []),
            "process_steps": parsed.get("process_steps", []),
            "documents_required": parsed.get("documents_required", []),
            "estimated_timeline": parsed.get("estimated_timeline", "Depends on complexity"),
            "next_steps": parsed.get("next_steps", [])
        }
        
    except json.JSONDecodeError:
        # Fallback: return a structured response based on keywords
        sit = payload.situation.lower()
        
        if "property" in sit or "land" in sit or "flat" in sit:
            return {
                "possible_issues": ["Property dispute", "Title defect or encroachment", "Adverse possession claim"],
                "applicable_laws": ["Transfer of Property Act 1882", "Registration Act 1908", "Specific Relief Act 1963", "RERA Act 2016"],
                "process_steps": ["Get title verification from a lawyer", "File for injunction if possession at risk", "File civil suit in District Court"],
                "documents_required": ["Sale deed", "Encumbrance certificate", "Property tax receipts", "Mutation certificate"],
                "estimated_timeline": "6 months to 3 years depending on complexity",
                "next_steps": ["Consult a property lawyer immediately", "Gather all original title documents", "File a complaint with RERA if builder dispute"]
            }
        elif "consumer" in sit or "refund" in sit or "product" in sit:
            return {
                "possible_issues": ["Deficiency of service", "Unfair trade practice", "Defective product"],
                "applicable_laws": ["Consumer Protection Act 2019", "Section 2(42) – Unfair Trade Practice", "Section 35 – Consumer Complaint filing"],
                "process_steps": ["Send legal notice to seller/company", "File complaint on e-Daakhil portal", "Attend District Consumer Commission hearing"],
                "documents_required": ["Purchase receipt/invoice", "Warranty card", "Communication with seller", "Bank statement"],
                "estimated_timeline": "3 to 6 months",
                "next_steps": ["Send formal demand notice via registered post", "File complaint at consumer.gov.in or e-Daakhil", "Preserve all receipts and communications"]
            }
        else:
            return {
                "possible_issues": ["Legal rights violation", "Potential civil or criminal remedy available"],
                "applicable_laws": ["Indian Penal Code (IPC/BNS)", "Code of Civil Procedure 1908", "Specific Relief Act 1963"],
                "process_steps": ["Consult a qualified lawyer", "Document all evidence", "File appropriate complaint or suit"],
                "documents_required": ["Written complaint", "Supporting documents", "Identity proof", "Witness statements if applicable"],
                "estimated_timeline": "Varies based on court and complexity",
                "next_steps": ["Consult a lawyer in your district", "File an FIR or police complaint if criminal matter", "Approach Legal Aid Services if unable to afford counsel"]
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate insights: {str(e)}")
