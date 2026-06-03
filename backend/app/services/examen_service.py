"""
Service — ExamenMedical
Sprint 4 : Gestion des examens ophtalmologiques
Contient toute la logique métier, indépendante de FastAPI.
"""

from __future__ import annotations

import json
import random
import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy.orm import Session

from app.models import ExamenMedical, Patient
from app.schemas.examen import (
    ExamenCreate,
    ExamenUpdate,
    ExamenImportAppareil,
    ExamenStats,
)


# ═══════════════════════════════════════════════════════════════
# CRUD de base
# ═══════════════════════════════════════════════════════════════

def get_examen(db: Session, examen_id: str) -> Optional[ExamenMedical]:
    examen = db.query(ExamenMedical).filter(ExamenMedical.id == examen_id).first()
    if examen:
        return _enrich(db, examen)
    return None


def get_examens_by_cabinet(
    db: Session,
    cabinet_id: str,
    statut: Optional[str] = None,
    type_examen: Optional[str] = None,
    patient_id: Optional[str] = None,
) -> list[ExamenMedical]:
    q = db.query(ExamenMedical).filter(ExamenMedical.cabinet_id == cabinet_id)
    if statut:
        q = q.filter(ExamenMedical.statut == statut)
    if type_examen:
        q = q.filter(ExamenMedical.type_examen == type_examen)
    if patient_id:
        q = q.filter(ExamenMedical.patient_id == patient_id)
    examens = q.order_by(ExamenMedical.date_examen.desc()).all()
    # Enrichir les examens qui n'ont pas les champs patient/orthoptiste
    return [_enrich(db, e) for e in examens]


def get_examens_by_patient(db: Session, patient_id: str) -> list[ExamenMedical]:
    examens = (
        db.query(ExamenMedical)
        .filter(ExamenMedical.patient_id == patient_id)
        .order_by(ExamenMedical.date_examen.desc())
        .all()
    )
    return [_enrich(db, e) for e in examens]


def create_examen(
    db: Session,
    data: ExamenCreate,
    cabinet_id: str,
    orthoptiste_id: Optional[str] = None,
) -> ExamenMedical:
    # Vérifier que le patient existe et appartient au cabinet
    patient = db.query(Patient).filter(
        Patient.id == data.patient_id,
        Patient.cabinet_id == cabinet_id
    ).first()
    
    if not patient:
        raise ValueError(f"Patient avec l'ID {data.patient_id} n'existe pas dans ce cabinet")
    
    # Récupérer les données du patient et orthoptiste AVANT création
    patient_nom = patient.nom
    patient_prenom = patient.prenom
    patient_email = patient.email
    
    orthoptiste_nom = None
    if orthoptiste_id:
        from app.models import User
        ortho = db.query(User).filter(User.id == orthoptiste_id).first()
        if ortho:
            orthoptiste_nom = f"{ortho.prenom} {ortho.nom}"
    
    examen = ExamenMedical(
        id=str(uuid.uuid4()),
        patient_id=data.patient_id,
        cabinet_id=cabinet_id,
        orthoptiste_id=orthoptiste_id,
        type_examen=data.type_examen,
        description=data.description,
        resultats=data.resultats,
        date_examen=data.date_examen or datetime.utcnow(),
        fichier_url=data.fichier_url,
        fichier_nom=data.fichier_nom,
        fichier_type=data.fichier_type,
        appareil_nom=data.appareil_nom,
        appareil_serie=data.appareil_serie,
        donnees_brutes=data.donnees_brutes,
        origine=data.origine or "manuel",
        statut="en_attente",
        verifie_par_orthoptiste=False,
        # Remplir les champs dénormalisés
        patient_nom=patient_nom,
        patient_prenom=patient_prenom,
        patient_email=patient_email,
        orthoptiste_nom=orthoptiste_nom,
    )
    db.add(examen)
    db.commit()
    db.refresh(examen)
    return examen


