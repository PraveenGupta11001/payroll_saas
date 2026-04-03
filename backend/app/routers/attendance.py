from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import SessionLocal
from .. import models, schemas

router = APIRouter(prefix="/attendance", tags=["Attendance"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Single Attendance API
@router.post("/")
def mark_attendance(attendance: schemas.AttendanceCreate, db: Session = Depends(get_db)):
    
    # check employee exists
    employee = db.query(models.Employee).filter(
        models.Employee.id == attendance.employee_id
    ).first()

    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    record = models.Attendance(**attendance.model_dump())
    db.add(record)
    db.commit()
    db.refresh(record)

    return record

# Bulk Attendance API
@router.post("/bulk")
def bulk_attendance(data: schemas.BulkAttendanceCreate, db: Session = Depends(get_db)):
    
    created_records = []

    for item in data.records:
        
        # validate employee exists
        employee = db.query(models.Employee).filter(
            models.Employee.id == item.employee_id
        ).first()

        if not employee:
            raise HTTPException(
                status_code=404,
                detail=f"Employee {item.employee_id} not found"
            )
        
        record = models.Attendance(**item.model_dump())
        db.add(record)
        created_records.append(record)

    db.commit()

    return {
        "message": "Bulk attendance added",
        "count": len(created_records)
    }


# Get all attendance records
@router.get("/")
def get_all_attendance(db: Session = Depends(get_db)):
    return db.query(models.Attendance).all()


# Get Attendance by Employee id
@router.get("/{employee_id}")
def get_attendance(employee_id: int, db: Session = Depends(get_db)):
    
    records = db.query(models.Attendance).filter(
        models.Attendance.employee_id == employee_id
    ).all()

    return records