from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ExamenCreate(BaseModel):
    patient_id: str
    type_examen: str

    description: Optional[str] = None
    resultats: Optional[str] = None

    date_examen: Optional[datetime] = None

    fichier_url: Optional[str] = None
    fichier_nom: Optional[str] = None
    fichier_type: Optional[str] = None

    appareil_nom: Optional[str] = None
    appareil_serie: Optional[str] = None
    donnees_brutes: Optional[str] = None

    origine: Optional[str] = "manuel"

class ExamenUpdate(BaseModel):
    type_examen: Optional[str] = None
    description: Optional[str] = None
    resultats: Optional[str] = None

    statut: Optional[str] = None
    verifie_par_orthoptiste: Optional[bool] = None

    fichier_url: Optional[str] = None
    fichier_nom: Optional[str] = None
    fichier_type: Optional[str] = None

class ExamenImportAppareil(BaseModel):
    patient_id: str
    type_examen: str

    appareil_nom: str
    appareil_serie: str

    resultats: str
    donnees_brutes: str

    fichier_url: Optional[str] = None
    fichier_nom: Optional[str] = None
    fichier_type: Optional[str] = None

class ExamenStats(BaseModel):
    total: int
    en_attente: int
    importes: int
    verifies: int
    associes: int

    par_type: dict[str, int]

class ExamenResponse(BaseModel):
    id: str
    patient_id: str
    cabinet_id: str
    orthoptiste_id: Optional[str]

    type_examen: str
    description: Optional[str]
    resultats: Optional[str]

    date_examen: datetime
    updated_at: datetime

    fichier_url: Optional[str]
    fichier_nom: Optional[str]
    fichier_type: Optional[str]

    appareil_nom: Optional[str]
    appareil_serie: Optional[str]
    donnees_brutes: Optional[str]

    origine: str
    statut: str
    verifie_par_orthoptiste: bool

    patient_nom: Optional[str] = None
    patient_prenom: Optional[str] = None
    patient_email: Optional[str] = None
    orthoptiste_nom: Optional[str] = None

    class Config:
        from_attributes = True

