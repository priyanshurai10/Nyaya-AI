import os
import json
import sqlite3
from datetime import datetime

def import_courses():
    db_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'nyaya_ai.db')
    lessons_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data', 'lessons')
    
    conn = sqlite3.connect(db_path)
    c = conn.cursor()
    
    print("Clearing existing course and lesson records to avoid duplicates...")
    c.execute("DELETE FROM user_progress")
    c.execute("DELETE FROM lessons")
    c.execute("DELETE FROM courses")
    
    now = datetime.utcnow().isoformat()
    
    for filename in os.listdir(lessons_dir):
        if not filename.endswith('.json'):
            continue
            
        filepath = os.path.join(lessons_dir, filename)
        print(f"Importing {filename}...")
        
        with open(filepath, 'r', encoding='utf-8') as f:
            course_data = json.load(f)
            
        course_id = course_data['id']
        title = course_data['title']
        description = course_data['description']
        
        # Build metadata_json
        metadata = {
            "category": course_data.get('category', 'Core Law'),
            "difficulty": course_data.get('difficulty', 'Beginner'),
            "duration": f"{course_data.get('estimatedHours', 2)} hours",
            "totalLessons": course_data.get('totalLessons', 0),
            "estimatedHours": course_data.get('estimatedHours', 2),
            "rating": "4.8",
            "readingTime": "10 mins/lesson",
            "examplesCount": 5,
            "quizzesCount": course_data.get('totalLessons', 0),
            "keyPoints": [m['title'] for m in course_data.get('modules', [])],
            "modules": [{"id": m['id'], "title": m['title']} for m in course_data.get('modules', [])]
        }
        
        # Set gradients based on course ID last digit for visual flair
        gradient_idx = int(course_id.split('-')[-1]) % 12
        gradients = [
            "bg-gradient-to-br from-indigo-500 to-blue-600",
            "bg-gradient-to-br from-red-500 to-rose-600",
            "bg-gradient-to-br from-orange-500 to-red-500",
            "bg-gradient-to-br from-amber-500 to-orange-600",
            "bg-gradient-to-br from-emerald-500 to-green-600",
            "bg-gradient-to-br from-teal-500 to-emerald-600",
            "bg-gradient-to-br from-pink-500 to-rose-500",
            "bg-gradient-to-br from-blue-500 to-cyan-600",
            "bg-gradient-to-br from-violet-500 to-purple-600",
            "bg-gradient-to-br from-sky-500 to-blue-500",
            "bg-gradient-to-br from-yellow-500 to-orange-500",
            "bg-gradient-to-br from-fuchsia-500 to-pink-600",
        ]
        thumbnail_url = gradients[gradient_idx]
        
        c.execute(
            "INSERT INTO courses (id, title, description, thumbnail_url, metadata_json, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
            (course_id, title, description, thumbnail_url, json.dumps(metadata), now, now)
        )
        
        order_index = 1
        for module in course_data.get('modules', []):
            module_id = module['id']
            for lesson in module.get('lessons', []):
                lesson_id = lesson['id']
                lesson_title = lesson['title']
                
                # Standardize quiz format
                quiz_raw = lesson.get('quiz')
                formatted_quiz = {"questions": []}
                if isinstance(quiz_raw, list):
                    formatted_quiz["questions"] = [
                        {
                            "id": idx + 1,
                            "question": q.get("question", ""),
                            "options": q.get("options", []),
                            "correctAnswer": q.get("correctAnswer", q.get("correct", 0)),
                            "explanation": q.get("explanation", "")
                        }
                        for idx, q in enumerate(quiz_raw)
                    ]
                elif isinstance(quiz_raw, dict):
                    raw_questions = quiz_raw.get("questions", [])
                    formatted_quiz["questions"] = [
                        {
                            "id": q.get("id", idx + 1),
                            "question": q.get("question", ""),
                            "options": q.get("options", []),
                            "correctAnswer": q.get("correctAnswer", q.get("correct", 0)),
                            "explanation": q.get("explanation", "")
                        }
                        for idx, q in enumerate(raw_questions)
                    ]

                # Build content_json
                content = {
                    "readingTime": lesson.get('readingTime', '8 mins'),
                    "introduction": lesson['content'].get('introduction', ''),
                    "keyPoints": lesson['content'].get('keyPoints', []),
                    "practicalExample": lesson['content'].get('practicalExample', {"scenario": "", "explanation": ""}),
                    "importantSections": lesson['content'].get('importantSections', []),
                    "faqs": lesson['content'].get('faqs', []),
                    "relatedLaws": lesson['content'].get('relatedLaws', []),
                    "summary": lesson['content'].get('summary', ''),
                    "quiz": formatted_quiz
                }
                
                c.execute(
                    "INSERT INTO lessons (id, course_id, module_id, title, content_json, order_index, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                    (lesson_id, course_id, module_id, lesson_title, json.dumps(content), order_index, now, now)
                )
                order_index += 1
                
    conn.commit()
    conn.close()
    print("Successfully imported all 14 courses and lessons into sqlite db!")

if __name__ == '__main__':
    import_courses()
