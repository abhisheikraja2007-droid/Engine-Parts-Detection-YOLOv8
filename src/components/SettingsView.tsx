import React, { useState } from 'react';
import { downloadFrontendZip } from '../utils/exportProject';

export const SettingsView: React.FC = () => {
  const [confidenceCutoff, setConfidenceCutoff] = useState(0.85);
  const [selectedModel, setSelectedModel] = useState('AssemblyNet-YOLOv8x-Industrial');
  const [frameSkipRate, setFrameSkipRate] = useState(2);
  const [soundAlerts, setSoundAlerts] = useState(true);
  const [autoHaltOnBypass, setAutoHaltOnBypass] = useState(true);
  const [webhookUrl, setWebhookUrl] = useState('https://factory-mqtt.internal/assembly/v1/alerts');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState<string | null>(null);

  const handleDownloadZip = async () => {
    try {
      setIsExporting(true);
      const count = await downloadFrontendZip();
      setExportSuccess(`Successfully bundled ${count} frontend source files into .ZIP archive!`);
      setTimeout(() => setExportSuccess(null), 5000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {/* Title Header */}
      <div className="bg-[#1e2023] p-4 rounded-lg border border-[#414755] flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-[#e2e2e6] flex items-center gap-2">
            <span className="material-symbols-outlined text-[#adc6ff]">settings</span>
            AssemblyGuard AI Supervision Settings
          </h2>
          <p className="text-xs text-[#c1c6d7] mt-0.5">
            Configure neural inference parameters, RTSP camera streams, and industrial halt triggers.
          </p>
        </div>
      </div>

      {savedSuccess && (
        <div className="bg-[#00daf3]/15 border border-[#00daf3] p-3 rounded-lg text-xs font-mono text-[#00daf3] flex items-center gap-2 animate-fadeIn">
          <span className="material-symbols-outlined text-base">check_circle</span>
          <span>System parameters updated and synchronized with Edge AI Compute Nodes!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-4">
        {/* Model & Inference Settings */}
        <div className="bg-[#1e2023] p-5 rounded-lg border border-[#414755] space-y-4">
          <h3 className="text-sm font-bold text-[#e2e2e6] font-mono flex items-center gap-2 border-b border-[#414755] pb-2">
            <span className="material-symbols-outlined text-[#00daf3]">memory</span>
            NEURAL NETWORK INFERENCE CONFIGURATION
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-[#c1c6d7] mb-1">SELECTED AI MODEL</label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full bg-[#111316] border border-[#414755] rounded px-3 py-2 text-xs text-[#e2e2e6] focus:border-[#adc6ff] focus:outline-none"
              >
                <option value="AssemblyNet-YOLOv8x-Industrial">AssemblyNet-YOLOv8x-Industrial (Default)</option>
                <option value="AssemblyNet-v3-TensorRT">AssemblyNet-v3-TensorRT (Ultra Low Latency)</option>
                <option value="YOLOv11-EngineQA-FP16">YOLOv11-EngineQA-FP16 (High Precision)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono text-[#c1c6d7] mb-1">
                MINIMUM CONFIDENCE THRESHOLD: <span className="text-[#00daf3]">{(confidenceCutoff * 100).toFixed(0)}%</span>
              </label>
              <input
                type="range"
                min="0.50"
                max="0.98"
                step="0.01"
                value={confidenceCutoff}
                onChange={(e) => setConfidenceCutoff(parseFloat(e.target.value))}
                className="w-full accent-[#00daf3] cursor-pointer mt-2"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-[#c1c6d7] mb-1">FRAME SKIP RATE (FPS RATIO)</label>
            <input
              type="number"
              min="1"
              max="10"
              value={frameSkipRate}
              onChange={(e) => setFrameSkipRate(parseInt(e.target.value, 10))}
              className="w-full bg-[#111316] border border-[#414755] rounded px-3 py-2 text-xs text-[#e2e2e6] font-mono focus:border-[#adc6ff] focus:outline-none"
            />
            <p className="text-[10px] text-[#8b90a0] mt-1 font-mono">
              Process 1 out of every {frameSkipRate} camera frames to optimize GPU compute utilization.
            </p>
          </div>
        </div>

        {/* Safety & Halt Rules */}
        <div className="bg-[#1e2023] p-5 rounded-lg border border-[#414755] space-y-4">
          <h3 className="text-sm font-bold text-[#e2e2e6] font-mono flex items-center gap-2 border-b border-[#414755] pb-2">
            <span className="material-symbols-outlined text-[#ffb4ab]">security</span>
            HALT TRIGGERS & INDUSTRIAL ALERTS
          </h3>

          <div className="space-y-3 text-xs font-mono text-[#c1c6d7]">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={autoHaltOnBypass}
                onChange={(e) => setAutoHaltOnBypass(e.target.checked)}
                className="w-4 h-4 accent-[#00daf3] rounded"
              />
              <span>AUTO-HALT CONVEYOR LINE ON UNVERIFIED TORQUE BYPASS</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={soundAlerts}
                onChange={(e) => setSoundAlerts(e.target.checked)}
                className="w-4 h-4 accent-[#00daf3] rounded"
              />
              <span>ENABLE AUDIBLE SAFETY BUZZER ON OPERATOR HUD</span>
            </label>
          </div>

          <div>
            <label className="block text-xs font-mono text-[#c1c6d7] mb-1">FACTORY MQTT / WEBHOOK ALERT ENDPOINT</label>
            <input
              type="text"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              className="w-full bg-[#111316] border border-[#414755] rounded px-3 py-2 text-xs text-[#e2e2e6] font-mono focus:border-[#00daf3] focus:outline-none"
            />
          </div>
        </div>

        {/* Source Code ZIP Export Card */}
        <div className="bg-[#1e2023] p-5 rounded-lg border border-[#00daf3]/50 space-y-3 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#414755] pb-3">
            <div>
              <h3 className="text-sm font-bold text-[#e2e2e6] font-mono flex items-center gap-2">
                <span className="material-symbols-outlined text-[#00daf3]">folder_zip</span>
                DOWNLOAD FRONTEND CODEBASE (.ZIP)
              </h3>
              <p className="text-xs text-[#c1c6d7] mt-0.5">
                Download the complete React + Vite + Tailwind CSS frontend source files bundled into a single ZIP archive.
              </p>
            </div>

            <button
              type="button"
              onClick={handleDownloadZip}
              disabled={isExporting}
              className="px-4 py-2 bg-[#00daf3] hover:bg-[#9cf0ff] text-[#001f24] font-mono text-xs font-bold rounded flex items-center gap-2 shadow-lg transition-all cursor-pointer disabled:opacity-50 self-start sm:self-auto"
            >
              <span className="material-symbols-outlined text-base">download</span>
              <span>{isExporting ? 'PACKAGING ZIP...' : 'DOWNLOAD CODE (.ZIP)'}</span>
            </button>
          </div>

          {exportSuccess && (
            <div className="bg-[#00daf3]/20 border border-[#00daf3] text-[#00daf3] p-2.5 rounded text-xs font-mono flex items-center gap-2 animate-fadeIn">
              <span className="material-symbols-outlined text-base">check_circle</span>
              <span>{exportSuccess}</span>
            </div>
          )}

          <div className="bg-[#111316] p-3 rounded text-[11px] font-mono text-[#8b90a0] space-y-1">
            <p className="text-[#adc6ff] font-bold">Includes:</p>
            <p>• Full TypeScript React source tree (<code className="text-[#e2e2e6]">/src/App.tsx</code>, components, mock data, types)</p>
            <p>• Build configs (<code className="text-[#e2e2e6]">package.json</code>, <code className="text-[#e2e2e6]">vite.config.ts</code>, <code className="text-[#e2e2e6]">tsconfig.json</code>, Tailwind CSS)</p>
            <p>• Quick setup guide (<code className="text-[#e2e2e6]">README.md</code>)</p>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-6 py-2.5 rounded text-xs font-bold bg-[#adc6ff] text-[#002e69] hover:bg-[#d8e2ff] transition-all shadow-lg cursor-pointer"
          >
            SAVE CONFIGURATION
          </button>
        </div>
      </form>
    </div>
  );
};
