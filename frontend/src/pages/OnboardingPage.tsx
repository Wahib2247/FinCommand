import React, { useState } from 'react';
import { Building2, Globe, DollarSign, TrendingUp, ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { setupCompany } from '../services/api';
import { useStore } from '../store/useStore';

interface OnboardingProps {
  onComplete: () => void;
}

const INDUSTRIES = ['Technology', 'Finance', 'Healthcare', 'Retail', 'Manufacturing', 'Education', 'Consulting', 'Media', 'Real Estate', 'Other'];
const CURRENCIES = ['USD', 'EUR', 'GBP', 'PKR', 'AED', 'CAD', 'AUD', 'INR', 'SGD'];
const COUNTRIES = ['United States', 'United Kingdom', 'Pakistan', 'Canada', 'Australia', 'Germany', 'UAE', 'India', 'Singapore', 'Other'];

const steps = [
  { id: 0, title: 'Company Identity', subtitle: 'Tell us about your organization', icon: <Building2 size={22} /> },
  { id: 1, title: 'Location & Currency', subtitle: 'Where do you operate?', icon: <Globe size={22} /> },
  { id: 2, title: 'Financial Snapshot', subtitle: 'Current financial position', icon: <DollarSign size={22} /> },
  { id: 3, title: 'Growth Expectations', subtitle: 'Where are you headed?', icon: <TrendingUp size={22} /> },
];

export const OnboardingPage: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { setCompany } = useStore();

  const [form, setForm] = useState({
    name: '', industry: '', country: '', currency: 'USD',
    monthly_revenue: '', cash_balance: '', monthly_operating_expenses: '', expected_revenue_growth: '10',
  });

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const canNext = () => {
    if (step === 0) return form.name.trim() && form.industry;
    if (step === 1) return form.country && form.currency;
    if (step === 2) return form.monthly_revenue && form.cash_balance && form.monthly_operating_expenses;
    return true;
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await setupCompany({
        ...form,
        monthly_revenue: parseFloat(form.monthly_revenue),
        cash_balance: parseFloat(form.cash_balance),
        monthly_operating_expenses: parseFloat(form.monthly_operating_expenses),
        expected_revenue_growth: parseFloat(form.expected_revenue_growth),
      });
      setCompany(res.data);
      onComplete();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save company');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#0B1220' }}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div style={{ position: 'absolute', top: '10%', left: '20%', width: 500, height: 500, background: 'radial-gradient(circle, rgba(59,130,246,0.07) 0%, transparent 70%)', borderRadius: '50%' }} />
      </div>

      <div className="w-full max-w-xl relative z-10 fade-in">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-1">Set Up Your Command Center</h1>
          <p className="text-gray-400 text-sm">Just a few details — we'll handle the rest</p>
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-center mb-8 gap-2">
          {steps.map((s, i) => (
            <React.Fragment key={i}>
              <div className="flex items-center gap-1.5">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all`}
                  style={i < step ? { background: '#22C55E', color: 'white' } : i === step ? { background: '#3B82F6', color: 'white' } : { background: '#1F2937', color: '#6B7280' }}>
                  {i < step ? <Check size={12} /> : i + 1}
                </div>
                <span className="text-xs hidden sm:block" style={{ color: i === step ? '#F9FAFB' : '#6B7280' }}>{s.title}</span>
              </div>
              {i < steps.length - 1 && <div className="flex-1 h-px" style={{ background: i < step ? '#22C55E' : '#1F2937', maxWidth: 40 }} />}
            </React.Fragment>
          ))}
        </div>

        <div className="card p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-xl" style={{ background: 'rgba(59,130,246,0.15)' }}>
              <span style={{ color: '#3B82F6' }}>{steps[step].icon}</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">{steps[step].title}</h2>
              <p className="text-sm text-gray-400">{steps[step].subtitle}</p>
            </div>
          </div>

          {step === 0 && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">Company Name</label>
                <input className="input-field" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Acme Corp" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">Industry</label>
                <div className="grid grid-cols-2 gap-2">
                  {INDUSTRIES.map(ind => (
                    <button key={ind} onClick={() => set('industry', ind)}
                      className="p-2.5 rounded-lg text-sm text-left transition-all"
                      style={form.industry === ind ? { background: 'rgba(59,130,246,0.2)', border: '1px solid #3B82F6', color: 'white' } : { background: '#111827', border: '1px solid rgba(75,85,99,0.3)', color: '#9CA3AF' }}>
                      {ind}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">Country</label>
                <div className="grid grid-cols-2 gap-2">
                  {COUNTRIES.map(c => (
                    <button key={c} onClick={() => set('country', c)}
                      className="p-2.5 rounded-lg text-sm text-left transition-all"
                      style={form.country === c ? { background: 'rgba(59,130,246,0.2)', border: '1px solid #3B82F6', color: 'white' } : { background: '#111827', border: '1px solid rgba(75,85,99,0.3)', color: '#9CA3AF' }}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">Currency</label>
                <div className="flex flex-wrap gap-2">
                  {CURRENCIES.map(c => (
                    <button key={c} onClick={() => set('currency', c)}
                      className="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                      style={form.currency === c ? { background: '#3B82F6', color: 'white' } : { background: '#111827', border: '1px solid rgba(75,85,99,0.3)', color: '#9CA3AF' }}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              {[
                { key: 'monthly_revenue', label: 'Monthly Revenue', placeholder: '50000', hint: 'Average monthly revenue' },
                { key: 'cash_balance', label: 'Current Cash Balance', placeholder: '200000', hint: 'Cash + liquid assets' },
                { key: 'monthly_operating_expenses', label: 'Monthly Operating Expenses', placeholder: '15000', hint: 'Excluding payroll' },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">{f.label}</label>
                  <p className="text-xs text-gray-500 mb-2">{f.hint}</p>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-semibold text-sm">{form.currency}</span>
                    <input type="number" className="input-field pl-12" value={(form as any)[f.key]} onChange={e => set(f.key, e.target.value)} placeholder={f.placeholder} min="0" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">
                  Expected Annual Revenue Growth: <span style={{ color: '#3B82F6' }}>{form.expected_revenue_growth}%</span>
                </label>
                <input type="range" min="-10" max="50" step="1" value={form.expected_revenue_growth}
                  onChange={e => set('expected_revenue_growth', e.target.value)}
                  className="w-full accent-blue-500" />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>-10% (Declining)</span><span>0% (Stable)</span><span>+50% (Hyper-growth)</span>
                </div>
              </div>
              <div className="p-4 rounded-xl" style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)' }}>
                <p className="text-sm font-semibold text-white mb-2">Ready to launch your command center</p>
                <p className="text-xs text-gray-400">From these {Object.keys(form).length} inputs, we'll generate over 100 business insights automatically.</p>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 rounded-lg text-sm text-red-400" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
              {error}
            </div>
          )}

          <div className="flex gap-3 mt-8">
            {step > 0 && (
              <button onClick={() => setStep(s => s - 1)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-300 transition-all hover:text-white"
                style={{ background: '#111827', border: '1px solid rgba(75,85,99,0.4)' }}>
                <ArrowLeft size={16} /> Back
              </button>
            )}
            <button
              onClick={step < 3 ? () => { if (canNext()) setStep(s => s + 1); } : handleSubmit}
              disabled={!canNext() || loading}
              className="btn-primary flex-1 flex items-center justify-center gap-2">
              {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : (
                <>{step < 3 ? 'Continue' : 'Launch Command Center'} <ArrowRight size={16} /></>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
