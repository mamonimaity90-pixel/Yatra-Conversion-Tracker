import { CallStatus, RenewalUrgency, AccreditationCategory, Hospital, TrainingCohort, LifecycleMilestone } from '../types';

export function calculateRenewalUrgency(expiryDateStr: string): string {
  if (!expiryDateStr || expiryDateStr.toLowerCase().includes('not found')) return '';
  
  let expiry: Date | null = null;
  
  // Check if DD-MM-YYYY format
  if (/^\d{2}-\d{2}-\d{4}$/.test(expiryDateStr)) {
    const [day, month, year] = expiryDateStr.split('-').map(Number);
    expiry = new Date(year, month - 1, day);
  } else {
    expiry = new Date(expiryDateStr);
  }

  if (!expiry || isNaN(expiry.getTime())) return '';

  const today = new Date();
  const diffTime = expiry.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return 'ALREADY EXPIRED';
  } else if (diffDays <= 90) {
    return 'Expiring <= 90 days';
  } else if (diffDays <= 180) {
    return 'Expiring 91-180 days';
  } else if (diffDays <= 365) {
    return 'Expiring 181-365 days';
  } else {
    return 'Expiring > 1 year';
  }
}

export function formatDate(dateString?: string): string {
  if (!dateString) return '—';
  if (dateString.toLowerCase() === 'not found') return 'Not found';
  try {
    if (/^\d{2}-\d{2}-\d{4}$/.test(dateString)) {
      return dateString;
    }
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateTimeString?: string): string {
  if (!dateTimeString) return '—';
  try {
    const d = new Date(dateTimeString);
    if (isNaN(d.getTime())) return dateTimeString;
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return dateTimeString;
  }
}

export function getStatusBadgeClass(status: string): string {
  const norm = (status || '').toLowerCase();
  if (norm.includes('hot')) {
    return 'bg-orange-100 text-orange-700 font-bold uppercase text-[10px]';
  }
  if (norm.includes('warm')) {
    return 'bg-amber-100 text-amber-800 font-semibold uppercase text-[10px]';
  }
  if (norm.includes('progress') || norm === 'aip') {
    return 'bg-blue-100 text-blue-700 font-bold uppercase text-[10px]';
  }
  if (norm.includes('won')) {
    return 'bg-emerald-100 text-emerald-700 font-bold uppercase text-[10px]';
  }
  if (norm.includes('exist')) {
    return 'bg-indigo-100 text-indigo-700 font-semibold uppercase text-[10px]';
  }
  if (norm.includes('engaged')) {
    return 'bg-sky-100 text-sky-700 font-semibold uppercase text-[10px]';
  }
  if (norm.includes('cold')) {
    return 'bg-slate-100 text-slate-600 font-medium uppercase text-[10px]';
  }
  if (norm.includes('lost')) {
    return 'bg-rose-100 text-rose-600 font-medium uppercase text-[10px]';
  }
  return 'bg-slate-100 text-slate-700 font-medium uppercase text-[10px]';
}

export function getStatusDotColor(status: string): string {
  const norm = (status || '').toLowerCase();
  if (norm.includes('hot')) return 'bg-orange-500';
  if (norm.includes('warm')) return 'bg-amber-500';
  if (norm.includes('progress') || norm === 'aip') return 'bg-blue-600';
  if (norm.includes('won')) return 'bg-emerald-600';
  if (norm.includes('exist')) return 'bg-indigo-600';
  if (norm.includes('engaged')) return 'bg-sky-500';
  if (norm.includes('cold')) return 'bg-slate-400';
  if (norm.includes('lost')) return 'bg-rose-400';
  return 'bg-slate-400';
}

export function getUrgencyBadgeClass(urgency: string): string {
  const norm = (urgency || '').toUpperCase();
  if (norm.includes('EXPIRED')) {
    return 'bg-red-100 text-red-700 font-bold text-[10px]';
  }
  if (norm.includes('90')) {
    return 'bg-amber-100 text-amber-700 font-semibold text-[10px]';
  }
  if (norm.includes('180')) {
    return 'bg-yellow-100 text-yellow-800 font-semibold text-[10px]';
  }
  if (norm.includes('365')) {
    return 'bg-blue-50 text-blue-700 font-medium text-[10px]';
  }
  if (norm.includes('> 1') || norm.includes('>1')) {
    return 'bg-emerald-100 text-emerald-700 font-medium text-[10px]';
  }
  return 'bg-slate-100 text-slate-600 text-[10px]';
}

export function getSatStatusBadgeClass(status?: string): string {
  const norm = (status || '').toLowerCase();
  if (norm.includes('completed')) {
    return 'bg-emerald-50 text-emerald-700 border border-emerald-300 font-bold';
  }
  if (norm.includes('partial') || norm.includes('partially')) {
    return 'bg-amber-50 text-amber-800 border border-amber-300 font-bold';
  }
  if (norm.includes('not filled')) {
    return 'bg-slate-100 text-slate-600 border border-slate-200 font-medium';
  }
  return 'bg-slate-100 text-slate-600 border border-slate-200 font-medium';
}

export function getSatStatusDotColor(status?: string): string {
  const norm = (status || '').toLowerCase();
  if (norm.includes('completed')) return 'bg-emerald-500';
  if (norm.includes('partial') || norm.includes('partially')) return 'bg-amber-500';
  return 'bg-slate-400';
}

export function getCategoryBadgeClass(cat: string): string {
  const norm = (cat || '').toLowerCase();
  if (norm.includes('accreditation under process')) {
    return 'bg-blue-50 text-blue-700 font-medium border border-blue-200';
  }
  if (norm === 'accredited') {
    return 'bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200';
  }
  if (norm === 'certified') {
    return 'bg-emerald-50 text-emerald-700 font-medium border border-emerald-200';
  }
  return 'bg-slate-50 text-slate-600 font-normal border border-slate-200';
}

export function cleanPhoneForWhatsApp(phone: string): string {
  const digits = (phone || '').replace(/[^0-9]/g, '');
  if (digits.length === 10) {
    return `91${digits}`;
  }
  return digits;
}

export function getWhatsAppLink(phone: string, hospitalName: string, contactName?: string): string {
  const cleanPhone = cleanPhoneForWhatsApp(phone);
  const contactGreet = contactName ? ` ${contactName}` : '';
  const text = encodeURIComponent(
    `Hello${contactGreet}, greeting regarding ${hospitalName}. We wanted to follow up on your hospital accreditation / NABH certification progress.`
  );
  return `https://wa.me/${cleanPhone}?text=${text}`;
}

export interface TrainingEfficacyMetrics {
  totalHospitals: number;
  trainedCount: number;
  untrainedCount: number;
  trainedWonCount: number;
  untrainedWonCount: number;
  trainedConversionRate: number;
  untrainedConversionRate: number;
  efficacyMultiplier: number;
  yatraAttendedCount: number;
  yatraConversionRate: number;
  totalCohorts: number;
  completedCohorts: number;
  totalAttendees: number;
  averageCohortAttendanceRate: number;
}

export function calculateTrainingEfficacy(
  hospitals: Hospital[],
  cohorts: TrainingCohort[]
): TrainingEfficacyMetrics {
  const totalHospitals = hospitals.length;
  
  // Identify hospitals that attended any completed cohort or are marked attended
  const trainedHospitalIds = new Set<string>();
  let totalAttendees = 0;
  let totalAttended = 0;

  cohorts.forEach(cohort => {
    cohort.attendees.forEach(a => {
      totalAttendees++;
      if (a.attendanceStatus === 'Attended') {
        trainedHospitalIds.add(a.hospitalId);
        totalAttended++;
      }
    });
    // Also include enrolledHospitalIds for completed cohorts
    if (cohort.status === 'Completed') {
      cohort.enrolledHospitalIds.forEach(id => trainedHospitalIds.add(id));
    }
  });

  // Check hospitals with enrolledCohortIds
  hospitals.forEach(h => {
    if (h.enrolledCohortIds && h.enrolledCohortIds.length > 0) {
      trainedHospitalIds.add(h.id);
    }
  });

  const trainedHospitals = hospitals.filter(h => trainedHospitalIds.has(h.id));
  const untrainedHospitals = hospitals.filter(h => !trainedHospitalIds.has(h.id));

  const trainedWonCount = trainedHospitals.filter(h => h.callStatus === 'Won').length;
  const untrainedWonCount = untrainedHospitals.filter(h => h.callStatus === 'Won').length;

  const trainedConversionRate = trainedHospitals.length > 0 
    ? Math.round((trainedWonCount / trainedHospitals.length) * 100) 
    : 0;

  const untrainedConversionRate = untrainedHospitals.length > 0 
    ? Math.round((untrainedWonCount / untrainedHospitals.length) * 100) 
    : 0;

  const efficacyMultiplier = untrainedConversionRate > 0 
    ? Number((trainedConversionRate / untrainedConversionRate).toFixed(1)) 
    : (trainedConversionRate > 0 ? Number((trainedConversionRate / 10).toFixed(1)) : 1);

  // Yatra event efficacy
  const yatraAttendedHospitals = hospitals.filter(h => h.yatraEventAttended);
  const yatraWonCount = yatraAttendedHospitals.filter(h => h.callStatus === 'Won').length;
  const yatraConversionRate = yatraAttendedHospitals.length > 0 
    ? Math.round((yatraWonCount / yatraAttendedHospitals.length) * 100) 
    : 0;

  const completedCohorts = cohorts.filter(c => c.status === 'Completed').length;
  const averageCohortAttendanceRate = totalAttendees > 0 
    ? Math.round((totalAttended / totalAttendees) * 100) 
    : 85;

  return {
    totalHospitals,
    trainedCount: trainedHospitals.length,
    untrainedCount: untrainedHospitals.length,
    trainedWonCount,
    untrainedWonCount,
    trainedConversionRate,
    untrainedConversionRate,
    efficacyMultiplier,
    yatraAttendedCount: yatraAttendedHospitals.length,
    yatraConversionRate,
    totalCohorts: cohorts.length,
    completedCohorts,
    totalAttendees,
    averageCohortAttendanceRate
  };
}

export function buildHospitalLifecycle(hospital: Hospital, cohorts: TrainingCohort[]): LifecycleMilestone[] {
  const milestones: LifecycleMilestone[] = [];
  
  // 1. Initial Yatra Event
  if (hospital.yatraEventAttended && hospital.yatraEventDate) {
    milestones.push({
      id: 'ms-yatra',
      type: 'yatra',
      title: hospital.yatraEventName || 'Aarogya Yatra Healthcare Summit',
      date: hospital.yatraEventDate,
      description: `Hospital representatives attended Aarogya Yatra in ${hospital.yatraCity || hospital.city || 'Madhya Pradesh'}. Initiated accreditation readiness inquiry.`,
      statusBadge: 'Yatra Attended',
      badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200'
    });
  }

  // 2. Training Cohorts Attended
  cohorts.forEach(cohort => {
    const attendee = cohort.attendees?.find(a => a.hospitalId === hospital.id);
    const isEnrolled = (hospital.enrolledCohortIds || []).includes(cohort.id);
    
    if (attendee || isEnrolled) {
      const isAttended = attendee?.attendanceStatus === 'Attended';
      milestones.push({
        id: `ms-cohort-${cohort.id}`,
        type: 'training',
        title: cohort.title,
        date: cohort.date,
        description: `Attended masterclass session (${cohort.mode}) at ${cohort.venue} under Lead Assessor ${cohort.trainerName}. Status: ${attendee?.attendanceStatus || (cohort.status === 'Completed' ? 'Attended' : 'Enrolled')}.${attendee?.feedbackNotes ? ` Feedback: "${attendee.feedbackNotes}"` : ''}`,
        statusBadge: isAttended ? '✓ Training Attended' : attendee?.attendanceStatus || cohort.status,
        badgeColor: isAttended ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-blue-50 text-blue-800 border-blue-200'
      });
    }
  });

  // 3. Call Log Interactions & Remarks
  (hospital.remarks || []).forEach((rem, idx) => {
    const datePart = rem.date ? rem.date.split('T')[0] : '2026-08-19';
    milestones.push({
      id: `ms-call-${rem.id || idx}`,
      type: 'call',
      title: `${rem.channel || 'Interaction Log'} by ${rem.author || 'Advisor'}`,
      date: datePart,
      description: rem.remark || 'Logged pipeline interaction',
      statusBadge: rem.callStatus,
      badgeColor: getStatusBadgeClass(rem.callStatus)
    });
  });

  // 4. Application in Progress Milestone
  if (hospital.callStatus === 'Application in progress' || hospital.callStatus === 'AIP') {
    milestones.push({
      id: 'ms-application',
      type: 'application',
      title: 'Accreditation Application Submitted',
      date: hospital.updatedAt || '2026-08-10',
      description: 'Formal desktop audit file and statutory compliance submitted to accreditation board.',
      statusBadge: 'Application in progress',
      badgeColor: 'bg-blue-100 text-blue-700 border-blue-200 font-bold'
    });
  }

  // 5. Conversion Milestone
  if (hospital.callStatus === 'Won' || hospital.convertedDate) {
    milestones.push({
      id: 'ms-conversion',
      type: 'conversion',
      title: `Accreditation Conversion Milestone: ${hospital.accreditationCategory}`,
      date: hospital.convertedDate || hospital.updatedAt || '2026-08-15',
      description: `Hospital successfully completed inspection and awarded ${hospital.accreditationCategory} certification!`,
      statusBadge: '🏆 Won / Certified',
      badgeColor: 'bg-emerald-600 text-white font-bold'
    });
  }

  // Sort chronological
  return milestones.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}
