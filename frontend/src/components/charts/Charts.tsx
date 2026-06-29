import React from 'react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { fmt } from '../../utils/format';

const COLORS = ['#3B82F6', '#8B5CF6', '#22C55E', '#F59E0B', '#EF4444', '#06B6D4', '#F97316'];

const CustomTooltip = ({ active, payload, label, currency = 'USD' }: any) => {
  if (active && payload?.length) {
    return (
      <div className="card p-3 shadow-2xl" style={{ border: '1px solid rgba(75,85,99,0.5)', minWidth: 160 }}>
        <p className="text-xs text-gray-400 mb-2 font-medium">{label}</p>
        {payload.map((p: any, i: number) => (
          <div key={i} className="flex items-center gap-2 text-xs mb-1">
            <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
            <span className="text-gray-300">{p.name}:</span>
            <span className="font-semibold text-white">{fmt.currency(p.value, currency, true)}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export const RevenueExpenseChart: React.FC<{ data: any[]; currency?: string }> = ({ data, currency = 'USD' }) => (
  <div className="card p-5 fade-in">
    <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">Revenue vs Expenses Trend</h3>
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#EF4444" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
        <XAxis dataKey="month" stroke="#4B5563" tick={{ fontSize: 11, fill: '#9CA3AF' }} />
        <YAxis stroke="#4B5563" tick={{ fontSize: 11, fill: '#9CA3AF' }} tickFormatter={(v) => fmt.currency(v, currency, true)} />
        <Tooltip content={<CustomTooltip currency={currency} />} />
        <Legend wrapperStyle={{ fontSize: 12, color: '#9CA3AF' }} />
        <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#3B82F6" fill="url(#revGrad)" strokeWidth={2} dot={false} />
        <Area type="monotone" dataKey="operating_expenses" name="OpEx" stroke="#F59E0B" fill="none" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
        <Area type="monotone" dataKey="payroll" name="Payroll" stroke="#EF4444" fill="url(#expGrad)" strokeWidth={2} dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  </div>
);

export const ProfitTrendChart: React.FC<{ data: any[]; currency?: string }> = ({ data, currency = 'USD' }) => (
  <div className="card p-5 fade-in">
    <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">Profit Trend</h3>
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id="profGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#22C55E" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
        <XAxis dataKey="month" stroke="#4B5563" tick={{ fontSize: 11, fill: '#9CA3AF' }} />
        <YAxis stroke="#4B5563" tick={{ fontSize: 11, fill: '#9CA3AF' }} tickFormatter={(v) => fmt.currency(v, currency, true)} />
        <Tooltip content={<CustomTooltip currency={currency} />} />
        <Area type="monotone" dataKey="net_profit" name="Net Profit" stroke="#22C55E" fill="url(#profGrad)" strokeWidth={2} dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  </div>
);

export const DeptCostChart: React.FC<{ data: any[]; currency?: string }> = ({ data, currency = 'USD' }) => (
  <div className="card p-5 fade-in">
    <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">Department Payroll Breakdown</h3>
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 20, bottom: 0, left: 60 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" horizontal={false} />
        <XAxis type="number" stroke="#4B5563" tick={{ fontSize: 11, fill: '#9CA3AF' }} tickFormatter={(v) => fmt.currency(v, currency, true)} />
        <YAxis type="category" dataKey="name" stroke="#4B5563" tick={{ fontSize: 11, fill: '#9CA3AF' }} width={60} />
        <Tooltip content={<CustomTooltip currency={currency} />} />
        <Bar dataKey="monthly_payroll" name="Monthly Payroll" radius={[0, 4, 4, 0]}>
          {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  </div>
);

export const SalaryDistChart: React.FC<{ employees: any[]; currency?: string }> = ({ employees, currency: _c = 'USD' }) => {
  const buckets: Record<string, number> = {};
  employees.forEach((e) => {
    const monthly = e.salary / 12;
    const bucket = monthly < 3000 ? '<3K' : monthly < 5000 ? '3-5K' : monthly < 8000 ? '5-8K' : monthly < 12000 ? '8-12K' : '>12K';
    buckets[bucket] = (buckets[bucket] || 0) + 1;
  });
  const data = ['<3K', '3-5K', '5-8K', '8-12K', '>12K'].map((b) => ({ range: b, count: buckets[b] || 0 })).filter(d => d.count > 0);

  return (
    <div className="card p-5 fade-in">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">Monthly Salary Distribution</h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
          <XAxis dataKey="range" stroke="#4B5563" tick={{ fontSize: 11, fill: '#9CA3AF' }} />
          <YAxis stroke="#4B5563" tick={{ fontSize: 11, fill: '#9CA3AF' }} />
          <Tooltip contentStyle={{ background: '#1F2937', border: '1px solid #374151', borderRadius: 8 }} />
          <Bar dataKey="count" name="Employees" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export const ForecastChart: React.FC<{ data: any[]; currency?: string }> = ({ data, currency = 'USD' }) => (
  <div className="card p-5 fade-in">
    <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">12-Month Financial Forecast</h3>
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
        <XAxis dataKey="month" stroke="#4B5563" tick={{ fontSize: 10, fill: '#9CA3AF' }} />
        <YAxis stroke="#4B5563" tick={{ fontSize: 11, fill: '#9CA3AF' }} tickFormatter={(v) => fmt.currency(v, currency, true)} />
        <Tooltip content={<CustomTooltip currency={currency} />} />
        <Legend wrapperStyle={{ fontSize: 12, color: '#9CA3AF' }} />
        <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#3B82F6" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="net_profit" name="Profit" stroke="#22C55E" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="payroll" name="Payroll" stroke="#EF4444" strokeWidth={1.5} strokeDasharray="5 5" dot={false} />
      </LineChart>
    </ResponsiveContainer>
  </div>
);

export const DeptPieChart: React.FC<{ data: any[] }> = ({ data }) => (
  <div className="card p-5 fade-in">
    <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">Department Share</h3>
    <div className="flex items-center gap-4">
      <ResponsiveContainer width={160} height={160}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={45} outerRadius={72} dataKey="monthly_payroll" paddingAngle={3}>
            {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Pie>
          <Tooltip contentStyle={{ background: '#1F2937', border: '1px solid #374151', borderRadius: 8, fontSize: 12 }} />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex-1 space-y-2">
        {data.map((d, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
              <span className="text-xs text-gray-300">{d.name}</span>
            </div>
            <span className="text-xs font-semibold text-white">{d.payroll_share}%</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);
