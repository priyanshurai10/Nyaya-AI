import json
from pydantic import BaseModel, Field
from typing import List
from app.core.config import settings
from app.core.llm import call_llm

class RiskItem(BaseModel):
    category: str = Field(description="Category of risk, e.g., 'financial', 'termination', 'penalties', 'jurisdiction', 'liability'")
    clause_text: str = Field(description="The exact text or description of the clause containing the risk.")
    risk_level: str = Field(description="Risk level of this specific item (Low, Medium, High)")
    explanation: str = Field(description="An explanation of why this clause is risky and what it means for the citizen.")
    mitigation: str = Field(description="Actionable advice on how to mitigate or renegotiate this clause.")

class RiskAnalysisResult(BaseModel):
    risk_score: int = Field(description="Overall risk score between 0 and 100, where 0 is no risk and 100 is extremely high risk.")
    risk_level: str = Field(description="Overall risk level: 'Low', 'Medium', or 'High'")
    risks: List[RiskItem] = Field(description="List of specific risks identified in the document.")
    summary: str = Field(description="A brief executive summary of the overall risk profile of the document.")
    risk_confidence: float = Field(default=0.85, description="Confidence score of risk detection, between 0.0 and 1.0")

class RiskDetectionAgent:
    async def analyze_risks(self, document_text: str, document_type: str) -> RiskAnalysisResult:
        if not settings.GEMINI_API_KEY and not settings.GROQ_API_KEY:
            raise ValueError(
                "AI Risk Analysis Error: Both GEMINI_API_KEY and GROQ_API_KEY are missing in the environment. "
                "Please configure at least one API key in the backend environment variables to enable the AI Risk Analyzer."
            )

        prompt = (
            "You are the Risk Detection Agent for Nyaya AI. Analyze the following document text (type: {document_type}) "
            "for potential legal risks, hidden liabilities, unfair clauses, asymmetric terms, heavy penalties, or "
            "unreasonable termination clauses that a common citizen might miss.\n"
            "Score the overall risk from 0 (Safe) to 100 (Extremely Risky) and categorize it. Provide detailed "
            "explanations and actionable mitigation or negotiation tips in JSON matching the schema.\n\n"
            f"Document Text:\n{document_text}"
        )

        try:
            res_text = call_llm(prompt, json_mode=True, response_schema=RiskAnalysisResult)
            data = json.loads(res_text)
            if "risks" not in data or data["risks"] is None:
                data["risks"] = []
            if "risk_confidence" not in data or data["risk_confidence"] is None:
                data["risk_confidence"] = 0.90
            return RiskAnalysisResult(**data)
        except Exception as e:
            import traceback
            print(f"DEBUG: RiskDetectionAgent failed with error: {e}")
            traceback.print_exc()
            raise e

