from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import verify_password, get_password_hash, create_access_token, decode_access_token, validate_password_strength
from app.models.models import User, Student, Company, Faculty, Institution, UserRole
from app.schemas.schemas import UserRegister, UserLogin, Token, UserResponse
from fastapi.security import OAuth2PasswordBearer

router = APIRouter(prefix="/auth", tags=["Authentication"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid authentication credentials")
    user = db.query(User).filter(User.email == payload["sub"]).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user

@router.post("/register", response_model=Token)
def register(user_data: UserRegister, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user_data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email is already registered")

    # Enforce password strength for all roles
    is_valid, pwd_error = validate_password_strength(user_data.password)
    if not is_valid:
        raise HTTPException(status_code=400, detail=pwd_error)

    # Recruiter registration validation
    if user_data.role == UserRole.RECRUITER.value:
        if not user_data.college_or_company:
            raise HTTPException(status_code=400, detail="Company/Organization name is required for recruiter registration")

    new_user = User(
        email=user_data.email,
        hashed_password=get_password_hash(user_data.password),
        full_name=user_data.full_name,
        role=user_data.role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Initialize role profile
    if user_data.role == UserRole.STUDENT.value:
        student = Student(user_id=new_user.id, college_name=user_data.college_or_company or None)
        db.add(student)
    elif user_data.role == UserRole.RECRUITER.value:
        company = Company(
            user_id=new_user.id,
            name=user_data.college_or_company or new_user.full_name,
            registration_number=user_data.registration_number or None,
            official_domain=user_data.official_domain or None,
            website=user_data.company_website or None,
            verification_status="verified",
            is_approved=True
        )
        db.add(company)
    elif user_data.role == UserRole.FACULTY.value:
        faculty = Faculty(user_id=new_user.id, institution_name=user_data.college_or_company or None)
        db.add(faculty)
    elif user_data.role == UserRole.INSTITUTION_ADMIN.value:
        inst = Institution(user_id=new_user.id, name=user_data.college_or_company or new_user.full_name)
        db.add(inst)
    db.commit()

    access_token = create_access_token(data={"sub": new_user.email, "role": new_user.role})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": new_user.id,
            "email": new_user.email,
            "full_name": new_user.full_name,
            "role": new_user.role
        }
    }

@router.post("/login", response_model=Token)
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_data.email).first()
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")

    access_token = create_access_token(data={"sub": user.email, "role": user.role})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role
        }
    }

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user
