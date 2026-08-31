import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  X, 
  Save, 
  Phone, 
  User, 
  Calendar, 
  ShieldCheck, 
  FileText,
  AlertCircle,
  MapPin,
  Sparkles
} from 'lucide-react';
import { Hospital, CallStatus, SATStatus, StateLocation } from '../types';
import { calculateRenewalUrgency } from '../utils/helpers';

interface EditHospitalModalProps {
  isOpen: boolean;
  onClose: () => void;
  hospital: Hospital | null;
  onSaveHospital: (updated: Hospital) => void;
  states?: StateLocation[];
}

export const EditHospitalModal: React.FC<EditHospitalModalProps> = ({
  isOpen,
  onClose,
  hospital,
  onSaveHospital,
  states = [],
}) => {
  if (!isOpen || !hospital) return null;

  const [organisation, setOrganisation] = useState(hospital.organisation);
  const [firstName, setFirstName] = useState(hospital.firstName || '');
  const [lastName, setLastName] = useState(hospital.lastName || '');
  const [mobile, setMobile] = useState(hospital.mobile || '');
  const [state, setState] = useState(hospital.state || 'Madhya Pradesh');
  const [city, setCity] = useState(hospital.city || 'Bhopal');
  const [callStatus, setCallStatus] = useState<CallStatus>(hospital.callStatus);
  const [satStatus, setSatStatus] = useState<SATStatus>(hospital.satStatus || 'SAT not filled');
  const [accreditationCategory, setAccreditationCategory] = useState(hospital.accreditationCategory || 'Not Yet Certified/Accredited');
  const [expiryDate, setExpiryDate] = useState(hospital.expiryDate || 'Not found');
  const [renewalUrgency, setRenewalUrgency] = useState(hospital.renewalUrgency || '');
  const [yatraEventAttended, setYatraEventAttended] = useState(hospital.yatraEventAttended || false);
  const [yatraEventDate, setYatraEventDate] = useState(hospital.yatraEventDate || '2026-06-15');
  const [newRemark, setNewRemark] = useState('');

  const currentCities = states.find((s) => s.name === state)?.cities || ['Bhopal', 'Indore', 'Jabalpur'];

  useEffect(() => {
    if (hospital) {
      setOrganisation(hospital.organisation);
      setFirstName(hospital.firstName || '');
      setLastName(hospital.lastName || '');
      setMobile(hospital.mobile || '');
      setState(hospital.state || 'Madhya Pradesh');
      setCity(hospital.city || 'Bhopal');
      setCallStatus(hospital.callStatus);
      setSatStatus(hospital.satStatus || 'SAT not filled');
      setAccreditationCategory(hospital.accreditationCategory || 'Not Yet Certified/Accredited');
      setExpiryDate(hospital.expiryDate || 'Not found');
      setRenewalUrgency(hospital.renewalUrgency || '');
      setYatraEventAttended(hospital.yatraEventAttended || false);
      setYatraEventDate(hospital.yatraEventDate || '2026-06-15');
      setNewRemark('');
    }
  }, [hospital]);

  const handleExpiryChange = (dateVal: string) => {
    setExpiryDate(dateVal);
    if (dateVal && dateVal !== 'Not found') {
      const calculated = calculateRenewalUrgency(dateVal);
      if (calculated) {
        setRenewalUrgency(calculated);
      }
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!organisation.trim()) return;

    const updatedRemarks = [...(hospital.remarks || [])];
    if (newRemark.trim()) {
      updatedRemarks.unshift({
        id: `rem-${Date.now()}`,
        date: new Date().toISOString(),
        author: 'Advisor Call Log',
        callStatus: callStatus,
        remark: newRemark.trim(),
        channel: 'Phone Call'
      });
    }

    const updatedHospital: Hospital = {
      ...hospital,
      organisation: organisation.trim(),
      firstName: firstName.trim() || undefined,
      lastName: lastName.trim() || undefined,
      mobile: mobile.trim(),
      state: state,
      city: city,
      callStatus: callStatus,
      satStatus: satStatus,
      satUpdatedDate: new Date().toISOString().split('T')[0],
      accreditationCategory: accreditationCategory.trim(),
      expiryDate: expiryDate.trim() || 'Not found',
      renewalUrgency: renewalUrgency.trim(),
      yatraEventAttended: yatraEventAttended,
      yatraEventDate: yatraEventAttended ? yatraEventDate : undefined,
      yatraEventName: yatraEventAttended ? (hospital.yatraEventName || `Aarogya Yatra ${city} Summit 2026`) : undefined,
      yatraCity: city,
      remarks: updatedRemarks,
      updatedAt: new Date().toISOString().split('T')[0]
    };

    onSaveHospital(updatedHospital);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-2xs">
      <div className="bg-white rounded-2xl border border-slate-200 max-w-xl w-full p-6 shadow-2xl space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Edit Hospital Record
              </h3>
              <p className="text-[11px] text-slate-500">
                Update organization details, geography, call status, and remarks
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="space-y-3.5 text-xs">
          
          {/* Organisation */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Organisation Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={organisation}
              onChange={(e) => setOrganisation(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-500 font-medium"
              required
            />
          </div>

          {/* Geography: State & City */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">State</label>
              <select
                value={state}
                onChange={(e) => {
                  setState(e.target.value);
                  const stObj = states.find(s => s.name === e.target.value);
                  if (stObj && stObj.cities.length > 0) {
                    setCity(stObj.cities[0]);
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
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-medium"
              >
                {currentCities.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* First Name & Last Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                First Name
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First Name"
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Last Name
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last Name"
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Mobile & Call Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Mobile Number
              </label>
              <div className="relative">
                <Phone className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="Mobile"
                  className="w-full pl-8 p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Call Status <span className="text-red-500">*</span>
              </label>
              <select
                value={callStatus}
                onChange={(e) => setCallStatus(e.target.value as CallStatus)}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-500 font-semibold"
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
          </div>

          {/* Category & Expiry Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Accreditation Category
              </label>
              <select
                value={accreditationCategory}
                onChange={(e) => setAccreditationCategory(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-500"
              >
                <option value="Certified">Certified</option>
                <option value="Accredited">Accredited</option>
                <option value="Not Yet Certified/Accredited">Not Yet Certified/Accredited</option>
                <option value="Accreditation under process">Accreditation under process</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Expiry Date
              </label>
              <input
                type="text"
                value={expiryDate}
                onChange={(e) => handleExpiryChange(e.target.value)}
                placeholder="e.g. 19-01-2028 or Not found"
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>
          </div>

          {/* SAT Filling Status */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              SAT Filling Status
            </label>
            <select
              value={satStatus}
              onChange={(e) => setSatStatus(e.target.value as SATStatus)}
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-500 font-semibold"
            >
              <option value="SAT not filled">○ SAT not filled</option>
              <option value="SAT filled partially">⏳ SAT filled partially</option>
              <option value="SAT completed">✓ SAT completed</option>
            </select>
          </div>

          {/* Renewal Urgency & Yatra Touchpoint */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Renewal Urgency
              </label>
              <select
                value={renewalUrgency}
                onChange={(e) => setRenewalUrgency(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-500"
              >
                <option value="">(None / Empty)</option>
                <option value="ALREADY EXPIRED">ALREADY EXPIRED</option>
                <option value="Expiring <= 90 days">Expiring &le; 90 days</option>
                <option value="Expiring 91-180 days">Expiring 91-180 days</option>
                <option value="Expiring 181-365 days">Expiring 181-365 days</option>
                <option value="Expiring > 1 year">Expiring &gt; 1 year</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Yatra Event Touchpoint
              </label>
              <label className="flex items-center gap-2 p-2 bg-amber-50/60 border border-amber-200 rounded-lg cursor-pointer">
                <input
                  type="checkbox"
                  checked={yatraEventAttended}
                  onChange={(e) => setYatraEventAttended(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-amber-500"
                />
                <span className="font-semibold text-amber-900 text-xs">Attended Regional Yatra</span>
              </label>
            </div>
          </div>

          {/* New Call Remark */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Add New Call Remark / Follow-up Note
            </label>
            <textarea
              value={newRemark}
              onChange={(e) => setNewRemark(e.target.value)}
              rows={2}
              placeholder="e.g. Followed up on NABH timeline. Scheduled discussion for next Monday."
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-500 text-xs"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold flex items-center gap-1.5 shadow-sm"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
