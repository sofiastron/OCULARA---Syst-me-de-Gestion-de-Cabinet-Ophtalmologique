from pydantic import BaseModel, ConfigDict, EmailStr
from typing import Optional


class UserCreate(BaseModel):
    nom: str
    prenom: str
    email: EmailStr
    password: str
    role: str
    specialite: Optional[str] = None
    cabinet_id: Optional[str] = None


class UserOut(BaseModel):
    id: str
    nom: str
    prenom: str
    email: str
    role: str
    specialite: Optional[str] = None
    cabinet_id: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)


class UserUpdate(BaseModel):
    nom: Optional[str] = None
    prenom: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    role: Optional[str] = None          
    specialite: Optional[str] = None
    cabinet_id: Optional[str] = None