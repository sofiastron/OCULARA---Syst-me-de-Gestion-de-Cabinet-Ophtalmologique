from pydantic import BaseModel
from datetime import datetime


class CabinetCreate(BaseModel):
    nom: str
    adresse: str
    telephone: str


class CabinetOut(BaseModel):
    id: str
    nom: str
    adresse: str
    telephone: str
    created_at: datetime

    class Config:
        from_attributes = True