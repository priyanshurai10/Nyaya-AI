import os
import re
import hashlib
from typing import Tuple, Dict, List, Optional, Any
from cryptography.fernet import Fernet
from app.core.config import settings

# Initialize Fernet cryptography
try:
    cipher_suite = Fernet(settings.ENCRYPTION_KEY.encode())
except Exception as e:
    print(f"Error initializing cryptography with key: {e}. Generating dynamic fallback.")
    fallback_key = Fernet.generate_key()
    cipher_suite = Fernet(fallback_key)

# ---------------------------------------------------------
# 1. Symmetric Data Encryption
# ---------------------------------------------------------
def encrypt_data(plain_text: Optional[str]) -> Optional[str]:
    if not plain_text:
        return plain_text
    try:
        encrypted_bytes = cipher_suite.encrypt(plain_text.encode('utf-8'))
        return encrypted_bytes.decode('utf-8')
    except Exception as e:
        print(f"Encryption failed: {e}")
        return plain_text

def decrypt_data(cipher_text: Optional[str]) -> Optional[str]:
    if not cipher_text:
        return cipher_text
    try:
        decrypted_bytes = cipher_suite.decrypt(cipher_text.encode('utf-8'))
        return decrypted_bytes.decode('utf-8')
    except Exception:
        # Fallback if text is not encrypted (e.g. legacy data)
        return cipher_text

# ---------------------------------------------------------
# 2. Prompt Injection Protection
# ---------------------------------------------------------
INJECTION_KEYWORDS = [
    r"ignore\s+(?:the\s+)?(?:above|previous|instruction|system)",
    r"override\s+(?:system|instruction|developer|directive)",
    r"you\s+are\s+now\s+(?:a|an|in)",
    r"act\s+as\s+(?:a|an)",
    r"jailbreak",
    r"reveal\s+(?:system\s+)?prompt",
    r"print\s+(?:the\s+)?instructions",
    r"developer\s+mode",
    r"developer\s+directive",
    r"ignore\s+guidelines",
    r"bypass\s+safety",
    r"execute\s+unauthorized",
    r"database\s+access"
]

def detect_prompt_injection(text: str) -> Dict[str, Any]:
    """
    Scans the query for known prompt injection signatures.
    Returns a dict with safety evaluation details.
    """
    if not text:
        return {"is_injection": False, "confidence_score": 0.0, "reason": ""}

    text_lower = text.lower()
    for pattern in INJECTION_KEYWORDS:
        if re.search(pattern, text_lower):
            # Calculate a confidence score representing detection certainty
            return {
                "is_injection": True,
                "confidence_score": 0.99,
                "reason": f"System override attempt detected matching pattern: '{pattern}'"
            }
    
    # Generic adversarial indicators
    adversarial_words = ["direct instructions", "forget everything", "new rules", "as a hacker"]
    matches = sum(1 for word in adversarial_words if word in text_lower)
    if matches >= 2:
        return {
            "is_injection": True,
            "confidence_score": 0.85,
            "reason": "Multiple adversarial override indicators found in input text."
        }

    return {"is_injection": False, "confidence_score": 0.0, "reason": ""}

# ---------------------------------------------------------
# 3. Document Integrity Validation
# ---------------------------------------------------------
ALLOWED_EXTENSIONS = {'.pdf', '.docx', '.jpg', '.jpeg', '.png'}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB limit

# File signatures (magic bytes) mapping
MAGIC_SIGNATURES: Dict[str, bytes] = {
    '.pdf': b'%PDF-',
    '.png': b'\x89PNG\r\n\x1a\n',
    '.jpg': b'\xff\xd8\xff',
    '.jpeg': b'\xff\xd8\xff',
    '.docx': b'PK\x03\x04',  # ZIP archive signature (used by OpenXML docx)
}

def verify_document_integrity(file_bytes: bytes, filename: str) -> Tuple[bool, str]:
    """
    Validates file sizes, checks extension whitelisting, and scans header signatures.
    """
    if not file_bytes:
        return False, "File is empty."

    # Size check
    if len(file_bytes) > MAX_FILE_SIZE:
        return False, f"File size exceeds limit of 10MB. Got {(len(file_bytes) / 1024 / 1024):.2f}MB."

    # Extension check
    _, ext = os.path.splitext(filename.lower())
    ext = ext.strip()
    if ext not in ALLOWED_EXTENSIONS:
        return False, f"Unauthorized file extension: {ext or 'None'}. Allowed extensions: PDF, DOCX, JPG, JPEG, PNG."

    # Signature verification (Magic bytes check)
    expected_magic = MAGIC_SIGNATURES.get(ext)
    if expected_magic:
        magic_len = len(expected_magic)
        file_magic = file_bytes[:magic_len]
        if file_magic != expected_magic:
            return False, f"Integrity scan failed: Spoofed file extension. Header signature does not match expected format for {ext.upper()}."

    return True, "File integrity verified."

# ---------------------------------------------------------
# 4. Agent Role Permission Control
# ---------------------------------------------------------
AGENT_ROLES: Dict[str, List[str]] = {
    "legal_agent": ["analyze_document", "read_legal_memory", "write_legal_response", "cite_laws"],
    "translation_agent": ["translate_content", "detect_language"],
    "memory_agent": ["read_legal_memory", "write_legal_memory", "summarize_history"],
    "risk_agent": ["perform_risk_analysis", "score_vulnerabilities"],
}

def validate_agent_permission(agent_name: str, action: str) -> Tuple[bool, str]:
    """
    Checks if an agent role is authorized to perform a specific action (RBAA).
    """
    allowed_actions = AGENT_ROLES.get(agent_name)
    if not allowed_actions:
        return False, f"Access Denied: Unrecognized agent role '{agent_name}'."
    
    if action not in allowed_actions:
        return False, f"Access Denied: Agent '{agent_name}' lacks authorization to execute action '{action}'."
        
    return True, "Action authorized."

def log_audit_event(
    db,
    action_type: str,
    action_description: str,
    session_id: Optional[str] = None,
    user_id: Optional[str] = None,
    agent_used: Optional[str] = None,
    result_status: str = "success",
    client_ip: Optional[str] = None
):
    if db is None:
        return
    import uuid
    from app.models import AuditLog
    # Hash IP for privacy
    ip_hash = None
    if client_ip:
        ip_hash = hashlib.sha256(client_ip.encode()).hexdigest()[:16]
    
    try:
        log_entry = AuditLog(
            id=str(uuid.uuid4()),
            session_id=session_id,
            user_id=user_id or ip_hash,
            agent_used=agent_used,
            action_type=action_type,
            action_description=action_description,
            result_status=result_status,
            client_ip_hash=ip_hash
        )
        db.add(log_entry)
        db.commit()
    except Exception as e:
        print(f"Failed to log audit event: {e}")

