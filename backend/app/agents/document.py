import json
import os
from pypdf import PdfReader
from PIL import Image
import google.generativeai as genai
from pydantic import BaseModel, Field
from typing import List, Dict, Optional
from app.core.config import settings
from app.core.llm import call_llm

class DocumentAnalysisResult(BaseModel):
    document_type: str = Field(description="The type of document. MUST be one of: 'FIR', 'Legal Notice', 'Rent Agreement', 'Employment Agreement', 'Property Document', 'Court Notice', 'Consumer Complaint', 'Unknown Document'")
    summary: str = Field(description="A plain-language summary of what this document is about, structured for common citizens.")
    key_points: List[str] = Field(description="A list of key facts, dates, amounts, or parties involved in the document.")
    clauses: Dict[str, str] = Field(description="A dictionary of key clauses extracted (e.g., 'Rent Amount', 'Notice Period', 'Security Deposit', 'Termination Clause') and their details.")
    recommended_steps: List[str] = Field(description="Actionable next steps that the user should take based on this document.")
    legal_implications: List[str] = Field(description="Actionable legal implications of this document for the citizen under Indian Law.")
    classification_confidence: float = Field(default=0.9, description="Confidence score of document classification, between 0.0 and 1.0")

class DocumentAnalysisAgent:
    def extract_text_from_pdf(self, file_path: str) -> str:
        text = ""
        try:
            reader = PdfReader(file_path)
            for page in reader.pages:
                text += page.extract_text() or ""
        except Exception as e:
            text = f"Error extracting text from PDF: {str(e)}"
        return text

    def extract_text_from_image(self, file_path: str) -> str:
        if settings.GEMINI_API_KEY:
            try:
                genai.configure(api_key=settings.GEMINI_API_KEY)
                model = genai.GenerativeModel('gemini-2.5-flash')
                img = Image.open(file_path)
                prompt = "Extract all text from this document image. Return only the extracted text, retaining formatting where possible."
                response = model.generate_content([prompt, img])
                return response.text
            except Exception as e:
                return f"Error performing OCR via Gemini: {str(e)}"
        return "Visual OCR extraction requires a configured GEMINI_API_KEY."

    async def analyze_document(self, text: str, filename: str, language: str = "en") -> DocumentAnalysisResult:
        if not settings.GEMINI_API_KEY and not settings.GROQ_API_KEY:
            # Offline mock fallback
            lower_name = filename.lower()
            if "rent" in lower_name or "lease" in lower_name:
                return DocumentAnalysisResult(
                    document_type="Rent Agreement",
                    summary="This is a Rent Agreement document. It establishes a tenancy relationship between the landlord and tenant.",
                    key_points=["Landlord and Tenant identified", "Security deposit terms", "Monthly rent details"],
                    clauses={
                        "Security Deposit": "Typically 2-3 months rent, refundable at end of lease.",
                        "Notice Period": "Generally 1 month notice required by either party.",
                        "Rent Amount": "Payable monthly, usually with a yearly escalation clause."
                    },
                    recommended_steps=["Verify if the rent amount and deposit match your verbal agreement.", "Check the notice period clause for any hidden penalties."],
                    legal_implications=["The agreement creates a binding lease contract under the Transfer of Property Act, 1882.", "Tenant could face eviction for non-payment of rent."]
                )
            elif "fir" in lower_name or "police" in lower_name:
                return DocumentAnalysisResult(
                    document_type="FIR",
                    summary="First Information Report (FIR) registered at a police station. It initiates a criminal investigation.",
                    key_points=["Complainant details", "Accused details", "Sections of IPC/BNS cited"],
                    clauses={
                        "Sections": "Indian Penal Code or Bhartiya Nyaya Sanhita sections outlining the alleged offence.",
                        "Investigation Officer": "Officer assigned to investigate the complaint."
                    },
                    recommended_steps=["Obtain a certified copy of the FIR.", "Consult a legal expert or lawyer immediately to understand bail conditions and charges."],
                    legal_implications=["Active criminal investigation initiated against the named accused.", "Police can arrest without warrant for cognizable offences."]
                )
            else:
                return DocumentAnalysisResult(
                    document_type="Unknown Document",
                    summary="A general legal or official document has been uploaded.",
                    key_points=["General parties and terms identified."],
                    clauses={"General Term": "Extracted details from document text."},
                    recommended_steps=["Review the document details with legal counsel if you have rights-related concerns."],
                    legal_implications=["The document might create binding obligations or liabilities. Legal review is recommended."]
                )

        prompt = (
            "You are the Document Analysis Agent for Nyaya AI. Analyze the following extracted legal document text. "
            "Identify the document type (strictly map to one of: 'FIR', 'Legal Notice', 'Rent Agreement', 'Employment Agreement', 'Property Document', 'Court Notice', 'Consumer Complaint', 'Unknown Document').\n"
            f"LANGUAGE REQUIREMENT: Write the response text fields ('summary', 'key_points', 'clauses', 'recommended_steps', 'legal_implications') strictly in the language: {language}.\n"
            "If the selected language is not English, translate all generated content fields to that language. If the selected language is 'Hinglish', write in Hindi script using English/Latin alphabets. Otherwise, write in the native script of the selected language.\n\n"
            "Analyze the document summary in simple plain language for ordinary citizens, extract key points "
            "(parties, dates, amounts), extract crucial clauses and their summaries, list legal implications, and provide actionable next steps. "
            "Return the analysis in JSON matching the schema.\n\n"
            f"Document Text:\n{text}"
        )

        try:
            res_text = call_llm(prompt, json_mode=True, response_schema=DocumentAnalysisResult)
            data = json.loads(res_text)
            if "key_points" not in data or data["key_points"] is None:
                data["key_points"] = []
            if "clauses" not in data or data["clauses"] is None:
                data["clauses"] = {}
            if "recommended_steps" not in data or data["recommended_steps"] is None:
                data["recommended_steps"] = []
            if "legal_implications" not in data or data["legal_implications"] is None:
                data["legal_implications"] = []
            if "classification_confidence" not in data or data["classification_confidence"] is None:
                data["classification_confidence"] = 0.95
            return DocumentAnalysisResult(**data)
        except Exception:
            # Fallback
            return DocumentAnalysisResult(
                document_type="Unknown Document",
                summary="Failed to analyze document with AI. Here is a basic extraction summary.",
                key_points=["Document uploaded successfully."],
                clauses={"Default": "No specific clauses identified."},
                recommended_steps=["Please review the document text directly or retry with a clearer scan."],
                legal_implications=["The document text could not be fully analyzed. Manual review is required."],
                classification_confidence=0.5
            )