def update_examen(
    db: Session,
    examen_id: str,
    cabinet_id: str,
    data: ExamenUpdate,
    current_user_id: Optional[str] = None,
) -> Optional[ExamenMedical]:
    examen = (
        db.query(ExamenMedical)
        .filter(
            ExamenMedical.id == examen_id,
            ExamenMedical.cabinet_id == cabinet_id,
        )
        .first()
    )
    if not examen:
        return None

    update_data = data.model_dump(exclude_unset=True)

    # Si l'orthoptiste marque comme vérifié → statut passe à "verifie"
    if update_data.get("verifie_par_orthoptiste") is True:
        update_data["statut"] = "verifie"
        if current_user_id:
            examen.orthoptiste_id = current_user_id

    for field, value in update_data.items():
        setattr(examen, field, value)

    examen.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(examen)
    return _enrich(db, examen)


def delete_examen(db: Session, examen_id: str, cabinet_id: str) -> bool:
    examen = (
        db.query(ExamenMedical)
        .filter(
            ExamenMedical.id == examen_id,
            ExamenMedical.cabinet_id == cabinet_id,
        )
        .first()
    )
    if not examen:
        return False
    db.delete(examen)
    db.commit()
    return True


def associer_examen(
    db: Session, examen_id: str, cabinet_id: str
) -> Optional[ExamenMedical]:
    """Marque un examen vérifié comme définitivement associé au dossier patient."""
    examen = (
        db.query(ExamenMedical)
        .filter(
            ExamenMedical.id == examen_id,
            ExamenMedical.cabinet_id == cabinet_id,
            ExamenMedical.statut == "verifie",
        )
        .first()
    )
    if not examen:
        return None
    examen.statut = "associe"
    examen.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(examen)
    return _enrich(db, examen)


# ═══════════════════════════════════════════════════════════════
# Import automatique simulé depuis un appareil médical
# ═══════════════════════════════════════════════════════════════

def import_depuis_appareil(
    db: Session,
    data: ExamenImportAppareil,
    cabinet_id: str,
) -> ExamenMedical:
    """
    Simule la réception automatique de données depuis un appareil médical.
    L'examen est créé avec statut 'importe' pour validation par l'orthoptiste.
    """
    examen = ExamenMedical(
        id=str(uuid.uuid4()),
        patient_id=data.patient_id,
        cabinet_id=cabinet_id,
        type_examen=data.type_examen,
        resultats=data.resultats,
        appareil_nom=data.appareil_nom,
        appareil_serie=data.appareil_serie,
        donnees_brutes=data.donnees_brutes,
        fichier_url=data.fichier_url,
        fichier_nom=data.fichier_nom,
        fichier_type=data.fichier_type,
        origine="appareil",
        statut="importe",
        verifie_par_orthoptiste=False,
        date_examen=datetime.utcnow(),
    )
    db.add(examen)
    db.commit()
    db.refresh(examen)
    return _enrich(db, examen)


