import dotenv
dotenv.load_dotenv()
from app.core.database import SessionLocal
from app.models import Course, Lesson

db = SessionLocal()
try:
    courses = db.query(Course).all()
    lessons = db.query(Lesson).all()
    print(f"Courses: {len(courses)}, Lessons: {len(lessons)}")
except Exception as e:
    print("Error:", e)
finally:
    db.close()
