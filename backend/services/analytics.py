"""
Core analytics engine: transforms raw company/employee data into 100+ insights.
"""
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
import math
from models.database import Company, Employee, MonthlySnapshot
from sqlalchemy.orm import Session


def calculate_payroll(employees: List[Employee]) -> float:
    return sum(e.salary / 12 for e in employees if e.is_active)


def calculate_health_score(company: Company, employees: List[Employee]) -> Dict[str, Any]:
    payroll = calculate_payroll(employees)
    revenue = company.monthly_revenue
    opex = company.monthly_operating_expenses
    cash = company.cash_balance
    growth = company.expected_revenue_growth

    total_expenses = payroll + opex
    net_profit = revenue - total_expenses
    profit_margin = (net_profit / revenue * 100) if revenue > 0 else 0
    payroll_ratio = (payroll / revenue * 100) if revenue > 0 else 100
    burn_rate = total_expenses - revenue if total_expenses > revenue else 0
    cash_runway = (cash / abs(total_expenses - revenue)) if (total_expenses - revenue) > 0 else (cash / total_expenses * 12 if total_expenses > 0 else 999)

    scores = {}

    # Profitability (0-25)
    if profit_margin >= 20:
        scores["profitability"] = 25
    elif profit_margin >= 10:
        scores["profitability"] = 20
    elif profit_margin >= 5:
        scores["profitability"] = 15
    elif profit_margin >= 0:
        scores["profitability"] = 10
    else:
        scores["profitability"] = max(0, 10 + profit_margin)

    # Liquidity / Cash Runway (0-20)
    months_runway = min(cash_runway, 24)
    scores["liquidity"] = min(20, int(months_runway / 24 * 20))

    # Payroll Ratio (0-20)
    if payroll_ratio <= 30:
        scores["payroll_ratio"] = 20
    elif payroll_ratio <= 40:
        scores["payroll_ratio"] = 16
    elif payroll_ratio <= 50:
        scores["payroll_ratio"] = 12
    elif payroll_ratio <= 60:
        scores["payroll_ratio"] = 8
    else:
        scores["payroll_ratio"] = max(0, int(20 - (payroll_ratio - 30) / 5))

    # Revenue Growth (0-20)
    if growth >= 20:
        scores["revenue_growth"] = 20
    elif growth >= 10:
        scores["revenue_growth"] = 16
    elif growth >= 5:
        scores["revenue_growth"] = 12
    elif growth >= 0:
        scores["revenue_growth"] = 8
    else:
        scores["revenue_growth"] = 0

    # Expense Control (0-15)
    expense_ratio = (opex / revenue * 100) if revenue > 0 else 100
    if expense_ratio <= 20:
        scores["expense_control"] = 15
    elif expense_ratio <= 30:
        scores["expense_control"] = 12
    elif expense_ratio <= 40:
        scores["expense_control"] = 8
    else:
        scores["expense_control"] = max(0, int(15 - expense_ratio / 10))

    total = sum(scores.values())

    if total >= 85:
        label = "Excellent"
        color = "#22C55E"
    elif total >= 70:
        label = "Healthy"
        color = "#3B82F6"
    elif total >= 55:
        label = "Stable"
        color = "#F59E0B"
    elif total >= 35:
        label = "Needs Attention"
        color = "#F97316"
    else:
        label = "Critical"
        color = "#EF4444"

    # Generate explanation
    reasons = []
    if scores["profitability"] >= 20:
        reasons.append(f"Strong profit margin of {profit_margin:.1f}%")
    elif scores["profitability"] < 10:
        reasons.append(f"Low profit margin ({profit_margin:.1f}%) is dragging the score")

    if cash_runway >= 12:
        reasons.append(f"Healthy cash runway of {cash_runway:.0f} months")
    elif cash_runway < 6:
        reasons.append(f"Cash runway of only {cash_runway:.0f} months is a concern")

    if payroll_ratio > 50:
        reasons.append(f"Payroll consumes {payroll_ratio:.1f}% of revenue — above the 50% threshold")
    elif payroll_ratio <= 30:
        reasons.append(f"Efficient payroll ratio of {payroll_ratio:.1f}%")

    if growth >= 10:
        reasons.append(f"Revenue growth of {growth:.1f}% is excellent")
    elif growth < 0:
        reasons.append(f"Negative revenue growth ({growth:.1f}%) reduces the score")

    return {
        "score": total,
        "label": label,
        "color": color,
        "breakdown": scores,
        "reasons": reasons,
        "metrics": {
            "profit_margin": round(profit_margin, 2),
            "payroll_ratio": round(payroll_ratio, 2),
            "cash_runway_months": round(min(cash_runway, 999), 1),
            "burn_rate": round(burn_rate, 2),
        }
    }


