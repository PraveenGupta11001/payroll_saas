from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..utils.auth_utils import get_db, get_current_user
from ..utils.dummy_data import generate_dummy_data
from .. import models

router = APIRouter(prefix="/debug", tags=["Debug"])

@router.post("/generate-dummy-data/{org_id}")
def trigger_dummy_data(
    org_id: int, 
    count: int = 100, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(get_current_user)
):
    # Verify org belongs to user
    org = db.query(models.Organization).filter(
        models.Organization.id == org_id, 
        models.Organization.owner_id == current_user.id
    ).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")

    num_generated = generate_dummy_data(db, org_id, count)
    if num_generated is None:
        raise HTTPException(status_code=404, detail="Organization not found")
        
    return {"message": f"Successfully generated {num_generated} employees with attendance for organization {org_id}"}
