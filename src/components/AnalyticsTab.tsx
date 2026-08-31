import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  ShieldCheck, 
  AlertTriangle, 
  Calendar, 
  CheckCircle2, 
  Flame, 
  Trophy,
  ArrowRight,
  GraduationCap,
  Sparkles,
  MapPin,
  Users,
  Compass,
  ArrowUpRight,
  Filter,
  Plus
} from 'lucide-react';
import { Hospital, CallStatus, TrainingCohort, StateLocation } from '../types';
import { 
  formatDate, 
  getStatusBadgeClass, 
  getUrgencyBadgeClass, 
  getCategoryBadgeClass 
} from '../utils/helpers';

interface AnalyticsTabProps {
  hospitals: Hospital[];
  cohorts: TrainingCohort[];
  states: StateLocation[];
  onSelectHospital: (hospital: Hospital) => void;
  onFilterByStatus: (status: string) => void;
  onFilterByCity?: (city: string) => void;
  onNavigateToPipeline?: () => void;
}

export const AnalyticsTab: React.FC<AnalyticsTabProps> = ({
  hospitals,
  cohorts,
  states,
  onSelectHospital,
  onFilterByStatus,
  onFilterByCity,
  onNavigateToPipeline
}) => {
  const total = hospitals.length;

  // Exact Status Counts matching raw data
  const stageCounts: Record<CallStatus, number> = {
    Hot: hospitals.filter((h) => h.callStatus === 'Hot').length,
    Warm: hospitals.filter((h) => h.callStatus === 'Warm').length,
    'Application in progress': hospitals.filter((h) => h.callStatus === 'Application in progress' || h.callStatus === 'AIP').length,
    AIP: 0,
    Engaged: hospitals.filter((h) => h.callStatus === 'Engaged').length,
    Existing: hospitals.filter((h) => h.callStatus === 'Existing').length,
    Won: hospitals.filter((h) => h.callStatus === 'Won').length,
    Cold: hospitals.filter((h) => h.callStatus === 'Cold').length,
    Lost: hospitals.filter((h) => h.callStatus === 'Lost').length,
  };

  // Urgency distribution
  const expiredCount = hospitals.filter((h) => (h.renewalUrgency || '').toUpperCase().includes('EXPIRE')).length;
  const urgentCount = hospitals.filter((h) => (h.renewalUrgency || '').includes('90')).length;
  const safeCount = hospitals.filter((h) => (h.renewalUrgency || '').includes('> 1 year') || (h.renewalUrgency || '').includes('>1 year')).length;

  // Category breakdown
  const certifiedCount = hospitals.filter((h) => h.accreditationCategory === 'Certified').length;
  const accreditedCount = hospitals.filter((h) => h.accreditationCategory === 'Accredited').length;
  const notCertifiedCount = hospitals.filter((h) => (h.accreditationCategory || '').toLowerCase().includes('not yet')).length;
  const underProcessCount = hospitals.filter((h) => (h.accreditationCategory || '').includes('process')).length;

  // Geographic city breakdown
  const cityCountMap: Record<string, number> = {};
  hospitals.forEach(h => {
    const c = h.city || 'Bhopal';
    cityCountMap[c] = (cityCountMap[c] || 0) + 1;
  });
  const topCities = Object.entries(cityCountMap).sort((a, b) => b[1] - a[1]);

  // Urgent renewals list
  const urgentRenewals = hospitals
    .filter((h) => (h.renewalUrgency || '').toUpperCase().includes('EXPIRED') || (h.renewalUrgency || '').includes('90'))
    .slice(0, 5);

  // Status list with exact raw data names
  const statusList: { status: CallStatus; label: string; color: string; barColor: string }[] = [
    { status: 'Hot', label: 'Hot', color: 'text-orange-700 bg-orange-50 border-orange-200', barColor: 'bg-orange-500' },
    { status: 'Warm', label: 'Warm', color: 'text-amber-800 bg-amber-50 border-amber-200', barColor: 'bg-amber-500' },
    { status: 'Application in progress', label: 'Application in progress', color: 'text-blue-700 bg-blue-50 border-blue-200', barColor: 'bg-blue-600' },
    { status: 'Engaged', label: 'Engaged', color: 'text-sky-700 bg-sky-50 border-sky-200', barColor: 'bg-sky-500' },
    { status: 'Existing', label: 'Existing', color: 'text-teal-800 bg-teal-50 border-teal-200', barColor: 'bg-teal-600' },
    { status: 'Won', label: 'Won', color: 'text-emerald-800 bg-emerald-50 border-emerald-200', barColor: 'bg-emerald-600' },
    { status: 'Cold', label: 'Cold', color: 'text-slate-700 bg-slate-100 border-slate-200', barColor: 'bg-slate-400' },
    { status: 'Lost', label: 'Lost', color: 'text-rose-700 bg-rose-50 border-rose-200', barColor: 'bg-rose-400' },
  ];

  // Lifecycle touchpoints count
  const yatraCount = hospitals.filter(h => h.yatraEventAttended).length;
  const trainedHospitalsCount = hospitals.filter(h => (h.enrolledCohortIds && h.enrolledCohortIds.length > 0)).length;

  return (
    <div className="space-y-6">
      
      {/* Executive Managerial Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-2 border border-blue-100">
              <Compass className="w-3.5 h-3.5" />
              <span>Managerial Overview & Executive Insights</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Overall Status of Leads & Hospital Pipeline
            </h1>
            <p className="text-xs text-slate-500 mt-1 max-w-3xl">
              Real-time executive monitoring of hospital accreditation outreach, call statuses, renewal urgencies, and regional distribution.
            </p>
          </div>

          {/* Quick Leadership Metrics Pill */}
          <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200 shrink-0">
            <div className="px-3 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Pipeline</span>
              <span className="text-lg font-extrabold text-slate-900">{total}</span>
            </div>
            <div className="w-px h-7 bg-slate-200" />
            <div className="px-3 text-center">
              <span className="text-[10px] uppercase font-bold text-orange-600 block">Hot</span>
              <span className="text-lg font-extrabold text-orange-600">{stageCounts['Hot']}</span>
            </div>
            <div className="w-px h-7 bg-slate-200" />
            <div className="px-3 text-center">
              <span className="text-[10px] uppercase font-bold text-blue-600 block">In Progress</span>
              <span className="text-lg font-extrabold text-blue-700">{stageCounts['Application in progress']}</span>
            </div>
            <div className="w-px h-7 bg-slate-200" />
            <div className="px-3 text-center">
              <span className="text-[10px] uppercase font-bold text-emerald-600 block">Won</span>
              <span className="text-lg font-extrabold text-emerald-700">{stageCounts['Won']}</span>
            </div>
          </div>
        </div>
      </div>

      {/* TOP SECTION: OVERALL STATUS OF LEADS (Brought to Top as Requested) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Overall Status of Leads Breakdown (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                <span>Overall Status of Leads</span>
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Click any status to filter the master hospital register
              </p>
            </div>
            <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
              {total} Total Leads
            </span>
          </div>

          <div className="space-y-3 pt-2">
            {statusList.map((item) => {
              const count = stageCounts[item.status] || 0;
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;

              return (
                <div key={item.status} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <button
                      onClick={() => onFilterByStatus(item.status)}
                      className="font-semibold text-slate-800 hover:text-blue-600 hover:underline flex items-center gap-2 group cursor-pointer"
                    >
                      <span className={`w-2 h-2 rounded-full ${item.barColor}`}></span>
                      <span>{item.label}</span>
                    </button>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-400 font-mono">{pct}%</span>
                      <span className="font-bold text-slate-900 min-w-[28px] text-right">{count}</span>
                    </div>
                  </div>
                  <div 
                    onClick={() => onFilterByStatus(item.status)}
                    className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden flex cursor-pointer hover:opacity-90"
                    title={`Filter by ${item.label}`}
                  >
                    <div
                      className={`h-full ${item.barColor} rounded-full transition-all duration-500`}
                      style={{ width: `${Math.max(pct, pct > 0 ? 3 : 0)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Renewal Urgency & Category Cards (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Renewal Urgency Distribution */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Renewal Urgency</span>
            </h3>

            <div className="grid grid-cols-3 gap-2 pt-1 text-center">
              <div className="p-3 rounded-lg bg-red-50/60 border border-red-200">
                <span className="text-[10px] font-bold text-red-700 uppercase block">ALREADY EXPIRED</span>
                <span className="text-lg font-bold text-red-800">{expiredCount}</span>
                <span className="text-[10px] text-red-600 block mt-0.5">High Priority</span>
              </div>

              <div className="p-3 rounded-lg bg-amber-50/60 border border-amber-200">
                <span className="text-[10px] font-bold text-amber-700 uppercase block">&le; 90 Days</span>
                <span className="text-lg font-bold text-amber-800">{urgentCount}</span>
                <span className="text-[10px] text-amber-600 block mt-0.5">Active</span>
              </div>

              <div className="p-3 rounded-lg bg-emerald-50/60 border border-emerald-200">
                <span className="text-[10px] font-bold text-emerald-700 uppercase block">&gt; 1 Year</span>
                <span className="text-lg font-bold text-emerald-800">{safeCount}</span>
                <span className="text-[10px] text-emerald-600 block mt-0.5">Stable</span>
              </div>
            </div>
          </div>

          {/* Accreditation Category Split */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>Accreditation Category</span>
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="font-semibold text-slate-800">Certified</span>
                <span className="font-bold text-emerald-700">{certifiedCount} hospitals</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="font-semibold text-slate-800">Accredited</span>
                <span className="font-bold text-blue-700">{accreditedCount} hospitals</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="font-semibold text-slate-800">Not Yet Certified/Accredited</span>
                <span className="font-bold text-purple-700">{notCertifiedCount} hospitals</span>
              </div>
              {underProcessCount > 0 && (
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="font-semibold text-slate-800">Accreditation under process</span>
                  <span className="font-bold text-amber-700">{underProcessCount} hospitals</span>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* Grid 2: Regional Hubs + Urgent Expiry Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* City Breakdown (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span>Regional Hubs & Cities</span>
            </h3>
            <span className="text-[11px] text-slate-400">Click to filter</span>
          </div>

          <div className="space-y-2 pt-1">
            {topCities.map(([cityName, count]) => {
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <div
                  key={cityName}
                  onClick={() => onFilterByCity && onFilterByCity(cityName)}
                  className="p-2.5 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50/20 transition-all cursor-pointer flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900">📍 {cityName}</span>
                    {cityName === 'Bhopal' && (
                      <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-1.5 py-0.2 rounded border border-blue-200">
                        HQ Hub
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 text-[11px]">{pct}%</span>
                    <strong className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
                      {count}
                    </strong>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Priority Urgent Renewal Outreach Queue (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Calendar className="w-4 h-4 text-rose-600" />
              <span>Priority Renewal & Outreach Queue</span>
            </h3>
            <span className="text-[11px] text-rose-700 font-semibold bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
              Immediate Action
            </span>
          </div>

          <div className="space-y-2.5">
            {urgentRenewals.map((hosp) => {
              const fullName = [hosp.firstName, hosp.lastName].filter(Boolean).join(' ') || '—';

              return (
                <div
                  key={hosp.id}
                  onClick={() => onSelectHospital(hosp)}
                  className="p-3 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-slate-50 transition-all cursor-pointer flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="font-semibold text-slate-900 flex items-center gap-2">
                      <span>{hosp.organisation}</span>
                      <span className="text-[10px] text-slate-500 font-normal">📍 {hosp.city || 'Bhopal'}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Contact: <strong className="text-slate-700">{fullName}</strong> ({hosp.mobile})
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${getUrgencyBadgeClass(hosp.renewalUrgency)}`}>
                      {hosp.renewalUrgency || 'Urgent'}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${getStatusBadgeClass(hosp.callStatus)}`}>
                      {hosp.callStatus}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* BOTTOM SECTION: TRAINING & LIFECYCLE OVERVIEW (Brought Down as Requested) */}
      <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
                <span>Training & Hospital Lifecycle Tracking</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Lifecycle correlation connects hospital event discovery (Yatra), training cohorts, and conversion progress.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 font-medium">
              {cohorts.length} Training Cohorts Configured
            </span>
          </div>
        </div>

        {/* Hospital Lifecycle Funnel Bar */}
        <div className="space-y-3">
          <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Hospital Lifecycle Progression</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
            
            <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700/60">
              <div className="text-[10px] font-bold text-amber-400 uppercase">1. Yatra Discovery</div>
              <div className="text-2xl font-bold text-white my-1">{yatraCount}</div>
              <div className="text-[11px] text-slate-400">Attended regional summit</div>
            </div>

            <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700/60">
              <div className="text-[10px] font-bold text-indigo-400 uppercase">2. Training Enrolled</div>
              <div className="text-2xl font-bold text-white my-1">{trainedHospitalsCount}</div>
              <div className="text-[11px] text-slate-400">Enrolled in masterclasses</div>
            </div>

            <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700/60">
              <div className="text-[10px] font-bold text-blue-400 uppercase">3. Application in progress</div>
              <div className="text-2xl font-bold text-white my-1">{stageCounts['Application in progress']}</div>
              <div className="text-[11px] text-slate-400">Accreditation filed</div>
            </div>

            <div className="bg-emerald-900/30 p-3.5 rounded-xl border border-emerald-500/30">
              <div className="text-[10px] font-bold text-emerald-400 uppercase">4. Won</div>
              <div className="text-2xl font-bold text-emerald-400 my-1">{stageCounts['Won']}</div>
              <div className="text-[11px] text-emerald-300">Final certification awarded</div>
            </div>

          </div>

          {cohorts.length === 0 && (
            <p className="text-[11px] text-slate-400 italic pt-1">
              No training sessions added yet. You can create and manage training cohorts in the Training & Settings tab.
            </p>
          )}
        </div>

      </div>

    </div>
  );
};
