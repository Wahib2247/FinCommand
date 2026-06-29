import React from 'react';

interface HealthScoreProps {
  score: number;
  label: string;
  color: string;
  reasons: string[];
  breakdown: Record<string, number>;
}

export const HealthScore: React.FC<HealthScoreProps> = ({ score, label, color, reasons, breakdown }) => {
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (score / 100) * circumference;

  const breakdownLabels: Record<string, string> = {
    profitability: 'Profitability',
    liquidity: 'Liquidity',
    payroll_ratio: 'Payroll Ratio',
    revenue_growth: 'Revenue Growth',
    expense_control: 'Expense Control',
  };

  const maxValues: Record<string, number> = {
    profitability: 25,
    liquidity: 20,
    payroll_ratio: 20,
    revenue_growth: 20,
    expense_control: 15,
  };

  return (
    <div className="card p-6 h-full fade-in">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-5">Company Health Score</h3>
      <div className="flex items-center gap-6 mb-5">
        <div className="relative flex-shrink-0">
          <svg width="128" height="128" viewBox="0 0 128 128">
            <circle cx="64" cy="64" r="54" fill="none" stroke="#1F2937" strokeWidth="10" />
            <circle
              cx="64" cy="64" r="54" fill="none"
              stroke={color} strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              style={{ transform: 'rotate(-90deg)', transformOrigin: '64px 64px', transition: 'stroke-dashoffset 1s ease' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-white">{score}</span>
            <span className="text-xs font-semibold" style={{ color }}>{label}</span>
          </div>
        </div>
        <div className="flex-1 space-y-2">
          {Object.entries(breakdown).map(([key, val]) => (
            <div key={key}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-400">{breakdownLabels[key] || key}</span>
                <span className="text-white font-medium">{val}/{maxValues[key] || 20}</span>
              </div>
              <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${(val / (maxValues[key] || 20)) * 100}%`, background: color }} />
              </div>
            </div>
          ))}
        </div>
      </div>
      {reasons.length > 0 && (
        <div className="space-y-1.5">
          {reasons.map((r, i) => (
            <p key={i} className="text-xs text-gray-400 flex gap-2 items-start">
              <span className="text-blue-400 mt-0.5">•</span> {r}
            </p>
          ))}
        </div>
      )}
    </div>
  );
};
