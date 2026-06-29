import { useEffect, useState } from 'react';
import { AuthPage } from './pages/AuthPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { DashboardPage } from './components/dashboard/DashboardPage';
import { EmployeesPage } from './pages/EmployeesPage';
import { IntelligencePage } from './pages/IntelligencePage';
import { ForecastPage } from './pages/ForecastPage';
import { ScenariosPage } from './pages/ScenariosPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';
import { Sidebar } from './components/ui/Sidebar';
import { useStore } from './store/useStore';
import { getMe, getCompany } from './services/api';

type Page = 'dashboard' | 'employees' | 'intelligence' | 'forecast' | 'scenarios' | 'reports' | 'settings';

function App() {
  const { token, company, setUser, setCompany } = useStore();
  const [page, setPage] = useState<Page>('dashboard');
  const [bootstrapping, setBootstrapping] = useState(true);

  useEffect(() => {
    if (!token) { setBootstrapping(false); return; }
    Promise.all([
      getMe().then(r => setUser(r.data)).catch(() => {}),
      getCompany().then(r => setCompany(r.data)).catch(() => {}),
    ]).finally(() => setBootstrapping(false));
  }, [token]);

  if (bootstrapping) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0B1220' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)' }}>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-gray-500 text-sm">Loading FinCommand...</p>
        </div>
      </div>
    );
  }

  if (!token) return <AuthPage onSuccess={() => window.location.reload()} />;
  if (!company) return <OnboardingPage onComplete={() => window.location.reload()} />;

  const renderPage = () => {
    switch (page) {
      case 'dashboard': return <DashboardPage />;
      case 'employees': return <EmployeesPage />;
      case 'intelligence': return <IntelligencePage />;
      case 'forecast': return <ForecastPage />;
      case 'scenarios': return <ScenariosPage />;
      case 'reports': return <ReportsPage />;
      case 'settings': return <SettingsPage />;
      default: return <DashboardPage />;
    }
  };

  return (
    <div className="flex min-h-screen" style={{ background: '#0B1220' }}>
      <Sidebar activePage={page} onNavigate={(p) => setPage(p as Page)} />
      <main className="flex-1 overflow-y-auto min-h-screen" style={{ background: '#0B1220' }}>
        {renderPage()}
      </main>
    </div>
  );
}

export default App;
