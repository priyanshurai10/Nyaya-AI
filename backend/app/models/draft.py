from app.models.base import Base, Column, String, DateTime, ForeignKey, Text, JSON, relationship, datetime

class DraftDocument(Base):
    __tablename__ = "draft_documents"
    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    template_type = Column(String, nullable=False) # e.g. "complaint", "legal_notice", "rti"
    title = Column(String, nullable=False)
    content_json = Column(JSON, nullable=True) # Form data that was filled out
    generated_text = Column(Text, nullable=True) # Final generated markdown or HTML
    status = Column(String, default="draft") # "draft", "finalized"
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User")
