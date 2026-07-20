import json
from pydantic import BaseModel, Field
from typing import List, Tuple, Optional
from app.core.config import settings
from app.core.llm import call_llm
from app.skills.manager import SkillManager

class LegalAnalysisResult(BaseModel):
    response: str = Field(description="The main legal explanation written in simple, reassuring, and clear terms for an ordinary citizen. Use markdown like bullet points and bold text for high readability.")
    laws_cited: List[str] = Field(description="Names of major legal Acts cited, e.g., 'Transfer of Property Act, 1882', 'Model Tenancy Act, 2021', 'Indian Penal Code'.")
    sections_cited: List[str] = Field(description="Specific sections or articles, e.g., 'Section 108 — Transfer of Property Act', 'Section 173 — BNSS'.")
    next_steps: List[str] = Field(description="Actionable, step-by-step next steps for the user.")

class LegalChatAgent:
    def __init__(self):
        self.skill_manager = SkillManager()

    async def generate_legal_response(
        self,
        query: str,
        memory_summary: str,
        chat_history: List[dict],
        mother_mode: bool = False,
        document_context: str = None,
        target_language: str = "english"
    ) -> Tuple[LegalAnalysisResult, Optional[str], Optional[str]]:
        """
        Generates a legal response. Matches and loads dynamic legal skills.
        Returns a tuple: (LegalAnalysisResult, active_skill_id, active_skill_name)
        """
        # Dynamic Skill Matching based on query
        matched_skill = self.skill_manager.match_skill(query)
        skill_prompt = ""
        active_skill_id = None
        active_skill_name = None
        if matched_skill:
            active_skill_id = matched_skill.id
            active_skill_name = matched_skill.name
            skill_prompt = self.skill_manager.get_skill_prompt(active_skill_id)

        if not settings.GEMINI_API_KEY and not settings.GROQ_API_KEY:
            raise ValueError(
                "AI Assistant Configuration Error: Both GEMINI_API_KEY and GROQ_API_KEY are missing in the environment. "
                "Please configure at least one API key in the backend environment variables to enable the AI Assistant."
            )

        # Build history context
        history_str = ""
        for msg in chat_history[-6:]:  # last 6 messages
            history_str += f"{msg['role'].capitalize()}: {msg['content']}\n"

        # Supported languages definitions
        supported_langs = {
            "english": "English",
            "hindi": "Hindi (हिन्दी)",
            "bengali": "Bengali (বাংলা)",
            "tamil": "Tamil (தமிழ்)",
            "telugu": "Telugu (తెలుగు)",
            "marathi": "Marathi (मराठी)",
            "gujarati": "Gujarati (ગુજરાતી)",
            "kannada": "Kannada (ಕನ್ನಡ)",
            "malayalam": "Malayalam (മലയാളം)",
            "punjabi": "Punjabi (ਪੰਜਾਬੀ)",
            "hinglish": "Hinglish (Hindi language written in Latin/English script)"
        }
        lang_name = supported_langs.get(target_language.lower(), "English")

        language_instruction = f"Write the main 'response' text strictly in the {lang_name} language. Keep statutory names (e.g. 'Model Tenancy Act') or section numbers in English characters if helpful, but all explanation must be written in {lang_name}."
        if target_language.lower() == "hinglish":
            language_instruction = "Write the main 'response' text strictly in Hinglish (Hindi written in English alphabet, e.g., 'Aapke paas rights hain. Landlord security deposit bina vajah nahi rakh sakta'). Use simple words, natural syntax, and zero complex legal jargon."
        elif target_language.lower() != "english":
            language_instruction = f"Write the main 'response' text strictly in the native script of {lang_name}. Do NOT use English characters for the explanation, except for specific Act names or section numbers in parenthetical annotations."

        # Tone and style directions
        tone_instruction = (
            "You are the Generic Legal Agent for Nyaya AI, a world-class legal technology assistant for India. "
            "Your objective is to help common citizens understand their legal situation under Indian Law. "
            "Analyze the user query, considering the session summary, chat history, and matched skill (if any).\n\n"
            f"LANGUAGE RULE: {language_instruction}\n\n"
            "If the user query is a general greeting (like 'hi', 'hello', 'namaste') or simple small talk, "
            "do NOT produce a rigid legal analysis. Instead, welcome them warmly, explain that you are Nyaya AI, "
            "their legal assistant, and ask how you can help them understand their legal situation, contracts, "
            "notices, or rights today. In this case, keep laws_cited and sections_cited lists empty.\n\n"
        )
        if mother_mode:
            tone_instruction += (
                "CRITICAL: MOTHER MODE IS ENABLED. Write the response in an extremely simple, warm, reassuring, "
                "and mother-friendly manner. Explain the situation like a caring, supportive child would explain to their mother. "
                "Use zero legal jargon. Focus heavily on emotional assurance, simple steps, and general safety. "
                "Keep citations in the separate JSON fields, but do NOT clutter the main response text with complex section names.\n\n"
            )
        else:
            tone_instruction += (
                "Write the response in a professional, empathetic, and highly clear tone. Explain legal terms, "
                "explain the rights they have under relevant Indian Acts (e.g., Bharatiya Nyaya Sanhita, Bharatiya Nagarik Suraksha Sanhita, "
                "Model Tenancy Act, etc.). Citations should be integrated cleanly.\n\n"
            )

        if skill_prompt:
            tone_instruction += (
                f"### ACTIVATED LEGAL SKILL SPECIALIZATION: {active_skill_name} ###\n"
                "You must follow the specialized workflow, guidelines, and reference structures below to answer the query:\n"
                f"{skill_prompt}\n"
                "###################################################################\n\n"
            )

        doc_context_str = f"Document Context (Details of the document the user uploaded/is discussing):\n{document_context}\n\n" if document_context else ""

        prompt = (
            f"{tone_instruction}\n\n"
            f"{doc_context_str}"
            f"Case Summary Memory:\n{memory_summary or 'None'}\n\n"
            f"Recent Chat History:\n{history_str}\n"
            f"User Query (Normalized to English): {query}\n\n"
            "Return the result strictly formatted to the JSON schema."
        )

        try:
            res_text = call_llm(prompt, json_mode=True, response_schema=LegalAnalysisResult)
            data = json.loads(res_text)
            if "laws_cited" not in data or data["laws_cited"] is None:
                data["laws_cited"] = []
            if "sections_cited" not in data or data["sections_cited"] is None:
                data["sections_cited"] = []
            if "next_steps" not in data or data["next_steps"] is None:
                data["next_steps"] = []
            return LegalAnalysisResult(**data), active_skill_id, active_skill_name
        except Exception as e:
            import traceback
            print(f"DEBUG: LegalChatAgent failed with error: {e}")
            traceback.print_exc()
            raise e
