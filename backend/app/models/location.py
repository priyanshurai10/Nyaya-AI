from app.models.base import Base, Column, String, DateTime, ForeignKey, Integer, Float, Text, relationship, datetime

class Court(Base):
    __tablename__ = "courts"
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    court_type = Column(String, nullable=False)  # "lower", "civil", "district", "sessions", "family", "consumer", "labour", "high", "supreme"
    address = Column(String, nullable=False)
    village = Column(String, nullable=True)
    city = Column(String, nullable=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    state = Column(String, nullable=False)
    district = Column(String, nullable=False)
    pincode = Column(String, nullable=True)
    working_hours = Column(String, default="10:00 AM - 5:00 PM")
    contact_number = Column(String, nullable=True)
    website = Column(String, nullable=True)
    judge_info = Column(String, nullable=True)
    jurisdiction = Column(Text, nullable=True)
    image_url = Column(String, nullable=True)

class CourtBookmark(Base):
    __tablename__ = "court_bookmarks"
    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("users.id"))
    court_id = Column(String, ForeignKey("courts.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="bookmarks")
    court = relationship("Court")

class Judge(Base):
    __tablename__ = "judges"
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    photo_url = Column(String, nullable=True)
    court_id = Column(String, ForeignKey("courts.id"), nullable=False)
    designation = Column(String, nullable=True)
    bio = Column(Text, nullable=True)

    court = relationship("Court")

class PoliceStation(Base):
    __tablename__ = "police_stations"
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    station_type = Column(String, nullable=False)
    address = Column(String)
    city = Column(String)
    district = Column(String)
    state = Column(String)
    latitude = Column(Float)
    longitude = Column(Float)
    phone = Column(String)

class LegalAidCentre(Base):
    __tablename__ = "legal_aid_centres"
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    address = Column(String)
    district = Column(String)
    state = Column(String)
    latitude = Column(Float)
    longitude = Column(Float)
    phone = Column(String)
    website = Column(String)

class ConsumerForum(Base):
    __tablename__ = "consumer_forums"
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    address = Column(String)
    district = Column(String)
    state = Column(String)
    latitude = Column(Float)
    longitude = Column(Float)
    phone = Column(String)
    website = Column(String)

class LocationPincode(Base):
    """Offline-first nationwide India PIN code lookup table.
    Seeded from GeoNames IN.txt dataset (150,000+ records).
    """
    __tablename__ = "location_pincodes"
    id = Column(Integer, primary_key=True, autoincrement=True)
    pincode = Column(String(6), nullable=False, index=True)
    office_name = Column(String, nullable=True)
    village = Column(String, nullable=True)
    town = Column(String, nullable=True)
    city = Column(String, nullable=True)
    district = Column(String, nullable=True, index=True)
    state = Column(String, nullable=True, index=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
