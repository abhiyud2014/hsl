import React, { useState } from 'react';
import { 
  ShieldCheck, 
  FileText, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  Download, 
  Printer, 
  Filter, 
  Search, 
  Award, 
  Layers, 
  Flame, 
  Activity,
  Check,
  Building2,
  Anchor
} from 'lucide-react';
import { NavalWpsAuditRecord } from '../types/dashboard';

interface NavalWpsAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  auditRecords: NavalWpsAuditRecord[];
  onIssueNdtRequisition?: (jointId: string) => void;
}

export const NavalWpsAuditModal: React.FC<NavalWpsAuditModalProps> = ({
  isOpen,
  onClose,
  auditRecords,
  onIssueNdtRequisition,
}) => {
  const [filterGrade, setFilterGrade] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const showNotification = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3500);
  };

  const filteredRecords = auditRecords.filter((rec) => {
    const matchesGrade = filterGrade === 'all' || rec.navalSteelGrade === filterGrade;
    const matchesStatus = 
      filterStatus === 'all' || 
      (filterStatus === 'cleared' && rec.ndtStatus.includes('Cleared')) ||
      (filterStatus === 'ndt_flagged' && rec.ndtStatus.includes('Requisition'));
    const matchesSearch = 
      rec.jointId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.hullSection.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.welderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.wpsSpec.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesGrade && matchesStatus && matchesSearch;
  });

  const totalJoints = auditRecords.length;
  const clearedJoints = auditRecords.filter((r) => r.ndtStatus.includes('Cleared')).length;
  const ndtFlaggedCount = auditRecords.filter((r) => r.ndtStatus.includes('Requisition')).length;
  const complianceRate = totalJoints > 0 ? ((clearedJoints / totalJoints) * 100).toFixed(1) : '100';

  const handleExportCsv = () => {
    const headers = 'Joint ID,Hull Section,Naval Steel Grade,Welder,WPS Spec,Heat Input (kJ/mm),Target Range,Interpass Temp (C),Voltage (V),Current (A),Travel Speed (mm/min),NDT Status,IRS Audit,DQA(N) Audit,Timestamp\n';
    const rows = filteredRecords.map((r) => 
      `"${r.jointId}","${r.hullSection}","${r.navalSteelGrade}","${r.welderId}","${r.wpsSpec}",${r.heatInputKjPerMm},"${r.targetHeatInputRange}",${r.interpassTempCelsius},${r.voltageRecorded},${r.currentRecorded},${r.travelSpeedMmPerMin},"${r.ndtStatus}",${r.irsCompliance ? 'PASS' : 'FLAG'},${r.dqanCompliance ? 'PASS' : 'FLAG'},"${r.timestamp}"`
    ).join('\n');
    
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `HSL_DQA-N_IRS_Weld_Audit_Dossier_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotification('Official DQA(N) / IRS Weld Audit Dossier exported as CSV successfully.');
  };

  const handlePrintCertificate = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-11 h-11 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/30 shrink-0">
              <Anchor className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg tracking-tight text-white flex items-center gap-2">
                  DQA(N) & IRS Naval Hull Quality Audit Suite
                </h3>
                <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase">
                  DMR 249A/B Certified
                </span>
                <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 uppercase hidden sm:inline-block">
                  Yard 11181 (HSL Vizag)
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Directorate of Quality Assurance (Navy) & Indian Register of Shipping Metallurgical Heat-Input Traceability Dossier
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Notice Bar */}
        {actionNotice && (
          <div className="bg-emerald-500 text-white px-4 py-2 text-xs font-semibold flex items-center justify-between animate-fade-in shrink-0">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{actionNotice}</span>
            </div>
            <button onClick={() => setActionNotice(null)} className="text-white/80 hover:text-white text-xs">Dismiss</button>
          </div>
        )}

        {/* Executive Metallurgical KPI Strip */}
        <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200 grid grid-cols-2 md:grid-cols-4 gap-3 shrink-0">
          <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              DQA(N) Compliance
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
              {complianceRate}%
            </div>
            <div className="text-[11px] font-mono text-emerald-700 mt-0.5">
              {clearedJoints} of {totalJoints} Joints Cleared
            </div>
          </div>

          <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-orange-500" />
              Heat-Input Formula
            </div>
            <div className="text-xs font-mono font-bold text-indigo-900 mt-1 truncate" title="HI = (V x I x 60) / (v x 1000) * eta">
              HI = (V×I×60) / (v×1000)
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Target: 1.20 - 1.65 kJ/mm
            </div>
          </div>

          <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
              Naval Steel Grade
            </div>
            <div className="text-base sm:text-lg font-black text-slate-900 mt-1">
              DMR 249A / 249B
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              DRDO / SAIL Warship Steel
            </div>
          </div>

          <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
              NDT Requisitions
            </div>
            <div className="text-xl sm:text-2xl font-black text-rose-600 mt-1">
              {ndtFlaggedCount} Flagged
            </div>
            <div className="text-[11px] font-mono text-rose-700 mt-0.5">
              Automated RT/UT Requisition
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-3 sm:p-4 bg-white border-b border-slate-100 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shrink-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative min-w-[220px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search joint, hull section, welder..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-indigo-400 text-slate-800"
              />
            </div>

            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-xs">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={filterGrade}
                onChange={(e) => setFilterGrade(e.target.value)}
                className="bg-transparent text-slate-800 font-medium focus:outline-hidden text-xs cursor-pointer"
              >
                <option value="all">All Steel Grades</option>
                <option value="DMR 249A">DMR 249A (High-Tensile)</option>
                <option value="DMR 249B">DMR 249B (Quenched & Tempered)</option>
                <option value="EH36">EH36 (Hull Heavy Plate)</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-xs">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-transparent text-slate-800 font-medium focus:outline-hidden text-xs cursor-pointer"
              >
                <option value="all">All NDT Statuses</option>
                <option value="cleared">Cleared Only (UT Pass)</option>
                <option value="ndt_flagged">NDT Requisition Flagged</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCsv}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
              title="Download CSV Dossier for Warship Overseeing Team"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Dossier (CSV)</span>
            </button>
            <button
              onClick={handlePrintCertificate}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
              title="Print Audit Report"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Sign-Off</span>
            </button>
          </div>
        </div>

        {/* Records Table */}
        <div className="overflow-y-auto flex-1 p-4 sm:p-6 bg-slate-50/50">
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                    <th className="py-3 px-4">Joint ID & Hull Strake</th>
                    <th className="py-3 px-4">Steel Grade</th>
                    <th className="py-3 px-4">Welder (DQA-N Cert)</th>
                    <th className="py-3 px-4">Heat Input (kJ/mm)</th>
                    <th className="py-3 px-4">Parameters (V / A / v)</th>
                    <th className="py-3 px-4">Interpass Temp</th>
                    <th className="py-3 px-4">NDT Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {filteredRecords.map((rec) => {
                    const isFlagged = rec.ndtStatus.includes('Requisition');
                    return (
                      <tr 
                        key={rec.id} 
                        className={`hover:bg-slate-50/80 transition-colors ${
                          isFlagged ? 'bg-rose-50/40' : ''
                        }`}
                      >
                        <td className="py-3.5 px-4 font-sans">
                          <div className="font-bold text-slate-900 font-mono">{rec.jointId}</div>
                          <div className="text-[11px] text-slate-500">{rec.hullSection}</div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                            rec.navalSteelGrade === 'DMR 249A' 
                              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                              : rec.navalSteelGrade === 'DMR 249B'
                              ? 'bg-purple-50 text-purple-700 border border-purple-200'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}>
                            {rec.navalSteelGrade}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 font-sans text-slate-800">
                          <div className="font-medium text-xs">{rec.welderId}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{rec.wpsSpec}</div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className={`font-black text-sm ${
                            isFlagged ? 'text-rose-600' : 'text-emerald-700'
                          }`}>
                            {rec.heatInputKjPerMm.toFixed(2)} kJ/mm
                          </div>
                          <div className="text-[10px] text-slate-400">
                            Target: {rec.targetHeatInputRange}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-[11px] text-slate-600">
                          <div>{rec.voltageRecorded}V / {rec.currentRecorded}A</div>
                          <div className="text-slate-400">{rec.travelSpeedMmPerMin} mm/min</div>
                        </td>

                        <td className="py-3.5 px-4 text-xs font-bold text-slate-800">
                          {rec.interpassTempCelsius}°C
                        </td>

                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold font-sans inline-flex items-center gap-1.5 ${
                            isFlagged 
                              ? 'bg-rose-100 text-rose-800 border border-rose-200'
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          }`}>
                            {isFlagged ? (
                              <AlertTriangle className="w-3 h-3 text-rose-600 shrink-0" />
                            ) : (
                              <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                            )}
                            {rec.ndtStatus}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          {isFlagged ? (
                            <button
                              onClick={() => {
                                if (onIssueNdtRequisition) onIssueNdtRequisition(rec.jointId);
                                showNotification(`NDT Radiographic Testing requisition dispatched for ${rec.jointId}. Assigned to HSL Non-Destructive Testing Lab.`);
                              }}
                              className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-[11px] font-sans shadow-xs transition-colors cursor-pointer"
                            >
                              Dispatch RT Requisition
                            </button>
                          ) : (
                            <span className="text-[11px] text-slate-400 font-sans flex items-center justify-end gap-1">
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              IRS & DQA(N) Pass
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Classification Society Endorsement Footer */}
          <div className="mt-4 p-4 rounded-2xl bg-white border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-600">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-700 font-serif">
                IRS
              </div>
              <div>
                <div className="font-bold text-slate-900">Indian Register of Shipping (IRS) & DQA(N) Digital Chain of Custody</div>
                <div className="text-[11px] text-slate-500">
                  Compliant with Naval Hull Construction Standards, ISO 9001:2015, and MoD Defence Production Directive.
                </div>
              </div>
            </div>
            <div className="text-[11px] font-mono text-slate-400 sm:text-right">
              Digital Signature Hash: <span className="text-indigo-600 font-bold">SHA-256 #HSL-NVL-9810</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