def calculate_kpis(company: Company, employees: List[Employee]) -> Dict[str, Any]:
    active_employees = [e for e in employees if e.is_active]
    payroll = calculate_payroll(active_employees)
    revenue = company.monthly_revenue
    opex = company.monthly_operating_expenses
    cash = company.cash_balance
    total_expenses = payroll + opex
    net_profit = revenue - total_expenses
    profit_margin = (net_profit / revenue * 100) if revenue > 0 else 0
    payroll_ratio = (payroll / revenue * 100) if revenue > 0 else 0
    revenue_per_emp = (revenue / len(active_employees)) if active_employees else 0
    avg_salary_monthly = (sum(e.salary for e in active_employees) / 12 / len(active_employees)) if active_employees else 0
    burn_rate = max(0, total_expenses - revenue)
    cash_runway = (cash / total_expenses) if total_expenses > 0 else 999

    return {
        "revenue": round(revenue, 2),
        "payroll": round(payroll, 2),
        "operating_expenses": round(opex, 2),
        "total_expenses": round(total_expenses, 2),
        "net_profit": round(net_profit, 2),
        "profit_margin": round(profit_margin, 2),
        "cash_balance": round(cash, 2),
        "burn_rate": round(burn_rate, 2),
        "cash_runway_months": round(min(cash_runway, 999), 1),
        "employee_count": len(active_employees),
        "avg_salary_annual": round(sum(e.salary for e in active_employees) / len(active_employees), 2) if active_employees else 0,
        "avg_salary_monthly": round(avg_salary_monthly, 2),
        "revenue_per_employee": round(revenue_per_emp, 2),
        "payroll_ratio": round(payroll_ratio, 2),
    }


def calculate_department_breakdown(employees: List[Employee]) -> List[Dict]:
    dept_data: Dict[str, Dict] = {}
    for e in employees:
        if not e.is_active:
            continue
        d = e.department
        if d not in dept_data:
            dept_data[d] = {"name": d, "employee_count": 0, "total_payroll": 0, "avg_salary": 0, "employees": []}
        dept_data[d]["employee_count"] += 1
        dept_data[d]["total_payroll"] += e.salary / 12
        dept_data[d]["employees"].append(e.salary)

    result = []
    total_payroll = sum(d["total_payroll"] for d in dept_data.values())
    for d, data in dept_data.items():
        avg = data["total_payroll"] / data["employee_count"] if data["employee_count"] > 0 else 0
        result.append({
            "name": data["name"],
            "employee_count": data["employee_count"],
            "monthly_payroll": round(data["total_payroll"], 2),
            "avg_monthly_salary": round(avg, 2),
            "payroll_share": round(data["total_payroll"] / total_payroll * 100, 1) if total_payroll > 0 else 0,
        })
    return sorted(result, key=lambda x: x["monthly_payroll"], reverse=True)


