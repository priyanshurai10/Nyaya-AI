from app.models.base import Base, Column, String, DateTime, ForeignKey, Integer, Float, JSON, Text, Boolean, relationship, datetime

class Advocate(Base):
    __tablename__ = "advocates"
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    photo_url = Column(String, nullable=True)
    rating = Column(Float, default=5.0)
    reviews_count = Column(Integer, default=0)
    experience_years = Column(Integer, nullable=False)
    practice_areas = Column(JSON, nullable=False) # List of categories: ["Property Lawyer", "Divorce Lawyer"]
    languages = Column(JSON, nullable=False) # List of lang codes: ["en", "hi"]
    court_association = Column(String, nullable=True)
    chamber_address = Column(String, nullable=True)
    office_address = Column(String, nullable=True)
    phone_number = Column(String, nullable=True)
    consultation_fees = Column(Integer, default=0)
    availability_status = Column(String, default="available") # "available", "busy", "offline"
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Appointment(Base):
    __tablename__ = "appointments"
    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("User.id"), nullable=False)
    advocate_id = Column(String, ForeignKey("advocates.id"), nullable=False)
    date = Column(String, nullable=False)
    time = Column(String, nullable=False)
    fees = Column(Integer, default=0)
    status = Column(String, default="confirmed") # "pending", "confirmed", "completed", "cancelled"
    consent_given = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="appointments")
    advocate = relationship("Advocate")

class PaymentSettings(Base):
    __tablename__ = "payment_settings"
    id = Column(String, primary_key=True, default="default")
    upi_id = Column(String, default="priyanshurai121111@oksbi")
    qr_code_url = Column(String, nullable=True)
    support_email = Column(String, default="priyanshurai121111@gmail.com")
    specialist_price = Column(Integer, default=200)
    specialist_original_price = Column(Integer, default=5000)
