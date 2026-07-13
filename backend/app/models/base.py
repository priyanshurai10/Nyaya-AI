from sqlalchemy import Column, String, DateTime, ForeignKey, Text, JSON, Integer, Float, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.types import TypeDecorator
from datetime import datetime
from app.core.database import Base

# ---------------------------------------------------------
# Custom SQLAlchemy Type Decorators for Transparent encryption
# ---------------------------------------------------------
class EncryptedText(TypeDecorator):
    impl = Text

    def process_bind_param(self, value, dialect):
        if value is not None:
            from app.core.security import encrypt_data
            return encrypt_data(value)
        return value

    def process_result_value(self, value, dialect):
        if value is not None:
            from app.core.security import decrypt_data
            return decrypt_data(value)
        return value

class EncryptedString(TypeDecorator):
    impl = String

    def process_bind_param(self, value, dialect):
        if value is not None:
            from app.core.security import encrypt_data
            return encrypt_data(value)
        return value

    def process_result_value(self, value, dialect):
        if value is not None:
            from app.core.security import decrypt_data
            return decrypt_data(value)
        return value
