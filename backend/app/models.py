from sqlalchemy import (
    Column,
    String,
    Integer,
    ForeignKey,
    DateTime,
    Boolean
)

from sqlalchemy.orm import relationship
from app.database import Base

import uuid
from datetime import datetime


# =====================================================
# CABINET
# =====================================================

class CabinetMedical(Base):
    __tablename__ = "cabinets"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))

    nom = Column(String, nullable=False)
    adresse = Column(String)
    telephone = Column(String)

    created_at = Column(DateTime, default=datetime.utcnow)

    users = relationship("User", back_populates="cabinet")
    patients = relationship("Patient", back_populates="cabinet")


# =====================================================
# USER
# =====================================================

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))

    nom = Column(String, nullable=False)
    prenom = Column(String, nullable=False)

    email = Column(String, unique=True, nullable=False)

    password_hash = Column(String, nullable=False)

    role = Column(String, nullable=False)

    specialite = Column(String, nullable=True)

    is_active = Column(Boolean, default=True)

    cabinet_id = Column(String, ForeignKey("cabinets.id"))

    created_at = Column(DateTime, default=datetime.utcnow)

    cabinet = relationship("CabinetMedical", back_populates="users")


# =====================================================
# PATIENT
# =====================================================

class Patient(Base):
    __tablename__ = "patients"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))

    nom = Column(String, nullable=False)
    prenom = Column(String, nullable=False)

    telephone = Column(String)
    adresse = Column(String)

    sexe = Column(String)

    cabinet_id = Column(String, ForeignKey("cabinets.id"))

    created_at = Column(DateTime, default=datetime.utcnow)

    cabinet = relationship("CabinetMedical", back_populates="patients")

from pydantic import BaseModel, ConfigDict, EmailStr
from typing import Optional

class UserCreate(BaseModel):
    nom: str
    prenom: str
    email: EmailStr
    password: str
    role: str
    specialite: Optional[str] = None
    cabinet_id: Optional[str] = None   # ← ajouter

# Ajouter ce modèle (manquant dans ton code) :
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
    cabinet_id: Optional[str] = None  # ← FIX : était absent
