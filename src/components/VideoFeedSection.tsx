import React, { useState, useRef, useEffect } from 'react';
import { BoundingBox, CameraFeed, ViolationLog } from '../types';

interface VideoFeedSectionProps {
  currentFeed: CameraFeed;
  allFeeds: CameraFeed[];
  onSelectFeed: (feedId: string) => void;
  onOpenUploadModal: () => void;
  onAnalyzeSnapshot: (imageUrl: string) => void;
  onEmitViolationLog?: (log: ViolationLog) => void;
  onBoxClick?: (box: BoundingBox) => void;
}

export const VideoFeedSection: React.FC<VideoFeedSectionProps> = ({
  currentFeed,
  allFeeds,
  onSelectFeed,
  onOpenUploadModal,
  onAnalyzeSnapshot,
  onEmitViolationLog,
  onBoxClick
}) => {
  // Mode: 'stream' (Live Camera) or 'processing' (Video Upload & AI Processing Window)
  const [viewMode, setViewMode] = useState<'stream' | 'processing'>('processing');

  // Video Processing State
  const [videoSourceUrl, setVideoSourceUrl] = useState<string | null>(null);
  const [videoName, setVideoName] = useState<string>('Engine_Assembly_Line_A_Cell4.mp4');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [currentFrame, setCurrentFrame] = useState<number>(1);
  const [totalFrames] = useState<number>(600);
  const [processingConfidence, setProcessingConfidence] = useState<number>(94.8);
  const [processingStatus, setProcessingStatus] = useState<'IDLE' | 'ANALYZING' | 'COMPLETED'>('IDLE');

  // Overlays
  const [showCrosshairs, setShowCrosshairs] = useState(true);
  const [showBoundingBoxes, setShowBoundingBoxes] = useState(true);
  const [showScanLaser, setShowScanLaser] = useState(true);
  const [selectedBox, setSelectedBox] = useState<BoundingBox | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dynamic Bounding Boxes for Video Processing Window
  const [processingBoxes, setProcessingBoxes] = useState<BoundingBox[]>([
    {
      id: 'pbox-1',
      label: 'CYLINDER_HEAD',
      confidence: 0.96,
      x: 28,
      y: 22,
      width: 18,
      height: 28,
      color: '#00daf3',
      status: 'normal',
      details: 'Cylinder head alignment 4-pin orientation verified.'
    },
    {
      id: 'pbox-2',
      label: 'VALVE_ASSEMBLY',
      confidence: 0.91,
      x: 46,
      y: 42,
      width: 14,
      height: 20,
      color: '#adc6ff',
      status: 'normal',
      details: 'Intake valve seated. Hydraulic pressure check active.'
    },
    {
      id: 'pbox-3',
      label: 'BOLT_CLUSTER_B4',
      confidence: 0.74,
      x: 62,
      y: 30,
      width: 16,
      height: 22,
      color: '#ffb4ab',
      status: 'warning',
      details: 'Torque check pending. Requires 85Nm confirmation.'
    }
  ]);

  // Sample Preset Industrial Clips
  const PRESET_VIDEOS = [
    {
      name: 'Engine Assembly Line A (Standard)',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      poster: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD9pBI6ISfwyZVpsWUYnfaaawrCP0ZFHBk6GA1Z2JHH2Kh-JTurDMJERrt1srNf2tKesEm0cRlPcnDgl_ttbx0rjps6niG9nxjQss9WKnn8xUvM-MAPI87Kp4xqLRvIlQdsy2bRSrbirpEU_OGOG3HuYxg-9jy11QkEXVw16bqJicc4pVIGAf3_AWthyXbWrfadEDLZLDPDEuRqjuL0AuAv7emXXPqKmX3RYGatpIhAoKl3AQLDnRjemQ'
    },
    {
      name: 'Gearbox & Transmission Station',
      url: '',
      poster: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1600&q=80'
    },
    {
      name: 'High Precision QA Laser Bay',
      url: '',
      poster: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1600&q=80'
    }
  ];

  // Simulated Frame processing loop and real-time violation emission
  useEffect(() => {
    if (!isProcessing || isPaused) return;

    const interval = setInterval(() => {
      setCurrentFrame((prev) => {
        const next = prev + 1;
        if (next >= totalFrames) {
          setIsProcessing(false);
          setProcessingStatus('COMPLETED');
          return totalFrames;
        }

        // Emit real-time violations at specific frame milestones
        if (next === 120 && onEmitViolationLog) {
          onEmitViolationLog({
            id: `viol-${Date.now()}`,
            code: 'ERR_SEQ_SKIPPED',
            timestamp: new Date().toLocaleTimeString(),
            timeMinus: 'T-Minus 00:01:40',
            type: 'error',
            title: 'Torque verification bypassed',
            description: 'Torque wrench engagement missing on Bolt Cluster B4 during Frame 120.',
            resolved: false,
            operatorId: 'Operator 724'
          });
        }

        if (next === 280 && onEmitViolationLog) {
          onEmitViolationLog({
            id: `viol-${Date.now()}`,
            code: 'WARN_GAP_TOLERANCE',
            timestamp: new Date().toLocaleTimeString(),
            timeMinus: 'T-Minus 00:00:55',
            type: 'warning',
            title: 'Optical Gap Offset 0.14mm',
            description: 'Perimeter gasket gap variance detected on cylinder head during Frame 280.',
            resolved: false,
            operatorId: 'Operator 724'
          });
        }

        // Slight jitter on bounding box coordinates for dynamic vision feel
        setProcessingBoxes((boxes) =>
          boxes.map((box) => ({
            ...box,
            x: Math.min(80, Math.max(10, box.x + (Math.random() - 0.5) * 0.4)),
            y: Math.min(80, Math.max(10, box.y + (Math.random() - 0.5) * 0.4)),
            confidence: Math.min(0.99, Math.max(0.80, Number((box.confidence + (Math.random() - 0.5) * 0.01).toFixed(2))))
          }))
        );

        setProcessingConfidence(Number((94.0 + Math.random() * 2.5).toFixed(1)));

        return next;
      });
    }, 100 / playbackSpeed);

    return () => clearInterval(interval);
  }, [isProcessing, isPaused, totalFrames, playbackSpeed, onEmitViolationLog]);

  // File Input Handler for Upload Window
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setVideoSourceUrl(url);
      setVideoName(file.name);
      setCurrentFrame(1);
      setIsProcessing(true);
      setProcessingStatus('ANALYZING');
      setIsPaused(false);
    }
  };

  const handleSelectPresetVideo = (preset: typeof PRESET_VIDEOS[0]) => {
    setVideoName(preset.name);
    setVideoSourceUrl(preset.poster); // Using high-res snapshot or video stream
    setCurrentFrame(1);
    setIsProcessing(true);
    setProcessingStatus('ANALYZING');
    setIsPaused(false);
  };

  const handleStartProcessing = () => {
    setIsProcessing(true);
    setProcessingStatus('ANALYZING');
    setIsPaused(false);
  };

  const handleBoxClick = (box: BoundingBox) => {
    setSelectedBox(box);
    if (onBoxClick) onBoxClick(box);
  };

  const currentDisplayBoxes = viewMode === 'processing' ? processingBoxes : currentFeed.boundingBoxes;
  const currentImageOrVideoUrl = viewMode === 'processing'
    ? (videoSourceUrl || currentFeed.imageUrl)
    : currentFeed.imageUrl;

  return (
    <div className="bg-[#1a1c1f] rounded-lg border border-[#414755] overflow-hidden relative shadow-xl h-[614px] min-h-[420px] flex flex-col">
      {/* Top Header Mode Switcher Bar */}
      <div className="bg-[#282a2d] px-4 py-2 border-b border-[#414755] flex flex-wrap justify-between items-center z-20">
        <div className="flex items-center gap-2">
          {/* View Mode Toggle Tabs */}
          <div className="flex bg-[#111316] p-0.5 rounded border border-[#414755]">
            <button
              onClick={() => setViewMode('processing')}
              className={`px-3 py-1 rounded text-xs font-mono font-bold flex items-center gap-1.5 transition-all ${
                viewMode === 'processing'
                  ? 'bg-[#00daf3] text-[#001f24] shadow-md'
                  : 'text-[#c1c6d7] hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">video_settings</span>
              <span>VIDEO PROCESSING WINDOW</span>
            </button>
            <button
              onClick={() => setViewMode('stream')}
              className={`px-3 py-1 rounded text-xs font-mono font-bold flex items-center gap-1.5 transition-all ${
                viewMode === 'stream'
                  ? 'bg-[#adc6ff] text-[#002e69] shadow-md'
                  : 'text-[#c1c6d7] hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">videocam</span>
              <span>LIVE CAMERA STREAM</span>
            </button>
          </div>

          <span className="text-[11px] font-mono text-[#00daf3] hidden md:inline ml-2 font-semibold">
            {viewMode === 'processing' ? `[FILE: ${videoName}]` : `[FEED: ${currentFeed.name}]`}
          </span>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2">
          {viewMode === 'stream' ? (
            <select
              value={currentFeed.id}
              onChange={(e) => onSelectFeed(e.target.value)}
              className="bg-[#111316] px-3 py-1 rounded border border-[#414755] text-xs text-[#e2e2e6] focus:outline-none focus:border-[#adc6ff] cursor-pointer"
            >
              {allFeeds.map((feed) => (
                <option key={feed.id} value={feed.id} className="bg-[#1e2023] text-[#e2e2e6]">
                  {feed.name}
                </option>
              ))}
            </select>
          ) : (
            <div className="flex gap-1.5">
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*,image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-[#00daf3]/20 border border-[#00daf3] hover:bg-[#00daf3]/30 text-[#00daf3] px-3 py-1 rounded text-xs font-mono font-bold flex items-center gap-1 transition-all cursor-pointer"
                title="Upload custom video file for processing"
              >
                <span className="material-symbols-outlined text-[16px]">cloud_upload</span>
                <span>UPLOAD VIDEO FILE</span>
              </button>
            </div>
          )}

          <div className="bg-[#111316] px-2.5 py-1 rounded border border-[#414755] flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                isProcessing || !isPaused ? 'bg-[#00daf3] pulse-dot' : 'bg-amber-400'
              }`}
            ></span>
            <span className="font-mono text-[10px] text-[#e2e2e6] font-bold uppercase">
              {viewMode === 'processing'
                ? isProcessing
                  ? 'AI PROCESSING ACTIVE'
                  : 'PROCESSING IDLE'
                : 'LIVE STREAM'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Video Processing Stage */}
      <div className="flex-1 bg-black relative w-full h-full overflow-hidden select-none bg-cover bg-center">
        {/* If in Video Processing Mode and no video uploaded yet, show prominent dropzone prompt */}
        {viewMode === 'processing' && !videoSourceUrl && (
          <div className="absolute inset-0 z-30 bg-[#111316]/95 flex flex-col items-center justify-center p-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#00daf3]/10 border-2 border-[#00daf3] flex items-center justify-center animate-bounce">
              <span className="material-symbols-outlined text-3xl text-[#00daf3]">video_file</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#e2e2e6] font-mono">
                Upload Engine Assembly Inspection Video
              </h3>
              <p className="text-xs text-[#c1c6d7] max-w-md mt-1">
                Select an MP4/WEBM recording or snapshot to run AssemblyGuard AI neural vision defect detection and stream real-time violations into the log below.
              </p>
            </div>

            {/* Drag & Drop Upload Trigger */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-full max-w-md p-6 border-2 border-dashed border-[#00daf3]/60 rounded-xl bg-[#1e2023]/60 hover:bg-[#00daf3]/10 hover:border-[#00daf3] transition-all cursor-pointer flex flex-col items-center gap-2"
            >
              <span className="material-symbols-outlined text-4xl text-[#00daf3]">upload</span>
              <span className="text-xs font-mono font-bold text-[#e2e2e6]">
                Click or Drop Inspection Video File Here (.MP4, .MOV, .WEBM)
              </span>
              <span className="text-[10px] text-[#8b90a0]">Maximum file size: 500 MB • GPU Accelerated</span>
            </div>

            {/* Presets */}
            <div className="pt-2">
              <p className="text-xs font-mono text-[#c1c6d7] mb-2">OR PROCESS INDUSTRIAL PRESET SAMPLE CLIPS:</p>
              <div className="flex flex-wrap justify-center gap-2">
                {PRESET_VIDEOS.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectPresetVideo(preset)}
                    className="px-3 py-1.5 bg-[#282a2d] hover:bg-[#333538] border border-[#414755] hover:border-[#00daf3] rounded text-xs font-mono text-[#00daf3] transition-all cursor-pointer"
                  >
                    ▶ {preset.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Video Canvas Background */}
        <div
          className="w-full h-full bg-cover bg-center transition-all duration-300"
          style={{ backgroundImage: `url('${currentImageOrVideoUrl}')` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 pointer-events-none"></div>
        </div>

        {/* Laser Scanner Line Effect */}
        {showScanLaser && (isProcessing || viewMode === 'processing') && (
          <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#00daf3] to-transparent shadow-[0_0_15px_#00daf3] animate-pulse pointer-events-none top-1/3"></div>
        )}

        {/* Bounding Boxes Overlay */}
        {showBoundingBoxes &&
          currentDisplayBoxes.map((box) => {
            const isSelected = selectedBox?.id === box.id;
            return (
              <div
                key={box.id}
                onClick={() => handleBoxClick(box)}
                style={{
                  top: `${box.y}%`,
                  left: `${box.x}%`,
                  width: `${box.width}%`,
                  height: `${box.height}%`,
                  borderColor: box.color,
                  backgroundColor: `${box.color}18`
                }}
                className={`absolute border-2 flex items-start justify-start p-1 transition-all duration-300 cursor-pointer group hover:scale-[1.02] ${
                  isSelected ? 'ring-2 ring-white shadow-[0_0_20px_rgba(0,218,243,0.8)]' : ''
                }`}
              >
                <span
                  style={{ backgroundColor: box.color }}
                  className="text-[#001f24] font-data-label text-[10px] px-1 font-bold rounded-sm shadow-md flex items-center gap-1"
                >
                  {box.label} {(box.confidence).toFixed(2)}
                </span>

                {/* Hover Tooltip */}
                <div className="absolute top-full left-0 mt-1 bg-[#1e2023] border border-[#414755] text-[11px] text-[#e2e2e6] p-2 rounded shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none w-52 z-30">
                  <p className="font-bold text-[#00daf3] font-mono">{box.label}</p>
                  <p className="text-[10px] text-[#c1c6d7] mt-0.5">{box.details || 'Component detected & verified.'}</p>
                  <p className="text-[9px] text-[#adc6ff] mt-1 font-mono">Conf: {(box.confidence * 100).toFixed(1)}%</p>
                </div>
              </div>
            );
          })}

        {/* Crosshair Grid Overlay */}
        {showCrosshairs && (
          <div className="absolute inset-0 pointer-events-none opacity-20">
            <div className="absolute top-1/2 left-0 w-full h-[1px] bg-[#00daf3]"></div>
            <div className="absolute top-0 left-1/2 w-[1px] h-full bg-[#00daf3]"></div>
            <div className="absolute top-1/4 left-0 w-full h-[1px] bg-[#00daf3]/40"></div>
            <div className="absolute top-3/4 left-0 w-full h-[1px] bg-[#00daf3]/40"></div>
            <div className="absolute top-0 left-1/4 w-[1px] h-full bg-[#00daf3]/40"></div>
            <div className="absolute top-0 left-3/4 w-[1px] h-full bg-[#00daf3]/40"></div>
          </div>
        )}

        {/* Selected Box Details Card */}
        {selectedBox && (
          <div className="absolute top-4 left-4 z-30 bg-[#1e2023]/95 border border-[#00daf3] p-3 rounded shadow-2xl max-w-xs text-xs">
            <div className="flex justify-between items-center mb-1">
              <span className="font-bold text-[#00daf3] font-mono">{selectedBox.label}</span>
              <button
                onClick={() => setSelectedBox(null)}
                className="text-[#c1c6d7] hover:text-white text-sm px-1 font-bold"
              >
                ✕
              </button>
            </div>
            <p className="text-[#e2e2e6] text-[11px] mb-1">{selectedBox.details}</p>
            <div className="flex justify-between text-[10px] text-[#c1c6d7] font-mono pt-1 border-t border-[#414755]">
              <span>Confidence: {(selectedBox.confidence * 100).toFixed(1)}%</span>
              <span className="text-[#adc6ff]">Status: {selectedBox.status.toUpperCase()}</span>
            </div>
          </div>
        )}

        {/* Real-time Video Processing Telemetry Overlay HUD */}
        {viewMode === 'processing' && (
          <div className="absolute top-4 right-4 z-20 glass-panel border border-[#414755] p-2.5 rounded-lg text-xs font-mono space-y-1 w-60 shadow-xl">
            <div className="flex justify-between border-b border-[#414755] pb-1">
              <span className="text-[#c1c6d7]">AI MODEL:</span>
              <span className="text-[#00daf3] font-bold">YOLOv8x-Industrial</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#c1c6d7]">FRAME:</span>
              <span className="text-[#e2e2e6]">{currentFrame} / {totalFrames}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#c1c6d7]">CONFIDENCE:</span>
              <span className="text-[#00daf3]">{processingConfidence.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#c1c6d7]">LATENCY:</span>
              <span className="text-[#adc6ff]">11.4 ms</span>
            </div>

            {/* Frame Progress Bar */}
            <div className="w-full bg-[#111316] h-1.5 rounded-full overflow-hidden mt-1 border border-[#414755]">
              <div
                style={{ width: `${(currentFrame / totalFrames) * 100}%` }}
                className="bg-[#00daf3] h-full shadow-[0_0_8px_#00daf3]"
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* Video Processing Controls Scrubber Bar (Bottom) */}
      <div className="bg-[#1e2023] border-t border-[#414755] p-2.5 px-4 flex flex-wrap items-center justify-between gap-2 z-20">
        <div className="flex items-center gap-2">
          {/* Play/Pause Button */}
          <button
            onClick={() => {
              if (viewMode === 'processing') {
                if (!isProcessing) handleStartProcessing();
                else setIsPaused(!isPaused);
              } else {
                setIsPaused(!isPaused);
              }
            }}
            className="px-3 py-1 bg-[#00daf3] text-[#001f24] font-bold rounded text-xs hover:bg-[#9cf0ff] transition-all flex items-center gap-1 cursor-pointer shadow"
          >
            <span className="material-symbols-outlined text-[16px]">
              {isPaused || (!isProcessing && viewMode === 'processing') ? 'play_arrow' : 'pause'}
            </span>
            <span>
              {isPaused || (!isProcessing && viewMode === 'processing') ? 'PLAY / PROCESS' : 'PAUSE'}
            </span>
          </button>

          {/* Speed Toggle */}
          {viewMode === 'processing' && (
            <div className="flex bg-[#111316] rounded border border-[#414755] text-[11px] font-mono">
              {[0.5, 1, 2].map((spd) => (
                <button
                  key={spd}
                  onClick={() => setPlaybackSpeed(spd)}
                  className={`px-2 py-0.5 ${
                    playbackSpeed === spd ? 'bg-[#adc6ff] text-[#002e69] font-bold' : 'text-[#c1c6d7]'
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>
          )}

          {/* Scrubber Frame Slider */}
          {viewMode === 'processing' && (
            <div className="flex items-center gap-2 min-w-[180px] sm:min-w-[260px]">
              <span className="text-[10px] font-mono text-[#c1c6d7]">F:{currentFrame}</span>
              <input
                type="range"
                min={1}
                max={totalFrames}
                value={currentFrame}
                onChange={(e) => {
                  setCurrentFrame(parseInt(e.target.value, 10));
                  setIsProcessing(true);
                }}
                className="w-full accent-[#00daf3] cursor-pointer"
              />
            </div>
          )}
        </div>

        {/* Overlay Toggle Tools */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowCrosshairs(!showCrosshairs)}
            className={`px-2 py-1 rounded border text-xs font-mono transition-all flex items-center gap-1 ${
              showCrosshairs ? 'border-[#00daf3] text-[#00daf3] bg-[#00daf3]/10' : 'border-[#414755] text-[#8b90a0]'
            }`}
            title="Toggle Grid Overlay"
          >
            <span className="material-symbols-outlined text-[14px]">grid_4x4</span>
            <span className="hidden sm:inline">GRID</span>
          </button>

          <button
            onClick={() => setShowBoundingBoxes(!showBoundingBoxes)}
            className={`px-2 py-1 rounded border text-xs font-mono transition-all flex items-center gap-1 ${
              showBoundingBoxes ? 'border-[#adc6ff] text-[#adc6ff] bg-[#adc6ff]/10' : 'border-[#414755] text-[#8b90a0]'
            }`}
            title="Toggle AI Bounding Boxes"
          >
            <span className="material-symbols-outlined text-[14px]">crop_free</span>
            <span className="hidden sm:inline">BOXES</span>
          </button>

          <button
            onClick={() => onAnalyzeSnapshot(currentImageOrVideoUrl)}
            className="px-2.5 py-1 rounded border border-[#00daf3] bg-[#00daf3]/15 text-[#00daf3] text-xs font-mono font-bold hover:bg-[#00daf3]/25 transition-all flex items-center gap-1 cursor-pointer"
            title="Run AI Vision Defect Inspection on Current Frame"
          >
            <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
            <span>AI INSPECT</span>
          </button>
        </div>
      </div>
    </div>
  );
};
