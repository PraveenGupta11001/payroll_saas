from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .routers import auth, organization, department, employee, attendance, leave, payroll, dashboard, reports, debug
from dotenv import load_dotenv
import os

load_dotenv()

# Create tables in PostgreSQL
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Payroll SaaS API - v2")

# CORS (allow frontend)
# Hardcoding common dev ports + potential production ones
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {
        "message": "Welcome to Payroll SaaS System API v2",
        "status": "Running",
        "database": "PostgreSQL",
        "redis": "Active"
    }

# Include routers
app.include_router(auth.router)
app.include_router(organization.router)
app.include_router(department.router)
app.include_router(employee.router)
app.include_router(attendance.router)
app.include_router(leave.router)
app.include_router(payroll.router)
app.include_router(dashboard.router)
app.include_router(reports.router)
app.include_router(debug.router)