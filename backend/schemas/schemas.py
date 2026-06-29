from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional, List
from datetime import datetime


# Auth
class UserCreate(BaseModel):
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class UserOut(BaseModel):
    id: int
    email: str
    created_at: datetime
    class Config:
        from_attributes = True


# Company
class CompanyCreate(BaseModel):
    name: str
    industry: str
    country: str
    currency: str = "USD"
    monthly_revenue: float
    cash_balance: float
    monthly_operating_expenses: float
    expected_revenue_growth: float = 5.0

class CompanyUpdate(BaseModel):
    name: Optional[str] = None
    industry: Optional[str] = None
    country: Optional[str] = None
    currency: Optional[str] = None
    monthly_revenue: Optional[float] = None
    cash_balance: Optional[float] = None
    monthly_operating_expenses: Optional[float] = None
    expected_revenue_growth: Optional[float] = None

class CompanyOut(BaseModel):
    id: int
    name: str
    industry: str
    country: str
    currency: str
    monthly_revenue: float
    cash_balance: float
    monthly_operating_expenses: float
    expected_revenue_growth: float
    onboarding_complete: bool
    created_at: datetime
    class Config:
        from_attributes = True


# Employee
class EmployeeCreate(BaseModel):
    name: str
    department: str
    position: str
    salary: float
    joining_date: datetime
    working_hours: float = 40.0
    employment_status: str = "full_time"

class EmployeeUpdate(BaseModel):
    name: Optional[str] = None
    department: Optional[str] = None
    position: Optional[str] = None
    salary: Optional[float] = None
    joining_date: Optional[datetime] = None
    working_hours: Optional[float] = None
    employment_status: Optional[str] = None
    is_active: Optional[bool] = None

class EmployeeOut(BaseModel):
    id: int
    company_id: int
    name: str
    department: str
    position: str
    salary: float
    joining_date: datetime
    working_hours: float
    employment_status: str
    is_active: bool
    created_at: datetime
    class Config:
        from_attributes = True


# Scenario
class ScenarioInput(BaseModel):
    revenue_growth_delta: float = 0.0   # % change
    salary_increase: float = 0.0        # % increase
    new_hires: int = 0
    avg_new_hire_salary: Optional[float] = None
    operating_expense_change: float = 0.0  # % change


# Forecast
class ForecastRequest(BaseModel):
    months: int = 12  # 1, 3, 6, 12
