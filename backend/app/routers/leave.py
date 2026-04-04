from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..utils.auth_utils import get_db, get_current_user, require_org_role
from .. import models, schemas

router = APIRouter(prefix="/leave", tags=["Leaves"])

# --- Helper ---
_leave_manager = Depends(require_org_role(["OWNER", "MANAGER", "EDITOR"]))

@router.post("/", response_model=schemas.LeaveOut)
def request_leave(
    leave: schemas.LeaveCreate, 
    org_id: int, 
    db: Session = Depends(get_db), 
    _membership: models.OrganizationMember = _leave_manager
):
    # Verify employee exists and belongs to organization
    employee = db.query(models.Employee).filter(
        models.Employee.id == leave.employee_id,
        models.Employee.org_id == org_id
    ).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found in this organization")

    new_leave = models.Leave(
        employee_id=leave.employee_id,
        start_date=leave.start_date,
        end_date=leave.end_date,
        reason=leave.reason,
        status="Pending"
    )
    db.add(new_leave)
    db.commit()
    db.refresh(new_leave)
    return new_leave

@router.get("/", response_model=list[schemas.LeaveOut])
def get_leaves(
    org_id: int, 
    db: Session = Depends(get_db), 
    _membership: models.OrganizationMember = _leave_manager
):
    # Fetch all leaves for employees in this organization
    leaves = db.query(models.Leave).join(models.Employee).filter(
        models.Employee.org_id == org_id
    ).all()
    
    # Simple formatting to add employee names
    for l in leaves:
        l.employee_name = l.employee.name
    return leaves

@router.put("/{id}/status", response_model=schemas.LeaveOut)
def update_leave_status(
    id: int, 
    org_id: int,
    status_update: schemas.LeaveUpdateStatus, 
    db: Session = Depends(get_db), 
    _membership: models.OrganizationMember = _leave_manager
):
    # Verify leave belongs to an employee in this org
    leave = db.query(models.Leave).join(models.Employee).filter(
        models.Leave.id == id,
        models.Employee.org_id == org_id
    ).first()

    if not leave:
        raise HTTPException(status_code=404, detail="Leave request not found")

    leave.status = status_update.status
    db.commit()
    db.refresh(leave)
    return leave