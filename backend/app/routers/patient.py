import logging

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional

from app.database import get_db
from app.dependencies import get_current_user
from app.schemas.patient import (
    PatientCreate,
    PatientUpdate,
    PatientResponse,
    PatientDetailResponse,
)
from app.services.patient import (
    create_patient,
    get_patients_by_cabinet,
    get_patient,
    get_patient_detail,
    update_patient,
    delete_patient,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/patients", tags=["Patients"])


def require_cabinet_staff(current_user=Depends(get_current_user)):
    """Secrétaire, orthoptiste ou ophtalmologue du cabinet."""
    if current_user.role not in {"secretaire", "ophtalmologue", "orthoptiste", "admin"}:
        raise HTTPException(status_code=403, detail="Accès non autorisé")
    if not current_user.cabinet_id:
        raise HTTPException(status_code=400, detail="Compte non associé à un cabinet")
    return current_user


@router.post("/add", response_model=PatientResponse, status_code=201)
def create_patient_route(
    data: PatientCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_cabinet_staff),
):
    if not current_user.cabinet_id:
        raise HTTPException(status_code=400, detail="Aucun cabinet associé à l'utilisateur connecté.")

    data.cabinet_id = current_user.cabinet_id
    logger.info("Création patient payload: %s", data.dict())
    try:
        return create_patient(db, data)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.get("/cabinet/{cabinet_id}", response_model=list[PatientResponse])
def get_patients_route(
    cabinet_id: str,
    search: Optional[str] = Query(None, description="Recherche par nom / prénom / téléphone"),
    db: Session = Depends(get_db),
    current_user=Depends(require_cabinet_staff),
):
    # 🔐 sécurité cabinet
    if cabinet_id != current_user.cabinet_id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Accès interdit")

    return get_patients_by_cabinet(db, cabinet_id, search or "")


@router.get("/my-patients", response_model=list[PatientResponse])
def get_my_patients(
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user=Depends(require_cabinet_staff),
):
    return get_patients_by_cabinet(db, current_user.cabinet_id, search or "")


@router.get("/{patient_id}", response_model=PatientDetailResponse)
def get_patient_route(
    patient_id: str,
    db: Session = Depends(get_db),
    current_user=Depends(require_cabinet_staff),
):
    patient = get_patient_detail(db, patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient introuvable")
    return patient


@router.put("/{patient_id}", response_model=PatientDetailResponse)
def update_patient_route(
    patient_id: str,
    data: PatientUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_cabinet_staff),
):
    logger.info("Mise à jour patient %s payload: %s", patient_id, data.dict())
    try:
        patient = update_patient(db, patient_id, data)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    if not patient:
        raise HTTPException(status_code=404, detail="Patient introuvable")
    return get_patient_detail(db, patient_id)


@router.delete("/{patient_id}", status_code=204)
def delete_patient_route(
    patient_id: str,
    db: Session = Depends(get_db),
    current_user=Depends(require_cabinet_staff),
):
    ok = delete_patient(db, patient_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Patient introuvable")
