import os
import json
import dotenv
dotenv.load_dotenv()

from app.core.database import SessionLocal
from app.models import Course, Lesson

def seed():
    print("Starting Academy Database Seeding with super-optimized memory caching and single-transaction bulk operations...")
    courses_file = os.path.join("data", "academy_courses.json")
    if not os.path.exists(courses_file):
        print("ERROR: data/academy_courses.json not found")
        return
        
    with open(courses_file, 'r', encoding='utf-8') as f:
        courses_data = json.load(f)
        
    db = SessionLocal()
    try:
        # Cache existing Course and Lesson IDs locally to prevent N+1 query latency
        print("Caching existing database IDs...")
        existing_courses = {c[0] for c in db.query(Course.id).all()}
        existing_lessons = {l[0] for l in db.query(Lesson.id).all()}
        print(f"Cached {len(existing_courses)} courses and {len(existing_lessons)} lessons.")

        lessons_to_insert = []
        
        for course_info in courses_data["courses"]:
            course_id = course_info["id"]
            
            # Read detailed course file
            details_file = os.path.join("data", "lessons", f"{course_id}.json")
            if not os.path.exists(details_file):
                print(f"WARNING: details file not found for {course_id}")
                continue
                
            with open(details_file, 'r', encoding='utf-8') as f_det:
                details = json.load(f_det)
                
            # Create or update course
            metadata = {
                "category": details.get("category", "General"),
                "difficulty": details.get("difficulty", "Beginner"),
                "duration": details.get("duration", "1 hour"),
                "totalLessons": details.get("totalLessons", 0),
                "estimatedHours": details.get("estimatedHours", 1),
                "keyPoints": details.get("keyPoints", []),
                "readingTime": details.get("readingTime", "15 mins"),
                "examplesCount": details.get("examplesCount", 0),
                "quizzesCount": details.get("quizzesCount", 0),
                "modules": [{"id": m["id"], "title": m["title"]} for m in details.get("modules", [])]
            }
            
            if course_id not in existing_courses:
                course = Course(
                    id=course_id,
                    title=details["title"],
                    description=details.get("description", ""),
                    thumbnail_url=details.get("thumbnail_url", ""),
                    metadata_json=metadata
                )
                db.add(course)
                print(f"Prepared Course for creation: {course_id}")
            else:
                # Update existing
                db.query(Course).filter(Course.id == course_id).update({
                    "title": details["title"],
                    "description": details.get("description", ""),
                    "metadata_json": metadata
                })
                print(f"Prepared Course for update: {course_id}")
                
            # Prepare lessons lists
            for mod in details.get("modules", []):
                module_id = mod["id"]
                for index, les in enumerate(mod.get("lessons", [])):
                    lesson_id = les["id"]
                    
                    content_json = {
                        "introduction": les.get("content", {}).get("introduction", ""),
                        "keyPoints": les.get("content", {}).get("keyPoints", []),
                        "practicalExample": les.get("content", {}).get("practicalExample", {}),
                        "importantSections": les.get("content", {}).get("importantSections", []),
                        "faqs": les.get("content", {}).get("faqs", []),
                        "relatedLaws": les.get("content", {}).get("relatedLaws", []),
                        "summary": les.get("content", {}).get("summary", ""),
                        "readingTime": les.get("readingTime", "10 mins"),
                        "quiz": les.get("quiz", {"questions": []})
                    }
                    
                    if lesson_id not in existing_lessons:
                        lessons_to_insert.append(
                            Lesson(
                                id=lesson_id,
                                course_id=course_id,
                                module_id=module_id,
                                title=les["title"],
                                content_json=content_json,
                                order_index=index
                            )
                        )
                    else:
                        # Update existing lesson
                        db.query(Lesson).filter(Lesson.id == lesson_id).update({
                            "title": les["title"],
                            "content_json": content_json,
                            "order_index": index
                        })
            
        # Flush the newly added courses to the database FIRST so they are present for foreign keys
        print("Flushing courses to database...")
        db.flush()

        # Bulk save all new lessons in a single request
        if lessons_to_insert:
            print(f"Bulk saving {len(lessons_to_insert)} new lessons...")
            db.bulk_save_objects(lessons_to_insert)
            
        print("Committing transaction...")
        db.commit()
        print("SUCCESS: Academy database seeding complete!")
    except Exception as e:
        db.rollback()
        print("ERROR during seeding:")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == '__main__':
    seed()
