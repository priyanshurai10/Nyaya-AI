"""
Data Retention Cron Job for Nyaya AI
Automatically cleans up sensitive files and logs older than 60 days.
Retains: User Account, Payment ID, Amount, Status, Dates.
Removes: Screenshot files, UTR values, scheduled call details, old notifications.
"""
from datetime import datetime, timedelta
import os
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models import Transaction, ConsultationRequest, Notification, AuditLog

RETENTION_DAYS = 60

def run_data_retention_cleanup():
    """Execute retention policy: clean sensitive transaction & consultation assets >60 days old."""
    db: Session = SessionLocal()
    try:
        cutoff_date = datetime.utcnow() - timedelta(days=RETENTION_DAYS)
        print(f"[DATA_RETENTION] Running 60-day cleanup for records older than {cutoff_date.isoformat()}")

        # 1. Clean up transaction screenshots & UTRs > 60 days
        old_transactions = db.query(Transaction).filter(Transaction.created_at < cutoff_date).all()
        cleaned_files = 0
        cleaned_utrs = 0

        for tx in old_transactions:
            if tx.screenshot_path:
                rel_path = tx.screenshot_path.lstrip("/")
                abs_path = os.path.join(os.getcwd(), rel_path)
                if os.path.exists(abs_path):
                    try:
                        os.remove(abs_path)
                        cleaned_files += 1
                    except Exception as e:
                        print(f"[RETENTION_ERROR] Could not delete {abs_path}: {e}")
                tx.screenshot_path = None  # Anonymize file link
            
            if tx.utr_number:
                tx.utr_number = "[ANONYMIZED_60D]"  # Purge raw UTR
                cleaned_utrs += 1

        # 2. Clean up consultation schedules > 60 days (keep base record + status + date)
        old_consultations = db.query(ConsultationRequest).filter(ConsultationRequest.created_at < cutoff_date).all()
        cleaned_schedules = 0
        for c in old_consultations:
            if getattr(c, "scheduled_time", None) or getattr(c, "admin_notes", None):
                c.scheduled_time = None
                c.admin_notes = "[PURGED_60D]"
                cleaned_schedules += 1

        # 3. Delete notifications older than 60 days
        deleted_notifications = db.query(Notification).filter(Notification.created_at < cutoff_date).delete(synchronize_session=false)

        db.commit()

        # Log audit entry
        log = AuditLog(
            id=f"retention-{int(datetime.utcnow().timestamp())}",
            timestamp=datetime.utcnow(),
            user_id="SYSTEM_CRON",
            action_type="DATA_RETENTION_CLEANUP",
            action_description=f"Purged: {cleaned_files} screenshots, {cleaned_utrs} UTRs, {cleaned_schedules} schedules, {deleted_notifications} notifications older than {RETENTION_DAYS} days.",
            result_status="success"
        )
        db.add(log)
        db.commit()

        print(f"[DATA_RETENTION_SUCCESS] Purged {cleaned_files} files, {cleaned_utrs} UTRs, {deleted_notifications} notifications.")
    except Exception as e:
        db.rollback()
        print(f"[DATA_RETENTION_FAILED] Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    run_data_retention_cleanup()
