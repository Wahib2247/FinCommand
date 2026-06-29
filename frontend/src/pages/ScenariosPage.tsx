import React, { useState } from 'react';
import { FlaskConical, TrendingUp, TrendingDown, Minus, RefreshCcw } from 'lucide-react';
import { runScenario } from '../services/api';
import { useStore } from '../store/useStore';
import { fmt, deltaColor, deltaBg } from '../utils/format';

const SliderField: React.FC<{
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (v: number) => void;
  color?: string;
}> = ({ label, value, min, max, step, unit, onChange, color = '#3B82F6' }) => (
  <div className="space-y-2">
    <div className="flex justify-between items-center">
      <label className="text-sm font-semibold text-gray-300">{label}</label>
      <span className="text-sm font-bold px-3 py-1 rounded-lg" style={{ background: `${color}20`, color }}>
        {value >= 0 ? '+' : ''}{value}{unit}
      </span>
    </div>
    <input
      type="range" min={min} max={max} step={step} value={value}
      onChange={e => onChange(parseFloat(e.target.value))}
      className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
      style={{ accentColor: color }}
    />
    <div className="flex justify-between text-xs text-gray-600">
      <span>{min}{unit}</span>
      <span>0</span>
      <span>+{max}{unit}</span>
    </div>
  </div>
);

const DeltaBadge: React.FC<{ value: number; format?: 'currency' | 'pct'; currency?: string }> = ({ value, format = 'currency', currency = 'USD' }) => {
  const isPos = value >= 0;
  const Icon = value > 0 ? TrendingUp : value < 0 ? TrendingDown : Minus;
  return (
    <div className="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full"
      style={{ background: deltaBg(value), color: deltaColor(value) }}>
      <Icon size={10} />
      {isPos ? '+' : ''}{format === 'currency' ? fmt.currency(Math.abs(value), currency, true) : `${value.toFixed(1)}%`}
    </div>
  );
};

