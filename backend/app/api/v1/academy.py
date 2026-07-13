from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
import uuid
from pydantic import BaseModel
from datetime import datetime

from app.core.database import get_db
from app.models import User, Course, Lesson, UserProgress
from app.core.auth import get_current_user

router = APIRouter()

class ProgressPayload(BaseModel):
    lessonId: str
    courseId: str
    moduleId: str
    progressPct: int
    status: str
    quizScore: Optional[int] = None

@router.get("/courses")
def get_courses(db: Session = Depends(get_db)):
    courses = db.query(Course).all()
    res = []
    for c in courses:
        meta = c.metadata_json or {}
        res.append({
            "id": c.id,
            "title": c.title,
            "description": c.description,
            "thumbnail_url": c.thumbnail_url,
            "category": meta.get("category", "General"),
            "difficulty": meta.get("difficulty", "Beginner"),
            "duration": meta.get("duration", "1 hour"),
            "lessons": meta.get("totalLessons", db.query(Lesson).filter(Lesson.course_id == c.id).count()),
            "rating": meta.get("rating", "5.0"),
            "keyPoints": meta.get("keyPoints", []),
            "readingTime": meta.get("readingTime", "15 mins/lesson"),
            "examplesCount": meta.get("examplesCount", 0),
            "quizzesCount": meta.get("quizzesCount", 0),
            "created_at": c.created_at.isoformat() if c.created_at else None
        })
    return {"success": True, "data": res}

@router.get("/courses/{id}")
def get_course(id: str, db: Session = Depends(get_db)):
    c = db.query(Course).filter(Course.id == id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Course not found")
        
    lessons = db.query(Lesson).filter(Lesson.course_id == c.id).order_by(Lesson.order_index).all()
    
    meta = c.metadata_json or {}
    modules_meta = meta.get("modules", [{"id": "MOD-1", "title": "Course Materials"}])
    
    # Group lessons by module
    modules = []
    for mod in modules_meta:
        mod_lessons = [l for l in lessons if l.module_id == mod["id"]]
        
        formatted_lessons = []
        for l in mod_lessons:
            l_content = l.content_json or {}
            formatted_lessons.append({
                "id": l.id,
                "title": l.title,
                "readingTime": l_content.get("readingTime", "10 mins"),
                "content": {
                    "introduction": l_content.get("introduction", ""),
                    "keyPoints": l_content.get("keyPoints", []),
                    "practicalExample": l_content.get("practicalExample", {"scenario": "", "explanation": ""}),
                    "importantSections": l_content.get("importantSections", []),
                    "faqs": l_content.get("faqs", []),
                    "relatedLaws": l_content.get("relatedLaws", []),
                    "summary": l_content.get("summary", "")
                },
                "quiz": l_content.get("quiz", {"questions": []}),
                "order_index": l.order_index
            })
            
        modules.append({
            "id": mod["id"],
            "title": mod["title"],
            "lessons": formatted_lessons
        })
    
    return {
        "success": True,
        "data": {
            "id": c.id,
            "title": c.title,
            "description": c.description,
            "category": meta.get("category", "General"),
            "difficulty": meta.get("difficulty", "Beginner"),
            "totalLessons": meta.get("totalLessons", len(lessons)),
            "estimatedHours": meta.get("estimatedHours", 1),
            "thumbnail_url": c.thumbnail_url,
            "modules": modules
        }
    }

@router.get("/progress")
def get_progress(
    courseId: Optional[str] = None,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")
        
    q = db.query(UserProgress).filter(UserProgress.user_id == user.id)
    if courseId:
        q = q.filter(UserProgress.course_id == courseId)
        
    progress = q.all()
    
    return {
        "success": True,
        "data": [
            {
                "lessonId": p.lesson_id,
                "courseId": p.course_id,
                "moduleId": p.module_id,
                "progressPct": p.progress_pct,
                "status": p.status,
                "quizScore": p.quiz_score,
                "completed": p.completed,
                "last_accessed": p.last_accessed.isoformat() if p.last_accessed else None
            } for p in progress
        ]
    }

@router.post("/progress")
def mark_progress(
    payload: ProgressPayload,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")
        
    prog = db.query(UserProgress).filter(
        UserProgress.user_id == user.id, 
        UserProgress.lesson_id == payload.lessonId
    ).first()
    
    if prog:
        prog.progress_pct = payload.progressPct
        prog.status = payload.status
        prog.completed = payload.status == "COMPLETED"
        prog.last_accessed = datetime.utcnow()
        if payload.quizScore is not None:
            prog.quiz_score = payload.quizScore
    else:
        prog = UserProgress(
            id=str(uuid.uuid4()),
            user_id=user.id,
            course_id=payload.courseId,
            lesson_id=payload.lessonId,
            module_id=payload.moduleId,
            progress_pct=payload.progressPct,
            status=payload.status,
            completed=payload.status == "COMPLETED",
            quiz_score=payload.quizScore,
            last_accessed=datetime.utcnow()
        )
        db.add(prog)
        
    db.commit()
    
    return {"success": True, "message": "Progress updated"}

