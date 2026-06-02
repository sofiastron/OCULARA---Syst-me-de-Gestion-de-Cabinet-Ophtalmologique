from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional

from app.database import get_db
from app.dependencies import get_current_user
from app.schemas.queue import FileAttenteCreate, FileAttenteUpdate, FileAttenteResponse
from app.services import queue as queue_service

router = APIRouter(prefix="/queue", tags=["File d'attente"])


def require_cabinet_staff(current_user=Depends(get_current_user)):
    if current_user.role not in {"secretaire", "ophtalmologue", "orthoptiste", "admin"}:
        raise HTTPException(status_code=403, detail="Accès non autorisé")
    if not current_user.cabinet_id:
        raise HTTPException(status_code=400, detail="Compte non associé à un cabinet")
    return current_user


@router.get("/", response_model=list[FileAttenteResponse])
def get_queue(
    include_termine: bool = Query(False, description="Inclure les patients terminés"),
    db: Session = Depends(get_db),
    current_user=Depends(require_cabinet_staff),
):
    if include_termine:
        return queue_service.get_all_queue_today(db, current_user.cabinet_id)
    return queue_service.get_queue_by_cabinet(db, current_user.cabinet_id)


@router.post("/", response_model=FileAttenteResponse, status_code=201)
def add_to_queue(
    data: FileAttenteCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_cabinet_staff),
):
    data.cabinet_id = current_user.cabinet_id
    return queue_service.add_to_queue(db, data)


@router.put("/{entry_id}", response_model=FileAttenteResponse)
def update_queue_entry(
    entry_id: str,
    data: FileAttenteUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_cabinet_staff),
):
    entry = queue_service.update_queue_entry(db, entry_id, current_user.cabinet_id, data)
    if not entry:
        raise HTTPException(status_code=404, detail="Entrée introuvable ou statut invalide")
    return entry


@router.delete("/{entry_id}", status_code=204)
def remove_from_queue(
    entry_id: str,
    db: Session = Depends(get_db),
    current_user=Depends(require_cabinet_staff),
):
    ok = queue_service.remove_from_queue(db, entry_id, current_user.cabinet_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Entrée introuvable")
