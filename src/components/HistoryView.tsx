import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { HistoricalShiftRun } from '../types';
import { MOCK_HISTORY_RUNS } from '../data/mockData';

export const HistoryView: React.FC = () => {
  const [runs] = useState<HistoricalShiftRun[]>(MOCK_HISTORY_RUNS);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PASSED' | 'VIOLATION'>('ALL');

  const filteredRuns = runs.filter((run) => {
    const matchesSearch =
      run.engineSerial.toLowerCase().includes(searchTerm.toLowerCase()) ||
      run.operatorId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      run.assemblyLine.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || run.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();

    const rows = filteredRuns.map((r) => ({
      'Run ID': r.id,
      'Engine Serial': r.engineSerial,
      'Assembly Line': r.assemblyLine,
      'Operator ID': r.operatorId,
      'Start Time': r.startTime,
      'End Time': r.endTime,
      'Status': r.status,
      'Violations Count': r.violationsCount,
      'Compliance Rate (%)': `${r.complianceRate}%`,
      'Steps Completed': `${r.stepsCompleted}/${r.totalSteps}`
    }));

    const ws = XLSX.utils.json_to_sheet(rows);

    // Auto column widths
    if (ws['!ref']) {
      const range = XLSX.utils.decode_range(ws['!ref']);
      const cols = [];
      for (let C = range.s.c; C <= range.e.c; ++C) {
        let maxLen = 12;
        for (let R = range.s.r; R <= range.e.r; ++R) {
          const cell = ws[XLSX.utils.encode_cell({ r: R, c: C })];
          if (cell && cell.v) {
            const len = String(cell.v).length;
            if (len > maxLen) maxLen = Math.min(len, 50);
          }
        }
        cols.push({ wch: maxLen + 3 });
      }
      ws['!cols'] = cols;
    }

    XLSX.utils.book_append_sheet(wb, ws, 'Audit Trail Runs');
    XLSX.writeFile(wb, `AssemblyGuard_Audit_Logs_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const handleExportCSV = () => {
    const headers = 'Run ID,Engine Serial,Assembly Line,Operator,Start Time,End Time,Status,Compliance Rate\n';
    const rows = filteredRuns
      .map(
        (r) =>
          `${r.id},${r.engineSerial},${r.assemblyLine},${r.operatorId},${r.startTime},${r.endTime},${r.status},${r.complianceRate}%`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AssemblyGuard_Audit_Log_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#1e2023] p-4 rounded-lg border border-[#414755]">
        <div>
          <h2 className="text-xl font-black text-[#e2e2e6] flex items-center gap-2">
            <span className="material-symbols-outlined text-[#adc6ff]">history</span>
            Audit Trails & Assembly Shift History
          </h2>
          <p className="text-xs text-[#c1c6d7] mt-0.5">
            Immutable log of engine assembly passes, sequence bypasses, and operator shift records.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={handleExportExcel}
            className="px-3.5 py-2 rounded text-xs font-bold bg-[#107c41] hover:bg-[#118d4a] text-white border border-[#1b9a54] transition-all flex items-center gap-2 cursor-pointer shadow-lg"
            title="Download Excel spreadsheet (.XLSX)"
          >
            <span className="material-symbols-outlined text-[16px]">download_for_offline</span>
            EXPORT EXCEL (.XLSX)
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3 py-2 rounded text-xs font-bold bg-[#333538] hover:bg-[#414755] text-[#adc6ff] border border-[#414755] transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">download</span>
            CSV
          </button>
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="flex flex-col sm:flex-row gap-3 bg-[#1a1c1f] p-3 rounded-lg border border-[#414755]">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#8b90a0] text-[18px]">
            search
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search engine serial, operator ID, assembly cell..."
            className="w-full bg-[#111316] border border-[#414755] rounded pl-9 pr-3 py-1.5 text-xs text-[#e2e2e6] focus:border-[#adc6ff] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-[#c1c6d7] font-mono">STATUS:</span>
          {(['ALL', 'PASSED', 'VIOLATION'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded text-xs font-mono font-semibold transition-all cursor-pointer ${
                statusFilter === st
                  ? 'bg-[#adc6ff] text-[#002e69]'
                  : 'bg-[#333538] text-[#c1c6d7] hover:bg-[#414755]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Runs Table */}
      <div className="bg-[#1e2023] rounded-lg border border-[#414755] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#282a2d] text-[#c1c6d7] uppercase border-b border-[#414755]">
              <tr>
                <th className="px-4 py-3">RUN ID</th>
                <th className="px-4 py-3">ENGINE SERIAL</th>
                <th className="px-4 py-3">ASSEMBLY LINE</th>
                <th className="px-4 py-3">OPERATOR</th>
                <th className="px-4 py-3">START TIME</th>
                <th className="px-4 py-3">END TIME</th>
                <th className="px-4 py-3">STATUS</th>
                <th className="px-4 py-3 text-right">COMPLIANCE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#414755]/50 text-[#e2e2e6]">
              {filteredRuns.map((run) => (
                <tr key={run.id} className="hover:bg-[#282a2d]/50 transition-colors">
                  <td className="px-4 py-3 text-[#00daf3] font-bold">{run.id}</td>
                  <td className="px-4 py-3 font-semibold text-white">{run.engineSerial}</td>
                  <td className="px-4 py-3 text-[#c1c6d7]">{run.assemblyLine}</td>
                  <td className="px-4 py-3 text-[#adc6ff]">{run.operatorId}</td>
                  <td className="px-4 py-3 text-[#8b90a0]">{run.startTime}</td>
                  <td className="px-4 py-3 text-[#8b90a0]">{run.endTime}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        run.status === 'PASSED'
                          ? 'bg-[#00daf3]/20 text-[#00daf3] border border-[#00daf3]/40'
                          : 'bg-[#ffb4ab]/20 text-[#ffb4ab] border border-[#ffb4ab]/40'
                      }`}
                    >
                      {run.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-[#00daf3]">
                    {run.complianceRate}%
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
