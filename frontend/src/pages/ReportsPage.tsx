import React, { useState } from 'react';
import { FileText, Download, BarChart3, Users, TrendingUp, Building2, Zap } from 'lucide-react';
import { useStore } from '../store/useStore';
import { fmt } from '../utils/format';

interface ReportCard {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  sections: string[];
}

const REPORTS: ReportCard[] = [
  {
    id: 'executive',
    title: 'Executive Summary',
    description: 'High-level financial overview for leadership',
    icon: <Building2 size={20} />,
    color: '#3B82F6',
    sections: ['Company Overview', 'Health Score', 'KPI Summary', 'Key Insights', 'Strategic Recommendations'],
  },
  {
    id: 'financial',
    title: 'Financial Report',
    description: 'Comprehensive revenue, expense & profit analysis',
    icon: <BarChart3 size={20} />,
    color: '#22C55E',
    sections: ['Revenue Analysis', 'Expense Breakdown', 'Profitability', 'Cash Flow', 'Burn Rate', 'Financial Forecast'],
  },
  {
    id: 'payroll',
    title: 'Payroll Report',
    description: 'Payroll costs, ratios, and department breakdown',
    icon: <Zap size={20} />,
    color: '#F59E0B',
    sections: ['Total Payroll', 'Department Costs', 'Salary Distribution', 'Payroll Ratio', 'Headcount Analysis'],
  },
  {
    id: 'employees',
    title: 'Employee Performance',
    description: 'Team intelligence scores and classifications',
    icon: <Users size={20} />,
    color: '#8B5CF6',
    sections: ['Performance Scores', 'Classification Summary', 'Department Rankings', 'Individual Profiles'],
  },
  {
    id: 'forecast',
    title: 'Forecast Report',
    description: '12-month financial projections and scenarios',
    icon: <TrendingUp size={20} />,
    color: '#06B6D4',
    sections: ['Revenue Forecast', 'Profit Forecast', 'Cash Flow Projection', 'Payroll Forecast', 'Confidence Bands'],
  },
];

