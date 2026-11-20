import React from 'react';
import { NavigationTab } from '../types';

interface NavigationProps {
  activeTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
  operatorName?: string;
  avatarUrl?: string;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onTabChange,
  operatorName = 'Operator 724',
  avatarUrl = 'https://lh3.googleusercontent.com/aida-public/AB6AXuDtGyTqcgjXZPy2NDPmHR0B7VHrrG2z6M6dcR9cdC7S5PA9ojv7R2om2t8rS0CPz5T4__YAUuUqI1i3DsC6lPmyvurfDLMaBhBdsS7NEiczQ1YhRYC4AlhwcQSZkGuszPNua4ZHmMgU5fTukxn-x8dIEmZv3DW3ohWfKDUjRUQzxRP8Kkl36Sw6caQh4LbMQ4A24-oGLza6W_T2sHPb6cEpvrRXiPA2zIp85zG-fOnWH97jRmqQVQb1Qg'
}) => {
  return (
    <nav className="fixed left-0 top-0 h-full z-50 bg-[#0c0e11] w-20 flex flex-col items-center py-4 border-r border-[#414755] transition-colors duration-200">
      {/* Top Logo */}
      <div className="mb-8 relative group cursor-pointer" onClick={() => onTabChange('dashboard')}>
        <div className="w-10 h-10 rounded-full bg-[#333538] flex items-center justify-center overflow-hidden border border-[#414755] hover:border-[#adc6ff] transition-all">
          <span className="material-symbols-outlined text-[#adc6ff] text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            precision_manufacturing
          </span>
        </div>
        <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-[#333538] px-3 py-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-lg border border-[#414755]">
          <p className="font-label-sm text-[11px] text-[#e2e2e6] font-semibold">Industrial Supervision</p>
          <p className="text-[10px] text-[#c1c6d7]">Engine Assembly Line A</p>
        </div>
      </div>

      {/* Nav Menu Items */}
      <div className="flex flex-col gap-1 w-full px-2">
        <button
          onClick={() => onTabChange('dashboard')}
          className={`w-full flex justify-center py-3 rounded transition-all ${
            activeTab === 'dashboard'
              ? 'text-[#adc6ff] border-l-2 border-[#adc6ff] bg-[#282a2d] shadow-sm'
              : 'text-[#c1c6d7] hover:bg-[#333538] hover:text-[#e2e2e6]'
          }`}
          title="Dashboard"
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: activeTab === 'dashboard' ? "'FILL' 1" : "'FILL' 0" }}>
            dashboard
          </span>
        </button>

        <button
          onClick={() => onTabChange('history')}
          className={`w-full flex justify-center py-3 rounded transition-all ${
            activeTab === 'history'
              ? 'text-[#adc6ff] border-l-2 border-[#adc6ff] bg-[#282a2d] shadow-sm'
              : 'text-[#c1c6d7] hover:bg-[#333538] hover:text-[#e2e2e6]'
          }`}
          title="Audit History & Logs"
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: activeTab === 'history' ? "'FILL' 1" : "'FILL' 0" }}>
            history
          </span>
        </button>

        <button
          onClick={() => onTabChange('reports')}
          className={`w-full flex justify-center py-3 rounded transition-all ${
            activeTab === 'reports'
              ? 'text-[#adc6ff] border-l-2 border-[#adc6ff] bg-[#282a2d] shadow-sm'
              : 'text-[#c1c6d7] hover:bg-[#333538] hover:text-[#e2e2e6]'
          }`}
          title="Analytics & Reports"
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: activeTab === 'reports' ? "'FILL' 1" : "'FILL' 0" }}>
            assessment
          </span>
        </button>

        <button
          onClick={() => onTabChange('settings')}
          className={`w-full flex justify-center py-3 rounded transition-all ${
            activeTab === 'settings'
              ? 'text-[#adc6ff] border-l-2 border-[#adc6ff] bg-[#282a2d] shadow-sm'
              : 'text-[#c1c6d7] hover:bg-[#333538] hover:text-[#e2e2e6]'
          }`}
          title="System Settings"
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: activeTab === 'settings' ? "'FILL' 1" : "'FILL' 0" }}>
            settings
          </span>
        </button>
      </div>

      {/* Operator Avatar Bottom */}
      <div className="mt-auto mb-4 relative group cursor-pointer" title={operatorName}>
        <img
          alt="Operator Avatar"
          className="w-9 h-9 rounded-full border border-[#414755] object-cover ring-2 ring-transparent group-hover:ring-[#adc6ff] transition-all"
          src={avatarUrl}
          onError={(e) => {
            // fallback if remote avatar fails
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80';
          }}
        />
        <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-[#333538] px-2.5 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-lg border border-[#414755]">
          <p className="font-label-sm text-[11px] text-[#e2e2e6]">{operatorName}</p>
          <p className="text-[9px] text-[#00daf3] font-mono">Shift 01 - Active</p>
        </div>
      </div>
    </nav>
  );
};
