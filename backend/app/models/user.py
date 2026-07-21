from app.models.base import Base, Column, String, DateTime, Float, Boolean, relationship, EncryptedText, datetime

class User(Base):
    __tablename__ = "User"
    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=True)
    mobile = Column("phone", String, unique=True, index=True, nullable=True)
    password_hash = Column("passwordHash", String, nullable=False)
    language_preference = Column(String, default="en")
    is_admin = Column(Boolean, default=False)
    created_at = Column("createdAt", DateTime, default=datetime.utcnow)
    updated_at = Column("updatedAt", DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Location fields
    location_village = Column(String, nullable=True)
    location_town = Column(String, nullable=True)
    location_city = Column(String, nullable=True)
    location_district = Column(String, nullable=True)
    location_state = Column(String, nullable=True)
    location_pincode = Column(String, nullable=True)
    location_latitude = Column(Float, nullable=True)
    location_longitude = Column(Float, nullable=True)
    last_login = Column(DateTime, nullable=True)

    sessions = relationship("ChatSession", back_populates="user", cascade="all, delete-orphan")
    documents = relationship("Document", back_populates="user", cascade="all, delete-orphan")
    saved_cases = relationship("SavedCase", back_populates="user", cascade="all, delete-orphan")
    bookmarks = relationship("CourtBookmark", back_populates="user", cascade="all, delete-orphan")
    searches = relationship("SearchHistory", back_populates="user", cascade="all, delete-orphan")
    appointments = relationship("Appointment", back_populates="user", cascade="all, delete-orphan")
    case_folders = relationship("CaseFolder", back_populates="user", cascade="all, delete-orphan")
    calendar_events = relationship("LegalCalendarEvent", back_populates="user", cascade="all, delete-orphan")
    transactions = relationship("Transaction", back_populates="user", cascade="all, delete-orphan")
    consultations = relationship("ConsultationRequest", back_populates="user", cascade="all, delete-orphan")

class UserProfile(Base):
    __tablename__ = "user_profiles"
    id = Column(String, primary_key=True, index=True)
    user_identifier = Column(String, unique=True, index=True) # hashed IP or browser fingerprint
    preferences = Column(String, nullable=True) # JSON string: preferred language, display modes, etc.
    previous_cases_summary = Column(EncryptedText, nullable=True) # Encrypted rolling summary of user's legal disputes
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
