from fastapi import FastAPI
from .database import engine, Base
from .routers import employee, attendance, leave, payroll

Base.metadata.create_all(bind=engine)

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "Hello"}

app.include_router(employee.router)
app.include_router(attendance.router)
# app.include_router(leave.router)
# app.include_router(payroll.router)