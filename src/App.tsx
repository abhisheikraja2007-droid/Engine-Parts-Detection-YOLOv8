/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Navigation } from './components/Navigation';
import { Header } from './components/Header';
import { VideoFeedSection } from './components/VideoFeedSection';
import { ViolationLogSection } from './components/ViolationLogSection';
import { TelemetrySection } from './components/TelemetrySection';
import { AssemblyProgressSection } from './components/AssemblyProgressSection';
import { HistoryView } from './components/HistoryView';
import { ReportsView } from './components/ReportsView';
import { SettingsView } from './components/SettingsView';
import { UploadFeedModal } from './components/UploadFeedModal';
import { AISnapshotModal } from './components/AISnapshotModal';

import {
  AssemblyStep,
  CameraFeed,
  NavigationTab,
  TelemetryData,
  ViolationLog
} from './types';

import {
  INITIAL_ASSEMBLY_STEPS,
  INITIAL_CAMERA_FEEDS,
  INITIAL_TELEMETRY,
  INITIAL_VIOLATION_LOGS
} from './data/mockData';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');
  const [feeds, setFeeds] = useState<CameraFeed[]>(INITIAL_CAMERA_FEEDS);
  const [currentFeedId, setCurrentFeedId] = useState<string>('feed-1');
  const [steps, setSteps] = useState<AssemblyStep[]>(INITIAL_ASSEMBLY_STEPS);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(2); // Step 3 in progress
  const [logs, setLogs] = useState<ViolationLog[]>(INITIAL_VIOLATION_LOGS);
  const [telemetry, setTelemetry] = useState<TelemetryData>(INITIAL_TELEMETRY);
  const [systemOnline, setSystemOnline] = useState<boolean>(true);

  // Modals
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isSnapshotModalOpen, setIsSnapshotModalOpen] = useState(false);
  const [snapshotImage, setSnapshotImage] = useState<string>('');

  // Clock string
  const [currentTimeStr, setCurrentTimeStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const currentFeed = feeds.find((f) => f.id === currentFeedId) || feeds[0];

  // FSM Step Handlers
  const handleAdvanceStep = () => {
    if (activeStepIndex < steps.length - 1) {
      const nextIdx = activeStepIndex + 1;
      const updatedSteps = steps.map((step, idx) => {
        if (idx < nextIdx) {
          return { ...step, status: 'completed' as const };
        } else if (idx === nextIdx) {
          return { ...step, status: 'in_progress' as const };
        } else {
          return { ...step, status: 'pending' as const };
        }
      });
      setSteps(updatedSteps);
      setActiveStepIndex(nextIdx);
    }
  };

  const handlePreviousStep = () => {
    if (activeStepIndex > 0) {
      const prevIdx = activeStepIndex - 1;
      const updatedSteps = steps.map((step, idx) => {
        if (idx < prevIdx) {
          return { ...step, status: 'completed' as const };
        } else if (idx === prevIdx) {
          return { ...step, status: 'in_progress' as const };
        } else {
          return { ...step, status: 'pending' as const };
        }
      });
      setSteps(updatedSteps);
      setActiveStepIndex(prevIdx);
    }
  };

  const handleResetSequence = () => {
    const reset = steps.map((step, idx) => ({
      ...step,
      status: idx === 0 ? ('in_progress' as const) : ('pending' as const)
    }));
    setSteps(reset);
    setActiveStepIndex(0);
  };

  const handleTriggerStepError = (stepId: string) => {
    setSteps((prev) =>
      prev.map((s) => (s.id === stepId ? { ...s, status: 'error' as const } : s))
    );
    // Add violation log
    const newLog: ViolationLog = {
      id: `viol-${Date.now()}`,
      code: 'ERR_STEP_FLAGGED',
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      timeMinus: 'T-Minus 00:00:05',
      type: 'error',
      title: 'Manual Step Flagged as Failed',
      description: `Operator manually flagged Step ${steps[activeStepIndex].stepNumber} (${steps[activeStepIndex].name}) as non-compliant.`,
      stepId,
      resolved: false,
      operatorId: 'Operator 724'
    };
    setLogs((prev) => [newLog, ...prev]);
  };

  // Violation Handlers
  const handleAddViolation = (type: 'error' | 'warning' | 'info') => {
    const id = `viol-${Date.now()}`;
    const timestamp = new Date().toLocaleTimeString();

    let newLog: ViolationLog;
    if (type === 'error') {
      newLog = {
        id,
        code: 'ERR_TORQUE_BYPASS',
        timestamp,
        timeMinus: 'T-Minus 00:00:01',
        type: 'error',
        title: 'Torque limit unverified',
        description: 'Automatic torque wrench report missing for bolt cluster B8. Line slowdown triggered.',
        resolved: false,
        operatorId: 'Operator 724'
      };
    } else if (type === 'warning') {
      newLog = {
        id,
        code: 'WARN_ALIGNMENT_SHIFT',
        timestamp,
        timeMinus: 'T-Minus 00:00:03',
        type: 'warning',
        title: 'Component offset warning',
        description: 'Laser profiler registered 0.18mm gap on cylinder head gasket corner.',
        resolved: false,
        operatorId: 'Operator 724'
      };
    } else {
      newLog = {
        id,
        code: 'SYS_CALIBRATION',
        timestamp,
        timeMinus: 'T-Minus 00:00:10',
        type: 'info',
        title: 'System recalibrated',
        description: 'Camera 01 focal auto-alignment updated successfully.',
        resolved: true,
        operatorId: 'Operator 724'
      };
    }

    setLogs((prev) => [newLog, ...prev]);
  };

  const handleResolveViolation = (id: string) => {
    setLogs((prev) =>
      prev.map((log) => (log.id === id ? { ...log, resolved: true } : log))
    );
  };

  const handleClearLogs = () => {
    setLogs((prev) => prev.filter((l) => !l.resolved));
  };

  // Feed Upload Handler
  const handleApplyCustomFeed = (imageUrl: string, feedName: string) => {
    const newFeed: CameraFeed = {
      id: `custom-${Date.now()}`,
      name: feedName,
      line: 'Custom Uploaded Cell',
      imageUrl,
      status: 'LIVE',
      boundingBoxes: [
        {
          id: `box-c1`,
          label: 'INSPECTED_PART',
          confidence: 0.95,
          x: 30,
          y: 25,
          width: 40,
          height: 45,
          color: '#00daf3',
          status: 'normal',
          details: 'Uploaded inspection image scanned successfully.'
        }
      ]
    };
    setFeeds((prev) => [newFeed, ...prev]);
    setCurrentFeedId(newFeed.id);
  };

  // Open Snapshot Analysis Modal
  const handleOpenSnapshot = (imageUrl: string) => {
    setSnapshotImage(imageUrl);
    setIsSnapshotModalOpen(true);
  };

  const unresolvedViolationsCount = logs.filter((l) => !l.resolved && l.type === 'error').length;

  return (
    <div className="min-h-screen bg-[#111316] text-[#e2e2e6] font-sans overflow-x-hidden">
      {/* Side Navigation Bar */}
      <Navigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        operatorName="Operator 724"
      />

      {/* Top App Header */}
      <Header
        systemOnline={systemOnline}
        operatorName="Operator 724"
        unresolvedViolationsCount={unresolvedViolationsCount}
        onOpenNotifications={() => setActiveTab('dashboard')}
        onToggleSystemStatus={() => setSystemOnline(!systemOnline)}
        currentTimeStr={currentTimeStr}
      />

      {/* Main Content Area */}
      <main className="ml-20 mt-16 p-4 min-h-[calc(100vh-4rem)] bg-[#111316]">
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-12 gap-4 h-full">
            {/* Center/Left Column: Video Feed & Real-Time Violation Logs */}
            <div className="col-span-12 xl:col-span-9 flex flex-col gap-4">
              <VideoFeedSection
                currentFeed={currentFeed}
                allFeeds={feeds}
                onSelectFeed={setCurrentFeedId}
                onOpenUploadModal={() => setIsUploadModalOpen(true)}
                onAnalyzeSnapshot={handleOpenSnapshot}
                onEmitViolationLog={(newLog) => setLogs((prev) => [newLog, ...prev])}
              />

              <ViolationLogSection
                logs={logs}
                onAddViolation={handleAddViolation}
                onResolveViolation={handleResolveViolation}
                onClearLogs={handleClearLogs}
              />
            </div>

            {/* Right Column: Telemetry & FSM Progress */}
            <div className="col-span-12 xl:col-span-3 flex flex-col gap-4">
              <TelemetrySection telemetry={telemetry} />

              <AssemblyProgressSection
                steps={steps}
                activeStepId={steps[activeStepIndex]?.id || 'step-3'}
                onAdvanceStep={handleAdvanceStep}
                onPreviousStep={handlePreviousStep}
                onResetSequence={handleResetSequence}
                onTriggerStepError={handleTriggerStepError}
              />
            </div>
          </div>
        )}

        {activeTab === 'history' && <HistoryView />}

        {activeTab === 'reports' && <ReportsView logs={logs} />}

        {activeTab === 'settings' && <SettingsView />}
      </main>

      {/* Modals */}
      <UploadFeedModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onApplyCustomFeed={handleApplyCustomFeed}
      />

      <AISnapshotModal
        isOpen={isSnapshotModalOpen}
        onClose={() => setIsSnapshotModalOpen(false)}
        imageUrl={snapshotImage}
      />
    </div>
  );
}
