import React, { useEffect, useState } from 'react';
import {
  DollarSign, TrendingUp, Users, Wallet, Activity, Clock, Target
} from 'lucide-react';
import { getDashboard } from '../../services/api';
import { useStore } from '../../store/useStore';
import { KPICard } from '../ui/KPICard';
import { HealthScore } from './HealthScore';
import { SmartInsights } from './SmartInsights';
import { RevenueExpenseChart, ProfitTrendChart, DeptCostChart, DeptPieChart, SalaryDistChart } from '../charts/Charts';
import { fmt } from '../../utils/format';

const Skeleton: React.FC<{ h?: number }> = ({ h = 80 }) => (
  <div className="skeleton rounded-xl" style={{ height: h }} />
);

export const DashboardPage: React.FC = () => {
  const { dashboard, setDashboard, employees } = useStore();
  const [loading, setLoading] = useState(!dashboard);

  useEffect(() => {
    if (!dashboard) {
      getDashboard().then(r => { setDashboard(r.data); setLoading(false); }).catch(() => setLoading(false));
    }
  }, []);

  const refresh = () => {
    setLoading(true);
    getDashboard().then(r => { setDashboard(r.data); setLoading(false); });
  };

  if (loading) {
    return (
      <div className="p-8 space-y-6">
        <div className="grid grid-cols-4 gap-4">{[...Array(8)].map((_, i) => <Skeleton key={i} />)}</div>
        <div className="grid grid-cols-3 gap-4">{[...Array(3)].map((_, i) => <Skeleton key={i} h={300} />)}</div>
      </div>
    );
  }

  if (!dashboard) return (
    <div className="flex items-center justify-center h-64">
      <p className="text-gray-400">No data available. Add employees to get started.</p>
    </div>
  );

  const { kpis, health, insights, departments, trend, recommendations, company } = dashboard;
  const currency = company?.currency || 'USD';

  return (
    <div className="p-6 space-y-6 fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">{company?.name}</h1>
          <p className="text-gray-400 text-sm mt-0.5">{company?.industry} • Financial Command Center</p>
        </div>
        <button onClick={refresh} className="text-xs px-4 py-2 rounded-lg font-medium text-blue-400 hover:text-blue-300 transition-all"
          style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)' }}>
          Refresh Data
        </button>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard title="Monthly Revenue" value={fmt.currency(kpis.revenue, currency, true)}
          subtitle={`${fmt.pct(kpis.profit_margin)} profit margin`}
          icon={<DollarSign size={16} />} accentColor="#3B82F6" />
        <KPICard title="Monthly Payroll" value={fmt.currency(kpis.payroll, currency, true)}
          subtitle={`${fmt.pct(kpis.payroll_ratio)} of revenue`}
          icon={<Users size={16} />} accentColor="#8B5CF6" />
        <KPICard title="Operating Expenses" value={fmt.currency(kpis.operating_expenses, currency, true)}
          subtitle="Excl. payroll" icon={<Activity size={16} />} accentColor="#F59E0B" />
        <KPICard title="Net Profit" value={fmt.currency(kpis.net_profit, currency, true)}
          subtitle={`${fmt.pct(kpis.profit_margin)} margin`}
          icon={<TrendingUp size={16} />} accentColor={kpis.net_profit >= 0 ? '#22C55E' : '#EF4444'} />
        <KPICard title="Cash Balance" value={fmt.currency(kpis.cash_balance, currency, true)}
          icon={<Wallet size={16} />} accentColor="#22C55E" />
        <KPICard title="Cash Runway" value={fmt.months(kpis.cash_runway_months)}
          subtitle="At current burn rate" icon={<Clock size={16} />}
          accentColor={kpis.cash_runway_months >= 12 ? '#22C55E' : kpis.cash_runway_months >= 6 ? '#F59E0B' : '#EF4444'} />
        <KPICard title="Employees" value={String(kpis.employee_count)}
          subtitle={`Avg ${fmt.currency(kpis.avg_salary_monthly, currency, true)}/mo`}
          icon={<Users size={16} />} accentColor="#06B6D4" />
        <KPICard title="Revenue / Employee" value={fmt.currency(kpis.revenue_per_employee, currency, true)}
          subtitle="Monthly" icon={<Target size={16} />} accentColor="#F97316" />
      </div>

      {/* Health Score + Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <HealthScore score={health.score} label={health.label} color={health.color} reasons={health.reasons} breakdown={health.breakdown} />
        <SmartInsights insights={insights} />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RevenueExpenseChart data={trend} currency={currency} />
        <ProfitTrendChart data={trend} currency={currency} />
      </div>

      {/* Charts Row 2 */}
      {departments.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <DeptCostChart data={departments} currency={currency} />
          </div>
          <DeptPieChart data={departments} />
        </div>
      )}

      {/* Salary Distribution */}
      {employees.length > 0 && (
        <SalaryDistChart employees={employees} currency={currency} />
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="card p-6 fade-in">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-5">Automated Recommendations</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendations.map((rec: any, i: number) => {
              const priorityColors: Record<string, string> = { high: '#EF4444', medium: '#F59E0B', low: '#22C55E' };
              const color = priorityColors[rec.priority] || '#3B82F6';
              return (
                <div key={i} className="p-4 rounded-xl fade-in" style={{ background: '#111827', border: '1px solid rgba(75,85,99,0.3)', animationDelay: `${i * 0.05}s` }}>
                  <div className="flex items-start justify-between mb-2">
                    <span className="badge text-xs" style={{ background: `${color}20`, color }}>{rec.priority} priority</span>
                    <span className="text-xs text-gray-500">{rec.category}</span>
                  </div>
                  <p className="text-sm font-semibold text-white mb-1">{rec.title}</p>
                  <p className="text-xs text-gray-400 leading-relaxed">{rec.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
