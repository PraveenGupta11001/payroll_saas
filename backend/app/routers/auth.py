from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta
from .. import models, schemas
from ..utils.auth_utils import get_db, get_password_hash, verify_password, create_access_token, get_current_user, oauth2_scheme
from .. import redis_client
from jose import jwt
from datetime import datetime

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/register", response_model=schemas.UserOut)
def register(user: schemas.UserRegister, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    print(f"Registering user: {user.email}, password: {user.password}, type: {type(user.password)}")
    hashed_password = get_password_hash(user.password)
    new_user = models.User(
        email=user.email,
        password_hash=hashed_password,
        full_name=user.full_name
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/login", response_model=schemas.Token)
def login(user_credentials: schemas.UserLogin, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == user_credentials.email).first()
    if not user or not verify_password(user_credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer", "user": user}

@router.post("/logout")
def logout(current_user: models.User = Depends(get_current_user), token: str = Depends(oauth2_scheme)):
    # Blacklist the current token
    # To get JTI we need to decode the token again
    from ..utils.auth_utils import SECRET_KEY, ALGORITHM
    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    jti = payload.get("jti")
    exp = payload.get("exp")
    
    # Calculate ttl for redis
    now = datetime.utcnow().timestamp()
    ttl = int(exp - now) if exp > now else 0
    
    if jti and ttl > 0:
        redis_client.blacklist_token(jti, ttl)
        
    return {"message": "Successfully logged out"}
