import React, { useState } from 'react';
import { downloadFrontendZip } from '../utils/exportProject';

interface HeaderProps {
  systemOnline: boolean;
  operatorName?: string;
  unresolvedViolationsCount: number;
  onOpenNotifications: () => void;
  onToggleSystemStatus: () => void;
  currentTimeStr: string;
}

export const Header: React.FC<HeaderProps> = ({
  systemOnline,
  operatorName = 'Operator 724',
  unresolvedViolationsCount,
  onOpenNotifications,
  onToggleSystemStatus,
  currentTimeStr
}) => {
  const [showSchedulePopover, setShowSchedulePopover] = useState(false);
  const [isZipping, setIsZipping] = useState(false);

  const handleDownloadZip = async () => {
    try {
      setIsZipping(true);
      await downloadFrontendZip();
    } catch (err) {
      console.error('Error downloading ZIP:', err);
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <header className="fixed top-0 right-0 left-20 flex justify-between items-center px-6 z-40 bg-[#1e2023] w-[calc(100%-5rem)] h-16 border-b border-[#414755] select-none">
      {/* Title & Brand */}
      <div className="flex items-center gap-3">
        <h1 className="font-headline-md text-2xl font-black text-[#e2e2e6] tracking-tight">
          AssemblyGuard AI
        </h1>
        <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#333538] text-[#c1c6d7] border border-[#414755]">
          v3.4-PROD
        </span>
      </div>

      {/* Right Telemetry Controls */}
      <div className="flex items-center gap-3">
        {/* Download Zip Codebase Button */}
        <button
          onClick={handleDownloadZip}
          disabled={isZipping}
          className="px-3 py-1.5 rounded text-xs font-mono font-bold bg-[#00daf3]/15 hover:bg-[#00daf3]/25 text-[#00daf3] border border-[#00daf3]/50 transition-all flex items-center gap-1.5 cursor-pointer shadow"
          title="Download full frontend source code ZIP file"
        >
          <span className="material-symbols-outlined text-[16px]">folder_zip</span>
          <span className="hidden sm:inline">{isZipping ? 'ZIPPING...' : 'DOWNLOAD FRONTEND .ZIP'}</span>
        </button>

        <div className="flex items-center gap-3 mr-1">
          {/* Status Badge */}
          <button
            onClick={onToggleSystemStatus}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#333538] border border-[#414755] hover:border-[#adc6ff] transition-all cursor-pointer"
            title="Click to toggle AI supervision status"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                systemOnline
                  ? 'bg-[#00daf3] pulse-dot shadow-[0_0_8px_rgba(0,218,243,0.8)]'
                  : 'bg-[#ffb4ab]'
              }`}
            ></span>
            <span className="font-label-sm text-[11px] font-semibold text-[#e2e2e6]">
              {systemOnline ? 'System Online' : 'System Standby'}
            </span>
          </button>

          <span className="font-label-sm text-[11px] text-[#c1c6d7] hidden md:inline">
            {operatorName}
          </span>
        </div>

        {/* Notifications Button */}
        <button
          onClick={onOpenNotifications}
          className="text-[#c1c6d7] hover:text-[#adc6ff] transition-colors p-1.5 relative rounded hover:bg-[#333538]"
          title="Notifications & Violation Alerts"
        >
          <span className="material-symbols-outlined text-[20px]">notifications</span>
          {unresolvedViolationsCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#ffb4ab] ring-2 ring-[#1e2023] animate-pulse"></span>
          )}
        </button>

        {/* Schedule / Time Popover Button */}
        <div className="relative">
          <button
            onClick={() => setShowSchedulePopover(!showSchedulePopover)}
            className="text-[#c1c6d7] hover:text-[#adc6ff] transition-colors p-1.5 rounded hover:bg-[#333538]"
            title="Shift Schedule & Shift Timer"
          >
            <span className="material-symbols-outlined text-[20px]">schedule</span>
          </button>

          {showSchedulePopover && (
            <div className="absolute right-0 mt-2 w-64 bg-[#1e2023] border border-[#414755] rounded-lg shadow-2xl p-4 z-50 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-[#414755] mb-2">
                <span className="font-bold text-[#e2e2e6] font-mono">SHIFT SCHEDULE</span>
                <span className="text-[10px] text-[#00daf3] font-mono">{currentTimeStr}</span>
              </div>
              <div className="space-y-2 text-[#c1c6d7]">
                <div className="flex justify-between">
                  <span>Shift ID:</span>
                  <span className="font-mono text-[#e2e2e6]">ALPHA-01</span>
                </div>
                <div className="flex justify-between">
                  <span>Duty Operator:</span>
                  <span className="font-semibold text-[#e2e2e6]">Operator 724</span>
                </div>
                <div className="flex justify-between">
                  <span>Shift Progress:</span>
                  <span className="font-mono text-[#adc6ff]">06h 14m / 08h 00m</span>
                </div>
                <div className="w-full bg-[#0c0e11] h-1.5 rounded-full overflow-hidden mt-1">
                  <div className="bg-[#adc6ff] h-full w-[78%]"></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
