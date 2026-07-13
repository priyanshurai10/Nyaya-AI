from app.models.base import Base, Column, String, DateTime, ForeignKey, Text, Boolean, relationship, datetime

class SavedCase(Base):
    __tablename__ = "saved_cases"
    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("users.id"))
    title = Column(String, nullable=False)
    category = Column(String, nullable=False)  # "civil", "criminal", "property", "family", "consumer", "labour", "cybercrime"
    summary = Column(Text, nullable=True)
    status = Column(String, default="open")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="saved_cases")

class CaseFolder(Base):
    __tablename__ = "case_folders"
    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    court_id = Column(String, ForeignKey("courts.id"), nullable=True)
    advocate_id = Column(String, ForeignKey("advocates.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="case_folders")
    court = relationship("Court")
    advocate = relationship("Advocate")
    tasks = relationship("CaseTask", back_populates="folder", cascade="all, delete-orphan")

class CaseTask(Base):
    __tablename__ = "case_tasks"
    id = Column(String, primary_key=True)
    folder_id = Column(String, ForeignKey("case_folders.id"), nullable=False)
    title = Column(String, nullable=False)
    completed = Column(Boolean, default=False)
    due_date = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    folder = relationship("CaseFolder", back_populates="tasks")

class SearchHistory(Base):
    __tablename__ = "search_histories"
    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("users.id"))
    query = Column(String, nullable=False)
    category = Column(String, nullable=True)  # "court", "rights", "general"
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="searches")
