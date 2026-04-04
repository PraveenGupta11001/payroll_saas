from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import date, timedelta
from ..utils.auth_utils import get_db, get_current_user, require_org_role
from .. import models, schemas

router = APIRouter(prefix="/payroll", tags=["Payroll"])

# --- Helper ---
# Only OWNER and MANAGER are allowed to see payroll for now
_payroll_manager = Depends(require_org_role(["OWNER", "MANAGER"]))

@router.get("/calculate/{employee_id}")
def calculate_monthly_payroll(
    employee_id: int, 
    org_id: int,
    month: int = date.today().month, 
    year: int = date.today().year,
    db: Session = Depends(get_db), 
    _membership: models.OrganizationMember = _payroll_manager
):
    # Verify employee exists and belongs to the organization
    employee = db.query(models.Employee).filter(
        models.Employee.id == employee_id,
        models.Employee.org_id == org_id
    ).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found in this organization")

    # Basic calculation logic for the specific month
    start_date = date(year, month, 1)
    if month == 12:
        end_date = date(year + 1, 1, 1) - timedelta(days=1)
    else:
        end_date = date(year, month + 1, 1) - timedelta(days=1)

    attendance_records = db.query(models.Attendance).filter(
        models.Attendance.employee_id == employee_id,
        models.Attendance.date.between(start_date, end_date)
    ).all()

    present_days = sum(1 for r in attendance_records if r.status == "Present")
    absent_days = sum(1 for r in attendance_records if r.status == "Absent")
    # half_days... logic can be expanded

    # Basic Salary Calculation
    salary_to_pay = 0
    if employee.salary_type == "Monthly":
        # Simplified: (present / total_working_days) * amount
        working_days = 22 # assumed average
        salary_to_pay = (present_days / working_days) * employee.salary_amount
    else:
        # Daily
        salary_to_pay = present_days * employee.salary_amount

    return {
        "employee_id": employee.id,
        "employee_name": employee.name,
        "month": month,
        "year": year,
        "present_days": present_days,
        "absent_days": absent_days,
        "calculated_salary": round(salary_to_pay, 2)
    }

@router.get("/summary/")
def get_payroll_summary(
    org_id: int,
    month: int = date.today().month, 
    year: int = date.today().year,
    db: Session = Depends(get_db), 
    _membership: models.OrganizationMember = _payroll_manager
):
    # Summary of payroll for the entire organization
    employees = db.query(models.Employee).filter(models.Employee.org_id == org_id).all()
    results = []
    total_disbursement = 0
    
    for emp in employees:
        res = calculate_monthly_payroll(emp.id, org_id, month, year, db, _membership)
        results.append(res)
        total_disbursement += res["calculated_salary"]
        
    return {
        "month": month,
        "year": year,
        "total_employees": len(employees),
        "total_disbursement": round(total_disbursement, 2),
        "records": results
    }