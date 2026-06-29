import React, { useEffect, useState } from 'react';
import { Zap, TrendingUp, Shield, Target, Activity } from 'lucide-react';
import { getEmployeeIntelligence } from '../services/api';
import { useStore } from '../store/useStore';
import { scoreColor, fmt } from '../utils/format';

const ScoreBar: React.FC<{ label: string; value: number; icon: React.ReactNode }> = ({ label, value, icon }) => (
  <div>
    <div className="flex items-center justify-between mb-1">
      <div className="flex items-center gap-1.5 text-xs text-gray-400">{icon} {label}</div>
      <span className="text-xs font-bold" style={{ color: scoreColor(value) }}>{value}</span>
    </div>
    <div className="h-1.5 rounded-full bg-gray-700 overflow-hidden">
      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${value}%`, background: scoreColor(value) }} />
    </div>
  </div>
);

export const IntelligencePage: React.FC = () => {
  const { intelligence, setIntelligence, dashboard } = useStore();
  const [loading, setLoading] = useState(intelligence.length === 0);
  const [selected, setSelected] = useState<any>(null);
  const currency = dashboard?.company?.currency || 'USD';

  useEffect(() => {
    if (intelligence.length === 0) {
      getEmployeeIntelligence().then(r => { setIntelligence(r.data.employees); setLoading(false); }).catch(() => setLoading(false));
    }
  }, []);

  const classGroups: Record<string, any[]> = {};
  intelligence.forEach(e => {
    if (!classGroups[e.classification]) classGroups[e.classification] = [];
    classGroups[e.classification].push(e);
  });

  if (loading) {
    return <div className="p-6 grid grid-cols-3 gap-4">{[...Array(6)].map((_, i) => <div key={i} className="skeleton h-48 rounded-xl" />)}</div>;
  }

  if (intelligence.length === 0) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <div className="text-center">
          <Zap size={40} className="text-gray-600 mx-auto mb-3" />
          <p className="text-white font-semibold mb-1">No employee data yet</p>
          <p className="text-gray-400 text-sm">Add employees to unlock intelligence insights</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white">Employee Intelligence</h1>
        <p className="text-gray-400 text-sm mt-0.5">AI-powered performance insights based on transparent, explainable heuristics</p>
      </div>

      {/* Classification Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {Object.entries(classGroups).map(([cls, emps]) => {
          const color = emps[0]?.classification_color || '#3B82F6';
          return (
            <div key={cls} className="card p-4 text-center">
              <div className="text-2xl font-bold mb-1" style={{ color }}>{emps.length}</div>
              <div className="text-xs text-gray-400">{cls}</div>
            </div>
          );
        })}
      </div>

      {/* Employee Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {intelligence.map((emp: any, i: number) => (
          <div key={emp.id} className="card p-5 cursor-pointer card-hover fade-in"
            style={{ animationDelay: `${i * 0.04}s`, borderTop: `2px solid ${emp.classification_color}40` }}
            onClick={() => setSelected(selected?.id === emp.id ? null : emp)}>

            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold"
                  style={{ background: `${emp.classification_color}20`, color: emp.classification_color }}>
                  {emp.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{emp.name}</p>
                  <p className="text-xs text-gray-400">{emp.position}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold" style={{ color: scoreColor(emp.scores.overall) }}>{emp.scores.overall}</div>
                <div className="text-xs text-gray-500">Overall</div>
              </div>
            </div>

            <span className="badge text-xs mb-3 inline-flex"
              style={{ background: `${emp.classification_color}20`, color: emp.classification_color }}>
              {emp.classification}
            </span>

            <div className="space-y-2">
              <ScoreBar label="Productivity" value={emp.scores.productivity} icon={<Activity size={10} />} />
              <ScoreBar label="Cost Efficiency" value={emp.scores.cost_efficiency} icon={<Target size={10} />} />
              <ScoreBar label="Growth" value={emp.scores.growth} icon={<TrendingUp size={10} />} />
              <ScoreBar label="Reliability" value={emp.scores.reliability} icon={<Shield size={10} />} />
            </div>

            {selected?.id === emp.id && (
              <div className="mt-4 pt-4 border-t border-gray-700 fade-in">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Why this score?</p>
                <div className="space-y-1.5">
                  {emp.explanation.map((e: string, j: number) => (
                    <p key={j} className="text-xs text-gray-300 flex gap-2 items-start">
                      <span className="text-blue-400 mt-0.5 flex-shrink-0">•</span> {e}
                    </p>
                  ))}
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-500">Tenure</span>
                    <p className="text-white font-medium">{(emp.tenure_months / 12).toFixed(1)} years</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Annual Salary</span>
                    <p className="text-white font-medium">{fmt.currency(emp.salary, currency)}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Department</span>
                    <p className="text-white font-medium">{emp.department}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Status</span>
                    <p className="text-white font-medium capitalize">{emp.employment_status.replace('_', ' ')}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-600 text-center">Scores are calculated from available data using transparent business heuristics. Click any card to see the full explanation.</p>
    </div>
  );
};
