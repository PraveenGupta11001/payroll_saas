from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from ..utils.auth_utils import get_db, get_current_user, require_org_role
from .. import models, schemas

router = APIRouter(prefix="/employees", tags=["Employees"])

# --- Helper ---
# Any of the 3 roles can manage employees.
_employee_manager = Depends(require_org_role(["OWNER", "MANAGER", "EDITOR"]))

# Create Employee
@router.post("/", response_model=schemas.EmployeeOut)
def create_employee(
    employee: schemas.EmployeeCreate, 
    org_id: int, 
    db: Session = Depends(get_db), 
    _membership: models.OrganizationMember = _employee_manager
):
    # Verify department belongs to org if provided
    if employee.department_id:
        dept = db.query(models.Department).filter(
            models.Department.id == employee.department_id,
            models.Department.org_id == org_id
        ).first()
        if not dept:
            raise HTTPException(status_code=404, detail="Department not found in this organization")

    new_emp = models.Employee(
        name=employee.name.strip(),
        email=employee.email,
        phone=employee.phone,
        role=employee.role.strip(),
        department_id=employee.department_id,
        org_id=org_id,
        salary_type=employee.salary_type,
        salary_amount=employee.salary_amount,
        join_date=employee.join_date,
        status=employee.status
    )

    db.add(new_emp)
    db.commit()
    db.refresh(new_emp)
    return new_emp

# Get all employees for an organization
@router.get("/", response_model=list[schemas.EmployeeOut])
def get_employees(
    org_id: int, 
    db: Session = Depends(get_db), 
    _membership: models.OrganizationMember = _employee_manager
):
    return db.query(models.Employee).filter(models.Employee.org_id == org_id).all()

# Get employee by ID
@router.get("/{id}", response_model=schemas.EmployeeOut)
def get_employee(
    id: int, 
    org_id: int,
    db: Session = Depends(get_db), 
    _membership: models.OrganizationMember = _employee_manager
):
    employee = db.query(models.Employee).filter(
        models.Employee.id == id,
        models.Employee.org_id == org_id
    ).first()

    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    return employee

# Update employee
@router.put("/{id}", response_model=schemas.EmployeeOut)
def update_employee(
    id: int, 
    org_id: int,
    employee: schemas.EmployeeCreate, 
    db: Session = Depends(get_db), 
    _membership: models.OrganizationMember = _employee_manager
):
    existing = db.query(models.Employee).filter(
        models.Employee.id == id,
        models.Employee.org_id == org_id
    ).first()

    if not existing:
        raise HTTPException(status_code=404, detail="Employee not found")

    # Verify department belongs to the same org
    if employee.department_id:
        dept = db.query(models.Department).filter(
            models.Department.id == employee.department_id,
            models.Department.org_id == org_id
        ).first()
        if not dept:
            raise HTTPException(status_code=404, detail="Department not found in this organization")

    existing.name = employee.name.strip()
    existing.email = employee.email
    existing.phone = employee.phone
    existing.role = employee.role.strip()
    existing.department_id = employee.department_id
    existing.salary_type = employee.salary_type
    existing.salary_amount = employee.salary_amount
    existing.join_date = employee.join_date
    existing.status = employee.status

    db.commit()
    db.refresh(existing)
    return existing

# Delete employee
@router.delete("/{id}")
def delete_employee(
    id: int, 
    org_id: int,
    db: Session = Depends(get_db), 
    _membership: models.OrganizationMember = _employee_manager
):
    employee = db.query(models.Employee).filter(
        models.Employee.id == id,
        models.Employee.org_id == org_id
    ).first()

    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    db.delete(employee)
    db.commit()
    return {"message": "Employee deleted successfully"}