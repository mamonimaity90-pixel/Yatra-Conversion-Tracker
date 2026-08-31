import React from 'react';
import { 
  Building2, 
  Phone, 
  MessageSquare, 
  Calendar, 
  Clock, 
  ShieldCheck, 
  User, 
  MessageCircle,
  PlusCircle,
  ChevronRight,
  ArrowRight,
  Edit2
} from 'lucide-react';
import { Hospital, CallStatus } from '../types';
import { 
  formatDate, 
  getUrgencyBadgeClass, 
  getCategoryBadgeClass,
  getWhatsAppLink 
} from '../utils/helpers';

interface KanbanBoardProps {
  hospitals: Hospital[];
  onSelectHospital: (hospital: Hospital) => void;
  onEditHospital?: (hospital: Hospital) => void;
  onQuickStatusChange: (hospitalId: string, newStatus: CallStatus, e: React.MouseEvent) => void;
  onOpenAddModal: () => void;
}

const COLUMNS: { id: CallStatus; title: string; subtitle: string; color: string; borderTop: string }[] = [
  { 
    id: 'Hot', 
    title: 'Hot', 
    subtitle: 'High priority / urgent', 
    color: 'bg-red-50 text-red-800', 
    borderTop: 'border-t-red-500' 
  },
  { 
    id: 'Warm', 
    title: 'Warm', 
    subtitle: 'Active follow-up', 
    color: 'bg-amber-50 text-amber-800', 
    borderTop: 'border-t-amber-500' 
  },
  { 
    id: 'Application in progress', 
    title: 'App in Progress', 
    subtitle: 'Application submitted / underway', 
    color: 'bg-indigo-50 text-indigo-800', 
    borderTop: 'border-t-indigo-500' 
  },
  { 
    id: 'Engaged', 
    title: 'Engaged', 
    subtitle: 'In communication', 
    color: 'bg-blue-50 text-blue-800', 
    borderTop: 'border-t-blue-500' 
  },
  { 
    id: 'Existing', 
    title: 'Existing', 
    subtitle: 'Existing network', 
    color: 'bg-teal-50 text-teal-800', 
    borderTop: 'border-t-teal-500' 
  },
  { 
    id: 'Won', 
    title: 'Won', 
    subtitle: 'Converted / Certified', 
    color: 'bg-emerald-50 text-emerald-800', 
    borderTop: 'border-t-emerald-500' 
  },
  { 
    id: 'Cold', 
    title: 'Cold', 
    subtitle: 'Deferred / no response', 
    color: 'bg-slate-100 text-slate-700', 
    borderTop: 'border-t-slate-400' 
  },
  { 
    id: 'Lost', 
    title: 'Lost', 
    subtitle: 'Not proceeding', 
    color: 'bg-rose-50 text-rose-700', 
    borderTop: 'border-t-rose-400' 
  },
];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  hospitals,
  onSelectHospital,
  onEditHospital,
  onOpenAddModal,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-3 items-start overflow-x-auto pb-4">
      {COLUMNS.map((col) => {
        const colHospitals = hospitals.filter((h) => h.callStatus === col.id);

        return (
          <div
            key={col.id}
            className="bg-white rounded-xl border border-slate-200 p-3 shadow-xs flex flex-col min-w-[240px]"
          >
            {/* Column Header */}
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-xs font-bold text-slate-900 tracking-tight">
                {col.title}
              </h4>
              <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                {colHospitals.length}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mb-3 line-clamp-1">
              {col.subtitle}
            </p>

            {/* Hospital Cards Container */}
            <div className="space-y-2.5 flex-1 min-h-[240px]">
              {colHospitals.length === 0 ? (
                <div className="h-24 border border-dashed border-slate-200 rounded-lg flex flex-col items-center justify-center text-center p-3 text-slate-400 text-xs bg-slate-50/50">
                  <span>No hospitals</span>
                </div>
              ) : (
                colHospitals.map((hospital) => {
                  const latestRemark = hospital.remarks?.[0];
                  const fullName = [hospital.firstName, hospital.lastName].filter(Boolean).join(' ') || '—';
                  const whatsappUrl = hospital.mobile ? getWhatsAppLink(hospital.mobile, hospital.organisation, fullName) : '';

                  return (
                    <div
                      key={hospital.id}
                      onClick={() => onSelectHospital(hospital)}
                      className="bg-slate-50/70 rounded-lg border border-slate-200/80 p-3 hover:bg-blue-50/30 hover:border-blue-300 transition-all cursor-pointer group relative"
                    >
                      {/* Top badges */}
                      <div className="flex items-center justify-between gap-1 mb-1.5 flex-wrap">
                        <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-bold ${getCategoryBadgeClass(hospital.accreditationCategory)}`}>
                          {hospital.accreditationCategory}
                        </span>
                        <div className="flex items-center gap-1">
                          {hospital.renewalUrgency && (
                            <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-bold ${getUrgencyBadgeClass(hospital.renewalUrgency)}`}>
                              {hospital.renewalUrgency}
                            </span>
                          )}
                          {onEditHospital && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onEditHospital(hospital);
                              }}
                              className="p-1 rounded text-slate-400 hover:text-slate-800 hover:bg-slate-200 transition-colors"
                              title="Edit Record"
                            >
                              <Edit2 className="w-2.5 h-2.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Hospital Name */}
                      <h5 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                        {hospital.organisation}
                      </h5>

                      {/* Contact person & Mobile */}
                      <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                        <span className="text-slate-700 font-medium truncate max-w-[130px]" title={fullName}>
                          {fullName}
                        </span>
                        {hospital.mobile && (
                          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                            <a
                              href={`tel:${hospital.mobile}`}
                              title={`Call ${hospital.mobile}`}
                              className="p-1 rounded text-slate-500 hover:text-blue-600"
                            >
                              <Phone className="w-3 h-3" />
                            </a>
                            <a
                              href={whatsappUrl}
                              target="_blank"
                              rel="noreferrer"
                              title="WhatsApp"
                              className="p-1 rounded text-emerald-600 hover:text-emerald-700"
                            >
                              <MessageCircle className="w-3 h-3" />
                            </a>
                          </div>
                        )}
                      </div>

                      {/* Latest remark */}
                      {latestRemark && (
                        <div className="mt-2 bg-white p-1.5 rounded text-[10px] text-slate-600 line-clamp-2 italic border border-slate-100">
                          "{latestRemark.remark}"
                        </div>
                      )}

                      {/* Expiry Date */}
                      <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                        <span>Expiry: {formatDate(hospital.expiryDate)}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Quick Add trigger */}
            <button
              onClick={onOpenAddModal}
              className="mt-3 py-1.5 px-2 rounded-lg border border-dashed border-slate-200 text-[11px] font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all flex items-center justify-center gap-1.5"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add Hospital</span>
            </button>
          </div>
        );
      })}
    </div>
  );
};
