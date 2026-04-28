"""
routes/auth.py — Authentication endpoints (demo/stub)
"""
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


class LoginRequest(BaseModel):
    email: str
    password: str


class RegisterRequest(BaseModel):
    email: str
    password: str
    full_name: str = ""


@router.post("/login")
async def login(req: LoginRequest):
    """Demo login — returns a static token."""
    return {
        "token": "demo-jwt-token",
        "user": {"name": "Mohammed Khan", "email": req.email, "role": "student"},
    }


@router.post("/register")
async def register(req: RegisterRequest):
    """Demo registration."""
    return {"message": "User registered successfully", "email": req.email}
