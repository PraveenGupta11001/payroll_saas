from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import SessionLocal
from .. import models, schemas

router = APIRouter(prefix="/employees", tags=["Employees"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/")
def create_employee(employee: schemas.EmployeeCreate, db: Session = Depends(get_db)):
    new_emp = models.Employee(**employee.model_dump())
    db.add(new_emp)
    db.commit()
    db.refresh(new_emp)
    return new_emp


@router.get("/")
def get_employees(db: Session = Depends(get_db)):
    return db.query(models.Employee).all()


@router.get("/by_id/{id}")
def get_employee(id: int, db: Session = Depends(get_db)):
    employee = db.query(models.Employee).filter(models.Employee.id == id).first()

    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    return employee

@router.delete("/{id}")
def delete_employee(id: int, db: Session = Depends(get_db)):
    employee = db.query(models.Employee).filter(models.Employee.id == id).first()

    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    db.delete(employee)
    db.commit()

    return {"message": "Employee deleted Succesfully!"}