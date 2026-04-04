from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import models, schemas
from ..utils.auth_utils import get_db, get_current_user

router = APIRouter(prefix="/departments", tags=["Departments"])

@router.post("/", response_model=schemas.DepartmentOut)
def create_department(dept: schemas.DepartmentCreate, org_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    org = db.query(models.Organization).filter(models.Organization.id == org_id, models.Organization.owner_id == current_user.id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
        
    new_dept = models.Department(name=dept.name, org_id=org_id)
    db.add(new_dept)
    db.commit()
    db.refresh(new_dept)
    return new_dept

@router.get("/{org_id}", response_model=list[schemas.DepartmentOut])
def get_departments(org_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    org = db.query(models.Organization).filter(models.Organization.id == org_id, models.Organization.owner_id == current_user.id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
        
    return db.query(models.Department).filter(models.Department.org_id == org_id).all()

@router.delete("/{dept_id}")
def delete_department(dept_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    dept = db.query(models.Department).join(models.Organization).filter(
        models.Department.id == dept_id, 
        models.Organization.owner_id == current_user.id
    ).first()
    if not dept:
        raise HTTPException(status_code=404, detail="Department not found")
    db.delete(dept)
    db.commit()
    return {"message": "Department deleted"}
