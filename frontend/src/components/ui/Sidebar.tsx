import React from 'react';
import { LayoutDashboard, Users, TrendingUp, FlaskConical, BarChart3, Settings, LogOut, Zap } from 'lucide-react';
import { useStore } from '../../store/useStore';

interface SidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
  { id: 'employees', label: 'Employees', icon: <Users size={18} /> },
  { id: 'intelligence', label: 'Intelligence', icon: <Zap size={18} /> },
  { id: 'forecast', label: 'Forecast', icon: <TrendingUp size={18} /> },
  { id: 'scenarios', label: 'Scenarios', icon: <FlaskConical size={18} /> },
  { id: 'reports', label: 'Reports', icon: <BarChart3 size={18} /> },
];

export const Sidebar: React.FC<SidebarProps> = ({ activePage, onNavigate }) => {
  const { company, logout } = useStore();

  return (
    <aside className="w-64 flex-shrink-0 flex flex-col" style={{ background: '#0D1626', borderRight: '1px solid rgba(75,85,99,0.2)', height: '100vh', position: 'sticky', top: 0 }}>
      {/* Logo */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)' }}>
            <Zap size={18} className="text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">FinCommand</p>
            <p className="text-gray-500 text-xs">Executive Platform</p>
          </div>
        </div>
      </div>

      {/* Company info */}
      {company && (
        <div className="mx-4 mt-4 p-3 rounded-xl" style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)' }}>
          <p className="text-white font-semibold text-sm truncate">{company.name}</p>
          <p className="text-gray-400 text-xs mt-0.5">{company.industry}</p>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`sidebar-item w-full ${activePage === item.id ? 'active' : ''}`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>

      {/* Bottom */}
      <div className="p-3 border-t border-gray-800 space-y-1">
        <button onClick={() => onNavigate('settings')} className="sidebar-item w-full">
          <Settings size={18} /> Settings
        </button>
        <button onClick={logout} className="sidebar-item w-full hover:text-red-400">
          <LogOut size={18} /> Sign Out
        </button>
      </div>
    </aside>
  );
};
