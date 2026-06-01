from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.patient import PatientCreate, PatientResponse
from app.services.patient import (
    create_patient,
    get_patients_by_cabinet,
    get_patient
)

router = APIRouter(prefix="/patients", tags=["Patients"])


@router.post("/add", response_model=PatientResponse)
def create_patient_route(data: PatientCreate, db: Session = Depends(get_db)):
    return create_patient(db, data)


@router.get("/cabinet/{cabinet_id}", response_model=list[PatientResponse])
def get_patients_route(cabinet_id: str, db: Session = Depends(get_db)):
    return get_patients_by_cabinet(db, cabinet_id)


@router.get("/{patient_id}", response_model=PatientResponse)
def get_patient_route(patient_id: str, db: Session = Depends(get_db)):
    patient = get_patient(db, patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return patient

