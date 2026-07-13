import asyncio
import sys
import os

# Add parent directory of 'app' to python path
sys.path.append(os.path.join(os.path.dirname(__file__), "."))

from app.agents.orchestrator import orchestrator_service
from app.agents.translation import TranslationAgent
from app.core.config import settings

async def test_languages():
    print("--------------------------------------------------")
    print("Starting Nyaya AI Multilingual Integration Test")
    print("--------------------------------------------------")
    print(f"GEMINI_API_KEY Configured: {bool(settings.GEMINI_API_KEY)}")
    print(f"GROQ_API_KEY Configured: {bool(settings.GROQ_API_KEY)}")
    print("--------------------------------------------------")

    # Test cases representing queries in different languages
    test_queries = [
        # Hindi
        ("मकान मालिक सिक्योरिटी डिपॉजिट वापस नहीं कर रहा है, मैं क्या करूँ?", "hindi"),
        # Hinglish
        ("landlord security deposit wapas nahi de raha hai, help me", "hinglish"),
        # Bengali
        ("জমির বিরোধ নিয়ে আমার কী করা উচিত?", "bengali"),
        # Tamil
        ("கைது செய்யப்பட்டால் எனது உரிமைகள் என்ன?", "tamil"),
        # Telugu
        ("వినియోగదారుల ఫోరంలో ఫిర్యాదు చేయడం ఎలా?", "telugu"),
        # Kannada
        ("ಬಾಡಿಗೆ ಒಪ್ಪಂದದಲ್ಲಿ ಏನನ್ನು ಪರಿಶೀಲಿಸಬೇಕು?", "kannada"),
        # Marathi
        ("पोलिस एफआयआर कसा दाखल करायचा?", "marathi"),
        # Punjabi
        ("ਔਨਲਾਈਨ ਧੋਖਾਧੜੀ ਹੋ ਗਈ ਹੈ, ਮੈਂ ਕੀ ਕਰਾਂ?", "punjabi")
    ]

    translation_agent = TranslationAgent()

    for idx, (query, expected_lang) in enumerate(test_queries, 1):
        print(f"\n[{idx}] Testing query: '{query}'")
        try:
            # Test direct translation detection first
            detection = await translation_agent.analyze_input(query)
            print(f"  -> Detected Language: {detection.detected_language} (Expected: {expected_lang})")
            print(f"  -> English Translation: {detection.english_translation[:100]}...")
            
            # Test orchestrator response generation
            response = await orchestrator_service.process_message(
                user_message=query,
                current_summary="",
                chat_history=[]
            )
            print(f"  -> Bot Response Lang: {response['detected_language']}")
            print(f"  -> Bot Response Preview: {response['response'][:150]}...")
            print(f"  -> Laws Cited: {response['laws_cited']}")
            print(f"  -> Sections Cited: {response['sections_cited']}")
            print(f"  -> Disclaimer: {response['disclaimer'][:80]}...")
        except Exception as e:
            print(f"  -> FAILED with error: {e}")

if __name__ == "__main__":
    # Run the async test
    asyncio.run(test_languages())
