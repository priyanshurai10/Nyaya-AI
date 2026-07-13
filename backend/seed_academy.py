import sqlite3
import json
import uuid
from datetime import datetime

import os

def seed():
    db_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'nyaya_ai.db')
    conn = sqlite3.connect(db_path)
    c = conn.cursor()
    
    print("Recreating Academy tables...")
    c.execute("DROP TABLE IF EXISTS user_progress")
    c.execute("DROP TABLE IF EXISTS lessons")
    c.execute("DROP TABLE IF EXISTS courses")
    
    c.execute("""
    CREATE TABLE courses (
        id VARCHAR PRIMARY KEY,
        title VARCHAR NOT NULL,
        description TEXT,
        thumbnail_url VARCHAR,
        metadata_json JSON,
        created_at DATETIME,
        updated_at DATETIME
    )
    """)
    
    c.execute("""
    CREATE TABLE lessons (
        id VARCHAR PRIMARY KEY,
        course_id VARCHAR NOT NULL REFERENCES courses(id),
        module_id VARCHAR,
        title VARCHAR NOT NULL,
        content_json JSON,
        video_url VARCHAR,
        order_index INTEGER DEFAULT 0,
        created_at DATETIME,
        updated_at DATETIME
    )
    """)
    
    c.execute("""
    CREATE TABLE user_progress (
        id VARCHAR PRIMARY KEY,
        user_id VARCHAR NOT NULL REFERENCES users(id),
        course_id VARCHAR NOT NULL REFERENCES courses(id),
        lesson_id VARCHAR NOT NULL REFERENCES lessons(id),
        module_id VARCHAR,
        progress_pct INTEGER DEFAULT 0,
        status VARCHAR DEFAULT 'IN_PROGRESS',
        quiz_score INTEGER,
        completed BOOLEAN DEFAULT 0,
        last_accessed DATETIME,
        created_at DATETIME,
        updated_at DATETIME
    )
    """)
    
    print("Generating Indian Legal Education Curriculum...")
    now = datetime.utcnow().isoformat()
    
    # ---------------------------------------------------------
    # COURSE 1: Constitutional Law Fundamentals
    # ---------------------------------------------------------
    c1_id = "crs-const-001"
    c1_meta = {
        "category": "Constitutional Law",
        "difficulty": "Beginner",
        "duration": "4 hours",
        "totalLessons": 3,
        "estimatedHours": 4,
        "rating": "4.9",
        "readingTime": "15 mins/lesson",
        "examplesCount": 12,
        "quizzesCount": 3,
        "keyPoints": [
            "Understand the Preamble and its philosophy",
            "Deep dive into Fundamental Rights (Part III)",
            "Directive Principles of State Policy"
        ],
        "modules": [
            {"id": "mod-1-1", "title": "Introduction to the Constitution"},
            {"id": "mod-1-2", "title": "Fundamental Rights"}
        ]
    }
    
    c.execute("INSERT INTO courses (id, title, description, thumbnail_url, metadata_json, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
              (c1_id, "Constitutional Law Fundamentals", "A comprehensive guide to the Constitution of India, its making, philosophy, and the rights it guarantees.", "bg-gradient-to-br from-indigo-500 to-blue-600", json.dumps(c1_meta), now, now))
    
    # Lesson 1
    l1_id = "les-const-001"
    l1_content = {
        "readingTime": "15 mins",
        "introduction": "The Constitution of India is the supreme law of India. The document lays down the framework that demarcates fundamental political code, structure, procedures, powers, and duties of government institutions and sets out fundamental rights, directive principles, and the duties of citizens.",
        "keyPoints": [
            "Adopted on 26 November 1949, effective from 26 January 1950.",
            "Longest written constitution of any country.",
            "B. R. Ambedkar is widely regarded as its chief architect."
        ],
        "practicalExample": {
            "scenario": "A state government passes a law banning the publication of a specific newspaper because it criticized the Chief Minister.",
            "explanation": "This law would likely be struck down by the Supreme Court as unconstitutional because it violates Article 19(1)(a) – Freedom of Speech and Expression, which is guaranteed by the Constitution."
        },
        "importantSections": [
            {"section": "The Preamble", "description": "Declares India to be a sovereign, socialist, secular, and democratic republic."}
        ],
        "faqs": [
            {"question": "Can the Constitution be amended?", "answer": "Yes, under Article 368, but the 'basic structure' cannot be altered, as established in the Kesavananda Bharati case."}
        ],
        "relatedLaws": ["Article 368", "The Preamble"],
        "summary": "The Indian Constitution is a living document that provides the fundamental legal framework for the country.",
        "quiz": {
            "questions": [
                {
                    "id": 1,
                    "question": "When did the Constitution of India come into effect?",
                    "options": ["15 August 1947", "26 November 1949", "26 January 1950", "1 January 1950"],
                    "correctAnswer": 2,
                    "explanation": "While adopted on Nov 26, 1949, it came into effect on Jan 26, 1950 (Republic Day)."
                }
            ]
        }
    }
    c.execute("INSERT INTO lessons (id, course_id, module_id, title, content_json, order_index, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
              (l1_id, c1_id, "mod-1-1", "History & The Preamble", json.dumps(l1_content), 1, now, now))
              
    # Lesson 2
    l2_id = "les-const-002"
    l2_content = {
        "readingTime": "20 mins",
        "introduction": "Fundamental Rights are enshrined in Part III of the Constitution (Articles 12-35). They guarantee civil liberties such that all Indians can lead their lives in peace and harmony as citizens of India.",
        "keyPoints": [
            "Right to Equality (Articles 14-18)",
            "Right to Freedom (Articles 19-22)",
            "Right against Exploitation (Articles 23-24)"
        ],
        "practicalExample": {
            "scenario": "A person is denied entry to a public restaurant solely based on their religion.",
            "explanation": "This is a direct violation of Article 15, which prohibits discrimination on grounds of religion, race, caste, sex or place of birth."
        },
        "importantSections": [
            {"section": "Article 14", "description": "Equality before law."},
            {"section": "Article 21", "description": "Protection of life and personal liberty."}
        ],
        "faqs": [
            {"question": "Are Fundamental Rights absolute?", "answer": "No, they are subject to reasonable restrictions (e.g., public order, morality, national security)."}
        ],
        "relatedLaws": ["Article 14", "Article 19", "Article 21"],
        "summary": "Fundamental Rights are the bedrock of Indian democracy, ensuring justice and equality.",
        "quiz": {
            "questions": [
                {
                    "id": 1,
                    "question": "Which Article guarantees Equality before the Law?",
                    "options": ["Article 12", "Article 14", "Article 19", "Article 21"],
                    "correctAnswer": 1,
                    "explanation": "Article 14 explicitly guarantees equality before the law and equal protection of the laws."
                }
            ]
        }
    }
    c.execute("INSERT INTO lessons (id, course_id, module_id, title, content_json, order_index, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
              (l2_id, c1_id, "mod-1-2", "Right to Equality", json.dumps(l2_content), 2, now, now))

    # Lesson 3
    l3_id = "les-const-003"
    l3_content = {
        "readingTime": "25 mins",
        "introduction": "Article 21 states: 'No person shall be deprived of his life or personal liberty except according to procedure established by law.' This has been expansively interpreted by the Supreme Court.",
        "keyPoints": [
            "Includes Right to Privacy (Puttaswamy case).",
            "Includes Right to clean environment.",
            "Applies to non-citizens as well."
        ],
        "practicalExample": {
            "scenario": "The government attempts to tap a citizen's phone without legal authorization.",
            "explanation": "This violates the Right to Privacy, which is an intrinsic part of Article 21."
        },
        "importantSections": [
            {"section": "Article 21", "description": "Protection of life and personal liberty."}
        ],
        "faqs": [
            {"question": "Does Article 21 include the right to die?", "answer": "No. However, passive euthanasia is permitted under strict guidelines."}
        ],
        "relatedLaws": ["Article 21", "Article 21A (Right to Education)"],
        "summary": "Article 21 is often called the heart of Fundamental Rights, constantly evolving through judicial interpretation.",
        "quiz": {
            "questions": [
                {
                    "id": 1,
                    "question": "The Right to Privacy was declared a fundamental right in which landmark case?",
                    "options": ["Kesavananda Bharati", "K.S. Puttaswamy v. UOI", "Maneka Gandhi v. UOI", "Vishaka v. State of Rajasthan"],
                    "correctAnswer": 1,
                    "explanation": "A 9-judge bench in the Puttaswamy case (2017) unanimously ruled that Privacy is a fundamental right under Article 21."
                }
            ]
        }
    }
    c.execute("INSERT INTO lessons (id, course_id, module_id, title, content_json, order_index, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
              (l3_id, c1_id, "mod-1-2", "Right to Life & Liberty", json.dumps(l3_content), 3, now, now))


    # ---------------------------------------------------------
    # COURSE 2: Criminal Law & Procedure
    # ---------------------------------------------------------
    c2_id = "crs-crim-001"
    c2_meta = {
        "category": "Criminal Law",
        "difficulty": "Intermediate",
        "duration": "6 hours",
        "totalLessons": 2,
        "estimatedHours": 6,
        "rating": "4.8",
        "readingTime": "20 mins/lesson",
        "examplesCount": 25,
        "quizzesCount": 2,
        "keyPoints": [
            "Filing an FIR (First Information Report)",
            "Arrest rights and bail procedures",
            "Transition from IPC to Bharatiya Nyaya Sanhita (BNS)"
        ],
        "modules": [
            {"id": "mod-2-1", "title": "Initiating Criminal Proceedings"},
            {"id": "mod-2-2", "title": "Bail & Custody"}
        ]
    }
    
    c.execute("INSERT INTO courses (id, title, description, thumbnail_url, metadata_json, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
              (c2_id, "Criminal Law & Procedure", "Master the practical aspects of Indian Criminal Law, from filing an FIR to understanding the nuances of bail under the new BNS guidelines.", "bg-gradient-to-br from-red-500 to-rose-600", json.dumps(c2_meta), now, now))

    # Lesson 4
    l4_id = "les-crim-001"
    l4_content = {
        "readingTime": "20 mins",
        "introduction": "A First Information Report (FIR) is a written document prepared by police organizations when they receive information about the commission of a cognizable offence.",
        "keyPoints": [
            "Can only be filed for cognizable offences.",
            "Can be filed by the victim, a witness, or anyone with knowledge of the crime.",
            "Zero FIR can be filed at any police station regardless of jurisdiction."
        ],
        "practicalExample": {
            "scenario": "A person is robbed in Mumbai but travels to Pune before reporting it.",
            "explanation": "They can file a 'Zero FIR' in Pune, which will then be transferred to the relevant police station in Mumbai."
        },
        "importantSections": [
            {"section": "Section 154 CrPC / Sec 173 BNSS", "description": "Information in cognizable cases (FIR)."}
        ],
        "faqs": [
            {"question": "Can police refuse to file an FIR?", "answer": "No, for cognizable offences they are legally bound. If refused, you can approach the Superintendent of Police or a Magistrate."}
        ],
        "relatedLaws": ["CrPC Section 154", "BNSS Section 173"],
        "summary": "Filing an FIR is the crucial first step that sets the criminal justice system in motion.",
        "quiz": {
            "questions": [
                {
                    "id": 1,
                    "question": "What is a 'Zero FIR'?",
                    "options": ["An FIR with zero accused", "An FIR filed for non-cognizable offences", "An FIR that can be filed in any police station irrespective of jurisdiction", "A fake FIR"],
                    "correctAnswer": 2,
                    "explanation": "A Zero FIR allows a victim to file a complaint at any police station; it is later transferred to the station with proper jurisdiction."
                }
            ]
        }
    }
    c.execute("INSERT INTO lessons (id, course_id, module_id, title, content_json, order_index, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
              (l4_id, c2_id, "mod-2-1", "Understanding FIRs", json.dumps(l4_content), 1, now, now))

    # Lesson 5
    l5_id = "les-crim-002"
    l5_content = {
        "readingTime": "25 mins",
        "introduction": "Bail is the conditional release of a defendant with the promise to appear in court when required. The overarching principle in Indian jurisprudence is 'Bail is the rule, jail is an exception'.",
        "keyPoints": [
            "Bailable offences: Bail is a matter of right.",
            "Non-bailable offences: Bail is at the discretion of the court.",
            "Anticipatory Bail: Granted in anticipation of arrest for a non-bailable offence."
        ],
        "practicalExample": {
            "scenario": "A person fears they will be falsely implicated by a rival in a serious non-bailable crime.",
            "explanation": "They can apply for Anticipatory Bail under Section 438 of CrPC / 482 of BNSS before they are even arrested."
        },
        "importantSections": [
            {"section": "Section 436 CrPC", "description": "Bail in bailable offences."},
            {"section": "Section 438 CrPC", "description": "Anticipatory bail."}
        ],
        "faqs": [
            {"question": "What happens if bail conditions are violated?", "answer": "The court can cancel the bail and direct that the person be arrested and committed to custody."}
        ],
        "relatedLaws": ["CrPC Sections 436-439", "BNSS corresponding sections"],
        "summary": "Understanding bail distinctions helps safeguard personal liberty during the investigative phase.",
        "quiz": {
            "questions": [
                {
                    "id": 1,
                    "question": "In the case of a 'bailable offence', bail is:",
                    "options": ["At the discretion of the police", "A matter of right", "At the discretion of the Magistrate", "Not possible"],
                    "correctAnswer": 1,
                    "explanation": "For bailable offences, the accused can claim bail as a matter of right from the police officer or court."
                }
            ]
        }
    }
    c.execute("INSERT INTO lessons (id, course_id, module_id, title, content_json, order_index, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
              (l5_id, c2_id, "mod-2-2", "Bail is the Rule", json.dumps(l5_content), 2, now, now))


    # ---------------------------------------------------------
    # COURSE 3: Property & Real Estate
    # ---------------------------------------------------------
    c3_id = "crs-prop-001"
    c3_meta = {
        "category": "Property Law",
        "difficulty": "Advanced",
        "duration": "8 hours",
        "totalLessons": 1,
        "estimatedHours": 8,
        "rating": "4.7",
        "readingTime": "30 mins/lesson",
        "examplesCount": 18,
        "quizzesCount": 1,
        "keyPoints": [
            "Understanding RERA (Real Estate Regulation Act)",
            "Transfer of Property Act essentials",
            "Inheritance and Succession"
        ],
        "modules": [
            {"id": "mod-3-1", "title": "Real Estate Regulation"}
        ]
    }
    
    c.execute("INSERT INTO courses (id, title, description, thumbnail_url, metadata_json, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
              (c3_id, "Property & Real Estate Laws", "Navigate the complexities of buying, selling, and inheriting property in India with a special focus on RERA.", "bg-gradient-to-br from-emerald-500 to-green-600", json.dumps(c3_meta), now, now))

    # Lesson 6
    l6_id = "les-prop-001"
    l6_content = {
        "readingTime": "30 mins",
        "introduction": "The Real Estate (Regulation and Development) Act, 2016 (RERA) was introduced to protect home-buyers and boost investments in the real estate sector.",
        "keyPoints": [
            "Mandatory registration of projects.",
            "70% of funds must be kept in a dedicated escrow account.",
            "Promoters cannot change project plans without consent of 2/3rd allottees."
        ],
        "practicalExample": {
            "scenario": "A builder delays handing over the flat possession by 2 years and diverts the funds to another project.",
            "explanation": "Under RERA, the builder is liable to pay interest for every month of delay, and the diversion of funds is restricted by the 70% escrow rule."
        },
        "importantSections": [
            {"section": "Section 3, RERA", "description": "Prior registration of real estate project."}
        ],
        "faqs": [
            {"question": "Can I file a RERA complaint online?", "answer": "Yes, almost all state RERA authorities have a dedicated online portal for filing complaints."}
        ],
        "relatedLaws": ["RERA Act, 2016", "Transfer of Property Act, 1882"],
        "summary": "RERA has dramatically shifted the balance of power back towards the consumer in real estate transactions.",
        "quiz": {
            "questions": [
                {
                    "id": 1,
                    "question": "What percentage of funds collected from buyers must a developer deposit into a separate escrow account under RERA?",
                    "options": ["50%", "60%", "70%", "100%"],
                    "correctAnswer": 2,
                    "explanation": "Section 4(2)(l)(D) of RERA requires 70% of the amounts realized for the real estate project to be deposited in a separate account to cover construction cost and land cost."
                }
            ]
        }
    }
    c.execute("INSERT INTO lessons (id, course_id, module_id, title, content_json, order_index, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
              (l6_id, c3_id, "mod-3-1", "Introduction to RERA", json.dumps(l6_content), 1, now, now))


    conn.commit()
    conn.close()
    print("Academy Seeding Complete!")

if __name__ == "__main__":
    seed()
