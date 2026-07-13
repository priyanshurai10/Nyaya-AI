import uuid
from datetime import datetime
from typing import List, Dict
from app.models import EvaluationLog

def calculate_intent_satisfaction(query: str, response: str) -> float:
    """
    Evaluates if the response addresses the core intent of the user query.
    """
    query_lower = query.lower()
    resp_lower = response.lower()
    
    # Check for general greeting flow
    greetings = ["hi", "hello", "namaste", "hey"]
    if any(g in query_lower for g in greetings) and len(query_lower) < 15:
        if "nyaya ai" in resp_lower or "assistant" in resp_lower:
            return 1.0
        return 0.8
        
    # Check for legal keywords match in response
    legal_keywords = ["section", "act", "law", "right", "legal", "court", "police", "agreement", "notice", "statute"]
    matched = sum(1 for kw in legal_keywords if kw in resp_lower or kw in query_lower)
    if matched > 0:
        return min(1.0, 0.5 + (matched * 0.1))
    return 0.7

def calculate_functional_correctness(laws_cited: List[str], sections_cited: List[str]) -> float:
    """
    Evaluates functional correctness based on presence and format of statutory citations.
    """
    score = 1.0
    if not laws_cited and not sections_cited:
        # If query was general talk, this is normal
        return 1.0
        
    # Check format of laws cited
    for law in laws_cited:
        if not any(x in law.lower() for x in ["act", "code", "sannhita", "suraksha", "constitution"]):
            score -= 0.15 # penalty for non-standard statutory names
            
    # Check sections format
    for section in sections_cited:
        if not re_has_section_number(section):
            score -= 0.1
            
    return max(0.4, score)

def re_has_section_number(text: str) -> bool:
    import re
    return bool(re.search(r'\b(?:section|sec|art|article|clause)\b|\d+', text.lower()))

def calculate_language_accuracy(target_lang: str, text: str) -> float:
    """
    Verifies that the text uses the correct script and doesn't contain forbidden mixed script.
    """
    if not text or target_lang.lower() == "english":
        return 1.0
        
    # Hinglish is Latin script but Hindi vocabulary
    if target_lang.lower() == "hinglish":
        # Check if text contains Indic characters (should be primarily Latin characters)
        has_indic = any(ord(c) > 127 for c in text)
        return 0.4 if has_indic else 1.0

    # Indic script character range checks
    script_ranges = {
        "hindi": (0x0900, 0x097F),    # Devanagari
        "bengali": (0x0980, 0x09FF),  # Bengali
        "tamil": (0x0B80, 0x0BFF),    # Tamil
        "telugu": (0x0C00, 0x0C7F),   # Telugu
        "marathi": (0x0900, 0x097F),  # Devanagari (Marathi)
        "gujarati": (0x0A80, 0x0AFF), # Gujarati
        "kannada": (0x0C80, 0x0CFF),  # Kannada
        "malayalam": (0x0D00, 0x0D7F),# Malayalam
        "punjabi": (0x0A00, 0x0A7F),  # Gurmukhi (Punjabi)
    }

    target_range = script_ranges.get(target_lang.lower())
    if not target_range:
        return 1.0  # default fallback if not recognized
        
    start, end = target_range
    chars_in_range = sum(1 for c in text if start <= ord(c) <= end)
    total_chars = len([c for c in text if c.isalpha()])
    
    if total_chars == 0:
        return 1.0
        
    accuracy = chars_in_range / total_chars
    # Support parenthetical annotations in English characters (e.g. section numbers)
    return min(1.0, accuracy + 0.25)

def calculate_explanation_clarity(text: str) -> float:
    """
    Scores response clarity based on structural simplicity (bulleted list presence, sentence lengths).
    """
    if not text:
        return 1.0
    score = 0.8
    # Bullet points increase readability
    if "•" in text or "*" in text or "-" in text:
        score += 0.1
    # Check average sentence length
    sentences = text.split('.')
    avg_len = sum(len(s.split()) for s in sentences) / len(sentences) if sentences else 0
    if avg_len < 15:
        score += 0.1
    elif avg_len > 25:
        score -= 0.1
    return max(0.5, min(1.0, score))

def run_auto_evaluation(
    db,
    session_id: str,
    query_text: str,
    response_text: str,
    laws_cited: List[str],
    sections_cited: List[str],
    target_lang: str,
    doc_analysis_quality: float = 1.0,
    risk_detection_quality: float = 1.0,
    translation_quality: float = 1.0
) -> Dict[str, float]:
    """
    Evaluates response against the 7 evaluation quality parameters and persists details in the database.
    """
    intent_sat = calculate_intent_satisfaction(query_text, response_text)
    func_correct = calculate_functional_correctness(laws_cited, sections_cited)
    lang_acc = calculate_language_accuracy(target_lang, response_text)
    exp_clarity = calculate_explanation_clarity(response_text)
    
    scores = {
        "intent_satisfaction": intent_sat,
        "functional_correctness": func_correct,
        "language_accuracy": lang_acc,
        "translation_quality": translation_quality,
        "doc_analysis_quality": doc_analysis_quality,
        "risk_detection_quality": risk_detection_quality,
        "explanation_clarity": exp_clarity
    }
    
    if db is not None:
        try:
            eval_entry = EvaluationLog(
                id=str(uuid.uuid4()),
                session_id=session_id,
                query_text=query_text,
                response_text=response_text,
                intent_satisfaction=intent_sat,
                functional_correctness=func_correct,
                language_accuracy=lang_acc,
                translation_quality=translation_quality,
                doc_analysis_quality=doc_analysis_quality,
                risk_detection_quality=risk_detection_quality,
                explanation_clarity=exp_clarity
            )
            db.add(eval_entry)
            db.commit()
        except Exception as e:
            print(f"Failed to save evaluation log: {e}")
            
    return scores
