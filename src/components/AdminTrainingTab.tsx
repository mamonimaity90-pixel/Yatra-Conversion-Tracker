import React, { useState } from 'react';
import { 
  GraduationCap, 
  Plus, 
  Calendar, 
  MapPin, 
  Users, 
  CheckCircle, 
  Clock, 
  UserCheck, 
  ArrowRight, 
  Building2, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  Trophy, 
  Search,
  Filter,
  Layers,
  ChevronDown,
  Trash2,
  Edit2,
  Globe,
  Compass,
  Check,
  AlertCircle
} from 'lucide-react';
import { TrainingCohort, Hospital, CallStatus, CohortAttendee, StateLocation } from '../types';
import { formatDate, getStatusBadgeClass, getCategoryBadgeClass, calculateTrainingEfficacy } from '../utils/helpers';

interface AdminTrainingTabProps {
  cohorts: TrainingCohort[];
  hospitals: Hospital[];
  states: StateLocation[];
  onCreateCohort: (newCohort: Omit<TrainingCohort, 'id' | 'enrolledHospitalIds' | 'attendees'>) => void;
  onEditCohort: (updatedCohort: TrainingCohort) => void;
  onDeleteCohort: (cohortId: string) => void;
  onEnrollHospitals: (cohortId: string, hospitalIds: string[]) => void;
  onUpdateAttendeeStatus: (
    cohortId: string, 
    hospitalId: string, 
    attendanceStatus: CohortAttendee['attendanceStatus'], 
    postTrainingStatus: CallStatus
  ) => void;
  onAddState: (stateName: string, initialCities?: string[]) => void;
  onDeleteState: (stateId: string) => void;
  onAddCity: (stateId: string, cityName: string) => void;
  onDeleteCity: (stateId: string, cityName: string) => void;
  onUpdateHospitalYatra: (hospitalId: string, attended: boolean, eventName?: string, eventDate?: string) => void;
  onSelectHospital: (hospital: Hospital) => void;
}