export const ScenariosPage: React.FC = () => {
  const { dashboard } = useStore();
  const currency = dashboard?.company?.currency || 'USD';
  const baseline = dashboard?.kpis;

  const [params, setParams] = useState({
    revenue_growth_delta: 0,
    salary_increase: 0,
    new_hires: 0,
    avg_new_hire_salary: null as number | null,
    operating_expense_change: 0,
  });

  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const set = (k: string) => (v: number) => setParams(p => ({ ...p, [k]: v }));

  const simulate = async () => {
    setLoading(true);
    try {
      const res = await runScenario(params);
      setResult(res.data);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setParams({ revenue_growth_delta: 0, salary_increase: 0, new_hires: 0, avg_new_hire_salary: null, operating_expense_change: 0 });
    setResult(null);
  };

  const sim = result?.scenario?.simulated;
  const delta = result?.scenario?.delta;

  const hasChanges = params.revenue_growth_delta !== 0 || params.salary_increase !== 0 ||
    params.new_hires !== 0 || params.operating_expense_change !== 0;

  return (
    <div className="p-6 space-y-6 fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Scenario Simulator</h1>
          <p className="text-gray-400 text-sm mt-0.5">Explore what-if scenarios and see the instant financial impact</p>
        </div>
        {hasChanges && (
          <button onClick={reset} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-gray-400 hover:text-white transition-all"
            style={{ background: '#1F2937', border: '1px solid rgba(75,85,99,0.4)' }}>
            <RefreshCcw size={14} /> Reset
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Controls */}
        <div className="card p-6 space-y-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl" style={{ background: 'rgba(139,92,246,0.15)' }}>
              <FlaskConical size={18} style={{ color: '#8B5CF6' }} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Adjust Variables</h2>
              <p className="text-xs text-gray-400">Move sliders to simulate different business conditions</p>
            </div>
          </div>

          <SliderField label="Revenue Growth Change" value={params.revenue_growth_delta}
            min={-30} max={50} step={1} unit="%" onChange={set('revenue_growth_delta')} color="#3B82F6" />

          <SliderField label="Salary Increase" value={params.salary_increase}
            min={0} max={30} step={0.5} unit="%" onChange={set('salary_increase')} color="#F59E0B" />

          <div className="space-y-3">
            <SliderField label="New Hires" value={params.new_hires}
              min={0} max={20} step={1} unit=" people" onChange={set('new_hires')} color="#22C55E" />
            {params.new_hires > 0 && (
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">
                  Avg New Hire Annual Salary (leave blank to use team average)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">{currency}</span>
                  <input type="number" className="input-field pl-12"
                    placeholder={baseline ? String(Math.round(baseline.avg_salary_annual)) : '60000'}
                    onChange={e => setParams(p => ({ ...p, avg_new_hire_salary: e.target.value ? parseFloat(e.target.value) : null }))}
                  />
                </div>
              </div>
            )}
          </div>

          <SliderField label="Operating Expense Change" value={params.operating_expense_change}
            min={-30} max={50} step={1} unit="%" onChange={set('operating_expense_change')} color="#EF4444" />

          <button onClick={simulate} disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2 mt-4">
            {loading
              ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : <><FlaskConical size={16} /> Run Simulation</>}
          </button>
        </div>

        {/* Results */}
        <div className="space-y-4">
          {!result && !loading && (
            <div className="card p-12 text-center h-full flex flex-col items-center justify-center">
              <FlaskConical size={40} className="text-gray-600 mb-3" />
              <p className="text-white font-semibold mb-1">Adjust sliders and run simulation</p>
              <p className="text-gray-400 text-sm">See the real-time financial impact of any business decision</p>
            </div>
          )}

          {loading && (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-24 rounded-xl" />)}
            </div>
          )}

          {sim && (
            <div className="space-y-4 fade-in">
              {/* Scenario tag */}
              <div className="flex items-center gap-2 text-xs">
                <span className="badge" style={{ background: 'rgba(139,92,246,0.2)', color: '#8B5CF6' }}>SIMULATED</span>
                <span className="text-gray-500">vs baseline</span>
              </div>

              {/* KPI comparisons */}
              {[
                { label: 'Monthly Revenue', baseKey: 'revenue', simKey: 'revenue', deltaKey: 'revenue', color: '#3B82F6' },
                { label: 'Monthly Payroll', baseKey: 'payroll', simKey: 'payroll', deltaKey: 'payroll', color: '#EF4444' },
                { label: 'Net Profit', baseKey: 'net_profit', simKey: 'net_profit', deltaKey: 'net_profit', color: '#22C55E' },
              ].map(item => (
                <div key={item.label} className="card p-4">
                  <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-3">{item.label}</p>
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Baseline</p>
                      <p className="text-lg font-bold text-gray-300">{fmt.currency(baseline?.[item.baseKey] || 0, currency, true)}</p>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <DeltaBadge value={delta?.[item.deltaKey] || 0} currency={currency} />
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 mb-1">Simulated</p>
                      <p className="text-lg font-bold" style={{ color: item.color }}>{fmt.currency(sim[item.simKey] || 0, currency, true)}</p>
                    </div>
                  </div>
                  <div className="mt-3 h-1 rounded-full bg-gray-700 overflow-hidden relative">
                    <div className="h-full rounded-full" style={{ width: '50%', background: '#374151', position: 'absolute', left: 0 }} />
                    <div className="h-full rounded-full absolute left-0 transition-all duration-700"
                      style={{
                        width: `${Math.min(100, Math.max(0, (sim[item.simKey] / (baseline?.[item.baseKey] || 1)) * 50))}%`,
                        background: item.color
                      }} />
                  </div>
                </div>
              ))}

              {/* Health + other metrics */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Employees', value: sim.employee_count, baseline: baseline?.employee_count, suffix: '' },
                  { label: 'Payroll Ratio', value: sim.payroll_ratio, baseline: baseline?.payroll_ratio, suffix: '%' },
                  { label: 'Profit Margin', value: sim.profit_margin, baseline: baseline?.profit_margin, suffix: '%' },
                  { label: 'Cash Runway', value: sim.cash_runway_months, baseline: baseline?.cash_runway_months, suffix: ' mo' },
                ].map(m => {
                  const diff = m.value - (m.baseline || 0);
                  return (
                    <div key={m.label} className="card p-4">
                      <p className="text-xs text-gray-400 mb-1">{m.label}</p>
                      <p className="text-xl font-bold text-white">{typeof m.value === 'number' ? m.value.toFixed(1) : m.value}{m.suffix}</p>
                      <div className="flex items-center gap-1 mt-1 text-xs" style={{ color: deltaColor(diff) }}>
                        {diff > 0 ? <TrendingUp size={10} /> : diff < 0 ? <TrendingDown size={10} /> : <Minus size={10} />}
                        {diff >= 0 ? '+' : ''}{diff.toFixed(1)}{m.suffix} from baseline
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Health Score */}
              <div className="card p-4">
                <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-3">Health Score</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Baseline</p>
                    <p className="text-2xl font-bold text-gray-300">{dashboard?.health?.score || '—'}</p>
                  </div>
                  <div className="text-2xl font-bold text-gray-500">→</div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 mb-1">Simulated</p>
                    <p className="text-2xl font-bold" style={{ color: sim.health_score >= 70 ? '#22C55E' : sim.health_score >= 50 ? '#F59E0B' : '#EF4444' }}>
                      {sim.health_score}
                    </p>
                    <p className="text-xs text-gray-400">{sim.health_label}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
