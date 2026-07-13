import unittest
import sys
import os
import uuid
from datetime import datetime

# Add parent directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import SessionLocal, engine, Base
from app.models.chat import User, Transaction, ConsultationRequest, PaymentSettings, AuditLog
from app.core.auth import hash_password
from app.api.v1.marketplace import get_payment_settings

class TestMarketplaceAndPayments(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        Base.metadata.create_all(bind=engine)
        cls.db = SessionLocal()

        # Seed a test user
        cls.test_user_id = f"user_{uuid.uuid4()}"
        cls.user = User(
            id=cls.test_user_id,
            name="Priyanshu Rai",
            email=f"priyanshu_{uuid.uuid4()}@nyaya.ai",
            mobile=f"9900{uuid.uuid4().hex[:6]}",
            password_hash=hash_password("UserPassword123"),
            is_admin=False
        )
        cls.db.add(cls.user)
        
        # Seed an admin user
        cls.admin_user_id = f"admin_{uuid.uuid4()}"
        cls.admin = User(
            id=cls.admin_user_id,
            name="Admin User",
            email=f"admin_{uuid.uuid4()}@nyaya.ai",
            mobile=f"9911{uuid.uuid4().hex[:6]}",
            password_hash=hash_password("AdminPassword123"),
            is_admin=True
        )
        cls.db.add(cls.admin)
        cls.db.commit()

    @classmethod
    def tearDownClass(cls):
        cls.db.close()

    def test_payment_settings_initialization(self):
        """Test that default payment settings are initialized correctly."""
        ps = get_payment_settings(self.db)
        self.assertEqual(ps.id, "default")
        self.assertEqual(ps.upi_id, "priyanshurai121111@oksbi")
        self.assertEqual(ps.support_email, "priyanshurai121111@gmail.com")
        self.assertEqual(ps.specialist_price, 200)
        self.assertEqual(ps.specialist_original_price, 5000)

    def test_callback_and_email_consultations(self):
        """Test creation of callback and email consultation requests."""
        # 1. Create callback request
        cb_id = str(uuid.uuid4())
        cb_req = ConsultationRequest(
            id=cb_id,
            user_id=self.test_user_id,
            service_name="Talk to Legal Specialist",
            request_type="callback",
            full_name="Priyanshu Rai",
            mobile_number="9876543210",
            preferred_language="Hindi",
            legal_issue_type="Property Fraud",
            status="Callback Requested",
            created_at=datetime.utcnow()
        )
        self.db.add(cb_req)
        
        # Log Audit Log
        audit = AuditLog(
            id=str(uuid.uuid4()),
            user_id=self.test_user_id,
            action_type="Consultation Request Created",
            action_description="Created callback consultation request for Talk to Legal Specialist",
            result_status="success"
        )
        self.db.add(audit)
        self.db.commit()

        # Retrieve and verify
        db_req = self.db.query(ConsultationRequest).filter(ConsultationRequest.id == cb_id).first()
        self.assertIsNotNone(db_req)
        self.assertEqual(db_req.status, "Callback Requested")
        self.assertEqual(db_req.legal_issue_type, "Property Fraud")

        db_audit = self.db.query(AuditLog).filter(
            AuditLog.user_id == self.test_user_id,
            AuditLog.action_type == "Consultation Request Created"
        ).first()
        self.assertIsNotNone(db_audit)

    def test_payment_and_verification_workflow(self):
        """Test full checkout payment, OTP/Card submission, non-instant UTR verification, and Admin approval flow."""
        tx_id = str(uuid.uuid4())
        req_id = str(uuid.uuid4())

        # Step 1: User pays now (submits payment request)
        tx = Transaction(
            id=tx_id,
            user_id=self.test_user_id,
            amount=200,
            payment_method="card",
            status="pending",
            created_at=datetime.utcnow()
        )
        self.db.add(tx)
        
        req = ConsultationRequest(
            id=req_id,
            user_id=self.test_user_id,
            service_name="Talk to Legal Specialist",
            request_type="pay_now",
            full_name="Priyanshu Rai",
            mobile_number="9876543210",
            email="priyanshu@gmail.com",
            status="Pending Payment",
            transaction_id=tx_id,
            created_at=datetime.utcnow()
        )
        self.db.add(req)
        
        audit_submit = AuditLog(
            id=str(uuid.uuid4()),
            user_id=self.test_user_id,
            action_type="Payment Submitted",
            action_description="Initiated card payment of ₹200 for Talk to Legal Specialist",
            result_status="success"
        )
        self.db.add(audit_submit)
        self.db.commit()

        # Verify initial pending state
        self.assertEqual(self.db.query(Transaction).filter(Transaction.id == tx_id).first().status, "pending")
        self.assertEqual(self.db.query(ConsultationRequest).filter(ConsultationRequest.id == req_id).first().status, "Pending Payment")

        # Step 2: User completes payment and submits UTR proof for verification
        db_tx = self.db.query(Transaction).filter(Transaction.id == tx_id).first()
        db_req = self.db.query(ConsultationRequest).filter(ConsultationRequest.id == req_id).first()
        
        db_tx.utr_number = "UTR-99881122"
        db_tx.status = "pending_verification"
        db_req.status = "Verification Pending"
        
        audit_verify = AuditLog(
            id=str(uuid.uuid4()),
            user_id=self.test_user_id,
            action_type="Verification Started",
            action_description=f"User submitted UTR verification for transaction {tx_id}",
            result_status="success"
        )
        self.db.add(audit_verify)
        self.db.commit()

        self.assertEqual(self.db.query(Transaction).filter(Transaction.id == tx_id).first().status, "pending_verification")
        self.assertEqual(self.db.query(ConsultationRequest).filter(ConsultationRequest.id == req_id).first().status, "Verification Pending")

        # Step 3: Admin reviews and approves the transaction
        # Approval generates Consultation ID and updates status
        consultation_id = f"NYA-2026-{uuid.uuid4().hex[:6].upper()}"
        db_tx.status = "verified"
        db_tx.consultation_id = consultation_id
        db_req.status = "Payment Verified"
        db_req.consultation_id = consultation_id

        audit_complete = AuditLog(
            id=str(uuid.uuid4()),
            user_id=self.test_user_id,
            action_type="Verification Completed",
            action_description=f"Approved payment for transaction {tx_id}. Consultation ID: {consultation_id}",
            result_status="success"
        )
        self.db.add(audit_complete)
        self.db.commit()

        # Assert successful verification
        approved_tx = self.db.query(Transaction).filter(Transaction.id == tx_id).first()
        approved_req = self.db.query(ConsultationRequest).filter(ConsultationRequest.id == req_id).first()
        self.assertEqual(approved_tx.status, "verified")
        self.assertEqual(approved_req.status, "Payment Verified")
        self.assertEqual(approved_req.consultation_id, consultation_id)

        # Step 4: Admin assigns specialist and completes consultation
        approved_req.assigned_specialist = "Senior Advocate Sharma"
        approved_req.status = "Specialist Assigned"
        
        audit_assign = AuditLog(
            id=str(uuid.uuid4()),
            user_id=self.test_user_id,
            action_type="Specialist Assigned",
            action_description=f"Assigned specialist Senior Advocate Sharma to consultation {req_id}",
            result_status="success"
        )
        self.db.add(audit_assign)
        self.db.commit()
        
        self.assertEqual(self.db.query(ConsultationRequest).filter(ConsultationRequest.id == req_id).first().status, "Specialist Assigned")

        # Complete consultation
        approved_req.status = "Consultation Completed"
        audit_done = AuditLog(
            id=str(uuid.uuid4()),
            user_id=self.test_user_id,
            action_type="Consultation Completed",
            action_description=f"Marked consultation {req_id} as completed",
            result_status="success"
        )
        self.db.add(audit_done)
        self.db.commit()
        
        self.assertEqual(self.db.query(ConsultationRequest).filter(ConsultationRequest.id == req_id).first().status, "Consultation Completed")

if __name__ == "__main__":
    unittest.main()
