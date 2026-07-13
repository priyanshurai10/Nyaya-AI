from app.models.base import Base, Column, String, DateTime, Integer, Float, Text, ForeignKey, relationship, datetime

class SkillInvocationLog(Base):
    __tablename__ = "skill_invocation_logs"
    id = Column(String, primary_key=True, index=True)
    session_id = Column(String, index=True)
    skill_id = Column(String, index=True)
    query_text = Column(Text, nullable=True)
    execution_time_ms = Column(Integer, default=0)
    status = Column(String, default="success") # 'success', 'rate_limit', 'failed'
    created_at = Column(DateTime, default=datetime.utcnow)

class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(String, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    user_id = Column(String, index=True, nullable=True)
    session_id = Column(String, index=True, nullable=True)
    agent_used = Column(String, nullable=True)
    action_type = Column(String, index=True) # 'upload', 'draft_generation', 'chat_message', 'block_injection', 'approval'
    action_description = Column(Text, nullable=True)
    result_status = Column(String, default="success") # 'success', 'failed', 'blocked'
    client_ip_hash = Column(String, nullable=True)

class EvaluationLog(Base):
    __tablename__ = "evaluation_logs"
    id = Column(String, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    session_id = Column(String, index=True)
    query_text = Column(Text, nullable=True)
    response_text = Column(Text, nullable=True)
    intent_satisfaction = Column(Float, default=1.0)
    functional_correctness = Column(Float, default=1.0)
    language_accuracy = Column(Float, default=1.0)
    translation_quality = Column(Float, default=1.0)
    doc_analysis_quality = Column(Float, default=1.0)
    risk_detection_quality = Column(Float, default=1.0)
    explanation_clarity = Column(Float, default=1.0)

class Feedback(Base):
    __tablename__ = "feedbacks"
    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=True)
    rating = Column(Integer, nullable=False)
    comments = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User")
