import React from 'react';
import { 
  Building2, 
  Flame, 
  FileText, 
  Trophy, 
  AlertTriangle, 
  ArrowUpRight,
  Filter
} from 'lucide-react';
import { Hospital } from '../types';

interface KpiCardsProps {
  hospitals: Hospital[];
  selectedStatusFilter: string;
  selectedUrgencyFilter: string;
  onFilterByStatus: (status: string) => void;
  onFilterByUrgency: (urgency: string) => void;
  onClearFilters: () => void;
}

export const KpiCards: React.FC<KpiCardsProps> = ({
  hospitals,
  selectedStatusFilter,
  selectedUrgencyFilter,
  onFilterByStatus,
  onFilterByUrgency,
  onClearFilters,
}) => {
  const totalCount = hospitals.length;
  const hotLeads = hospitals.filter((h) => h.callStatus === 'Hot');
  const applicationsInProgress = hospitals.filter((h) => h.callStatus === 'Application in progress' || h.callStatus === 'AIP');
  const wonCount = hospitals.filter((h) => h.callStatus === 'Won');
  const expiredCount = hospitals.filter((h) => (h.renewalUrgency || '').toUpperCase().includes('EXPIRE'));
  const conversionRate = totalCount > 0 ? ((wonCount.length / totalCount) * 100).toFixed(1) : '0';

  const isAllActive = selectedStatusFilter === 'ALL' && selectedUrgencyFilter === 'ALL';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6 shrink-0">
      
      {/* 1. Total Hospitals */}
      <div
        id="kpi-total-hospitals"
        onClick={() => onClearFilters()}
        className={`bg-white p-4 rounded-xl border transition-all cursor-pointer shadow-xs hover:shadow-sm ${
          isAllActive
            ? 'border-blue-500 ring-1 ring-blue-500/20 bg-blue-50/20'
            : 'border-slate-200 hover:border-slate-300'
        }`}
      >
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
          Total Hospitals
        </div>
        <div className="text-2xl font-bold text-slate-900 tracking-tight">
          {totalCount.toLocaleString()}
        </div>
        <div className="text-[10px] text-slate-500 font-medium mt-1 flex items-center justify-between">
          <span>Master database</span>
          {isAllActive && <span className="text-blue-600 font-semibold">Active</span>}
        </div>
      </div>

      {/* 2. Hot */}
      <div
        id="kpi-hot-leads"
        onClick={() => onFilterByStatus(selectedStatusFilter === 'Hot' ? 'ALL' : 'Hot')}
        className={`bg-white p-4 rounded-xl border transition-all cursor-pointer shadow-xs hover:shadow-sm ${
          selectedStatusFilter === 'Hot'
            ? 'border-orange-500 ring-1 ring-orange-500/20 bg-orange-50/20'
            : 'border-slate-200 hover:border-orange-300'
        }`}
      >
        <div className="text-xs font-semibold text-orange-500 uppercase tracking-wider mb-1">
          Hot
        </div>
        <div className="text-2xl font-bold text-slate-900 tracking-tight">
          {hotLeads.length}
        </div>
        <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-between">
          <span>High priority</span>
          {selectedStatusFilter === 'Hot' && <span className="text-orange-600 font-semibold">Active</span>}
        </div>
      </div>

      {/* 3. Application in progress */}
      <div
        id="kpi-applications-in-progress"
        onClick={() => onFilterByStatus(selectedStatusFilter === 'Application in progress' ? 'ALL' : 'Application in progress')}
        className={`bg-white p-4 rounded-xl border transition-all cursor-pointer shadow-xs hover:shadow-sm ${
          selectedStatusFilter === 'Application in progress'
            ? 'border-blue-500 ring-1 ring-blue-500/20 bg-blue-50/20'
            : 'border-slate-200 hover:border-blue-300'
        }`}
      >
        <div className="text-xs font-semibold text-blue-500 uppercase tracking-wider mb-1">
          Application in progress
        </div>
        <div className="text-2xl font-bold text-slate-900 tracking-tight">
          {applicationsInProgress.length}
        </div>
        <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-between">
          <span>NABH audit filed</span>
          {selectedStatusFilter === 'Application in progress' && <span className="text-blue-600 font-semibold">Active</span>}
        </div>
      </div>

      {/* 4. Won */}
      <div
        id="kpi-converted-won"
        onClick={() => onFilterByStatus(selectedStatusFilter === 'Won' ? 'ALL' : 'Won')}
        className={`bg-white p-4 rounded-xl border transition-all cursor-pointer shadow-xs hover:shadow-sm ${
          selectedStatusFilter === 'Won'
            ? 'border-emerald-500 ring-1 ring-emerald-500/20 bg-emerald-50/20'
            : 'border-slate-200 hover:border-emerald-300'
        }`}
      >
        <div className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-1">
          Won
        </div>
        <div className="text-2xl font-bold text-emerald-600 tracking-tight">
          {wonCount.length}
        </div>
        <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-between">
          <span>{conversionRate}% conversion</span>
          {selectedStatusFilter === 'Won' && <span className="text-emerald-600 font-semibold">Active</span>}
        </div>
      </div>

      {/* 5. ALREADY EXPIRED */}
      <div
        id="kpi-expired-certifications"
        onClick={() => onFilterByUrgency(selectedUrgencyFilter === 'ALREADY EXPIRED' ? 'ALL' : 'ALREADY EXPIRED')}
        className={`bg-white p-4 rounded-xl border shadow-xs hover:shadow-sm transition-all cursor-pointer border-l-4 border-l-red-500 ${
          selectedUrgencyFilter === 'ALREADY EXPIRED'
            ? 'border-red-400 ring-1 ring-red-500/20 bg-red-50/20'
            : 'border-slate-200 hover:border-red-300'
        }`}
      >
        <div className="text-xs font-semibold text-red-500 uppercase tracking-wider mb-1">
          ALREADY EXPIRED
        </div>
        <div className="text-2xl font-bold text-red-500 tracking-tight">
          {expiredCount.length}
        </div>
        <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-between">
          <span>Urgent renewal</span>
          {selectedUrgencyFilter === 'ALREADY EXPIRED' && <span className="text-red-600 font-semibold">Active</span>}
        </div>
      </div>

    </div>
  );
};
