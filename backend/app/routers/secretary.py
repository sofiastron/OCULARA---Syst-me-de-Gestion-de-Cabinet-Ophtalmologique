from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models import Creneau, RendezVous, User
from app.schemas.appointment import (
    AnnulationResponse,
    SecretaryAppointmentCancel,
    SecretaryAppointmentOut,
    SecretaryAppointmentUpdate,
)

router = APIRouter(
    prefix="/agenda/secretary",
    tags=["Secretaire - Rendez-vous"],
)

ALLOWED_STATUS = {"EN_ATTENTE", "ACTIF", "ATTEINT", "ANNULE"}


def require_secretary_access(current_user=Depends(get_current_user)):
    if current_user.role not in {"secretaire", "ophtalmologue"}:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acces reserve au personnel du cabinet",
        )

    if not current_user.cabinet_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Votre compte n'est pas associe a un cabinet",
        )

    return current_user


def serialize_rdv(rdv: RendezVous, creneau: Creneau, medecin: User) -> SecretaryAppointmentOut:
    return SecretaryAppointmentOut(
        id=rdv.id,
        creneau_id=rdv.creneau_id,
        ophtalmologue_id=rdv.ophtalmologue_id,
        cabinet_id=rdv.cabinet_id,
        nom_patient=rdv.nom_patient,
        prenom_patient=rdv.prenom_patient,
        telephone=rdv.telephone,
        email_contact=rdv.email_contact,
        statut=rdv.statut,
        source=rdv.source,
        motif=rdv.motif,
        notes_secretaire=rdv.notes_secretaire,
        token_expires_at=rdv.token_expires_at,
        created_at=rdv.created_at,
        date=creneau.date,
        heure_debut=creneau.heure_debut,
        heure_fin=creneau.heure_fin,
        medecin_nom=f"Dr {medecin.prenom} {medecin.nom}",
        creneau_statut=creneau.statut_affichage,
        creneau_disponible=creneau.disponible,
    )


def get_rdv_for_current_cabinet(
    db: Session,
    rdv_id: str,
    current_user: User,
) -> tuple[RendezVous, Creneau, User]:
    result = (
        db.query(RendezVous, Creneau, User)
        .join(Creneau, RendezVous.creneau_id == Creneau.id)
        .join(User, RendezVous.ophtalmologue_id == User.id)
        .filter(RendezVous.id == rdv_id, User.cabinet_id == current_user.cabinet_id)
        .first()
    )

    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Rendez-vous introuvable dans votre cabinet",
        )

    return result


@router.get(
    "/appointments",
    response_model=list[SecretaryAppointmentOut],
    summary="Lister les rendez-vous du cabinet",
)
def list_cabinet_appointments(
    statut: str | None = Query(None, description="Filtrer par statut"),
    source: str | None = Query(None, description="Filtrer par source: web, cabinet, telephone"),
    db: Session = Depends(get_db),
    current_user=Depends(require_secretary_access),
):
    query = (
        db.query(RendezVous, Creneau, User)
        .join(Creneau, RendezVous.creneau_id == Creneau.id)
        .join(User, RendezVous.ophtalmologue_id == User.id)
        .filter(User.cabinet_id == current_user.cabinet_id)
        .order_by(Creneau.date.asc(), Creneau.heure_debut.asc())
    )

    if statut:
        query = query.filter(RendezVous.statut == statut.upper())

    if source:
        query = query.filter(RendezVous.source == source.lower())

    return [serialize_rdv(rdv, creneau, medecin) for rdv, creneau, medecin in query.all()]


@router.put(
    "/appointments/{rdv_id}",
    response_model=SecretaryAppointmentOut,
    summary="Modifier un rendez-vous sans token patient",
)
def update_cabinet_appointment(
    rdv_id: str,
    payload: SecretaryAppointmentUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_secretary_access),
):
    rdv, ancien_creneau, medecin = get_rdv_for_current_cabinet(db, rdv_id, current_user)

    if payload.statut:
        new_status = payload.statut.upper()
        if new_status not in ALLOWED_STATUS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Statut invalide. Valeurs acceptees: {sorted(ALLOWED_STATUS)}",
            )
        rdv.statut = new_status

    if payload.motif is not None:
        rdv.motif = payload.motif

    if payload.notes_secretaire is not None:
        rdv.notes_secretaire = payload.notes_secretaire

    if payload.nom_patient is not None:
        rdv.nom_patient = payload.nom_patient

    if payload.prenom_patient is not None:
        rdv.prenom_patient = payload.prenom_patient

    if payload.telephone is not None:
        rdv.telephone = payload.telephone

    if payload.email_contact is not None:
        rdv.email_contact = payload.email_contact

    nouveau_creneau = ancien_creneau
    if payload.nouveau_creneau_id and payload.nouveau_creneau_id != rdv.creneau_id:
        if rdv.statut == "ANNULE":
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Impossible de deplacer un rendez-vous annule",
            )

        nouveau_creneau = (
            db.query(Creneau)
            .filter(
                Creneau.id == payload.nouveau_creneau_id,
                Creneau.ophtalmologue_id == rdv.ophtalmologue_id,
            )
            .first()
        )

        if not nouveau_creneau:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Nouveau creneau introuvable pour ce medecin",
            )

        if not nouveau_creneau.disponible or nouveau_creneau.statut_affichage != "DISPONIBLE":
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Ce creneau n'est plus disponible",
            )

        ancien_creneau.disponible = True
        ancien_creneau.statut_affichage = "DISPONIBLE"
        nouveau_creneau.disponible = False
        nouveau_creneau.statut_affichage = "COMPLET"

        rdv.creneau_id = nouveau_creneau.id
        rdv.token_expires_at = datetime.combine(
            nouveau_creneau.date,
            nouveau_creneau.heure_debut,
        ) - timedelta(hours=24)

    if rdv.statut == "ANNULE":
        nouveau_creneau.disponible = True
        nouveau_creneau.statut_affichage = "DISPONIBLE"

    db.commit()
    db.refresh(rdv)
    db.refresh(nouveau_creneau)

    return serialize_rdv(rdv, nouveau_creneau, medecin)


@router.delete(
    "/appointments/{rdv_id}/annuler",
    response_model=AnnulationResponse,
    summary="Annuler un rendez-vous sans token patient",
)
def cancel_cabinet_appointment(
    rdv_id: str,
    payload: SecretaryAppointmentCancel | None = None,
    db: Session = Depends(get_db),
    current_user=Depends(require_secretary_access),
):
    rdv, creneau, _ = get_rdv_for_current_cabinet(db, rdv_id, current_user)

    if rdv.statut == "ANNULE":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ce rendez-vous est deja annule",
        )

    creneau.disponible = True
    creneau.statut_affichage = "DISPONIBLE"
    rdv.statut = "ANNULE"

    if payload and payload.notes_secretaire is not None:
        rdv.notes_secretaire = payload.notes_secretaire

    db.commit()

    return AnnulationResponse(
        message="Rendez-vous annule par le secretariat",
        rdv_id=rdv.id,
        statut=rdv.statut,
    )