def generate_smart_insights(company: Company, employees: List[Employee]) -> List[Dict]:
    active = [e for e in employees if e.is_active]
    payroll = calculate_payroll(active)
    revenue = company.monthly_revenue
    opex = company.monthly_operating_expenses
    cash = company.cash_balance
    growth = company.expected_revenue_growth
    total = payroll + opex
    profit = revenue - total
    dept_data = calculate_department_breakdown(active)
    insights = []

    # Payroll ratio insight
    ratio = payroll / revenue * 100 if revenue > 0 else 0
    if ratio > 50:
        insights.append({"type": "warning", "icon": "alert", "title": "High Payroll Burden", "message": f"Payroll consumes {ratio:.1f}% of monthly revenue — above the recommended 50% threshold. Consider revenue growth strategies before making new hires."})
    elif ratio > 35:
        insights.append({"type": "info", "icon": "info", "title": "Payroll Ratio Trending Up", "message": f"Payroll accounts for {ratio:.1f}% of revenue. This is manageable but worth monitoring as headcount grows."})
    else:
        insights.append({"type": "success", "icon": "check", "title": "Efficient Payroll Ratio", "message": f"Payroll is only {ratio:.1f}% of revenue — well within healthy limits. You have room to hire or invest."})

    # Cash runway
    cash_runway = cash / total if total > 0 else 999
    if cash_runway < 3:
        insights.append({"type": "danger", "icon": "alert-triangle", "title": "Critical Cash Runway", "message": f"At current burn rate, cash reserves will last only {cash_runway:.1f} months. Immediate action required."})
    elif cash_runway < 6:
        insights.append({"type": "warning", "icon": "clock", "title": "Low Cash Runway", "message": f"Current cash can sustain operations for {cash_runway:.1f} months. Plan for revenue growth or cost reduction."})
    else:
        insights.append({"type": "success", "icon": "shield", "title": "Solid Cash Runway", "message": f"Cash reserves can sustain operations for {cash_runway:.1f} months, providing a healthy financial cushion."})

    # Department dominance
    if dept_data:
        top_dept = dept_data[0]
        if top_dept["payroll_share"] > 45:
            insights.append({"type": "info", "icon": "pie-chart", "title": "Department Concentration", "message": f"{top_dept['name']} accounts for {top_dept['payroll_share']}% of total payroll. This concentration may create operational risk."})

    # Profit insight
    profit_margin = profit / revenue * 100 if revenue > 0 else 0
    if profit_margin < 0:
        insights.append({"type": "danger", "icon": "trending-down", "title": "Operating at a Loss", "message": f"Monthly expenses exceed revenue by {abs(profit):,.0f} {company.currency}. Immediate cost review is critical."})
    elif profit_margin < 10:
        insights.append({"type": "warning", "icon": "trending-up", "title": "Thin Profit Margins", "message": f"Net profit margin of {profit_margin:.1f}% leaves little buffer for unexpected expenses."})
    else:
        insights.append({"type": "success", "icon": "trending-up", "title": "Healthy Profit Margins", "message": f"Net profit margin of {profit_margin:.1f}% indicates strong financial health."})

    # Revenue growth
    if growth >= 15:
        insights.append({"type": "success", "icon": "rocket", "title": "Strong Revenue Trajectory", "message": f"Expected revenue growth of {growth:.1f}% annually puts the company on an excellent growth path."})
    elif growth < 5:
        insights.append({"type": "warning", "icon": "target", "title": "Revenue Growth Needs Attention", "message": f"Expected growth of {growth:.1f}% may not keep pace with rising operating costs over time."})

    # Headcount insight
    if active:
        rev_per_emp = revenue / len(active)
        avg_sal = sum(e.salary for e in active) / len(active) / 12
        if rev_per_emp < avg_sal * 2:
            insights.append({"type": "warning", "icon": "users", "title": "Revenue Per Employee Low", "message": f"Each employee generates {rev_per_emp:,.0f} {company.currency}/month in revenue vs {avg_sal:,.0f} {company.currency} cost. Target 3-5x for healthy margins."})

    # Hiring capacity
    avg_monthly_cost = payroll / len(active) if active else 5000
    new_payroll = payroll + avg_monthly_cost
    new_total = new_payroll + opex
    new_profit = revenue - new_total
    if new_profit > 0:
        insights.append({"type": "info", "icon": "user-plus", "title": "Hiring Capacity Available", "message": f"Current financials can support one additional hire at the average salary of {avg_monthly_cost:,.0f}/month while remaining profitable."})

    return insights


def score_employees(employees: List[Employee], company: Company) -> List[Dict]:
    active = [e for e in employees if e.is_active]
    if not active:
        return []

    now = datetime.utcnow()
    avg_salary = sum(e.salary for e in active) / len(active) if active else 1
    revenue = company.monthly_revenue

    results = []
    for e in active:
        tenure_months = max(1, (now - e.joining_date).days / 30)
        tenure_years = tenure_months / 12

        # Salary efficiency: lower salary vs peers in same dept = higher score
        dept_peers = [p for p in active if p.department == e.department]
        dept_avg = sum(p.salary for p in dept_peers) / len(dept_peers) if dept_peers else avg_salary
        salary_ratio = dept_avg / e.salary if e.salary > 0 else 1

        # Productivity score (based on revenue per employee vs salary cost)
        rev_per_emp = revenue / len(active) if active else 0
        monthly_cost = e.salary / 12
        productivity = min(100, int(rev_per_emp / monthly_cost * 40)) if monthly_cost > 0 else 50

        # Cost efficiency
        cost_efficiency = min(100, int(salary_ratio * 50))

        # Growth score (based on tenure — longer tenure may indicate stability but also stagnation)
        if tenure_years < 0.5:
            growth = 60  # new employee
        elif tenure_years < 2:
            growth = 80
        elif tenure_years < 5:
            growth = 70
        else:
            growth = 65

        # Reliability score
        hours_ratio = e.working_hours / 40
        reliability = min(100, int(hours_ratio * 80 + 20))
        if e.employment_status == "full_time":
            reliability = min(100, reliability + 10)

        overall = int(productivity * 0.3 + cost_efficiency * 0.25 + growth * 0.25 + reliability * 0.2)

        if overall >= 80:
            classification = "High Performer"
            class_color = "#22C55E"
        elif overall >= 65:
            classification = "Reliable Contributor"
            class_color = "#3B82F6"
        elif overall >= 50:
            classification = "Growing"
            class_color = "#8B5CF6"
        elif overall >= 35:
            classification = "Needs Coaching"
            class_color = "#F59E0B"
        else:
            classification = "Performance Review Recommended"
            class_color = "#EF4444"

        explanation = []
        if productivity >= 70:
            explanation.append(f"Generates strong revenue relative to cost ({rev_per_emp:,.0f}/mo revenue vs {monthly_cost:,.0f}/mo cost)")
        elif productivity < 40:
            explanation.append("Revenue-to-cost ratio is below average for current team size")
        if cost_efficiency >= 70:
            explanation.append(f"Compensated below department average ({e.salary/12:,.0f}/mo vs dept avg {dept_avg/12:,.0f}/mo)")
        if tenure_years >= 2:
            explanation.append(f"Demonstrated {tenure_years:.1f} years of reliability")
        if tenure_years < 0.5:
            explanation.append("Still in onboarding/ramp-up period")

        results.append({
            "id": e.id,
            "name": e.name,
            "department": e.department,
            "position": e.position,
            "salary": e.salary,
            "joining_date": e.joining_date.isoformat(),
            "employment_status": e.employment_status,
            "tenure_months": round(tenure_months, 1),
            "scores": {
                "productivity": productivity,
                "cost_efficiency": cost_efficiency,
                "growth": growth,
                "reliability": reliability,
                "overall": overall,
            },
            "classification": classification,
            "classification_color": class_color,
            "explanation": explanation,
        })

    return sorted(results, key=lambda x: x["scores"]["overall"], reverse=True)


