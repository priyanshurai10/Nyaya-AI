import jwt
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.models.user import User
from app.core.database import get_db
from app.core.config import settings

# Initialize Supabase client
from supabase import create_client, Client
supabase: Client = create_client(settings.NEXT_PUBLIC_SUPABASE_URL, settings.NEXT_PUBLIC_SUPABASE_ANON_KEY)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/user/login", auto_error=False)

def get_current_user(token: Optional[str] = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> Optional[User]:
    """Dependency injection helper to retrieve current authenticated user from database."""
    if not token:
        return None
        
    try:
        res = supabase.auth.get_user(token)
        if not res or not res.user:
            raise Exception("Invalid session")
        user_id = res.user.id
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials / Session expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        # Fallback to create the user if the trigger failed
        try:
            email = res.user.email
            name = res.user.user_metadata.get('name', 'User') if res.user.user_metadata else 'User'
            user = User(id=user_id, email=email, name=name)
            db.add(user)
            db.commit()
            db.refresh(user)
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User profile not found"
            )
            
    return user
