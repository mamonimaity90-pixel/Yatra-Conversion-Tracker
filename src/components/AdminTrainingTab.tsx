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
  AlertCircle,
  Phone,
  MessageCircle,
  X,
  UserPlus
} from 'lucide-react';
import { TrainingCohort, Hospital, CallStatus, CohortAttendee, StateLocation, YatraEvent } from '../types';
import { 
  formatDate, 
  getStatusBadgeClass, 
  getCategoryBadgeClass, 
  getWhatsAppLink 
} from '../utils/helpers';

export interface AdminTrainingTabProps {
  cohorts: TrainingCohort[];
  hospitals: Hospital[];
  states: StateLocation[];
  yatras: YatraEvent[];
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
  onCreateYatra: (newYatra: Omit<YatraEvent, 'id'>) => void;
  onEditYatra: (updatedYatra: YatraEvent) => void;
  onDeleteYatra: (yatraId: string) => void;
  onAssignHospitalsToYatra: (yatraId: string, hospitalIds: string[]) => void;
  onRemoveHospitalFromYatra: (yatraId: string, hospitalId: string) => void;
  onAddState: (stateName: string, initialCities?: string[]) => void;
  onDeleteState: (stateId: string) => void;
  onAddCity: (stateId: string, cityName: string) => void;
  onDeleteCity: (stateId: string, cityName: string) => void;
  onSelectHospital: (hospital: Hospital) => void;
}

