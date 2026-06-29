import React, { useState } from 'react';
import { Settings, Save } from 'lucide-react';
import { updateCompany } from '../services/api';
import { useStore } from '../store/useStore';

export const SettingsPage: React.FC = () => {
  const { company, setCompany } = useStore();
  const [form, setForm] = useState({
    monthly_revenue: String(company?.monthly_revenue || ''),
    cash_balance: String(company?.cash_balance || ''),
    monthly_operating_expenses: String(company?.monthly_operating_expenses || ''),
    expected_revenue_growth: String(company?.expected_revenue_growth || ''),
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await updateCompany({
        monthly_revenue: parseFloat(form.monthly_revenue),
        cash_balance: parseFloat(form.cash_balance),
        monthly_operating_expenses: parseFloat(form.monthly_operating_expenses),
        expected_revenue_growth: parseFloat(form.expected_revenue_growth),
      });
      setCompany(res.data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-xl space-y-6 fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-gray-400 text-sm mt-0.5">Update your company's financial parameters</p>
      </div>

      <div className="card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl" style={{ background: 'rgba(59,130,246,0.15)' }}>
            <Settings size={18} style={{ color: '#3B82F6' }} />
          </div>
          <div>
            <p className="text-white font-bold">{company?.name}</p>
            <p className="text-gray-400 text-xs">{company?.industry} · {company?.country}</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-5">
          {[
            { key: 'monthly_revenue', label: 'Monthly Revenue', hint: 'Your current average monthly revenue' },
            { key: 'cash_balance', label: 'Cash Balance', hint: 'Current cash and liquid assets' },
            { key: 'monthly_operating_expenses', label: 'Monthly Operating Expenses', hint: 'Excluding payroll' },
          ].map(f => (
            <div key={f.key}>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">{f.label}</label>
              <p className="text-xs text-gray-600 mb-2">{f.hint}</p>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-semibold">{company?.currency}</span>
                <input type="number" className="input-field pl-14" value={(form as any)[f.key]}
                  onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} />
              </div>
            </div>
          ))}

          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">
              Expected Annual Revenue Growth: <span style={{ color: '#3B82F6' }}>{form.expected_revenue_growth}%</span>
            </label>
            <input type="range" min="-10" max="50" step="1" value={form.expected_revenue_growth}
              onChange={e => setForm(p => ({ ...p, expected_revenue_growth: e.target.value }))}
              className="w-full accent-blue-500" />
          </div>

          <button type="submit" disabled={saving} className="btn-primary w-full flex items-center justify-center gap-2">
            {saving
              ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : saved
                ? '✓ Saved!'
                : <><Save size={16} /> Save Changes</>
            }
          </button>
        </form>
      </div>
    </div>
  );
};
