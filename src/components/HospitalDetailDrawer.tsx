import React, { useState } from 'react';
import { 
  X, 
  Building2, 
  Phone, 
  Calendar, 
  Clock, 
  ShieldCheck, 
  User, 
  Send, 
  MessageCircle, 
  CheckCircle2, 
  History, 
  Edit2,
  Save,
  GraduationCap,
  Sparkles,
  MapPin,
  Trophy,
  ArrowRight,
  Plus
} from 'lucide-react';
import { Hospital, CallStatus, InteractionRemark, TrainingCohort } from '../types';
import { 
  formatDate, 
  getStatusBadgeClass, 
  getUrgencyBadgeClass, 
  getCategoryBadgeClass,
  getWhatsAppLink,
  calculateRenewalUrgency,
  buildHospitalLifecycle
} from '../utils/helpers';

interface HospitalDetailDrawerProps {
  hospital: Hospital | null;
  cohorts?: TrainingCohort[];
  onClose: () => void;
  onAddRemark: (hospitalId: string, remark: Omit<InteractionRemark, 'id' | 'date'>) => void;
  onUpdateHospitalDetails: (hospital: Hospital) => void;
  onOpenEditModal?: (hospital: Hospital) => void;
  onEnrollInCohort?: (hospitalId: string) => void;
}

