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

STAFF_BY_INDEX = [
    {"nom": "Marouf", "prenom": "Leila", "email": "leila.marouf@ophta.ma", "role": "orthoptiste"},
    {"nom": "Chadli", "prenom": "Zainab", "email": "zainab.chadli@ophta.ma", "role": "secretaire"},
]


def seed():
    db = SessionLocal()
    try:
        cabinets = db.query(CabinetMedical).all()
        if not cabinets:
            print("Aucun cabinet trouvé. Créez d'abord des cabinets via POST /cabinets/add")
            return

        created = 0
        
        # Ajouter les docteurs
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

        # Ajouter le staff (orthoptiste et secrétaire)
        for i, cabinet in enumerate(cabinets):
            for j, staff in enumerate(STAFF_BY_INDEX):
                existing = db.query(User).filter(User.email == staff["email"]).first()
                if existing:
                    print(f"Déjà existant : {staff['email']}")
                    continue

                user = User(
                    nom=staff["nom"],
                    prenom=staff["prenom"],
                    email=staff["email"],
                    password_hash=hash_password("password123"),
                    role=staff["role"],
                    cabinet_id=str(cabinet.id),
                    is_active=True,
                )
                db.add(user)
                created += 1
                print(f"Cree : {staff['role'].capitalize()} {staff['prenom']} {staff['nom']} -> cabinet {cabinet.id} ({cabinet.nom})")

        db.commit()
        print(f"\nTerminé : {created} utilisateur(s) ajouté(s).")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
