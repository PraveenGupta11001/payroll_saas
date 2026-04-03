from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..utils.db_utils import get_db
from .. import models, schemas

router = APIRouter(prefix="/attendance", tags=["Attendance"])

@router.post("/")
def mark_attendance(attendance: schemas.AttendanceCreate, db: Session = Depends(get_db)):

    # Check employee exists
    employee = db.query(models.Employee).filter(
        models.Employee.id == attendance.employee_id
    ).first()

    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    existing = db.query(models.Attendance).filter(
        models.Attendance.employee_id == attendance.employee_id,
        models.Attendance.date == attendance.date
    ).first()

    # UPDATE if exists
    if existing:
        existing.status = attendance.status.value
        db.commit()
        db.refresh(existing)

        return {
            "message": "Attendance updated",
            "data": existing
        }

    # CREATE if not exists
    record = models.Attendance(
        employee_id=attendance.employee_id,
        date=attendance.date,
        status=attendance.status.value
    )

    db.add(record)
    db.commit()
    db.refresh(record)

    return {
        "message": "Attendance created",
        "data": record
    }


# BULK Attendance API (CREATE + UPDATE)
@router.post("/bulk")
def bulk_attendance(data: schemas.BulkAttendanceCreate, db: Session = Depends(get_db)):

    created = 0
    updated = 0
    skipped = 0

    for item in data.records:

        # Validate employee exists
        employee = db.query(models.Employee).filter(
            models.Employee.id == item.employee_id
        ).first()

        if not employee:
            skipped += 1
            continue

        # Check existing record
        existing = db.query(models.Attendance).filter(
            models.Attendance.employee_id == item.employee_id,
            models.Attendance.date == item.date
        ).first()

        # Update
        if existing:
            existing.status = item.status.value
            updated += 1

        # Create
        else:
            record = models.Attendance(
                employee_id=item.employee_id,
                date=item.date,
                status=item.status.value
            )
            db.add(record)
            created += 1

    db.commit()

    return {
        "message": "Bulk attendance processed",
        "created": created,
        "updated": updated,
        "skipped_invalid_employees": skipped
    }


# Get all attendance records
@router.get("/")
def get_all_attendance(db: Session = Depends(get_db)):
    return db.query(models.Attendance).all()


# Get Attendance by Employee ID
@router.get("/{employee_id}")
def get_attendance(employee_id: int, db: Session = Depends(get_db)):

    records = db.query(models.Attendance).filter(
        models.Attendance.employee_id == employee_id
    ).all()

    return records