export const HospitalDetailDrawer: React.FC<HospitalDetailDrawerProps> = ({
  hospital,
  cohorts = [],
  onClose,
  onAddRemark,
  onUpdateHospitalDetails,
  onOpenEditModal,
}) => {
  if (!hospital) return null;

  const [activeTab, setActiveTab] = useState<'lifecycle' | 'overview' | 'remarks'>('lifecycle');
  const [callStatus, setCallStatus] = useState<CallStatus>(hospital.callStatus);
  const [remarkText, setRemarkText] = useState('');
  const [authorName, setAuthorName] = useState('Advisor');
  const [channel, setChannel] = useState<'Phone Call' | 'In-Person Visit' | 'WhatsApp' | 'Email' | 'Online Meeting'>('Phone Call');
  const [nextFollowUp, setNextFollowUp] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fullName = [hospital.firstName, hospital.lastName].filter(Boolean).join(' ') || '—';
  const whatsappUrl = hospital.mobile ? getWhatsAppLink(hospital.mobile, hospital.organisation, fullName) : '';
  const milestones = buildHospitalLifecycle(hospital, cohorts);

  const handleSubmitRemark = (e: React.FormEvent) => {
    e.preventDefault();
    if (!remarkText.trim()) return;

    setIsSubmitting(true);
    onAddRemark(hospital.id, {
      author: authorName,
      callStatus: callStatus,
      remark: remarkText.trim(),
      channel: channel,
      nextFollowUp: nextFollowUp || undefined,
    });

    setRemarkText('');
    setNextFollowUp('');
    setIsSubmitting(false);
  };

  const handleToggleYatra = () => {
    onUpdateHospitalDetails({
      ...hospital,
      yatraEventAttended: !hospital.yatraEventAttended,
      yatraEventDate: !hospital.yatraEventAttended ? '2026-06-15' : undefined,
      yatraEventName: !hospital.yatraEventAttended ? `Aarogya Yatra ${hospital.city || 'Bhopal'} Summit 2026` : undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-2xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-xl bg-white h-full shadow-2xl z-10 flex flex-col overflow-hidden border-l border-slate-200">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-white flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-lg shadow-xs shrink-0">
              {hospital.organisation.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${getCategoryBadgeClass(hospital.accreditationCategory)}`}>
                  {hospital.accreditationCategory}
                </span>
                {hospital.renewalUrgency && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${getUrgencyBadgeClass(hospital.renewalUrgency)}`}>
                    {hospital.renewalUrgency}
                  </span>
                )}
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${getStatusBadgeClass(hospital.callStatus)}`}>
                  {hospital.callStatus}
                </span>
                {hospital.yatraEventAttended && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    <span>Yatra Alum</span>
                  </span>
                )}
              </div>

              <h2 className="text-base sm:text-lg font-bold text-slate-900 mt-1.5 leading-snug">
                {hospital.organisation}
              </h2>
              <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                <span>📍 {hospital.city || 'Bhopal'}, {hospital.state || 'Madhya Pradesh'}</span>
                <span>• Expiry: {formatDate(hospital.expiryDate)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {onOpenEditModal && (
              <button
                onClick={() => onOpenEditModal(hospital)}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200"
                title="Edit Hospital Details"
              >
                <Edit2 className="w-3.5 h-3.5 text-blue-600" />
                <span>Edit</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action Bar (Call / WhatsApp) */}
        {hospital.mobile && (
          <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <a
                href={`tel:${hospital.mobile}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-800 text-xs font-semibold hover:bg-slate-100 transition-all shadow-xs"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call ({hospital.mobile})</span>
              </a>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-all shadow-xs"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </a>
            </div>

            <button
              onClick={handleToggleYatra}
              className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-colors ${
                hospital.yatraEventAttended
                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {hospital.yatraEventAttended ? '✓ Yatra Attended' : '+ Mark Yatra Event'}
            </button>
          </div>
        )}

        {/* Drawer Tabs */}
        <div className="flex border-b border-slate-200 bg-white px-4">
          <button
            onClick={() => setActiveTab('lifecycle')}
            className={`py-2.5 px-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'lifecycle'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Lifecycle Journey ({milestones.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('overview')}
            className={`py-2.5 px-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'overview'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Master Profile</span>
          </button>

          <button
            onClick={() => setActiveTab('remarks')}
            className={`py-2.5 px-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'remarks'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Log Call & Remarks</span>
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5 bg-slate-50">
          
          {/* TAB 1: LIFECYCLE TIMELINE VIEW (Core User Requirement) */}
          {activeTab === 'lifecycle' && (
            <div className="space-y-4">
              
              {/* Lifecycle explanation card */}
              <div className="bg-indigo-50/80 border border-indigo-100 rounded-xl p-3.5 text-xs text-indigo-950">
                <div className="font-bold flex items-center gap-1.5 mb-1 text-indigo-900">
                  <GraduationCap className="w-4 h-4 text-indigo-700" />
                  <span>Hospital Accreditation Lifecycle & Efficacy Path</span>
                </div>
                <p className="text-[11px] text-indigo-800 leading-relaxed">
                  Tracking event attendance (Yatra discovery) &rarr; training masterclasses &rarr; outreach calls &rarr; final accreditation conversion.
                </p>
              </div>

              {/* Chronological Timeline */}
              <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {milestones.map((ms, index) => {
                  return (
                    <div key={ms.id || index} className="relative group">
                      {/* Node circle */}
                      <div className={`absolute -left-6 top-1 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold shadow-xs ${
                        ms.type === 'conversion'
                          ? 'bg-emerald-600 text-white'
                          : ms.type === 'training'
                          ? 'bg-indigo-600 text-white'
                          : ms.type === 'yatra'
                          ? 'bg-amber-500 text-white'
                          : 'bg-blue-500 text-white'
                      }`}>
                        {ms.type === 'conversion' ? '🏆' : ms.type === 'training' ? '🎓' : ms.type === 'yatra' ? '🌟' : '📞'}
                      </div>

                      {/* Content Card */}
                      <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-xs space-y-1 hover:border-slate-300 transition-colors">
                        <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
                          <span className="font-bold text-slate-900">{ms.title}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{formatDate(ms.date)}</span>
                        </div>

                        <p className="text-xs text-slate-600 leading-relaxed">
                          {ms.description}
                        </p>

                        {ms.statusBadge && (
                          <div className="pt-1">
                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${ms.badgeColor || 'bg-slate-100 text-slate-700'}`}>
                              {ms.statusBadge}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {milestones.length === 0 && (
                <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-slate-400 text-xs">
                  No lifecycle touchpoints logged yet.
                </div>
              )}

            </div>
          )}

          {/* TAB 2: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Hospital Master Details
                </h4>
                <div className="grid grid-cols-2 gap-3.5 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Contact Person</span>
                    <strong className="text-slate-800 font-semibold">{fullName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Mobile Number</span>
                    <strong className="text-slate-800 font-mono font-semibold">{hospital.mobile || '—'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">City / State</span>
                    <span className="text-slate-800 font-medium">{hospital.city || 'Bhopal'}, {hospital.state || 'Madhya Pradesh'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Accreditation Category</span>
                    <span className="text-slate-800 font-medium">{hospital.accreditationCategory || '—'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Expiry Date</span>
                    <span className="text-slate-800 font-mono font-medium">{formatDate(hospital.expiryDate)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Renewal Urgency</span>
                    <span className="text-slate-800 font-medium">{hospital.renewalUrgency || '—'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Yatra Event Attended</span>
                    <span className="text-slate-800 font-medium">
                      {hospital.yatraEventAttended ? `Yes (${formatDate(hospital.yatraEventDate)})` : 'No'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Enrolled Training Cohorts</span>
                    <span className="text-indigo-700 font-bold">
                      {hospital.enrolledCohortIds?.length || 0} Sessions
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: REMARKS LOGGER */}
          {activeTab === 'remarks' && (
            <div className="space-y-4">
              {/* INTERACTIVE REMARK LOGGER */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col">
                <h3 className="text-xs font-bold text-slate-400 uppercase mb-3">
                  Log Call Remark & Update Status
                </h3>

                <form onSubmit={handleSubmitRemark} className="space-y-3">
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Update Status</label>
                      <select
                        value={callStatus}
                        onChange={(e) => setCallStatus(e.target.value as CallStatus)}
                        className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:ring-1 focus:ring-blue-500 outline-none bg-slate-50"
                      >
                        <option value="Hot">🔥 Hot</option>
                        <option value="Warm">⚡ Warm</option>
                        <option value="Application in progress">📋 Application in progress</option>
                        <option value="Engaged">💬 Engaged</option>
                        <option value="Existing">🏢 Existing</option>
                        <option value="Cold">❄️ Cold</option>
                        <option value="Won">🏆 Won (Converted)</option>
                        <option value="Lost">❌ Lost</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Channel</label>
                      <select
                        value={channel}
                        onChange={(e) => setChannel(e.target.value as any)}
                        className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:ring-1 focus:ring-blue-500 outline-none bg-slate-50"
                      >
                        <option value="Phone Call">📞 Phone Call</option>
                        <option value="WhatsApp">💬 WhatsApp</option>
                        <option value="In-Person Visit">🏥 In-Person Visit</option>
                        <option value="Online Meeting">💻 Online Meeting</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Remark Note</label>
                    <textarea
                      rows={2}
                      value={remarkText}
                      onChange={(e) => setRemarkText(e.target.value)}
                      placeholder="Enter interaction remarks, feedback, or next steps..."
                      className="w-full border border-slate-200 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-blue-500 outline-none resize-none bg-slate-50 text-slate-800 placeholder:text-slate-400"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Follow-up Date (Optional)</label>
                      <input
                        type="date"
                        value={nextFollowUp}
                        onChange={(e) => setNextFollowUp(e.target.value)}
                        className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs focus:ring-1 focus:ring-blue-500 outline-none bg-slate-50"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Logged By</label>
                      <input
                        type="text"
                        value={authorName}
                        onChange={(e) => setAuthorName(e.target.value)}
                        className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs focus:ring-1 focus:ring-blue-500 outline-none bg-slate-50"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={!remarkText.trim() || isSubmitting}
                    className="w-full bg-slate-900 text-white py-2 rounded-lg text-xs font-semibold hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Log Activity & Update
                  </button>

                </form>
              </div>

              {/* Past Remarks */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Interaction Log History ({hospital.remarks?.length || 0})
                </h3>

                {(!hospital.remarks || hospital.remarks.length === 0) ? (
                  <div className="p-4 text-center text-slate-400 text-xs italic">
                    No past remarks recorded.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {hospital.remarks.map((rem, idx) => (
                      <div key={rem.id || idx} className="p-3 rounded-lg bg-slate-50 border border-slate-100 space-y-1">
                        <div className="flex items-center justify-between flex-wrap gap-1 text-[11px]">
                          <div className="flex items-center gap-1.5">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${getStatusBadgeClass(rem.callStatus)}`}>
                              {rem.callStatus}
                            </span>
                            {rem.channel && (
                              <span className="text-slate-500 font-medium">
                                via {rem.channel}
                              </span>
                            )}
                          </div>
                          <span className="text-slate-400 text-[10px]">{formatDate(rem.date)}</span>
                        </div>

                        <p className="text-xs text-slate-800 leading-relaxed pt-0.5">
                          {rem.remark}
                        </p>

                        <div className="pt-1 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-500">
                          <span>By: <strong className="font-medium text-slate-700">{rem.author}</strong></span>
                          {rem.nextFollowUp && (
                            <span className="text-amber-700 font-semibold bg-amber-50 px-1.5 py-0.2 rounded">
                              Follow-up: {formatDate(rem.nextFollowUp)}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
