# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import engine
from app.models import Base
from app.routers import user, cabinet, patient, doctors, secretary
from app.routers.appointments import router as agenda_router
from app.routers.gestion_rdv import router as gestion_rdv_router

app = FastAPI()

origins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

app.include_router(user.router)
app.include_router(cabinet.router)
app.include_router(doctors.router)
app.include_router(patient.router)
app.include_router(agenda_router)
app.include_router(gestion_rdv_router)
app.include_router(secretary.router)


@app.get("/")
def root():
    return {"message": "API running"}
