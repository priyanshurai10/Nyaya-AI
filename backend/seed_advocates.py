import uuid
from app.core.database import SessionLocal
from app.models.marketplace import Advocate

def seed():
    db = SessionLocal()
    try:
        count = db.query(Advocate).count()
        if count > 0:
            print(f"Advocates table already contains {count} records. Skipping seeding.")
            return

        print("Seeding advocates...")
        advocates_list = [
            # --- DELHI NCR ---
            {
                "id": "ADV-" + str(uuid.uuid4())[:8],
                "name": "Advocate Sanjay Kishan",
                "experience_years": 18,
                "practice_areas": ["Property Lawyer", "Civil Lawyer", "Family Lawyer"],
                "languages": ["en", "hi", "pan"],
                "court_association": "Supreme Court of India / Delhi High Court",
                "chamber_address": "Chamber 412, Delhi High Court Chambers, New Delhi",
                "office_address": "E-93, Greater Kailash 1, New Delhi",
                "phone_number": "9810123456",
                "consultation_fees": 1500,
                "availability_status": "available",
                "latitude": 28.6139,
                "longitude": 77.2090,
                "photo_url": "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face"
            },
            {
                "id": "ADV-" + str(uuid.uuid4())[:8],
                "name": "Advocate Meenakshi Lekhi",
                "experience_years": 14,
                "practice_areas": ["Divorce Lawyer", "Family Lawyer", "Consumer Lawyer"],
                "languages": ["en", "hi"],
                "court_association": "Delhi High Court / Saket District Court",
                "chamber_address": "Chamber 12, Saket Court Complex, New Delhi",
                "office_address": "A-44, Defence Colony, New Delhi",
                "phone_number": "9811223344",
                "consultation_fees": 1200,
                "availability_status": "available",
                "latitude": 28.5244,
                "longitude": 77.2239,
                "photo_url": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face"
            },
            {
                "id": "ADV-" + str(uuid.uuid4())[:8],
                "name": "Advocate Amit Verma",
                "experience_years": 8,
                "practice_areas": ["Cyber Crime Lawyer", "Corporate Lawyer", "Criminal Lawyer"],
                "languages": ["en", "hi"],
                "court_association": "Delhi High Court / Patiala House Court",
                "chamber_address": "Chamber 205, Patiala House Courts, New Delhi",
                "office_address": "Sector 62, Noida, Uttar Pradesh",
                "phone_number": "9958334455",
                "consultation_fees": 1000,
                "availability_status": "available",
                "latitude": 28.5355,
                "longitude": 77.3910,
                "photo_url": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face"
            },
            
            # --- MUMBAI ---
            {
                "id": "ADV-" + str(uuid.uuid4())[:8],
                "name": "Advocate Ramesh Deshmukh",
                "experience_years": 22,
                "practice_areas": ["Property Lawyer", "Corporate Lawyer", "Tax Lawyer"],
                "languages": ["en", "mr", "hi"],
                "court_association": "Bombay High Court",
                "chamber_address": "Chamber 3A, High Court Building, Fort, Mumbai",
                "office_address": "12, Nariman Point, Mumbai",
                "phone_number": "9820011223",
                "consultation_fees": 2500,
                "availability_status": "available",
                "latitude": 19.0760,
                "longitude": 72.8777,
                "photo_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
            },
            {
                "id": "ADV-" + str(uuid.uuid4())[:8],
                "name": "Advocate Shalini Patil",
                "experience_years": 10,
                "practice_areas": ["Criminal Lawyer", "Civil Lawyer", "Labour Lawyer"],
                "languages": ["en", "mr", "hi"],
                "court_association": "Bombay High Court / City Civil Court",
                "chamber_address": "Chamber 109, City Civil Court Complex, Fort, Mumbai",
                "office_address": "Opp. Portuguese Church, Dadar West, Mumbai",
                "phone_number": "9833445566",
                "consultation_fees": 1500,
                "availability_status": "available",
                "latitude": 19.0222,
                "longitude": 72.8436,
                "photo_url": "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face"
            },
            
            # --- BENGALURU ---
            {
                "id": "ADV-" + str(uuid.uuid4())[:8],
                "name": "Advocate K. R. Nagaraj",
                "experience_years": 25,
                "practice_areas": ["Property Lawyer", "Civil Lawyer", "Family Lawyer"],
                "languages": ["en", "kn", "te", "ta"],
                "court_association": "Karnataka High Court / City Civil Court",
                "chamber_address": "Chamber 405, High Court Chambers, Bengaluru",
                "office_address": "33, 5th Main Road, Malleshwaram, Bengaluru",
                "phone_number": "9448012345",
                "consultation_fees": 2000,
                "availability_status": "available",
                "latitude": 12.9716,
                "longitude": 77.5946,
                "photo_url": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face"
            },
            {
                "id": "ADV-" + str(uuid.uuid4())[:8],
                "name": "Advocate Priya Sundaram",
                "experience_years": 12,
                "practice_areas": ["Corporate Lawyer", "Cyber Crime Lawyer", "Labour Lawyer"],
                "languages": ["en", "kn", "hi"],
                "court_association": "Karnataka High Court / Mayo Hall",
                "chamber_address": "Chamber 22, Mayo Hall Court Complex, MG Road, Bengaluru",
                "office_address": "102, 80 Feet Road, Indiranagar, Bengaluru",
                "phone_number": "9845011223",
                "consultation_fees": 1800,
                "availability_status": "available",
                "latitude": 12.9784,
                "longitude": 77.6408,
                "photo_url": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face"
            }
        ]

        for item in advocates_list:
            adv = Advocate(
                id=item["id"],
                name=item["name"],
                rating=5.0,
                reviews_count=12,
                experience_years=item["experience_years"],
                practice_areas=item["practice_areas"],
                languages=item["languages"],
                court_association=item["court_association"],
                chamber_address=item["chamber_address"],
                office_address=item["office_address"],
                phone_number=item["phone_number"],
                consultation_fees=item["consultation_fees"],
                availability_status=item["availability_status"],
                latitude=item["latitude"],
                longitude=item["longitude"],
                photo_url=item["photo_url"]
            )
            db.add(adv)
        
        db.commit()
        print("Successfully seeded advocates!")
    except Exception as e:
        db.rollback()
        print("Failed to seed advocates:", e)
    finally:
        db.close()

if __name__ == '__main__':
    seed()
