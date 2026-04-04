from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import extract
from ..utils.auth_utils import get_db, get_current_user, require_org_role
from .. import models
import csv
import io

router = APIRouter(prefix="/reports", tags=["Reports"])

# --- Helper ---
# Only OWNER and MANAGER can export payroll reports for now
_reports_manager = Depends(require_org_role(["OWNER", "MANAGER"]))

@router.get("/payroll-export/")
def export_payroll_csv(
    db: Session = Depends(get_db), 
    _membership: models.OrganizationMember = _reports_manager,
    month: int = Query(..., ge=1, le=12), 
    year: int = Query(..., ge=2000, le=2100), 
):
    org_id = _membership.org_id
    employees = db.query(models.Employee).filter(
        models.Employee.org_id == org_id,
        models.Employee.status == "Active"
    ).all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Employee ID", "Name", "Role", "Department", "Salary Type", "Salary Amount", "Present Days", "Total Salary", "Month", "Year"])

    for emp in employees:
        present_days = db.query(models.Attendance).filter(
            models.Attendance.employee_id == emp.id,
            models.Attendance.status == "Present",
            extract("month", models.Attendance.date) == month,
            extract("year", models.Attendance.date) == year
        ).count()

        if emp.salary_type == "Monthly":
            # Simplified: (present / 30) * amount
            total_salary = round((emp.salary_amount / 30) * present_days, 2)
        else:
            total_salary = round(emp.salary_amount * present_days, 2)

        dept_name = db.query(models.Department.name).filter(models.Department.id == emp.department_id).scalar() or "N/A"

        writer.writerow([
            emp.id, emp.name, emp.role, dept_name, emp.salary_type, emp.salary_amount, present_days, total_salary, month, year
        ])

    output.seek(0)
    response = StreamingResponse(iter([output.getvalue()]), media_type="text/csv")
    response.headers["Content-Disposition"] = f"attachment; filename=payroll_report_{org_id}_{month}_{year}.csv"
    return response
