import json
from pydantic import BaseModel, Field
from app.core.config import settings
from app.core.llm import call_llm

class MemorySummary(BaseModel):
    dispute_summary: str = Field(description="A brief description of the legal issue or dispute.")
    parties_involved: str = Field(description="Names or relationships of parties involved (e.g., landlord/tenant, husband/wife, buyer/seller).")
    key_dates: str = Field(description="Important dates or timelines mentioned in the chat.")
    statutes_referenced: str = Field(description="Acts, codes, or statutes that have been referenced in the chat so far.")

class MemoryAgent:
    async def update_memory(self, current_summary: str, last_user_message: str, last_ai_response: str) -> str:
        if not settings.GEMINI_API_KEY and not settings.GROQ_API_KEY:
            return current_summary or "No summary updated (API key missing)."

        prompt = (
            "You are the Memory Agent for Nyaya AI. Review the current case memory summary and the latest conversation turn, "
            "then produce an updated, concise memory summary containing the dispute summary, parties, key dates, "
            "and statutes referenced. Return JSON matching the schema.\n\n"
            f"Current Summary:\n{current_summary or 'None'}\n\n"
            f"Last User Message: {last_user_message}\n"
            f"Last AI Response: {last_ai_response}"
        )

        try:
            res_text = call_llm(prompt, json_mode=True, response_schema=MemorySummary)
            data = json.loads(res_text)
            formatted_summary = (
                f"Dispute: {data.get('dispute_summary', 'N/A')}\n"
                f"Parties: {data.get('parties_involved', 'N/A')}\n"
                f"Dates: {data.get('key_dates', 'N/A')}\n"
                f"Statutes: {data.get('statutes_referenced', 'N/A')}"
            )
            return formatted_summary
        except Exception:
            return f"Dispute: Updated from recent conversation\nLast message: {last_user_message[:50]}..."
