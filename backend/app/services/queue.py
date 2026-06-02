from sqlalchemy.orm import Session
from app.models import FileAttente, Patient
from app.schemas.queue import FileAttenteCreate, FileAttenteUpdate
from datetime import datetime
import uuid


VALID_STATUTS = {"EN_ATTENTE", "AVEC_ORTHOPTISTE", "AVEC_OPHTALMOLOGUE", "TERMINE"}


def get_queue_by_cabinet(db: Session, cabinet_id: str):
    entries = (
        db.query(FileAttente)
        .filter(
            FileAttente.cabinet_id == cabinet_id,
            FileAttente.statut != "TERMINE"
        )
        .order_by(FileAttente.ordre.asc().nullslast(), FileAttente.heure_arrivee.asc())
        .all()
    )
    return _enrich(db, entries)


def get_all_queue_today(db: Session, cabinet_id: str):
    """Inclut les TERMINE pour l'historique de la journée."""
    from datetime import date
    today = date.today()
    entries = (
        db.query(FileAttente)
        .filter(
            FileAttente.cabinet_id == cabinet_id,
            FileAttente.heure_arrivee >= datetime.combine(today, datetime.min.time()),
        )
        .order_by(FileAttente.ordre.asc().nullslast(), FileAttente.heure_arrivee.asc())
        .all()
    )
    return _enrich(db, entries)


def add_to_queue(db: Session, data: FileAttenteCreate):
    count = (
        db.query(FileAttente)
        .filter(FileAttente.cabinet_id == data.cabinet_id, FileAttente.statut != "TERMINE")
        .count()
    )
    entry = FileAttente(
        id=str(uuid.uuid4()),
        patient_id=data.patient_id,
        cabinet_id=data.cabinet_id,
        rendez_vous_id=data.rendez_vous_id,
        ordre=count + 1,
        notes=data.notes,
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    patient = db.query(Patient).filter(Patient.id == entry.patient_id).first()
    return _enrich_single(entry, patient)


def update_queue_entry(db: Session, entry_id: str, cabinet_id: str, data: FileAttenteUpdate):
    entry = db.query(FileAttente).filter(
        FileAttente.id == entry_id,
        FileAttente.cabinet_id == cabinet_id
    ).first()
    if not entry:
        return None

    if data.statut:
        new_statut = data.statut.upper()
        if new_statut not in VALID_STATUTS:
            return None
        entry.statut = new_statut
        if new_statut in ("AVEC_ORTHOPTISTE", "AVEC_OPHTALMOLOGUE") and not entry.heure_appel:
            entry.heure_appel = datetime.utcnow()

    if data.ordre is not None:
        entry.ordre = data.ordre
    if data.notes is not None:
        entry.notes = data.notes
    if data.heure_appel is not None:
        entry.heure_appel = data.heure_appel

    db.commit()
    db.refresh(entry)
    patient = db.query(Patient).filter(Patient.id == entry.patient_id).first()
    return _enrich_single(entry, patient)


def remove_from_queue(db: Session, entry_id: str, cabinet_id: str) -> bool:
    entry = db.query(FileAttente).filter(
        FileAttente.id == entry_id,
        FileAttente.cabinet_id == cabinet_id
    ).first()
    if not entry:
        return False
    entry.statut = "TERMINE"
    db.commit()
    return True


def _enrich(db: Session, entries):
    result = []
    for entry in entries:
        patient = db.query(Patient).filter(Patient.id == entry.patient_id).first()
        result.append(_enrich_single(entry, patient))
    return result


def _enrich_single(entry: FileAttente, patient):
    from app.schemas.queue import FileAttenteResponse
    return FileAttenteResponse(
        id=entry.id,
        patient_id=entry.patient_id,
        cabinet_id=entry.cabinet_id,
        rendez_vous_id=entry.rendez_vous_id,
        statut=entry.statut,
        ordre=entry.ordre,
        heure_arrivee=entry.heure_arrivee,
        heure_appel=entry.heure_appel,
        notes=entry.notes,
        patient_nom=patient.nom if patient else None,
        patient_prenom=patient.prenom if patient else None,
        patient_telephone=patient.telephone if patient else None,
    )
