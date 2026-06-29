import React from 'react';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Info, Clock, Shield, Users, PieChart, Rocket, UserPlus } from 'lucide-react';

const iconMap: Record<string, React.ReactNode> = {
  'alert': <AlertTriangle size={16} />,
  'check': <CheckCircle size={16} />,
  'info': <Info size={16} />,
  'clock': <Clock size={16} />,
  'shield': <Shield size={16} />,
  'trending-up': <TrendingUp size={16} />,
  'trending-down': <TrendingDown size={16} />,
  'users': <Users size={16} />,
  'pie-chart': <PieChart size={16} />,
  'rocket': <Rocket size={16} />,
  'user-plus': <UserPlus size={16} />,
  'alert-triangle': <AlertTriangle size={16} />,
};

const typeStyles: Record<string, { bg: string; border: string; color: string }> = {
  success: { bg: 'rgba(34,197,94,0.08)', border: 'rgba(34,197,94,0.25)', color: '#22C55E' },
  warning: { bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.25)', color: '#F59E0B' },
  danger: { bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.25)', color: '#EF4444' },
  info: { bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.25)', color: '#3B82F6' },
};

interface Insight {
  type: string;
  icon: string;
  title: string;
  message: string;
}

export const SmartInsights: React.FC<{ insights: Insight[] }> = ({ insights }) => (
  <div className="card p-6 fade-in">
    <div className="flex items-center justify-between mb-5">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">Smart Insights</h3>
      <span className="badge" style={{ background: 'rgba(59,130,246,0.15)', color: '#3B82F6' }}>{insights.length} insights</span>
    </div>
    <div className="space-y-3">
      {insights.map((insight, i) => {
        const style = typeStyles[insight.type] || typeStyles.info;
        return (
          <div key={i} className="rounded-xl p-4 flex gap-3 fade-in"
            style={{ background: style.bg, border: `1px solid ${style.border}`, animationDelay: `${i * 0.05}s` }}>
            <div className="flex-shrink-0 mt-0.5" style={{ color: style.color }}>
              {iconMap[insight.icon] || <Info size={16} />}
            </div>
            <div>
              <p className="text-sm font-semibold text-white mb-0.5">{insight.title}</p>
              <p className="text-xs text-gray-400 leading-relaxed">{insight.message}</p>
            </div>
          </div>
        );
      })}
    </div>
  </div>
);
