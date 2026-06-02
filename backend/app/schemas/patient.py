from datetime import date, datetime, timedelta
from typing import Optional

from pydantic import BaseModel, EmailStr, validator


class PatientCreate(BaseModel):
    nom: str
    prenom: str
    telephone: Optional[str] = None
    adresse: Optional[str] = None
    sexe: Optional[str] = None
    cabinet_id: Optional[str] = None
    # champs dossier (optionnels à la création)
    date_naissance: Optional[date] = None
    email: Optional[EmailStr] = None
    mutuelle: Optional[str] = None
    antecedents: Optional[str] = None

    @validator("email", pre=True, always=True)
    def normalize_email(cls, value):
        if value in (None, ""):
            return None
        return value

    @validator("date_naissance", pre=True, always=True)
    def normalize_date_naissance(cls, value):
        if value in (None, ""):
            return None
        return value

    @validator("date_naissance")
    def ensure_date_naissance_is_valid(cls, value):
        if value is not None:
            today = date.today()
            if value > today:
                raise ValueError("La date de naissance ne peut pas être postérieure à aujourd'hui.")
            if value > today - timedelta(days=365):
                raise ValueError("Le patient doit avoir au moins 1 an.")
        return value


class PatientUpdate(BaseModel):
    nom: Optional[str] = None
    prenom: Optional[str] = None
    telephone: Optional[str] = None
    adresse: Optional[str] = None
    sexe: Optional[str] = None
    date_naissance: Optional[date] = None
    email: Optional[EmailStr] = None
    mutuelle: Optional[str] = None
    antecedents: Optional[str] = None

    @validator("email", pre=True, always=True)
    def normalize_email(cls, value):
        if value in (None, ""):
            return None
        return value

    @validator("date_naissance", pre=True, always=True)
    def normalize_date_naissance(cls, value):
        if value in (None, ""):
            return None
        return value

    @validator("date_naissance")
    def ensure_date_naissance_is_valid(cls, value):
        if value is not None:
            today = date.today()
            if value > today:
                raise ValueError("La date de naissance ne peut pas être postérieure à aujourd'hui.")
            if value > today - timedelta(days=365):
                raise ValueError("Le patient doit avoir au moins 1 an.")
        return value


class PatientResponse(BaseModel):
    id: str
    nom: str
    prenom: str
    telephone: Optional[str]
    adresse: Optional[str]
    sexe: Optional[str]
    cabinet_id: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class PatientDetailResponse(PatientResponse):
    date_naissance: Optional[date] = None
    email: Optional[EmailStr] = None
    mutuelle: Optional[str] = None
    antecedents: Optional[str] = None
    numero_dossier: Optional[str] = None

    class Config:
        from_attributes = True