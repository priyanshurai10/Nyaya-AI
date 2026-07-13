from app.models.base import Base, Column, String, DateTime, Integer, Text, JSON, relationship, datetime

class KnowledgeArticle(Base):
    __tablename__ = "knowledge_articles"
    id = Column(String, primary_key=True)
    title = Column(String, nullable=False)
    category = Column(String, nullable=True)
    tags = Column(JSON, nullable=True)
    content = Column(Text, nullable=False)
    bookmark_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
