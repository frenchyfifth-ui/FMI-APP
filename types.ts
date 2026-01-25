export enum SystemMode {
  THINK = 'THINK',
  BUILD = 'BUILD',
  MAINTAIN = 'MAINTAIN',
  HUMAN = 'HUMAN'
}

export interface Artifact {
  id: string;
  title: string;
  description: string;
  timestamp: number;
  mode: SystemMode;
  type: 'CODE' | 'DOC' | 'DECISION' | 'PHYSICAL';
  isExternal: boolean; // Must be observable/external
}

export interface BufferItem {
  id: string;
  source: string;
  content: string;
  domain: 'TIME' | 'BODY' | 'COGNITION' | 'FAMILY' | 'WORK' | 'FINANCE';
  status: 'PENDING' | 'DISTILLED' | 'REJECTED' | 'PROMOTED';
  timestamp: number;
}

export interface SystemState {
  currentMode: SystemMode;
  modeStartTime: number;
  lastArtifactTime: number;
  isStalled: boolean; // > 72h watchdog
}

export interface KernelStats {
  artifactsShipped: number;
  timeInModes: Record<SystemMode, number>;
  longestStreak: number;
}