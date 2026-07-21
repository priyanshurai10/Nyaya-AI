from app.models.base import Base, Column, String, DateTime, ForeignKey, Boolean, relationship, datetime

class LegalCalendarEvent(Base):
    __tablename__ = "legal_calendar_events"
    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("User.id"), nullable=False)
    title = Column(String, nullable=False)
    event_type = Column(String, nullable=False) # "hearing", "filing", "notice_deadline", "rti_deadline", "consultation"
    event_date = Column(String, nullable=False) # ISO format or custom date format
    reminded = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="calendar_events")
