from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class FileAttenteCreate(BaseModel):
    patient_id: str
    cabinet_id: str
    rendez_vous_id: Optional[str] = None
    notes: Optional[str] = None


class FileAttenteUpdate(BaseModel):
    statut: Optional[str] = None
    ordre: Optional[int] = None
    notes: Optional[str] = None
    heure_appel: Optional[datetime] = None


class FileAttenteResponse(BaseModel):
    id: str
    patient_id: str
    cabinet_id: str
    rendez_vous_id: Optional[str] = None
    statut: str
    ordre: Optional[int] = None
    heure_arrivee: Optional[datetime] = None
    heure_appel: Optional[datetime] = None
    notes: Optional[str] = None
    # données patient enrichies
    patient_nom: Optional[str] = None
    patient_prenom: Optional[str] = None
    patient_telephone: Optional[str] = None

    class Config:
        from_attributes = True
