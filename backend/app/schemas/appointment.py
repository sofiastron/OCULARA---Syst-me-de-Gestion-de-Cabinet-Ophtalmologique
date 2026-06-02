# app/schemas/appointment.py
from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional
from datetime import date as DateType, time as TimeType, datetime


class PlageHoraireCreate(BaseModel):
    jour_semaine: str
    heure_debut: TimeType
    heure_fin: TimeType
    duree_creneau_min: int = 30
    date_debut_validite: Optional[DateType] = None
    date_fin_validite: Optional[DateType] = None

    @field_validator("jour_semaine")
    @classmethod
    def valider_jour(cls, v: str) -> str:
        jours_valides = ["LUNDI", "MARDI", "MERCREDI", "JEUDI", "VENDREDI", "SAMEDI", "DIMANCHE"]
        v = v.upper().strip()
        if v not in jours_valides:
            raise ValueError(f"Jour invalide. Valeurs acceptées : {jours_valides}")
        return v

    @field_validator("heure_fin")
    @classmethod
    def fin_apres_debut(cls, heure_fin: TimeType, info) -> TimeType:
        heure_debut = info.data.get("heure_debut")
        if heure_debut and heure_fin <= heure_debut:
            raise ValueError("heure_fin doit être après heure_debut")
        return heure_fin


class PlageHoraireOut(BaseModel):
    id: str
    ophtalmologue_id: str
    jour_semaine: str
    heure_debut: TimeType
    heure_fin: TimeType
    duree_creneau_min: int
    actif: bool

    class Config:
        from_attributes = True


class SlotResponse(BaseModel):
    creneau_id: str
    date: DateType
    heure_debut: TimeType
    heure_fin: TimeType
    ophtalmologue_id: str

    class Config:
        from_attributes = True


class CalendarStatusResponse(BaseModel):
    statuts: dict[str, str]


class AppointmentCreate(BaseModel):
    creneau_id: str
    ophtalmologue_id: str
    nom_patient: str
    prenom_patient: str
    telephone: str
    email_contact: EmailStr
    motif: Optional[str] = None
    source: Optional[str] = "web"

    @field_validator("nom_patient", "prenom_patient", "telephone")
    @classmethod
    def non_vide(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("Ce champ est obligatoire et ne peut pas être vide")
        return v.strip()


class AppointmentResponse(BaseModel):
    id: str
    creneau_id: str
    ophtalmologue_id: str
    nom_patient: Optional[str]
    prenom_patient: Optional[str]
    email_contact: Optional[str]
    telephone: Optional[str]
    statut: str
    source: str
    cancel_token: str
    token_modification: str
    token_expires_at: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True


class AppointmentModify(BaseModel):
    nouveau_creneau_id: Optional[str] = None
    nom_patient: Optional[str] = None
    prenom_patient: Optional[str] = None
    telephone: Optional[str] = None
    email_contact: Optional[EmailStr] = None
    motif: Optional[str] = None

    @field_validator("nom_patient", "prenom_patient", "telephone", mode="before")
    @classmethod
    def non_vide(cls, v):
        if v is not None and not str(v).strip():
            raise ValueError("Ce champ ne peut pas être vide")
        return v.strip() if v is not None else v


class AppointmentModifyResponse(AppointmentResponse):
    class Config:
        from_attributes = True


class AnnulationResponse(BaseModel):
    message: str
    rdv_id: str
    statut: str


AppointmentDetail = AppointmentResponse


class AppointmentDetailResponse(AppointmentResponse):
    rdv_date: Optional[DateType] = Field(default=None, serialization_alias="date")
    heure_debut: Optional[TimeType] = None
    heure_fin: Optional[TimeType] = None

    class Config:
        from_attributes = True
        populate_by_name = True


class SecretaryAppointmentOut(BaseModel):
    id: str
    creneau_id: str
    ophtalmologue_id: str
    cabinet_id: Optional[str] = None
    nom_patient: Optional[str] = None
    prenom_patient: Optional[str] = None
    telephone: Optional[str] = None
    email_contact: Optional[str] = None
    statut: str
    source: str
    motif: Optional[str] = None
    notes_secretaire: Optional[str] = None
    token_expires_at: Optional[datetime] = None
    created_at: datetime
    date: DateType
    heure_debut: TimeType
    heure_fin: TimeType
    medecin_nom: str
    creneau_statut: str
    creneau_disponible: bool


class SecretaryAppointmentUpdate(BaseModel):
    nouveau_creneau_id: Optional[str] = None
    statut: Optional[str] = None
    motif: Optional[str] = None
    notes_secretaire: Optional[str] = None
    nom_patient: Optional[str] = None      
    prenom_patient: Optional[str] = None   
    telephone: Optional[str] = None         
    email_contact: Optional[str] = None     


class SecretaryAppointmentCancel(BaseModel):
    notes_secretaire: Optional[str] = None