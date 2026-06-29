from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
from models.database import get_db, Company, Employee, User
from schemas.schemas import EmployeeCreate, EmployeeUpdate, EmployeeOut
from services.auth_service import get_current_user
from datetime import datetime
import csv
import io

router = APIRouter(prefix="/employees", tags=["employees"])


def get_company(current_user: User, db: Session) -> Company:
    company = db.query(Company).filter(Company.owner_id == current_user.id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not set up")
    return company


@router.get("/", response_model=List[EmployeeOut])
def list_employees(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    company = get_company(current_user, db)
    return db.query(Employee).filter(Employee.company_id == company.id).all()


@router.post("/", response_model=EmployeeOut)
def add_employee(data: EmployeeCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    company = get_company(current_user, db)
    emp = Employee(**data.model_dump(), company_id=company.id)
    db.add(emp)
    db.commit()
    db.refresh(emp)
    return emp


@router.put("/{employee_id}", response_model=EmployeeOut)
def update_employee(employee_id: int, data: EmployeeUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    company = get_company(current_user, db)
    emp = db.query(Employee).filter(Employee.id == employee_id, Employee.company_id == company.id).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(emp, field, value)
    db.commit()
    db.refresh(emp)
    return emp


@router.delete("/{employee_id}")
def delete_employee(employee_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    company = get_company(current_user, db)
    emp = db.query(Employee).filter(Employee.id == employee_id, Employee.company_id == company.id).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    db.delete(emp)
    db.commit()
    return {"success": True}


@router.post("/import-csv")
async def import_csv(file: UploadFile = File(...), current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    company = get_company(current_user, db)
    contents = await file.read()
    text = contents.decode("utf-8")
    reader = csv.DictReader(io.StringIO(text))

    required_fields = {"name", "department", "position", "salary", "joining_date"}
    errors = []
    imported = 0

    for i, row in enumerate(reader, start=2):
        row_keys = {k.strip().lower() for k in row.keys()}
        if not required_fields.issubset(row_keys):
            errors.append(f"Row {i}: Missing required columns. Need: {required_fields}")
            continue

        try:
            row = {k.strip().lower(): v.strip() for k, v in row.items()}
            salary = float(row["salary"])
            if salary <= 0:
                raise ValueError("Salary must be positive")

            # Try multiple date formats
            for fmt in ["%Y-%m-%d", "%m/%d/%Y", "%d/%m/%Y", "%Y/%m/%d"]:
                try:
                    joining_date = datetime.strptime(row["joining_date"], fmt)
                    break
                except ValueError:
                    continue
            else:
                raise ValueError(f"Cannot parse date: {row['joining_date']}")

            emp = Employee(
                company_id=company.id,
                name=row["name"],
                department=row["department"],
                position=row["position"],
                salary=salary,
                joining_date=joining_date,
                working_hours=float(row.get("working_hours", 40)),
                employment_status=row.get("employment_status", "full_time").lower().replace(" ", "_"),
                is_active=True,
            )
            db.add(emp)
            imported += 1
        except Exception as e:
            errors.append(f"Row {i}: {str(e)}")

    db.commit()
    return {
        "imported": imported,
        "errors": errors,
        "total_rows": imported + len(errors),
    }
