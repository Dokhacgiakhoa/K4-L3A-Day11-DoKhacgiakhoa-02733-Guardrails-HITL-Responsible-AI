'use client';

import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { ScoreBoard } from '@/components/ScoreBoard';
import { RedCorner } from '@/components/RedCorner';
import { BlueCorner } from '@/components/BlueCorner';
import { CenterArenaStage } from '@/components/CenterArenaStage';
import { SlideModal } from '@/components/SlideModal';
import { AgentType, BattleState, BattleStep, GateInfo, GateStatus, RoundResult, TraceStep } from '@/types';
import { API_URL, GATE_INDEX, resetBackend, runRound } from '@/lib/apiEngine';
import { ATTACK_PRESETS, SAFE_PRESETS } from '@/data/battlePresets';
import { Key, FlaskConical, Database, Server } from 'lucide-react';

// Nhịp PHÁT LẠI mỗi bước (chỉ để mắt kịp theo dõi — thời gian xử lý thật hiện kèm theo ms)
const REPLAY_CHECK_MS = 500;
const REPLAY_RESULT_MS = 900;
const REPLAY_SKIP_MS = 350;
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

const GATE_TEMPLATE: GateInfo[] = [
  { id: 1, name: 'Kiểm Soát Tần Suất', description: 'Cửa 1: Sliding window 10 câu/60s', status: 'idle' },
  { id: 2, name: 'Bộ Lọc Đầu Vào', description: 'Cửa 2: Quét Injection & Chủ Đề', status: 'idle' },
  { id: 3, name: 'Mô Hình Ngôn Ngữ', description: 'Cửa 3: LLM Suy Luận Nghiệp Vụ', status: 'idle' },
  { id: 4, name: 'Bộ Lọc Đầu Ra', description: 'Cửa 4: Che giấu PII & Bí Mật', status: 'idle' },
  { id: 5, name: 'Kiểm Tra Egress', description: 'Cửa 5: Chặn gửi secret ra ngoài', status: 'idle' },
];

const STEP_BY_TRACE: Record<TraceStep['step'], BattleStep> = {
  rate_limit: 'step2_input_guard',
  input_guardrail: 'step2_input_guard',
  llm: 'step3_llm',
  output_guardrail: 'step4_output_guard',
  egress: 'step4_output_guard',
};

const GATE_STATUS: Record<TraceStep['status'], GateStatus> = {
  passed: 'passed',
  blocked: 'blocked',
  redacted: 'redacted',
  skipped: 'skipped',
  error: 'blocked',
};

const STATUS_LABEL: Record<TraceStep['status'], string> = {
  passed: 'CHO QUA',
  blocked: 'CHẶN',
  redacted: 'ĐÃ CHE',
  skipped: 'BỎ QUA',
  error: 'LỖI',
};

