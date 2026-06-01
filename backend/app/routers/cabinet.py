from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db

from app.schemas.cabinet import (
    CabinetCreate,
    CabinetOut
)

from app.services import cabinet as crud_cabinet

router = APIRouter(
    prefix="/cabinets",
    tags=["Cabinets"]
)



#============= ajouter cabinet=====
@router.post( "/add", response_model=CabinetOut)
def create_cabinet(cabinet: CabinetCreate,db: Session = Depends(get_db)):

    return crud_cabinet.create_cabinet(
        db,
        cabinet
    )

#====== get all cabinets========
@router.get( "/", response_model=list[CabinetOut])
def get_cabinets(db: Session = Depends(get_db)):

    return crud_cabinet.get_cabinets(db)



#============= get cabinet by id======
@router.get("/{cabinet_id}",response_model=CabinetOut)
def get_cabinet( cabinet_id: str,db: Session = Depends(get_db)):

    cabinet = crud_cabinet.get_cabinet(
        db,
        cabinet_id
    )

    if not cabinet:
        raise HTTPException(
            status_code=404,
            detail="Cabinet non trouvé"
        )

    return cabinet


