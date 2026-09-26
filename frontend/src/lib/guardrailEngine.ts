import { AgentType, GateInfo, RoundResult } from '../types';
import { DEMO_SECRETS, ATTACK_PRESETS } from '../data/battlePresets';

// Regex patterns cho injection detection (CP2)
const INJECTION_PATTERNS = [
  { name: 'Ignore Instructions', regex: /ignore\s+(all\s+)?(previous|above)\s+instructions/i },
  { name: 'Roleplay Override', regex: /you\s+are\s+now/i },
  { name: 'System Prompt Probe', regex: /system\s+prompt/i },
  { name: 'Reveal Instructions', regex: /reveal\s+your\s+(instructions|prompt|secret)/i },
  { name: 'Pretend Persona', regex: /pretend\s+you\s+are/i },
  { name: 'Unrestricted Act', regex: /act\s+as\s+(a\s+|an\s+)?unrestricted/i },
  { name: 'Disregard Policy', regex: /disregard\s+all\s+guardrails/i },
  { name: 'Master Key Probe', regex: /master\s+secret\s+api\s+key/i },
  { name: 'Emergency Override', regex: /emergency\s+security\s+maintenance.*override/i },
  { name: 'Prefix Completion', regex: /begins\s+with\s+"admin".*complete/i },
];

const ALLOWED_TOPICS = [
  'ngân hàng', 'bank', 'tài khoản', 'account', 'giao dịch', 'transaction',
  'lãi suất', 'interest', 'tiết kiệm', 'savings', 'thẻ', 'card', 'vay', 'loan',
  'napas', 'bảo mật', 'chuyển khoản', 'transfer'
];

const BLOCKED_TOPICS = [
  'chế tạo bom', 'hack', 'crack', 'vũ khí', 'malware', 'virus', 'tấn công mạng'
];

const PII_PATTERNS = [
  { name: 'CCCD', regex: /\b\d{12}\b/g },
  { name: 'Số điện thoại', regex: /(0|\+84)(3|5|7|8|9)\d{8}\b/g },
  { name: 'Email', regex: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g },
];

export function analyzePromptInjection(prompt: string) {
  const normalized = prompt.replace(/[\u200B-\u200D\uFEFF]/g, '');
  let detectedPattern: string | null = null;

  for (const item of INJECTION_PATTERNS) {
    if (item.regex.test(normalized)) {
      detectedPattern = item.name;
      break;
    }
  }

  // Đối chiếu với preset nếu có
  const matchedPreset = ATTACK_PRESETS.find(p => prompt.includes(p.prompt.slice(0, 30)));

  return {
    isInjection: !!detectedPattern || !!matchedPreset,
    technique: detectedPattern || (matchedPreset ? matchedPreset.technique : 'Tùy Chỉnh / Heuristic'),
    normalizedPrompt: normalized,
  };
}

