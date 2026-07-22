import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.core.config import settings
from app.core.database import engine, Base

# Import all SQLAlchemy models to register them on Base before metadata creation
from app.models import (
    User, ChatSession, ChatMessage, Document, DocumentAnalysis,
    SkillInvocationLog, UserProfile, AuditLog, EvaluationLog,
    Court, SavedCase, CourtBookmark, SearchHistory, Judge, Feedback,
    Advocate, Appointment, CaseFolder, CaseTask, LegalCalendarEvent,
    Transaction, ConsultationRequest, PaymentSettings, LocationPincode
)

from app.api.v1.chat import router as chat_router
from app.api.v1.documents import router as documents_router
from app.api.v1.observability import router as observability_router
from app.api.v1.user import router as user_router
from app.api.v1.navigation import router as navigation_router
from app.api.v1.admin import router as admin_router
from app.api.v1.advocates import router as advocates_router
from app.api.v1.cases import router as cases_router
from app.api.v1.calendar import router as calendar_router
from app.api.v1.marketplace import router as marketplace_router
from app.api.v1.discovery import router as discovery_router
from app.api.v1.location import router as location_router
from app.api.v1.consultation import router as consultation_router
from app.api.v1.notifications import router as notifications_router
from app.api.v1.vault import router as vault_router
from app.api.v1.drafts import router as drafts_router
from app.api.v1.knowledge import router as knowledge_router
from app.api.v1.judgments import router as judgments_router
from app.api.v1.academy import router as academy_router
from app.api.v1.ai_insights import router as ai_insights_router
from app.api.v1.vault_analyze import router as vault_analyze_router
from app.api.v1.admin_consultation import router as admin_consultation_router

# Ensure upload directory exists
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

# Initialize database tables (automatically creates tables in SQLite on first boot)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

@app.on_event("startup")
def startup_event():
    import threading
    from app.core.retention_cron import run_data_retention_cleanup
    # Run data retention cleanup in a background thread on startup
    threading.Thread(target=run_data_retention_cleanup, daemon=True).start()

# Setup CORS - For MVP, allow all origins to ease local testing
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static uploads folder
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Register routers
app.include_router(chat_router, prefix=f"{settings.API_V1_STR}/chat", tags=["chat"])
app.include_router(documents_router, prefix=f"{settings.API_V1_STR}/documents", tags=["documents"])
app.include_router(observability_router, prefix=f"{settings.API_V1_STR}/observability", tags=["observability"])
app.include_router(user_router, prefix=f"{settings.API_V1_STR}/user", tags=["user"])
app.include_router(navigation_router, prefix=f"{settings.API_V1_STR}/navigation", tags=["navigation"])
app.include_router(admin_router, prefix=f"{settings.API_V1_STR}/admin", tags=["admin"])
app.include_router(advocates_router, prefix=f"{settings.API_V1_STR}/advocates", tags=["advocates"])
app.include_router(cases_router, prefix=f"{settings.API_V1_STR}/cases", tags=["cases"])
app.include_router(calendar_router, prefix=f"{settings.API_V1_STR}/calendar", tags=["calendar"])
app.include_router(marketplace_router, prefix=f"{settings.API_V1_STR}/marketplace", tags=["marketplace"])
app.include_router(discovery_router, prefix=f"{settings.API_V1_STR}/discovery", tags=["discovery"])
app.include_router(location_router, prefix=f"{settings.API_V1_STR}/location", tags=["location"])
app.include_router(consultation_router, prefix=f"{settings.API_V1_STR}/consultation", tags=["consultation"])
app.include_router(notifications_router, prefix=f"{settings.API_V1_STR}/notifications", tags=["notifications"])
app.include_router(vault_router, prefix=f"{settings.API_V1_STR}/vault", tags=["vault"])
app.include_router(drafts_router, prefix=f"{settings.API_V1_STR}/drafts", tags=["drafts"])
app.include_router(knowledge_router, prefix=f"{settings.API_V1_STR}/knowledge", tags=["knowledge"])
app.include_router(judgments_router, prefix=f"{settings.API_V1_STR}/judgments", tags=["judgments"])
app.include_router(academy_router, prefix=f"{settings.API_V1_STR}/academy", tags=["academy"])
app.include_router(ai_insights_router, prefix=f"{settings.API_V1_STR}/ai-insights", tags=["ai-insights"])
app.include_router(vault_analyze_router, prefix=f"{settings.API_V1_STR}/vault", tags=["vault-analyze"])
app.include_router(admin_consultation_router, prefix=f"{settings.API_V1_STR}/admin/consultations", tags=["admin-consultations"])

@app.get("/")
def health_check():
    return {"status": "healthy", "project": settings.PROJECT_NAME}

@app.post("/api/v1/auth/logout")
def logout_endpoint():
    from fastapi import Response
    import json
    response = Response(
        content=json.dumps({"success": True, "message": "Logged out successfully"}), 
        media_type="application/json"
    )
    response.delete_cookie("nyaya_token", path="/")
    return response

# Global Exception Handlers to guarantee all responses are JSON (Never HTML)
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from fastapi import Request

@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "message": exc.detail,
            "error": {"code": "HTTP_ERROR", "detail": exc.detail}
        }
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content={
            "success": False,
            "message": "Validation error.",
            "error": {"code": "VALIDATION_ERROR", "detail": exc.errors()}
        }
    )

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    import traceback
    print("[GLOBAL_EXCEPTION_ERROR]:")
    traceback.print_exc()
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "message": "Internal server error.",
            "error": {"code": "INTERNAL_SERVER_ERROR", "detail": str(exc)}
        }
    )


