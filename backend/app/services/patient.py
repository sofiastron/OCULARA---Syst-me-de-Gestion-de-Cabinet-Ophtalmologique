from sqlalchemy.orm import Session
from app.models import Patient
from app.schemas.patient import PatientCreate
import uuid


def create_patient(db: Session, data: PatientCreate):
    patient = Patient(
        id=str(uuid.uuid4()),
        nom=data.nom,
        prenom=data.prenom,
        telephone=data.telephone,
        adresse=data.adresse,
        sexe=data.sexe,
        cabinet_id=data.cabinet_id
    )

    db.add(patient)
    db.commit()
    db.refresh(patient)
    return patient


def get_patients_by_cabinet(db: Session, cabinet_id: str):
    return db.query(Patient).filter(
        Patient.cabinet_id == cabinet_id
    ).all()


def get_patient(db: Session, patient_id: str):
    return db.query(Patient).filter(
        Patient.id == patient_id
    ).first()


