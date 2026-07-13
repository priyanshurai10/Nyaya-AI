import json
import os
import random

courses_meta = [
    {"id": "COURSE-1000", "title": "Constitution of India", "description": "Master the supreme law of India, fundamental rights, and state policies.", "level": "Beginner"},
    {"id": "COURSE-1001", "title": "Bharatiya Nyaya Sanhita (BNS)", "description": "The new criminal code replacing IPC. Understand offenses and penalties.", "level": "Intermediate"},
    {"id": "COURSE-1002", "title": "Bharatiya Nagarik Suraksha Sanhita (BNSS)", "description": "Replaces CrPC. Learn criminal procedures and police powers.", "level": "Intermediate"},
    {"id": "COURSE-1003", "title": "Bharatiya Sakshya Adhiniyam (BSA)", "description": "The new Indian Evidence Act. Rules of evidence and admissibility.", "level": "Advanced"},
    {"id": "COURSE-1004", "title": "Right to Information (RTI)", "description": "Empowering citizens to seek information from public authorities.", "level": "Beginner"},
    {"id": "COURSE-1005", "title": "Consumer Protection Act", "description": "Protecting consumer rights against unfair trade practices.", "level": "Beginner"},
    {"id": "COURSE-1006", "title": "Property Law (TPA)", "description": "Transfer of property, real estate rules, and RERA.", "level": "Advanced"},
    {"id": "COURSE-1007", "title": "Employment & Labour Law", "description": "Rights of workers, labor codes, and employer compliance.", "level": "Intermediate"},
    {"id": "COURSE-1008", "title": "Family Law", "description": "Marriage, divorce, succession, and adoption under various personal laws.", "level": "Intermediate"},
    {"id": "COURSE-1009", "title": "Cyber Law & IT Act", "description": "Digital crimes, data protection, and intermediary liability.", "level": "Intermediate"},
    {"id": "COURSE-1010", "title": "Motor Vehicles Act", "description": "Traffic rules, challans, and accident claims tribunals.", "level": "Beginner"},
    {"id": "COURSE-1011", "title": "POSH Act", "description": "Prevention of Sexual Harassment at Workplace.", "level": "Beginner"},
    {"id": "COURSE-1012", "title": "Digital Evidence & Forensics", "description": "Admissibility of electronic records and cyber forensics.", "level": "Advanced"},
    {"id": "COURSE-1013", "title": "Legal Drafting & Procedures", "description": "How to draft notices, plaints, and petitions in India.", "level": "Advanced"}
]

os.makedirs('backend/data/lessons', exist_ok=True)
os.makedirs('backend/data', exist_ok=True)

# Generate academy_courses.json
with open('backend/data/academy_courses.json', 'w') as f:
    json.dump({"courses": courses_meta}, f, indent=2)

def generate_mcqs():
    return [
        {
            "question": "Under which section is this primarily governed?",
            "options": ["Section A", "Section B", "Section C", "Section D"],
            "correct": 1,
            "explanation": "Section B explicitly covers this scenario as per the latest amendments."
        },
        {
            "question": "What is the primary objective of this legal provision?",
            "options": ["To penalize innocent acts", "To regulate and provide justice", "To increase state revenue", "None of the above"],
            "correct": 1,
            "explanation": "The core objective is to ensure fairness and regulate actions."
        }
    ]

# Generate 36 lessons per course
for course in courses_meta:
    modules = []
    lesson_counter = 1
    
    # 6 modules per course
    for m in range(1, 7):
        lessons = []
        # 6 lessons per module = 36 lessons total
        for l in range(1, 7):
            lesson_id = f"{course['id']}-M{m}-L{l}"
            title = f"Module {m}, Lesson {l}: Key Concepts of {course['title'].split(' ')[0]}"
            
            lesson = {
                "id": lesson_id,
                "title": title,
                "readingTime": random.randint(5, 15),
                "difficulty": course['level'],
                "content": {
                    "introduction": f"This lesson covers the fundamental aspects of {title}. It is designed to provide a comprehensive understanding of the legal frameworks involved. We will explore statutory interpretations and procedural requirements.",
                    "keyPoints": [
                        "Understand the historical context.",
                        "Analyze the core provisions and sections.",
                        "Apply the concepts to practical scenarios.",
                        "Always file within the limitation period.",
                        "Burden of proof lies on the petitioner."
                    ],
                    "practicalExample": {
                        "scenario": f"Case Study {lesson_counter}: A multinational company faces compliance issues under {course['title']}.",
                        "explanation": "The law provides specific remedies and procedures that must be followed. The lesson walks through the notice, reply, and adjudication process."
                    },
                    "importantSections": [
                        {"section": f"Section {random.randint(1,10)}", "description": "Definitions and scope"},
                        {"section": f"Section {random.randint(11,50)}", "description": "Rights and obligations"},
                        {"section": f"Section {random.randint(51,100)}", "description": "Enforcement and penalties"}
                    ],
                    "faqs": [
                        {
                            "question": "Can this be appealed?",
                            "answer": "Yes, within 30 days to the higher appellate authority."
                        },
                        {
                            "question": "Is this applicable to all states?",
                            "answer": "Yes, except where state amendments explicitly modify it."
                        }
                    ],
                    "relatedLaws": ["Constitution of India", "Code of Civil Procedure", "Indian Evidence Act"],
                    "summary": f"Summary: {course['title']} requires strict adherence to procedural timelines. Remember the landmark judgments for interpretation."
                },
                "quiz": generate_mcqs()
            }
            lessons.append(lesson)
            lesson_counter += 1
            
        modules.append({
            "id": f"M{m}",
            "title": f"Module {m}: Advanced Topics",
            "lessons": lessons
        })
        
    course_data = {
        "id": course["id"],
        "title": course["title"],
        "description": course["description"],
        "modules": modules
    }
    
    with open(f'backend/data/lessons/{course["id"]}.json', 'w') as f:
        json.dump(course_data, f, indent=2)

print(f"Generated 14 courses and {14 * 36} lessons successfully.")
