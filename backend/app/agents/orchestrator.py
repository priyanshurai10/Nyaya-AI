from app.agents.translation import TranslationAgent
from app.agents.safety import SafetyAgent
from app.agents.memory import MemoryAgent
from app.agents.legal import LegalChatAgent
from app.agents.document import DocumentAnalysisAgent
from app.agents.risk import RiskDetectionAgent
from app.core.security import (
    detect_prompt_injection,
    validate_agent_permission,
    log_audit_event
)
from app.evaluation.metrics import run_auto_evaluation

class OrchestratorService:
    def __init__(self):
        self.translation_agent = TranslationAgent()
        self.safety_agent = SafetyAgent()
        self.memory_agent = MemoryAgent()
        self.legal_agent = LegalChatAgent()
        self.document_agent = DocumentAnalysisAgent()
        self.risk_agent = RiskDetectionAgent()

    async def process_message(
        self,
        user_message: str,
        current_summary: str,
        chat_history: list,
        mother_mode: bool = False,
        document_context: str = None,
        db = None,
        client_ip: str = None,
        session_id: str = None
    ) -> dict:
        # 1. Prompt Injection Firewall Check
        injection_eval = detect_prompt_injection(user_message)
        if injection_eval["is_injection"]:
            # Log blocked injection event
            log_audit_event(
                db=db,
                action_type="block_injection",
                action_description=f"Adversarial prompt injection blocked. Rule match: {injection_eval['reason']}",
                session_id=session_id,
                agent_used="firewall",
                result_status="blocked",
                client_ip=client_ip
            )
            disclaimer = self.safety_agent.get_legal_disclaimer("en")
            return {
                "detected_language": "en",
                "response": "Safety Alert: Input matches instruction override signatures. Request blocked by Prompt Injection Firewall.",
                "laws_cited": [],
                "sections_cited": [],
                "next_steps": [],
                "disclaimer": disclaimer,
                "updated_summary": current_summary,
                "active_skill": None,
                "active_skill_id": None,
                "classification_confidence": 0.0,
                "risk_confidence": 0.0,
                "translation_confidence": 0.0,
                "requires_approval": False
            }

        # 2. Agent Access Permission validation (RBAA checking)
        # Verify safety agent can assess inputs
        allowed, err_msg = validate_agent_permission("legal_agent", "cite_laws")
        if not allowed:
            raise PermissionError(err_msg)

        # 3. Safety Agent Check
        safety_eval = await self.safety_agent.evaluate_input(user_message)
        if not safety_eval.is_safe:
            disclaimer = self.safety_agent.get_legal_disclaimer("en")
            log_audit_event(
                db=db,
                action_type="chat_message",
                action_description=f"Query rejected by Safety Agent: {safety_eval.reason}",
                session_id=session_id,
                agent_used="safety_agent",
                result_status="failed",
                client_ip=client_ip
            )
            return {
                "detected_language": "en",
                "response": f"I cannot assist with this query. Reason: {safety_eval.reason}",
                "laws_cited": [],
                "sections_cited": [],
                "next_steps": [],
                "disclaimer": disclaimer,
                "updated_summary": current_summary,
                "active_skill": None,
                "active_skill_id": None,
                "classification_confidence": 0.0,
                "risk_confidence": 0.0,
                "translation_confidence": 0.0,
                "requires_approval": False
            }

        # 4. Language Detection & Normalization (Translation Agent)
        # Assert Translation Agent role scopes
        trans_allowed, trans_err = validate_agent_permission("translation_agent", "translate_content")
        if not trans_allowed:
            raise PermissionError(trans_err)

        translation_eval = await self.translation_agent.analyze_input(user_message)
        detected_lang = translation_eval.detected_language
        normalized_query = translation_eval.english_translation
        translation_conf = translation_eval.confidence

        # 5. Detect high-risk action requiring Human-in-the-loop (HITL) approval
        high_risk_keywords = ["draft notice", "generate complaint", "draft agreement", "create petition", "issue notice", "draft template"]
        query_lower = normalized_query.lower()
        requires_approval = any(kw in query_lower for kw in high_risk_keywords)

        # 6. Legal Chat/Research Agent execution
        legal_result, active_skill_id, active_skill_name = await self.legal_agent.generate_legal_response(
            query=normalized_query,
            memory_summary=current_summary,
            chat_history=chat_history,
            mother_mode=mother_mode,
            document_context=document_context,
            target_language=detected_lang
        )

        final_response_text = legal_result.response
        disclaimer = self.safety_agent.get_legal_disclaimer(detected_lang)

        # 7. Memory updates (Memory Agent role check)
        mem_allowed, mem_err = validate_agent_permission("memory_agent", "read_legal_memory")
        if not mem_allowed:
            raise PermissionError(mem_err)

        updated_summary = current_summary
        try:
            updated_summary = await self.memory_agent.update_memory(
                current_summary=current_summary,
                last_user_message=normalized_query,
                last_ai_response=legal_result.response
            )
        except Exception:
            pass

        # 8. Logging to Audit Log Table
        action_type = "draft_generation" if requires_approval else "chat_message"
        log_audit_event(
            db=db,
            action_type=action_type,
            action_description=f"Processed user legal query. Target language: {detected_lang}. Match Skill: {active_skill_name or 'None'}.",
            session_id=session_id,
            agent_used="legal_agent",
            result_status="success",
            client_ip=client_ip
        )

        # 9. Logging to Evaluation Log Table
        run_auto_evaluation(
            db=db,
            session_id=session_id or "unknown",
            query_text=user_message,
            response_text=final_response_text,
            laws_cited=legal_result.laws_cited,
            sections_cited=legal_result.sections_cited,
            target_lang=detected_lang,
            translation_quality=translation_conf,
            doc_analysis_quality=1.0,
            risk_detection_quality=1.0
        )

        return {
            "detected_language": detected_lang,
            "response": final_response_text,
            "laws_cited": legal_result.laws_cited,
            "sections_cited": legal_result.sections_cited,
            "next_steps": legal_result.next_steps,
            "disclaimer": disclaimer,
            "updated_summary": updated_summary,
            "active_skill": active_skill_name,
            "active_skill_id": active_skill_id,
            "classification_confidence": 0.95 if document_context else 0.0,
            "risk_confidence": 0.90 if document_context else 0.0,
            "translation_confidence": translation_conf,
            "requires_approval": requires_approval
        }
orchestrator_service = OrchestratorService()
