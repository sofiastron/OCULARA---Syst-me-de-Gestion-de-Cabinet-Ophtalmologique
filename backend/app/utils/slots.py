# app/utils/slots.py
from datetime import date, datetime, timedelta
from typing import List
from sqlalchemy.orm import Session
from app.models import PlageHoraire, Creneau
import uuid


def get_day_name_fr(d: date) -> str:
    """Convertit une date Python en nom de jour français majuscule."""
    jours = ["LUNDI", "MARDI", "MERCREDI", "JEUDI", "VENDREDI", "SAMEDI", "DIMANCHE"]
    return jours[d.weekday()]


def get_available_slots(
    db: Session,
    ophtalmologue_id: str,
    target_date: date
) -> List[Creneau]:
    
    jour = get_day_name_fr(target_date)

    # Chercher la plage horaire active pour ce médecin et ce jour
    plage = db.query(PlageHoraire).filter(
        PlageHoraire.ophtalmologue_id == ophtalmologue_id,
        PlageHoraire.jour_semaine == jour,
        PlageHoraire.actif == True
    ).first()

    if not plage:
        return []  # Pas de disponibilité ce jour-là

    # Vérifier si les créneaux sont déjà générés pour cette date
    creneaux_existants = db.query(Creneau).filter(
        Creneau.plage_id == plage.id,
        Creneau.date == target_date
    ).all()

    if not creneaux_existants:
        # Générer et sauvegarder les créneaux
        creneaux_existants = _generer_creneaux(db, plage, target_date)

    # Retourner uniquement les disponibles
    return [c for c in creneaux_existants if c.disponible and c.statut_affichage == "DISPONIBLE"]


def _generer_creneaux(
    db: Session,
    plage: PlageHoraire,
    target_date: date
) -> List[Creneau]:
    """
    Découpe une PlageHoraire en créneaux unitaires et les insère en base.
    Ex : 09h00-12h00 avec 30 min → [09h00, 09h30, 10h00, 10h30, 11h00, 11h30]
    """
    creneaux = []
    duree = timedelta(minutes=plage.duree_creneau_min)

    current = datetime.combine(target_date, plage.heure_debut)
    end = datetime.combine(target_date, plage.heure_fin)

    while current + duree <= end:
        creneau = Creneau(
            id=str(uuid.uuid4()),
            plage_id=str(plage.id),
            ophtalmologue_id=str(plage.ophtalmologue_id),
            date=target_date,
            heure_debut=current.time(),
            heure_fin=(current + duree).time(),
            disponible=True,
            statut_affichage="DISPONIBLE"
        )
        db.add(creneau)
        creneaux.append(creneau)
        current += duree

    db.commit()
    return creneaux