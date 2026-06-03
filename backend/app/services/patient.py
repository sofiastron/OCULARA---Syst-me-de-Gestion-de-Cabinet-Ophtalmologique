from datetime import date
import random
import string
import uuid
from sqlalchemy.orm import Session
from app.models import Patient, DossierPatient
from app.schemas.patient import PatientCreate, PatientUpdate


def _generate_numero_dossier() -> str:
    suffix = ''.join(random.choices(string.digits, k=6))
    return f"PAT-{suffix}"


def _validate_patient_data(db: Session, data, cabinet_id: str, patient_id: str | None = None):
    if data.date_naissance is not None and data.date_naissance > date.today():
        raise ValueError("La date de naissance ne peut pas être postérieure à aujourd'hui.")

    if data.email:
        query = db.query(DossierPatient).filter(DossierPatient.email == data.email)
        if cabinet_id:
            query = query.filter(DossierPatient.cabinet_id == cabinet_id)
        if patient_id:
            query = query.filter(DossierPatient.patient_id != patient_id)
        if query.first():
            raise ValueError("Cet e-mail est déjà utilisé par un autre patient.")


def create_patient(db: Session, data: PatientCreate):
    _validate_patient_data(db, data, data.cabinet_id)

    patient = Patient(
        id=str(uuid.uuid4()),
        nom=data.nom,
        prenom=data.prenom,
        telephone=data.telephone,
        adresse=data.adresse,
        email=data.email,
        sexe=data.sexe,
        cabinet_id=data.cabinet_id,
    )
    db.add(patient)
    db.flush()  # obtenir l'id avant commit

    dossier = DossierPatient(
        id=str(uuid.uuid4()),
        patient_id=patient.id,
        cabinet_id=data.cabinet_id,
        date_naissance=data.date_naissance,
        email=data.email,
        mutuelle=data.mutuelle,
        antecedents=data.antecedents,
        numero_dossier=_generate_numero_dossier(),
    )
    db.add(dossier)
    db.commit()
    db.refresh(patient)
    return patient


def get_patients_by_cabinet(db: Session, cabinet_id: str, search: str = ""):
    query = db.query(Patient).filter(Patient.cabinet_id == cabinet_id)
    if search:
        like = f"%{search}%"
        query = query.filter(
            Patient.nom.ilike(like) |
            Patient.prenom.ilike(like) |
            Patient.telephone.ilike(like)
        )
    return query.order_by(Patient.nom).all()


def get_patient(db: Session, patient_id: str):
    return db.query(Patient).filter(Patient.id == patient_id).first()


def update_patient(db: Session, patient_id: str, data: PatientUpdate):
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        return None

    _validate_patient_data(db, data, patient.cabinet_id, patient_id)

    base_fields = ["nom", "prenom", "telephone", "adresse", "sexe"]
    for field in base_fields:
        val = getattr(data, field, None)
        if val is not None:
            setattr(patient, field, val)
    # allow updating patient.email directly
    if getattr(data, "email", None) is not None:
        patient.email = data.email

    dossier_fields = ["date_naissance", "email", "mutuelle", "antecedents"]
    dossier = db.query(DossierPatient).filter(DossierPatient.patient_id == patient_id).first()
    if dossier:
        for field in dossier_fields:
            val = getattr(data, field, None)
            if val is not None:
                setattr(dossier, field, val)

    # keep dossier email in sync if provided
    if getattr(data, "email", None) is not None and dossier:
        dossier.email = data.email

    db.commit()
    db.refresh(patient)
    return patient


def delete_patient(db: Session, patient_id: str) -> bool:
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        return False
    db.delete(patient)
    db.commit()
    return True


def get_patient_detail(db: Session, patient_id: str):
    """Retourne Patient enrichi avec données du DossierPatient."""
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        return None
    dossier = db.query(DossierPatient).filter(DossierPatient.patient_id == patient_id).first()

    if dossier:
        # only populate missing fields from dossier to avoid overwriting patient-level email
        if not getattr(patient, "date_naissance", None):
            patient.date_naissance = dossier.date_naissance
        if not getattr(patient, "email", None):
            patient.email = dossier.email
        if not getattr(patient, "mutuelle", None):
            patient.mutuelle = dossier.mutuelle
        if not getattr(patient, "antecedents", None):
            patient.antecedents = dossier.antecedents
        if not getattr(patient, "numero_dossier", None):
            patient.numero_dossier = dossier.numero_dossier
    return patient


