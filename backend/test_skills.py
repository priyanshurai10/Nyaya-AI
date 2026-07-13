import os
import sys

# Add parent directory of 'app' to python path
sys.path.append(os.path.join(os.path.dirname(__file__), "."))

from app.skills.manager import SkillManager

def test_skills_loading():
    print("--------------------------------------------------")
    print("Starting Nyaya AI SkillManager test")
    print("--------------------------------------------------")
    
    manager = SkillManager()
    print(f"Loaded {len(manager.skills)} skills.")
    for skill_id, skill in manager.skills.items():
        print(f" - {skill.name} (ID: {skill_id}) triggers: {skill.triggers[:3]}...")
        
    print("\n------------------------- Testing Matches -------------------------")
    test_cases = [
        "How do I file an FIR?",
        "Help me write a reply to a legal notice",
        "I need a rent agreement review",
        "I lost money in a UPI online fraud scam",
        "How can I submit an RTI application?",
        "My neighbor encroached on my property boundary",
        "Can a company enforce an employment bond?",
        "I received a court summons for cheque bounce",
        "What are my rights during a police arrest? Can I get bail?",
        "Delhi Traffic Police issued an online challan, how do I pay it?"
    ]
    
    for case in test_cases:
        matched = manager.match_skill(case)
        if matched:
            print(f"Query: '{case}' -> MATCHED SKILL: {matched.name} (ID: {matched.id})")
        else:
            print(f"Query: '{case}' -> NO MATCH (Will use Generic Legal Agent)")

if __name__ == "__main__":
    test_skills_loading()
