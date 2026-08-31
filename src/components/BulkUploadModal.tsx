import React, { useState, useRef } from 'react';
import { 
  Upload, 
  FileSpreadsheet, 
  X, 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  Trash2, 
  HelpCircle,
  ArrowRight
} from 'lucide-react';
import { Hospital, CallStatus } from '../types';
import { calculateRenewalUrgency, formatDate } from '../utils/helpers';

interface BulkUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBulkImport: (importedHospitals: Omit<Hospital, 'id' | 'createdAt' | 'updatedAt'>[], mode: 'append' | 'replace') => void;
  currentCount: number;
}

interface ParsedHospitalRow {
  organisation: string;
  firstName: string;
  lastName: string;
  mobile: string;
  callStatus: CallStatus;
  accreditationCategory: string;
  expiryDate: string;
  renewalUrgency: string;
  remarks: string;
  isValid: boolean;
  validationErrors: string[];
}

export const BulkUploadModal: React.FC<BulkUploadModalProps> = ({
  isOpen,
  onClose,
  onBulkImport,
  currentCount,
}) => {
  if (!isOpen) return null;

  const [activeInputMode, setActiveInputMode] = useState<'file' | 'paste'>('file');
  const [importMode, setImportMode] = useState<'append' | 'replace'>('append');
  const [pastedText, setPastedText] = useState('');
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedHospitalRow[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Download Sample CSV Template
  const handleDownloadTemplate = () => {
    const headers = [
      'Organisation',
      'First Name',
      'Last Name',
      'Mobile',
      'Call Status (Hot/Warm/AIP)',
      'Accreditation Category',
      'Expiry Date',
      'Renewal Urgency',
      'Remarks'
    ];

    const sampleRows = [
      [
        '24x7 Rudraksh Multispeciality Hospital',
        'Nitu',
        'Panwar',
        '9009920970',
        'Engaged',
        'Certified',
        '19-01-2028',
        'Expiring > 1 year',
        'Disconnected the call saying he is busy'
      ],
      [
        'Aadhaar Hospital multi speciality unit Bhopal',
        'Son Singh',
        'Yadav',
        '8120720303',
        'Cold',
        'Certified',
        '28-05-2024',
        'ALREADY EXPIRED',
        'Did not respond'
      ],
      [
        'AAYU HOSPITAL AND TRAUMA CENTRE',
        'Hariom',
        'Paliwal',
        '8349663311',
        'Hot',
        'Certified',
        '20-04-2028',
        'Expiring > 1 year',
        'Plans to apply within 2-3 months'
      ]
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + 
      [headers.join(','), ...sampleRows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'Hospital_Upload_Format.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Status normalizer
  const normalizeCallStatus = (raw: string): CallStatus => {
    const val = (raw || '').trim().toLowerCase();
    if (val === 'aip' || val.includes('progress') || val.includes('application')) {
      return 'Application in progress';
    }
    if (val.includes('hot')) return 'Hot';
    if (val.includes('warm')) return 'Warm';
    if (val.includes('won')) return 'Won';
    if (val.includes('cold')) return 'Cold';
    if (val.includes('exist')) return 'Existing';
    if (val.includes('lost')) return 'Lost';
    return 'Engaged';
  };

  // Parse TSV / CSV / Text
  const parseRawText = (rawContent: string) => {
    if (!rawContent || !rawContent.trim()) {
      setParsedRows([]);
      return;
    }

    const lines = rawContent
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lines.length === 0) {
      setParsedRows([]);
      return;
    }

    // Detect delimiter: tab or comma
    const firstLine = lines[0];
    const isTab = firstLine.includes('\t');
    const isComma = firstLine.includes(',');

    let headerIndex = -1;
    let colIndices = {
      org: 0,
      first: 1,
      last: 2,
      mobile: 3,
      status: 4,
      cat: 5,
      exp: 6,
      urg: 7,
      remark: 8
    };

    // Check if first line is a header
    const lowerFirst = firstLine.toLowerCase();
    if (lowerFirst.includes('org') || lowerFirst.includes('name') || lowerFirst.includes('mobile') || lowerFirst.includes('status') || lowerFirst.includes('category')) {
      headerIndex = 0;
      const headers = isTab 
        ? firstLine.split('\t').map((h) => h.trim().toLowerCase()) 
        : firstLine.split(',').map((h) => h.trim().replace(/^["']|["']$/g, '').toLowerCase());

      headers.forEach((h, idx) => {
        if (h.includes('org') || h.includes('hospital')) colIndices.org = idx;
        else if (h.includes('first')) colIndices.first = idx;
        else if (h.includes('last')) colIndices.last = idx;
        else if (h.includes('mobile') || h.includes('phone') || h.includes('contact num')) colIndices.mobile = idx;
        else if (h.includes('status') || h.includes('call status') || h.includes('hot/warm')) colIndices.status = idx;
        else if (h.includes('category') || h.includes('accreditation') || h.includes('certif')) colIndices.cat = idx;
        else if (h.includes('expiry') || h.includes('validity') || h.includes('exp date')) colIndices.exp = idx;
        else if (h.includes('urgency') || h.includes('renewal')) colIndices.urg = idx;
        else if (h.includes('remark') || h.includes('note') || h.includes('comment')) colIndices.remark = idx;
      });
    }

    const dataLines = headerIndex === 0 ? lines.slice(1) : lines;
    const parsed: ParsedHospitalRow[] = [];

    dataLines.forEach((line) => {
      let cols: string[] = [];

      if (isTab) {
        cols = line.split('\t').map((c) => c.trim().replace(/^["']|["']$/g, ''));
      } else if (isComma) {
        // Simple CSV splitter handling quotes
        const regex = /(?:^|,)(\"(?:[^\"]+|\"\")*\"|[^,]*)/g;
        let match;
        while ((match = regex.exec(line)) !== null) {
          let str = match[1] || '';
          if (str.startsWith('"') && str.endsWith('"')) {
            str = str.substring(1, str.length - 1).replace(/""/g, '"');
          }
          cols.push(str.trim());
          if (regex.lastIndex >= line.length) break;
        }
      } else {
        cols = [line.trim()];
      }

      if (cols.length === 0 || cols.every((c) => !c.trim())) return;

      const org = (cols[colIndices.org] || '').trim();
      const fName = colIndices.first < cols.length ? (cols[colIndices.first] || '').trim() : '';
      const lName = colIndices.last < cols.length ? (cols[colIndices.last] || '').trim() : '';
      const mobile = colIndices.mobile < cols.length ? (cols[colIndices.mobile] || '').trim() : '';
      const rawStatus = colIndices.status < cols.length ? cols[colIndices.status] || '' : 'Hot';
      const callStatus = normalizeCallStatus(rawStatus);

      const rawCat = colIndices.cat < cols.length ? (cols[colIndices.cat] || '').trim() : 'Certified';
      const rawExp = colIndices.exp < cols.length ? (cols[colIndices.exp] || '').trim() : 'Not found';
      
      let rawUrg = colIndices.urg < cols.length ? (cols[colIndices.urg] || '').trim() : '';
      if (!rawUrg && rawExp && rawExp !== 'Not found') {
        rawUrg = calculateRenewalUrgency(rawExp);
      }

      const remarks = colIndices.remark < cols.length ? (cols[colIndices.remark] || '').trim() : '';

      const validationErrors: string[] = [];
      if (!org) validationErrors.push('Missing organisation name');

      parsed.push({
        organisation: org,
        firstName: fName,
        lastName: lName,
        mobile: mobile,
        callStatus,
        accreditationCategory: rawCat || 'Not Yet Certified/Accredited',
        expiryDate: rawExp || 'Not found',
        renewalUrgency: rawUrg,
        remarks,
        isValid: validationErrors.length === 0,
        validationErrors
      });
    });

    setParsedRows(parsed);
  };

  // Handle File Input Change
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFileName(file.name);
    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      parseRawText(content);
      setIsProcessing(false);
    };
    reader.readAsText(file);
  };

  // Handle Paste Change
  const handlePasteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setPastedText(val);
    parseRawText(val);
  };

  // Confirm Import
  const handleExecuteImport = () => {
    const validRows = parsedRows.filter((r) => r.isValid);
    if (validRows.length === 0) return;

    const newHospitals: Omit<Hospital, 'id' | 'createdAt' | 'updatedAt'>[] = validRows.map((r, idx) => {
      return {
        organisation: r.organisation,
        firstName: r.firstName || undefined,
        lastName: r.lastName || undefined,
        mobile: r.mobile,
        callStatus: r.callStatus,
        accreditationCategory: r.accreditationCategory,
        expiryDate: r.expiryDate,
        renewalUrgency: r.renewalUrgency,
        remarks: r.remarks ? [
          {
            id: `rem-bulk-${Date.now()}-${idx}`,
            date: new Date().toISOString(),
            author: 'Advisor Call Log',
            callStatus: r.callStatus,
            remark: r.remarks,
            channel: 'Phone Call'
          }
        ] : []
      };
    });

    onBulkImport(newHospitals, importMode);
    onClose();
  };

  const validCount = parsedRows.filter((r) => r.isValid).length;
  const invalidCount = parsedRows.filter((r) => !r.isValid).length;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-2xs">
      <div className="bg-white rounded-2xl border border-slate-200 max-w-4xl w-full p-6 shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold shadow-xs">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Bulk Upload Hospital Data
              </h3>
              <p className="text-[11px] text-slate-500">
                Import hospital tracker rows via CSV, Excel paste, or TSV format
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadTemplate}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold"
              title="Download CSV template with exact columns"
            >
              <Download className="w-3.5 h-3.5 text-blue-600" />
              <span>Download Template</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Expected Format Notice */}
        <div className="mt-3 p-3 bg-blue-50/50 rounded-xl border border-blue-100 text-xs text-slate-700 shrink-0">
          <div className="font-semibold text-blue-900 mb-1 flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
            <span>Exact Format Columns:</span>
          </div>
          <div className="flex flex-wrap gap-1.5 text-[11px] font-mono text-slate-600">
            <span className="px-1.5 py-0.5 bg-white border border-blue-200 rounded font-semibold text-slate-900">Organisation</span>
            <span className="px-1.5 py-0.5 bg-white border border-blue-200 rounded font-semibold text-slate-900">First Name</span>
            <span className="px-1.5 py-0.5 bg-white border border-blue-200 rounded font-semibold text-slate-900">Last Name</span>
            <span className="px-1.5 py-0.5 bg-white border border-blue-200 rounded font-semibold text-slate-900">Mobile</span>
            <span className="px-1.5 py-0.5 bg-white border border-blue-200 rounded font-semibold text-slate-900">Call Status</span>
            <span className="px-1.5 py-0.5 bg-white border border-blue-200 rounded font-semibold text-slate-900">Accreditation Category</span>
            <span className="px-1.5 py-0.5 bg-white border border-blue-200 rounded font-semibold text-slate-900">Expiry Date</span>
            <span className="px-1.5 py-0.5 bg-white border border-blue-200 rounded font-semibold text-slate-900">Renewal Urgency</span>
            <span className="px-1.5 py-0.5 bg-white border border-blue-200 rounded font-semibold text-slate-900">Remarks</span>
          </div>
        </div>

        {/* Method selector */}
        <div className="mt-4 flex items-center bg-slate-100 p-1 rounded-lg shrink-0 w-fit">
          <button
            onClick={() => setActiveInputMode('file')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
              activeInputMode === 'file'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Upload File (.csv / .tsv)
          </button>
          <button
            onClick={() => setActiveInputMode('paste')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
              activeInputMode === 'paste'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Copy-Paste from Excel / Table
          </button>
        </div>

        {/* Input Area */}
        <div className="mt-3 shrink-0">
          {activeInputMode === 'file' ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 hover:border-blue-500 hover:bg-blue-50/20 rounded-xl p-5 text-center cursor-pointer transition-all"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.tsv,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Upload className="w-7 h-7 mx-auto mb-2 text-slate-400" />
              <p className="text-xs font-semibold text-slate-800">
                {selectedFileName ? `Selected: ${selectedFileName}` : 'Click to select or drag & drop CSV/TSV file'}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Comma-separated (.csv) or tab-separated (.tsv) data
              </p>
            </div>
          ) : (
            <div>
              <textarea
                rows={4}
                value={pastedText}
                onChange={handlePasteChange}
                placeholder="Paste rows copied directly from your sheet here...&#10;e.g. 24x7 Rudraksh Hospital&#9;Nitu&#9;Panwar&#9;9009920970&#9;Engaged&#9;Certified&#9;19-01-2028&#9;Expiring > 1 year&#9;Disconnected the call saying he is busy"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 placeholder:text-slate-400 focus:ring-1 focus:ring-blue-500 outline-none"
              />
            </div>
          )}
        </div>

        {/* Live Parsed Preview Table */}
        <div className="mt-4 flex-1 overflow-y-auto min-h-[160px] border border-slate-200 rounded-xl">
          {parsedRows.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              <FileSpreadsheet className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <span>No data parsed yet. Upload a file or paste rows above to preview records before saving.</span>
            </div>
          ) : (
            <div>
              <div className="bg-slate-50 px-3 py-2 border-b border-slate-200 flex items-center justify-between text-xs sticky top-0 z-10">
                <span className="font-semibold text-slate-700">
                  Previewing {parsedRows.length} Parsed Records ({validCount} valid, {invalidCount} with errors)
                </span>
                <button
                  onClick={() => {
                    setParsedRows([]);
                    setPastedText('');
                    setSelectedFileName(null);
                  }}
                  className="text-rose-600 hover:text-rose-700 text-[11px] font-medium flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Clear</span>
                </button>
              </div>

              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/70 border-b border-slate-200 text-[10px] uppercase font-bold text-slate-500">
                    <th className="px-3 py-2">Validation</th>
                    <th className="px-3 py-2">Organisation</th>
                    <th className="px-3 py-2">Contact Person</th>
                    <th className="px-3 py-2">Mobile</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Category</th>
                    <th className="px-3 py-2">Expiry Date</th>
                    <th className="px-3 py-2">Urgency</th>
                    <th className="px-3 py-2">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[11px]">
                  {parsedRows.map((row, idx) => (
                    <tr key={idx} className={row.isValid ? 'hover:bg-slate-50' : 'bg-rose-50/40'}>
                      <td className="px-3 py-2 whitespace-nowrap">
                        {row.isValid ? (
                          <span className="text-emerald-600 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Valid</span>
                          </span>
                        ) : (
                          <span className="text-rose-600 font-semibold flex items-center gap-1" title={row.validationErrors.join(', ')}>
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>Error</span>
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2 font-semibold text-slate-900">{row.organisation || '<Missing>'}</td>
                      <td className="px-3 py-2 text-slate-700">{[row.firstName, row.lastName].filter(Boolean).join(' ') || '—'}</td>
                      <td className="px-3 py-2 text-slate-700 font-mono">{row.mobile || '—'}</td>
                      <td className="px-3 py-2">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-800">
                          {row.callStatus}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-slate-600">{row.accreditationCategory}</td>
                      <td className="px-3 py-2 text-slate-600 font-mono">{row.expiryDate}</td>
                      <td className="px-3 py-2 text-slate-600">{row.renewalUrgency || '—'}</td>
                      <td className="px-3 py-2 text-slate-500 italic max-w-[180px] truncate">{row.remarks || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer & Actions */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          
          {/* Import Mode Selector */}
          <div className="flex items-center gap-3 text-xs">
            <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-700">
              <input
                type="radio"
                name="importMode"
                value="append"
                checked={importMode === 'append'}
                onChange={() => setImportMode('append')}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span>Append to existing ({currentCount} hospitals)</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-700">
              <input
                type="radio"
                name="importMode"
                value="replace"
                checked={importMode === 'replace'}
                onChange={() => setImportMode('replace')}
                className="text-rose-600 focus:ring-rose-500"
              />
              <span>Replace entire list</span>
            </label>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-medium"
            >
              Cancel
            </button>
            <button
              disabled={validCount === 0 || isProcessing}
              onClick={handleExecuteImport}
              className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Import {validCount} Hospital{validCount === 1 ? '' : 's'}</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