def simulate_appareil_mock(
    db: Session,
    patient_id: str,
    cabinet_id: str,
    type_examen: str,
) -> ExamenMedical:
    """
    Génère un examen fictif comme s'il venait d'un appareil médical.
    Utilisé pour la démo et les tests du Sprint 4.
    """
    appareils = {
        "OCT": {
            "nom": "Cirrus HD-OCT 6000",
            "serie": f"CIR-{random.randint(1000,9999)}",
            "resultats": "Épaisseur maculaire centrale : 256 µm. Complexe CGI normal. Absence de drusen ou de néovaisseaux.",
        },
        "Tonométrie": {
            "nom": "Tonomètre à aplanation AT 900",
            "serie": f"ATN-{random.randint(1000,9999)}",
            "resultats": f"Œil droit : {random.randint(10,18)} mmHg  |  Œil gauche : {random.randint(10,18)} mmHg. Valeurs dans la norme.",
        },
        "Champ visuel": {
            "nom": "Périmètre Humphrey Field Analyzer II",
            "serie": f"HFA-{random.randint(1000,9999)}",
            "resultats": "MD : -1,2 dB  |  PSD : 1,8 dB. Champ visuel dans les limites normales pour l'âge.",
        },
        "Topographie cornéenne": {
            "nom": "Pentacam HR",
            "serie": f"PTC-{random.randint(1000,9999)}",
            "resultats": "Kmax : 43,2 D. Pachymétrie centrale : 548 µm. Cornée régulière, absence de signe de kératocône.",
        },
        "Réfraction": {
            "nom": "Auto-réfractomètre NIDEK ARK-1s",
            "serie": f"ARK-{random.randint(1000,9999)}",
            "resultats": "OD : -1,50 (-0,25 × 90°)  |  OG : -1,75 (-0,50 × 85°). Acuité corrigée 10/10 bilat.",
        },
        "Fond d'œil": {
            "nom": "Rétinographe non mydriatique Topcon TRC-NW400",
            "serie": f"TRC-{random.randint(1000,9999)}",
            "resultats": "Papille bien délimitée, rapport C/D = 0,3. Macula d'aspect normal. Vaisseaux sans particularité.",
        },
    }

    info = appareils.get(
        type_examen,
        {
            "nom": "Appareil générique",
            "serie": f"GEN-{random.randint(1000,9999)}",
            "resultats": "Résultats normaux. Aucune anomalie détectée.",
        },
    )

    donnees_brutes = json.dumps(
        {
            "appareil": info["nom"],
            "serie": info["serie"],
            "timestamp": datetime.utcnow().isoformat(),
            "mesures": {"statut": "ok", "qualite_signal": f"{random.randint(85,99)}%"},
        },
        ensure_ascii=False,
    )

    payload = ExamenImportAppareil(
        patient_id=patient_id,
        type_examen=type_examen,
        appareil_nom=info["nom"],
        appareil_serie=info["serie"],
        resultats=info["resultats"],
        donnees_brutes=donnees_brutes,
    )

    return import_depuis_appareil(db, payload, cabinet_id)


# ═══════════════════════════════════════════════════════════════
# Statistiques
# ═══════════════════════════════════════════════════════════════

def get_stats(db: Session, cabinet_id: str) -> ExamenStats:
    all_examens = get_examens_by_cabinet(db, cabinet_id)
    par_type: dict[str, int] = {}
    en_attente = importes = verifies = associes = 0

    for e in all_examens:
        par_type[e.type_examen] = par_type.get(e.type_examen, 0) + 1
        if e.statut == "en_attente":
            en_attente += 1
        elif e.statut == "importe":
            importes += 1
        elif e.statut == "verifie":
            verifies += 1
        elif e.statut == "associe":
            associes += 1

    return ExamenStats(
        total=len(all_examens),
        en_attente=en_attente,
        importes=importes,
        verifies=verifies,
        associes=associes,
        par_type=par_type,
    )


# ═══════════════════════════════════════════════════════════════
# Helper interne : enrichit la réponse avec noms patient / ortho
# ═══════════════════════════════════════════════════════════════

def _enrich(db: Session, examen: ExamenMedical) -> ExamenMedical:
    """Attache les noms dénormalisés pour éviter N+1 côté router."""
    try:
        from app.models.patient import Patient  # import local pour éviter les cycles
        patient = db.query(Patient).filter(Patient.id == examen.patient_id).first()
        if patient:
            examen.patient_nom = patient.nom
            examen.patient_prenom = patient.prenom
            examen.patient_email = patient.email
    except Exception:
        pass

    try:
        from app.models import User
        if examen.orthoptiste_id:
            ortho = db.query(User).filter(User.id == examen.orthoptiste_id).first()
            if ortho:
                examen.orthoptiste_nom = f"{ortho.prenom} {ortho.nom}"
    except Exception:
        pass

    return examen