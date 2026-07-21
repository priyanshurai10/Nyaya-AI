from app.models.base import Base, Column, String, DateTime, ForeignKey, Integer, Text, Boolean, JSON, relationship, datetime

class Course(Base):
    __tablename__ = "courses"
    id = Column(String, primary_key=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    thumbnail_url = Column(String, nullable=True)
    metadata_json = Column(JSON, nullable=True) # stores category, difficulty, duration, modules array
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    lessons = relationship("Lesson", back_populates="course", cascade="all, delete-orphan")

class Lesson(Base):
    __tablename__ = "lessons"
    id = Column(String, primary_key=True)
    course_id = Column(String, ForeignKey("courses.id"), nullable=False)
    module_id = Column(String, nullable=True) # to group by module
    title = Column(String, nullable=False)
    content_json = Column(JSON, nullable=True) # structured curriculum content
    video_url = Column(String, nullable=True)
    order_index = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    course = relationship("Course", back_populates="lessons")

class UserProgress(Base):
    __tablename__ = "user_progress"
    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("User.id"), nullable=False)
    course_id = Column(String, ForeignKey("courses.id"), nullable=False)
    lesson_id = Column(String, ForeignKey("lessons.id"), nullable=False)
    module_id = Column(String, nullable=True)
    progress_pct = Column(Integer, default=0)
    status = Column(String, default="IN_PROGRESS") # COMPLETED, IN_PROGRESS
    quiz_score = Column(Integer, nullable=True)
    completed = Column(Boolean, default=False)
    last_accessed = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User")
    course = relationship("Course")
    lesson = relationship("Lesson")