export const AdminTrainingTab: React.FC<AdminTrainingTabProps> = ({
  cohorts,
  hospitals,
  states,
  onCreateCohort,
  onEditCohort,
  onDeleteCohort,
  onEnrollHospitals,
  onUpdateAttendeeStatus,
  onAddState,
  onDeleteState,
  onAddCity,
  onDeleteCity,
  onUpdateHospitalYatra,
  onSelectHospital,
}) => {
  const [adminSection, setAdminSection] = useState<'trainings' | 'locations' | 'yatra_lifecycle'>('trainings');
  const [selectedCohortId, setSelectedCohortId] = useState<string>(cohorts[0]?.id || '');
  
  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCohort, setEditingCohort] = useState<TrainingCohort | null>(null);
  const [showAssignerModal, setShowAssignerModal] = useState(false);
  const [cohortToDelete, setCohortToDelete] = useState<TrainingCohort | null>(null);

  // States & Cities management state
  const [newStateName, setNewStateName] = useState('');
  const [selectedStateForCity, setSelectedStateForCity] = useState<string>(states[0]?.id || '');
  const [newCityName, setNewCityName] = useState('');

  // Hospital Yatra Quick Logger filter
  const [yatraSearch, setYatraSearch] = useState('');
  const [yatraStatusFilter, setYatraStatusFilter] = useState<'ALL' | 'ATTENDED' | 'NOT_ATTENDED'>('ALL');

  // Filter for candidate hospital assigner
  const [assignerCategory, setAssignerCategory] = useState('ALL');
  const [assignerStatus, setAssignerStatus] = useState('ALL');
  const [assignerSearch, setAssignerSearch] = useState('');
  const [selectedForEnrollment, setSelectedForEnrollment] = useState<string[]>([]);

  // Create/Edit Cohort Form State
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState('Certified & Entry Level Hospitals');
  const [formDate, setFormDate] = useState('');
  const [formTime, setFormTime] = useState('10:00 AM - 01:30 PM');
  const [formState, setFormState] = useState('Madhya Pradesh');
  const [formCity, setFormCity] = useState('Bhopal');
  const [formVenue, setFormVenue] = useState('');
  const [formMode, setFormMode] = useState<'In-Person' | 'Hybrid' | 'Virtual'>('In-Person');
  const [formCapacity, setFormCapacity] = useState<number>(35);
  const [formTrainer, setFormTrainer] = useState('');
  const [formStatus, setFormStatus] = useState<'Upcoming' | 'In Progress' | 'Completed' | 'Cancelled'>('Upcoming');

  const activeCohort = cohorts.find((c) => c.id === selectedCohortId) || cohorts[0];

  const handleOpenCreate = () => {
    setFormTitle('');
    setFormCategory('Certified & Entry Level Hospitals');
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormTime('10:00 AM - 02:00 PM');
    setFormState(states[0]?.name || 'Madhya Pradesh');
    setFormCity(states[0]?.cities[0] || 'Bhopal');
    setFormVenue('');
    setFormMode('In-Person');
    setFormCapacity(35);
    setFormTrainer('');
    setFormStatus('Upcoming');
    setShowCreateModal(true);
  };

  const handleOpenEdit = (cohort: TrainingCohort, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingCohort(cohort);
    setFormTitle(cohort.title);
    setFormCategory(cohort.targetCategory);
    setFormDate(cohort.date);
    setFormTime(cohort.time);
    setFormState(cohort.state || 'Madhya Pradesh');
    setFormCity(cohort.city);
    setFormVenue(cohort.venue);
    setFormMode(cohort.mode);
    setFormCapacity(cohort.capacity);
    setFormTrainer(cohort.trainerName);
    setFormStatus(cohort.status);
    setShowEditModal(true);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formDate) return;

    onCreateCohort({
      title: formTitle.trim(),
      targetCategory: formCategory,
      date: formDate,
      time: formTime,
      state: formState,
      city: formCity || 'Bhopal',
      venue: formVenue.trim() || `${formCity} Quality Hall & Medical Chambers`,
      mode: formMode,
      capacity: Number(formCapacity) || 30,
      trainerName: formTrainer.trim() || 'Dr. Amitabh Sen (Lead Assessor)',
      status: formStatus
    });

    setShowCreateModal(false);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCohort || !formTitle.trim()) return;

    onEditCohort({
      ...editingCohort,
      title: formTitle.trim(),
      targetCategory: formCategory,
      date: formDate,
      time: formTime,
      state: formState,
      city: formCity,
      venue: formVenue.trim() || editingCohort.venue,
      mode: formMode,
      capacity: Number(formCapacity) || editingCohort.capacity,
      trainerName: formTrainer.trim() || editingCohort.trainerName,
      status: formStatus
    });

    setShowEditModal(false);
    setEditingCohort(null);
  };

  const handleDeleteConfirm = () => {
    if (!cohortToDelete) return;
    onDeleteCohort(cohortToDelete.id);
    if (selectedCohortId === cohortToDelete.id) {
      const remaining = cohorts.filter((c) => c.id !== cohortToDelete.id);
      setSelectedCohortId(remaining[0]?.id || '');
    }
    setCohortToDelete(null);
  };

  const handleConfirmEnrollment = () => {
    if (!activeCohort || selectedForEnrollment.length === 0) return;
    onEnrollHospitals(activeCohort.id, selectedForEnrollment);
    setSelectedForEnrollment([]);
    setShowAssignerModal(false);
  };

  // State & City management handlers
  const handleAddStateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStateName.trim()) return;
    onAddState(newStateName.trim());
    setNewStateName('');
  };

  const handleAddCitySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStateForCity || !newCityName.trim()) return;
    onAddCity(selectedStateForCity, newCityName.trim());
    setNewCityName('');
  };

  // Filter candidates for hospital assigner
  const candidateHospitals = hospitals.filter((h) => {
    const isAlreadyEnrolled = activeCohort?.enrolledHospitalIds.includes(h.id);
    if (isAlreadyEnrolled) return false;

    if (assignerCategory !== 'ALL' && h.accreditationCategory !== assignerCategory) return false;
    if (assignerStatus !== 'ALL' && h.callStatus !== assignerStatus) return false;
    if (assignerSearch) {
      const q = assignerSearch.toLowerCase();
      const matchName = h.organisation.toLowerCase().includes(q);
      const matchFirst = (h.firstName || '').toLowerCase().includes(q);
      const matchLast = (h.lastName || '').toLowerCase().includes(q);
      const matchMobile = (h.mobile || '').includes(q);
      if (!matchName && !matchFirst && !matchLast && !matchMobile) return false;
    }
    return true;
  });

  const toggleSelectHospital = (id: string) => {
    if (selectedForEnrollment.includes(id)) {
      setSelectedForEnrollment(selectedForEnrollment.filter((hId) => hId !== id));
    } else {
      setSelectedForEnrollment([...selectedForEnrollment, id]);
    }
  };

  const selectAllCandidates = () => {
    const ids = candidateHospitals.map((h) => h.id);
    setSelectedForEnrollment(ids);
  };

  const clearSelection = () => {
    setSelectedForEnrollment([]);
  };

  // Stats for active cohort
  const totalEnrolled = activeCohort?.attendees?.length || 0;
  const attendedCount = activeCohort?.attendees?.filter((a) => a.attendanceStatus === 'Attended').length || 0;
  const convertedWonCount = activeCohort?.attendees?.filter((a) => a.postTrainingStatus === 'Won').length || 0;

  const callStatuses: CallStatus[] = [
    'Hot',
    'Warm',
    'Application in progress',
    'Engaged',
    'Existing',
    'Won',
    'Cold',
    'Lost'
  ];

  // Filtered hospitals for Yatra Event Tracker section
  const yatraFilteredHospitals = hospitals.filter((h) => {
    if (yatraStatusFilter === 'ATTENDED' && !h.yatraEventAttended) return false;
    if (yatraStatusFilter === 'NOT_ATTENDED' && h.yatraEventAttended) return false;
    if (yatraSearch.trim()) {
      const q = yatraSearch.toLowerCase();
      const matchName = h.organisation.toLowerCase().includes(q);
      const matchContact = `${h.firstName || ''} ${h.lastName || ''}`.toLowerCase().includes(q);
      const matchCity = (h.city || '').toLowerCase().includes(q);
      return matchName || matchContact || matchCity;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Sub-Section Navigation */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold mb-2 border border-indigo-100">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Operations & Administration Control Center</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Training Cohorts, Geographies & Lifecycle Connections
            </h2>
            <p className="text-xs text-slate-500 max-w-2xl mt-0.5">
              Manage accreditation masterclasses, configure state & city geographies, and connect hospital lifecycle milestones from Yatra events to training and conversion.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-open-create-cohort"
              onClick={handleOpenCreate}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>New Training Session</span>
            </button>
          </div>
        </div>

        {/* Section Tabs */}
        <div className="flex items-center gap-2 mt-5 pt-4 border-t border-slate-100">
          <button
            onClick={() => setAdminSection('trainings')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              adminSection === 'trainings'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Training Sessions ({cohorts.length})</span>
          </button>

          <button
            onClick={() => setAdminSection('locations')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              adminSection === 'locations'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>States & Cities ({states.length} States)</span>
          </button>

          <button
            onClick={() => setAdminSection('yatra_lifecycle')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              adminSection === 'yatra_lifecycle'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Yatra & Lifecycle Manager</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: TRAINING COHORTS MANAGEMENT */}
      {adminSection === 'trainings' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          
          {/* Left: Cohorts List Sidebar (4 cols) */}
          <div className="lg:col-span-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-indigo-600" />
                <span>All Cohorts ({cohorts.length})</span>
              </h3>
              <span className="text-[11px] text-slate-500">Select to manage</span>
            </div>

            {cohorts.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-slate-400 text-xs">
                No training sessions scheduled. Click "New Training Session" to add one.
              </div>
            ) : (
              <div className="space-y-2.5">
                {cohorts.map((cohort) => {
                  const isSelected = cohort.id === activeCohort?.id;
                  const fillPct = Math.round((cohort.enrolledHospitalIds.length / cohort.capacity) * 100);

                  return (
                    <div
                      key={cohort.id}
                      onClick={() => setSelectedCohortId(cohort.id)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer relative group ${
                        isSelected
                          ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                          : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-bold line-clamp-1 pr-12">{cohort.title}</h4>
                        
                        <div className="flex items-center gap-1 shrink-0">
                          {/* Edit / Delete icons */}
                          <button
                            onClick={(e) => handleOpenEdit(cohort, e)}
                            title="Edit Training Session"
                            className={`p-1 rounded hover:bg-white/20 transition-colors ${
                              isSelected ? 'text-slate-300 hover:text-white' : 'text-slate-400 hover:text-slate-700'
                            }`}
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setCohortToDelete(cohort);
                            }}
                            title="Delete Training Session"
                            className={`p-1 rounded hover:bg-rose-500/20 text-rose-400 hover:text-rose-600 transition-colors`}
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mt-1.5">
                        <span className={`text-[9px] px-2 py-0.2 rounded-full font-bold uppercase ${
                          isSelected
                            ? 'bg-slate-800 text-indigo-300 border border-slate-700'
                            : cohort.status === 'Completed'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                        }`}>
                          {cohort.status}
                        </span>
                        <span className={`text-[11px] ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                          📍 {cohort.city} • {cohort.mode}
                        </span>
                      </div>

                      <div className={`mt-2 flex items-center justify-between text-[11px] ${isSelected ? 'text-slate-400' : 'text-slate-500'}`}>
                        <span>📅 {formatDate(cohort.date)}</span>
                        <span>
                          Seats: <strong className={isSelected ? 'text-white' : 'text-slate-800'}>{cohort.enrolledHospitalIds.length}</strong>/{cohort.capacity}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right: Active Cohort Details & Attendee Roster (8 cols) */}
          {activeCohort ? (
            <div className="lg:col-span-8 space-y-4">
              
              {/* Cohort detail card */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                        {activeCohort.targetCategory}
                      </span>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                        activeCohort.status === 'Completed' ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'
                      }`}>
                        {activeCohort.status}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900">
                      {activeCohort.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                      <span>📅 {formatDate(activeCohort.date)} ({activeCohort.time})</span>
                      <span>📍 {activeCohort.venue} ({activeCohort.city}, {activeCohort.state || 'MP'})</span>
                      <span>👨‍🏫 Trainer: <strong className="text-slate-700">{activeCohort.trainerName}</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleOpenEdit(activeCohort)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => setCohortToDelete(activeCohort)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-rose-200 hover:bg-rose-50 text-rose-600 text-xs font-semibold transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                    <button
                      id="btn-open-assigner-modal"
                      onClick={() => setShowAssignerModal(true)}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors"
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>Assign Hospitals</span>
                    </button>
                  </div>
                </div>

                {/* Quick stats ribbon */}
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-500 uppercase block font-medium">Total Enrolled</span>
                    <strong className="text-base font-bold text-slate-900">{totalEnrolled}</strong>
                  </div>
                  <div className="p-2.5 rounded-lg bg-emerald-50/60 border border-emerald-100">
                    <span className="text-[10px] text-emerald-700 uppercase block font-medium">Attended</span>
                    <strong className="text-base font-bold text-emerald-800">{attendedCount}</strong>
                  </div>
                  <div className="p-2.5 rounded-lg bg-indigo-50/60 border border-indigo-100">
                    <span className="text-[10px] text-indigo-700 uppercase block font-medium">Converted (Won)</span>
                    <strong className="text-base font-bold text-indigo-800">{convertedWonCount}</strong>
                  </div>
                </div>
              </div>

              {/* Attendee Roster Table */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Attendee Roster ({activeCohort.attendees.length} Hospitals)
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Record live attendance and update post-training conversion status to measure training efficacy
                    </p>
                  </div>
                </div>

                {activeCohort.attendees.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs">
                    <span>No hospitals enrolled in this cohort yet. Click "Assign Hospitals" above.</span>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50/80 border-b border-slate-200 text-[10px] uppercase font-bold text-slate-500">
                          <th className="py-2.5 px-4">Hospital Name</th>
                          <th className="py-2.5 px-4">Contact</th>
                          <th className="py-2.5 px-4">Attendance Status</th>
                          <th className="py-2.5 px-4">Pre-Stage</th>
                          <th className="py-2.5 px-4">Post-Training Conversion</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs">
                        {activeCohort.attendees.map((attendee) => {
                          const matchingHospital = hospitals.find((h) => h.id === attendee.hospitalId);

                          return (
                            <tr key={attendee.hospitalId} className="hover:bg-slate-50/80 transition-colors">
                              <td className="py-3 px-4">
                                <button
                                  onClick={() => matchingHospital && onSelectHospital(matchingHospital)}
                                  className="font-semibold text-slate-900 hover:text-blue-600 text-left line-clamp-1"
                                >
                                  {attendee.hospitalName}
                                </button>
                                <div className="text-[10px] text-slate-400 mt-0.5">
                                  📍 {matchingHospital?.city || activeCohort.city}
                                </div>
                              </td>

                              <td className="py-3 px-4">
                                <div className="font-medium text-slate-800">{attendee.contactPerson}</div>
                                <div className="text-[10px] text-slate-500 font-mono">{attendee.mobile}</div>
                              </td>

                              <td className="py-3 px-4">
                                <select
                                  value={attendee.attendanceStatus}
                                  onChange={(e) =>
                                    onUpdateAttendeeStatus(
                                      activeCohort.id,
                                      attendee.hospitalId,
                                      e.target.value as any,
                                      attendee.postTrainingStatus
                                    )
                                  }
                                  className={`text-[11px] font-semibold px-2 py-1 rounded-md border focus:outline-none ${
                                    attendee.attendanceStatus === 'Attended'
                                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                      : attendee.attendanceStatus === 'Confirmed'
                                      ? 'bg-blue-50 text-blue-800 border-blue-200'
                                      : attendee.attendanceStatus === 'Absent'
                                      ? 'bg-rose-50 text-rose-800 border-rose-200'
                                      : 'bg-slate-100 text-slate-700 border-slate-200'
                                  }`}
                                >
                                  <option value="Registered">Registered</option>
                                  <option value="Confirmed">Confirmed</option>
                                  <option value="Attended">✓ Attended</option>
                                  <option value="Absent">✗ Absent / No-show</option>
                                </select>
                              </td>

                              <td className="py-3 px-4">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${getStatusBadgeClass(attendee.preTrainingStatus)}`}>
                                  {attendee.preTrainingStatus}
                                </span>
                              </td>

                              <td className="py-3 px-4">
                                <div className="flex items-center gap-1.5">
                                  <select
                                    value={attendee.postTrainingStatus}
                                    onChange={(e) =>
                                      onUpdateAttendeeStatus(
                                        activeCohort.id,
                                        attendee.hospitalId,
                                        attendee.attendanceStatus,
                                        e.target.value as CallStatus
                                      )
                                    }
                                    className={`text-[11px] font-bold px-2 py-1 rounded-lg border focus:outline-none shadow-2xs ${getStatusBadgeClass(attendee.postTrainingStatus)}`}
                                  >
                                    {callStatuses.map((st) => (
                                      <option key={st} value={st}>
                                        {st === 'Won' ? '🏆 Won (Certified)' : st}
                                      </option>
                                    ))}
                                  </select>
                                  {attendee.postTrainingStatus === 'Won' && (
                                    <Trophy className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

            </div>
          ) : null}

        </div>
      )}

      {/* SECTION 2: STATES & CITIES MANAGEMENT */}
      {adminSection === 'locations' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          
          {/* Add State & City Forms (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* Add New State */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-600" />
                <span>Add New State</span>
              </h3>
              <form onSubmit={handleAddStateSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-600 mb-1 font-medium">State Name</label>
                  <input
                    type="text"
                    value={newStateName}
                    onChange={(e) => setNewStateName(e.target.value)}
                    placeholder="e.g. Rajasthan"
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold text-xs transition-colors"
                >
                  + Add State
                </button>
              </form>
            </div>

            {/* Add New City under State */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <MapPin className="w-4 h-4 text-indigo-600" />
                <span>Add City to State</span>
              </h3>
              <form onSubmit={handleAddCitySubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-600 mb-1 font-medium">Select State</label>
                  <select
                    value={selectedStateForCity}
                    onChange={(e) => setSelectedStateForCity(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                  >
                    {states.map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.name} ({st.cities.length} cities)
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 mb-1 font-medium">New City Name</label>
                  <input
                    type="text"
                    value={newCityName}
                    onChange={(e) => setNewCityName(e.target.value)}
                    placeholder="e.g. Jaipur"
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold text-xs transition-colors"
                >
                  + Add City
                </button>
              </form>
            </div>

          </div>

          {/* Existing States & Cities Directory (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-600" />
                <span>Configured Geographic Hubs</span>
              </h3>
              <span className="text-[11px] text-slate-500">{states.length} Active States</span>
            </div>

            <div className="space-y-3">
              {states.map((st) => (
                <div key={st.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900">📍 {st.name}</span>
                      <span className="text-[10px] text-slate-500 bg-slate-200/60 px-1.5 py-0.2 rounded font-mono">
                        {st.cities.length} cities
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        if (window.confirm(`Delete entire state "${st.name}" and all its cities?`)) {
                          onDeleteState(st.id);
                        }
                      }}
                      className="text-[11px] text-rose-600 hover:underline flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Delete State</span>
                    </button>
                  </div>

                  {/* Cities Pills */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {st.cities.map((city) => {
                      const count = hospitals.filter((h) => h.city === city).length;

                      return (
                        <div
                          key={city}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs text-slate-700 shadow-2xs"
                        >
                          <span className="font-medium">{city}</span>
                          {count > 0 && (
                            <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded">
                              {count}
                            </span>
                          )}
                          <button
                            onClick={() => {
                              if (window.confirm(`Delete city "${city}" from ${st.name}?`)) {
                                onDeleteCity(st.id, city);
                              }
                            }}
                            className="text-slate-400 hover:text-rose-600 ml-1"
                            title="Delete city"
                          >
                            ×
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* SECTION 3: YATRA & LIFECYCLE TRACKER */}
      {adminSection === 'yatra_lifecycle' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Hospital Lifecycle & Yatra Summit Touchpoints</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Connect each hospital's initial Yatra event attendance, subsequent training cohorts, and conversion velocity.
              </p>
            </div>

            {/* Search & Filter */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={yatraSearch}
                onChange={(e) => setYatraSearch(e.target.value)}
                placeholder="Search hospital or city..."
                className="p-1.5 px-3 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800"
              />
              <select
                value={yatraStatusFilter}
                onChange={(e) => setYatraStatusFilter(e.target.value as any)}
                className="p-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 font-medium"
              >
                <option value="ALL">All Touchpoints</option>
                <option value="ATTENDED">Yatra Attended</option>
                <option value="NOT_ATTENDED">Not Yet Attended Yatra</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase font-bold text-slate-500">
                  <th className="py-2.5 px-4">Hospital Name & City</th>
                  <th className="py-2.5 px-4">Yatra Summit Status</th>
                  <th className="py-2.5 px-4">Training Cohorts</th>
                  <th className="py-2.5 px-4">Current Stage</th>
                  <th className="py-2.5 px-4 text-right">Quick Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {yatraFilteredHospitals.slice(0, 15).map((hosp) => {
                  const enrolledCount = hosp.enrolledCohortIds?.length || 0;

                  return (
                    <tr key={hosp.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4">
                        <button
                          onClick={() => onSelectHospital(hosp)}
                          className="font-semibold text-slate-900 hover:text-blue-600 text-left line-clamp-1"
                        >
                          {hosp.organisation}
                        </button>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          📍 {hosp.city || 'Bhopal'}, {hosp.state || 'MP'} • {hosp.mobile}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        {hosp.yatraEventAttended ? (
                          <div>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                              <Sparkles className="w-3 h-3 text-amber-500" />
                              <span>Attended Yatra ({formatDate(hosp.yatraEventDate)})</span>
                            </span>
                            <div className="text-[10px] text-slate-500 mt-0.5">{hosp.yatraEventName || 'Aarogya Yatra'}</div>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400">No Yatra Recorded</span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          enrolledCount > 0 ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {enrolledCount} Cohorts
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${getStatusBadgeClass(hosp.callStatus)}`}>
                          {hosp.callStatus}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => onUpdateHospitalYatra(
                            hosp.id, 
                            !hosp.yatraEventAttended, 
                            `Aarogya Yatra ${hosp.city || 'Bhopal'} Summit 2026`,
                            '2026-06-15'
                          )}
                          className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                            hosp.yatraEventAttended
                              ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                              : 'bg-amber-500 hover:bg-amber-600 text-white shadow-2xs'
                          }`}
                        >
                          {hosp.yatraEventAttended ? 'Remove Yatra' : '+ Log Yatra Event'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE COHORT MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-2xs">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-indigo-600" />
                <span>Schedule New Training Session</span>
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Session Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. NABH 5th Edition Accreditation Implementation Intensive"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Date <span className="text-red-500">*</span></label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Timing</label>
                  <input
                    type="text"
                    value={formTime}
                    onChange={(e) => setFormTime(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">State</label>
                  <select
                    value={formState}
                    onChange={(e) => {
                      setFormState(e.target.value);
                      const match = states.find((s) => s.name === e.target.value);
                      if (match && match.cities.length > 0) {
                        setFormCity(match.cities[0]);
                      }
                    }}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                  >
                    {states.map((st) => (
                      <option key={st.id} value={st.name}>{st.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">City</label>
                  <select
                    value={formCity}
                    onChange={(e) => setFormCity(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                  >
                    {states.find((s) => s.name === formState)?.cities.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    )) || <option value="Bhopal">Bhopal</option>}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mode</label>
                  <select
                    value={formMode}
                    onChange={(e) => setFormMode(e.target.value as any)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                  >
                    <option value="In-Person">In-Person Workshop</option>
                    <option value="Virtual">Virtual Webinar</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Max Capacity</label>
                  <input
                    type="number"
                    value={formCapacity}
                    onChange={(e) => setFormCapacity(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Lead Assessor / Trainer</label>
                <input
                  type="text"
                  value={formTrainer}
                  onChange={(e) => setFormTrainer(e.target.value)}
                  placeholder="e.g. Dr. Amitabh Sen (Assessor & Principal Advisor)"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Venue / Hall</label>
                <input
                  type="text"
                  value={formVenue}
                  onChange={(e) => setFormVenue(e.target.value)}
                  placeholder="e.g. Taj Lakefront Convention Center, Bhopal"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-xs"
                >
                  Schedule Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT COHORT MODAL */}
      {showEditModal && editingCohort && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-2xs">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-indigo-600" />
                <span>Edit Training Session</span>
              </h3>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Session Title</label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-semibold"
                  >
                    <option value="Upcoming">Upcoming</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    value={formCity}
                    onChange={(e) => setFormCity(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Capacity</label>
                  <input
                    type="number"
                    value={formCapacity}
                    onChange={(e) => setFormCapacity(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Trainer Name</label>
                <input
                  type="text"
                  value={formTrainer}
                  onChange={(e) => setFormTrainer(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Venue</label>
                <input
                  type="text"
                  value={formVenue}
                  onChange={(e) => setFormVenue(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-xs"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {cohortToDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-2xs">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Delete Training Session</h3>
                <p className="text-xs text-slate-500">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-slate-700">
              Are you sure you want to delete <strong className="text-slate-900 font-semibold">"{cohortToDelete.title}"</strong>? 
              This will remove all ({cohortToDelete.attendees.length}) attendee enrollments from this session.
            </p>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setCohortToDelete(null)}
                className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs"
              >
                Delete Training
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HOSPITAL ASSIGNER MODAL */}
      {showAssignerModal && activeCohort && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-2xs">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-3xl w-full p-6 shadow-xl space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-indigo-600" />
                  <span>Assign Hospitals to "{activeCohort.title}"</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Select hospitals from your tracker to enroll into this cohort ({activeCohort.enrolledHospitalIds.length}/{activeCohort.capacity} filled)
                </p>
              </div>
              <button
                onClick={() => setShowAssignerModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            {/* Assigner filter controls */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <input
                type="text"
                value={assignerSearch}
                onChange={(e) => setAssignerSearch(e.target.value)}
                placeholder="Search organization or contact..."
                className="p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
              />
              <select
                value={assignerStatus}
                onChange={(e) => setAssignerStatus(e.target.value)}
                className="p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
              >
                <option value="ALL">All Call Statuses</option>
                <option value="Hot">Hot</option>
                <option value="Warm">Warm</option>
                <option value="Application in progress">Application in progress</option>
                <option value="Engaged">Engaged</option>
              </select>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={selectAllCandidates}
                  className="flex-1 p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium"
                >
                  Select All
                </button>
                {selectedForEnrollment.length > 0 && (
                  <button
                    type="button"
                    onClick={clearSelection}
                    className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Candidate List Checkboxes */}
            <div className="max-h-72 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100 text-xs">
              {candidateHospitals.length === 0 ? (
                <div className="p-6 text-center text-slate-400">
                  No eligible candidate hospitals found matching these filters.
                </div>
              ) : (
                candidateHospitals.map((hospital) => {
                  const isChecked = selectedForEnrollment.includes(hospital.id);
                  const fullName = [hospital.firstName, hospital.lastName].filter(Boolean).join(' ') || '—';

                  return (
                    <label
                      key={hospital.id}
                      className={`flex items-center justify-between p-3 cursor-pointer hover:bg-indigo-50/40 transition-colors ${
                        isChecked ? 'bg-indigo-50/80 font-medium' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelectHospital(hospital.id)}
                          className="mt-1 w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
                        />
                        <div>
                          <div className="font-semibold text-slate-900">{hospital.organisation}</div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                            <span>📍 {hospital.city || 'Bhopal'}</span>
                            <span>• Contact: {fullName}</span>
                            <span className="font-mono">({hospital.mobile})</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${getCategoryBadgeClass(hospital.accreditationCategory)}`}>
                          {hospital.accreditationCategory}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${getStatusBadgeClass(hospital.callStatus)}`}>
                          {hospital.callStatus}
                        </span>
                      </div>
                    </label>
                  );
                })
              )}
            </div>

            {/* Modal footer */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <span className="text-xs text-slate-600 font-medium">
                Selected: <strong className="text-indigo-700 font-bold">{selectedForEnrollment.length}</strong> hospitals
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowAssignerModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  disabled={selectedForEnrollment.length === 0}
                  onClick={handleConfirmEnrollment}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold shadow-xs transition-colors"
                >
                  Enroll {selectedForEnrollment.length} Hospitals
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
