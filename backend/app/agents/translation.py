import json
from pydantic import BaseModel, Field
from app.core.config import settings
from app.core.llm import call_llm

class TranslationAnalysis(BaseModel):
    detected_language: str = Field(description="The language of the user message (one of: english, hindi, bengali, tamil, telugu, marathi, gujarati, kannada, malayalam, punjabi, hinglish)")
    confidence: float = Field(description="Confidence score between 0.0 and 1.0")
    english_translation: str = Field(description="The user's message translated/normalized into clear English. If the input is already in English, this is the same as the input.")

class TranslationAgent:
    SUPPORTED_LANGUAGES = {
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
        "hinglish": "Hinglish (Hindi written in English alphabet)"
    }

    async def analyze_input(self, text: str) -> TranslationAnalysis:
        # Only bypass for simple English greetings/commands to save API calls
        words = [w.strip("?,.!") for w in text.lower().split()]
        greetings = {"hi", "hello", "hey", "help", "test", "ok", "okay", "yes", "no"}
        is_simple_greeting = len(words) <= 2 and all(w in greetings for w in words)

        if is_simple_greeting:
            return TranslationAnalysis(
                detected_language="english",
                confidence=1.0,
                english_translation=text
            )

        if not settings.GEMINI_API_KEY and not settings.GROQ_API_KEY:
            # Fallback heuristic checks
            is_hindi = any(2304 <= ord(c) <= 2431 for c in text)
            is_bengali = any(2432 <= ord(c) <= 2559 for c in text)
            is_tamil = any(2944 <= ord(c) <= 3071 for c in text)
            
            detected = "english"
            if is_hindi:
                detected = "hindi"
            elif is_bengali:
                detected = "bengali"
            elif is_tamil:
                detected = "tamil"

            return TranslationAnalysis(
                detected_language=detected,
                confidence=1.0,
                english_translation=text
            )

        prompt = (
            f"You are the Translation Agent for Nyaya AI. Analyze the following user input to detect which language "
            f"it is written in. We support: {', '.join(self.SUPPORTED_LANGUAGES.keys())}.\n"
            "If it is a regional Indian language, translate and normalize it into clear, standard English so that "
            "legal analysis can be performed. Return the result in JSON format matching the schema.\n\n"
            f"Input: {text}"
        )

        try:
            res_text = call_llm(prompt, json_mode=True, response_schema=TranslationAnalysis)
            data = json.loads(res_text)
            lang = data.get("detected_language", "english").lower().strip()
            if lang not in self.SUPPORTED_LANGUAGES:
                lang = "english"
            data["detected_language"] = lang
            return TranslationAnalysis(**data)
        except Exception:
            return TranslationAnalysis(
                detected_language="english",
                confidence=0.5,
                english_translation=text
            )

    async def translate_output(self, english_response: str, target_language: str) -> str:
        target_language_clean = target_language.lower().strip()
        if target_language_clean == "english":
            return english_response

        if not settings.GEMINI_API_KEY and not settings.GROQ_API_KEY:
            return english_response

        language_name = self.SUPPORTED_LANGUAGES.get(target_language_clean, "Hindi")

        prompt = (
            f"You are the Translation Agent for Nyaya AI. Translate the following legal explanation from English into {language_name}.\n"
            "Rules:\n"
            "1. Maintain legal accuracy. Keep statutory section numbers, names of laws (e.g. 'Model Tenancy Act', 'Bhartiya Nyaya Sanhita'), "
            "and technical words in English parenthetical comments or quotes if helpful, but transliterate or translate the explanation clearly.\n"
            f"2. If target is Hinglish, write in natural conversational Hindi transliterated into Latin/English script.\n"
            f"3. Otherwise, use the standard native script of {language_name}.\n"
            "4. Ensure the tone is empathetic, clear, and reassuring, suitable for a common citizen.\n\n"
            f"Text to translate:\n{english_response}"
        )

        try:
            return call_llm(prompt, json_mode=False)
        except Exception:
            return english_response
