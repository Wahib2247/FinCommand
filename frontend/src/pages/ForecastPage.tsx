import React, { useEffect, useState } from 'react';
import { Calendar } from 'lucide-react';
import { getForecast } from '../services/api';
import { useStore } from '../store/useStore';
import { ForecastChart } from '../components/charts/Charts';
import { fmt } from '../utils/format';

const PERIODS = [
  { label: '1 Month', months: 1 },
  { label: '3 Months', months: 3 },
  { label: '6 Months', months: 6 },
  { label: '12 Months', months: 12 },
];

export const ForecastPage: React.FC = () => {
  const { forecast, setForecast, dashboard } = useStore();
  const [loading, setLoading] = useState(!forecast);
  const [period, setPeriod] = useState(12);
  const currency = dashboard?.company?.currency || 'USD';

  const load = async (months: number) => {
    setLoading(true);
    try {
      const res = await getForecast(months);
      setForecast(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(period); }, []);

  const handlePeriod = (m: number) => {
    setPeriod(m);
    load(m);
  };

  const summary = forecast?.summary;
  const forecastData = forecast?.forecast || [];

  const SummaryCard = ({ label, data }: { label: string; data: any }) => {
    if (!data) return null;
    return (
      <div className="card p-5 fade-in">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-2">
          <Calendar size={12} /> {label}
        </p>
        <div className="space-y-2">
          {[
            { key: 'revenue', label: 'Revenue', color: '#3B82F6' },
            { key: 'net_profit', label: 'Profit', color: '#22C55E' },
            { key: 'payroll', label: 'Payroll', color: '#EF4444' },
            { key: 'cash_balance', label: 'Cash', color: '#8B5CF6' },
          ].map(f => (
            <div key={f.key} className="flex justify-between items-center">
              <span className="text-xs text-gray-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: f.color }} />
                {f.label}
              </span>
              <span className="text-sm font-bold text-white">{fmt.currency(data[f.key], currency, true)}</span>
            </div>
          ))}
          <div className="pt-2 border-t border-gray-700">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400">Confidence</span>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-20 rounded-full bg-gray-700 overflow-hidden">
                  <div className="h-full rounded-full bg-blue-500" style={{ width: `${(data.confidence || 0.9) * 100}%` }} />
                </div>
                <span className="text-xs text-gray-300">{Math.round((data.confidence || 0.9) * 100)}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6 fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Financial Forecast</h1>
          <p className="text-gray-400 text-sm mt-0.5">Revenue, profit, payroll and cash projections</p>
        </div>
        <div className="flex gap-2">
          {PERIODS.map(p => (
            <button key={p.months} onClick={() => handlePeriod(p.months)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={period === p.months
                ? { background: '#3B82F6', color: 'white' }
                : { background: '#1F2937', color: '#9CA3AF', border: '1px solid rgba(75,85,99,0.3)' }}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          <div className="skeleton h-72 rounded-xl" />
          <div className="grid grid-cols-4 gap-4">{[...Array(4)].map((_, i) => <div key={i} className="skeleton h-40 rounded-xl" />)}</div>
        </div>
      ) : (
        <>
          <ForecastChart data={forecastData} currency={currency} />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {summary?.['1_month'] && <SummaryCard label="1 Month" data={summary['1_month']} />}
            {summary?.['3_months'] && <SummaryCard label="3 Months" data={summary['3_months']} />}
            {summary?.['6_months'] && <SummaryCard label="6 Months" data={summary['6_months']} />}
            {summary?.['12_months'] && <SummaryCard label="12 Months" data={summary['12_months']} />}
          </div>

          {forecast && (
            <div className="card p-5 fade-in">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">Detailed Forecast Table</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(75,85,99,0.3)' }}>
                      {['Month', 'Revenue', 'Payroll', 'OpEx', 'Net Profit', 'Cash Balance', 'Confidence'].map(h => (
                        <th key={h} className="p-3 text-left font-semibold uppercase tracking-wider text-gray-400">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {forecastData.map((row: any, i: number) => (
                      <tr key={i} style={{ borderBottom: '1px solid rgba(75,85,99,0.15)' }}
                        className="hover:bg-gray-800/30 transition-colors">
                        <td className="p-3 font-medium text-gray-300">{row.month}</td>
                        <td className="p-3 font-semibold text-blue-400">{fmt.currency(row.revenue, currency, true)}</td>
                        <td className="p-3 text-red-400">{fmt.currency(row.payroll, currency, true)}</td>
                        <td className="p-3 text-yellow-400">{fmt.currency(row.operating_expenses, currency, true)}</td>
                        <td className="p-3 font-semibold" style={{ color: row.net_profit >= 0 ? '#22C55E' : '#EF4444' }}>
                          {fmt.currency(row.net_profit, currency, true)}
                        </td>
                        <td className="p-3 text-purple-400">{fmt.currency(row.cash_balance, currency, true)}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <div className="h-1 w-12 rounded-full bg-gray-700 overflow-hidden">
                              <div className="h-full rounded-full bg-blue-500" style={{ width: `${row.confidence * 100}%` }} />
                            </div>
                            <span className="text-gray-400">{Math.round(row.confidence * 100)}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="card p-4 fade-in" style={{ border: '1px solid rgba(59,130,246,0.2)', background: 'rgba(59,130,246,0.05)' }}>
            <p className="text-xs text-gray-400">
              <span className="text-blue-400 font-semibold">Forecast methodology:</span> Projections use compound growth modeling based on your configured revenue growth rate, historical snapshots (if available), and industry-standard payroll growth assumptions. Confidence decreases with forecast horizon.
            </p>
          </div>
        </>
      )}
    </div>
  );
};
