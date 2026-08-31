import React from 'react';
import { 
  Building2, 
  Phone, 
  MessageSquare, 
  Calendar, 
  Clock, 
  ChevronRight, 
  MessageCircle, 
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  User,
  Plus,
  Edit2,
  Sparkles,
  GraduationCap
} from 'lucide-react';
import { Hospital, CallStatus } from '../types';
import { 
  formatDate, 
  getStatusBadgeClass, 
  getUrgencyBadgeClass, 
  getCategoryBadgeClass,
  getWhatsAppLink 
} from '../utils/helpers';

interface HospitalTableProps {
  hospitals: Hospital[];
  onSelectHospital: (hospital: Hospital) => void;
  onEditHospital?: (hospital: Hospital) => void;
  onQuickStatusChange: (hospitalId: string, newStatus: CallStatus, e: React.MouseEvent) => void;
  onOpenAddModal: () => void;
}

export const HospitalTable: React.FC<HospitalTableProps> = ({
  hospitals,
  onSelectHospital,
  onEditHospital,
  onQuickStatusChange,
  onOpenAddModal,
}) => {
  if (hospitals.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-xs">
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-3">
          <Building2 className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-slate-800">No matching hospitals found</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
          No hospital records match your current filter selection. Try clearing filters or search query.
        </p>
        <button
          onClick={onOpenAddModal}
          className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Hospital</span>
        </button>
      </div>
    );
  }

  const callStatuses: CallStatus[] = [
    'Hot',
    'Warm',
    'Application in progress',
    'Engaged',
    'Cold',
    'Existing',
    'Won',
    'Lost'
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 z-10">
            <tr>
              <th className="px-4 py-3 text-[10px] font-bold uppercase text-slate-500 min-w-[220px]">Organisation & Location</th>
              <th className="px-4 py-3 text-[10px] font-bold uppercase text-slate-500 min-w-[140px]">Contact Person</th>
              <th className="px-4 py-3 text-[10px] font-bold uppercase text-slate-500 min-w-[120px]">Mobile</th>
              <th className="px-4 py-3 text-[10px] font-bold uppercase text-slate-500 min-w-[130px]">Call Status</th>
              <th className="px-4 py-3 text-[10px] font-bold uppercase text-slate-500 min-w-[140px]">Yatra (City & Date)</th>
              <th className="px-4 py-3 text-[10px] font-bold uppercase text-slate-500 min-w-[140px]">Accreditation Category</th>
              <th className="px-4 py-3 text-[10px] font-bold uppercase text-slate-500 min-w-[100px]">Expiry Date</th>
              <th className="px-4 py-3 text-[10px] font-bold uppercase text-slate-500 min-w-[130px]">Renewal Urgency</th>
              <th className="px-4 py-3 text-[10px] font-bold uppercase text-slate-500 min-w-[180px]">Remarks</th>
              <th className="px-4 py-3 text-[10px] font-bold uppercase text-slate-500 text-right min-w-[100px]">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {hospitals.map((hospital) => {
              const fullName = [hospital.firstName, hospital.lastName].filter(Boolean).join(' ') || '—';
              const latestRemark = hospital.remarks && hospital.remarks.length > 0 
                ? hospital.remarks[0] 
                : null;
              
              const whatsappUrl = hospital.mobile ? getWhatsAppLink(hospital.mobile, hospital.organisation, fullName) : '';
              const trainingCount = hospital.enrolledCohortIds?.length || 0;

              return (
                <tr
                  key={hospital.id}
                  id={`hospital-row-${hospital.id}`}
                  onClick={() => onSelectHospital(hospital)}
                  className="hover:bg-blue-50/40 group cursor-pointer transition-colors"
                >
                  {/* Organisation & Location */}
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {hospital.organisation}
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                      <span>{hospital.city || 'Bhopal'}, {hospital.state || 'Madhya Pradesh'}</span>
                    </div>
                  </td>

                  {/* Contact Person */}
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-800">
                      {fullName}
                    </div>
                  </td>

                  {/* Mobile */}
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    {hospital.mobile ? (
                      <div className="flex items-center gap-1.5 font-mono text-slate-700">
                        <a
                          href={`tel:${hospital.mobile}`}
                          className="hover:text-blue-600 hover:underline"
                        >
                          {hospital.mobile}
                        </a>
                        <a
                          href={whatsappUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-emerald-600 hover:text-emerald-700 p-0.5"
                          title="Message on WhatsApp"
                        >
                          <MessageCircle className="w-3.5 h-3.5 inline" />
                        </a>
                      </div>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>

                  {/* Call Status */}
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <div className="relative inline-block text-left">
                      <select
                        id={`select-status-${hospital.id}`}
                        value={hospital.callStatus}
                        onChange={(e) => onQuickStatusChange(hospital.id, e.target.value as CallStatus, e as any)}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold border-none cursor-pointer focus:ring-1 focus:ring-blue-500 appearance-none pr-5 ${getStatusBadgeClass(hospital.callStatus)}`}
                      >
                        {callStatuses.map((st) => (
                          <option key={st} value={st} className="bg-white text-slate-800 font-normal">
                            {st}
                          </option>
                        ))}
                      </select>
                      <span className="pointer-events-none absolute inset-y-0 right-1.5 flex items-center text-[8px] text-slate-500">
                        ▼
                      </span>
                    </div>
                  </td>

                  {/* Yatra (City & Date) */}
                  <td className="px-4 py-3">
                    {hospital.yatraEventAttended ? (
                      <div className="flex flex-col">
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 w-fit">
                          <Sparkles className="w-2.5 h-2.5 text-amber-500" />
                          <span>{hospital.yatraCity || hospital.city || 'Yatra'}</span>
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono mt-0.5">
                          {formatDate(hospital.yatraEventDate)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">No Yatra</span>
                    )}
                  </td>

                  {/* Accreditation Category */}
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded text-[11px] ${getCategoryBadgeClass(hospital.accreditationCategory)}`}>
                      {hospital.accreditationCategory || '—'}
                    </span>
                  </td>

                  {/* Expiry Date */}
                  <td className="px-4 py-3 font-mono text-slate-700">
                    {formatDate(hospital.expiryDate)}
                  </td>

                  {/* Renewal Urgency */}
                  <td className="px-4 py-3">
                    {hospital.renewalUrgency ? (
                      <span className={`inline-block px-2 py-0.5 rounded font-medium ${getUrgencyBadgeClass(hospital.renewalUrgency)}`}>
                        {hospital.renewalUrgency}
                      </span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>

                  {/* Remarks */}
                  <td className="px-4 py-3">
                    {latestRemark ? (
                      <p className="text-[11px] text-slate-600 line-clamp-2" title={latestRemark.remark}>
                        {latestRemark.remark}
                      </p>
                    ) : (
                      <span className="text-slate-400 italic text-[11px]">—</span>
                    )}
                  </td>

                  {/* Action */}
                  <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1.5">
                      {onEditHospital && (
                        <button
                          id={`btn-edit-hospital-${hospital.id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditHospital(hospital);
                          }}
                          className="px-2 py-1 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded transition-colors inline-flex items-center gap-1 text-[11px] font-medium"
                          title="Edit Details"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                      )}
                      <button
                        id={`btn-open-drawer-${hospital.id}`}
                        onClick={() => onSelectHospital(hospital)}
                        className="px-2 py-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors text-[11px] font-semibold whitespace-nowrap"
                      >
                        View
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Table Footer */}
      <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
        <div>
          Showing <span className="font-semibold text-slate-700">{hospitals.length}</span> hospital entries
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-500"></span> Hot</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500"></span> Warm</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500"></span> AIP</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-600"></span> Won</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-400"></span> Cold</span>
        </div>
      </div>
    </div>
  );
};
