from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional

from app.database import get_db
from app.dependencies import get_current_user

from app.schemas.examen import (
    ExamenCreate,
    ExamenUpdate,
    ExamenImportAppareil,
    ExamenResponse,
)

from app.services.examen_service import (
    create_examen,
    get_examen,
    get_examens_by_cabinet,
    get_examens_by_patient,
    update_examen,
    delete_examen,
    associer_examen,
    import_depuis_appareil,
    simulate_appareil_mock,
    get_stats,
)

router = APIRouter(prefix="/examens", tags=["Examens"])


# ================= CREATE =================
@router.post("/", response_model=ExamenResponse)
def create_examen_route(
    data: ExamenCreate,
    cabinet_id: str = Query(...),
    orthoptiste_id: Optional[str] = None,
    db: Session = Depends(get_db),
):
    try:
        return create_examen(db, data, cabinet_id, orthoptiste_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


# ================= GET ALL =================
@router.get("/", response_model=list[ExamenResponse])
def get_examens_route(
    cabinet_id: str = Query(...),
    statut: Optional[str] = None,
    type_examen: Optional[str] = None,
    patient_id: Optional[str] = None,
    db: Session = Depends(get_db),
):
    return get_examens_by_cabinet(
        db,
        cabinet_id=cabinet_id,
        statut=statut,
        type_examen=type_examen,
        patient_id=patient_id,
    )


# ================= STATS =================
@router.get("/stats/overview")
def get_stats_route(
    cabinet_id: str = Query(...),
    db: Session = Depends(get_db),
):
    return get_stats(db, cabinet_id)


# ================= BY PATIENT =================
@router.get("/patient/{patient_id}", response_model=list[ExamenResponse])
def get_by_patient(
    patient_id: str,
    db: Session = Depends(get_db),
):
    return get_examens_by_patient(db, patient_id)


# ================= GET ONE =================
@router.get("/{examen_id}", response_model=ExamenResponse)
def get_examen_route(
    examen_id: str,
    db: Session = Depends(get_db),
):
    examen = get_examen(db, examen_id)

    if not examen:
        raise HTTPException(
            status_code=404,
            detail="Examen introuvable"
        )

    return examen


# ================= UPDATE =================
@router.put("/{examen_id}", response_model=ExamenResponse)
def update_examen_route(
    examen_id: str,
    data: ExamenUpdate,
    cabinet_id: str = Query(...),
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    examen = update_examen(
        db=db,
        examen_id=examen_id,
        cabinet_id=cabinet_id,
        data=data,
        current_user_id=current_user.id,
    )

    if not examen:
        raise HTTPException(
            status_code=404,
            detail="Examen introuvable"
        )

    return examen


# ================= DELETE =================
@router.delete("/{examen_id}")
def delete_examen_route(
    examen_id: str,
    cabinet_id: str = Query(...),
    db: Session = Depends(get_db),
):
    success = delete_examen(db, examen_id, cabinet_id)

    if not success:
        raise HTTPException(
            status_code=404,
            detail="Examen introuvable"
        )

    return {"message": "Examen supprimé avec succès"}


# ================= ASSOCIER =================
@router.post("/{examen_id}/associer", response_model=ExamenResponse)
def associer_examen_route(
    examen_id: str,
    cabinet_id: str = Query(...),
    db: Session = Depends(get_db),
):
    examen = associer_examen(db, examen_id, cabinet_id)

    if not examen:
        raise HTTPException(
            status_code=400,
            detail="Examen non vérifié ou introuvable"
        )

    return examen


# ================= IMPORT APPAREIL =================
@router.post("/import", response_model=ExamenResponse)
def import_examen_route(
    data: ExamenImportAppareil,
    cabinet_id: str = Query(...),
    db: Session = Depends(get_db),
):
    return import_depuis_appareil(db, data, cabinet_id)


# ================= SIMULATION =================
@router.post("/simulate", response_model=ExamenResponse)
def simulate_examen_route(
    patient_id: str,
    cabinet_id: str,
    type_examen: str,
    db: Session = Depends(get_db),
):
    return simulate_appareil_mock(
        db,
        patient_id=patient_id,
        cabinet_id=cabinet_id,
        type_examen=type_examen,
    )