export const ReportsPage: React.FC = () => {
  const { dashboard, employees, intelligence, forecast } = useStore();
  const [generating, setGenerating] = useState<string | null>(null);
  const [generated, setGenerated] = useState<string[]>([]);

  const currency = dashboard?.company?.currency || 'USD';
  const kpis = dashboard?.kpis;
  const health = dashboard?.health;
  const company = dashboard?.company;

  const generateTextReport = (reportId: string): string => {
    const now = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    const header = `
================================================================================
  FINCOMMAND — ${company?.name?.toUpperCase() || 'COMPANY'}
  ${REPORTS.find(r => r.id === reportId)?.title?.toUpperCase()}
  Generated: ${now}
================================================================================

`;

    if (reportId === 'executive') {
      return header + `
COMPANY OVERVIEW
----------------
Company:    ${company?.name || '—'}
Industry:   ${company?.industry || '—'}
Country:    ${company?.country || '—'}
Currency:   ${currency}

HEALTH SCORE
------------
Score:      ${health?.score || '—'} / 100
Status:     ${health?.label || '—'}
${(health?.reasons || []).map((r: string) => `• ${r}`).join('\n')}

KEY METRICS
-----------
Monthly Revenue:          ${fmt.currency(kpis?.revenue || 0, currency)}
Monthly Payroll:          ${fmt.currency(kpis?.payroll || 0, currency)}
Operating Expenses:       ${fmt.currency(kpis?.operating_expenses || 0, currency)}
Net Profit:               ${fmt.currency(kpis?.net_profit || 0, currency)}
Profit Margin:            ${kpis?.profit_margin?.toFixed(1)}%
Cash Balance:             ${fmt.currency(kpis?.cash_balance || 0, currency)}
Cash Runway:              ${fmt.months(kpis?.cash_runway_months || 0)}
Payroll Ratio:            ${kpis?.payroll_ratio?.toFixed(1)}%
Employees:                ${kpis?.employee_count || 0}
Revenue Per Employee:     ${fmt.currency(kpis?.revenue_per_employee || 0, currency)}

SMART INSIGHTS
--------------
${(dashboard?.insights || []).map((ins: any) => `[${ins.type.toUpperCase()}] ${ins.title}\n  ${ins.message}`).join('\n\n')}

RECOMMENDATIONS
---------------
${(dashboard?.recommendations || []).map((rec: any) => `[${rec.priority.toUpperCase()}] ${rec.title}\n  ${rec.description}`).join('\n\n')}

================================================================================
`;
    }

    if (reportId === 'payroll') {
      const depts = dashboard?.departments || [];
      return header + `
PAYROLL SUMMARY
---------------
Total Monthly Payroll:    ${fmt.currency(kpis?.payroll || 0, currency)}
Average Monthly Salary:   ${fmt.currency(kpis?.avg_salary_monthly || 0, currency)}
Average Annual Salary:    ${fmt.currency(kpis?.avg_salary_annual || 0, currency)}
Payroll Ratio:            ${kpis?.payroll_ratio?.toFixed(1)}%
Total Employees:          ${kpis?.employee_count || 0}

DEPARTMENT BREAKDOWN
--------------------
${depts.map((d: any) => `${d.name.padEnd(20)} ${String(d.employee_count).padEnd(4)} employees    ${fmt.currency(d.monthly_payroll, currency).padStart(12)}/mo    (${d.payroll_share}%)`).join('\n')}

SALARY DISTRIBUTION
-------------------
${employees.map((e: any) => `${e.name.padEnd(25)} ${e.department.padEnd(20)} ${fmt.currency(e.salary, currency).padStart(12)}/yr`).join('\n')}

================================================================================
`;
    }

    if (reportId === 'employees') {
      return header + `
TEAM OVERVIEW
-------------
Total Employees:    ${employees.length}
Active:             ${employees.filter((e: any) => e.is_active).length}

PERFORMANCE CLASSIFICATIONS
---------------------------
${Object.entries(
        intelligence.reduce((acc: any, emp: any) => {
          acc[emp.classification] = (acc[emp.classification] || 0) + 1;
          return acc;
        }, {})
      ).map(([cls, count]) => `${cls.padEnd(35)} ${count}`).join('\n')}

INDIVIDUAL SCORES
-----------------
${'Name'.padEnd(25)} ${'Department'.padEnd(20)} ${'Overall'.padEnd(10)} Classification
${'-'.repeat(80)}
${intelligence.map((e: any) =>
        `${e.name.padEnd(25)} ${e.department.padEnd(20)} ${String(e.scores.overall).padEnd(10)} ${e.classification}`
      ).join('\n')}

================================================================================
`;
    }

    if (reportId === 'forecast') {
      const fc = forecast?.forecast?.slice(0, 12) || [];
      return header + `
12-MONTH FINANCIAL FORECAST
----------------------------
Month              Revenue          Payroll          Net Profit       Cash Balance
${'-'.repeat(90)}
${fc.map((row: any) =>
        `${row.month.padEnd(19)} ${fmt.currency(row.revenue, currency).padStart(16)} ${fmt.currency(row.payroll, currency).padStart(16)} ${fmt.currency(row.net_profit, currency).padStart(16)} ${fmt.currency(row.cash_balance, currency).padStart(16)}`
      ).join('\n')}

METHODOLOGY
-----------
Monthly Growth Rate: ${((forecast?.growth_rate_monthly || 0)).toFixed(3)}%
Payroll Growth: ~3.6% annual
Confidence decreases with forecast horizon.

================================================================================
`;
    }

    if (reportId === 'financial') {
      const trend = dashboard?.trend || [];
      return header + `
FINANCIAL PERFORMANCE TREND
----------------------------
Month        Revenue          Payroll          OpEx             Net Profit
${'-'.repeat(80)}
${trend.map((row: any) =>
        `${row.month.padEnd(13)} ${fmt.currency(row.revenue, currency).padStart(16)} ${fmt.currency(row.payroll, currency).padStart(16)} ${fmt.currency(row.operating_expenses, currency).padStart(16)} ${fmt.currency(row.net_profit, currency).padStart(16)}`
      ).join('\n')}

CURRENT SNAPSHOT
----------------
Monthly Revenue:          ${fmt.currency(kpis?.revenue || 0, currency)}
Total Monthly Expenses:   ${fmt.currency(kpis?.total_expenses || 0, currency)}
Net Profit:               ${fmt.currency(kpis?.net_profit || 0, currency)}
Profit Margin:            ${kpis?.profit_margin?.toFixed(2)}%
Cash Balance:             ${fmt.currency(kpis?.cash_balance || 0, currency)}
Burn Rate:                ${fmt.currency(kpis?.burn_rate || 0, currency)}/mo
Cash Runway:              ${fmt.months(kpis?.cash_runway_months || 0)}

================================================================================
`;
    }

    return header + 'Report data not available.\n';
  };

  const handleDownload = (reportId: string) => {
    setGenerating(reportId);
    setTimeout(() => {
      const content = generateTextReport(reportId);
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fincommand-${reportId}-report-${new Date().toISOString().split('T')[0]}.txt`;
      a.click();
      URL.revokeObjectURL(url);
      setGenerating(null);
      setGenerated(prev => [...prev, reportId]);
    }, 800);
  };

  if (!dashboard) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <div className="text-center">
          <FileText size={40} className="text-gray-600 mx-auto mb-3" />
          <p className="text-white font-semibold">No data available</p>
          <p className="text-gray-400 text-sm">Complete setup and add employees to generate reports</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white">Reports</h1>
        <p className="text-gray-400 text-sm mt-0.5">Generate comprehensive business reports based on your data</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {REPORTS.map((report, i) => (
          <div key={report.id} className="card p-6 card-hover fade-in flex flex-col"
            style={{ animationDelay: `${i * 0.05}s`, borderTop: `2px solid ${report.color}30` }}>
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 rounded-xl" style={{ background: `${report.color}15` }}>
                <span style={{ color: report.color }}>{report.icon}</span>
              </div>
              {generated.includes(report.id) && (
                <span className="badge text-xs" style={{ background: 'rgba(34,197,94,0.15)', color: '#22C55E' }}>✓ Ready</span>
              )}
            </div>

            <h3 className="text-base font-bold text-white mb-1">{report.title}</h3>
            <p className="text-sm text-gray-400 mb-4 flex-1">{report.description}</p>

            <div className="space-y-1 mb-5">
              {report.sections.map(s => (
                <div key={s} className="flex items-center gap-2 text-xs text-gray-500">
                  <div className="w-1 h-1 rounded-full" style={{ background: report.color }} />
                  {s}
                </div>
              ))}
            </div>

            <button
              onClick={() => handleDownload(report.id)}
              disabled={generating === report.id}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={{
                background: `${report.color}15`,
                border: `1px solid ${report.color}30`,
                color: report.color,
              }}>
              {generating === report.id
                ? <><div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> Generating...</>
                : <><Download size={15} /> Download Report</>
              }
            </button>
          </div>
        ))}
      </div>

      <div className="card p-4" style={{ background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.2)' }}>
        <p className="text-xs text-gray-400">
          <span className="text-blue-400 font-semibold">Reports</span> are generated as formatted text files from your live data. All data stays local — nothing is sent to external servers.
        </p>
      </div>
    </div>
  );
};
