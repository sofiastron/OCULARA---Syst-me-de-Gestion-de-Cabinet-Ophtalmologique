# Backend Gestion Ophtalmologue 

Backend d’une application de gestion pour un cabinet d’ophtalmologie.

---

##  Technologies utilisées

- FastAPI  
- PostgreSQL (en local)

---

##  Installation

```bash
git clone https://github.com/ton-user/back_end_gestion_ophtalmologue.git
cd back_end_gestion_ophtalmologue

## Dépendances installées

pip install fastapi uvicorn sqlalchemy psycopg2-binary python-dotenv python-jose passlib bcrypt email-validator
pip install passlib[argon2]

##Lancer le projet
uvicorn app.main:app --reload

