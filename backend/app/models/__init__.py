from app.models.base import Base

from app.models.user import User, UserProfile
from app.models.chat import ChatSession, ChatMessage
from app.models.consultation import ConsultationRequest, Transaction
from app.models.notification import Notification
from app.models.knowledge import KnowledgeArticle
from app.models.judgment import LandmarkJudgment
from app.models.document import Document, DocumentAnalysis
from app.models.draft import DraftDocument
from app.models.case import SavedCase, CaseFolder, CaseTask, SearchHistory
from app.models.calendar import LegalCalendarEvent
from app.models.academy import Course, Lesson, UserProgress
from app.models.marketplace import Advocate, Appointment, PaymentSettings
from app.models.location import Court, CourtBookmark, Judge, PoliceStation, LegalAidCentre, ConsumerForum, LocationPincode
from app.models.system import SkillInvocationLog, AuditLog, EvaluationLog, Feedback

# This ensures all models are registered with SQLAlchemy Base.metadata
__all__ = [
    "Base",
    "User", "UserProfile",
    "ChatSession", "ChatMessage",
    "ConsultationRequest", "Transaction",
    "Notification",
    "KnowledgeArticle",
    "LandmarkJudgment",
    "Document", "DocumentAnalysis",
    "DraftDocument",
    "SavedCase", "CaseFolder", "CaseTask", "SearchHistory",
    "LegalCalendarEvent",
    "Course", "Lesson", "UserProgress",
    "Advocate", "Appointment", "PaymentSettings",
    "Court", "CourtBookmark", "Judge", "PoliceStation", "LegalAidCentre", "ConsumerForum", "LocationPincode",
    "SkillInvocationLog", "AuditLog", "EvaluationLog", "Feedback"
]