def generate_recommendations(company: Company, employees: List[Employee]) -> List[Dict]:
    active = [e for e in employees if e.is_active]
    payroll = calculate_payroll(active)
    revenue = company.monthly_revenue
    opex = company.monthly_operating_expenses
    cash = company.cash_balance
    total = payroll + opex
    profit = revenue - total
    profit_margin = profit / revenue * 100 if revenue > 0 else 0
    payroll_ratio = payroll / revenue * 100 if revenue > 0 else 0
    cash_runway = cash / total if total > 0 else 999
    avg_cost = payroll / len(active) if active else 5000

    recs = []

    if payroll_ratio > 50:
        target_revenue = payroll / 0.45
        increase_pct = (target_revenue - revenue) / revenue * 100
        recs.append({
            "priority": "high",
            "category": "Revenue",
            "title": "Increase Revenue to Reduce Payroll Burden",
            "description": f"Growing monthly revenue by {increase_pct:.0f}% (to {target_revenue:,.0f} {company.currency}) would bring payroll ratio to the healthy 45% threshold.",
            "impact": "High",
            "icon": "trending-up"
        })

    if cash_runway < 6:
        months_target = 12
        cash_needed = total * months_target - cash
        recs.append({
            "priority": "high",
            "category": "Cash Management",
            "title": "Build Cash Reserves",
            "description": f"Targeting {months_target} months of cash runway requires an additional {cash_needed:,.0f} {company.currency} in reserves.",
            "impact": "High",
            "icon": "shield"
        })

    if profit_margin < 15 and opex > revenue * 0.25:
        reduction = opex * 0.08
        recs.append({
            "priority": "medium",
            "category": "Cost Control",
            "title": "Optimize Operating Expenses",
            "description": f"Reducing operating expenses by 8% ({reduction:,.0f} {company.currency}/month) would improve profit margins by approximately 2-3 percentage points.",
            "impact": "Medium",
            "icon": "scissors"
        })

    if profit > avg_cost and payroll_ratio < 45:
        recs.append({
            "priority": "low",
            "category": "Hiring",
            "title": "Consider Strategic Hiring",
            "description": f"Financial health supports adding one employee at the current average cost ({avg_cost:,.0f} {company.currency}/month) without compromising profitability.",
            "impact": "Medium",
            "icon": "user-plus"
        })

    if company.expected_revenue_growth < 5:
        recs.append({
            "priority": "medium",
            "category": "Growth",
            "title": "Boost Revenue Growth Strategy",
            "description": f"Current expected growth of {company.expected_revenue_growth:.1f}% may be insufficient to offset rising costs. A target of 10%+ annual growth provides a stronger financial buffer.",
            "impact": "High",
            "icon": "rocket"
        })

    if profit_margin > 20 and cash_runway > 12:
        recs.append({
            "priority": "low",
            "category": "Investment",
            "title": "Deploy Excess Capital",
            "description": "Strong financial position provides an opportunity to invest in growth — technology upgrades, marketing, or strategic partnerships.",
            "impact": "Medium",
            "icon": "zap"
        })

    return recs


