import React from 'react';
import { 
  Search, 
  X, 
  LayoutList, 
  Kanban,
  SlidersHorizontal,
  Flame,
  CheckCircle2,
  Users,
  FileCheck
} from 'lucide-react';
import { CallStatus, Hospital, SATStatus } from '../types';

interface FilterBarProps {
  hospitals: Hospital[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCity?: string;
  onCityChange?: (c: string) => void;
  selectedStatus: string;
  onStatusChange: (s: string) => void;
  selectedSat?: string;
  onSatChange?: (sat: string) => void;
  selectedUrgency: string;
  onUrgencyChange: (u: string) => void;
  selectedCategory: string;
  onCategoryChange: (cat: string) => void;
  viewMode: 'table' | 'kanban';
  onViewModeChange: (mode: 'table' | 'kanban') => void;
  onResetFilters: () => void;
  filteredCount: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  hospitals,
  searchQuery,
  onSearchChange,
  selectedStatus,
  onStatusChange,
  selectedSat = 'ALL',
  onSatChange,
  selectedUrgency,
  onUrgencyChange,
  selectedCategory,
  onCategoryChange,
  viewMode,
  onViewModeChange,
  onResetFilters,
  filteredCount,
}) => {
  const hasActiveFilters = 
    searchQuery !== '' || 
    selectedStatus !== 'ALL' || 
    selectedSat !== 'ALL' ||
    selectedUrgency !== 'ALL' || 
    selectedCategory !== 'ALL';

  // Count by stage for interactive quick-filter chips
  const stageCounts: Record<CallStatus, number> = {
    Hot: hospitals.filter(h => h.callStatus === 'Hot').length,
    Warm: hospitals.filter(h => h.callStatus === 'Warm').length,
    'Application in progress': hospitals.filter(h => h.callStatus === 'Application in progress' || h.callStatus === 'AIP').length,
    AIP: 0,
    Engaged: hospitals.filter(h => h.callStatus === 'Engaged').length,
    Existing: hospitals.filter(h => h.callStatus === 'Existing').length,
    Won: hospitals.filter(h => h.callStatus === 'Won').length,
    Cold: hospitals.filter(h => h.callStatus === 'Cold').length,
    Lost: hospitals.filter(h => h.callStatus === 'Lost').length,
  };

  const stagesList: { status: CallStatus; label: string }[] = [
    { status: 'Hot', label: 'Hot' },
    { status: 'Warm', label: 'Warm' },
    { status: 'Application in progress', label: 'Application in progress' },
    { status: 'Engaged', label: 'Engaged' },
    { status: 'Existing', label: 'Existing' },
    { status: 'Won', label: 'Won' },
    { status: 'Cold', label: 'Cold' },
    { status: 'Lost', label: 'Lost' },
  ];

  // SAT Counts
  const satCompletedCount = hospitals.filter(h => h.satStatus === 'SAT completed').length;
  const satPartialCount = hospitals.filter(h => h.satStatus === 'SAT filled partially').length;
  const satNotFilledCount = hospitals.filter(h => !h.satStatus || h.satStatus === 'SAT not filled').length;

  return (
    <div className="space-y-3 mb-6 shrink-0">
      
      {/* Primary Filter Bar */}
      <div className="flex flex-wrap lg:flex-nowrap gap-3 bg-white p-2.5 rounded-xl border border-slate-200 shadow-xs items-center px-4">
        
        {/* Search pill */}
        <div className="relative w-full sm:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-3.5 h-3.5" />
          </div>
          <input
            id="filter-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search organisation, contact, mobile..."
            className="w-full pl-8 pr-7 py-1.5 bg-slate-100 rounded-full text-xs text-slate-800 border-none focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="hidden lg:block h-4 w-[1px] bg-slate-200"></div>

        {/* SAT Status Select */}
        <div className="flex items-center gap-1.5">
          <FileCheck className="w-3.5 h-3.5 text-indigo-600 hidden sm:inline" />
          <select
            id="filter-sat-select"
            value={selectedSat}
            onChange={(e) => onSatChange && onSatChange(e.target.value)}
            className="text-xs border-none bg-transparent focus:ring-0 focus:outline-none cursor-pointer font-semibold text-slate-700"
          >
            <option value="ALL">SAT Status: All</option>
            <option value="SAT completed">✓ SAT completed ({satCompletedCount})</option>
            <option value="SAT filled partially">⏳ SAT filled partially ({satPartialCount})</option>
            <option value="SAT not filled">○ SAT not filled ({satNotFilledCount})</option>
          </select>
        </div>

        <div className="hidden lg:block h-4 w-[1px] bg-slate-200"></div>

        {/* Stage Select */}
        <div className="flex items-center gap-1.5">
          <select
            id="filter-status-select"
            value={selectedStatus}
            onChange={(e) => onStatusChange(e.target.value)}
            className="text-xs border-none bg-transparent focus:ring-0 focus:outline-none cursor-pointer font-medium text-slate-700"
          >
            <option value="ALL">Status: All</option>
            <option value="Hot">Hot</option>
            <option value="Warm">Warm</option>
            <option value="Application in progress">Application in progress</option>
            <option value="Engaged">Engaged</option>
            <option value="Existing">Existing</option>
            <option value="Won">Won</option>
            <option value="Cold">Cold</option>
            <option value="Lost">Lost</option>
          </select>
        </div>

        <div className="hidden lg:block h-4 w-[1px] bg-slate-200"></div>

        {/* Category Select */}
        <div className="flex items-center gap-1.5">
          <select
            id="filter-category-select"
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="text-xs border-none bg-transparent focus:ring-0 focus:outline-none cursor-pointer font-medium text-slate-700"
          >
            <option value="ALL">Category: All</option>
            <option value="Certified">Certified</option>
            <option value="Accredited">Accredited</option>
            <option value="Not Yet Certified/Accredited">Not Yet Certified/Accredited</option>
            <option value="Accreditation under process">Accreditation under process</option>
          </select>
        </div>

        <div className="hidden lg:block h-4 w-[1px] bg-slate-200"></div>

        {/* Renewal Urgency Select */}
        <div className="flex items-center gap-1.5">
          <select
            id="filter-urgency-select"
            value={selectedUrgency}
            onChange={(e) => onUrgencyChange(e.target.value)}
            className="text-xs border-none bg-transparent focus:ring-0 focus:outline-none cursor-pointer font-medium text-slate-700"
          >
            <option value="ALL">Renewal Urgency: All</option>
            <option value="ALREADY EXPIRED">ALREADY EXPIRED</option>
            <option value="Expiring <= 90 days">Expiring &le; 90 days</option>
            <option value="Expiring 91-180 days">Expiring 91-180 days</option>
            <option value="Expiring 181-365 days">Expiring 181-365 days</option>
            <option value="Expiring > 1 year">Expiring &gt; 1 year</option>
          </select>
        </div>

        {/* Clear Filters Link & View Switcher */}
        <div className="ml-auto flex items-center gap-3">
          {hasActiveFilters && (
            <button
              id="btn-reset-filters"
              onClick={onResetFilters}
              className="text-[11px] font-medium text-blue-600 hover:underline cursor-pointer"
            >
              Clear Filters
            </button>
          )}

          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              id="btn-view-table"
              onClick={() => onViewModeChange('table')}
              title="Table View"
              className={`p-1.5 rounded-md transition-all ${
                viewMode === 'table'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              <LayoutList className="w-3.5 h-3.5" />
            </button>
            <button
              id="btn-view-kanban"
              onClick={() => onViewModeChange('kanban')}
              title="Kanban Board View"
              className={`p-1.5 rounded-md transition-all ${
                viewMode === 'kanban'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

      {/* Interactive Quick Stage & SAT Strip */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 text-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <button
            onClick={() => onStatusChange('ALL')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all whitespace-nowrap flex items-center gap-1.5 ${
              selectedStatus === 'ALL'
                ? 'bg-slate-900 text-white font-semibold'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <span>All Stages</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
              selectedStatus === 'ALL' ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-700'
            }`}>
              {hospitals.length}
            </span>
          </button>

          {stagesList.map(({ status, label }) => {
            const isSelected = selectedStatus === status;
            const count = stageCounts[status] || 0;
            return (
              <button
                key={status}
                onClick={() => onStatusChange(isSelected ? 'ALL' : status)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all whitespace-nowrap flex items-center gap-1.5 border ${
                  isSelected
                    ? 'bg-blue-50 border-blue-300 text-blue-700 font-bold'
                    : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200'
                }`}
              >
                <span>{label}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-semibold ${
                  isSelected ? 'bg-blue-200/70 text-blue-900' : 'bg-slate-100 text-slate-700'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Quick SAT filters */}
        {onSatChange && (
          <div className="hidden sm:flex items-center gap-1 shrink-0 pl-2 border-l border-slate-200">
            <button
              onClick={() => onSatChange(selectedSat === 'SAT completed' ? 'ALL' : 'SAT completed')}
              className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-all border ${
                selectedSat === 'SAT completed'
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
              }`}
            >
              ✓ Completed ({satCompletedCount})
            </button>
            <button
              onClick={() => onSatChange(selectedSat === 'SAT filled partially' ? 'ALL' : 'SAT filled partially')}
              className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-all border ${
                selectedSat === 'SAT filled partially'
                  ? 'bg-amber-600 text-white border-amber-600'
                  : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
              }`}
            >
              ⏳ Partial ({satPartialCount})
            </button>
            <button
              onClick={() => onSatChange(selectedSat === 'SAT not filled' ? 'ALL' : 'SAT not filled')}
              className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-all border ${
                selectedSat === 'SAT not filled'
                  ? 'bg-slate-700 text-white border-slate-700'
                  : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
              }`}
            >
              ○ Blank ({satNotFilledCount})
            </button>
          </div>
        )}
      </div>

    </div>
  );
};