export const AdminTrainingTab: React.FC<AdminTrainingTabProps> = ({
  cohorts,
  hospitals,
  states,
  yatras,
  onCreateCohort,
  onEditCohort,
  onDeleteCohort,
  onEnrollHospitals,
  onUpdateAttendeeStatus,
  onCreateYatra,
  onEditYatra,
  onDeleteYatra,
  onAssignHospitalsToYatra,
  onRemoveHospitalFromYatra,
  onAddState,
  onDeleteState,
  onAddCity,
  onDeleteCity,
  onSelectHospital,
}) => {
  const [adminSection, setAdminSection] = useState<'yatras' | 'trainings' | 'locations'>('yatras');
  
  // Cohort state
  const [selectedCohortId, setSelectedCohortId] = useState<string>(cohorts[0]?.id || '');
  const [showCreateCohortModal, setShowCreateCohortModal] = useState(false);
  const [showEditCohortModal, setShowEditCohortModal] = useState(false);
  const [editingCohort, setEditingCohort] = useState<TrainingCohort | null>(null);
  const [showAssignerCohortModal, setShowAssignerCohortModal] = useState(false);
  const [cohortToDelete, setCohortToDelete] = useState<TrainingCohort | null>(null);

  // Cohort Form State
  const [cohortFormTitle, setCohortFormTitle] = useState('');
  const [cohortFormCategory, setCohortFormCategory] = useState('Certified & Entry Level Hospitals');
  const [cohortFormDate, setCohortFormDate] = useState('');
  const [cohortFormTime, setCohortFormTime] = useState('10:00 AM - 01:30 PM');
  const [cohortFormState, setCohortFormState] = useState('Madhya Pradesh');
  const [cohortFormCity, setCohortFormCity] = useState('Bhopal');
  const [cohortFormVenue, setCohortFormVenue] = useState('');
  const [cohortFormMode, setCohortFormMode] = useState<'In-Person' | 'Hybrid' | 'Virtual'>('In-Person');
  const [cohortFormCapacity, setCohortFormCapacity] = useState<number>(35);
  const [cohortFormTrainer, setCohortFormTrainer] = useState('');
  const [cohortFormStatus, setCohortFormStatus] = useState<'Upcoming' | 'In Progress' | 'Completed' | 'Cancelled'>('Upcoming');

  // Cohort Candidate Enrollment Filters
  const [assignerCategory, setAssignerCategory] = useState('ALL');
  const [assignerStatus, setAssignerStatus] = useState('ALL');
  const [assignerSearch, setAssignerSearch] = useState('');
  const [selectedForCohortEnrollment, setSelectedForCohortEnrollment] = useState<string[]>([]);

  // ==================== YATRA STATE ====================
  const [selectedYatraId, setSelectedYatraId] = useState<string>(yatras[0]?.id || '');
  const [showCreateYatraModal, setShowCreateYatraModal] = useState(false);
  const [showEditYatraModal, setShowEditYatraModal] = useState(false);
  const [editingYatra, setEditingYatra] = useState<YatraEvent | null>(null);
  const [showYatraHospitalMapperModal, setShowYatraHospitalMapperModal] = useState(false);
  const [yatraToDelete, setYatraToDelete] = useState<YatraEvent | null>(null);

  // Yatra Form State
  const [yatraFormDate, setYatraFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [yatraFormCity, setYatraFormCity] = useState('Bhopal');
  const [yatraFormState, setYatraFormState] = useState('Madhya Pradesh');
  const [yatraFormTitle, setYatraFormTitle] = useState('');
  const [yatraFormVenue, setYatraFormVenue] = useState('');

  // Yatra Hospital Multi-Mapping Filters
  const [yatraMapperSearch, setYatraMapperSearch] = useState('');
  const [yatraMapperStatus, setYatraMapperStatus] = useState('ALL');
  const [yatraMapperCategory, setYatraMapperCategory] = useState('ALL');
  const [yatraMapperCity, setYatraMapperCity] = useState('ALL');
  const [selectedHospitalsForYatra, setSelectedHospitalsForYatra] = useState<string[]>([]);
  const [mappedHospitalSearch, setMappedHospitalSearch] = useState('');

  // ==================== STATES & CITIES STATE ====================
  const [newStateName, setNewStateName] = useState('');
  const [selectedStateForCity, setSelectedStateForCity] = useState<string>(states[0]?.id || '');
  const [newCityName, setNewCityName] = useState('');

  // Active Cohort & Active Yatra objects
  const activeCohort = cohorts.find((c) => c.id === selectedCohortId) || cohorts[0];
  const activeYatra = yatras.find((y) => y.id === selectedYatraId) || yatras[0];

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

  // ==================== YATRA HANDLERS ====================
  const handleOpenCreateYatra = () => {
    const defaultCity = states[0]?.cities[0] || 'Bhopal';
    const defaultState = states[0]?.name || 'Madhya Pradesh';
    const today = new Date().toISOString().split('T')[0];
    
    setYatraFormDate(today);
    setYatraFormCity(defaultCity);
    setYatraFormState(defaultState);
    setYatraFormTitle(`Aarogya Yatra ${defaultCity} Healthcare Summit`);
    setYatraFormVenue(`${defaultCity} Quality Hall & Medical Chamber`);
    setShowCreateYatraModal(true);
  };

  const handleOpenEditYatra = (yatra: YatraEvent, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingYatra(yatra);
    setYatraFormDate(yatra.date);
    setYatraFormCity(yatra.city);
    setYatraFormState(yatra.state || 'Madhya Pradesh');
    setYatraFormTitle(yatra.title);
    setYatraFormVenue(yatra.venue || '');
    setShowEditYatraModal(true);
  };

  const handleCreateYatraSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!yatraFormCity.trim() || !yatraFormDate) return;

    const title = yatraFormTitle.trim() || `Aarogya Yatra ${yatraFormCity.trim()} Summit`;
    const venue = yatraFormVenue.trim() || `${yatraFormCity.trim()} Medical Centre`;

    onCreateYatra({
      title,
      city: yatraFormCity.trim(),
      state: yatraFormState,
      date: yatraFormDate,
      venue,
      hospitalIds: []
    });

    setShowCreateYatraModal(false);
  };

  const handleEditYatraSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingYatra || !yatraFormCity.trim() || !yatraFormDate) return;

    onEditYatra({
      ...editingYatra,
      title: yatraFormTitle.trim() || editingYatra.title,
      city: yatraFormCity.trim(),
      state: yatraFormState,
      date: yatraFormDate,
      venue: yatraFormVenue.trim() || editingYatra.venue,
    });

    setShowEditYatraModal(false);
    setEditingYatra(null);
  };

  const handleDeleteYatraConfirm = () => {
    if (!yatraToDelete) return;
    onDeleteYatra(yatraToDelete.id);
    if (selectedYatraId === yatraToDelete.id) {
      const remaining = yatras.filter((y) => y.id !== yatraToDelete.id);
      setSelectedYatraId(remaining[0]?.id || '');
    }
    setYatraToDelete(null);
  };

  const handleOpenYatraMapperModal = () => {
    setSelectedHospitalsForYatra([]);
    setYatraMapperSearch('');
    setYatraMapperStatus('ALL');
    setYatraMapperCategory('ALL');
    setYatraMapperCity('ALL');
    setShowYatraHospitalMapperModal(true);
  };

  const handleConfirmYatraHospitalMapping = () => {
    if (!activeYatra || selectedHospitalsForYatra.length === 0) return;
    onAssignHospitalsToYatra(activeYatra.id, selectedHospitalsForYatra);
    setSelectedHospitalsForYatra([]);
    setShowYatraHospitalMapperModal(false);
  };

  // Filter candidates for Yatra Mapper
  const candidateHospitalsForYatra = hospitals.filter((h) => {
    const isAlreadyMapped = activeYatra?.hospitalIds?.includes(h.id);
    if (isAlreadyMapped) return false;

    if (yatraMapperStatus !== 'ALL' && h.callStatus !== yatraMapperStatus) return false;
    if (yatraMapperCategory !== 'ALL' && h.accreditationCategory !== yatraMapperCategory) return false;
    if (yatraMapperCity !== 'ALL' && h.city !== yatraMapperCity) return false;

    if (yatraMapperSearch.trim()) {
      const q = yatraMapperSearch.toLowerCase().trim();
      const matchName = (h.organisation || '').toLowerCase().includes(q);
      const matchFirst = (h.firstName || '').toLowerCase().includes(q);
      const matchLast = (h.lastName || '').toLowerCase().includes(q);
      const matchMobile = (h.mobile || '').includes(q);
      const matchCity = (h.city || '').toLowerCase().includes(q);
      if (!matchName && !matchFirst && !matchLast && !matchMobile && !matchCity) return false;
    }
    return true;
  });

  const toggleSelectHospitalForYatra = (id: string) => {
    if (selectedHospitalsForYatra.includes(id)) {
      setSelectedHospitalsForYatra(selectedHospitalsForYatra.filter((hId) => hId !== id));
    } else {
      setSelectedHospitalsForYatra([...selectedHospitalsForYatra, id]);
    }
  };

  const selectAllYatraCandidates = () => {
    const ids = candidateHospitalsForYatra.map((h) => h.id);
    setSelectedHospitalsForYatra(ids);
  };

  const clearYatraCandidatesSelection = () => {
    setSelectedHospitalsForYatra([]);
  };

  // Mapped hospitals under current active Yatra
  const mappedHospitals = hospitals.filter((h) => activeYatra?.hospitalIds?.includes(h.id));
  const filteredMappedHospitals = mappedHospitals.filter((h) => {
    if (!mappedHospitalSearch.trim()) return true;
    const q = mappedHospitalSearch.toLowerCase().trim();
    return (
      (h.organisation || '').toLowerCase().includes(q) ||
      (h.firstName || '').toLowerCase().includes(q) ||
      (h.lastName || '').toLowerCase().includes(q) ||
      (h.mobile || '').includes(q) ||
      (h.callStatus || '').toLowerCase().includes(q)
    );
  });

  // ==================== COHORT HANDLERS ====================
  const handleOpenCreateCohort = () => {
    setCohortFormTitle('');
    setCohortFormCategory('Certified & Entry Level Hospitals');
    setCohortFormDate(new Date().toISOString().split('T')[0]);
    setCohortFormTime('10:00 AM - 02:00 PM');
    setCohortFormState(states[0]?.name || 'Madhya Pradesh');
    setCohortFormCity(states[0]?.cities[0] || 'Bhopal');
    setCohortFormVenue('');
    setCohortFormMode('In-Person');
    setCohortFormCapacity(35);
    setCohortFormTrainer('');
    setCohortFormStatus('Upcoming');
    setShowCreateCohortModal(true);
  };

  const handleOpenEditCohort = (cohort: TrainingCohort, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingCohort(cohort);
    setCohortFormTitle(cohort.title);
    setCohortFormCategory(cohort.targetCategory);
    setCohortFormDate(cohort.date);
    setCohortFormTime(cohort.time);
    setCohortFormState(cohort.state || 'Madhya Pradesh');
    setCohortFormCity(cohort.city);
    setCohortFormVenue(cohort.venue);
    setCohortFormMode(cohort.mode);
    setCohortFormCapacity(cohort.capacity);
    setCohortFormTrainer(cohort.trainerName);
    setCohortFormStatus(cohort.status);
    setShowEditCohortModal(true);
  };

  const handleCreateCohortSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cohortFormTitle.trim() || !cohortFormDate) return;

    onCreateCohort({
      title: cohortFormTitle.trim(),
      targetCategory: cohortFormCategory,
      date: cohortFormDate,
      time: cohortFormTime,
      state: cohortFormState,
      city: cohortFormCity || 'Bhopal',
      venue: cohortFormVenue.trim() || `${cohortFormCity} Quality Hall & Medical Chambers`,
      mode: cohortFormMode,
      capacity: Number(cohortFormCapacity) || 30,
      trainerName: cohortFormTrainer.trim() || 'Dr. Amitabh Sen (Lead Assessor)',
      status: cohortFormStatus
    });

    setShowCreateCohortModal(false);
  };

  const handleEditCohortSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCohort || !cohortFormTitle.trim()) return;

    onEditCohort({
      ...editingCohort,
      title: cohortFormTitle.trim(),
      targetCategory: cohortFormCategory,
      date: cohortFormDate,
      time: cohortFormTime,
      state: cohortFormState,
      city: cohortFormCity,
      venue: cohortFormVenue.trim() || editingCohort.venue,
      mode: cohortFormMode,
      capacity: Number(cohortFormCapacity) || editingCohort.capacity,
      trainerName: cohortFormTrainer.trim() || editingCohort.trainerName,
      status: cohortFormStatus
    });

    setShowEditCohortModal(false);
    setEditingCohort(null);
  };

  const handleDeleteCohortConfirm = () => {
    if (!cohortToDelete) return;
    onDeleteCohort(cohortToDelete.id);
    if (selectedCohortId === cohortToDelete.id) {
      const remaining = cohorts.filter((c) => c.id !== cohortToDelete.id);
      setSelectedCohortId(remaining[0]?.id || '');
    }
    setCohortToDelete(null);
  };

  const handleConfirmCohortEnrollment = () => {
    if (!activeCohort || selectedForCohortEnrollment.length === 0) return;
    onEnrollHospitals(activeCohort.id, selectedForCohortEnrollment);
    setSelectedForCohortEnrollment([]);
    setShowAssignerCohortModal(false);
  };

  const candidateHospitalsForCohort = hospitals.filter((h) => {
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

  const toggleSelectHospitalForCohort = (id: string) => {
    if (selectedForCohortEnrollment.includes(id)) {
      setSelectedForCohortEnrollment(selectedForCohortEnrollment.filter((hId) => hId !== id));
    } else {
      setSelectedForCohortEnrollment([...selectedForCohortEnrollment, id]);
    }
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

  // All available cities list for selects
  const allCities = Array.from(new Set(states.flatMap((s) => s.cities)));

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Section Navigation */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold mb-2 border border-indigo-100">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Operations & Administration Control Center</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Yatra Summits, Training Masterclasses & Geography Hubs
            </h2>
            <p className="text-xs text-slate-500 max-w-2xl mt-0.5">
              Add and manage Yatra events, map multiple hospitals to Yatras, coordinate training cohorts, and configure operating states and cities.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {adminSection === 'yatras' && (
              <button
                id="btn-open-create-yatra"
                onClick={handleOpenCreateYatra}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-xs transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add Yatra Event</span>
              </button>
            )}

            {adminSection === 'trainings' && (
              <button
                id="btn-open-create-cohort"
                onClick={handleOpenCreateCohort}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>+ New Training Session</span>
              </button>
            )}
          </div>
        </div>

        {/* Section Tabs */}
        <div className="flex items-center gap-2 mt-5 pt-4 border-t border-slate-100">
          <button
            onClick={() => setAdminSection('yatras')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              adminSection === 'yatras'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Yatra Events & Hospital Mappings ({yatras.length})</span>
          </button>

          <button
            onClick={() => setAdminSection('trainings')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
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
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              adminSection === 'locations'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>States & Cities ({states.length} States)</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: YATRA MANAGEMENT & HOSPITAL MAPPING (Primary User Request) */}
      {/* ========================================================================= */}
      {adminSection === 'yatras' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          
          {/* Left: Yatra Events List (4 cols) */}
          <div className="lg:col-span-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Yatra Events ({yatras.length})</span>
              </h3>
              <button
                onClick={handleOpenCreateYatra}
                className="text-[11px] font-bold text-amber-700 hover:underline flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                <span>Add Event</span>
              </button>
            </div>

            {yatras.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-slate-400 text-xs">
                No Yatra events configured. Click "+ Add Yatra Event" to record a city summit.
              </div>
            ) : (
              <div className="space-y-2.5">
                {yatras.map((yatra) => {
                  const isSelected = yatra.id === activeYatra?.id;
                  const mappedCount = yatra.hospitalIds?.length || 0;

                  return (
                    <div
                      key={yatra.id}
                      onClick={() => setSelectedYatraId(yatra.id)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer relative group ${
                        isSelected
                          ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                          : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full ${
                              isSelected
                                ? 'bg-amber-500 text-slate-950'
                                : 'bg-amber-50 text-amber-800 border border-amber-200'
                            }`}>
                              📍 {yatra.city}
                            </span>
                            <span className={`text-[11px] font-mono ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                              📅 {formatDate(yatra.date)}
                            </span>
                          </div>

                          <h4 className="text-xs font-bold mt-1 line-clamp-1">
                            {yatra.title}
                          </h4>
                        </div>
                        
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={(e) => handleOpenEditYatra(yatra, e)}
                            title="Edit Yatra Event"
                            className={`p-1 rounded hover:bg-white/20 transition-colors ${
                              isSelected ? 'text-slate-300 hover:text-white' : 'text-slate-400 hover:text-slate-700'
                            }`}
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setYatraToDelete(yatra);
                            }}
                            title="Delete Yatra Event"
                            className="p-1 rounded hover:bg-rose-500/20 text-rose-400 hover:text-rose-600 transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {yatra.venue && (
                        <p className={`text-[11px] mt-1.5 line-clamp-1 ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                          🏢 {yatra.venue}
                        </p>
                      )}

                      <div className={`mt-2.5 pt-2 border-t flex items-center justify-between text-[11px] ${
                        isSelected ? 'border-slate-800 text-slate-400' : 'border-slate-100 text-slate-500'
                      }`}>
                        <span>Mapped Hospitals:</span>
                        <strong className={`font-bold ${isSelected ? 'text-amber-400' : 'text-indigo-700'}`}>
                          {mappedCount} Hospitals
                        </strong>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right: Active Yatra Details & Mapped Hospitals (8 cols) */}
          {activeYatra ? (
            <div className="lg:col-span-8 space-y-4">
              
              {/* Yatra Overview Card */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider bg-amber-100 px-2 py-0.5 rounded border border-amber-200 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-600" />
                        <span>Aarogya Yatra Summit</span>
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                        📍 {activeYatra.city}, {activeYatra.state || 'Madhya Pradesh'}
                      </span>
                      <span className="text-[10px] font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                        📅 {formatDate(activeYatra.date)}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900">
                      {activeYatra.title}
                    </h3>
                    <div className="text-xs text-slate-500 mt-1">
                      <span>Venue: <strong>{activeYatra.venue || `${activeYatra.city} Medical Chamber`}</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleOpenEditYatra(activeYatra)}
                      className="flex items-center gap-1 px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => setYatraToDelete(activeYatra)}
                      className="flex items-center gap-1 px-3 py-2 rounded-lg border border-rose-200 hover:bg-rose-50 text-rose-600 text-xs font-semibold transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                    <button
                      id="btn-open-yatra-mapper-modal"
                      onClick={handleOpenYatraMapperModal}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs transition-colors"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>+ Map Multiple Hospitals</span>
                    </button>
                  </div>
                </div>

                {/* Quick stats banner */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-500 uppercase block font-medium">Mapped Hospitals</span>
                    <strong className="text-base font-bold text-slate-900">{mappedHospitals.length}</strong>
                  </div>
                  <div className="p-2.5 rounded-lg bg-orange-50/70 border border-orange-100">
                    <span className="text-[10px] text-orange-700 uppercase block font-medium">Hot Leads</span>
                    <strong className="text-base font-bold text-orange-800">
                      {mappedHospitals.filter((h) => h.callStatus === 'Hot').length}
                    </strong>
                  </div>
                  <div className="p-2.5 rounded-lg bg-blue-50/70 border border-blue-100">
                    <span className="text-[10px] text-blue-700 uppercase block font-medium">Application in Progress</span>
                    <strong className="text-base font-bold text-blue-800">
                      {mappedHospitals.filter((h) => h.callStatus === 'Application in progress').length}
                    </strong>
                  </div>
                  <div className="p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-100">
                    <span className="text-[10px] text-emerald-700 uppercase block font-medium">Converted (Won)</span>
                    <strong className="text-base font-bold text-emerald-800">
                      {mappedHospitals.filter((h) => h.callStatus === 'Won').length}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Mapped Hospitals Table */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <span>Hospitals Mapped to this Yatra ({filteredMappedHospitals.length})</span>
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      These hospitals attended the {activeYatra.city} Yatra on {formatDate(activeYatra.date)}. In the pipeline, their Yatra column displays this city and date.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <input
                        type="text"
                        value={mappedHospitalSearch}
                        onChange={(e) => setMappedHospitalSearch(e.target.value)}
                        placeholder="Filter mapped hospitals..."
                        className="p-1.5 px-2.5 pl-7 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 w-48"
                      />
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2" />
                    </div>

                    <button
                      onClick={handleOpenYatraMapperModal}
                      className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-lg text-xs font-bold transition-colors whitespace-nowrap"
                    >
                      + Add More Hospitals
                    </button>
                  </div>
                </div>

                {filteredMappedHospitals.length === 0 ? (
                  <div className="p-10 text-center text-slate-400 text-xs">
                    <Building2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-semibold text-slate-600">No hospitals mapped to this Yatra yet</p>
                    <p className="text-slate-400 text-[11px] mt-1 max-w-sm mx-auto">
                      Click "+ Map Multiple Hospitals" to add multiple hospitals under this Yatra event at once.
                    </p>
                    <button
                      onClick={handleOpenYatraMapperModal}
                      className="mt-3 px-3.5 py-1.5 bg-amber-600 text-white rounded-lg text-xs font-semibold hover:bg-amber-700 shadow-2xs"
                    >
                      + Map Hospitals Now
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50/80 border-b border-slate-200 text-[10px] uppercase font-bold text-slate-500">
                          <th className="py-2.5 px-4">Hospital Name & City</th>
                          <th className="py-2.5 px-4">Contact Person</th>
                          <th className="py-2.5 px-4">Call Status</th>
                          <th className="py-2.5 px-4">Category</th>
                          <th className="py-2.5 px-4 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs">
                        {filteredMappedHospitals.map((hospital) => {
                          const fullName = [hospital.firstName, hospital.lastName].filter(Boolean).join(' ') || '—';
                          const whatsappUrl = hospital.mobile ? getWhatsAppLink(hospital.mobile, hospital.organisation, fullName) : '';

                          return (
                            <tr key={hospital.id} className="hover:bg-slate-50/80 transition-colors group">
                              <td className="py-3 px-4">
                                <button
                                  onClick={() => onSelectHospital(hospital)}
                                  className="font-semibold text-slate-900 hover:text-blue-600 text-left line-clamp-1"
                                >
                                  {hospital.organisation}
                                </button>
                                <div className="text-[10px] text-slate-400 mt-0.5">
                                  📍 {hospital.city || activeYatra.city}, {hospital.state || 'Madhya Pradesh'}
                                </div>
                              </td>

                              <td className="py-3 px-4">
                                <div className="font-medium text-slate-800">{fullName}</div>
                                {hospital.mobile && (
                                  <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono mt-0.5">
                                    <a href={`tel:${hospital.mobile}`} className="hover:text-blue-600">
                                      {hospital.mobile}
                                    </a>
                                    <a
                                      href={whatsappUrl}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-emerald-600 hover:text-emerald-700"
                                      title="WhatsApp"
                                    >
                                      <MessageCircle className="w-3 h-3 inline" />
                                    </a>
                                  </div>
                                )}
                              </td>

                              <td className="py-3 px-4">
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadgeClass(hospital.callStatus)}`}>
                                  {hospital.callStatus}
                                </span>
                              </td>

                              <td className="py-3 px-4">
                                <span className={`px-2 py-0.5 rounded text-[10px] ${getCategoryBadgeClass(hospital.accreditationCategory)}`}>
                                  {hospital.accreditationCategory}
                                </span>
                              </td>

                              <td className="py-3 px-4 text-right">
                                <button
                                  onClick={() => onRemoveHospitalFromYatra(activeYatra.id, hospital.id)}
                                  className="px-2.5 py-1 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded text-[11px] font-medium transition-colors inline-flex items-center gap-1"
                                  title="Remove from this Yatra"
                                >
                                  <X className="w-3 h-3" />
                                  <span>Unmap</span>
                                </button>
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

      {/* ========================================================================= */}
      {/* SECTION 2: TRAINING COHORTS MANAGEMENT */}
      {/* ========================================================================= */}
      {adminSection === 'trainings' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          
          {/* Left: Cohorts List Sidebar (4 cols) */}
          <div className="lg:col-span-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-indigo-600" />
                <span>All Cohorts ({cohorts.length})</span>
              </h3>
              <button
                onClick={handleOpenCreateCohort}
                className="text-[11px] font-bold text-indigo-700 hover:underline flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                <span>Add Cohort</span>
              </button>
            </div>

            {cohorts.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-slate-400 text-xs">
                No training sessions scheduled. Click "+ New Training Session" to add one.
              </div>
            ) : (
              <div className="space-y-2.5">
                {cohorts.map((cohort) => {
                  const isSelected = cohort.id === activeCohort?.id;

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
                          <button
                            onClick={(e) => handleOpenEditCohort(cohort, e)}
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
                            className="p-1 rounded hover:bg-rose-500/20 text-rose-400 hover:text-rose-600 transition-colors"
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
                      onClick={() => handleOpenEditCohort(activeCohort)}
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
                      id="btn-open-assigner-cohort-modal"
                      onClick={() => setShowAssignerCohortModal(true)}
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
                    <strong className="text-base font-bold text-slate-900">{activeCohort.attendees?.length || 0}</strong>
                  </div>
                  <div className="p-2.5 rounded-lg bg-emerald-50/60 border border-emerald-100">
                    <span className="text-[10px] text-emerald-700 uppercase block font-medium">Attended</span>
                    <strong className="text-base font-bold text-emerald-800">
                      {activeCohort.attendees?.filter((a) => a.attendanceStatus === 'Attended').length || 0}
                    </strong>
                  </div>
                  <div className="p-2.5 rounded-lg bg-indigo-50/60 border border-indigo-100">
                    <span className="text-[10px] text-indigo-700 uppercase block font-medium">Converted (Won)</span>
                    <strong className="text-base font-bold text-indigo-800">
                      {activeCohort.attendees?.filter((a) => a.postTrainingStatus === 'Won').length || 0}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Attendee Roster Table */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Attendee Roster ({activeCohort.attendees?.length || 0} Hospitals)
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Record live attendance and update post-training conversion status to measure training efficacy
                    </p>
                  </div>
                </div>

                {(!activeCohort.attendees || activeCohort.attendees.length === 0) ? (
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

      {/* ========================================================================= */}
      {/* SECTION 3: STATES & CITIES MANAGEMENT */}
      {/* ========================================================================= */}
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

      {/* ========================================================================= */}
      {/* MODAL 1: CREATE / SCHEDULE YATRA EVENT MODAL */}
      {/* ========================================================================= */}
      {showCreateYatraModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-2xs">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <span>Add Yatra Event</span>
              </h3>
              <button onClick={() => setShowCreateYatraModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleCreateYatraSubmit} className="space-y-3.5 text-xs">
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Yatra Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={yatraFormDate}
                    onChange={(e) => setYatraFormDate(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Yatra City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    list="yatra-city-list"
                    value={yatraFormCity}
                    onChange={(e) => {
                      const c = e.target.value;
                      setYatraFormCity(c);
                      setYatraFormTitle(`Aarogya Yatra ${c} Healthcare Summit`);
                      setYatraFormVenue(`${c} Medical Chamber`);
                    }}
                    placeholder="e.g. Bhopal"
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-medium"
                    required
                  />
                  <datalist id="yatra-city-list">
                    {allCities.map((c) => (
                      <option key={c} value={c} />
                    ))}
                  </datalist>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Event Title / Name
                </label>
                <input
                  type="text"
                  value={yatraFormTitle}
                  onChange={(e) => setYatraFormTitle(e.target.value)}
                  placeholder="e.g. Aarogya Yatra Bhopal Healthcare Summit"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Operating State</label>
                  <select
                    value={yatraFormState}
                    onChange={(e) => setYatraFormState(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                  >
                    {states.map((st) => (
                      <option key={st.id} value={st.name}>
                        {st.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Venue / Hall Location</label>
                  <input
                    type="text"
                    value={yatraFormVenue}
                    onChange={(e) => setYatraFormVenue(e.target.value)}
                    placeholder="e.g. IMA Auditorium"
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                  />
                </div>
              </div>

              <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-[11px] text-amber-900 leading-relaxed">
                💡 <strong>Multi-Hospital Mapping:</strong> After saving this Yatra event, you can map multiple hospitals to it with 1 click using the multi-selector.
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateYatraModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold shadow-xs transition-colors"
                >
                  Save Yatra Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: EDIT YATRA EVENT MODAL */}
      {/* ========================================================================= */}
      {showEditYatraModal && editingYatra && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-2xs">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-amber-600" />
                <span>Edit Yatra Event</span>
              </h3>
              <button onClick={() => setShowEditYatraModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleEditYatraSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Yatra Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={yatraFormDate}
                    onChange={(e) => setYatraFormDate(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Yatra City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={yatraFormCity}
                    onChange={(e) => setYatraFormCity(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-medium"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Event Title / Name
                </label>
                <input
                  type="text"
                  value={yatraFormTitle}
                  onChange={(e) => setYatraFormTitle(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">State</label>
                  <select
                    value={yatraFormState}
                    onChange={(e) => setYatraFormState(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                  >
                    {states.map((st) => (
                      <option key={st.id} value={st.name}>
                        {st.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Venue</label>
                  <input
                    type="text"
                    value={yatraFormVenue}
                    onChange={(e) => setYatraFormVenue(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEditYatraModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold shadow-xs transition-colors"
                >
                  Update Yatra
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: MAP MULTIPLE HOSPITALS UNDER ONE YATRA MODAL */}
      {/* ========================================================================= */}
      {showYatraHospitalMapperModal && activeYatra && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-2xs">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-3xl w-full p-6 shadow-xl space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  <span>Map Hospitals to Yatra: {activeYatra.city} ({formatDate(activeYatra.date)})</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Select multiple hospitals that attended this Yatra event. In the conversion pipeline, their Yatra column will reflect this city and date.
                </p>
              </div>
              <button
                onClick={() => setShowYatraHospitalMapperModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            {/* Filter controls */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
              <input
                type="text"
                value={yatraMapperSearch}
                onChange={(e) => setYatraMapperSearch(e.target.value)}
                placeholder="Search hospital or mobile..."
                className="p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
              />
              <select
                value={yatraMapperStatus}
                onChange={(e) => setYatraMapperStatus(e.target.value)}
                className="p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
              >
                <option value="ALL">All Call Statuses</option>
                {callStatuses.map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
              <select
                value={yatraMapperCity}
                onChange={(e) => setYatraMapperCity(e.target.value)}
                className="p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
              >
                <option value="ALL">All Cities</option>
                {allCities.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={selectAllYatraCandidates}
                  className="flex-1 p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold"
                >
                  Select All ({candidateHospitalsForYatra.length})
                </button>
                {selectedHospitalsForYatra.length > 0 && (
                  <button
                    type="button"
                    onClick={clearYatraCandidatesSelection}
                    className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg text-xs"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Hospital Checkboxes List */}
            <div className="max-h-80 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100 text-xs">
              {candidateHospitalsForYatra.length === 0 ? (
                <div className="p-8 text-center text-slate-400">
                  No candidate hospitals found matching these search & filter criteria.
                </div>
              ) : (
                candidateHospitalsForYatra.map((hospital) => {
                  const isChecked = selectedHospitalsForYatra.includes(hospital.id);
                  const fullName = [hospital.firstName, hospital.lastName].filter(Boolean).join(' ') || '—';

                  return (
                    <label
                      key={hospital.id}
                      className={`flex items-center justify-between p-3 cursor-pointer hover:bg-amber-50/50 transition-colors ${
                        isChecked ? 'bg-amber-50/90 font-medium' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelectHospitalForYatra(hospital.id)}
                          className="mt-1 w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500 cursor-pointer"
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
                Selected for Mapping: <strong className="text-amber-800 font-bold">{selectedHospitalsForYatra.length}</strong> hospitals
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowYatraHospitalMapperModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  disabled={selectedHospitalsForYatra.length === 0}
                  onClick={handleConfirmYatraHospitalMapping}
                  className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold shadow-xs transition-colors"
                >
                  Map {selectedHospitalsForYatra.length} Hospital{selectedHospitalsForYatra.length !== 1 ? 's' : ''} to Yatra
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DELETE CONFIRMATION MODALS */}
      {/* ========================================================================= */}
      {yatraToDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-2xs">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
                ⚠️
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Delete Yatra Event?</h3>
                <p className="text-xs text-slate-500">"{yatraToDelete.title}"</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to delete this Yatra event in <strong>{yatraToDelete.city}</strong>? Mapped hospitals will be unlinked from this event.
            </p>
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setYatraToDelete(null)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteYatraConfirm}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shadow-xs"
              >
                Delete Yatra Event
              </button>
            </div>
          </div>
        </div>
      )}

      {cohortToDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-2xs">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
                ⚠️
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Delete Training Session?</h3>
                <p className="text-xs text-slate-500">"{cohortToDelete.title}"</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to delete this training cohort? All attendance records for this session will be removed.
            </p>
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setCohortToDelete(null)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteCohortConfirm}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shadow-xs"
              >
                Delete Training Session
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* COHORT MODALS (Create, Edit, Assigner) */}
      {/* ========================================================================= */}
      {showCreateCohortModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-2xs">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-indigo-600" />
                <span>Schedule New Training Session</span>
              </h3>
              <button onClick={() => setShowCreateCohortModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleCreateCohortSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Session Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={cohortFormTitle}
                  onChange={(e) => setCohortFormTitle(e.target.value)}
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
                    value={cohortFormDate}
                    onChange={(e) => setCohortFormDate(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Time</label>
                  <input
                    type="text"
                    value={cohortFormTime}
                    onChange={(e) => setCohortFormTime(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">State</label>
                  <select
                    value={cohortFormState}
                    onChange={(e) => setCohortFormState(e.target.value)}
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
                    value={cohortFormCity}
                    onChange={(e) => setCohortFormCity(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                  >
                    {allCities.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mode</label>
                  <select
                    value={cohortFormMode}
                    onChange={(e) => setCohortFormMode(e.target.value as any)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                  >
                    <option value="In-Person">In-Person</option>
                    <option value="Virtual">Virtual / Webinar</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Capacity</label>
                  <input
                    type="number"
                    value={cohortFormCapacity}
                    onChange={(e) => setCohortFormCapacity(Number(e.target.value))}
                    min={5}
                    max={200}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    value={cohortFormStatus}
                    onChange={(e) => setCohortFormStatus(e.target.value as any)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                  >
                    <option value="Upcoming">Upcoming</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Trainer / Lead Assessor</label>
                <input
                  type="text"
                  value={cohortFormTrainer}
                  onChange={(e) => setCohortFormTrainer(e.target.value)}
                  placeholder="e.g. Dr. Amitabh Sen (Lead NABH Assessor)"
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateCohortModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow-xs transition-colors"
                >
                  Schedule Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditCohortModal && editingCohort && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-2xs">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-indigo-600" />
                <span>Edit Training Session</span>
              </h3>
              <button onClick={() => setShowEditCohortModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleEditCohortSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Session Title</label>
                <input
                  type="text"
                  value={cohortFormTitle}
                  onChange={(e) => setCohortFormTitle(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={cohortFormDate}
                    onChange={(e) => setCohortFormDate(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    value={cohortFormStatus}
                    onChange={(e) => setCohortFormStatus(e.target.value as any)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                  >
                    <option value="Upcoming">Upcoming</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEditCohortModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold shadow-xs transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* COHORT ASSIGNER MODAL */}
      {showAssignerCohortModal && activeCohort && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-2xs">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-3xl w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-indigo-600" />
                  <span>Assign Hospitals to "{activeCohort.title}"</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Select hospitals from your pipeline to enroll into this cohort ({activeCohort.enrolledHospitalIds.length}/{activeCohort.capacity} filled)
                </p>
              </div>
              <button
                onClick={() => setShowAssignerCohortModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <input
                type="text"
                value={assignerSearch}
                onChange={(e) => setAssignerSearch(e.target.value)}
                placeholder="Search hospital or contact..."
                className="p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
              />
              <select
                value={assignerStatus}
                onChange={(e) => setAssignerStatus(e.target.value)}
                className="p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
              >
                <option value="ALL">All Call Statuses</option>
                {callStatuses.map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setSelectedForCohortEnrollment(candidateHospitalsForCohort.map((h) => h.id))}
                className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold"
              >
                Select All Candidates ({candidateHospitalsForCohort.length})
              </button>
            </div>

            <div className="max-h-72 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100 text-xs">
              {candidateHospitalsForCohort.length === 0 ? (
                <div className="p-6 text-center text-slate-400">
                  No eligible candidate hospitals found matching these filters.
                </div>
              ) : (
                candidateHospitalsForCohort.map((hospital) => {
                  const isChecked = selectedForCohortEnrollment.includes(hospital.id);
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
                          onChange={() => toggleSelectHospitalForCohort(hospital.id)}
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

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <span className="text-xs text-slate-600 font-medium">
                Selected: <strong className="text-indigo-700 font-bold">{selectedForCohortEnrollment.length}</strong> hospitals
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowAssignerCohortModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  disabled={selectedForCohortEnrollment.length === 0}
                  onClick={handleConfirmCohortEnrollment}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold shadow-xs transition-colors"
                >
                  Enroll {selectedForCohortEnrollment.length} Hospitals
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
