import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { KpiCards } from './components/KpiCards';
import { FilterBar } from './components/FilterBar';
import { HospitalTable } from './components/HospitalTable';
import { KanbanBoard } from './components/KanbanBoard';
import { HospitalDetailDrawer } from './components/HospitalDetailDrawer';
import { AddHospitalModal } from './components/AddHospitalModal';
import { BulkUploadModal } from './components/BulkUploadModal';
import { EditHospitalModal } from './components/EditHospitalModal';
import { AdminTrainingTab } from './components/AdminTrainingTab';
import { AnalyticsTab } from './components/AnalyticsTab';
import { Toast, ToastMessage } from './components/Toast';
import { INITIAL_HOSPITALS, INITIAL_COHORTS, INITIAL_STATES, INITIAL_YATRAS } from './data/initialHospitals';
import { Hospital, TrainingCohort, CallStatus, SATStatus, InteractionRemark, StateLocation, CohortAttendee, YatraEvent } from './types';

const HOSPITALS_STORAGE_KEY = 'yatra_conversion_hospitals_v4';
const COHORTS_STORAGE_KEY = 'yatra_conversion_cohorts_v4';
const STATES_STORAGE_KEY = 'yatra_conversion_states_v4';
const YATRAS_STORAGE_KEY = 'yatra_conversion_events_v4';

