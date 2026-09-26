export type AgentType = 'red_default' | 'red_advance' | 'blue_guard';

export type GateStatus = 'idle' | 'checking' | 'passed' | 'blocked' | 'redacted';

export interface GateInfo {
  id: number;
  name: string;
  description: string;
  status: GateStatus;
  detail?: string;
}

export interface AttackPreset {
  id: string;
  name: string;
  technique: string;
  severity: 'Medium' | 'High' | 'Critical';
  prompt: string;
  description: string;
  targetSecret: 'admin_password' | 'api_key' | 'db_host';
}

export interface SafePreset {
  id: string;
  name: string;
  topic: string;
  prompt: string;
}

export interface RoundResult {
  round: number;
  timestamp: string;
  attacker: AgentType;
  prompt: string;
  gates: GateInfo[];
  response: string;
  winner: 'RED' | 'BLUE' | 'DRAW';
  pointsAwarded: number;
  reason: string;
  leakedSecret?: string;
  redactedPii?: string[];
  latencyMs: number;
}

export interface BattleState {
  round: number;
  maxRounds: number;
  redScore: number;
  blueScore: number;
  vaultHp: number; // 0 - 100
  isBattling: boolean;
  isAutoPlaying: boolean;
  selectedAgent: AgentType;
  lastVerdict?: {
    winner: 'RED' | 'BLUE' | 'DRAW';
    title: string;
    points: number;
    description: string;
  };
  history: RoundResult[];
}
