import React from 'react';
import { AssemblyStep } from '../types';

interface AssemblyProgressSectionProps {
  steps: AssemblyStep[];
  activeStepId: string;
  onAdvanceStep: () => void;
  onPreviousStep: () => void;
  onResetSequence: () => void;
  onTriggerStepError: (stepId: string) => void;
}

export const AssemblyProgressSection: React.FC<AssemblyProgressSectionProps> = ({
  steps,
  onAdvanceStep,
  onPreviousStep,
  onResetSequence,
  onTriggerStepError
}) => {
  return (
    <div className="data-card rounded-lg border border-[#414755] p-3.5 flex-1 flex flex-col border-glow-primary shadow-lg min-h-[320px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 border-b border-[#414755] pb-2">
        <h3 className="font-label-sm text-[11px] font-semibold text-[#c1c6d7] flex items-center gap-2 uppercase tracking-wider">
          <span className="material-symbols-outlined text-[16px] text-[#adc6ff]">list_alt</span>
          Live Assembly Progress
        </h3>

        {/* FSM Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={onPreviousStep}
            className="p-1 rounded bg-[#333538] hover:bg-[#414755] text-[#c1c6d7] text-xs transition-colors"
            title="Previous Step"
          >
            <span className="material-symbols-outlined text-[14px]">arrow_back</span>
          </button>
          <button
            onClick={onAdvanceStep}
            className="px-2 py-0.5 rounded bg-[#adc6ff] text-[#002e69] font-semibold text-[11px] hover:bg-[#d8e2ff] transition-colors flex items-center gap-1"
            title="Advance FSM Assembly Step"
          >
            <span>NEXT</span>
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </button>
          <button
            onClick={onResetSequence}
            className="p-1 rounded bg-[#333538] hover:bg-[#414755] text-[#c1c6d7] text-xs transition-colors"
            title="Reset Assembly Cycle"
          >
            <span className="material-symbols-outlined text-[14px]">restart_alt</span>
          </button>
        </div>
      </div>

      {/* Step List Timeline */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 mt-1 max-h-[360px]">
        {steps.map((step, idx) => {
          const isLast = idx === steps.length - 1;

          if (step.status === 'completed') {
            return (
              <div key={step.id} className="flex items-start gap-3 relative group">
                {!isLast && (
                  <div className="absolute left-3 top-6 bottom-[-16px] w-[2px] bg-[#adc6ff]"></div>
                )}
                <div className="w-6 h-6 rounded-full bg-[#adc6ff] flex items-center justify-center z-10 shrink-0 shadow-[0_0_8px_rgba(173,198,255,0.6)]">
                  <span className="material-symbols-outlined text-[#002e69] text-[14px] font-bold">
                    check
                  </span>
                </div>
                <div className="pt-0.5 flex-1">
                  <div className="flex justify-between items-center">
                    <p className="font-label-sm text-[10px] text-[#adc6ff] font-bold tracking-wider mb-0.5">
                      STEP {step.stepNumber} - COMPLETED
                    </p>
                    {step.timeSpent && (
                      <span className="text-[10px] font-mono text-[#8b90a0]">{step.timeSpent}</span>
                    )}
                  </div>
                  <p className="font-body-md text-xs text-[#e2e2e6] font-semibold">{step.name}</p>
                </div>
              </div>
            );
          }

          if (step.status === 'in_progress') {
            return (
              <div key={step.id} className="flex items-start gap-3 relative">
                {!isLast && (
                  <div className="absolute left-3 top-6 bottom-[-16px] w-[2px] bg-[#414755] border-dashed border-l-2"></div>
                )}
                <div className="w-6 h-6 rounded-full border-2 border-[#00daf3] bg-[#1e2023] flex items-center justify-center z-10 shrink-0">
                  <div className="w-2 h-2 rounded-full bg-[#00daf3] pulse-dot"></div>
                </div>
                <div className="pt-0.5 bg-[#282a2d] rounded p-2.5 border border-[#414755] w-full shadow-md">
                  <div className="flex justify-between items-center mb-0.5">
                    <p className="font-label-sm text-[10px] text-[#00daf3] font-bold tracking-wider">
                      STEP {step.stepNumber} - IN PROGRESS
                    </p>
                    <button
                      onClick={() => onTriggerStepError(step.id)}
                      className="text-[9px] text-[#ffb4ab] hover:underline font-mono"
                      title="Flag Step Violation"
                    >
                      [Flag Fail]
                    </button>
                  </div>
                  <p className="font-body-md text-xs text-[#e2e2e6] font-bold mb-1">{step.name}</p>
                  <p className="text-[11px] text-[#c1c6d7] leading-tight mb-2">{step.details}</p>
                  <div className="pt-1.5 border-t border-[#414755] text-[10px] font-data-label text-[#c1c6d7] flex justify-between">
                    <span>V-Conf: {((step.vConf || 0.88) * 100).toFixed(0)}%</span>
                    <span className="text-[#00daf3]">Time: {step.timeSpent || '02m 14s'}</span>
                  </div>
                </div>
              </div>
            );
          }

          if (step.status === 'error') {
            return (
              <div key={step.id} className="flex items-start gap-3 relative">
                {!isLast && (
                  <div className="absolute left-3 top-6 bottom-[-16px] w-[2px] bg-[#ffb4ab]"></div>
                )}
                <div className="w-6 h-6 rounded-full bg-[#93000a] border border-[#ffb4ab] flex items-center justify-center z-10 shrink-0 shadow-[0_0_8px_rgba(255,180,171,0.6)]">
                  <span className="material-symbols-outlined text-[#ffb4ab] text-[14px]">priority_high</span>
                </div>
                <div className="pt-0.5 bg-[#93000a]/20 rounded p-2.5 border border-[#ffb4ab]/50 w-full">
                  <p className="font-label-sm text-[10px] text-[#ffb4ab] font-bold tracking-wider mb-0.5">
                    STEP {step.stepNumber} - VIOLATION FLAGGED
                  </p>
                  <p className="font-body-md text-xs text-[#ffdad6] font-bold">{step.name}</p>
                  <p className="text-[10px] text-[#ffb4ab] mt-1">{step.details}</p>
                </div>
              </div>
            );
          }

          // Pending Step
          return (
            <div key={step.id} className="flex items-start gap-3 relative opacity-60 hover:opacity-100 transition-opacity">
              {!isLast && (
                <div className="absolute left-3 top-6 bottom-[-16px] w-[2px] bg-[#414755]"></div>
              )}
              <div className="w-6 h-6 rounded-full border-2 border-[#414755] bg-[#1e2023] flex items-center justify-center z-10 shrink-0">
                <span className="font-label-sm text-[10px] text-[#8b90a0] font-bold">
                  {parseInt(step.stepNumber, 10)}
                </span>
              </div>
              <div className="pt-0.5">
                <p className="font-label-sm text-[10px] text-[#c1c6d7] mb-0.5">
                  STEP {step.stepNumber}
                </p>
                <p className="font-body-md text-xs text-[#e2e2e6]">{step.name}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
