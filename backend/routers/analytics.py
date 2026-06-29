from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from models.database import get_db, Company, Employee, MonthlySnapshot, User
from schemas.schemas import ScenarioInput, ForecastRequest
from services.auth_service import get_current_user
from services.analytics import (
    calculate_kpis, calculate_health_score, calculate_department_breakdown,
    generate_smart_insights, score_employees, generate_recommendations, build_trend_data, run_scenario
)
from services.forecasting import forecast_financials
from fastapi import HTTPException

router = APIRouter(prefix="/analytics", tags=["analytics"])


def get_company_data(current_user: User, db: Session):
    company = db.query(Company).filter(Company.owner_id == current_user.id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not set up")
    employees = db.query(Employee).filter(Employee.company_id == company.id).all()
    snapshots = db.query(MonthlySnapshot).filter(MonthlySnapshot.company_id == company.id).all()
    return company, employees, snapshots


@router.get("/dashboard")
def get_dashboard(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    company, employees, snapshots = get_company_data(current_user, db)
    kpis = calculate_kpis(company, employees)
    health = calculate_health_score(company, employees)
    insights = generate_smart_insights(company, employees)
    departments = calculate_department_breakdown(employees)
    trend = build_trend_data(company, employees, snapshots)
    recs = generate_recommendations(company, employees)

    return {
        "company": {
            "name": company.name,
            "industry": company.industry,
            "currency": company.currency,
        },
        "kpis": kpis,
        "health": health,
        "insights": insights,
        "departments": departments,
        "trend": trend,
        "recommendations": recs,
    }


@router.get("/employees/intelligence")
def get_employee_intelligence(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    company, employees, _ = get_company_data(current_user, db)
    scored = score_employees(employees, company)
    return {"employees": scored}


@router.post("/forecast")
def get_forecast(req: ForecastRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    company, employees, snapshots = get_company_data(current_user, db)
    result = forecast_financials(company, employees, snapshots, months=req.months)
    return result


@router.post("/scenario")
def simulate_scenario(params: ScenarioInput, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    company, employees, _ = get_company_data(current_user, db)
    result = run_scenario(company, employees, params.model_dump())
    kpis = calculate_kpis(company, employees)
    return {
        "baseline": kpis,
        "scenario": result,
    }
