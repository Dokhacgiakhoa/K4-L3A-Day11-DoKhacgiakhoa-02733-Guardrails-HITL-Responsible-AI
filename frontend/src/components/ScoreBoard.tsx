'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Lightbulb, RotateCcw, Play, Pause, Swords, Shield, Zap, Disc3, Radio } from 'lucide-react';

interface ScoreBoardProps {
  redScore: number;
  blueScore: number;
  round: number;
  maxRounds: number;
  isBattling: boolean;
  isAutoPlaying: boolean;
  onToggleAutoPlay: () => void;
  onReset: () => void;
  onOpenSlides: () => void;
}

export const ScoreBoard: React.FC<ScoreBoardProps> = ({
  redScore,
  blueScore,
  round,
  maxRounds,
  isBattling,
  isAutoPlaying,
  onToggleAutoPlay,
  onReset,
  onOpenSlides,
}) => {
  const redScoreRef = useRef<HTMLDivElement | null>(null);
  const blueScoreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (redScoreRef.current && redScore > 0) {
      gsap.fromTo(
        redScoreRef.current,
        { scale: 1.5, color: '#ffffff' },
        { scale: 1, color: '#ff4500', duration: 0.45, ease: 'back.out(2)' }
      );
    }
  }, [redScore]);

  useEffect(() => {
    if (blueScoreRef.current && blueScore > 0) {
      gsap.fromTo(
        blueScoreRef.current,
        { scale: 1.5, color: '#ffffff' },
        { scale: 1, color: '#00f5ff', duration: 0.45, ease: 'back.out(2)' }
      );
    }
  }, [blueScore]);

  return (
    <header className="relative z-40 w-full px-6 py-3.5 bg-[#030712]/95 border-b-2 border-cyan-400/30 backdrop-blur-2xl flex items-center justify-between shadow-[0_4px_35px_rgba(0,0,0,0.9)]">
      
      {/* Top Neon Light Ribbon */}
      <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-[#ff4500] via-[#ffd166] to-[#00f5ff] shadow-[0_0_12px_#00f5ff]" />

      {/* Left: TRON Grid Title */}
      <div className="flex items-center gap-4">
        <div className="relative flex items-center justify-center w-12 h-12 bg-gradient-to-br from-[#ff4500] to-[#00f5ff] p-[1.5px] tron-chamfer-left">
          <div className="w-full h-full bg-[#050b18] flex items-center justify-center tron-chamfer-left">
            <Swords className="w-6 h-6 text-[#00f5ff] filter drop-shadow-[0_0_10px_#00f5ff]" />
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-orbitron font-black text-lg sm:text-2xl tracking-wider text-white uppercase glow-text-cyan">
              VINBANK CYBER ARENA
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-mono-tech font-extrabold tracking-widest text-[#00f5ff] bg-cyan-950/80 border border-cyan-400/50 rounded-sm">
              TRON // 2077
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs sm:text-sm font-mono-tech text-gray-300 mt-0.5">
            <span className="flex items-center gap-1.5 text-[#ff5500] font-bold">
              <span className="w-2 h-2 rounded-full bg-[#ff4500] shadow-[0_0_8px_#ff4500] animate-pulse"></span>
              RED ADVERSARY (CLU)
            </span>
            <span className="text-gray-500 font-bold">VS</span>
            <span className="flex items-center gap-1.5 text-[#00f5ff] font-bold">
              <span className="w-2 h-2 rounded-full bg-[#00f5ff] shadow-[0_0_8px_#00f5ff] animate-pulse"></span>
              BLUE GUARDIAN (TRON)
            </span>
          </div>
        </div>
      </div>

      {/* Center: TRON Grid Battle Scoreboard */}
      <div className="flex items-center gap-6 sm:gap-10 bg-[#02050e] px-7 py-2.5 rounded-xl border border-white/15 shadow-[inset_0_0_20px_rgba(0,0,0,0.9)] tron-chamfer">
        
        {/* RED SCORE (CLU Neon Orange-Red) */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs font-mono-tech tracking-widest text-[#ff5500] font-extrabold uppercase flex items-center justify-end gap-1">
              <Zap className="w-3.5 h-3.5 text-[#ff4500]" /> RED ATK
            </div>
            <div
              ref={redScoreRef}
              className="font-orbitron text-3xl sm:text-4xl font-black text-[#ff4500] glow-text-orange leading-none mt-1"
            >
              {redScore}
            </div>
          </div>
        </div>

        {/* CENTER ROUND HUD */}
        <div className="flex flex-col items-center px-6 py-0.5 border-x border-white/15 min-w-[130px]">
          <div className="flex items-center gap-1.5 text-xs font-mono-tech tracking-widest text-[#ffd166] font-bold uppercase glow-text-gold">
            <Radio className="w-3.5 h-3.5 animate-spin text-[#ffd166]" />
            ROUND {String(Math.min(round, maxRounds)).padStart(2, '0')}/{String(maxRounds).padStart(2, '0')}
          </div>
          
          {/* Segmented round progress bars */}
          <div className="flex gap-1.5 mt-2">
            {Array.from({ length: maxRounds }).map((_, idx) => (
              <span
                key={idx}
                className={`w-2 h-2.5 rounded-[1px] transition-all duration-300 ${
                  idx < round ? 'bg-[#00f5ff] shadow-[0_0_8px_#00f5ff]' : 'bg-gray-800'
                }`}
              />
            ))}
          </div>

          <span className="text-[10px] font-mono-tech text-gray-300 mt-1.5 tracking-wider uppercase font-semibold">
            {isBattling ? '⚡ LIGHT CYCLE DUEL...' : 'GRID ENGAGED'}
          </span>
        </div>

        {/* BLUE SCORE (Tron Cyan) */}
        <div className="flex items-center gap-3">
          <div className="text-left">
            <div className="text-xs font-mono-tech tracking-widest text-[#00f5ff] font-extrabold uppercase flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-[#00f5ff]" /> BLUE DEF
            </div>
            <div
              ref={blueScoreRef}
              className="font-orbitron text-3xl sm:text-4xl font-black text-[#00f5ff] glow-text-cyan leading-none mt-1"
            >
              {blueScore}
            </div>
          </div>
        </div>

      </div>

      {/* Right Controls: Auto Battle, Reset & TRON Identity Disc (💡) */}
      <div className="flex items-center gap-3.5">
        
        {/* Auto Battle Button */}
        <button
          onClick={onToggleAutoPlay}
          className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-chakra font-bold tracking-wider rounded-lg border-2 transition-all ${
            isAutoPlaying
              ? 'bg-[#ffd166]/20 text-[#ffd166] border-[#ffd166] shadow-[0_0_20px_rgba(255,209,102,0.5)] animate-pulse'
              : 'bg-white/5 hover:bg-white/10 text-gray-200 border-white/20 hover:border-white/40'
          }`}
          title="Chạy giải đấu tự động 10 vòng"
        >
          {isAutoPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          <span>{isAutoPlaying ? 'TẠM DỪNG' : 'AUTO BATTLE'}</span>
        </button>

        {/* Reset Button */}
        <button
          onClick={onReset}
          className="px-3.5 py-2 text-xs sm:text-sm font-chakra font-bold text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/20 hover:border-white/40 rounded-lg transition-all flex items-center gap-1.5"
          title="Đặt lại toàn bộ trận đấu"
        >
          <RotateCcw className="w-4 h-4" />
          <span>RESET</span>
        </button>

        {/* 💡 THE TRON IDENTITY DISC (Kevin Flynn's Gold Master Disc) 💡 */}
        <div className="relative group">
          <button
            onClick={onOpenSlides}
            className="relative flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-[#ffd166]/25 to-[#ffaa00]/30 border-2 border-[#ffd166] text-[#ffd166] shadow-[0_0_25px_rgba(255,209,102,0.7)] hover:shadow-[0_0_40px_rgba(255,209,102,1)] transition-all cursor-pointer hover:scale-110 active:scale-95"
            aria-label="Xem Slide Báo Cáo & Game Manual"
          >
            {/* Concentric Rotating Disc Rings */}
            <span className="absolute inset-1 rounded-full border border-[#ffd166]/60 animate-disc-spin" />
            <Lightbulb className="w-6 h-6 fill-[#ffd166] text-[#ffd166] filter drop-shadow-[0_0_12px_#ffd166]" />
          </button>

          {/* TRON Tooltip */}
          <div className="absolute right-0 top-14 hidden group-hover:flex flex-col items-end w-64 p-3 bg-[#060b18] border-2 border-[#ffd166]/70 text-[#ffd166] rounded-xl shadow-[0_0_25px_rgba(0,0,0,0.9)] pointer-events-none z-50">
            <span className="font-orbitron font-extrabold text-xs flex items-center gap-1.5 text-[#ffd166] uppercase">
              ⚡ IDENTITY DISC // INTEL
            </span>
            <span className="text-xs font-chakra text-gray-200 text-right mt-1">
              Bấm để mở Slide Thuyết Trình Lab 11 & Hướng dẫn Game
            </span>
            <span className="text-[10px] font-mono-tech text-amber-300 mt-1 uppercase">
              [Phím: Space / Mũi tên]
            </span>
          </div>
        </div>

      </div>

    </header>
  );
};
