from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.database import get_db
from app.schemas.user import UserCreate, UserOut, UserUpdate
from app.services import user as crud_user
from app.auth import create_access_token
from app.dependencies import get_current_user
from app.models import User

router = APIRouter(prefix="/users", tags=["Users"])


class LoginRequest(BaseModel):
    email: str
    password: str


# =====================================================
# LOGIN  (public)
# =====================================================

@router.post("/login")
def login(data: LoginRequest, db: Session = Depends(get_db)):
    user = crud_user.authenticate_user(db, data.email, data.password)
    if not user:
        raise HTTPException(status_code=401, detail="Email ou mot de passe incorrect")
    token = create_access_token({"sub": str(user.id), "role": user.role})
    return {
        "access_token": token,
        "token_type": "bearer",
        "role": user.role,
        "user": {
            "id": user.id,
            "nom": user.nom,
            "prenom": user.prenom,
            "email": user.email,
            "role": user.role,
        },
    }


# =====================================================
# REGISTER  (ophtalmologue connecté crée secrétaire/orthoptiste)
# =====================================================

@router.post("/register", response_model=UserOut)
def register(
    user: UserCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    cabinet_id = current_user.cabinet_id or user.cabinet_id

    if not cabinet_id:
        raise HTTPException(
            status_code=400,
            detail="Votre compte n'est pas associé à un cabinet."
        )

    db_user = crud_user.get_user_by_email(db, user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email déjà utilisé")

    return crud_user.create_user(db, user, cabinet_id=cabinet_id)


# =====================================================
# GET CURRENT USER
# =====================================================

@router.get("/me")
def get_me(current_user=Depends(get_current_user)):
    return {
        "id": current_user.id,
        "nom": current_user.nom,
        "prenom": current_user.prenom,
        "email": current_user.email,
        "role": current_user.role,
        "cabinet_id": current_user.cabinet_id,
    }


# =====================================================
# MY STAFF
# =====================================================

@router.get("/my-staff", response_model=list[UserOut])
def get_my_staff(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    if not current_user.cabinet_id:
        raise HTTPException(
            status_code=400,
            detail="Votre compte n'est pas associé à un cabinet."
        )
    return (
        db.query(User)
        .filter(
            User.cabinet_id == current_user.cabinet_id,
            User.role.in_(["secretaire", "orthoptiste"]),
        )
        .all()
    )


# =====================================================
# ADMIN — liste tous les users
# =====================================================

def require_admin(current_user=Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Accès réservé aux admins")
    return current_user


@router.get("/admin-list", response_model=list[UserOut])
def admin_get_all_users(
    db: Session = Depends(get_db),
    _=Depends(require_admin),
):
    return crud_user.get_users(db)


# =====================================================
# ADMIN — créer ophtalmologue / admin
# =====================================================

@router.post("/create-admin", response_model=UserOut)
def admin_create_user(
    user: UserCreate,
    db: Session = Depends(get_db),
    # _=Depends(require_admin), 
):
    cab_id = user.cabinet_id if user.cabinet_id and user.cabinet_id.strip() != "" else None

    existing = crud_user.get_user_by_email(db, user.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email déjà utilisé")
 
    created = crud_user.create_user(db, user, cabinet_id=cab_id)
    if not created:
        raise HTTPException(status_code=400, detail="Impossible de créer l'utilisateur")
    return created


# =====================================================
# GET ALL USERS
# =====================================================

@router.get("/", response_model=list[UserOut])
def get_users(db: Session = Depends(get_db)):
    return crud_user.get_users(db)


# =====================================================
# GET USER BY ID
# =====================================================

@router.get("/{user_id}", response_model=UserOut)
def get_user(user_id: str, db: Session = Depends(get_db)):
    db_user = crud_user.get_user(db, user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    return db_user


# =====================================================
# UPDATE USER
# =====================================================
@router.put("/{user_id}", response_model=UserOut)
def update_user(user_id: str, user: UserUpdate, db: Session = Depends(get_db)):
    db_user = crud_user.update_user(db, user_id, user)
    if not db_user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    return db_user

# =====================================================
# DELETE USER
# =====================================================
@router.delete("/{user_id}")
def delete_user(user_id: str, db: Session = Depends(get_db)):
    deleted = crud_user.delete_user(db, user_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    return {"message": "Utilisateur supprimé"}