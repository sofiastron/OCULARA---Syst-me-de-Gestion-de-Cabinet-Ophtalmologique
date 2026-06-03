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
    email = Column(String, nullable=True)

    sexe = Column(String)

    cabinet_id = Column(String, ForeignKey("cabinets.id"))
    created_at = Column(DateTime, default=datetime.utcnow)

    cabinet = relationship("CabinetMedical", back_populates="patients")

    dossier = relationship(
        "DossierPatient",
        back_populates="patient",
        cascade="all, delete-orphan",
        uselist=False,
    )

    examens = relationship(
        "ExamenMedical",
        back_populates="patient"
    )


# =====================================================
# DOSSIER PATIENT
# =====================================================

class DossierPatient(Base):
    __tablename__ = "dossiers_patients"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    patient_id = Column(String, ForeignKey("patients.id"), nullable=False, unique=True)
    cabinet_id = Column(String, ForeignKey("cabinets.id"), nullable=True)

    date_naissance = Column(Date, nullable=True)
    email = Column(String, nullable=True)
    mutuelle = Column(String, nullable=True)
    antecedents = Column(String, nullable=True)
    numero_dossier = Column(String, unique=True, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    patient = relationship("Patient", back_populates="dossier")


# =====================================================
# RENDEZ-VOUS (AJOUTÉ ✔️)
# =====================================================

class RendezVous(Base):
    __tablename__ = "rendez_vous"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))

    patient_id = Column(String, ForeignKey("patients.id"), nullable=False)
    cabinet_id = Column(String, ForeignKey("cabinets.id"), nullable=False)
    user_id = Column(String, ForeignKey("users.id"), nullable=True)

    date_rdv = Column(DateTime, nullable=False)
    statut = Column(String, default="PLANIFIE")

    created_at = Column(DateTime, default=datetime.utcnow)


# =====================================================
# CRÉNEAU (AJOUTÉ ✔️)
# =====================================================

class Creneau(Base):
    __tablename__ = "creneaux"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))

    cabinet_id = Column(String, ForeignKey("cabinets.id"), nullable=False)
    user_id = Column(String, ForeignKey("users.id"), nullable=True)

    date = Column(Date, nullable=False)
    heure_debut = Column(Time, nullable=False)
    heure_fin = Column(Time, nullable=False)

    disponible = Column(Boolean, default=True)


# =====================================================
# FILE D'ATTENTE
# =====================================================

class FileAttente(Base):
    __tablename__ = "file_attente"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    patient_id = Column(String, ForeignKey("patients.id"), nullable=False)
    rendez_vous_id = Column(String, ForeignKey("rendez_vous.id"), nullable=True)
    cabinet_id = Column(String, ForeignKey("cabinets.id"), nullable=False)

    statut = Column(String(30), default="EN_ATTENTE")

    ordre = Column(Integer, nullable=True)
    heure_arrivee = Column(DateTime, default=datetime.utcnow)
    heure_appel = Column(DateTime, nullable=True)
    notes = Column(String, nullable=True)

    patient = relationship("Patient", backref="file_entrees")
    rendez_vous = relationship("RendezVous", backref="file_entree", uselist=False)


# =====================================================
# EXAMEN MÉDICAL
# =====================================================

class ExamenMedical(Base):
    __tablename__ = "examens"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))

    patient_id = Column(String, ForeignKey("patients.id"), nullable=False)
    cabinet_id = Column(String, ForeignKey("cabinets.id"), nullable=False)
    orthoptiste_id = Column(String, ForeignKey("users.id"), nullable=True)

    type_examen = Column(String, nullable=False)
    description = Column(String, nullable=True)
    resultats = Column(String, nullable=True)

    date_examen = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    fichier_url = Column(String, nullable=True)
    fichier_nom = Column(String, nullable=True)
    fichier_type = Column(String, nullable=True)

    appareil_nom = Column(String, nullable=True)
    appareil_serie = Column(String, nullable=True)
    donnees_brutes = Column(String, nullable=True)

    origine = Column(String, default="manuel")
    statut = Column(String, default="en_attente")

    verifie_par_orthoptiste = Column(Boolean, default=False)

    # Champs dénormalisés pour affichage
    patient_nom = Column(String, nullable=True)
    patient_prenom = Column(String, nullable=True)
    patient_email = Column(String, nullable=True)
    orthoptiste_nom = Column(String, nullable=True)

    patient = relationship("Patient", back_populates="examens")
    orthoptiste = relationship("User", foreign_keys=[orthoptiste_id])

# =====================================================
# PLAGE HORAIRE
# =====================================================

class PlageHoraire(Base):
    __tablename__ = "plages_horaires"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))

    cabinet_id = Column(String, ForeignKey("cabinets.id"), nullable=False)
    user_id = Column(String, ForeignKey("users.id"), nullable=True)

    jour = Column(String, nullable=False)  # ex: "Lundi", "Mardi"
    heure_debut = Column(Time, nullable=False)
    heure_fin = Column(Time, nullable=False)

    actif = Column(Boolean, default=True)