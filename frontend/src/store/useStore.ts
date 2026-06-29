import { create } from 'zustand';

interface AppState {
  token: string | null;
  user: any | null;
  company: any | null;
  dashboard: any | null;
  employees: any[];
  intelligence: any[];
  forecast: any | null;
  isLoading: boolean;
  setToken: (token: string | null) => void;
  setUser: (user: any) => void;
  setCompany: (company: any) => void;
  setDashboard: (data: any) => void;
  setEmployees: (employees: any[]) => void;
  setIntelligence: (data: any[]) => void;
  setForecast: (data: any) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useStore = create<AppState>((set) => ({
  token: localStorage.getItem('token'),
  user: null,
  company: null,
  dashboard: null,
  employees: [],
  intelligence: [],
  forecast: null,
  isLoading: false,
  setToken: (token) => {
    if (token) localStorage.setItem('token', token);
    else localStorage.removeItem('token');
    set({ token });
  },
  setUser: (user) => set({ user }),
  setCompany: (company) => set({ company }),
  setDashboard: (data) => set({ dashboard: data }),
  setEmployees: (employees) => set({ employees }),
  setIntelligence: (data) => set({ intelligence: data }),
  setForecast: (data) => set({ forecast: data }),
  setLoading: (loading) => set({ isLoading: loading }),
  logout: () => {
    localStorage.removeItem('token');
    set({ token: null, user: null, company: null, dashboard: null, employees: [], intelligence: [] });
  },
}));
