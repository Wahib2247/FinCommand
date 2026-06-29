import React, { useEffect, useState } from 'react';
import { UserPlus, Upload, Trash2, Search, X, Check, Users } from 'lucide-react';
import { getEmployees, addEmployee, deleteEmployee, importCSV } from '../services/api';
import { useStore } from '../store/useStore';
import { fmt } from '../utils/format';

const statusColors: Record<string, string> = {
  full_time: '#22C55E', part_time: '#3B82F6', contract: '#F59E0B', intern: '#8B5CF6',
};
const statusLabels: Record<string, string> = {
  full_time: 'Full-Time', part_time: 'Part-Time', contract: 'Contract', intern: 'Intern',
};

const DEPT_COLORS = ['#3B82F6', '#8B5CF6', '#22C55E', '#F59E0B', '#EF4444', '#06B6D4'];

const AddModal: React.FC<{ onClose: () => void; onAdded: () => void }> = ({ onClose, onAdded }) => {
  const [form, setForm] = useState({
    name: '', department: '', position: '', salary: '',
    joining_date: new Date().toISOString().split('T')[0],
    working_hours: '40', employment_status: 'full_time',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addEmployee({
        ...form,
        salary: parseFloat(form.salary),
        working_hours: parseFloat(form.working_hours),
        joining_date: new Date(form.joining_date).toISOString(),
      });
      onAdded(); onClose();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to add employee');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
      <div className="card p-6 w-full max-w-md fade-in">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-white">Add Employee</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { key: 'name', label: 'Full Name', type: 'text', placeholder: 'John Smith' },
            { key: 'department', label: 'Department', type: 'text', placeholder: 'Engineering' },
            { key: 'position', label: 'Position', type: 'text', placeholder: 'Senior Developer' },
            { key: 'salary', label: 'Annual Salary', type: 'number', placeholder: '72000' },
            { key: 'joining_date', label: 'Joining Date', type: 'date', placeholder: '' },
            { key: 'working_hours', label: 'Weekly Hours', type: 'number', placeholder: '40' },
          ].map(f => (
            <div key={f.key}>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">{f.label}</label>
              <input type={f.type} className="input-field" value={(form as any)[f.key]}
                onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                placeholder={f.placeholder} required />
            </div>
          ))}
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">Employment Type</label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(statusLabels).map(([k, v]) => (
                <button key={k} type="button" onClick={() => setForm(p => ({ ...p, employment_status: k }))}
                  className="p-2 rounded-lg text-xs font-medium transition-all"
                  style={form.employment_status === k
                    ? { background: 'rgba(59,130,246,0.2)', border: '1px solid #3B82F6', color: 'white' }
                    : { background: '#111827', border: '1px solid rgba(75,85,99,0.3)', color: '#9CA3AF' }}>
                  {v}
                </button>
              ))}
            </div>
          </div>
          {error && <p className="text-xs text-red-400">{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
            {loading
              ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : <><Check size={16} /> Add Employee</>}
          </button>
        </form>
      </div>
    </div>
  );
};

