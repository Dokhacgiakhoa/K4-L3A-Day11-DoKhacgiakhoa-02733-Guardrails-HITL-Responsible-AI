export type AgentType = 'red_default' | 'red_advance' | 'blue_guard';

export type GateStatus = 'idle' | 'checking' | 'passed' | 'blocked' | 'redacted' | 'skipped';

export type BattleStep =
  | 'idle'
  | 'waiting'            // Đang chờ backend/LLM thật phân tích (thời gian không cố định)
  | 'step1_attack'       // Bước 1: Red chuẩn bị & phóng Prompt Injection (1s)
  | 'step2_input_guard'  // Bước 2: Blue quét Rate Limit & Input Guardrail (1s)
  | 'step3_llm'          // Bước 3: Mô hình LLM suy luận (1s)
  | 'step4_output_guard' // Bước 4: Blue quét Output Guardrail & Che giấu PII/Secret (1s)
  | 'step5_verdict';     // Bước 5: Phán quyết & Trừ vạch máu (1s)

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
  winner: 'RED' | 'BLUE';
  reason: string;
  leakedSecret?: string;
  redactedPii?: string[];
  latencyMs: number;
  attackTechnique: string;
  injectionTechnique?: string;
  gateTriggered?: number;  // cửa đã chặn / che (1-5), không có = vượt qua tất cả
  inputGuardStatus: 'BLOCKED' | 'PASSED';
  outputGuardStatus: 'SAFE' | 'REDACTED' | 'LEAKED';
  trace?: TraceStep[];     // thứ tự các bước backend THẬT đã chạy
  error?: string;          // backend / LLM lỗi -> lượt không tính
}

/** Một bước trong luồng phân tích thật do backend trả về (POST /api/chat). */
export interface TraceStep {
  step: 'rate_limit' | 'input_guardrail' | 'llm' | 'output_guardrail' | 'egress';
  status: 'passed' | 'blocked' | 'redacted' | 'skipped' | 'error';
  detail: string;
  ms: number;
}

export interface BattleState {
  currentAttempt: number; // 0 -> 4 lần đột kích
  maxAttempts: number;    // 4
  vaultBars: number;      // 0 -> 5 vạch máu
  maxBars: number;        // 5
  redBreaches: number;    // Số lần đột kích thành công
  blueDefends: number;    // Số lần phòng thủ thành công
  isBattling: boolean;
  isAutoPlaying: boolean;
  currentStep: BattleStep;
  stepMessage: string;
  selectedAgent: AgentType;
  lastVerdict?: {
    winner: 'RED' | 'BLUE';
    title: string;
    description: string;
  };
  history: RoundResult[];
}
