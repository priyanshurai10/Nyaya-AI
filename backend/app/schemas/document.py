from pydantic import BaseModel
from typing import List, Dict, Optional
from datetime import datetime

class RiskItemSchema(BaseModel):
    category: str
    clause_text: str
    risk_level: str
    explanation: str
    mitigation: str

class DocumentAnalysisResponse(BaseModel):
    id: str
    document_id: str
    summary: str
    key_points: List[str]
    risks: List[RiskItemSchema]
    risk_score: int
    risk_level: str
    clauses: Dict[str, str]
    recommended_steps: List[str]
    legal_implications: List[str]
    created_at: datetime

    class Config:
        from_attributes = True

class DocumentResponse(BaseModel):
    id: str
    session_id: str
    filename: str
    file_type: str
    file_size: int
    document_type: Optional[str] = None
    created_at: datetime
    analysis: Optional[DocumentAnalysisResponse] = None

    class Config:
        from_attributes = True
