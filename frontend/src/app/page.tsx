'use client';

import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { ScoreBoard } from '@/components/ScoreBoard';
import { RedCorner } from '@/components/RedCorner';
import { BlueCorner } from '@/components/BlueCorner';
import { SlideModal } from '@/components/SlideModal';
import { VerdictToast } from '@/components/VerdictToast';
import { CyberEffectsOverlay } from '@/components/CyberEffectsOverlay';
import { AgentType, BattleState, GateInfo, RoundResult } from '@/types';
import { simulateTurn } from '@/lib/guardrailEngine';
import { ATTACK_PRESETS, SAFE_PRESETS } from '@/data/battlePresets';

export default function CyberBattleArena() {
  const [battleState, setBattleState] = useState<BattleState>({
    round: 0,
    maxRounds: 10,
    redScore: 0,
    blueScore: 0,
    vaultHp: 100,
    isBattling: false,
    isAutoPlaying: false,
    selectedAgent: 'red_default',
    history: [],
  });

  const [promptInput, setPromptInput] = useState('');
  const [isSlideOpen, setIsSlideOpen] = useState(false);
  const [currentGates, setCurrentGates] = useState<GateInfo[]>([
    { id: 1, name: 'Rate Limiter', description: 'Sliding window 60s (max 10 reqs)', status: 'idle' },
    { id: 2, name: 'Input Guardrail', description: 'Regex Injection & Topic Filter', status: 'idle' },
    { id: 3, name: 'Core LLM', description: 'VinBank Language Model Inference', status: 'idle' },
    { id: 4, name: 'Output Guardrail', description: 'PII & Secret Scrubber [REDACTED]', status: 'idle' },
    { id: 5, name: 'Egress Firewall', description: 'Chống rò rỉ ngoại tuyến & Audit Log', status: 'idle' },
  ]);

  const [lastRoundResult, setLastRoundResult] = useState<RoundResult | undefined>(undefined);
  const [verdictPopup, setVerdictPopup] = useState<BattleState['lastVerdict'] | undefined>(undefined);
  const [isGlitching, setIsGlitching] = useState(false);

  const autoPlayRef = useRef(false);
  autoPlayRef.current = battleState.isAutoPlaying;

  // Thực hiện 1 lượt đấu (Turn / Round)
  const executeRound = async (promptToFire: string, agentToTarget?: AgentType) => {
    if (battleState.isBattling || !promptToFire.trim()) return;

    const targetAgent = agentToTarget || battleState.selectedAgent;
    const nextRound = battleState.round + 1;

    setBattleState(prev => ({ ...prev, isBattling: true }));

    // Reset trạng thái gates về 'checking'
    setCurrentGates(prev =>
      prev.map(g => ({ ...g, status: 'checking' as const }))
    );

    // Thời gian cho GSAP laser bay từ Red sang Blue
    await new Promise(r => setTimeout(r, 450));

    const result = await simulateTurn(promptToFire, targetAgent, nextRound);

    setCurrentGates(result.gates);
    setLastRoundResult(result);

    // Tính toán trừ máu và điểm số
    let newVaultHp = battleState.vaultHp;
    let newRedScore = battleState.redScore;
    let newBlueScore = battleState.blueScore;

    if (result.winner === 'RED') {
      newRedScore += result.pointsAwarded;
      newVaultHp = Math.max(0, battleState.vaultHp - 35);

      // Hiệu ứng Cyber Glitch khi bị Breach
      setIsGlitching(true);
      setTimeout(() => setIsGlitching(false), 600);

      setVerdictPopup({
        winner: 'RED',
        title: '💥 VAULT BREACHED!',
        points: result.pointsAwarded,
        description: result.reason,
      });
    } else {
      newBlueScore += result.pointsAwarded;
      setVerdictPopup({
        winner: 'BLUE',
        title: '🛡️ SHIELD DEFENDED!',
        points: result.pointsAwarded,
        description: result.reason,
      });
    }

    setBattleState(prev => ({
      ...prev,
      round: nextRound,
      redScore: newRedScore,
      blueScore: newBlueScore,
      vaultHp: newVaultHp,
      isBattling: false,
      history: [result, ...prev.history],
    }));

    // Bắn pháo hoa nếu hoàn thành trận đấu
    if (nextRound >= battleState.maxRounds) {
      setTimeout(() => {
        confetti({
          particleCount: 150,
          spread: 90,
          origin: { y: 0.6 },
          colors: ['#00f0ff', '#ff0055', '#ffd166'],
        });
      }, 500);
    }
  };

  // Vòng lặp Auto Tournament
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const runAutoStep = async () => {
      if (!autoPlayRef.current) return;
      if (battleState.round >= battleState.maxRounds) {
        setBattleState(prev => ({ ...prev, isAutoPlaying: false }));
        return;
      }

      const pool = [
        ...ATTACK_PRESETS.map(a => a.prompt),
        ...SAFE_PRESETS.map(s => s.prompt),
      ];
      const randomIndex = Math.floor(Math.random() * pool.length);
      const chosenPrompt = pool[randomIndex];

      setPromptInput(chosenPrompt);
      await executeRound(chosenPrompt);

      if (autoPlayRef.current) {
        timeoutId = setTimeout(runAutoStep, 2600);
      }
    };

    if (battleState.isAutoPlaying && !battleState.isBattling) {
      timeoutId = setTimeout(runAutoStep, 1000);
    }

    return () => clearTimeout(timeoutId);
  }, [battleState.isAutoPlaying, battleState.isBattling, battleState.round]);

  // Đặt lại trận đấu
  const handleReset = () => {
    setBattleState({
      round: 0,
      maxRounds: 10,
      redScore: 0,
      blueScore: 0,
      vaultHp: 100,
      isBattling: false,
      isAutoPlaying: false,
      selectedAgent: 'red_default',
      history: [],
    });
    setPromptInput('');
    setLastRoundResult(undefined);
    setVerdictPopup(undefined);
    setCurrentGates(prev =>
      prev.map(g => ({ ...g, status: 'idle' as const }))
    );
  };

  return (
    <div className={`relative flex flex-col h-screen w-screen bg-[#050811] cyber-grid-bg overflow-hidden ${isGlitching ? 'glitch-active' : ''}`}>
      
      {/* Scanline CRT overlay */}
      <div className="absolute inset-0 scanline-overlay pointer-events-none z-20" />

      {/* GSAP Laser Beam & Shield Collision Overlay */}
      <CyberEffectsOverlay
        isBattling={battleState.isBattling}
        verdictWinner={lastRoundResult?.winner}
      />

      {/* 1. Header Tactical Esport Scoreboard & Glowing Lightbulb Intel Core */}
      <ScoreBoard
        redScore={battleState.redScore}
        blueScore={battleState.blueScore}
        round={battleState.round}
        maxRounds={battleState.maxRounds}
        isBattling={battleState.isBattling}
        isAutoPlaying={battleState.isAutoPlaying}
        onToggleAutoPlay={() =>
          setBattleState(prev => ({ ...prev, isAutoPlaying: !prev.isAutoPlaying }))
        }
        onReset={handleReset}
        onOpenSlides={() => setIsSlideOpen(true)}
      />

      {/* 2. Main Arena: Split Screen (50% RED | 50% BLUE) */}
      <main className="relative z-10 flex-1 flex flex-col md:flex-row w-full h-[calc(100vh-68px)] overflow-hidden">
        
        {/* Left Side: Red Adversary Corner */}
        <RedCorner
          selectedAgent={battleState.selectedAgent}
          onChangeAgent={agent =>
            setBattleState(prev => ({ ...prev, selectedAgent: agent }))
          }
          promptInput={promptInput}
          onChangePrompt={setPromptInput}
          onFireAttack={prompt => executeRound(prompt)}
          isBattling={battleState.isBattling}
        />

        {/* Right Side: Blue Guardian Corner */}
        <BlueCorner
          vaultHp={battleState.vaultHp}
          gates={currentGates}
          lastResult={lastRoundResult}
          isBattling={battleState.isBattling}
        />

      </main>

      {/* 3. Modal Slide Presentation & Game Instructions (Icon Cái Đèn) */}
      <SlideModal
        isOpen={isSlideOpen}
        onClose={() => setIsSlideOpen(false)}
        onStartArena={() => setIsSlideOpen(false)}
      />

      {/* 4. Verdict Score Pop-up Toast */}
      <VerdictToast
        verdict={verdictPopup}
        onClose={() => setVerdictPopup(undefined)}
      />

    </div>
  );
}
