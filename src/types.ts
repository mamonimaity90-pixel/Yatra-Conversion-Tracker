export type CallStatus = 
  | 'Hot' 
  | 'Warm' 
  | 'AIP'
  | 'Application in progress' 
  | 'Engaged' 
  | 'Cold' 
  | 'Existing'
  | 'Won' 
  | 'Lost';

export type AccreditationCategory = 
  | 'Certified' 
  | 'Accredited' 
  | 'Not Yet Certified/Accredited'
  | 'Accreditation under process'
  | 'Not Yet Certified';

export type RenewalUrgency = 
  | 'ALREADY EXPIRED'
  | 'Already Expired' 
  | 'Expiring <= 90 days'
  | '<=90 days' 
  | 'Expiring 91-180 days'
  | 'Expiring 181-365 days'
  | 'Expiring > 1 year'
  | '>1 year';

export interface StateLocation {
  id: string;
  name: string;
  code?: string;
  cities: string[];
}

export interface InteractionRemark {
  id: string;
  date: string;
  author: string;
  callStatus: CallStatus;
  remark: string;
  channel?: string;
  nextFollowUp?: string;
  tags?: string[];
}

export interface Hospital {
  id: string;
  organisation: string;
  firstName?: string;
  lastName?: string;
  mobile: string;
  state?: string;
  city?: string;
  callStatus: CallStatus;
  accreditationCategory: string;
  expiryDate: string; // Date string or "Not found"
  renewalUrgency: string; // e.g. "Expiring > 1 year", "ALREADY EXPIRED", etc.
  remarks: InteractionRemark[];
  remarksText?: string;
  createdAt?: string;
  updatedAt?: string;
  
  // Hospital Lifecycle & Training correlation
  yatraEventAttended?: boolean;
  yatraEventDate?: string;
  yatraEventName?: string;
  yatraCity?: string;
  enrolledCohortIds?: string[];
  convertedDate?: string;
}

export interface TrainingCohort {
  id: string;
  title: string;
  targetCategory: string;
  date: string; // YYYY-MM-DD
  time: string;
  state?: string;
  city: string;
  venue: string;
  mode: 'In-Person' | 'Hybrid' | 'Virtual';
  capacity: number;
  trainerName: string;
  status: 'Upcoming' | 'In Progress' | 'Completed' | 'Cancelled';
  enrolledHospitalIds: string[];
  attendees: CohortAttendee[];
}

export interface CohortAttendee {
  hospitalId: string;
  hospitalName: string;
  contactPerson: string;
  mobile: string;
  attendanceStatus: 'Registered' | 'Confirmed' | 'Attended' | 'Absent';
  preTrainingStatus: CallStatus;
  postTrainingStatus: CallStatus;
  feedbackNotes?: string;
  convertedDate?: string;
}

export interface LifecycleMilestone {
  id: string;
  type: 'yatra' | 'training' | 'call' | 'application' | 'conversion';
  title: string;
  date: string;
  description: string;
  statusBadge?: string;
  badgeColor?: string;
}

export interface FilterState {
  searchQuery: string;
  state?: string;
  city: string;
  callStatus: string;
  accreditationCategory: string;
  renewalUrgency: string;
  trainingFilter?: 'ALL' | 'TRAINED' | 'UNTRAINED' | 'YATRA_ATTENDED';
  sortBy: 'name' | 'expiry' | 'urgency' | 'updated';
  sortOrder: 'asc' | 'desc';
}
