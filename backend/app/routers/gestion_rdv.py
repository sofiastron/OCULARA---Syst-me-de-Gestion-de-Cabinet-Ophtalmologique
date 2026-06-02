from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

from app.database import get_db
from app.models import RendezVous, Creneau
from app.schemas.appointment import (
    AppointmentDetailResponse,
    AppointmentModify,
    AppointmentModifyResponse,
    AnnulationResponse,
)
from app.utils.email import send_modification_email, send_cancellation_email

router = APIRouter(prefix="/agenda", tags=["Gestion Rendez-vous"])


# Fonction utilitaire : récupérer un RDV par token et appliquer les règles communes
def get_rdv_or_raise(token: str, db: Session, check_expiry: bool = True) -> RendezVous:
    """
    Cherche un RDV par cancel_token OU token_modification.
    Lève une HTTPException si :
      - token introuvable (404)
      - RDV déjà annulé (409)
      - token expiré (410)
    """
    rdv = db.query(RendezVous).filter(
        (RendezVous.cancel_token == token) |
        (RendezVous.token_modification == token)
    ).first()

    if not rdv:
        raise HTTPException(
            status_code=404,
            detail="Aucun rendez-vous trouvé pour ce token"
        )

    # RDV déjà annulé
    if rdv.statut == "ANNULE":
        raise HTTPException(
            status_code=409,
            detail="Ce rendez-vous est déjà annulé"
        )

    # Token expiré
    if check_expiry and rdv.token_expires_at and datetime.utcnow() > rdv.token_expires_at:
        raise HTTPException(
            status_code=410,
            detail="Ce lien a expiré. Les modifications ne sont plus possibles moins de 24h avant le rendez-vous"
        )

    return rdv


@router.get(
    "/appointments/{token}",
    response_model=AppointmentDetailResponse,
    summary="Récupérer les infos d'un RDV via token",
    description=(
        "Retourne les informations du rendez-vous associé au token "
        "(cancel_token ou token_modification). "
        "Utilisé par le frontend pour afficher la page /rdv/:token."
    )
)
def get_appointment_by_token(
    token: str,
    db: Session = Depends(get_db)
):
    # on ne vérifie pas l'expiry pour que le patient puisse quand même voir son RDV même si les liens sont expirés
    rdv = get_rdv_or_raise(token, db, check_expiry=False)
    creneau = db.query(Creneau).filter(Creneau.id == rdv.creneau_id).first()

    response = AppointmentDetailResponse.model_validate(rdv)
    if creneau:
        response.rdv_date = creneau.date
        response.heure_debut = creneau.heure_debut
        response.heure_fin = creneau.heure_fin
    return response

