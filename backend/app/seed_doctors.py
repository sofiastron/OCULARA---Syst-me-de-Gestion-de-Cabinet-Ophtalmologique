"""
Script de seed — ajoute un médecin de test par cabinet existant.

Usage (depuis le dossier backend/) :
    python -m app.seed_doctors
"""
from app.auth import hash_password
from app.database import SessionLocal
from app.models import CabinetMedical, User

DOCTORS_BY_INDEX = [
    {"nom": "Smiri", "prenom": "Karim", "email": "k.smiri@ophta.ma", "specialite": "Ophtalmologie générale"},
    {"nom": "Benali", "prenom": "Fatima", "email": "f.benali@ophta.ma", "specialite": "Rétine et macula"},
    {"nom": "Alaoui", "prenom": "Youssef", "email": "y.alaoui@ophta.ma", "specialite": "Glaucome"},
]


def seed():
    db = SessionLocal()
    try:
        cabinets = db.query(CabinetMedical).all()
        if not cabinets:
            print("Aucun cabinet trouvé. Créez d'abord des cabinets via POST /cabinets/add")
            return

        created = 0
        for i, cabinet in enumerate(cabinets):
            doc = DOCTORS_BY_INDEX[i] if i < len(DOCTORS_BY_INDEX) else {
                "nom": f"Docteur{i + 1}",
                "prenom": "Test",
                "email": f"docteur{i + 1}@ophta.ma",
                "specialite": "Ophtalmologie",
            }

            existing = db.query(User).filter(User.email == doc["email"]).first()
            if existing:
                print(f"Déjà existant : {doc['email']}")
                continue

            user = User(
                nom=doc["nom"],
                prenom=doc["prenom"],
                email=doc["email"],
                password_hash=hash_password("password123"),
                role="ophtalmologue",
                specialite=doc["specialite"],
                cabinet_id=str(cabinet.id),
                is_active=True,
            )
            db.add(user)
            created += 1
            print(f"Cree : Dr {doc['prenom']} {doc['nom']} -> cabinet {cabinet.id} ({cabinet.nom})")

        db.commit()
        print(f"\nTerminé : {created} médecin(s) ajouté(s).")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
