from app.models.base import Base, Column, String, DateTime, ForeignKey, Text, JSON, relationship, EncryptedText, datetime

class ChatSession(Base):
    __tablename__ = "chat_sessions"
    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    language = Column(String, default="en")
    summary = Column(EncryptedText, nullable=True) # Encrypted
    
    messages = relationship("ChatMessage", back_populates="session", cascade="all, delete-orphan")
    documents = relationship("Document", back_populates="session", cascade="all, delete-orphan")
    user = relationship("User", back_populates="sessions")

class ChatMessage(Base):
    __tablename__ = "chat_messages"
    id = Column(String, primary_key=True, index=True)
    session_id = Column(String, ForeignKey("chat_sessions.id"))
    role = Column(String)  # "user" or "assistant"
    content = Column(EncryptedText) # Encrypted
    detected_language = Column(String, nullable=True)
    laws_cited = Column(JSON, nullable=True)
    sections_cited = Column(JSON, nullable=True)
    next_steps = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    session = relationship("ChatSession", back_populates="messages")
