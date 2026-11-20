import React, { useState } from 'react';

interface AISnapshotModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
}

export const AISnapshotModal: React.FC<AISnapshotModalProps> = ({
  isOpen,
  onClose,
  imageUrl
}) => {
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<{
    status: 'PASS' | 'VIOLATION' | 'WARNING';
    confidence: number;
    detectedParts: string[];
    observations: string[];
    suggestedAction: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleRunAnalysis = () => {
    setAnalyzing(true);
    setTimeout(() => {
      setAnalyzing(false);
      setAnalysisResult({
        status: 'VIOLATION',
        confidence: 0.942,
        detectedParts: [
          'CYLINDER_HEAD (Conf: 0.94)',
          'VALVE_ASSEMBLY (Conf: 0.88)',
          'BOLT_CLUSTER_B4 (Conf: 0.72 - Unverfied Torque)'
        ],
        observations: [
          'Cylinder head seating verified within 0.05mm tolerance.',
          'Piston ring gap orientation compliant with standard specs.',
          'CRITICAL: Torque wrench engagement missing on Bolt Cluster B4 during Step 03.'
        ],
        suggestedAction: 'Halt line sequence for 45s. Request operator manual torque check on Bolt Cluster B4 with calibrated electronic wrench.'
      });
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
      <div className="bg-[#1e2023] border border-[#00daf3] rounded-xl w-full max-w-2xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-[#414755] flex justify-between items-center bg-[#282a2d]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#00daf3]">auto_awesome</span>
            <h3 className="font-bold text-[#e2e2e6] text-base font-mono">
              AssemblyGuard AI - Vision Defect Inspection
            </h3>
          </div>
          <button onClick={onClose} className="text-[#c1c6d7] hover:text-white font-bold text-lg">
            ✕
          </button>
        </div>

        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Snapshot Preview */}
          <div className="space-y-2">
            <p className="text-xs font-mono text-[#c1c6d7]">INSPECTED FRAME SNAPSHOT</p>
            <div className="rounded-lg overflow-hidden border border-[#414755] bg-black h-56 relative">
              <img src={imageUrl} alt="Inspected frame" className="w-full h-full object-cover" />
              <div className="absolute top-2 left-2 bg-[#00daf3] text-[#001f24] font-mono text-[10px] font-bold px-1.5 py-0.5 rounded">
                YOLOv8 HIGH-RES
              </div>
            </div>
            {!analysisResult && !analyzing && (
              <button
                onClick={handleRunAnalysis}
                className="w-full py-2 bg-[#00daf3] text-[#001f24] font-bold text-xs rounded hover:bg-[#9cf0ff] transition-all flex items-center justify-center gap-1.5 shadow-md"
              >
                <span className="material-symbols-outlined text-[16px]">play_circle</span>
                EXECUTE AI VISION BREAKDOWN
              </button>
            )}
          </div>

          {/* Analysis Results Pane */}
          <div className="flex flex-col justify-between">
            {analyzing ? (
              <div className="h-full flex flex-col items-center justify-center space-y-3 py-8 text-center">
                <div className="w-8 h-8 border-3 border-[#00daf3] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs text-[#00daf3] font-mono animate-pulse">
                  Running Neural Network Assembly Verification...
                </p>
              </div>
            ) : analysisResult ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-[#414755]">
                  <span className="text-xs text-[#c1c6d7] font-mono">INSPECTION STATUS:</span>
                  <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-[#93000a] text-[#ffb4ab] border border-[#ffb4ab]/40">
                    {analysisResult.status} (94.2%)
                  </span>
                </div>

                <div>
                  <p className="text-[11px] font-mono text-[#adc6ff] font-bold mb-1">DETECTED COMPONENTS:</p>
                  <ul className="text-xs text-[#e2e2e6] font-mono space-y-1">
                    {analysisResult.detectedParts.map((part, i) => (
                      <li key={i} className="flex items-center gap-1">
                        <span className="text-[#00daf3]">•</span>
                        <span>{part}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <p className="text-[11px] font-mono text-[#ffb4ab] font-bold mb-1">AI FINDINGS & DEVIATIONS:</p>
                  <ul className="text-[11px] text-[#ffdad6] space-y-1 bg-[#93000a]/15 p-2 rounded border border-[#ffb4ab]/30">
                    {analysisResult.observations.map((obs, i) => (
                      <li key={i}>- {obs}</li>
                    ))}
                  </ul>
                </div>

                <div className="pt-2 border-t border-[#414755]">
                  <p className="text-[11px] font-mono text-[#00daf3] font-bold">RECOMMENDED ACTION:</p>
                  <p className="text-xs text-[#e2e2e6] mt-0.5">{analysisResult.suggestedAction}</p>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-4 text-center border border-dashed border-[#414755] rounded-lg">
                <span className="material-symbols-outlined text-3xl text-[#8b90a0] mb-2">find_in_page</span>
                <p className="text-xs text-[#c1c6d7] font-mono">
                  Click 'EXECUTE AI VISION BREAKDOWN' to perform real-time component detection and torque compliance validation.
                </p>
              </div>
            )}

            <div className="pt-3 flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-1.5 rounded text-xs font-bold bg-[#333538] text-[#e2e2e6] hover:bg-[#414755]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
