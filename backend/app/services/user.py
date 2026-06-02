from sqlalchemy.orm import Session
from app.models import User
from app.schemas.user import UserCreate, UserUpdate
from app.auth import hash_password, verify_password


def get_user(db: Session, user_id: str):
    return db.query(User).filter(User.id == user_id).first()


def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()


def get_users(db: Session):
    return db.query(User).all()


def create_user(db: Session, user: UserCreate, cabinet_id: str = None):
    existing_user = get_user_by_email(db, user.email)
    if existing_user:
        return None

    db_user = User(
        nom=user.nom,
        prenom=user.prenom,
        email=user.email,
        password_hash=hash_password(user.password),
        role=user.role,
        specialite=user.specialite,
        cabinet_id=cabinet_id if cabinet_id else user.cabinet_id,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def authenticate_user(db: Session, email: str, password: str):
    user = get_user_by_email(db, email)
    if not user:
        return None
    if not verify_password(password, user.password_hash):
        return None
    return user


def update_user(db: Session, user_id: str, user: UserUpdate):
    db_user = get_user(db, user_id)
    if not db_user:
        return None

    if hasattr(user, 'nom') and user.nom is not None:
        db_user.nom = user.nom
    if hasattr(user, 'prenom') and user.prenom is not None:
        db_user.prenom = user.prenom
    if hasattr(user, 'email') and user.email is not None:
        db_user.email = user.email
    if hasattr(user, 'password') and user.password is not None:
        db_user.password_hash = hash_password(user.password)
    if hasattr(user, 'role') and user.role is not None:
        db_user.role = user.role
    if hasattr(user, 'specialite') and user.specialite is not None:
        db_user.specialite = user.specialite
    if hasattr(user, 'cabinet_id') and user.cabinet_id is not None:
        db_user.cabinet_id = user.cabinet_id

    db.commit()
    db.refresh(db_user)
    return db_user


def delete_user(db: Session, user_id: str):
    db_user = get_user(db, user_id)
    if not db_user:
        return False
    db.delete(db_user)
    db.commit()
    return True