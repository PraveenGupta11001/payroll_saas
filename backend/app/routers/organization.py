from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from .. import models, schemas
from ..utils.auth_utils import get_db, get_current_user, require_org_role

router = APIRouter(prefix="/organizations", tags=["Organizations"])

@router.post("/", response_model=schemas.OrgOut)
def create_organization(org: schemas.OrgCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    # 1. Create the organization
    new_org = models.Organization(name=org.name, owner_id=current_user.id)
    db.add(new_org)
    db.commit()
    db.refresh(new_org)
    
    # 2. Automatically make the creator the OWNER in the membership table
    membership = models.OrganizationMember(
        user_id=current_user.id,
        org_id=new_org.id,
        role="OWNER"
    )
    db.add(membership)
    db.commit()
    
    return new_org

@router.get("/", response_model=list[schemas.OrgWithRole])
def get_user_organizations(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    # Fetch all organizations where the user has a membership
    memberships = db.query(models.OrganizationMember).filter(
        models.OrganizationMember.user_id == current_user.id
    ).all()
    
    results = []
    for m in memberships:
        org = m.organization
        results.append({
            "id": org.id,
            "name": org.name,
            "role": m.role,
            "owner_id": org.owner_id,
            "created_at": org.created_at
        })
    return results

@router.get("/{org_id}", response_model=schemas.OrgOut)
def get_organization(org_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    # Verify user belongs to org
    membership = db.query(models.OrganizationMember).filter(
        models.OrganizationMember.org_id == org_id,
        models.OrganizationMember.user_id == current_user.id
    ).first()
    
    if not membership:
        raise HTTPException(status_code=403, detail="Not a member of this organization")
        
    return membership.organization

@router.delete("/{org_id}")
def delete_organization(org_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    # Only the absolute OWNER (creator) can delete the whole organization
    org = db.query(models.Organization).filter(
        models.Organization.id == org_id, 
        models.Organization.owner_id == current_user.id
    ).first()
    
    if not org:
        raise HTTPException(status_code=403, detail="Only the organization owner can delete it")
        
    db.delete(org)
    db.commit()
    return {"message": "Organization deleted"}

# --- Member Management ---

@router.post("/{org_id}/members", response_model=schemas.OrgMemberOut)
def add_organization_member(
    org_id: int, 
    member: schemas.OrgMemberCreate, 
    db: Session = Depends(get_db),
    # Only OWNER can add members (managers/editors)
    _membership: models.OrganizationMember = Depends(require_org_role(["OWNER"]))
):
    # Find user by email
    user = db.query(models.User).filter(models.User.email == member.user_email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found with this email")
    
    # Check if already a member
    existing = db.query(models.OrganizationMember).filter(
        models.OrganizationMember.org_id == org_id,
        models.OrganizationMember.user_id == user.id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="User is already a member")
        
    new_member = models.OrganizationMember(
        user_id=user.id,
        org_id=org_id,
        role=member.role
    )
    db.add(new_member)
    db.commit()
    db.refresh(new_member)
    
    # Return formatted member
    return {
        "id": new_member.id,
        "user_id": user.id,
        "user_name": user.full_name,
        "user_email": user.email,
        "role": new_member.role,
        "created_at": new_member.created_at
    }

@router.get("/{org_id}/members", response_model=list[schemas.OrgMemberOut])
def list_organization_members(
    org_id: int, 
    db: Session = Depends(get_db),
    _membership: models.OrganizationMember = Depends(require_org_role(["OWNER", "MANAGER", "EDITOR"]))
):
    members = db.query(models.OrganizationMember).filter(
        models.OrganizationMember.org_id == org_id
    ).all()
    
    results = []
    for m in members:
        results.append({
            "id": m.id,
            "user_id": m.user.id,
            "user_name": m.user.full_name,
            "user_email": m.user.email,
            "role": m.role,
            "created_at": m.created_at
        })
    return results
