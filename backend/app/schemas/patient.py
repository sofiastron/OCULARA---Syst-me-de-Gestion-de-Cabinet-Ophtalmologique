from pydantic import BaseModel
from typing import Optional


class PatientCreate(BaseModel):
    nom: str
    prenom: str
    telephone: Optional[str] = None
    adresse: Optional[str] = None
    sexe: Optional[str] = None
    cabinet_id: str


class PatientResponse(BaseModel):
    id: str
    nom: str
    prenom: str
    telephone: Optional[str]
    adresse: Optional[str]
    sexe: Optional[str]
    cabinet_id: str

    class Config:
        from_attributes = True