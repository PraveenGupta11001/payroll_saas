from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import extract
from datetime import datetime
from ..utils.db_utils import get_db
from .. import models

router = APIRouter(prefix="/payroll", tags=["Payroll"])


@router.get("/{employee_id}")
def calculate_salary(
    employee_id: int,
    month: int = Query(..., ge=1, le=12),
    year: int = Query(..., ge=2000, le=2100),
    db: Session = Depends(get_db)
):

    # Validate employee
    employee = db.query(models.Employee).filter(
        models.Employee.id == employee_id
    ).first()

    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    # Count present days
    present_days = db.query(models.Attendance).filter(
        models.Attendance.employee_id == employee_id,
        models.Attendance.status == "Present",
        extract("month", models.Attendance.date) == month,
        extract("year", models.Attendance.date) == year
    ).count()

    # If no attendance
    if present_days == 0:
        return {
            "employee_id": employee_id,
            "employee_name": employee.name,
            "month": month,
            "year": year,
            "present_days": 0,
            "salary": 0,
            "formula": "No attendance found"
        }

    # Salary calculation
    if employee.salary_type == "Monthly":
        per_day_salary = employee.salary_amount / 30
        total_salary = round(per_day_salary * present_days, 2)

        formula = f"({employee.salary_amount}/30) * {present_days}"

    elif employee.salary_type == "Daily":
        total_salary = round(employee.salary_amount * present_days, 2)

        formula = f"{employee.salary_amount} * {present_days}"

    else:
        raise HTTPException(status_code=400, detail="Invalid salary_type")

    return {
        "employee_id": employee_id,
        "employee_name": employee.name,
        "salary_type": employee.salary_type,
        "month": month,
        "year": year,
        "present_days": present_days,
        "salary": total_salary,
        "formula": formula
    }