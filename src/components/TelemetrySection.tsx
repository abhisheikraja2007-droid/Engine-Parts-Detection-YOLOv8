import React, { useEffect, useState } from 'react';
import { TelemetryData } from '../types';

interface TelemetrySectionProps {
  telemetry: TelemetryData;
  onUpdateTelemetry?: (updated: Partial<TelemetryData>) => void;
}

export const TelemetrySection: React.FC<TelemetrySectionProps> = ({
  telemetry
}) => {
  const [liveConf, setLiveConf] = useState(telemetry.confidence);
  const [liveFps, setLiveFps] = useState(telemetry.fps);
  const [liveGpu, setLiveGpu] = useState(telemetry.gpuLoad);
  const [isSimulating, setIsSimulating] = useState(true);

  // Realistic industrial sensor fluctuation
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      // Small jitter around 94.2% confidence and 59.8 fps
      const confJitter = (Math.random() - 0.5) * 0.4;
      const fpsJitter = (Math.random() - 0.5) * 0.6;
      const gpuJitter = (Math.random() - 0.5) * 1.2;

      setLiveConf((prev) => Math.min(99.9, Math.max(88.0, Number((prev + confJitter).toFixed(1)))));
      setLiveFps((prev) => Math.min(60.0, Math.max(52.0, Number((prev + fpsJitter).toFixed(1)))));
      setLiveGpu((prev) => Math.min(95.0, Math.max(45.0, Number((prev + gpuJitter).toFixed(1)))));
    }, 1800);

    return () => clearInterval(interval);
  }, [isSimulating]);

  return (
    <div className="data-card rounded-lg border border-[#414755] p-3.5 border-glow-tertiary shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-label-sm text-[11px] font-semibold text-[#c1c6d7] flex items-center gap-2 uppercase tracking-wider">
          <span className="material-symbols-outlined text-[16px] text-[#00daf3]">analytics</span>
          AI Telemetry
        </h3>
        <button
          onClick={() => setIsSimulating(!isSimulating)}
          className={`px-1.5 py-0.5 rounded text-[9px] font-mono border transition-all ${
            isSimulating
              ? 'border-[#00daf3]/50 text-[#00daf3] bg-[#00daf3]/10'
              : 'border-[#414755] text-[#8b90a0]'
          }`}
          title="Toggle live telemetry tick"
        >
          {isSimulating ? 'TICK: LIVE' : 'TICK: PAUSED'}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <p className="font-data-label text-[11px] text-[#c1c6d7] uppercase">CONFIDENCE</p>
          <p className="font-data-display text-2xl font-bold text-[#00daf3] tracking-tight">
            {liveConf.toFixed(1)}
            <span className="text-xs font-normal text-[#00daf3]/80 ml-0.5">%</span>
          </p>
        </div>

        <div>
          <p className="font-data-label text-[11px] text-[#c1c6d7] uppercase">FRAMERATE</p>
          <p className="font-data-display text-2xl font-bold text-[#adc6ff] tracking-tight">
            {liveFps.toFixed(1)}
            <span className="text-xs font-normal text-[#adc6ff]/80 ml-0.5">fps</span>
          </p>
        </div>
      </div>

      {/* Progress Bar for Confidence */}
      <div className="w-full bg-[#0c0e11] h-2 rounded-full overflow-hidden mb-3 border border-[#414755]/50">
        <div
          style={{ width: `${liveConf}%` }}
          className="bg-[#00daf3] h-full shadow-[0_0_10px_rgba(0,218,243,0.8)] transition-all duration-500 ease-out"
        ></div>
      </div>

      {/* Auxiliary Hardware Stats */}
      <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-[#c1c6d7] pt-2 border-t border-[#414755]">
        <div className="flex justify-between">
          <span>GPU Load:</span>
          <span className="text-[#e2e2e6]">{liveGpu.toFixed(1)}%</span>
        </div>
        <div className="flex justify-between">
          <span>Inference:</span>
          <span className="text-[#00daf3]">14.2ms</span>
        </div>
      </div>
    </div>
  );
};
