# app/routers/appointments.py
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, date as date_type
import calendar
import uuid

from app.database import get_db
from app.models import Creneau, RendezVous, PlageHoraire
from app.schemas.appointment import (
    AppointmentCreate,
    AppointmentResponse,
    SlotResponse,
    PlageHoraireCreate,
    PlageHoraireOut,
)
from app.utils.slots import get_available_slots
from app.utils.email import send_confirmation_email

router = APIRouter(prefix="/agenda", tags=["Agenda numérique"])
@router.post(
    "/plages-horaires",
    response_model=PlageHoraireOut,
    status_code=201,
    summary="Créer une plage horaire",
    description="L'ophtalmologue définit ses disponibilités. Nécessaire avant de pouvoir avoir des créneaux."
)
def create_plage_horaire(
    doctor_id: str = Query(..., description="ID de l'ophtalmologue"),
    payload: PlageHoraireCreate = ...,
    db: Session = Depends(get_db)
):
    plage = PlageHoraire(
    id=str(uuid.uuid4()),
    ophtalmologue_id=doctor_id,
    jour_semaine=payload.jour_semaine,
    heure_debut=payload.heure_debut,
    heure_fin=payload.heure_fin,
    duree_creneau_min=payload.duree_creneau_min,
    actif=True,
    date_debut_validite=payload.date_debut_validite,
    date_fin_validite=payload.date_fin_validite,
)
    db.add(plage)
    db.commit()
    db.refresh(plage)
    return plage


@router.get(
    "/plages-horaires",
    response_model=list[PlageHoraireOut],
    summary="Lister les plages horaires d'un médecin"
)
def get_plages_horaires(
    doctor_id: str = Query(..., description="ID de l'ophtalmologue"),
    db: Session = Depends(get_db)
):
    return db.query(PlageHoraire).filter(
        PlageHoraire.ophtalmologue_id == doctor_id,
        PlageHoraire.actif == True
    ).all()


@router.get(
    "/available-slots",
    response_model=list[SlotResponse],
    summary="Créneaux disponibles",
    description=(
        "Retourne tous les créneaux libres pour un ophtalmologue et une date. "
        "Si les créneaux n'existent pas encore, ils sont générés automatiquement "
        "depuis la plage horaire du médecin."
    )
)
def get_slots(
    doctor_id: str = Query(..., description="ID de l'ophtalmologue"),
    date: date_type = Query(..., description="Date souhaitée (YYYY-MM-DD)"),
    db: Session = Depends(get_db)
):
    if date < date_type.today():
        raise HTTPException(
            status_code=400,
            detail="La date ne peut pas être dans le passé"
        )

    slots = get_available_slots(db, doctor_id, date)

    return [
        SlotResponse(
            creneau_id=str(s.id),
            date=s.date,
            heure_debut=s.heure_debut,
            heure_fin=s.heure_fin,
            ophtalmologue_id=str(s.ophtalmologue_id)
        )
        for s in slots
    ]

@router.get(
    "/calendar-status",
    summary="Statut des jours du mois",
    description=(
        "Retourne pour chaque jour du mois : disponible (vert), "
        "indisponible (rouge), ou passe. "
        "Utilisé par le frontend React pour colorier le calendrier."
    )
)
def get_calendar_status(
    doctor_id: str = Query(..., description="ID de l'ophtalmologue"),
    year: int = Query(..., description="Année ex: 2025"),
    month: int = Query(..., description="Mois ex: 6"),
    db: Session = Depends(get_db)
):
    _, nb_jours = calendar.monthrange(year, month)
    result = {}

    for jour in range(1, nb_jours + 1):
        d = date_type(year, month, jour)

        if d < date_type.today():
            result[str(d)] = "passe"
            continue

        slots = get_available_slots(db, doctor_id, d)
        result[str(d)] = "disponible" if slots else "indisponible"

    return result

@router.post(
    "/appointments",
    response_model=AppointmentResponse,
    status_code=201,
    summary="Créer un rendez-vous",
    description=(
        "Réserve un créneau pour un patient web anonyme. "
        "Le créneau est bloqué dans la même transaction. "
        "Les tokens cancel_token et token_modification sont auto-générés."
    )
)
def create_appointment(
    payload: AppointmentCreate,
    db: Session = Depends(get_db)
):
    # 1. Vérifier que le créneau existe et appartient à ce médecin
    creneau = db.query(Creneau).filter(
        Creneau.id == payload.creneau_id,
        Creneau.ophtalmologue_id == payload.ophtalmologue_id,
    ).first()

    if not creneau:
        raise HTTPException(
            status_code=404,
            detail="Créneau introuvable pour ce médecin"
        )

    if not creneau.disponible or creneau.statut_affichage != "DISPONIBLE":
        raise HTTPException(
            status_code=409,
            detail="Ce créneau n'est plus disponible"
        )
        
    rdv_existant = db.query(RendezVous).filter(
        RendezVous.creneau_id == payload.creneau_id,
        RendezVous.statut != "ANNULE"
    ).first()

    if rdv_existant:
        raise HTTPException(
            status_code=409,
            detail="Un rendez-vous existe déjà sur ce créneau"
        )

    rdv_datetime = datetime.combine(creneau.date, creneau.heure_debut)
    token_expires = rdv_datetime - timedelta(hours=24)


    rdv = RendezVous(
        id=str(uuid.uuid4()),
        creneau_id=payload.creneau_id,
        ophtalmologue_id=payload.ophtalmologue_id,
        nom_patient=payload.nom_patient,
        prenom_patient=payload.prenom_patient,
        telephone=payload.telephone,
        email_contact=str(payload.email_contact),
        motif=payload.motif,
        source=payload.source or "web",
        statut="EN_ATTENTE",
        token_expires_at=token_expires,
    )
    db.add(rdv)

    creneau.disponible = False
    creneau.statut_affichage = "COMPLET"
    db.commit()
    db.refresh(rdv)

    # Envoi email de confirmation avec liens modifier/annuler
    try:
        from app.models import User, CabinetMedical
        medecin = db.query(User).filter(User.id == rdv.ophtalmologue_id).first()
        medecin_nom = f"Dr {medecin.prenom} {medecin.nom}" if medecin else "Votre médecin"
        cabinet = None
        if medecin and medecin.cabinet_id:
            cabinet = db.query(CabinetMedical).filter(
                CabinetMedical.id == str(medecin.cabinet_id)
            ).first()

        send_confirmation_email(
            to_email=rdv.email_contact,
            nom_patient=rdv.nom_patient,
            prenom_patient=rdv.prenom_patient,
            date_rdv=str(creneau.date),
            heure_rdv=str(creneau.heure_debut)[:5],
            medecin_nom=medecin_nom,
            token_modification=rdv.token_modification,
            cancel_token=rdv.cancel_token,
            cabinet_nom=cabinet.nom if cabinet else None,
        )
    except Exception as e:
        # L'email ne doit PAS faire echouer la reservation
        print(f"[EMAIL] Erreur envoi confirmation : {e}")

    return rdv
