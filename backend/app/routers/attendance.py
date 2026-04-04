from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from datetime import date
from ..utils.auth_utils import get_db, get_current_user, require_org_role
from .. import models, schemas

router = APIRouter(prefix="/attendance", tags=["Attendance"])

# --- Helper ---
_attendance_manager = Depends(require_org_role(["OWNER", "MANAGER", "EDITOR"]))

@router.post("/", response_model=schemas.AttendanceOut)
def mark_attendance(
    attendance: schemas.AttendanceCreate, 
    org_id: int, 
    db: Session = Depends(get_db), 
    _membership: models.OrganizationMember = _attendance_manager
):
    # Verify employee exists and belongs to the organization
    employee = db.query(models.Employee).filter(
        models.Employee.id == attendance.employee_id,
        models.Employee.org_id == org_id
    ).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found in this organization")

    # Update or create attendance for the day
    existing = db.query(models.Attendance).filter(
        models.Attendance.employee_id == attendance.employee_id,
        models.Attendance.date == attendance.date
    ).first()

    if existing:
        existing.status = attendance.status
        db.commit()
        db.refresh(existing)
        return existing
    
    new_att = models.Attendance(
        employee_id=attendance.employee_id,
        date=attendance.date,
        status=attendance.status
    )
    db.add(new_att)
    db.commit()
    db.refresh(new_att)
    return new_att

@router.post("/bulk", response_model=list[schemas.AttendanceOut])
def mark_bulk_attendance(
    bulk: schemas.BulkAttendanceCreate, 
    org_id: int, 
    db: Session = Depends(get_db), 
    _membership: models.OrganizationMember = _attendance_manager
):
    results = []
    # Identify all employee IDs in this org for the bulk operation
    org_employee_ids = [e.id for e in db.query(models.Employee).filter(models.Employee.org_id == org_id).all()]
    
    for record in bulk.records:
        if record.employee_id not in org_employee_ids:
            continue
            
        existing = db.query(models.Attendance).filter(
            models.Attendance.employee_id == record.employee_id,
            models.Attendance.date == record.date
        ).first()

        if existing:
            existing.status = record.status
        else:
            existing = models.Attendance(
                employee_id=record.employee_id,
                date=record.date,
                status=record.status
            )
            db.add(existing)
        results.append(existing)
        
    db.commit()
    for r in results:
        db.refresh(r)
    return results

@router.get("/", response_model=list[schemas.AttendanceOut])
def get_attendance(
    org_id: int, 
    date_val: date = Query(default=date.today()), 
    db: Session = Depends(get_db), 
    _membership: models.OrganizationMember = _attendance_manager
):
    return db.query(models.Attendance).join(models.Employee).filter(
        models.Employee.org_id == org_id,
        models.Attendance.date == date_val
    ).all()