def build_trend_data(company: Company, employees: List[Employee], snapshots: List[MonthlySnapshot]) -> List[Dict]:
    """Build 12 months of trend data using snapshots or simulated history."""
    now = datetime.utcnow()
    months = []

    if len(snapshots) >= 3:
        # Use real snapshot data
        sorted_snaps = sorted(snapshots, key=lambda s: (s.year, s.month))[-12:]
        for s in sorted_snaps:
            profit = s.revenue - s.payroll - s.operating_expenses
            months.append({
                "month": f"{s.year}-{s.month:02d}",
                "revenue": s.revenue,
                "payroll": s.payroll,
                "operating_expenses": s.operating_expenses,
                "net_profit": profit,
                "cash_balance": s.cash_balance,
                "employee_count": s.employee_count,
            })
    else:
        # Simulate historical data based on current values + growth rate
        growth_rate = company.expected_revenue_growth / 100 / 12
        current_payroll = calculate_payroll([e for e in employees if e.is_active])
        for i in range(11, -1, -1):
            dt = now - timedelta(days=i * 30)
            factor = 1 / ((1 + growth_rate) ** i)
            rev = company.monthly_revenue * factor
            pay = current_payroll * factor
            opex = company.monthly_operating_expenses * factor
            months.append({
                "month": dt.strftime("%Y-%m"),
                "revenue": round(rev, 2),
                "payroll": round(pay, 2),
                "operating_expenses": round(opex, 2),
                "net_profit": round(rev - pay - opex, 2),
                "cash_balance": round(company.cash_balance * factor, 2),
                "employee_count": len([e for e in employees if e.is_active]),
            })

    return months


def run_scenario(company: Company, employees: List[Employee], params: Dict) -> Dict:
    """Simulate what-if scenarios."""
    active = [e for e in employees if e.is_active]
    revenue_growth_delta = params.get("revenue_growth_delta", 0.0)
    salary_increase = params.get("salary_increase", 0.0)
    new_hires = params.get("new_hires", 0)
    avg_new_hire_salary = params.get("avg_new_hire_salary") or (
        sum(e.salary for e in active) / len(active) if active else 60000
    )
    opex_change = params.get("operating_expense_change", 0.0)

    sim_revenue = company.monthly_revenue * (1 + revenue_growth_delta / 100)
    sim_payroll = calculate_payroll(active) * (1 + salary_increase / 100) + (new_hires * avg_new_hire_salary / 12)
    sim_opex = company.monthly_operating_expenses * (1 + opex_change / 100)
    sim_total = sim_payroll + sim_opex
    sim_profit = sim_revenue - sim_total
    sim_margin = sim_profit / sim_revenue * 100 if sim_revenue > 0 else 0
    sim_payroll_ratio = sim_payroll / sim_revenue * 100 if sim_revenue > 0 else 0
    sim_cash_runway = company.cash_balance / sim_total if sim_total > 0 else 999

    # Create a temporary company obj for health score
    class SimCompany:
        monthly_revenue = sim_revenue
        cash_balance = company.cash_balance
        monthly_operating_expenses = sim_opex
        expected_revenue_growth = company.expected_revenue_growth + revenue_growth_delta

    class SimEmployee:
        def __init__(self, s, is_active=True):
            self.salary = s
            self.is_active = is_active

    sim_emp_list = [SimEmployee(e.salary * (1 + salary_increase / 100)) for e in active]
    sim_emp_list += [SimEmployee(avg_new_hire_salary) for _ in range(new_hires)]
    sim_health = calculate_health_score(SimCompany(), sim_emp_list)

    return {
        "simulated": {
            "revenue": round(sim_revenue, 2),
            "payroll": round(sim_payroll, 2),
            "operating_expenses": round(sim_opex, 2),
            "net_profit": round(sim_profit, 2),
            "profit_margin": round(sim_margin, 2),
            "payroll_ratio": round(sim_payroll_ratio, 2),
            "cash_runway_months": round(min(sim_cash_runway, 999), 1),
            "health_score": sim_health["score"],
            "health_label": sim_health["label"],
            "employee_count": len(active) + new_hires,
        },
        "delta": {
            "revenue": round(sim_revenue - company.monthly_revenue, 2),
            "payroll": round(sim_payroll - calculate_payroll(active), 2),
            "net_profit": round(sim_profit - (company.monthly_revenue - calculate_payroll(active) - company.monthly_operating_expenses), 2),
        }
    }
