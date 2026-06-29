"""
Financial forecasting using linear regression and growth models.
"""
import numpy as np
from datetime import datetime, timedelta
from typing import List, Dict
from models.database import Company, Employee, MonthlySnapshot
from services.analytics import calculate_payroll


def forecast_financials(company: Company, employees: List[Employee], snapshots: List[MonthlySnapshot], months: int = 12) -> Dict:
    """Generate financial forecasts for the specified number of months."""
    now = datetime.utcnow()
    active = [e for e in employees if e.is_active]
    current_payroll = calculate_payroll(active)
    growth_rate = company.expected_revenue_growth / 100 / 12

    # Use historical data or simulate if insufficient
    if len(snapshots) >= 3:
        sorted_snaps = sorted(snapshots, key=lambda s: (s.year, s.month))[-12:]
        revenues = [s.revenue for s in sorted_snaps]
        payrolls = [s.payroll for s in sorted_snaps]
        opex_vals = [s.operating_expenses for s in sorted_snaps]
        base_revenue = revenues[-1]
        base_payroll = payrolls[-1]
        base_opex = opex_vals[-1]
        # Compute actual growth rate from data
        if len(revenues) > 1:
            hist_growth = (revenues[-1] / revenues[0]) ** (1 / len(revenues)) - 1
            growth_rate = hist_growth
    else:
        base_revenue = company.monthly_revenue
        base_payroll = current_payroll
        base_opex = company.monthly_operating_expenses

    forecast = []
    payroll_growth = 0.003  # ~3.6% annual payroll growth
    opex_growth = 0.002

    for i in range(1, months + 1):
        dt = now + timedelta(days=i * 30)
        rev = base_revenue * ((1 + growth_rate) ** i)
        pay = base_payroll * ((1 + payroll_growth) ** i)
        opex = base_opex * ((1 + opex_growth) ** i)
        profit = rev - pay - opex
        cash = company.cash_balance + sum(
            base_revenue * ((1 + growth_rate) ** j) - base_payroll * ((1 + payroll_growth) ** j) - base_opex * ((1 + opex_growth) ** j)
            for j in range(1, i + 1)
        )

        # Confidence decreases with time
        confidence = max(0.5, 0.95 - (i - 1) * 0.04)

        forecast.append({
            "month": dt.strftime("%Y-%m"),
            "revenue": round(rev, 2),
            "payroll": round(pay, 2),
            "operating_expenses": round(opex, 2),
            "net_profit": round(profit, 2),
            "cash_balance": round(max(0, cash), 2),
            "confidence": round(confidence, 2),
        })

    summary = {
        "1_month": forecast[0] if months >= 1 else None,
        "3_months": forecast[2] if months >= 3 else None,
        "6_months": forecast[5] if months >= 6 else None,
        "12_months": forecast[11] if months >= 12 else None,
    }

    return {
        "forecast": forecast,
        "summary": summary,
        "growth_rate_monthly": round(growth_rate * 100, 3),
    }
