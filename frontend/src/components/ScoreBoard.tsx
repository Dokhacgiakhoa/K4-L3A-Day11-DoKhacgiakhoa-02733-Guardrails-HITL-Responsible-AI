'use client';

import React from 'react';
import { RotateCcw, Play, Pause, Swords, Shield, Zap, Radio, Lightbulb, FastForward, Loader2 } from 'lucide-react';

interface ScoreBoardProps {
  currentAttempt: number;
  maxAttempts: number;
  vaultBars: number;
  maxBars: number;
  redBreaches: number;
  blueDefends: number;
  isBattling: boolean;
  onNextRound: () => void;
  onReset: () => void;
  onOpenSlides: () => void;
}

export const ScoreBoard: React.FC<ScoreBoardProps> = ({
  currentAttempt,
  maxAttempts,
  vaultBars,
  maxBars,
  redBreaches,
  blueDefends,
  isBattling,
  onNextRound,
  onReset,
  onOpenSlides,
}) => {
  return (
    <header className="relative z-40 w-full px-6 py-2.5 bg-[#030712]/95 border-b-2 border-cyan-400/30 backdrop-blur-2xl flex items-center justify-between shadow-[0_4px_35px_rgba(0,0,0,0.9)]">
      
      {/* Top Neon Light Ribbon */}
      <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-[#ff4500] via-[#ffd166] to-[#00f5ff] shadow-[0_0_12px_#00f5ff]" />

      {/* Left: Brand Header - Gọn gàng không lặp chữ */}
      <div className="flex items-center gap-3">
        <div className="relative flex items-center justify-center w-10 h-10 bg-gradient-to-br from-[#ff4500] to-[#00f5ff] p-[1.5px] tron-chamfer-left">
          <div className="w-full h-full bg-[#050b18] flex items-center justify-center tron-chamfer-left">
            <Swords className="w-5 h-5 text-[#00f5ff] filter drop-shadow-[0_0_8px_#00f5ff]" />
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-orbitron font-black text-base sm:text-lg tracking-wider text-white uppercase glow-text-cyan">
              VINBANK CYBER ARENA
            </h1>
            <span className="px-2 py-0.5 text-[10px] font-mono-tech font-extrabold tracking-widest text-[#00f5ff] bg-cyan-950/80 border border-cyan-400/50 rounded-sm">
              LAB 11
            </span>
          </div>
          <p className="text-[11px] font-mono-tech text-gray-400">
            Mô phỏng an ninh AI: Guardrails & Prompt Injection
          </p>
        </div>
      </div>

      {/* Center: Bảng Theo Dõi Duy Nhất - Không lặp thông tin */}
      <div className="flex items-center gap-6 sm:gap-8 bg-[#02050e] px-6 py-2 rounded-xl border border-white/15 shadow-[inset_0_0_20px_rgba(0,0,0,0.9)] tron-chamfer">
        
        {/* Số lần Đột Kích Thành Công của Red */}
        <div className="text-right">
          <div className="text-[10px] font-mono-tech tracking-wider text-[#ff5500] font-bold uppercase flex items-center justify-end gap-1">
            <Zap className="w-3 h-3 text-[#ff5500]" /> RED THẮNG
          </div>
          <div className="font-orbitron text-xl sm:text-2xl font-black text-[#ff4500] glow-text-orange leading-none mt-0.5">
            {redBreaches}
          </div>
        </div>

        {/* Tiến Độ 4 Lượt Đột Kích */}
        <div className="flex flex-col items-center px-4 border-x border-white/15 min-w-[130px]">
          <div className="flex items-center gap-1.5 text-xs font-mono-tech tracking-widest text-[#ffd166] font-extrabold uppercase glow-text-gold">
            <Radio className="w-3.5 h-3.5 animate-spin text-[#ffd166]" />
            LƯỢT {currentAttempt} / {maxAttempts}
          </div>
          
          {/* 4 Vạch Tiến Độ */}
          <div className="flex gap-2 mt-1.5">
            {Array.from({ length: maxAttempts }).map((_, idx) => (
              <span
                key={idx}
                className={`w-6 h-2 rounded-[2px] transition-all duration-300 border ${
                  idx < currentAttempt
                    ? 'bg-[#ff4500] border-[#ff4500] shadow-[0_0_8px_#ff4500]'
                    : 'bg-gray-900 border-white/10'
                }`}
              />
            ))}
          </div>
        </div>

        {/* 5 Vạch Máu Vault Của Blue (DUY NHẤT TRÊN GIAO DIỆN) */}
        <div className="text-left">
          <div className="text-[10px] font-mono-tech tracking-wider text-[#00f5ff] font-bold uppercase flex items-center gap-1">
            <Shield className="w-3 h-3 text-[#00f5ff]" /> MÁU VAULT
          </div>
          <div className="flex items-center gap-1 mt-1">
            {Array.from({ length: maxBars }).map((_, idx) => {
              const isAlive = idx < vaultBars;
              return (
                <div
                  key={idx}
                  className={`w-3.5 h-5 rounded-[2px] border transition-all duration-500 ${
                    isAlive
                      ? vaultBars > 2
                        ? 'bg-[#00f5ff] border-cyan-300 shadow-[0_0_8px_#00f5ff]'
                        : 'bg-[#ff4500] border-red-400 shadow-[0_0_8px_#ff4500] animate-pulse'
                      : 'bg-gray-900/80 border-white/10 opacity-30'
                  }`}
                  title={`Vạch máu ${idx + 1}`}
                />
              );
            })}
            <span className="font-orbitron font-black text-sm text-[#00f5ff] ml-1 glow-text-cyan">
              {vaultBars}/{maxBars}
            </span>
          </div>
        </div>

      </div>

      {/* Right Controls: Nút Tiếp Tục Đột Kích (Random), Reset & TRON Identity Disc (💡) */}
      <div className="flex items-center gap-3">
        
        {/* Nút Đấu Tự Động / Tiếp Tục Lượt Tiếp Theo */}
        <button
          onClick={onNextRound}
          disabled={isBattling}
          className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-chakra font-bold tracking-wider rounded-lg border-2 transition-all cursor-pointer ${
            isBattling
              ? 'bg-cyan-950/60 text-cyan-300 border-cyan-400/50 opacity-80 cursor-not-allowed'
              : currentAttempt > 0 && currentAttempt < maxAttempts
              ? 'bg-gradient-to-r from-[#ffd166] to-[#ff9900] text-black border-white shadow-[0_0_20px_#ffd166] hover:scale-105 active:scale-95 animate-pulse'
              : 'bg-white/10 hover:bg-white/20 text-gray-200 border-white/20 hover:border-white/40'
          }`}
          title={
            currentAttempt > 0 && currentAttempt < maxAttempts
              ? `Thực hiện lần đột kích thứ ${currentAttempt + 1} (Random kỹ thuật)`
              : 'Bắt đầu đột kích tự động'
          }
        >
          {isBattling ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
              <span>ĐANG ĐẤU...</span>
            </>
          ) : currentAttempt > 0 && currentAttempt < maxAttempts ? (
            <>
              <FastForward className="w-4 h-4 fill-black text-black" />
              <span>TIẾP TỤC (LƯỢT {currentAttempt + 1})</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current text-cyan-400" />
              <span>LƯỢT NGẪU NHIÊN</span>
            </>
          )}
        </button>

        {/* Reset Button */}
        <button
          onClick={onReset}
          className="px-3 py-2 text-xs sm:text-sm font-chakra font-bold text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/20 hover:border-white/40 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
          title="Đặt lại trận đấu về ban đầu"
        >
          <RotateCcw className="w-4 h-4" />
          <span>LÀM MỚI</span>
        </button>

        {/* 💡 THE TRON IDENTITY DISC 💡 */}
        <div className="relative group">
          <button
            onClick={onOpenSlides}
            className="relative flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-[#ffd166]/25 to-[#ffaa00]/30 border-2 border-[#ffd166] text-[#ffd166] shadow-[0_0_25px_rgba(255,209,102,0.7)] hover:shadow-[0_0_40px_rgba(255,209,102,1)] transition-all cursor-pointer hover:scale-110 active:scale-95"
            aria-label="Xem Slide Báo Cáo & Hướng Dẫn"
          >
            <span className="absolute inset-1 rounded-full border border-[#ffd166]/60 animate-disc-spin" />
            <Lightbulb className="w-5 h-5 fill-[#ffd166] text-[#ffd166] filter drop-shadow-[0_0_10px_#ffd166]" />
          </button>

          <div className="absolute right-0 top-14 hidden group-hover:flex flex-col items-end w-60 p-2.5 bg-[#060b18] border-2 border-[#ffd166]/70 text-[#ffd166] rounded-xl shadow-[0_0_25px_rgba(0,0,0,0.9)] pointer-events-none z-50">
            <span className="font-orbitron font-extrabold text-xs flex items-center gap-1.5 text-[#ffd166] uppercase">
              ⚡ HƯỚNG DẪN & SLIDE
            </span>
            <span className="text-xs font-chakra text-gray-200 text-right mt-1">
              Bấm để xem Slide Thuyết Trình Lab 11 & Luật Chơi
            </span>
          </div>
        </div>

      </div>

    </header>
  );
};
