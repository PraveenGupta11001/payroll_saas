from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .routers import employee, attendance, leave, payroll

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Payroll SaaS API")


# CORS (required for frontend)
origins = [
    "http://localhost:3000",   # React dev
    "http://localhost:5173",   # React dev
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
    "*"  # for now (you can restrict later)
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {"message": "Welcome to Payroll SaaS System"}


app.include_router(employee.router)
app.include_router(attendance.router)
app.include_router(leave.router)
app.include_router(payroll.router)