@router.put(
    "/appointments/{token}/modifier",
    response_model=AppointmentModifyResponse,
    summary="Modifier un RDV (créneau et/ou infos patient)",
    description=(
        "Modifie un rendez-vous existant. "
        "Permet de changer le créneau ET/OU les informations du patient "
        "(nom, prénom, téléphone, email, motif). "
        "Tous les champs sont optionnels — seuls les champs fournis sont mis à jour. "
        "Règles : token valide, non expiré, RDV non annulé."
    )
)
def modifier_appointment(
    token: str,
    payload: AppointmentModify,
    db: Session = Depends(get_db)
):
    rdv = get_rdv_or_raise(token, db, check_expiry=True)

    # Mise à jour des informations du patient (champs optionnels) 
    if payload.nom_patient is not None:
        rdv.nom_patient = payload.nom_patient
    if payload.prenom_patient is not None:
        rdv.prenom_patient = payload.prenom_patient
    if payload.telephone is not None:
        rdv.telephone = payload.telephone
    if payload.email_contact is not None:
        rdv.email_contact = str(payload.email_contact)
    if payload.motif is not None:
        rdv.motif = payload.motif

    # Changement de créneau (optionnel)
    if payload.nouveau_creneau_id is not None:
        nouveau_creneau = db.query(Creneau).filter(
            Creneau.id == payload.nouveau_creneau_id
        ).first()

        if not nouveau_creneau:
            raise HTTPException(
                status_code=404,
                detail="Nouveau créneau introuvable"
            )

        if not nouveau_creneau.disponible or nouveau_creneau.statut_affichage != "DISPONIBLE":
            raise HTTPException(
                status_code=409,
                detail="Ce créneau n'est plus disponible"
            )

        if nouveau_creneau.ophtalmologue_id != rdv.ophtalmologue_id:
            raise HTTPException(
                status_code=400,
                detail="Le nouveau créneau doit appartenir au même médecin"
            )

        # Libérer l'ancien créneau
        ancien_creneau = db.query(Creneau).filter(
            Creneau.id == rdv.creneau_id
        ).first()
        if ancien_creneau:
            ancien_creneau.disponible = True
            ancien_creneau.statut_affichage = "DISPONIBLE"

        # Bloquer le nouveau créneau
        nouveau_creneau.disponible = False
        nouveau_creneau.statut_affichage = "COMPLET"

        # Mettre à jour le créneau du RDV et recalculer l'expiration
        rdv.creneau_id = nouveau_creneau.id
        nouveau_rdv_datetime = datetime.combine(nouveau_creneau.date, nouveau_creneau.heure_debut)
        rdv.token_expires_at = nouveau_rdv_datetime - timedelta(hours=24)

    rdv.statut = "EN_ATTENTE"
    db.commit()
    db.refresh(rdv)

    # Envoi email de modification
    try:
        from app.models import User, CabinetMedical
        medecin = db.query(User).filter(User.id == rdv.ophtalmologue_id).first()
        medecin_nom = f"Dr {medecin.prenom} {medecin.nom}" if medecin else "Votre médecin"
        cabinet = None
        if medecin and medecin.cabinet_id:
            cabinet = db.query(CabinetMedical).filter(
                CabinetMedical.id == str(medecin.cabinet_id)
            ).first()

        send_modification_email(
            to_email=rdv.email_contact,
            nom_patient=rdv.nom_patient,
            prenom_patient=rdv.prenom_patient,
            date_rdv=str(nouveau_creneau.date),
            heure_rdv=str(nouveau_creneau.heure_debut)[:5],
            medecin_nom=medecin_nom,
            token_modification=rdv.token_modification,
            cancel_token=rdv.cancel_token,
            cabinet_nom=cabinet.nom if cabinet else None,
        )
    except Exception as e:
        print(f"[EMAIL] Erreur envoi modification : {e}")

    return rdv


@router.delete(
    "/appointments/{token}/annuler",
    response_model=AnnulationResponse,
    summary="Annuler un rendez-vous",
    description=(
        "Annule un rendez-vous et libère le créneau. "
        "Règles : token valide, non expiré, RDV non annulé, "
        "et rendez-vous à plus de 24h."
    )
)
def annuler_appointment(
    token: str,
    db: Session = Depends(get_db)
):
    rdv = get_rdv_or_raise(token, db, check_expiry=True)

    # annulation moins de 24h avant le RDV refusée
    creneau = db.query(Creneau).filter(Creneau.id == rdv.creneau_id).first()
    if creneau:
        rdv_datetime = datetime.combine(creneau.date, creneau.heure_debut)
        if datetime.utcnow() > rdv_datetime - timedelta(hours=24):
            raise HTTPException(
                status_code=403,
                detail="Annulation impossible : le rendez-vous est dans moins de 24h. Veuillez appeler le cabinet."
            )

        # Libérer le créneau
        creneau.disponible = True
        creneau.statut_affichage = "DISPONIBLE"

    # Marquer le RDV comme annulé
    rdv.statut = "ANNULE"

    db.commit()

    # Envoi email d'annulation
    try:
        from app.models import User, CabinetMedical
        medecin = db.query(User).filter(User.id == rdv.ophtalmologue_id).first()
        medecin_nom = f"Dr {medecin.prenom} {medecin.nom}" if medecin else "Votre médecin"
        cabinet = None
        if medecin and medecin.cabinet_id:
            cabinet = db.query(CabinetMedical).filter(
                CabinetMedical.id == str(medecin.cabinet_id)
            ).first()

        send_cancellation_email(
            to_email=rdv.email_contact,
            nom_patient=rdv.nom_patient,
            prenom_patient=rdv.prenom_patient,
            date_rdv=str(creneau.date) if creneau else "",
            heure_rdv=str(creneau.heure_debut)[:5] if creneau else "",
            medecin_nom=medecin_nom,
            cabinet_nom=cabinet.nom if cabinet else None,
        )
    except Exception as e:
        print(f"[EMAIL] Erreur envoi annulation : {e}")

    return AnnulationResponse(
        message="Rendez-vous annulé avec succès",
        rdv_id=rdv.id,
        statut=rdv.statut
    )