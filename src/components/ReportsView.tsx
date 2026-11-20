import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { ViolationLog } from '../types';

interface ReportsViewProps {
  logs?: ViolationLog[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({ logs = [] }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccessMsg, setExportSuccessMsg] = useState<string | null>(null);

  const KPIS = [
    { label: 'COMPLIANCE RATE', value: '98.4%', change: '+1.2%', color: '#00daf3', sub: 'Target 97.5%' },
    { label: 'TOTAL ENGINES PASSED', value: '1,420', change: '+84 units', color: '#adc6ff', sub: 'Shift Alpha + Beta' },
    { label: 'VIOLATION DEFECT RATE', value: '1.2%', change: '-0.4%', color: '#ffb4ab', sub: 'Industry Avg 2.8%' },
    { label: 'MEAN CYCLE TIME', value: '18m 30s', change: '-45s faster', color: '#00daf3', sub: 'Optimum 19m 00s' }
  ];

  const VIOLATION_CATEGORIES = [
    { name: 'Torque Bypass (Bolt B4/B8)', count: 18, percentage: 42, severity: 'HIGH (ERROR)', action: 'Recalibrate automated torque wrench sensor and mandate operator double-check.' },
    { name: 'Piston Ring Gap Variance', count: 12, percentage: 28, severity: 'MEDIUM (WARNING)', action: 'Adjust feeder tray alignment tolerance to < 0.05mm.' },
    { name: 'Head Gasket Flange Offset', count: 8, percentage: 18, severity: 'MEDIUM (WARNING)', action: 'Inspect optical alignment laser module prior to Shift Alpha start.' },
    { name: 'Camshaft Timing Mark Shift', count: 5, percentage: 12, severity: 'LOW (WARNING)', action: 'Verify rotational sensor calibration on Station 3.' }
  ];

  const SHIFT_BENCHMARKS = [
    { shift: 'Shift Alpha (06:00 - 14:00)', lead: 'Operator 724', engines: 480, compliance: '99.1%', status: 'EXCELLENT' },
    { shift: 'Shift Beta (14:00 - 22:00)', lead: 'Operator 612', engines: 465, compliance: '98.2%', status: 'STABLE' },
    { shift: 'Shift Gamma (22:00 - 06:00)', lead: 'Operator 509', engines: 475, compliance: '96.8%', status: 'ATTENTION REQUIRED' }
  ];

  const BAY_PERFORMANCE = [
    { bay: 'Cylinder Head Assembly Bay', passed: 1420, defects: 18, compliance: '98.7%', target: '98.0%' },
    { bay: 'Valve Train & Hydraulic Lifter Cell', passed: 1412, defects: 12, compliance: '99.1%', target: '98.5%' },
    { bay: 'Piston & Crankshaft Housing Station', passed: 1400, defects: 8, compliance: '99.4%', target: '99.0%' },
    { bay: 'Camshaft & Timing Module Bay', passed: 1425, defects: 5, compliance: '99.6%', target: '99.0%' }
  ];

  // Default sample violation audit logs if current session logs are empty
  const defaultAuditLogs: ViolationLog[] = [
    {
      id: 'viol-101',
      code: 'ERR_SEQ_SKIPPED',
      timestamp: '09:24:12 AM',
      timeMinus: 'T-Minus 00:01:40',
      type: 'error',
      title: 'Torque verification bypassed',
      description: 'Torque wrench engagement missing on Bolt Cluster B4 during Frame 120.',
      resolved: false,
      operatorId: 'Operator 724'
    },
    {
      id: 'viol-102',
      code: 'WARN_GAP_TOLERANCE',
      timestamp: '09:18:45 AM',
      timeMinus: 'T-Minus 00:02:10',
      type: 'warning',
      title: 'Optical Gap Offset 0.14mm',
      description: 'Perimeter gasket gap variance detected on cylinder head during Frame 280.',
      resolved: true,
      operatorId: 'Operator 724'
    },
    {
      id: 'viol-103',
      code: 'ERR_ORIENT_MISALIGN',
      timestamp: '08:42:01 AM',
      timeMinus: 'T-Minus 00:38:54',
      type: 'error',
      title: 'Cylinder Head 4-Pin Misalignment',
      description: 'Orientation mismatch exceeding 2.5 degrees on guide pins.',
      resolved: true,
      operatorId: 'Operator 612'
    },
    {
      id: 'viol-104',
      code: 'WARN_LOW_PRESSURE',
      timestamp: '08:15:30 AM',
      timeMinus: 'T-Minus 01:05:25',
      type: 'warning',
      title: 'Hydraulic Lifter Seating Delay',
      description: 'Pressure stabilization delayed by 1.8 seconds in valve train cell.',
      resolved: true,
      operatorId: 'Operator 612'
    }
  ];

  const activeAuditLogs = logs.length > 0 ? logs : defaultAuditLogs;

  // Handle Export Excel (.xlsx)
  const handleExportExcel = () => {
    try {
      setIsExporting(true);

      const wb = XLSX.utils.book_new();

      // 1. Executive Summary Sheet
      const kpiDataAOA = [
        ['ASSEMBLYGUARD AI - QUALITY CONTROL & ANALYTICS REPORT'],
        ['Generated At:', new Date().toLocaleString()],
        ['Report Period:', 'Last 30 Days'],
        ['Facility / Location:', 'Engine Assembly Line A - Plant 4'],
        [],
        ['EXECUTIVE KPI METRIC', 'CURRENT VALUE', 'PERIOD CHANGE', 'TARGET BENCHMARK', 'STATUS EVALUATION'],
        ...KPIS.map((k) => [k.label, k.value, k.change, k.sub, k.label.includes('VIOLATION') ? 'ATTENTION' : 'OPTIMAL']),
        [],
        ['COMPONENT BAY PERFORMANCE OVERVIEW'],
        ['Component Bay / Station', 'Passed Units', 'Defects Detected', 'Compliance Rate', 'Target Compliance'],
        ...BAY_PERFORMANCE.map((b) => [b.bay, b.passed, b.defects, b.compliance, b.target])
      ];

      const wsSummary = XLSX.utils.aoa_to_sheet(kpiDataAOA);
      XLSX.utils.book_append_sheet(wb, wsSummary, 'Executive Summary');

      // 2. Defect Pareto Distribution Sheet
      const paretoDataAOA = [
        ['DEFECT & VIOLATION PARETO ANALYSIS'],
        ['Generated Date:', new Date().toLocaleDateString()],
        [],
        ['VIOLATION CATEGORY', 'INCIDENT COUNT', 'PERCENTAGE (%)', 'SEVERITY RATING', 'CORRECTIVE ACTION RECOMMENDED'],
        ...VIOLATION_CATEGORIES.map((vc) => [vc.name, vc.count, `${vc.percentage}%`, vc.severity, vc.action])
      ];

      const wsPareto = XLSX.utils.aoa_to_sheet(paretoDataAOA);
      XLSX.utils.book_append_sheet(wb, wsPareto, 'Pareto Defects');

      // 3. Shift Compliance Benchmarks Sheet
      const shiftDataAOA = [
        ['SHIFT COMPLIANCE BENCHMARK MATRIX'],
        [],
        ['SHIFT NAME & TIMING', 'LEAD OPERATOR', 'ENGINES PROCESSED', 'COMPLIANCE RATE', 'EVALUATION STATUS'],
        ...SHIFT_BENCHMARKS.map((s) => [s.shift, s.lead, s.engines, s.compliance, s.status])
      ];

      const wsShifts = XLSX.utils.aoa_to_sheet(shiftDataAOA);
      XLSX.utils.book_append_sheet(wb, wsShifts, 'Shift Benchmarks');

      // 4. Violation Audit Logs Sheet
      const logRows = activeAuditLogs.map((log) => ({
        'Incident ID': log.id,
        'Timestamp': log.timestamp,
        'Time Offset': log.timeMinus,
        'Violation Code': log.code,
        'Severity Level': log.type.toUpperCase(),
        'Violation Title': log.title,
        'Detailed Description': log.description,
        'Operator ID': log.operatorId || 'Operator 724',
        'Resolution Status': log.resolved ? 'RESOLVED' : 'UNRESOLVED / OPEN'
      }));

      const wsLogs = XLSX.utils.json_to_sheet(logRows);
      XLSX.utils.book_append_sheet(wb, wsLogs, 'Violation Audit Logs');

      // Auto-fit column widths for readability
      [wsSummary, wsPareto, wsShifts, wsLogs].forEach((ws) => {
        if (!ws['!ref']) return;
        const range = XLSX.utils.decode_range(ws['!ref']);
        const cols = [];
        for (let C = range.s.c; C <= range.e.c; ++C) {
          let maxLen = 12;
          for (let R = range.s.r; R <= range.e.r; ++R) {
            const cell = ws[XLSX.utils.encode_cell({ r: R, c: C })];
            if (cell && cell.v) {
              const len = String(cell.v).length;
              if (len > maxLen) maxLen = Math.min(len, 60);
            }
          }
          cols.push({ wch: maxLen + 3 });
        }
        ws['!cols'] = cols;
      });

      const fileName = `AssemblyGuard_Quality_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);

      setExportSuccessMsg(`Successfully generated and downloaded "${fileName}"!`);
      setTimeout(() => setExportSuccessMsg(null), 6000);
    } catch (err) {
      console.error('Error generating Excel sheet:', err);
      alert('Failed to generate Excel report. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  // Quick Export CSV
  const handleExportCSV = () => {
    try {
      const csvRows = [
        ['Incident ID', 'Timestamp', 'Time Offset', 'Violation Code', 'Severity', 'Title', 'Description', 'Operator ID', 'Status'],
        ...activeAuditLogs.map((log) => [
          log.id,
          log.timestamp,
          log.timeMinus,
          log.code,
          log.type.toUpperCase(),
          `"${log.title.replace(/"/g, '""')}"`,
          `"${log.description.replace(/"/g, '""')}"`,
          log.operatorId || 'Operator 724',
          log.resolved ? 'RESOLVED' : 'OPEN'
        ])
      ];

      const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.map((e) => e.join(',')).join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `AssemblyGuard_Violation_Logs_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setExportSuccessMsg('Downloaded CSV format audit report!');
      setTimeout(() => setExportSuccessMsg(null), 5000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-8">
      {/* Title & Download Action Header */}
      <div className="bg-[#1e2023] p-4 rounded-lg border border-[#414755] flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div>
          <h2 className="text-xl font-black text-[#e2e2e6] flex items-center gap-2">
            <span className="material-symbols-outlined text-[#00daf3]">assessment</span>
            Analytics & Quality Control Reports
          </h2>
          <p className="text-xs text-[#c1c6d7] mt-0.5">
            Real-time quality intelligence & audit data derived from AssemblyGuard AI vision supervisory models.
          </p>
        </div>

        {/* Action Buttons for Download Excel Sheet */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-mono text-[#adc6ff] bg-[#111316] px-3 py-1.5 rounded border border-[#414755] hidden sm:inline">
            Period: Last 30 Days
          </span>

          <button
            onClick={handleExportExcel}
            disabled={isExporting}
            className="px-4 py-2 bg-[#107c41] hover:bg-[#118d4a] text-white font-mono text-xs font-bold rounded border border-[#1b9a54] flex items-center gap-2 shadow-lg hover:shadow-xl transition-all cursor-pointer disabled:opacity-50"
            title="Download full multi-sheet Excel spreadsheet report (.XLSX)"
          >
            <span className="material-symbols-outlined text-lg">download_for_offline</span>
            <span>{isExporting ? 'GENERATING EXCEL...' : 'DOWNLOAD EXCEL REPORT (.XLSX)'}</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3 py-2 bg-[#282a2d] hover:bg-[#333538] text-[#00daf3] font-mono text-xs font-bold rounded border border-[#00daf3]/40 flex items-center gap-1.5 transition-all cursor-pointer"
            title="Quick CSV download"
          >
            <span className="material-symbols-outlined text-base">csv</span>
            <span>CSV</span>
          </button>
        </div>
      </div>

      {/* Success Download Banner */}
      {exportSuccessMsg && (
        <div className="bg-[#107c41]/20 border border-[#107c41] text-[#72f1a6] p-3 rounded-lg text-xs font-mono flex items-center justify-between animate-fade-in shadow-lg">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-xl">check_circle</span>
            <span>{exportSuccessMsg}</span>
          </div>
          <button
            onClick={() => setExportSuccessMsg(null)}
            className="text-[#72f1a6] hover:text-white font-bold text-sm"
          >
            ✕
          </button>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {KPIS.map((kpi, idx) => (
          <div
            key={idx}
            className="data-card p-4 rounded-lg border border-[#414755] border-glow-primary shadow-lg bg-[#1e2023]"
          >
            <p className="font-data-label text-[11px] text-[#c1c6d7] uppercase mb-1">{kpi.label}</p>
            <div className="flex items-baseline justify-between">
              <p className="font-data-display text-2xl font-bold" style={{ color: kpi.color }}>
                {kpi.value}
              </p>
              <span className="text-xs font-mono font-bold text-[#adc6ff]">{kpi.change}</span>
            </div>
            <p className="text-[10px] text-[#8b90a0] font-mono mt-1">{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts & Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Violation Pareto Chart */}
        <div className="lg:col-span-7 bg-[#1e2023] p-4 rounded-lg border border-[#414755] flex flex-col shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-[#e2e2e6] flex items-center gap-2 font-mono">
              <span className="material-symbols-outlined text-[#ffb4ab] text-lg">bar_chart</span>
              VIOLATION TYPE PARETO DISTRIBUTION
            </h3>
            <span className="text-[10px] font-mono text-[#8b90a0]">43 Total Incidents Recorded</span>
          </div>

          <div className="space-y-4 flex-1">
            {VIOLATION_CATEGORIES.map((cat, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-[#e2e2e6] font-medium">{cat.name}</span>
                  <span className="text-[#ffb4ab] font-bold">
                    {cat.count} incidents ({cat.percentage}%)
                  </span>
                </div>
                <div className="w-full bg-[#0c0e11] h-3 rounded-full overflow-hidden border border-[#414755]/40">
                  <div
                    style={{ width: `${cat.percentage}%` }}
                    className="bg-[#00daf3] h-full shadow-[0_0_8px_rgba(0,218,243,0.6)]"
                  ></div>
                </div>
                <p className="text-[10px] text-[#8b90a0] font-mono italic">Action: {cat.action}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Shift Performance Comparison */}
        <div className="lg:col-span-5 bg-[#1e2023] p-4 rounded-lg border border-[#414755] flex flex-col justify-between shadow-lg">
          <div>
            <h3 className="text-sm font-bold text-[#e2e2e6] flex items-center gap-2 mb-3 font-mono">
              <span className="material-symbols-outlined text-[#adc6ff] text-lg">groups</span>
              SHIFT COMPLIANCE BENCHMARK
            </h3>

            <div className="space-y-3 text-xs font-mono">
              {SHIFT_BENCHMARKS.map((shift, idx) => (
                <div key={idx} className="bg-[#111316] p-3 rounded border border-[#414755]">
                  <div className="flex justify-between font-bold text-[#e2e2e6] mb-1">
                    <span>{shift.shift}</span>
                    <span className={shift.compliance.startsWith('99') ? 'text-[#00daf3]' : shift.compliance.startsWith('98') ? 'text-[#adc6ff]' : 'text-[#ffb4ab]'}>
                      {shift.compliance}
                    </span>
                  </div>
                  <p className="text-[10px] text-[#8b90a0]">Lead: {shift.lead} • {shift.engines} engines processed</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#414755] flex justify-between items-center">
            <span className="text-xs font-mono text-[#c1c6d7]">Export full shift metrics to Excel</span>
            <button
              onClick={handleExportExcel}
              className="text-xs font-mono text-[#00daf3] hover:underline font-bold flex items-center gap-1 cursor-pointer"
            >
              <span>Download Excel</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>

      {/* Preview Table of Active Quality Audit Logs (Exportable to Excel) */}
      <div className="bg-[#1e2023] p-4 rounded-lg border border-[#414755] shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 border-b border-[#414755] pb-3">
          <div>
            <h3 className="text-sm font-bold text-[#e2e2e6] flex items-center gap-2 font-mono">
              <span className="material-symbols-outlined text-[#00daf3]">table_chart</span>
              INSPECTION AUDIT LOGS (INCLUDED IN EXCEL REPORT)
            </h3>
            <p className="text-xs text-[#8b90a0] mt-0.5">
              Live inspection violation log dataset exported into Sheet 4 of the Excel Workbook.
            </p>
          </div>

          <button
            onClick={handleExportExcel}
            className="bg-[#107c41] hover:bg-[#118d4a] text-white px-3 py-1.5 rounded text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer self-start sm:self-auto"
          >
            <span className="material-symbols-outlined text-base">table_view</span>
            <span>EXPORT ALL TO .XLSX</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="bg-[#111316] text-[#adc6ff] border-b border-[#414755]">
                <th className="p-2.5">INCIDENT ID</th>
                <th className="p-2.5">TIMESTAMP</th>
                <th className="p-2.5">CODE</th>
                <th className="p-2.5">SEVERITY</th>
                <th className="p-2.5">VIOLATION TITLE</th>
                <th className="p-2.5">OPERATOR</th>
                <th className="p-2.5">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#414755]/50 text-[#e2e2e6]">
              {activeAuditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-[#282a2d]/50 transition-colors">
                  <td className="p-2.5 text-[#00daf3] font-bold">{log.id}</td>
                  <td className="p-2.5 text-[#c1c6d7]">{log.timestamp}</td>
                  <td className="p-2.5 text-[#adc6ff]">{log.code}</td>
                  <td className="p-2.5">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.type === 'error'
                          ? 'bg-[#ffb4ab]/20 text-[#ffb4ab] border border-[#ffb4ab]/40'
                          : 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                      }`}
                    >
                      {log.type.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-2.5 font-semibold text-white">{log.title}</td>
                  <td className="p-2.5 text-[#c1c6d7]">{log.operatorId || 'Operator 724'}</td>
                  <td className="p-2.5">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.resolved
                          ? 'bg-[#00daf3]/20 text-[#00daf3] border border-[#00daf3]/40'
                          : 'bg-[#ffb4ab]/20 text-[#ffb4ab] border border-[#ffb4ab]/40'
                      }`}
                    >
                      {log.resolved ? 'RESOLVED' : 'OPEN'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