export const EmployeesPage: React.FC = () => {
  const { employees, setEmployees, dashboard } = useStore();
  const [loading, setLoading] = useState(employees.length === 0);
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState('');
  const [importResult, setImportResult] = useState<any>(null);
  const currency = dashboard?.company?.currency || 'USD';

  const load = async () => {
    try {
      const res = await getEmployees();
      setEmployees(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Remove this employee?')) return;
    await deleteEmployee(id);
    await load();
  };

  const handleCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const res = await importCSV(file);
      setImportResult(res.data);
      await load();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Import failed');
    }
    e.target.value = '';
  };

  const filtered = employees.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.department.toLowerCase().includes(search.toLowerCase()) ||
    e.position.toLowerCase().includes(search.toLowerCase())
  );

  const depts = [...new Set(employees.map((e: any) => e.department))];
  const totalPayroll = employees.filter((e: any) => e.is_active).reduce((s: number, e: any) => s + e.salary / 12, 0);

  return (
    <div className="p-6 space-y-6 fade-in">
      {showAdd && <AddModal onClose={() => setShowAdd(false)} onAdded={load} />}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Employees</h1>
          <p className="text-gray-400 text-sm mt-0.5">
            {employees.filter((e: any) => e.is_active).length} active · {fmt.currency(totalPayroll, currency, true)}/mo total payroll
          </p>
        </div>
        <div className="flex gap-3">
          <label className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold cursor-pointer text-gray-300 hover:text-white transition-all"
            style={{ background: '#1F2937', border: '1px solid rgba(75,85,99,0.4)' }}>
            <Upload size={16} /> Import CSV
            <input type="file" accept=".csv" className="hidden" onChange={handleCSV} />
          </label>
          <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-2">
            <UserPlus size={16} /> Add Employee
          </button>
        </div>
      </div>

      {importResult && (
        <div className="card p-4 fade-in" style={{ border: importResult.errors.length > 0 ? '1px solid rgba(245,158,11,0.4)' : '1px solid rgba(34,197,94,0.4)' }}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-semibold text-white">Import Complete</p>
              <p className="text-xs text-gray-400 mt-1">
                ✓ {importResult.imported} imported{importResult.errors.length > 0 && ` · ${importResult.errors.length} errors`}
              </p>
              {importResult.errors.map((e: string, i: number) => <p key={i} className="text-xs text-red-400 mt-0.5">{e}</p>)}
            </div>
            <button onClick={() => setImportResult(null)} className="text-gray-500 hover:text-white"><X size={16} /></button>
          </div>
        </div>
      )}

      {depts.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {depts.slice(0, 4).map((dept: any, i: number) => {
            const emps = employees.filter((e: any) => e.department === dept && e.is_active);
            const payroll = emps.reduce((s: number, e: any) => s + e.salary / 12, 0);
            return (
              <div key={dept} className="card p-4">
                <div className="w-2 h-2 rounded-full mb-2" style={{ background: DEPT_COLORS[i % DEPT_COLORS.length] }} />
                <p className="text-sm font-bold text-white">{dept}</p>
                <p className="text-xs text-gray-400 mt-1">{emps.length} employees</p>
                <p className="text-xs font-semibold mt-1" style={{ color: DEPT_COLORS[i % DEPT_COLORS.length] }}>
                  {fmt.currency(payroll, currency, true)}/mo
                </p>
              </div>
            );
          })}
        </div>
      )}

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input className="input-field pl-9" placeholder="Search employees..." value={search}
          onChange={e => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="skeleton h-14 rounded-xl" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <Users size={40} className="text-gray-600 mx-auto mb-3" />
          <p className="text-white font-semibold mb-1">No employees yet</p>
          <p className="text-gray-400 text-sm">Add employees manually or import from CSV</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(75,85,99,0.3)' }}>
                  {['Name', 'Department', 'Position', 'Salary/yr', 'Monthly', 'Status', 'Actions'].map(h => (
                    <th key={h} className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-gray-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((emp: any) => (
                  <tr key={emp.id} style={{ borderBottom: '1px solid rgba(75,85,99,0.15)' }}
                    className="hover:bg-gray-800/30 transition-colors fade-in">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                          style={{
                            background: `${DEPT_COLORS[depts.indexOf(emp.department) % DEPT_COLORS.length]}20`,
                            color: DEPT_COLORS[depts.indexOf(emp.department) % DEPT_COLORS.length]
                          }}>
                          {emp.name.charAt(0)}
                        </div>
                        <span className="text-sm font-semibold text-white">{emp.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-300">{emp.department}</td>
                    <td className="p-4 text-sm text-gray-300">{emp.position}</td>
                    <td className="p-4 text-sm font-semibold text-white">{fmt.currency(emp.salary, currency)}</td>
                    <td className="p-4 text-sm text-gray-400">{fmt.currency(emp.salary / 12, currency)}</td>
                    <td className="p-4">
                      <span className="badge"
                        style={{ background: `${statusColors[emp.employment_status] || '#3B82F6'}20`, color: statusColors[emp.employment_status] || '#3B82F6' }}>
                        {statusLabels[emp.employment_status] || emp.employment_status}
                      </span>
                    </td>
                    <td className="p-4">
                      <button onClick={() => handleDelete(emp.id)}
                        className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all">
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="text-center">
        <p className="text-xs text-gray-500">CSV format: name, department, position, salary, joining_date, working_hours (optional), employment_status (optional)</p>
      </div>
    </div>
  );
};
