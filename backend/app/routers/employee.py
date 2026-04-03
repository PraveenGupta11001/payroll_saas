from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..utils.db_utils import get_db
from .. import models, schemas

router = APIRouter(prefix="/employees", tags=["Employees"])


# Create Employee
@router.post("/")
def create_employee(employee: schemas.EmployeeCreate, db: Session = Depends(get_db)):

    # Basic validation
    if employee.salary_type not in ["Monthly", "Daily"]:
        raise HTTPException(status_code=400, detail="Invalid salary_type")

    if employee.salary_amount <= 0:
        raise HTTPException(status_code=400, detail="Salary must be greater than 0")

    new_emp = models.Employee(
        name=employee.name.strip(),
        role=employee.role.strip(),
        salary_type=employee.salary_type,
        salary_amount=employee.salary_amount
    )

    db.add(new_emp)
    db.commit()
    db.refresh(new_emp)

    return {
        "message": "Employee created",
        "data": new_emp
    }


# Get all employees
@router.get("/")
def get_employees(db: Session = Depends(get_db)):
    return db.query(models.Employee).all()


# Get employee by ID
@router.get("/{id}")
def get_employee(id: int, db: Session = Depends(get_db)):

    employee = db.query(models.Employee).filter(
        models.Employee.id == id
    ).first()

    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    return employee


# Update employee
@router.put("/{id}")
def update_employee(id: int, employee: schemas.EmployeeCreate, db: Session = Depends(get_db)):

    existing = db.query(models.Employee).filter(
        models.Employee.id == id
    ).first()

    if not existing:
        raise HTTPException(status_code=404, detail="Employee not found")

    if employee.salary_type not in ["Monthly", "Daily"]:
        raise HTTPException(status_code=400, detail="Invalid salary_type")

    if employee.salary_amount <= 0:
        raise HTTPException(status_code=400, detail="Salary must be greater than 0")

    existing.name = employee.name.strip()
    existing.role = employee.role.strip()
    existing.salary_type = employee.salary_type
    existing.salary_amount = employee.salary_amount

    db.commit()
    db.refresh(existing)

    return {
        "message": "Employee updated",
        "data": existing
    }


# Delete employee
@router.delete("/{id}")
def delete_employee(id: int, db: Session = Depends(get_db)):

    employee = db.query(models.Employee).filter(
        models.Employee.id == id
    ).first()

    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    # Optional safety: prevent delete if related data exists
    attendance_exists = db.query(models.Attendance).filter(
        models.Attendance.employee_id == id
    ).first()

    if attendance_exists:
        raise HTTPException(
            status_code=400,
            detail="Cannot delete employee with attendance records"
        )

    db.delete(employee)
    db.commit()

    return {
        "message": "Employee deleted successfully"
    }