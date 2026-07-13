from app.models.base import Base, Column, String, DateTime, Text, JSON, relationship, datetime

class LandmarkJudgment(Base):
    __tablename__ = "landmark_judgments"
    id = Column(String, primary_key=True)
    case_name = Column(String, nullable=False)
    court = Column(String, nullable=True)
    bench = Column(String, nullable=True)
    citation = Column(String, nullable=True)
    date = Column(String, nullable=True)
    legal_issue = Column(Text, nullable=True)
    decision = Column(Text, nullable=True)
    impact = Column(Text, nullable=True)
    related_laws = Column(JSON, nullable=True)
    related_judgments = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
