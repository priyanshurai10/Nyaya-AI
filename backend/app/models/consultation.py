from app.models.base import Base, Column, String, DateTime, ForeignKey, Integer, Text, Boolean, relationship, datetime

class ConsultationRequest(Base):
    __tablename__ = "consultation_requests"
    id = Column(String, primary_key=True)
    consultation_id = Column(String, unique=True, nullable=True) # e.g. NYA-2026-001245
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    service_name = Column(String, nullable=False) # e.g. "Talk to Legal Specialist"
    request_type = Column(String, nullable=False) # "pay_now", "callback", "email", "book_later"
    full_name = Column(String, nullable=False)
    mobile_number = Column(String, nullable=True)
    email = Column(String, nullable=True)
    preferred_language = Column(String, nullable=True)
    legal_issue_type = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    status = Column(String, default="requested") # "requested", "callback_requested", "email_requested", "pending_verification", "verified", "failed", "assigned", "completed"
    assigned_specialist = Column(String, nullable=True)
    transaction_id = Column(String, ForeignKey("transactions.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="consultations")
    transaction = relationship("Transaction")

class Transaction(Base):
    __tablename__ = "transactions"
    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    consultation_id = Column(String, nullable=True)
    amount = Column(Integer, nullable=False)
    payment_method = Column(String, nullable=False) # "upi", "qr", "card", "netbanking"
    utr_number = Column(String, nullable=True)
    screenshot_path = Column(String, nullable=True)
    status = Column(String, default="pending") # "pending", "verified", "failed"
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="transactions")
