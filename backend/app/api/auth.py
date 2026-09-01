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
    clean_email = payload["sub"].strip().lower() if payload["sub"] else ""
    user = db.query(User).filter(User.email == clean_email).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user

@router.post("/register", response_model=Token)
def register(user_data: UserRegister, db: Session = Depends(get_db)):
    clean_email = user_data.email.strip().lower() if user_data.email else ""
    clean_name = user_data.full_name.strip() if user_data.full_name else ""

    if not clean_email:
        raise HTTPException(status_code=400, detail="Email is required")

    if not clean_name:
        raise HTTPException(status_code=400, detail="Full name is required")

    valid_roles = [r.value for r in UserRole]
    if user_data.role not in valid_roles:
        raise HTTPException(status_code=400, detail=f"Invalid role. Must be one of: {', '.join(valid_roles)}")

    existing = db.query(User).filter(User.email == clean_email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email is already registered")

    # Enforce password strength for all roles
    is_valid, pwd_error = validate_password_strength(user_data.password)
    if not is_valid:
        raise HTTPException(status_code=400, detail=pwd_error)

    # Clean company / organization string
    company_org = user_data.college_or_company.strip() if user_data.college_or_company else None

    # Recruiter registration validation
    if user_data.role == UserRole.RECRUITER.value:
        if not company_org:
            raise HTTPException(status_code=400, detail="Company/Organization name is required for recruiter registration")

    try:
        new_user = User(
            email=clean_email,
            hashed_password=get_password_hash(user_data.password),
            full_name=clean_name,
            role=user_data.role
        )
        db.add(new_user)
        db.flush()  # Obtain new_user.id within transaction

        # Initialize role profile atomically
        if user_data.role == UserRole.STUDENT.value:
            student = Student(user_id=new_user.id, college_name=company_org)
            db.add(student)
        elif user_data.role == UserRole.RECRUITER.value:
            company = Company(
                user_id=new_user.id,
                name=company_org or clean_name,
                registration_number=user_data.registration_number.strip() if user_data.registration_number else None,
                official_domain=user_data.official_domain.strip() if user_data.official_domain else None,
                website=user_data.company_website.strip() if user_data.company_website else None,
                verification_status="verified",
                is_approved=True
            )
            db.add(company)
        elif user_data.role == UserRole.FACULTY.value:
            faculty = Faculty(user_id=new_user.id, institution_name=company_org)
            db.add(faculty)
        elif user_data.role == UserRole.INSTITUTION_ADMIN.value:
            inst = Institution(user_id=new_user.id, name=company_org or clean_name)
            db.add(inst)

        db.commit()
        db.refresh(new_user)
    except Exception as e:
        db.rollback()
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Registration failed: {str(e)}")

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
    clean_email = login_data.email.strip().lower() if login_data.email else ""
    user = db.query(User).filter(User.email == clean_email).first()
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