export default function App() {
  // Navigation & View state - Default to 'analytics' (Insights & Reports) on the first tab
  const [activeTab, setActiveTab] = useState<'analytics' | 'dashboard' | 'admin'>('analytics');
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');
  const [selectedCity, setSelectedCity] = useState<string>('All Cities');
  
  // Real-time synchronization state
  const [isSyncConnected, setIsSyncConnected] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('');
  const [isManualSyncing, setIsManualSyncing] = useState<boolean>(false);
  const serverVersionRef = useRef<number>(0);
  const isInternalUpdatingRef = useRef<boolean>(false);

  // Data state with instant localStorage cache fallback
  const [hospitals, setHospitals] = useState<Hospital[]>(() => {
    try {
      const cached = localStorage.getItem(HOSPITALS_STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {}
    return INITIAL_HOSPITALS;
  });
  const [cohorts, setCohorts] = useState<TrainingCohort[]>(() => {
    try {
      const cached = localStorage.getItem(COHORTS_STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return INITIAL_COHORTS;
  });
  const [states, setStates] = useState<StateLocation[]>(() => {
    try {
      const cached = localStorage.getItem(STATES_STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return INITIAL_STATES;
  });
  const [yatras, setYatras] = useState<YatraEvent[]>(() => {
    try {
      const cached = localStorage.getItem(YATRAS_STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return INITIAL_YATRAS;
  });

  // Helper to safely apply incoming server data
  const applyServerData = (data: any, force = false) => {
    if (!data) return;
    const incomingVersion = typeof data.version === 'number' ? data.version : 0;
    
    // Check if newer or force or initial zero version
    if (force || incomingVersion >= serverVersionRef.current || serverVersionRef.current === 0) {
      if (incomingVersion > 0) {
        serverVersionRef.current = incomingVersion;
      }

      const hosp = data.hospitals || data.data?.hospitals;
      const coh = data.cohorts || data.data?.cohorts;
      const st = data.states || data.data?.states;
      const yat = data.yatras || data.data?.yatras;

      if (Array.isArray(hosp)) {
        setHospitals(hosp);
        try { localStorage.setItem(HOSPITALS_STORAGE_KEY, JSON.stringify(hosp)); } catch {}
      }
      if (Array.isArray(coh)) {
        setCohorts(coh);
        try { localStorage.setItem(COHORTS_STORAGE_KEY, JSON.stringify(coh)); } catch {}
      }
      if (Array.isArray(st)) {
        setStates(st);
        try { localStorage.setItem(STATES_STORAGE_KEY, JSON.stringify(st)); } catch {}
      }
      if (Array.isArray(yat)) {
        setYatras(yat);
        try { localStorage.setItem(YATRAS_STORAGE_KEY, JSON.stringify(yat)); } catch {}
      }

      setIsSyncConnected(true);
      setLastSyncTime(new Date().toLocaleTimeString());
    }
  };

  // Fetch full data directly from server
  const fetchFromServer = async (force = false) => {
    try {
      const res = await fetch('/api/tracker');
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Non-JSON response from server (possible auth redirect)');
      }
      const data = await res.json();
      applyServerData(data, force);
      return true;
    } catch (err) {
      console.warn('Sync fetch error:', err);
      setIsSyncConnected(false);
      return false;
    }
  };

  // Manual on-demand sync
  const handleManualSync = async () => {
    setIsManualSyncing(true);
    const success = await fetchFromServer(true);
    setIsManualSyncing(false);
    if (success) {
      addToast('success', 'Synchronized', 'Fetched latest real-time updates from server.');
    } else {
      addToast('error', 'Sync Failed', 'Could not reach server. Check network connection.');
    }
  };

  // Initial load + Server-Sent Events (SSE) + 2.5s Background Polling Loop
  useEffect(() => {
    // 1. Initial immediate pull
    fetchFromServer(true);

    // 2. Continuous real-time SSE listener
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource('/api/tracker/stream');

      eventSource.onopen = () => {
        setIsSyncConnected(true);
      };

      const handleIncomingMessage = (event: MessageEvent) => {
        try {
          const payload = JSON.parse(event.data);
          applyServerData(payload);
        } catch (e) {
          console.error('Error parsing SSE sync message:', e);
        }
      };

      eventSource.addEventListener('sync', handleIncomingMessage);
      eventSource.addEventListener('init', handleIncomingMessage);

      eventSource.onerror = () => {
        setIsSyncConnected(false);
      };
    } catch (e) {
      console.warn('SSE not available, relying on polling:', e);
    }

    // 3. Fallback background polling (runs every 2.5 seconds to guarantee multi-user sync)
    const pollInterval = setInterval(async () => {
      try {
        const vRes = await fetch('/api/tracker/version');
        if (vRes.ok) {
          const vData = await vRes.json();
          if (vData.version > serverVersionRef.current) {
            // Version changed on server by another user, pull full data
            await fetchFromServer(true);
          } else {
            setIsSyncConnected(true);
          }
        }
      } catch {
        // network issue
      }
    }, 2500);

    return () => {
      if (eventSource) {
        eventSource.close();
      }
      clearInterval(pollInterval);
    };
  }, []);

  // Helper to persist full state to backend and trigger broadcast to all other users
  const syncFullStateToServer = async (
    newHospitals: Hospital[],
    newCohorts: TrainingCohort[],
    newStates: StateLocation[],
    newYatras: YatraEvent[]
  ) => {
    // Also save in localStorage as backup
    try {
      localStorage.setItem(HOSPITALS_STORAGE_KEY, JSON.stringify(newHospitals));
      localStorage.setItem(COHORTS_STORAGE_KEY, JSON.stringify(newCohorts));
      localStorage.setItem(STATES_STORAGE_KEY, JSON.stringify(newStates));
      localStorage.setItem(YATRAS_STORAGE_KEY, JSON.stringify(newYatras));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }

    try {
      const res = await fetch('/api/tracker/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hospitals: newHospitals,
          cohorts: newCohorts,
          states: newStates,
          yatras: newYatras
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.version) {
          serverVersionRef.current = data.version;
        }
      }
      setLastSyncTime(new Date().toLocaleTimeString());
    } catch (err) {
      console.error('Failed to sync state to server:', err);
    }
  };

  // Modals & Selection state
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingHospital, setEditingHospital] = useState<Hospital | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedSat, setSelectedSat] = useState('ALL');
  const [selectedUrgency, setSelectedUrgency] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const addToast = (type: 'success' | 'error' | 'info', title: string, message?: string) => {
    const newToast: ToastMessage = {
      id: `toast-${Date.now()}-${Math.random()}`,
      type,
      title,
      message
    };
    setToasts((prev) => [...prev, newToast]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Reset Filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedStatus('ALL');
    setSelectedSat('ALL');
    setSelectedUrgency('ALL');
    setSelectedCategory('ALL');
    setSelectedCity('All Cities');
  };

  // Reset to default dataset (Syncs across all users)
  const handleResetAllData = async () => {
    if (window.confirm('Reset all hospital pipeline records to initial default dataset for all users?')) {
      setHospitals(INITIAL_HOSPITALS);
      setCohorts(INITIAL_COHORTS);
      setStates(INITIAL_STATES);
      setYatras(INITIAL_YATRAS);
      localStorage.removeItem(HOSPITALS_STORAGE_KEY);
      localStorage.removeItem(COHORTS_STORAGE_KEY);
      localStorage.removeItem(STATES_STORAGE_KEY);
      localStorage.removeItem(YATRAS_STORAGE_KEY);

      try {
        await fetch('/api/tracker/reset', { method: 'POST' });
      } catch (err) {
        console.error('Reset error:', err);
      }

      addToast('info', 'Data Reset', 'Restored initial dataset across all devices.');
    }
  };

  // Filtered Hospital List
  const filteredHospitals = useMemo(() => {
    return hospitals.filter((h) => {
      // City filter
      if (selectedCity !== 'All Cities') {
        if (h.city !== selectedCity) {
          return false;
        }
      }
      // Status filter
      if (selectedStatus !== 'ALL' && h.callStatus !== selectedStatus) {
        return false;
      }
      // SAT Status filter
      if (selectedSat !== 'ALL') {
        const hospitalSat = h.satStatus || 'SAT not filled';
        if (hospitalSat !== selectedSat) {
          return false;
        }
      }
      // Urgency filter
      if (selectedUrgency !== 'ALL' && h.renewalUrgency !== selectedUrgency) {
        return false;
      }
      // Category filter
      if (selectedCategory !== 'ALL' && h.accreditationCategory !== selectedCategory) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchName = (h.organisation || '').toLowerCase().includes(query);
        const matchFirst = (h.firstName || '').toLowerCase().includes(query);
        const matchLast = (h.lastName || '').toLowerCase().includes(query);
        const matchMobile = (h.mobile || '').includes(query);
        const matchCity = (h.city || '').toLowerCase().includes(query);
        const matchState = (h.state || '').toLowerCase().includes(query);
        const matchRemarksText = (h.remarksText || '').toLowerCase().includes(query);
        const matchRemark = h.remarks?.some((r) => r.remark.toLowerCase().includes(query));
        const matchSat = (h.satStatus || '').toLowerCase().includes(query);

        if (!matchName && !matchFirst && !matchLast && !matchMobile && !matchCity && !matchState && !matchRemarksText && !matchRemark && !matchSat) {
          return false;
        }
      }
      return true;
    });
  }, [hospitals, selectedCity, selectedStatus, selectedSat, selectedUrgency, selectedCategory, searchQuery]);

  // Keep selectedHospital synchronized if it updates
  useEffect(() => {
    if (selectedHospital) {
      const refreshed = hospitals.find((h) => h.id === selectedHospital.id);
      if (refreshed) {
        setSelectedHospital(refreshed);
      }
    }
  }, [hospitals]);

  // Handlers for Hospital operations
  const handleAddHospital = (newHospitalData: Omit<Hospital, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newHospital: Hospital = {
      ...newHospitalData,
      id: `hosp-${Date.now()}`,
      satStatus: newHospitalData.satStatus || 'SAT not filled',
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };

    const nextHospitals = [newHospital, ...hospitals];
    setHospitals(nextHospitals);
    syncFullStateToServer(nextHospitals, cohorts, states, yatras);
    addToast('success', 'Hospital Added', `${newHospital.organisation} added to tracker.`);
  };

  const handleUpdateHospitalDetails = (updated: Hospital) => {
    const nextHospitals = hospitals.map((h) => (h.id === updated.id ? updated : h));
    setHospitals(nextHospitals);
    setSelectedHospital(updated);
    syncFullStateToServer(nextHospitals, cohorts, states, yatras);
    addToast('success', 'Details Updated', `Updated details for ${updated.organisation}.`);
  };

  const handleSaveHospitalEdit = (updated: Hospital) => {
    const nextHospitals = hospitals.map((h) => (h.id === updated.id ? updated : h));
    setHospitals(nextHospitals);
    setSelectedHospital(updated);
    syncFullStateToServer(nextHospitals, cohorts, states, yatras);
    addToast('success', 'Record Saved', `Successfully updated "${updated.organisation}".`);
  };

  const handleBulkImport = (
    newRecords: Omit<Hospital, 'id' | 'createdAt' | 'updatedAt'>[],
    mode: 'append' | 'replace'
  ) => {
    const timestamp = new Date().toISOString().split('T')[0];
    const createdHospitals: Hospital[] = newRecords.map((item, idx) => ({
      ...item,
      id: `hosp-bulk-${Date.now()}-${idx}`,
      satStatus: item.satStatus || 'SAT not filled',
      createdAt: timestamp,
      updatedAt: timestamp,
    }));

    let nextHospitals: Hospital[];
    if (mode === 'replace') {
      nextHospitals = createdHospitals;
      setHospitals(nextHospitals);
      addToast(
        'success',
        'Bulk Upload Complete',
        `Replaced database with ${createdHospitals.length} imported hospitals.`
      );
    } else {
      nextHospitals = [...createdHospitals, ...hospitals];
      setHospitals(nextHospitals);
      addToast(
        'success',
        'Bulk Upload Complete',
        `Added ${createdHospitals.length} hospitals into pipeline.`
      );
    }

    syncFullStateToServer(nextHospitals, cohorts, states, yatras);
  };

  // Quick Call Status Change (Direct API + SSE Sync)
  const handleQuickStatusChange = async (hospitalId: string, newStatus: CallStatus, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    // Optimistic UI update
    setHospitals((prev) => {
      const updated = prev.map((h) => {
        if (h.id === hospitalId) {
          const newRemark: InteractionRemark = {
            id: `rem-quick-${Date.now()}`,
            date: new Date().toISOString(),
            author: 'Advisor',
            callStatus: newStatus,
            remark: `Quick status updated from ${h.callStatus} to ${newStatus}.`,
            channel: 'Phone Call',
          };
          return {
            ...h,
            callStatus: newStatus,
            updatedAt: new Date().toISOString(),
            remarks: [newRemark, ...(h.remarks || [])]
          };
        }
        return h;
      });
      try { localStorage.setItem(HOSPITALS_STORAGE_KEY, JSON.stringify(updated)); } catch {}
      return updated;
    });

    addToast('success', 'Stage Updated', `Status updated to ${newStatus}`);

    // Call server endpoint for instant multi-user broadcast
    try {
      await fetch('/api/tracker/quick-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hospitalId, callStatus: newStatus })
      });
    } catch (err) {
      console.error('Failed to sync quick status:', err);
    }
  };

  // Quick SAT Status Change (Direct API + SSE Sync)
  const handleQuickSatStatusChange = async (hospitalId: string, newSatStatus: SATStatus, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    // Optimistic UI update
    setHospitals((prev) => {
      const updated = prev.map((h) => {
        if (h.id === hospitalId) {
          return {
            ...h,
            satStatus: newSatStatus,
            satUpdatedDate: new Date().toISOString().split('T')[0],
            updatedAt: new Date().toISOString()
          };
        }
        return h;
      });
      try { localStorage.setItem(HOSPITALS_STORAGE_KEY, JSON.stringify(updated)); } catch {}
      return updated;
    });

    addToast('success', 'SAT Status Updated', `SAT Status set to "${newSatStatus}"`);

    // Call server endpoint for instant multi-user broadcast
    try {
      await fetch('/api/tracker/quick-sat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hospitalId, satStatus: newSatStatus })
      });
    } catch (err) {
      console.error('Failed to sync quick SAT status:', err);
    }
  };

  // Add Interaction Remark
  const handleAddRemark = (hospitalId: string, remarkData: Omit<InteractionRemark, 'id' | 'date'>) => {
    const newRemark: InteractionRemark = {
      ...remarkData,
      id: `rem-${Date.now()}`,
      date: new Date().toISOString()
    };

    const nextHospitals = hospitals.map((h) => {
      if (h.id === hospitalId) {
        return {
          ...h,
          callStatus: remarkData.callStatus,
          remarksText: remarkData.remark,
          updatedAt: new Date().toISOString(),
          remarks: [newRemark, ...(h.remarks || [])]
        };
      }
      return h;
    });

    setHospitals(nextHospitals);
    syncFullStateToServer(nextHospitals, cohorts, states, yatras);
    addToast('success', 'Remark Logged', `Appended interaction & updated status to ${remarkData.callStatus}.`);
  };

  // Admin Cohort Handlers (Create, Delete, Enroll, Status Update)
  const handleCreateCohort = (newCohortData: Omit<TrainingCohort, 'id' | 'enrolledHospitalIds' | 'attendees'>) => {
    const newCohort: TrainingCohort = {
      ...newCohortData,
      id: `cohort-${Date.now()}`,
      enrolledHospitalIds: [],
      attendees: []
    };

    const nextCohorts = [newCohort, ...cohorts];
    setCohorts(nextCohorts);
    syncFullStateToServer(hospitals, nextCohorts, states, yatras);
    addToast('success', 'Training Session Created', `"${newCohort.title}" scheduled.`);
  };

  const handleEditCohort = (updatedCohort: TrainingCohort) => {
    const nextCohorts = cohorts.map((c) => (c.id === updatedCohort.id ? updatedCohort : c));
    setCohorts(nextCohorts);
    syncFullStateToServer(hospitals, nextCohorts, states, yatras);
    addToast('success', 'Training Session Updated', `"${updatedCohort.title}" updated.`);
  };

  const handleDeleteCohort = (cohortId: string) => {
    const cohort = cohorts.find((c) => c.id === cohortId);
    const nextCohorts = cohorts.filter((c) => c.id !== cohortId);
    
    // Remove cohortId reference from hospitals
    const nextHospitals = hospitals.map((h) => ({
      ...h,
      enrolledCohortIds: (h.enrolledCohortIds || []).filter((id) => id !== cohortId)
    }));

    setCohorts(nextCohorts);
    setHospitals(nextHospitals);
    syncFullStateToServer(nextHospitals, nextCohorts, states, yatras);
    addToast('info', 'Training Deleted', `Removed "${cohort?.title || 'Cohort'}".`);
  };

  const handleEnrollHospitals = (cohortId: string, hospitalIds: string[]) => {
    const cohort = cohorts.find((c) => c.id === cohortId);
    if (!cohort) return;

    const newAttendees: CohortAttendee[] = hospitalIds.map((hId) => {
      const hosp = hospitals.find((h) => h.id === hId);
      const fullName = [hosp?.firstName, hosp?.lastName].filter(Boolean).join(' ') || 'Contact Person';
      return {
        hospitalId: hId,
        hospitalName: hosp?.organisation || 'Hospital',
        contactPerson: fullName,
        mobile: hosp?.mobile || '',
        attendanceStatus: 'Registered',
        preTrainingStatus: hosp?.callStatus || 'Engaged',
        postTrainingStatus: hosp?.callStatus || 'Engaged',
        feedbackNotes: 'Enrolled via Admin Academy'
      };
    });

    // Update cohort
    const nextCohorts = cohorts.map((c) => {
      if (c.id === cohortId) {
        const existingIds = new Set(c.enrolledHospitalIds);
        hospitalIds.forEach((id) => existingIds.add(id));
        return {
          ...c,
          enrolledHospitalIds: Array.from(existingIds),
          attendees: [...c.attendees, ...newAttendees]
        };
      }
      return c;
    });

    // Update hospital links
    const nextHospitals = hospitals.map((h) => {
      if (hospitalIds.includes(h.id)) {
        const currentCohorts = h.enrolledCohortIds || [];
        return {
          ...h,
          enrolledCohortIds: Array.from(new Set([...currentCohorts, cohortId]))
        };
      }
      return h;
    });

    setCohorts(nextCohorts);
    setHospitals(nextHospitals);
    syncFullStateToServer(nextHospitals, nextCohorts, states, yatras);
    addToast('success', 'Hospitals Enrolled', `Enrolled ${hospitalIds.length} hospital(s) into "${cohort.title}".`);
  };

  const handleUpdateAttendeeStatus = (
    cohortId: string,
    hospitalId: string,
    attendanceStatus: CohortAttendee['attendanceStatus'],
    postTrainingStatus: CallStatus
  ) => {
    const nextCohorts = cohorts.map((c) => {
      if (c.id === cohortId) {
        return {
          ...c,
          attendees: c.attendees.map((att) => {
            if (att.hospitalId === hospitalId) {
              return {
                ...att,
                attendanceStatus,
                postTrainingStatus,
                convertedDate: postTrainingStatus === 'Won' ? new Date().toISOString() : att.convertedDate
              };
            }
            return att;
          })
        };
      }
      return c;
    });

    // Also synchronize hospital's main call status
    const nextHospitals = hospitals.map((h) => {
      if (h.id === hospitalId && h.callStatus !== postTrainingStatus) {
        const logRemark: InteractionRemark = {
          id: `rem-post-train-${Date.now()}`,
          date: new Date().toISOString(),
          author: 'Training Academy Lead',
          callStatus: postTrainingStatus,
          remark: `Status updated to ${postTrainingStatus} following training attendance (${attendanceStatus}).`,
          channel: 'In-Person Visit',
          tags: ['Post-Training Efficacy']
        };
        return {
          ...h,
          callStatus: postTrainingStatus,
          updatedAt: new Date().toISOString(),
          remarks: [logRemark, ...(h.remarks || [])]
        };
      }
      return h;
    });

    setCohorts(nextCohorts);
    setHospitals(nextHospitals);
    syncFullStateToServer(nextHospitals, nextCohorts, states, yatras);
    addToast('info', 'Attendance & Conversion Updated', `Updated status to ${postTrainingStatus}.`);
  };

  // Geographic management handlers (State & City)
  const handleAddState = (name: string, code: string) => {
    const newState: StateLocation = {
      id: `state-${Date.now()}`,
      name: name.trim(),
      code: code.trim().toUpperCase(),
      cities: []
    };
    const nextStates = [...states, newState];
    setStates(nextStates);
    syncFullStateToServer(hospitals, cohorts, nextStates, yatras);
    addToast('success', 'State Added', `Added ${name} to geographic zones.`);
  };

  const handleDeleteState = (stateId: string) => {
    const st = states.find((s) => s.id === stateId);
    const nextStates = states.filter((s) => s.id !== stateId);
    setStates(nextStates);
    syncFullStateToServer(hospitals, cohorts, nextStates, yatras);
    addToast('info', 'State Deleted', `Removed ${st?.name || 'state'}.`);
  };

  const handleAddCity = (stateId: string, cityName: string) => {
    const nextStates = states.map((s) => {
      if (s.id === stateId) {
        if (s.cities.includes(cityName.trim())) return s;
        return {
          ...s,
          cities: [...s.cities, cityName.trim()]
        };
      }
      return s;
    });
    setStates(nextStates);
    syncFullStateToServer(hospitals, cohorts, nextStates, yatras);
    addToast('success', 'City Added', `Added ${cityName} to operations territory.`);
  };

  const handleDeleteCity = (stateId: string, cityName: string) => {
    const nextStates = states.map((s) => {
      if (s.id === stateId) {
        return {
          ...s,
          cities: s.cities.filter((c) => c !== cityName)
        };
      }
      return s;
    });
    setStates(nextStates);
    syncFullStateToServer(hospitals, cohorts, nextStates, yatras);
    addToast('info', 'City Removed', `Removed ${cityName}.`);
  };

  // Yatra Event Handlers
  const handleCreateYatra = async (newYatraData: Omit<YatraEvent, 'id'>) => {
    const newYatra: YatraEvent = {
      ...newYatraData,
      id: `yatra-${Date.now()}`
    };

    const nextYatras = [newYatra, ...yatras];
    setYatras(nextYatras);
    try {
      await fetch('/api/tracker/yatras', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newYatra)
      });
    } catch {}
    syncFullStateToServer(hospitals, cohorts, states, nextYatras);
    addToast('success', 'Yatra Event Added', `Scheduled "${newYatra.title}" in ${newYatra.city}.`);
  };

  const handleEditYatra = async (updatedYatra: YatraEvent) => {
    const nextYatras = yatras.map((y) => (y.id === updatedYatra.id ? updatedYatra : y));
    setYatras(nextYatras);

    // Synchronize mapped hospitals
    const nextHospitals = hospitals.map((h) => {
      if (updatedYatra.hospitalIds.includes(h.id)) {
        return {
          ...h,
          yatraCity: updatedYatra.city,
          yatraEventDate: updatedYatra.date,
          yatraEventName: updatedYatra.title
        };
      }
      return h;
    });

    setHospitals(nextHospitals);
    try {
      await fetch(`/api/tracker/yatras/${updatedYatra.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedYatra)
      });
    } catch {}
    syncFullStateToServer(nextHospitals, cohorts, states, nextYatras);
    addToast('success', 'Yatra Event Updated', `Updated details for "${updatedYatra.title}".`);
  };

  const handleDeleteYatra = async (yatraId: string) => {
    const targetYatra = yatras.find((y) => y.id === yatraId);
    const nextYatras = yatras.filter((y) => y.id !== yatraId);
    setYatras(nextYatras);

    // Clear yatra flag on hospitals if this was their only/primary yatra
    let nextHospitals = hospitals;
    if (targetYatra) {
      nextHospitals = hospitals.map((h) => {
        if (targetYatra.hospitalIds.includes(h.id)) {
          return {
            ...h,
            yatraEventAttended: false,
            yatraEventDate: undefined,
            yatraCity: undefined,
            yatraEventName: undefined
          };
        }
        return h;
      });
      setHospitals(nextHospitals);
    }

    try {
      await fetch(`/api/tracker/yatras/${yatraId}`, {
        method: 'DELETE'
      });
    } catch {}

    syncFullStateToServer(nextHospitals, cohorts, states, nextYatras);
    addToast('info', 'Yatra Deleted', `Removed "${targetYatra?.title || 'Yatra Event'}".`);
  };

  const handleAssignHospitalsToYatra = async (yatraId: string, hospitalIds: string[]) => {
    const targetYatra = yatras.find((y) => y.id === yatraId);
    if (!targetYatra) return;

    // Update Yatra's hospitalIds list
    const nextYatras = yatras.map((y) => {
      if (y.id === yatraId) {
        const combined = Array.from(new Set([...(y.hospitalIds || []), ...hospitalIds]));
        return { ...y, hospitalIds: combined };
      }
      return y;
    });
    setYatras(nextYatras);

    // Update hospital attributes
    const nextHospitals = hospitals.map((h) => {
      if (hospitalIds.includes(h.id)) {
        return {
          ...h,
          yatraEventAttended: true,
          yatraCity: targetYatra.city,
          yatraEventDate: targetYatra.date,
          yatraEventName: targetYatra.title,
          updatedAt: new Date().toISOString()
        };
      }
      return h;
    });
    setHospitals(nextHospitals);

    try {
      await fetch(`/api/tracker/yatras/${yatraId}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hospitalIds })
      });
    } catch {}

    syncFullStateToServer(nextHospitals, cohorts, states, nextYatras);
    addToast('success', 'Hospitals Mapped', `Mapped ${hospitalIds.length} hospital(s) to "${targetYatra.title}".`);
  };

  const handleRemoveHospitalFromYatra = (yatraId: string, hospitalId: string) => {
    const targetYatra = yatras.find((y) => y.id === yatraId);
    
    const nextYatras = yatras.map((y) => {
      if (y.id === yatraId) {
        return {
          ...y,
          hospitalIds: (y.hospitalIds || []).filter((id) => id !== hospitalId)
        };
      }
      return y;
    });
    setYatras(nextYatras);

    const nextHospitals = hospitals.map((h) => {
      if (h.id === hospitalId) {
        return {
          ...h,
          yatraEventAttended: false,
          yatraCity: undefined,
          yatraEventDate: undefined,
          yatraEventName: undefined,
          updatedAt: new Date().toISOString()
        };
      }
      return h;
    });
    setHospitals(nextHospitals);

    syncFullStateToServer(nextHospitals, cohorts, states, nextYatras);
    addToast('info', 'Hospital Unmapped', `Unlinked hospital from ${targetYatra?.city || 'Yatra'}.`);
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = [
      'Organisation',
      'First Name',
      'Last Name',
      'Mobile',
      'City',
      'State',
      'Call Status',
      'SAT Status',
      'Yatra Attended',
      'Yatra City',
      'Yatra Date',
      'Accreditation Category',
      'Expiry Date',
      'Renewal Urgency',
      'Remarks'
    ];

    const rows = filteredHospitals.map((h) => [
      `"${(h.organisation || '').replace(/"/g, '""')}"`,
      `"${(h.firstName || '').replace(/"/g, '""')}"`,
      `"${(h.lastName || '').replace(/"/g, '""')}"`,
      `"${h.mobile || ''}"`,
      `"${h.city || 'Bhopal'}"`,
      `"${h.state || 'Madhya Pradesh'}"`,
      `"${h.callStatus || ''}"`,
      `"${h.satStatus || 'SAT not filled'}"`,
      `"${h.yatraEventAttended ? 'Yes' : 'No'}"`,
      `"${h.yatraCity || ''}"`,
      `"${h.yatraEventDate || ''}"`,
      `"${h.accreditationCategory || ''}"`,
      `"${h.expiryDate || ''}"`,
      `"${h.renewalUrgency || ''}"`,
      `"${(h.remarksText || h.remarks?.[0]?.remark || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Hospital_Conversion_Tracker_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast('success', 'CSV Exported', `Downloaded ${filteredHospitals.length} hospital records.`);
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 flex flex-col font-sans antialiased selection:bg-blue-600 selection:text-white">
      
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onOpenBulkModal={() => setIsBulkModalOpen(true)}
        onExportData={handleExportCSV}
        onResetData={handleResetAllData}
        selectedCity={selectedCity}
        onCityChange={setSelectedCity}
        states={states}
        totalCount={hospitals.length}
        isSyncConnected={isSyncConnected}
        lastSyncTime={lastSyncTime}
        onManualSync={handleManualSync}
        isSyncing={isManualSyncing}
      />

      {/* Main App Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* TAB 1: Insights & Reports (Executive Managerial Overview & Efficacy Dashboard) */}
        {activeTab === 'analytics' && (
          <AnalyticsTab
            hospitals={filteredHospitals}
            cohorts={cohorts}
            onSelectHospital={(hosp) => {
              setSelectedHospital(hosp);
              setActiveTab('dashboard');
            }}
            onFilterByStatus={(st) => {
              setSelectedStatus(st);
              setActiveTab('dashboard');
            }}
          />
        )}

        {/* TAB 2: Conversion Pipeline & Directory */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            
            {/* Executive KPI Summary Cards */}
            <KpiCards
              hospitals={filteredHospitals}
              selectedStatusFilter={selectedStatus}
              selectedUrgencyFilter={selectedUrgency}
              onFilterByStatus={(st) => {
                if (selectedStatus === st) {
                  setSelectedStatus('ALL');
                } else {
                  setSelectedStatus(st);
                  setSelectedUrgency('ALL');
                }
              }}
              onFilterByUrgency={(urg) => {
                if (selectedUrgency === urg) {
                  setSelectedUrgency('ALL');
                } else {
                  setSelectedUrgency(urg);
                  setSelectedStatus('ALL');
                }
              }}
              onClearFilters={handleResetFilters}
            />

            {/* Filter Bar & Funnel Strip */}
            <FilterBar
              hospitals={filteredHospitals}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedStatus={selectedStatus}
              onStatusChange={setSelectedStatus}
              selectedSat={selectedSat}
              onSatChange={setSelectedSat}
              selectedUrgency={selectedUrgency}
              onUrgencyChange={setSelectedUrgency}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              onResetFilters={handleResetFilters}
              filteredCount={filteredHospitals.length}
            />

            {/* Hospital Directory: Table vs Kanban Board */}
            {viewMode === 'table' ? (
              <HospitalTable
                hospitals={filteredHospitals}
                onSelectHospital={(hosp) => setSelectedHospital(hosp)}
                onEditHospital={(hosp) => {
                  setEditingHospital(hosp);
                  setIsEditModalOpen(true);
                }}
                onQuickStatusChange={handleQuickStatusChange}
                onQuickSatStatusChange={handleQuickSatStatusChange}
                onOpenAddModal={() => setIsAddModalOpen(true)}
              />
            ) : (
              <KanbanBoard
                hospitals={filteredHospitals}
                onSelectHospital={(hosp) => setSelectedHospital(hosp)}
                onEditHospital={(hosp) => {
                  setEditingHospital(hosp);
                  setIsEditModalOpen(true);
                }}
                onQuickStatusChange={handleQuickStatusChange}
                onOpenAddModal={() => setIsAddModalOpen(true)}
              />
            )}

          </div>
        )}

        {/* TAB 3: Admin & Training Academy & Geographies & Yatra Summits */}
        {activeTab === 'admin' && (
          <AdminTrainingTab
            cohorts={cohorts}
            hospitals={hospitals}
            states={states}
            yatras={yatras}
            onCreateCohort={handleCreateCohort}
            onEditCohort={handleEditCohort}
            onDeleteCohort={handleDeleteCohort}
            onEnrollHospitals={handleEnrollHospitals}
            onUpdateAttendeeStatus={handleUpdateAttendeeStatus}
            onCreateYatra={handleCreateYatra}
            onEditYatra={handleEditYatra}
            onDeleteYatra={handleDeleteYatra}
            onAssignHospitalsToYatra={handleAssignHospitalsToYatra}
            onRemoveHospitalFromYatra={handleRemoveHospitalFromYatra}
            onAddState={handleAddState}
            onDeleteState={handleDeleteState}
            onAddCity={handleAddCity}
            onDeleteCity={handleDeleteCity}
            onSelectHospital={(hosp) => {
              setSelectedHospital(hosp);
              setActiveTab('dashboard');
            }}
          />
        )}

      </main>

      {/* Hospital Detail & Remark Logger Drawer */}
      <HospitalDetailDrawer
        hospital={selectedHospital}
        cohorts={cohorts}
        onClose={() => setSelectedHospital(null)}
        onAddRemark={handleAddRemark}
        onUpdateHospitalDetails={handleUpdateHospitalDetails}
        onOpenEditModal={(hosp) => {
          setEditingHospital(hosp);
          setIsEditModalOpen(true);
        }}
      />

      {/* Add New Hospital Modal */}
      <AddHospitalModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddHospital={handleAddHospital}
        states={states}
      />

      {/* Edit Hospital Master Data Modal */}
      <EditHospitalModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingHospital(null);
        }}
        hospital={editingHospital}
        onSaveHospital={handleSaveHospitalEdit}
        states={states}
      />

      {/* Bulk Upload Modal (CSV / Excel / TSV) */}
      <BulkUploadModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        onBulkImport={handleBulkImport}
      />

      {/* Toast Feedback */}
      <Toast toasts={toasts} onDismiss={removeToast} />

      {/* Minimal Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">Yatra Conversion Tracker</span>
            <span>• Healthcare Quality & NABH Advisory System</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <button
              onClick={handleResetAllData}
              className="text-slate-400 hover:text-slate-700 underline"
            >
              Reset Initial Data
            </button>
          </div>
        </div>
      </footer>

    </div>
  );
}

