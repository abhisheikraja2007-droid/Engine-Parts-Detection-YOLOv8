export type NavigationTab = 'dashboard' | 'history' | 'reports' | 'settings';

export interface BoundingBox {
  id: string;
  label: string;
  confidence: number;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  width: number; // percentage 0-100
  height: number; // percentage 0-100
  color: string;
  status: 'normal' | 'warning' | 'error';
  details?: string;
}

export interface AssemblyStep {
  id: string;
  stepNumber: string;
  name: string;
  status: 'completed' | 'in_progress' | 'pending' | 'error';
  vConf?: number;
  timeSpent?: string;
  details: string;
  requiredComponents: string[];
}

export interface ViolationLog {
  id: string;
  code: string;
  timestamp: string;
  timeMinus: string;
  type: 'error' | 'warning' | 'info';
  title: string;
  description: string;
  stepId?: string;
  resolved: boolean;
  operatorId?: string;
}

export interface TelemetryData {
  confidence: number;
  fps: number;
  latencyMs: number;
  gpuLoad: number;
  activeModel: string;
  systemOnline: boolean;
  cameraName: string;
}

export interface CameraFeed {
  id: string;
  name: string;
  line: string;
  imageUrl: string;
  status: 'LIVE' | 'OFFLINE' | 'RECORDING';
  boundingBoxes: BoundingBox[];
}

export interface HistoricalShiftRun {
  id: string;
  engineSerial: string;
  assemblyLine: string;
  operatorId: string;
  startTime: string;
  endTime: string;
  status: 'PASSED' | 'VIOLATION' | 'IN_PROGRESS';
  violationsCount: number;
  complianceRate: number;
  stepsCompleted: number;
  totalSteps: number;
}
