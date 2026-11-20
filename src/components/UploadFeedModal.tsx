import React, { useState } from 'react';

interface UploadFeedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyCustomFeed: (imageUrl: string, feedName: string) => void;
}

export const UploadFeedModal: React.FC<UploadFeedModalProps> = ({
  isOpen,
  onClose,
  onApplyCustomFeed
}) => {
  const [feedUrl, setFeedUrl] = useState('');
  const [feedName, setFeedName] = useState('Custom Inspection Feed');
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

  if (!isOpen) return null;

  const PRESET_FEEDS = [
    {
      name: 'Engine Assembly Cell 4 (Standard)',
      url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD9pBI6ISfwyZVpsWUYnfaaawrCP0ZFHBk6GA1Z2JHH2Kh-JTurDMJERrt1srNf2tKesEm0cRlPcnDgl_ttbx0rjps6niG9nxjQss9WKnn8xUvM-MAPI87Kp4xqLRvIlQdsy2bRSrbirpEU_OGOG3HuYxg-9jy11QkEXVw16bqJicc4pVIGAf3_AWthyXbWrfadEDLZLDPDEuRqjuL0AuAv7emXXPqKmX3RYGatpIhAoKl3AQLDnRjemQ'
    },
    {
      name: 'Transmission & Gearbox Station',
      url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1600&q=80'
    },
    {
      name: 'High Precision QA Laser Bay',
      url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1600&q=80'
    },
    {
      name: 'Automated Robotics Welding Line',
      url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1600&q=80'
    }
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setFeedUrl(reader.result);
          setFeedName(file.name.replace(/\.[^/.]+$/, ""));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalUrl = feedUrl || selectedPreset || PRESET_FEEDS[0].url;
    onApplyCustomFeed(finalUrl, feedName);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#1e2023] border border-[#414755] rounded-xl w-full max-w-lg overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#414755] flex justify-between items-center bg-[#282a2d]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#00daf3]">upload_file</span>
            <h3 className="font-bold text-[#e2e2e6] text-base">Upload or Select Inspection Camera Feed</h3>
          </div>
          <button onClick={onClose} className="text-[#c1c6d7] hover:text-white font-bold text-lg">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Feed Name */}
          <div>
            <label className="block text-xs font-mono text-[#c1c6d7] mb-1">FEED IDENTIFIER / LINE NAME</label>
            <input
              type="text"
              value={feedName}
              onChange={(e) => setFeedName(e.target.value)}
              className="w-full bg-[#111316] border border-[#414755] rounded px-3 py-2 text-xs text-[#e2e2e6] focus:border-[#adc6ff] focus:outline-none"
              placeholder="e.g. Line A - Cylinder Mounting"
            />
          </div>

          {/* Local File Upload Dropzone */}
          <div>
            <label className="block text-xs font-mono text-[#c1c6d7] mb-1">LOCAL IMAGE / VIDEO FRAME FILE</label>
            <div className="border-2 border-dashed border-[#414755] rounded-lg p-4 text-center hover:border-[#00daf3] transition-colors bg-[#111316]/50 cursor-pointer relative">
              <input
                type="file"
                accept="image/*,video/*"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <span className="material-symbols-outlined text-2xl text-[#00daf3] mb-1">cloud_upload</span>
              <p className="text-xs text-[#e2e2e6] font-semibold">
                Click or drag snapshot image here
              </p>
              <p className="text-[10px] text-[#8b90a0] mt-0.5">Supports PNG, JPG, WEBP or MP4 Frame</p>
            </div>
          </div>

          {/* Direct URL Input */}
          <div>
            <label className="block text-xs font-mono text-[#c1c6d7] mb-1">OR RTSP / HTTPS FEED STREAM URL</label>
            <input
              type="url"
              value={feedUrl}
              onChange={(e) => {
                setFeedUrl(e.target.value);
                setSelectedPreset(null);
              }}
              className="w-full bg-[#111316] border border-[#414755] rounded px-3 py-2 text-xs text-[#e2e2e6] font-mono focus:border-[#00daf3] focus:outline-none"
              placeholder="https://... or rtsp://192.168.1.101/live"
            />
          </div>

          {/* Sample Preset Feeds */}
          <div>
            <label className="block text-xs font-mono text-[#c1c6d7] mb-2">OR CHOOSE INDUSTRIAL PRESET</label>
            <div className="grid grid-cols-2 gap-2">
              {PRESET_FEEDS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setSelectedPreset(preset.url);
                    setFeedUrl('');
                    setFeedName(preset.name);
                  }}
                  className={`p-2 rounded text-left border text-xs transition-all ${
                    selectedPreset === preset.url || feedUrl === preset.url
                      ? 'border-[#00daf3] bg-[#00daf3]/10 text-[#00daf3] font-semibold'
                      : 'border-[#414755] bg-[#111316] text-[#c1c6d7] hover:border-[#adc6ff]'
                  }`}
                >
                  <p className="truncate font-mono">{preset.name}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="pt-3 border-t border-[#414755] flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded text-xs font-semibold text-[#c1c6d7] hover:bg-[#333538]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded text-xs font-bold bg-[#00daf3] text-[#001f24] hover:bg-[#9cf0ff] transition-all shadow-md"
            >
              Apply Feed
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
