import React, { useState, useEffect, useMemo } from 'react';
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
import { INITIAL_HOSPITALS, INITIAL_COHORTS, INITIAL_STATES } from './data/initialHospitals';
import { Hospital, TrainingCohort, CallStatus, InteractionRemark, StateLocation, CohortAttendee } from './types';

const HOSPITALS_STORAGE_KEY = 'yatra_conversion_hospitals_v4';
const COHORTS_STORAGE_KEY = 'yatra_conversion_cohorts_v4';
const STATES_STORAGE_KEY = 'yatra_conversion_states_v4';

export default function App() {
  // Navigation & View state - Default to 'analytics' (Insights & Reports) on the first tab
  const [activeTab, setActiveTab] = useState<'analytics' | 'dashboard' | 'admin'>('analytics');
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');
  const [selectedCity, setSelectedCity] = useState<string>('All Cities');
  
  // Data state with localStorage persistence
  const [hospitals, setHospitals] = useState<Hospital[]>(() => {
    try {
      const saved = localStorage.getItem(HOSPITALS_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (err) {
      console.error('Failed to load hospitals from storage', err);
    }
    return INITIAL_HOSPITALS;
  });

  const [cohorts, setCohorts] = useState<TrainingCohort[]>(() => {
    try {
      const saved = localStorage.getItem(COHORTS_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (err) {
      console.error('Failed to load cohorts from storage', err);
    }
    return INITIAL_COHORTS;
  });

  const [states, setStates] = useState<StateLocation[]>(() => {
    try {
      const saved = localStorage.getItem(STATES_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (err) {
      console.error('Failed to load states from storage', err);
    }
    return INITIAL_STATES;
  });

  // Sync state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(HOSPITALS_STORAGE_KEY, JSON.stringify(hospitals));
    } catch (err) {
      console.error('Failed to save hospitals to storage', err);
    }
  }, [hospitals]);

  useEffect(() => {
    try {
      localStorage.setItem(COHORTS_STORAGE_KEY, JSON.stringify(cohorts));
    } catch (err) {
      console.error('Failed to save cohorts to storage', err);
    }
  }, [cohorts]);

  useEffect(() => {
    try {
      localStorage.setItem(STATES_STORAGE_KEY, JSON.stringify(states));
    } catch (err) {
      console.error('Failed to save states to storage', err);
    }
  }, [states]);

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
    setSelectedUrgency('ALL');
    setSelectedCategory('ALL');
    setSelectedCity('All Cities');
  };

  // Reset to default dataset
  const handleResetAllData = () => {
    if (window.confirm('Reset all hospital pipeline records to initial default dataset?')) {
      setHospitals(INITIAL_HOSPITALS);
      setCohorts(INITIAL_COHORTS);
      setStates(INITIAL_STATES);
      localStorage.removeItem(HOSPITALS_STORAGE_KEY);
      localStorage.removeItem(COHORTS_STORAGE_KEY);
      localStorage.removeItem(STATES_STORAGE_KEY);
      addToast('info', 'Data Reset', 'Restored initial sample data.');
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

        if (!matchName && !matchFirst && !matchLast && !matchMobile && !matchCity && !matchState && !matchRemarksText && !matchRemark) {
          return false;
        }
      }
      return true;
    });
  }, [hospitals, selectedCity, selectedStatus, selectedUrgency, selectedCategory, searchQuery]);

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
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };

    setHospitals((prev) => [newHospital, ...prev]);
    addToast('success', 'Hospital Added', `${newHospital.organisation} added to tracker.`);
  };

  const handleUpdateHospitalDetails = (updated: Hospital) => {
    setHospitals((prev) => prev.map((h) => (h.id === updated.id ? updated : h)));
    setSelectedHospital(updated);
    addToast('success', 'Details Updated', `Updated details for ${updated.organisation}.`);
  };

  const handleSaveHospitalEdit = (updated: Hospital) => {
    setHospitals((prev) => prev.map((h) => (h.id === updated.id ? updated : h)));
    setSelectedHospital(updated);
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
      createdAt: timestamp,
      updatedAt: timestamp,
    }));

    if (mode === 'replace') {
      setHospitals(createdHospitals);
      addToast(
        'success',
        'Bulk Upload Complete',
        `Replaced database with ${createdHospitals.length} imported hospitals.`
      );
    } else {
      setHospitals((prev) => [...createdHospitals, ...prev]);
      addToast(
        'success',
        'Bulk Upload Complete',
        `Added ${createdHospitals.length} hospitals into pipeline.`
      );
    }
  };

  const handleQuickStatusChange = (hospitalId: string, newStatus: CallStatus, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    setHospitals((prev) =>
      prev.map((h) => {
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
      })
    );

    addToast('success', 'Stage Updated', `Status updated to ${newStatus}`);
  };

  // Add Interaction Remark
  const handleAddRemark = (hospitalId: string, remarkData: Omit<InteractionRemark, 'id' | 'date'>) => {
    const newRemark: InteractionRemark = {
      ...remarkData,
      id: `rem-${Date.now()}`,
      date: new Date().toISOString()
    };

    setHospitals((prev) =>
      prev.map((h) => {
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
      })
    );

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

    setCohorts((prev) => [newCohort, ...prev]);
    addToast('success', 'Training Session Created', `"${newCohort.title}" scheduled.`);
  };

  const handleDeleteCohort = (cohortId: string) => {
    const cohort = cohorts.find((c) => c.id === cohortId);
    setCohorts((prev) => prev.filter((c) => c.id !== cohortId));
    
    // Remove cohortId reference from hospitals
    setHospitals((prev) =>
      prev.map((h) => ({
        ...h,
        enrolledCohortIds: (h.enrolledCohortIds || []).filter((id) => id !== cohortId)
      }))
    );

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
    setCohorts((prev) =>
      prev.map((c) => {
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
      })
    );

    // Update hospital links
    setHospitals((prev) =>
      prev.map((h) => {
        if (hospitalIds.includes(h.id)) {
          const currentCohorts = h.enrolledCohortIds || [];
          return {
            ...h,
            enrolledCohortIds: Array.from(new Set([...currentCohorts, cohortId]))
          };
        }
        return h;
      })
    );

    addToast('success', 'Hospitals Enrolled', `Enrolled ${hospitalIds.length} hospital(s) into "${cohort.title}".`);
  };

  const handleUpdateAttendeeStatus = (
    cohortId: string,
    hospitalId: string,
    attendanceStatus: CohortAttendee['attendanceStatus'],
    postTrainingStatus: CallStatus
  ) => {
    setCohorts((prev) =>
      prev.map((c) => {
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
      })
    );

    // Also synchronize hospital's main call status
    setHospitals((prev) =>
      prev.map((h) => {
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
      })
    );

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
    setStates((prev) => [...prev, newState]);
    addToast('success', 'State Added', `Added ${name} to geographic zones.`);
  };

  const handleDeleteState = (stateId: string) => {
    const st = states.find((s) => s.id === stateId);
    setStates((prev) => prev.filter((s) => s.id !== stateId));
    addToast('info', 'State Deleted', `Removed ${st?.name || 'state'}.`);
  };

  const handleAddCity = (stateId: string, cityName: string) => {
    setStates((prev) =>
      prev.map((s) => {
        if (s.id === stateId) {
          if (s.cities.includes(cityName.trim())) return s;
          return {
            ...s,
            cities: [...s.cities, cityName.trim()]
          };
        }
        return s;
      })
    );
    addToast('success', 'City Added', `Added ${cityName} to operations territory.`);
  };

  const handleDeleteCity = (stateId: string, cityName: string) => {
    setStates((prev) =>
      prev.map((s) => {
        if (s.id === stateId) {
          return {
            ...s,
            cities: s.cities.filter((c) => c !== cityName)
          };
        }
        return s;
      })
    );
    addToast('info', 'City Removed', `Removed ${cityName}.`);
  };

  // Quick toggle Yatra event attendance
  const handleToggleYatraAttendance = (hospitalId: string, attended: boolean, eventDate?: string) => {
    setHospitals((prev) =>
      prev.map((h) => {
        if (h.id === hospitalId) {
          return {
            ...h,
            yatraEventAttended: attended,
            yatraEventDate: attended ? (eventDate || '2026-06-15') : undefined,
            yatraEventName: attended ? `Aarogya Yatra ${h.city || 'Regional'} Summit 2026` : undefined,
            updatedAt: new Date().toISOString()
          };
        }
        return h;
      })
    );
    addToast('info', 'Yatra Milestone Updated', attended ? 'Marked as Yatra attendee.' : 'Removed Yatra attendee flag.');
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
      'Yatra Attended',
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
      `"${h.yatraEventAttended ? 'Yes' : 'No'}"`,
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

        {/* TAB 3: Admin & Training Academy & Geographies */}
        {activeTab === 'admin' && (
          <AdminTrainingTab
            cohorts={cohorts}
            hospitals={hospitals}
            states={states}
            onCreateCohort={handleCreateCohort}
            onDeleteCohort={handleDeleteCohort}
            onEnrollHospitals={handleEnrollHospitals}
            onUpdateAttendeeStatus={handleUpdateAttendeeStatus}
            onAddState={handleAddState}
            onDeleteState={handleDeleteState}
            onAddCity={handleAddCity}
            onDeleteCity={handleDeleteCity}
            onToggleYatraAttendance={handleToggleYatraAttendance}
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
