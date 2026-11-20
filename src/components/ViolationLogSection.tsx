import React, { useState } from 'react';
import { ViolationLog } from '../types';

interface ViolationLogSectionProps {
  logs: ViolationLog[];
  onAddViolation: (type: 'error' | 'warning' | 'info') => void;
  onResolveViolation: (id: string) => void;
  onClearLogs: () => void;
}

export const ViolationLogSection: React.FC<ViolationLogSectionProps> = ({
  logs,
  onAddViolation,
  onResolveViolation,
  onClearLogs
}) => {
  const [filterType, setFilterType] = useState<'all' | 'error' | 'warning' | 'info'>('all');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  const filteredLogs = logs.filter((log) => {
    if (filterType === 'all') return true;
    return log.type === filterType;
  });

  return (
    <div className="data-card rounded-lg border border-[#414755] p-3 flex-1 border-glow-error flex flex-col min-h-[200px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-headline-sm text-base font-semibold text-[#ffb4ab] flex items-center gap-2">
          <span className="material-symbols-outlined text-lg text-[#ffb4ab]">warning</span>
          Real-Time Violation Log
        </h2>

        <div className="flex items-center gap-2">
          {/* Quick Add Simulation Buttons */}
          <div className="hidden sm:flex gap-1">
            <button
              onClick={() => onAddViolation('error')}
              className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#93000a]/40 text-[#ffb4ab] border border-[#ffb4ab]/30 hover:bg-[#93000a] transition-all cursor-pointer"
              title="Simulate Torque Error Alert"
            >
              + ERR
            </button>
            <button
              onClick={() => onAddViolation('warning')}
              className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950/40 text-amber-300 border border-amber-500/30 hover:bg-amber-900 transition-all cursor-pointer"
              title="Simulate Warning Alert"
            >
              + WARN
            </button>
          </div>

          {/* Filter Dropdown Toggle */}
          <div className="relative">
            <button
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className="font-label-sm text-[11px] font-semibold text-[#c1c6d7] hover:text-[#e2e2e6] flex items-center gap-1 px-2 py-1 rounded hover:bg-[#333538] transition-colors"
            >
              <span className="material-symbols-outlined text-[14px]">filter_list</span>
              <span className="uppercase">{filterType}</span>
            </button>

            {showFilterDropdown && (
              <div className="absolute right-0 mt-1 w-36 bg-[#1e2023] border border-[#414755] rounded shadow-xl py-1 z-30 text-xs">
                {(['all', 'error', 'warning', 'info'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => {
                      setFilterType(type);
                      setShowFilterDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 hover:bg-[#333538] capitalize font-mono ${
                      filterType === type ? 'text-[#00daf3] font-bold' : 'text-[#c1c6d7]'
                    }`}
                  >
                    {type} {type === 'all' ? `(${logs.length})` : ''}
                  </button>
                ))}
              </div>
            )}
          </div>

          {logs.length > 0 && (
            <button
              onClick={onClearLogs}
              className="text-[#c1c6d7] hover:text-[#ffb4ab] text-xs p-1"
              title="Clear Resolved Logs"
            >
              <span className="material-symbols-outlined text-[16px]">delete_sweep</span>
            </button>
          )}
        </div>
      </div>

      {/* Scrollable Logs Container */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-2 max-h-[170px]">
        {filteredLogs.length === 0 ? (
          <div className="py-6 text-center text-[#8b90a0] text-xs font-mono">
            No active violations logged for filter "{filterType.toUpperCase()}".
          </div>
        ) : (
          filteredLogs.map((log) => {
            if (log.type === 'error') {
              return (
                <div
                  key={log.id}
                  className="bg-[#93000a]/20 border border-[#ffb4ab]/50 rounded p-2.5 flex items-start gap-2.5 relative group"
                >
                  <span className="material-symbols-outlined text-[#ffb4ab] text-lg mt-0.5 shrink-0">
                    error
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-data-label text-xs font-bold text-[#ffb4ab]">
                          {log.code}
                        </span>
                        <span className="text-[10px] text-[#c1c6d7] font-data-label">
                          {log.timeMinus}
                        </span>
                      </div>
                      <button
                        onClick={() => onResolveViolation(log.id)}
                        className="text-[10px] font-mono text-[#adc6ff] hover:underline opacity-80 group-hover:opacity-100"
                        title="Mark as Resolved"
                      >
                        [Resolve]
                      </button>
                    </div>
                    <p className="font-body-md text-xs text-[#ffdad6] font-medium leading-snug">
                      {log.description}
                    </p>
                  </div>
                </div>
              );
            }

            if (log.type === 'warning') {
              return (
                <div
                  key={log.id}
                  className="bg-amber-950/20 border border-amber-500/50 rounded p-2.5 flex items-start gap-2.5 group"
                >
                  <span className="material-symbols-outlined text-amber-400 text-lg mt-0.5 shrink-0">
                    warning_amber
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-data-label text-xs font-bold text-amber-300">
                          {log.code}
                        </span>
                        <span className="text-[10px] text-[#c1c6d7] font-data-label">
                          {log.timeMinus}
                        </span>
                      </div>
                      <button
                        onClick={() => onResolveViolation(log.id)}
                        className="text-[10px] font-mono text-[#adc6ff] hover:underline opacity-80 group-hover:opacity-100"
                      >
                        [Resolve]
                      </button>
                    </div>
                    <p className="font-body-md text-xs text-amber-100 font-medium leading-snug">
                      {log.description}
                    </p>
                  </div>
                </div>
              );
            }

            // Info log
            return (
              <div
                key={log.id}
                className="bg-[#1e2023] border border-[#414755] rounded p-2.5 flex items-start gap-2.5 opacity-80 hover:opacity-100 transition-opacity"
              >
                <span className="material-symbols-outlined text-[#adc6ff] text-lg mt-0.5 shrink-0">
                  info
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-data-label text-xs font-bold text-[#adc6ff]">
                        {log.code}
                      </span>
                      <span className="text-[10px] text-[#c1c6d7] font-data-label">
                        {log.timeMinus}
                      </span>
                    </div>
                  </div>
                  <p className="font-body-md text-xs text-[#e2e2e6] leading-snug">
                    {log.description}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
