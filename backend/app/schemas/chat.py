from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class MessageCreate(BaseModel):
    session_id: Optional[str] = None
    message: str
    mother_mode: bool = False
    document_id: Optional[str] = None

class MessageResponse(BaseModel):
    session_id: str
    detected_language: str
    response: str
    laws_cited: List[str]
    sections_cited: List[str]
    next_steps: List[str]
    disclaimer: str
    active_skill: Optional[str] = None
    requires_approval: bool = False
    classification_confidence: float = 0.0
    risk_confidence: float = 0.0
    translation_confidence: float = 0.0

class SessionMessage(BaseModel):
    role: str
    content: str
    detected_language: Optional[str] = None
    laws_cited: Optional[List[str]] = None
    sections_cited: Optional[List[str]] = None
    next_steps: Optional[List[str]] = None
    created_at: datetime

    class Config:
        from_attributes = True

class SessionHistory(BaseModel):
    session_id: str
    messages: List[SessionMessage]

    class Config:
        from_attributes = True
