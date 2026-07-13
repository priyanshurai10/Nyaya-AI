from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Dict, Any
from app.core.database import get_db
from app.models import AuditLog, EvaluationLog

router = APIRouter()

@router.get("/stats")
def get_observability_stats(db: Session = Depends(get_db)):
    """
    Returns aggregated security events, agent activity counts, and transaction status logs.
    """
    try:
        # Total security events (blocked injections)
        blocked_injections = db.query(AuditLog).filter(AuditLog.action_type == "block_injection").count()
        
        # Blocked file integrity uploads
        blocked_uploads = db.query(AuditLog).filter(
            AuditLog.action_type == "upload",
            AuditLog.result_status == "blocked"
        ).count()

        # Success actions
        successful_uploads = db.query(AuditLog).filter(
            AuditLog.action_type == "upload",
            AuditLog.result_status == "success"
        ).count()

        chat_queries = db.query(AuditLog).filter(AuditLog.action_type == "chat_message").count()
        approved_drafts = db.query(AuditLog).filter(AuditLog.action_type == "approval").count()

        # Group by agent to see usage distribution
        agent_counts = {}
        agent_query = db.query(AuditLog.agent_used, func.count(AuditLog.id)).group_by(AuditLog.agent_used).all()
        for agent, count in agent_query:
            if agent:
                agent_counts[agent] = count

        return {
            "security": {
                "blocked_prompt_injections": blocked_injections,
                "blocked_file_integrity_violations": blocked_uploads,
                "total_security_alerts": blocked_injections + blocked_uploads
            },
            "activity": {
                "total_chats_processed": chat_queries,
                "total_documents_analyzed": successful_uploads,
                "total_drafts_approved": approved_drafts,
                "agent_utilization": agent_counts
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch stats: {e}")

@router.get("/evals")
def get_evaluation_metrics(db: Session = Depends(get_db)):
    """
    Returns average quality scores evaluated across 7 categories.
    """
    try:
        # Calculate averages for evaluation log fields
        avgs = db.query(
            func.avg(EvaluationLog.intent_satisfaction),
            func.avg(EvaluationLog.functional_correctness),
            func.avg(EvaluationLog.language_accuracy),
            func.avg(EvaluationLog.translation_quality),
            func.avg(EvaluationLog.doc_analysis_quality),
            func.avg(EvaluationLog.risk_detection_quality),
            func.avg(EvaluationLog.explanation_clarity)
        ).first()

        return {
            "intent_satisfaction": float(avgs[0] or 1.0),
            "functional_correctness": float(avgs[1] or 1.0),
            "language_accuracy": float(avgs[2] or 1.0),
            "translation_quality": float(avgs[3] or 1.0),
            "doc_analysis_quality": float(avgs[4] or 1.0),
            "risk_detection_quality": float(avgs[5] or 1.0),
            "explanation_clarity": float(avgs[6] or 1.0)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch evaluations: {e}")

@router.get("/audit")
def get_audit_trail(db: Session = Depends(get_db)):
    """
    Returns the latest 50 audit entries.
    """
    try:
        logs = db.query(AuditLog).order_by(AuditLog.timestamp.desc()).limit(50).all()
        return [
            {
                "id": log.id,
                "timestamp": log.timestamp.isoformat(),
                "session_id": log.session_id,
                "user_id": log.user_id,
                "agent_used": log.agent_used,
                "action_type": log.action_type,
                "action_description": log.action_description,
                "result_status": log.result_status,
                "client_ip_hash": log.client_ip_hash
            }
            for log in logs
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch audit trail: {e}")