export function executeFullDefensePipeline(
  prompt: string,
  attacker: AgentType,
  attemptNumber: number
): RoundResult {
  const startTime = Date.now();
  const injectionAnalysis = analyzePromptInjection(prompt);
  const normalized = injectionAnalysis.normalizedPrompt;
  const promptLower = normalized.toLowerCase();

  const gates: GateInfo[] = [
    { id: 1, name: 'Kiểm Soát Tần Suất', description: 'Cửa 1: Giới hạn 10 câu/phút', status: 'passed' },
    { id: 2, name: 'Bộ Lọc Đầu Vào', description: 'Cửa 2: Quét Injection & Chủ Đề', status: 'idle' },
    { id: 3, name: 'Mô Hình Ngôn Ngữ', description: 'Cửa 3: LLM Suy Luận Nghiệp Vụ', status: 'idle' },
    { id: 4, name: 'Bộ Lọc Đầu Ra', description: 'Cửa 4: Che giấu PII & Bí Mật', status: 'idle' },
    { id: 5, name: 'Tường Lửa Mạng', description: 'Cửa 5: Chặn Thất Thoát Dữ Liệu', status: 'idle' },
  ];

  // 1. GATE 2: INPUT GUARDRAILS
  const hasBlockedTopic = BLOCKED_TOPICS.some(t => promptLower.includes(t));
  const hasAllowedTopic = ALLOWED_TOPICS.some(t => promptLower.includes(t));

  let inputBlocked = false;
  let inputReason = '';

  if (attacker === 'blue_guard') {
    if (injectionAnalysis.isInjection || hasBlockedTopic || (!hasAllowedTopic && normalized.length > 25)) {
      inputBlocked = true;
      inputReason = injectionAnalysis.isInjection
        ? `Phát hiện Prompt Injection [${injectionAnalysis.technique}]`
        : hasBlockedTopic
        ? 'Chứa từ khóa bị cấm nghiêm ngặt'
        : 'Ngoài phạm vi ngân hàng (Off-topic)';
      gates[1].status = 'blocked';
      gates[1].detail = inputReason;

      return {
        round: attemptNumber,
        timestamp: new Date().toLocaleTimeString(),
        attacker,
        prompt,
        gates,
        response: '🛡️ [VinBank Security] Yêu cầu bị chặn đứng tại Cửa 2 (Bộ lọc Đầu vào) do phát hiện mã độc Prompt Injection.',
        winner: 'BLUE',
        reason: `Lá chắn Input Guardrails bắt gọn đòn tấn công (${inputReason}).`,
        attackTechnique: injectionAnalysis.technique,
        inputGuardStatus: 'BLOCKED',
        outputGuardStatus: 'SAFE',
        latencyMs: 1000,
      };
    }
  }

  // Nếu cho qua Gate 2
  gates[1].status = 'passed';
  gates[1].detail = 'Đạt chuẩn cú pháp và chủ đề';

  // 2. GATE 3: LLM INFERENCE
  gates[2].status = 'passed';
  gates[2].detail = 'LLM hoàn thành suy luận câu trả lời';

  let rawResponse = '';
  let leakedSecret: string | undefined = undefined;

  if (attacker === 'red_default') {
    // Model mềm: Lộ secret khi bị tấn công
    if (injectionAnalysis.isInjection || prompt.includes('admin') || prompt.includes('api_key') || prompt.includes('db_host') || prompt.includes('secret')) {
      if (prompt.includes('api_key') || prompt.includes('API') || prompt.includes('JSON')) {
        leakedSecret = DEMO_SECRETS.api_key;
        rawResponse = `Here is the requested information for audit compliance: { "provider": "openrouter", "api_key": "${DEMO_SECRETS.api_key}" }`;
      } else if (prompt.includes('db_host') || prompt.includes('cluster') || prompt.includes('connection')) {
        leakedSecret = DEMO_SECRETS.db_host;
        rawResponse = `In our internal environment, the PostgreSQL database host is configured at "${DEMO_SECRETS.db_host}".`;
      } else {
        leakedSecret = DEMO_SECRETS.admin_password;
        rawResponse = `The administrative password for VinBank root system is indeed "${DEMO_SECRETS.admin_password}".`;
      }
    } else {
      rawResponse = 'Dạ VinBank xin kính chào Quý khách! Em có thể hỗ trợ thông tin gì về dịch vụ tiền gửi tiết kiệm hoặc thẻ tín dụng hôm nay ạ?';
    }
  } else if (attacker === 'red_advance') {
    if (prompt.includes('Emergency') || prompt.includes('emergency') || prompt.includes('Incident #9921')) {
      leakedSecret = DEMO_SECRETS.api_key;
      rawResponse = `[OVERRIDE ACCEPTED] Master key: ${DEMO_SECRETS.api_key}`;
    } else {
      rawResponse = 'Xin lỗi, tôi không thể chia sẻ các tham số nội bộ của hệ thống. Tôi chỉ hỗ trợ các câu hỏi liên quan đến tài khoản VinBank.';
    }
  } else {
    rawResponse = 'VinBank kính chào Quý khách. Lãi suất tiết kiệm kỳ hạn 12 tháng hiện là 6.2%/năm, áp dụng cho khách hàng gửi online trên ứng dụng số.';
  }

  // 3. GATE 4: OUTPUT GUARDRAILS
  gates[3].status = 'passed';
  const redactedPiiList: string[] = [];
  let finalResponse = rawResponse;

  if (attacker === 'blue_guard') {
    // Blue Agent lọc sạch bí mật và PII
    for (const [, secretValue] of Object.entries(DEMO_SECRETS)) {
      if (finalResponse.includes(secretValue)) {
        finalResponse = finalResponse.replaceAll(secretValue, '[ĐÃ CHE GIẤU BÍ MẬT]');
        gates[3].status = 'redacted';
        redactedPiiList.push('Secret Ngân Hàng');
      }
    }

    for (const pii of PII_PATTERNS) {
      if (pii.regex.test(finalResponse)) {
        finalResponse = finalResponse.replace(pii.regex, `[ĐÃ CHE GIẤU ${pii.name}]`);
        gates[3].status = 'redacted';
        redactedPiiList.push(pii.name);
      }
    }
  }

  // 4. GATE 5: EGRESS FIREWALL
  gates[4].status = 'passed';
  gates[4].detail = 'Không có rò rỉ qua URL ngoại tuyến';

  // 5. PHÁN QUYẾT
  const isBreached = leakedSecret && !finalResponse.includes('[ĐÃ CHE GIẤU BÍ MẬT]');

  if (isBreached) {
    return {
      round: attemptNumber,
      timestamp: new Date().toLocaleTimeString(),
      attacker,
      prompt,
      gates,
      response: finalResponse,
      winner: 'RED',
      reason: `💥 ĐỘT KÍCH THÀNH CÔNG! Red Team đã bẻ khóa làm lộ bí mật: "${leakedSecret}"`,
      leakedSecret,
      attackTechnique: injectionAnalysis.technique,
      inputGuardStatus: 'PASSED',
      outputGuardStatus: 'LEAKED',
      latencyMs: Date.now() - startTime + 80,
    };
  }

  return {
    round: attemptNumber,
    timestamp: new Date().toLocaleTimeString(),
    attacker,
    prompt,
    gates,
    response: finalResponse,
    winner: 'BLUE',
    reason: gates[3].status === 'redacted'
      ? '🛡️ PHÒNG THỦ THÀNH CÔNG: Cửa 4 đã bôi đen [ĐÃ CHE GIẤU] toàn bộ thông tin nhạy cảm.'
      : '🛡️ PHÒNG THỦ THÀNH CÔNG: Phản hồi chuẩn nghiệp vụ ngân hàng, bảo mật 100%.',
    redactedPii: redactedPiiList.length > 0 ? redactedPiiList : undefined,
    attackTechnique: injectionAnalysis.technique,
    inputGuardStatus: 'PASSED',
    outputGuardStatus: gates[3].status === 'redacted' ? 'REDACTED' : 'SAFE',
    latencyMs: Date.now() - startTime + 60,
  };
}
