import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string;
  subtitle?: string;
  delta?: number;
  deltaLabel?: string;
  icon: React.ReactNode;
  accentColor?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const KPICard: React.FC<KPICardProps> = ({
  title, value, subtitle, delta, deltaLabel, icon, accentColor = '#3B82F6', size = 'md'
}) => {
  const hasDelta = delta !== undefined;
  const isPositive = (delta ?? 0) >= 0;

  return (
    <div className="metric-card card-hover fade-in" style={{ borderTop: `2px solid ${accentColor}20` }}>
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">{title}</p>
        <div className="p-2 rounded-lg" style={{ background: `${accentColor}20` }}>
          <span style={{ color: accentColor }}>{icon}</span>
        </div>
      </div>
      <p className={`font-bold text-white mb-1 ${size === 'lg' ? 'text-3xl' : size === 'sm' ? 'text-xl' : 'text-2xl'}`}>
        {value}
      </p>
      {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
      {hasDelta && (
        <div className="flex items-center gap-1.5 mt-2">
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
            style={{ background: isPositive ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)', color: isPositive ? '#22C55E' : '#EF4444' }}>
            {isPositive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
            {delta! >= 0 ? '+' : ''}{delta!.toFixed(1)}%
          </div>
          {deltaLabel && <span className="text-xs text-gray-500">{deltaLabel}</span>}
        </div>
      )}
    </div>
  );
};
