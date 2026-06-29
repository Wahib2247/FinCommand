from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Boolean, Text, ForeignKey, Enum
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime
import enum

DATABASE_URL = "sqlite:///./financial_command.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


class EmploymentStatus(str, enum.Enum):
    full_time = "full_time"
    part_time = "part_time"
    contract = "contract"
    intern = "intern"


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    company = relationship("Company", back_populates="owner", uselist=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class Company(Base):
    __tablename__ = "companies"
    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"), unique=True)
    name = Column(String)
    industry = Column(String)
    country = Column(String)
    currency = Column(String, default="USD")
    monthly_revenue = Column(Float)
    cash_balance = Column(Float)
    monthly_operating_expenses = Column(Float)
    expected_revenue_growth = Column(Float, default=5.0)
    onboarding_complete = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="company")
    employees = relationship("Employee", back_populates="company", cascade="all, delete-orphan")
    monthly_snapshots = relationship("MonthlySnapshot", back_populates="company", cascade="all, delete-orphan")


class Employee(Base):
    __tablename__ = "employees"
    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"))
    name = Column(String)
    department = Column(String)
    position = Column(String)
    salary = Column(Float)
    joining_date = Column(DateTime)
    working_hours = Column(Float, default=40.0)
    employment_status = Column(String, default="full_time")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    company = relationship("Company", back_populates="employees")


class MonthlySnapshot(Base):
    __tablename__ = "monthly_snapshots"
    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"))
    month = Column(Integer)
    year = Column(Integer)
    revenue = Column(Float)
    payroll = Column(Float)
    operating_expenses = Column(Float)
    cash_balance = Column(Float)
    employee_count = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)

    company = relationship("Company", back_populates="monthly_snapshots")


def create_tables():
    Base.metadata.create_all(bind=engine)
