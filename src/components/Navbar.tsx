import React from 'react';
import { 
  Building2, 
  Plus, 
  Download, 
  Upload,
  GraduationCap, 
  LayoutDashboard, 
  BarChart3, 
  RotateCcw,
  Sparkles,
  ShieldCheck,
  MapPin,
  FileSpreadsheet,
  Compass
} from 'lucide-react';
import { StateLocation } from '../types';

interface NavbarProps {
  activeTab: 'analytics' | 'dashboard' | 'admin';
  setActiveTab: (tab: 'analytics' | 'dashboard' | 'admin') => void;
  onOpenAddModal: () => void;
  onOpenBulkModal: () => void;
  onExportData: () => void;
  onResetData: () => void;
  selectedCity: string;
  onCityChange: (city: string) => void;
  states: StateLocation[];
  totalCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenAddModal,
  onOpenBulkModal,
  onExportData,
  onResetData,
  selectedCity,
  onCityChange,
  states,
  totalCount,
}) => {
  // Aggregate all unique cities from states
  const allCities: string[] = [];
  states.forEach(st => {
    st.cities.forEach(c => {
      if (!allCities.includes(c)) allCities.push(c);
    });
  });

  return (
    <header className="h-14 bg-white border-b border-slate-200 sticky top-0 z-30 shrink-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex items-center justify-between h-full">
          
          {/* Brand & Identity */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-xs">
              Y
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-semibold tracking-tight text-slate-900">
                  Yatra <span className="text-slate-400 font-normal">Conversion Tracker</span>
                </h1>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                  Accreditation Pipeline
                </span>
              </div>
            </div>
          </div>

          {/* Center Tabs: Managerial Overview FIRST */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200/80">
            
            {/* Tab 1: Insights & Reports (Managerial Overview) */}
            <button
              id="nav-tab-analytics"
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-2 px-3.5 py-1 rounded-md text-xs font-medium transition-all ${
                activeTab === 'analytics'
                  ? 'bg-white text-blue-600 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Compass className="w-3.5 h-3.5 text-blue-600" />
              <span>Insights & Reports</span>
            </button>

            {/* Tab 2: Conversion Pipeline & Directory */}
            <button
              id="nav-tab-dashboard"
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-3.5 py-1 rounded-md text-xs font-medium transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-white text-blue-600 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Conversion Pipeline</span>
            </button>

            {/* Tab 3: Admin & Operations */}
            <button
              id="nav-tab-admin"
              onClick={() => setActiveTab('admin')}
              className={`flex items-center gap-2 px-3.5 py-1 rounded-md text-xs font-medium transition-all ${
                activeTab === 'admin'
                  ? 'bg-white text-blue-600 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Admin & Training</span>
            </button>

          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* City Selector Pill */}
            <div className="flex items-center gap-1.5 border-l border-slate-200 pl-2 sm:pl-3">
              <MapPin className="w-3.5 h-3.5 text-slate-400 hidden sm:inline" />
              <select
                id="header-city-select"
                value={selectedCity}
                onChange={(e) => onCityChange(e.target.value)}
                className="text-xs font-semibold text-slate-700 bg-transparent focus:outline-none cursor-pointer max-w-[110px] sm:max-w-none truncate"
              >
                <option value="All Cities">All Cities</option>
                {allCities.map((c) => (
                  <option key={c} value={c}>
                    {c} {c === 'Bhopal' ? '(HQ)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <button
              id="btn-bulk-upload"
              onClick={onOpenBulkModal}
              title="Bulk Upload hospital records via CSV / Excel"
              className="px-2.5 py-1.5 text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 transition-colors flex items-center gap-1.5 text-xs font-semibold"
            >
              <Upload className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden sm:inline">Bulk Upload</span>
            </button>

            <button
              id="btn-export-data"
              onClick={onExportData}
              title="Export filtered records to CSV"
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors hidden sm:flex items-center gap-1 text-xs font-medium"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>

            <button
              id="btn-add-hospital"
              onClick={onOpenAddModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="hidden sm:inline">Add Hospital</span>
            </button>
          </div>

        </div>

        {/* Mobile Tab bar */}
        <div className="flex md:hidden py-1.5 border-t border-slate-100 gap-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex-1 py-1 px-2 rounded-md text-xs font-medium text-center ${
              activeTab === 'analytics' ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-slate-600'
            }`}
          >
            Insights & Reports
          </button>
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex-1 py-1 px-2 rounded-md text-xs font-medium text-center ${
              activeTab === 'dashboard' ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-slate-600'
            }`}
          >
            Pipeline
          </button>
          <button
            onClick={() => setActiveTab('admin')}
            className={`flex-1 py-1 px-2 rounded-md text-xs font-medium text-center ${
              activeTab === 'admin' ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-slate-600'
            }`}
          >
            Admin & Training
          </button>
        </div>
      </div>
    </header>
  );
};
