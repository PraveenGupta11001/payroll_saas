from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..utils.db_utils import get_db
from .. import models, schemas

router = APIRouter(prefix="/leave", tags=["Leave"])


# Apply Leave
@router.post("/apply")
def apply_leave(leave: schemas.LeaveCreate, db: Session = Depends(get_db)):

    # Check employee exists
    employee = db.query(models.Employee).filter(
        models.Employee.id == leave.employee_id
    ).first()

    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    # Validate date range
    if leave.start_date > leave.end_date:
        raise HTTPException(
            status_code=400,
            detail="Start date cannot be after end date"
        )

    # Prevent duplicate leave (same employee + same date range)
    existing = db.query(models.Leave).filter(
        models.Leave.employee_id == leave.employee_id,
        models.Leave.start_date == leave.start_date,
        models.Leave.end_date == leave.end_date
    ).first()

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Leave already applied for this date range"
        )

    new_leave = models.Leave(
        employee_id=leave.employee_id,
        start_date=leave.start_date,
        end_date=leave.end_date,
        reason=leave.reason.strip(),
        status="Pending"
    )

    db.add(new_leave)
    db.commit()
    db.refresh(new_leave)

    return {
        "message": "Leave applied successfully",
        "data": new_leave
    }


# Update Leave Status (Approve / Reject)
@router.put("/{leave_id}")
def update_leave_status(
    leave_id: int,
    data: schemas.LeaveUpdateStatus,
    db: Session = Depends(get_db)
):

    leave = db.query(models.Leave).filter(
        models.Leave.id == leave_id
    ).first()

    if not leave:
        raise HTTPException(status_code=404, detail="Leave not found")

    # Validate status
    if data.status.value not in ["Approved", "Rejected"]:
        raise HTTPException(
            status_code=400,
            detail="Invalid status"
        )

    leave.status = data.status.value
    db.commit()
    db.refresh(leave)

    return {
        "message": f"Leave status updated to {data.status.value}",
        "data": leave
    }


# Get all leaves
@router.get("/")
def get_leaves(db: Session = Depends(get_db)):
    return db.query(models.Leave).all()


# Get leaves by employee
@router.get("/{employee_id}")
def get_leaves_by_employee(employee_id: int, db: Session = Depends(get_db)):

    employee = db.query(models.Employee).filter(
        models.Employee.id == employee_id
    ).first()

    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    leaves = db.query(models.Leave).filter(
        models.Leave.employee_id == employee_id
    ).all()

    return leaves