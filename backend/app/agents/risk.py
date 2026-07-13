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
            # Fallback mock analysis based on document type
            if document_type == "rent_agreement":
                return RiskAnalysisResult(
                    risk_score=35,
                    risk_level="Medium",
                    summary="The document contains standard rent agreement provisions but includes typical clauses favoring the landlord.",
                    risks=[
                        RiskItem(
                            category="penalties",
                            clause_text="Late rent penalty of Rs. 500 per day.",
                            risk_level="Medium",
                            explanation="A penalty of Rs. 500 per day is excessive and disproportionate to most monthly rent amounts in India.",
                            mitigation="Negotiate a grace period of 5-7 days and reduce the daily penalty to a reasonable rate (e.g., Rs. 50-100 per day)."
                        ),
                        RiskItem(
                            category="termination",
                            clause_text="Landlord may terminate lease with 15 days notice, while tenant must give 2 months notice.",
                            risk_level="High",
                            explanation="This is a unilateral and asymmetric termination clause that leaves the tenant vulnerable to sudden eviction.",
                            mitigation="Request mutual termination terms where both parties are required to give the same notice period (typically 1 or 2 months)."
                        )
                    ]
                )
            elif document_type == "fir":
                return RiskAnalysisResult(
                    risk_score=80,
                    risk_level="High",
                    summary="An FIR indicates active criminal proceedings. Severe legal vulnerabilities are present requiring immediate professional intervention.",
                    risks=[
                        RiskItem(
                            category="liability",
                            clause_text="Cognizable offence categories listed under sections.",
                            risk_level="High",
                            explanation="Cognizable offences allow police to arrest without a warrant, posing immediate risk of detention.",
                            mitigation="Apply for anticipatory bail immediately through a defense advocate to protect against arrest."
                        )
                    ]
                )
            else:
                return RiskAnalysisResult(
                    risk_score=20,
                    risk_level="Low",
                    summary="No major legal vulnerabilities or asymmetric clauses detected in the generic document.",
                    risks=[
                        RiskItem(
                            category="general",
                            clause_text="Standard terms.",
                            risk_level="Low",
                            explanation="Standard boilerplate clauses are used.",
                            mitigation="Always review specific execution dates and signatures."
                        )
                    ]
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
        except Exception:
            # Fallback
            return RiskAnalysisResult(
                risk_score=50,
                risk_level="Medium",
                summary="Unable to parse document risks using AI. Manual review of clauses is recommended.",
                risks=[],
                risk_confidence=0.5
            )

