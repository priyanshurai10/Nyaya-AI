from app.models.base import Base, Column, String, DateTime, ForeignKey, Integer, Text, JSON, relationship, EncryptedText, datetime

class Document(Base):
    __tablename__ = "documents"
    id = Column(String, primary_key=True, index=True)
    session_id = Column(String, ForeignKey("chat_sessions.id"), nullable=True)
    user_id = Column(String, ForeignKey("User.id"), nullable=True)
    filename = Column(String)
    file_type = Column(String)
    file_size = Column(Integer)
    extracted_text = Column(EncryptedText, nullable=True) # Encrypted
    document_type = Column(String, nullable=True)  # "rent_agreement", "notice", "fir", etc.
    upload_path = Column(String) # For Evidence Vault: stores relative path to physical file
    vault_category = Column(String, nullable=True) # For Evidence Vault categorization
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    session = relationship("ChatSession", back_populates="documents")
    analysis = relationship("DocumentAnalysis", back_populates="document", uselist=False, cascade="all, delete-orphan")
    user = relationship("User", back_populates="documents")

class DocumentAnalysis(Base):
    __tablename__ = "document_analyses"
    id = Column(String, primary_key=True, index=True)
    document_id = Column(String, ForeignKey("documents.id"))
    summary = Column(Text, nullable=True)
    key_points = Column(JSON, nullable=True)
    risks = Column(JSON, nullable=True)
    risk_score = Column(Integer, default=0)
    risk_level = Column(String, default="Low")
    clauses = Column(JSON, nullable=True)
    recommended_steps = Column(JSON, nullable=True)
    legal_implications = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    document = relationship("Document", back_populates="analysis")
