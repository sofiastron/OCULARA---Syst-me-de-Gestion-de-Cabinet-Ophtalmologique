from sqlalchemy.orm import Session

from app.models import CabinetMedical
from app.schemas.cabinet import CabinetCreate


def create_cabinet( db: Session, cabinet: CabinetCreate):

    db_cabinet = CabinetMedical(
        nom=cabinet.nom,
        adresse=cabinet.adresse,
        telephone=cabinet.telephone
    )

    db.add(db_cabinet)

    db.commit()

    db.refresh(db_cabinet)

    return db_cabinet


def get_cabinets(db: Session):

    return db.query(CabinetMedical).all()


def get_cabinet(db: Session, cabinet_id: str):

    return db.query(CabinetMedical).filter(
        CabinetMedical.id == cabinet_id
    ).first()




