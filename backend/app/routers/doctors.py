from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User
from app.schemas.user import UserOut

router = APIRouter(prefix="/doctors", tags=["Doctors"])


@router.get("", response_model=list[UserOut])
def get_doctors_by_cabinet(
    cabinet_id: str = Query(..., description="ID du cabinet"),
    db: Session = Depends(get_db),
):
    doctors = (
        db.query(User)
        .filter(
            User.cabinet_id == str(cabinet_id),
            User.role == "ophtalmologue",
            User.is_active == True,
        )
        .all()
    )
    return doctors


@router.get("/{doctor_id}", response_model=UserOut)
def get_doctor(doctor_id: str, db: Session = Depends(get_db)):
    doctor = (
        db.query(User)
        .filter(
            User.id == str(doctor_id),
            User.role == "ophtalmologue",
            User.is_active == True,
        )
        .first()
    )
    if not doctor:
        raise HTTPException(status_code=404, detail="Médecin non trouvé")
    return doctor
