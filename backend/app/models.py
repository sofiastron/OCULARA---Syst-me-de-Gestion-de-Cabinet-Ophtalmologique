from sqlalchemy import (
    Column,
    String,
    Integer,
    ForeignKey,
    DateTime,
    Boolean,
    Date,      
    Time
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

# =====================================================
# AGENDA NUMÉRIQUE
# =====================================================

class PlageHoraire(Base):
    __tablename__ = "plages_horaires"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    ophtalmologue_id = Column(String, ForeignKey("users.id"), nullable=False)
    jour_semaine = Column(String(10), nullable=False)  # LUNDI, MARDI...
    heure_debut = Column(Time, nullable=False)
    heure_fin = Column(Time, nullable=False)
    duree_creneau_min = Column(Integer, default=30)
    actif = Column(Boolean, default=True)
    date_debut_validite = Column(Date, nullable=True)
    date_fin_validite = Column(Date, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    creneaux = relationship("Creneau", back_populates="plage")


class Creneau(Base):
    __tablename__ = "creneaux"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    plage_id = Column(String, ForeignKey("plages_horaires.id"), nullable=False)
    ophtalmologue_id = Column(String, ForeignKey("users.id"), nullable=False)
    date = Column(Date, nullable=False)
    heure_debut = Column(Time, nullable=False)
    heure_fin = Column(Time, nullable=False)
    statut_affichage = Column(String(15), default="DISPONIBLE")  # DISPONIBLE | COMPLET | BLOQUE
    disponible = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    plage = relationship("PlageHoraire", back_populates="creneaux")
    rendez_vous = relationship("RendezVous", back_populates="creneau", uselist=False)


class RendezVous(Base):
    __tablename__ = "appointments"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    creneau_id = Column(String, ForeignKey("creneaux.id"), nullable=False)
    ophtalmologue_id = Column(String, ForeignKey("users.id"), nullable=False)
    cabinet_id = Column(String, ForeignKey("cabinets.id"), nullable=True)
    
    patient_id = Column(String, ForeignKey("patients.id"), nullable=True)

    nom_patient = Column(String, nullable=True)
    prenom_patient = Column(String, nullable=True)
    telephone = Column(String, nullable=True)
    email_contact = Column(String, nullable=True)

    token_modification = Column(String, default=lambda: str(uuid.uuid4()))
    cancel_token = Column(String, default=lambda: str(uuid.uuid4()))
    token_expires_at = Column(DateTime, nullable=True)

    source = Column(String(10), default="web")         # web | telephone | cabinet
    statut = Column(String(15), default="EN_ATTENTE")  # EN_ATTENTE | CONFIRME | ANNULE | REPORTE | HONORE
    motif = Column(String, nullable=True)
    notes_secretaire = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    creneau = relationship("Creneau", back_populates="rendez_vous")