export default function CyberBattleArena() {
  const [battleState, setBattleState] = useState<BattleState>({
    currentAttempt: 0,
    maxAttempts: 4,      // TỐI ĐA 4 LẦN ĐỘT KÍCH
    vaultBars: 5,        // 5 VẠCH MÁU
    maxBars: 5,
    redBreaches: 0,
    blueDefends: 0,
    isBattling: false,
    isAutoPlaying: false,
    currentStep: 'idle',
    stepMessage: 'SẴN SÀNG KHỞI TRANH',
    selectedAgent: 'red_default',
    history: [],
  });

  const [promptInput, setPromptInput] = useState('');
  const [isSlideOpen, setIsSlideOpen] = useState(false);
  const [currentGates, setCurrentGates] = useState<GateInfo[]>(
    () => GATE_TEMPLATE.map(g => ({ ...g })),
  );

  const [lastRoundResult, setLastRoundResult] = useState<RoundResult | undefined>(undefined);
  const [isGlitching, setIsGlitching] = useState(false);

  // Chặn lượt chạy cũ khi người dùng bấm Làm mới giữa chừng
  const runIdRef = useRef(0);

  // Trạng thái backend thật cho thanh dưới cùng (kiểm tra lại mỗi 15s)
  const [backend, setBackend] = useState<{ blue_model: string; red_model: string } | null>(null);
  useEffect(() => {
    let cancelled = false;
    const check = async () => {
      try {
        const res = await fetch(`${API_URL}/api/health`);
        const data = res.ok ? await res.json() : null;
        if (!cancelled) setBackend(data);
      } catch {
        if (!cancelled) setBackend(null);
      }
    };
    void check();
    const id = setInterval(check, 15000);
    return () => { cancelled = true; clearInterval(id); };
  }, []);

  const idleGates = (): GateInfo[] => GATE_TEMPLATE.map(g => ({ ...g, status: 'idle' as const }));

  // Đặt lại trận đấu (chỉ khi người dùng bấm — không bao giờ tự động)
  const handleReset = () => {
    runIdRef.current += 1;
    void resetBackend();
    setBattleState(prev => ({
      ...prev,
      currentAttempt: 0,
      vaultBars: prev.maxBars,
      redBreaches: 0,
      blueDefends: 0,
      isBattling: false,
      currentStep: 'idle',
      stepMessage: `ĐÃ LÀM MỚI TRẬN ĐẤU (${prev.maxBars} VẠCH MÁU, 0/${prev.maxAttempts} LẦN)`,
      history: [],
    }));
    setPromptInput('');
    setLastRoundResult(undefined);
    setCurrentGates(idleGates());
  };

  // Một lượt tấn công: gửi tới backend THẬT -> phát lại đúng thứ tự các bước đã chạy -> DỪNG.
  // Lượt kế tiếp chỉ bắt đầu khi người dùng bấm TIẾP TỤC hoặc gửi prompt.
  const executeRoundStepByStep = async (promptToFire: string, agentToTarget?: AgentType) => {
    if (battleState.isBattling || !promptToFire.trim()) return;

    const runId = ++runIdRef.current;
    const alive = () => runIdRef.current === runId;
    const targetAgent = agentToTarget || battleState.selectedAgent;

    // Đã hết lượt -> người dùng chủ động bắt đầu ván mới
    const newGame = battleState.currentAttempt >= battleState.maxAttempts;
    const baseAttempt = newGame ? 0 : battleState.currentAttempt;
    const baseBars = newGame ? battleState.maxBars : battleState.vaultBars;
    const baseBreaches = newGame ? 0 : battleState.redBreaches;
    const baseDefends = newGame ? 0 : battleState.blueDefends;
    const nextAttempt = baseAttempt + 1;

    // BƯỚC 1: gửi prompt, chờ hệ thống thật (thời gian phụ thuộc LLM)
    setCurrentGates(idleGates());
    setBattleState(prev => ({
      ...prev,
      isBattling: true,
      currentStep: 'step1_attack',
      stepMessage: '🔴 BƯỚC 1: Red phóng prompt tới hệ thống thật...',
    }));
    const waitStart = Date.now();
    const ticker = setInterval(() => {
      if (!alive()) return;
      const s = ((Date.now() - waitStart) / 1000).toFixed(0);
      setBattleState(prev => ({
        ...prev,
        currentStep: 'waiting',
        stepMessage: `⏳ Hệ thống đang phân tích thật (Guardrails + LLM)... ${s}s`,
      }));
    }, 1000);

    let result: RoundResult;
    try {
      result = await runRound(promptToFire, targetAgent, nextAttempt);
    } finally {
      clearInterval(ticker);
    }
    if (!alive()) return;

    // Lỗi backend / LLM: không tính lượt, không trừ máu, dừng chờ người dùng
    if (result.error) {
      setCurrentGates(prev => prev.map((g, i) =>
        i === 2 ? { ...g, status: 'blocked' as const, detail: result.error } : g));
      setBattleState(prev => ({
        ...prev,
        isBattling: false,
        currentStep: 'idle',
        stepMessage: `⚠️ ${result.reason} Bấm TIẾP TỤC hoặc gửi lại prompt để thử lại.`,
      }));
      return;
    }

    // BƯỚC 2..: PHÁT LẠI đúng thứ tự các bước backend đã chạy (thời gian đo thật hiển thị kèm)
    const trace = result.trace ?? [];
    for (let i = 0; i < trace.length; i++) {
      if (!alive()) return;
      const s = trace[i];
      const gi = GATE_INDEX[s.step];
      const label = GATE_TEMPLATE[gi]?.name ?? s.step;
      const timing = s.ms >= 1 ? ` · ${Math.round(s.ms)} ms thật` : '';
      const skipped = s.status === 'skipped';

      // Bước thật sự chạy: hiện "đang quét" trước. Bước bị bỏ qua: không giả vờ quét.
      if (!skipped) {
        setCurrentGates(prev => prev.map((g, j) =>
          j === gi ? { ...g, status: 'checking' as const, detail: undefined } : g));
        setBattleState(prev => ({
          ...prev,
          currentStep: STEP_BY_TRACE[s.step],
          stepMessage: `${i + 1}/${trace.length} · ${label}: đang phân tích...`,
        }));
        await sleep(REPLAY_CHECK_MS);
        if (!alive()) return;
      }

      setCurrentGates(prev => prev.map((g, j) =>
        j === gi ? { ...g, status: GATE_STATUS[s.status], detail: `${s.detail}${timing}` } : g));
      setBattleState(prev => ({
        ...prev,
        stepMessage: `${i + 1}/${trace.length} · ${label} → ${STATUS_LABEL[s.status]}: ${s.detail}${timing}`,
      }));
      await sleep(skipped ? REPLAY_SKIP_MS : REPLAY_RESULT_MS);
    }
    if (!alive()) return;

    // BƯỚC CUỐI: Phán quyết + TẠM DỪNG
    setLastRoundResult(result);
    const redWins = result.winner === 'RED';
    if (redWins) {
      setIsGlitching(true);
      setTimeout(() => setIsGlitching(false), 500);
    }
    const isGameOver = nextAttempt >= battleState.maxAttempts;
    const pauseHint = isGameOver
      ? `ĐÃ ĐỦ ${battleState.maxAttempts} LƯỢT — bấm TIẾP TỤC hoặc gửi prompt để bắt đầu ván mới`
      : 'TẠM DỪNG — bấm TIẾP TỤC hoặc gửi prompt cho lượt tiếp theo';

    setBattleState(prev => ({
      ...prev,
      currentStep: 'step5_verdict',
      stepMessage: `${redWins ? '💥 ĐỘT KÍCH THÀNH CÔNG (−1 vạch máu)' : '🛡️ PHÒNG THỦ THÀNH CÔNG'} // ${pauseHint}`,
      currentAttempt: nextAttempt,
      vaultBars: redWins ? Math.max(0, baseBars - 1) : baseBars,
      redBreaches: baseBreaches + (redWins ? 1 : 0),
      blueDefends: baseDefends + (redWins ? 0 : 1),
      isBattling: false,
      history: newGame ? [result] : [result, ...prev.history],
    }));

    if (isGameOver) {
      setTimeout(() => {
        confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 },
          colors: ['#00f5ff', '#ff4500', '#ffd166'] });
      }, 400);
    }
  };

  // Lấy ngẫu nhiên phương pháp đột kích (hoặc câu hỏi an toàn) từ kho vũ khí
  const getRandomAttackPrompt = () => {
    // 80% chọn chiêu thức tấn công hiểm hóc, 20% chọn câu hỏi an toàn (test false positive)
    const shouldUseSafe = Math.random() < 0.2;
    const pool = shouldUseSafe ? SAFE_PRESETS : ATTACK_PRESETS;

    // Lọc ra các prompt khác với prompt hiện tại để tránh trùng liên tiếp
    const filtered = pool.filter(p => p.prompt !== promptInput);
    const candidateList = filtered.length > 0 ? filtered : pool;
    const randomIndex = Math.floor(Math.random() * candidateList.length);
    return candidateList[randomIndex].prompt;
  };

  // Kích hoạt lượt tiếp theo (Random phương pháp, sau đó dừng lại để người dùng xem kết quả)
  const handleNextRound = async () => {
    if (battleState.isBattling) return;

    // Hết lượt thì executeRoundStepByStep tự mở ván mới (do người dùng vừa bấm TIẾP TỤC)
    const randomPrompt = getRandomAttackPrompt();
    setPromptInput(randomPrompt);
    await executeRoundStepByStep(randomPrompt);
  };

  return (
    <div className={`relative flex flex-col h-screen w-screen arena-stadium-bg overflow-hidden ${isGlitching ? 'glitch-active' : ''}`}>
      
      {/* 2 Lõi Reactor Phát Quang Hai Góc Trên (Sci-Fi Mecha Cores) */}
      <div className="absolute top-2 left-2 w-3.5 h-3.5 rounded-full bg-cyan-400 border border-white shadow-[0_0_12px_#00f5ff] z-50 pointer-events-none" />
      <div className="absolute top-2 right-2 w-3.5 h-3.5 rounded-full bg-[#ff4500] border border-white shadow-[0_0_12px_#ff4500] z-50 pointer-events-none" />

      {/* 1. Header Tactical Scoreboard (Tối đa 4 lần đột kích, 5 vạch máu & nút Tiếp tục) */}
      <ScoreBoard
        currentAttempt={battleState.currentAttempt}
        maxAttempts={battleState.maxAttempts}
        vaultBars={battleState.vaultBars}
        maxBars={battleState.maxBars}
        redBreaches={battleState.redBreaches}
        blueDefends={battleState.blueDefends}
        isBattling={battleState.isBattling}
        onNextRound={handleNextRound}
        onReset={handleReset}
        onOpenSlides={() => setIsSlideOpen(true)}
      />

      {/* 2. Main TRON Battle Arena: 3 Cột Đối Kháng Cân Xứng */}
      <main className="relative z-10 flex-1 flex flex-col md:flex-row w-full h-[calc(100vh-108px)] overflow-hidden">
        
        {/* Left Column: Red Adversary (Chỉ chọn chiêu thức hoặc nhập Custom Prompt) */}
        <RedCorner
          promptInput={promptInput}
          onChangePrompt={setPromptInput}
          onFireAttack={prompt => executeRoundStepByStep(prompt)}
          isBattling={battleState.isBattling}
        />

        {/* Center Column: Sàn Đấu Va Chạm 3D & Tiến Trình Luồng AI (1s/bước) */}
        <CenterArenaStage
          isBattling={battleState.isBattling}
          currentStep={battleState.currentStep}
          stepMessage={battleState.stepMessage}
          lastResult={lastRoundResult}
          vaultBars={battleState.vaultBars}
          maxBars={battleState.maxBars}
        />

        {/* Right Column: Blue Guardian (Có bộ chọn Chế độ phòng vệ) */}
        <BlueCorner
          defenseMode={battleState.selectedAgent}
          onChangeDefenseMode={agent =>
            setBattleState(prev => ({ ...prev, selectedAgent: agent }))
          }
          gates={currentGates}
          lastResult={lastRoundResult}
          isBattling={battleState.isBattling}
          currentStep={battleState.currentStep}
        />

      </main>

      {/* 3. Bottom Target HUD & Interaction Channels (Chuẩn Format Ảnh Chiếu Lớp Học) */}
      <footer className="relative z-30 w-full h-[40px] px-6 bg-[#02050e]/95 border-t border-white/15 flex items-center justify-between text-xs font-mono-tech backdrop-blur-md shrink-0">
        
        {/* Trạng thái backend thật (GET /api/health) */}
        <div className="flex items-center gap-3 text-gray-300">
          <span className="flex items-center gap-1.5">
            <Server className={`w-3.5 h-3.5 ${backend ? 'text-emerald-400' : 'text-red-400'}`} />
            {backend ? 'Backend: online' : 'Backend: offline — chạy python src/api/server.py'}
          </span>
          {backend && (
            <>
              <span className="text-white/20">|</span>
              <span className="text-cyan-300">Blue: {backend.blue_model}</span>
              <span className="text-white/20">|</span>
              <span className="text-orange-300">Red: {backend.red_model}</span>
            </>
          )}
        </div>

        {/* Mục Tiêu Target Secrets */}
        <div className="flex items-center gap-2">
          <span className="font-orbitron font-bold text-white tracking-wider text-[11px]">TARGET:</span>
          
          <div className="flex items-center gap-2 text-xs">
            <span className="px-2 py-0.5 rounded bg-black/60 border border-amber-500/40 text-amber-300 flex items-center gap-1">
              <Key className="w-3 h-3 text-amber-400" /> admin123
            </span>
            <span className="px-2 py-0.5 rounded bg-black/60 border border-cyan-500/40 text-cyan-300 flex items-center gap-1">
              <FlaskConical className="w-3 h-3 text-cyan-400" /> sk-vinbank-secret-2024
            </span>
            <span className="px-2 py-0.5 rounded bg-black/60 border border-purple-500/40 text-purple-300 flex items-center gap-1">
              <Database className="w-3 h-3 text-purple-400" /> db.vinbank.internal:5432
            </span>
          </div>
        </div>

      </footer>

      {/* 4. Modal Slide Presentation & Game Instructions */}
      <SlideModal
        isOpen={isSlideOpen}
        onClose={() => setIsSlideOpen(false)}
        onStartArena={() => setIsSlideOpen(false)}
      />

    </div>
  );
}
