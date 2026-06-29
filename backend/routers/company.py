from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from models.database import get_db, Company, User
from schemas.schemas import CompanyCreate, CompanyUpdate, CompanyOut
from services.auth_service import get_current_user

router = APIRouter(prefix="/company", tags=["company"])


def get_company_or_404(current_user: User, db: Session) -> Company:
    company = db.query(Company).filter(Company.owner_id == current_user.id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found. Please complete onboarding.")
    return company


@router.post("/setup", response_model=CompanyOut)
def setup_company(data: CompanyCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    existing = db.query(Company).filter(Company.owner_id == current_user.id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Company already set up")
    company = Company(**data.model_dump(), owner_id=current_user.id, onboarding_complete=True)
    db.add(company)
    db.commit()
    db.refresh(company)
    return company


@router.get("/", response_model=CompanyOut)
def get_company(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return get_company_or_404(current_user, db)


@router.put("/", response_model=CompanyOut)
def update_company(data: CompanyUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    company = get_company_or_404(current_user, db)
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(company, field, value)
    db.commit()
    db.refresh(company)
    return company
