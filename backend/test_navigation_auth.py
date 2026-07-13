import unittest
import sys
import os

# Add parent directories to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import SessionLocal, engine, Base
from app.models.chat import User, Court, SavedCase, CourtBookmark, SearchHistory
from app.core.auth import hash_password, verify_password, create_access_token
from app.api.v1.navigation import haversine_distance

class TestNavigationAndAuth(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # Initialize tables
        Base.metadata.create_all(bind=engine)
        cls.db = SessionLocal()

    @classmethod
    def tearDownClass(cls):
        cls.db.close()

    def test_bcrypt_password_hashing(self):
        """Test that passwords are securely hashed using bcrypt and verified correctly."""
        raw_password = "SecurePassword123!"
        hashed = hash_password(raw_password)
        
        # Verify it is hashed (not plain text)
        self.assertNotEqual(raw_password, hashed)
        self.assertTrue(hashed.startswith("$2b$") or hashed.startswith("$2a$"))

        # Verify correct verification
        self.assertTrue(verify_password(raw_password, hashed))
        # Verify failure on incorrect password
        self.assertFalse(verify_password("wrong_pass", hashed))

    def test_jwt_generation(self):
        """Test JWT token encoding and decoding."""
        user_id = "test_user_uuid_9988"
        token = create_access_token(data={"sub": user_id})
        self.assertIsNotNone(token)
        
        import jwt
        from app.core.auth import JWT_SECRET, JWT_ALGORITHM
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        self.assertEqual(payload["sub"], user_id)

    def test_haversine_distance_computation(self):
        """Test proximity calculation using Haversine formulas."""
        # Distance between Ashok Vihar (28.6915, 77.1724) and India Gate (28.6129, 77.2295)
        # Should be roughly ~10.2 km
        dist = haversine_distance(28.6915, 77.1724, 28.6129, 77.2295)
        self.assertGreater(dist, 9.0)
        self.assertLess(dist, 11.5)

    def test_court_search_proximity(self):
        """Test court discovery using seeded SQL coordinates."""
        # 1. Seed courts first
        from app.api.v1.navigation import seed_indian_courts
        seed_res = seed_indian_courts(db=self.db)
        self.assertIn("status", seed_res)
        
        # 2. Search near Bhabua, Bihar (25.0470, 83.6145)
        from app.api.v1.navigation import search_nearest_courts, LocationPayload
        payload = LocationPayload(latitude=25.0470, longitude=83.6145, state="Bihar")
        search_res = search_nearest_courts(payload=payload, db=self.db)
        
        nearest = search_res["nearest_courts"]
        
        # Lower court should be Bhabua Munsif Court
        self.assertIsNotNone(nearest["lower"])
        self.assertEqual(nearest["lower"]["id"], "bhabua_lower_court")
        self.assertLess(nearest["lower"]["distance_km"], 2.0)  # Very close proximity

        # High court in Bihar should be Patna High Court
        self.assertIsNotNone(nearest["high"])
        self.assertEqual(nearest["high"]["id"], "patna_high_court")

        # Supreme court should be resolved
        self.assertIsNotNone(nearest["supreme"])
        self.assertEqual(nearest["supreme"]["id"], "supreme_court_india")

    def test_litigation_journey_payloads(self):
        """Test visual appeals stepper categories metadata."""
        from app.api.v1.navigation import get_litigation_journey
        journey = get_litigation_journey("consumer")
        self.assertEqual(journey["title"], "Consumer Redressal Pathway")
        self.assertEqual(journey["start_court"], "District Consumer Disputes Redressal Commission")
        self.assertGreater(len(journey["hierarchy"]), 2)
        self.assertIn("written consumer complaint", journey["documents"][0].lower())

    def test_nyaya_path_classification(self):
        """Test classification and stage routing of `/nyaya-path` queries."""
        from app.api.v1.navigation import search_nyaya_path, NyayaPathPayload
        
        # Test tenancy dispute
        payload_tenant = NyayaPathPayload(query="Landlord refused to return my security deposit rent")
        res_tenant = search_nyaya_path(payload_tenant)
        self.assertEqual(res_tenant["problem_classification"], "Tenancy & Rent Control Dispute")
        self.assertEqual(res_tenant["next_link"], "/drafts?template=legal_notice")
        self.assertEqual(len(res_tenant["stages"]), 6)
        
        # Test labor dispute
        payload_labor = NyayaPathPayload(query="employer termination without salary wages")
        res_labor = search_nyaya_path(payload_labor)
        self.assertEqual(res_labor["problem_classification"], "Employment & Labour Law Dispute")
        self.assertEqual(res_labor["next_link"], "/chat?mode=employment")
        
        # Test consumer dispute
        payload_consumer = NyayaPathPayload(query="warranty refund defect product store")
        res_consumer = search_nyaya_path(payload_consumer)
        self.assertEqual(res_consumer["problem_classification"], "Consumer Rights Redressal")
        self.assertEqual(res_consumer["next_link"], "/drafts?template=consumer_complaint")
        
        # Test cyber dispute
        payload_cyber = NyayaPathPayload(query="phish card fraud scam online card compromised")
        res_cyber = search_nyaya_path(payload_cyber)
        self.assertEqual(res_cyber["problem_classification"], "Cyber Crime Prosecution")
        self.assertEqual(res_cyber["next_link"], "/emergency")
        
        # Test family dispute
        payload_family = NyayaPathPayload(query="divorce custody marriage alimony")
        res_family = search_nyaya_path(payload_family)
        self.assertEqual(res_family["problem_classification"], "Family & Matrimonial Dispute")
        self.assertEqual(res_family["next_link"], "/chat?mode=family")
        
        # Test property dispute
        payload_property = NyayaPathPayload(query="encroach land boundary deed trespass")
        res_property = search_nyaya_path(payload_property)
        self.assertEqual(res_property["problem_classification"], "Property Title & Boundary Dispute")
        self.assertEqual(res_property["next_link"], "/journey?category=property")
        
        # Test general dispute
        payload_general = NyayaPathPayload(query="random dispute problem")
        res_general = search_nyaya_path(payload_general)
        self.assertEqual(res_general["problem_classification"], "General Legal Dispute Resolution")
        self.assertEqual(res_general["next_link"], "/chat")

    def test_registration_duplicate_constraints(self):
        """Test duplicate registration constraints (email/mobile) and corresponding error details."""
        from app.api.v1.user import register_user, UserRegister
        from fastapi import HTTPException
        
        # Make a registration request for a new user
        reg_payload = UserRegister(
            name="Test User duplicate",
            email="duplicate_test@nyaya.in",
            mobile="9999888877",
            password="Password123!",
            language_preference="en"
        )
        
        # First attempt: register successfully or if already exists, check status
        self.db.query(User).filter((User.email == "duplicate_test@nyaya.in") | (User.mobile == "9999888877")).delete()
        self.db.commit()
        
        response1 = register_user(reg_payload, db=self.db)
        self.assertIsNotNone(response1["access_token"])
        
        # Second attempt: check duplicate email
        duplicate_email_payload = UserRegister(
            name="Another User",
            email="duplicate_test@nyaya.in",
            mobile="8888777766",
            password="Password123!",
            language_preference="hi"
        )
        with self.assertRaises(HTTPException) as context:
            register_user(duplicate_email_payload, db=self.db)
        self.assertEqual(context.exception.status_code, 400)
        self.assertEqual(context.exception.detail, "Account already exists. Please login.")

        # Third attempt: check duplicate mobile
        duplicate_mobile_payload = UserRegister(
            name="Yet Another User",
            email="unique_email_123@nyaya.in",
            mobile="9999888877",
            password="Password123!",
            language_preference="ta"
        )
        with self.assertRaises(HTTPException) as context:
            register_user(duplicate_mobile_payload, db=self.db)
        self.assertEqual(context.exception.status_code, 400)
        self.assertEqual(context.exception.detail, "Account already exists. Please login.")

    def test_geocoding_endpoints(self):
        """Test Nominatim / Postal Pincode reverse-geocoding and pincode search endpoints directly."""
        from app.api.v1.navigation import reverse_geocode, pincode_search, ReverseGeocodePayload, PincodeSearchPayload
        
        # Test reverse-geocode (New Delhi coordinates)
        reverse_payload = ReverseGeocodePayload(
            latitude=28.6139,
            longitude=77.2090
        )
        data = reverse_geocode(reverse_payload)
        self.assertIn("state", data)
        self.assertIn("pincode", data)
        self.assertEqual(data["latitude"], 28.6139)
        self.assertEqual(data["longitude"], 77.2090)
        
        # Test pincode-search (Mumbai pincode 400001)
        pincode_payload = PincodeSearchPayload(
            pincode="400001"
        )
        pin_data = pincode_search(pincode_payload)
        self.assertIn("state", pin_data)
        self.assertEqual(pin_data["pincode"], "400001")
        self.assertIsNotNone(pin_data["latitude"])
        self.assertIsNotNone(pin_data["longitude"])

    def test_advocate_proximity_and_prioritization(self):
        """Test advocate match classification, prioritization (smart matches first), and distance sorting."""
        from app.api.v1.navigation import seed_indian_courts
        seed_res = seed_indian_courts(db=self.db)
        self.assertIsNotNone(seed_res)

        from app.api.v1.advocates import search_advocates, AdvocateSearchPayload
        payload = AdvocateSearchPayload(
            query="landlord refuses to return deposit or mutate property deed",
            latitude=28.6915,
            longitude=77.1724
        )
        res = search_advocates(payload=payload, db=self.db)
        
        self.assertGreater(len(res), 0)
        first = res[0]
        self.assertTrue(first["is_smart_match"])
        self.assertIn("Property Lawyer", first["practice_areas"])
        
        # Verify subsequent sorting matches prioritization rules
        for i in range(1, len(res)):
            prev = res[i - 1]
            curr = res[i]
            if prev["is_smart_match"] != curr["is_smart_match"]:
                self.assertTrue(prev["is_smart_match"] > curr["is_smart_match"])
                continue
            if prev["rating"] != curr["rating"]:
                self.assertTrue(prev["rating"] > curr["rating"])
                continue

    def test_appointment_booking_consent_given(self):
        """Test that advocate bookings require explicit user consent and reject false flags."""
        from app.api.v1.advocates import book_advocate, AppointmentBookPayload
        from app.models.chat import User, Advocate
        from fastapi import HTTPException
        
        test_user = self.db.query(User).first()
        if not test_user:
            test_user = User(id="test_user_book_id", name="Booking User", password_hash="hash")
            self.db.add(test_user)
            self.db.commit()
            
        test_adv = self.db.query(Advocate).first()
        if not test_adv:
            from app.api.v1.navigation import seed_indian_courts
            seed_indian_courts(db=self.db)
            test_adv = self.db.query(Advocate).first()

        self.assertIsNotNone(test_user)
        self.assertIsNotNone(test_adv)

        payload_no_consent = AppointmentBookPayload(
            advocate_id=test_adv.id,
            date="2026-06-30",
            time="10:00 AM",
            fees=test_adv.consultation_fees,
            consent_given=False
        )
        
        with self.assertRaises(HTTPException) as context:
            book_advocate(payload=payload_no_consent, user=test_user, db=self.db)
        self.assertEqual(context.exception.status_code, 400)
        self.assertIn("explicit user approval", context.exception.detail.lower())

        payload_consent = AppointmentBookPayload(
            advocate_id=test_adv.id,
            date="2026-06-30",
            time="10:00 AM",
            fees=test_adv.consultation_fees,
            consent_given=True
        )
        
        res = book_advocate(payload=payload_consent, user=test_user, db=self.db)
        self.assertEqual(res["status"], "success")
        self.assertIsNotNone(res["appointment"]["id"])

if __name__ == "__main__":
    unittest.main()
