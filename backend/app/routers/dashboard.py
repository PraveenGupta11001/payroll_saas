from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date, timedelta
from ..utils.auth_utils import get_db, get_current_user, require_org_role
from .. import models

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

# --- Helper ---
_dashboard_viewer = Depends(require_org_role(["OWNER", "MANAGER", "EDITOR"]))

@router.get("/stats/")
def get_dashboard_stats(
    db: Session = Depends(get_db), 
    _membership: models.OrganizationMember = _dashboard_viewer
):
    org_id = _membership.org_id
    today = date.today()

    # 1. Total Employees
    total_employees = db.query(models.Employee).filter(
        models.Employee.org_id == org_id, 
        models.Employee.status == "Active"
    ).count()

    # 2. Today's Attendance
    present_today = db.query(models.Attendance).join(models.Employee).filter(
        models.Employee.org_id == org_id,
        models.Attendance.date == today,
        models.Attendance.status == "Present"
    ).count()

    absent_today = db.query(models.Attendance).join(models.Employee).filter(
        models.Employee.org_id == org_id,
        models.Attendance.date == today,
        models.Attendance.status == "Absent"
    ).count()

    # 3. Pending Leaves
    pending_leaves = db.query(models.Leave).join(models.Employee).filter(
        models.Employee.org_id == org_id,
        models.Leave.status == "Pending"
    ).count()

    # 4. Department Distribution (for charts)
    dept_distribution = db.query(
        models.Department.name, 
        func.count(models.Employee.id).label("count")
    ).join(models.Employee).filter(
        models.Employee.org_id == org_id
    ).group_by(models.Department.name).all()

    dept_stats = [{"name": d.name, "value": d.count} for d in dept_distribution]

    # 5. Attendance Trend (last 7 days)
    attendance_trend = []
    for i in range(6, -1, -1):
        d = today - timedelta(days=i)
        count = db.query(models.Attendance).join(models.Employee).filter(
            models.Employee.org_id == org_id,
            models.Attendance.date == d,
            models.Attendance.status == "Present"
        ).count()
        attendance_trend.append({
            "date": d.strftime("%m-%d"),
            "present": count
        })

    return {
        "total_employees": total_employees,
        "present_today": present_today,
        "absent_today": absent_today,
        "pending_leaves": pending_leaves,
        "department_stats": dept_stats,
        "attendance_trend": attendance_trend
    }
