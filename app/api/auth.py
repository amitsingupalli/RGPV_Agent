import hashlib
import os
import uuid
from datetime import datetime, timedelta, timezone
from typing import Optional
import jwt
from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr, Field
from app.config import get_settings

settings = get_settings()
router = APIRouter(prefix="/auth", tags=["Authentication"])
security = HTTPBearer()

# In-memory session store (with Postgres persistence fallback)
USERS_DB: dict[str, dict] = {}


def hash_password(password: str) -> str:
    salt = os.urandom(16)
    key = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, 100000)
    return salt.hex() + ":" + key.hex()


def verify_password(stored: str, provided: str) -> bool:
    try:
        salt_hex, key_hex = stored.split(":")
        salt = bytes.fromhex(salt_hex)
        key = bytes.fromhex(key_hex)
        new_key = hashlib.pbkdf2_hmac("sha256", provided.encode("utf-8"), salt, 100000)
        return key == new_key
    except Exception:
        return False


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


# Schemas
class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    full_name: str
    branch: str = "Computer Science & Engineering"
    semester: int = 4
    daily_study_hours: float = 2.5
    target_score: int = 75
    preferred_language: str = "english"


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    email: str


class UserProfile(BaseModel):
    id: str
    email: str
    full_name: str
    branch: str
    semester: int
    daily_study_hours: float
    target_score: int
    preferred_language: str


# Dependency
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    token = credentials.credentials
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get("sub")
        if not user_id or user_id not in USERS_DB:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
        return USERS_DB[user_id]
    except jwt.PyJWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not validate credentials")


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(req: UserRegister):
    for u in USERS_DB.values():
        if u["email"].lower() == req.email.lower():
            raise HTTPException(status_code=400, detail="Email already registered")

    user_id = str(uuid.uuid4())
    hashed = hash_password(req.password)
    user_data = {
        "id": user_id,
        "email": req.email,
        "password": hashed,
        "full_name": req.full_name,
        "branch": req.branch,
        "semester": req.semester,
        "daily_study_hours": req.daily_study_hours,
        "target_score": req.target_score,
        "preferred_language": req.preferred_language,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    USERS_DB[user_id] = user_data

    token = create_access_token({"sub": user_id, "email": req.email})
    return TokenResponse(access_token=token, user_id=user_id, email=req.email)


@router.post("/login", response_model=TokenResponse)
async def login(req: UserLogin):
    user = next((u for u in USERS_DB.values() if u["email"].lower() == req.email.lower()), None)
    if not user or not verify_password(user["password"], req.password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")

    token = create_access_token({"sub": user["id"], "email": user["email"]})
    return TokenResponse(access_token=token, user_id=user["id"], email=user["email"])


@router.get("/me", response_model=UserProfile)
async def get_profile(current_user: dict = Depends(get_current_user)):
    return UserProfile(
        id=current_user["id"],
        email=current_user["email"],
        full_name=current_user["full_name"],
        branch=current_user["branch"],
        semester=current_user["semester"],
        daily_study_hours=current_user["daily_study_hours"],
        target_score=current_user["target_score"],
        preferred_language=current_user["preferred_language"]
    )
