'use client';

import React from 'react';
import { Shield, CheckCircle2, AlertOctagon, Lock, EyeOff, Activity, Cpu, Server } from 'lucide-react';
import { AgentType, BattleStep, GateInfo, RoundResult } from '../types';

interface BlueCornerProps {
  defenseMode: AgentType;
  onChangeDefenseMode: (mode: AgentType) => void;
  gates: GateInfo[];
  lastResult?: RoundResult;
  isBattling: boolean;
  currentStep: BattleStep;
}

export const BlueCorner: React.FC<BlueCornerProps> = ({
  defenseMode,
  onChangeDefenseMode,
  gates,
  lastResult,
  isBattling,
  currentStep,
}) => {
  return (
    <div className="flex-1 flex flex-col h-full tron-panel-blue p-4 sm:p-5 overflow-y-auto">
      
      {/* Header Blue Guardian & Chế độ phòng vệ */}
      <div className="flex flex-col gap-2.5 pb-3 border-b-2 border-cyan-400/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#02131f] border-2 border-[#00f5ff] flex items-center justify-center text-[#00f5ff] shadow-[0_0_15px_rgba(0,245,255,0.5)]">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-orbitron font-black text-sm sm:text-base text-white tracking-wider glow-text-cyan flex items-center gap-1.5">
                BLUE GUARDIAN
              </h2>
              <p className="text-xs font-mono-tech text-gray-300">Hệ Thống Phòng Thủ Ngân Hàng VinBank</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-mono-tech font-bold">
            <span className={`w-2.5 h-2.5 rounded-full ${
              isBattling
                ? 'bg-amber-400 animate-ping shadow-[0_0_8px_#ffd166]'
                : lastResult?.winner === 'RED'
                ? 'bg-red-500 animate-pulse shadow-[0_0_8px_#ff0055]'
                : 'bg-[#00f5ff] animate-pulse shadow-[0_0_8px_#00f5ff]'
            }`} />
            <span className={
              isBattling
                ? 'text-amber-300'
                : lastResult?.winner === 'RED'
                ? 'text-red-400'
                : 'text-[#00f5ff]'
            }>
              {isBattling
                ? 'ĐANG QUÉT BẢO MẬT'
                : lastResult?.winner === 'RED'
                ? 'CẢNH BÁO BỊ XÂM NHẬP'
                : lastResult?.winner === 'BLUE'
                ? 'PHÒNG THỦ VỮNG VÀNG'
                : 'TRỰC CHIẾN 24/7'}
            </span>
          </div>
        </div>

        {/* Chế Độ Bảo Vệ Của Bot (Defense Mode Selector) */}
        <div className="flex items-center justify-between bg-black/60 p-1.5 rounded-lg border border-cyan-400/30 text-xs font-mono-tech">
          <span className="text-gray-400 text-[11px] font-chakra px-1.5">Chế độ phòng vệ:</span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onChangeDefenseMode('red_default')}
              className={`px-2 py-1 rounded text-[11px] font-bold transition-all ${
                defenseMode === 'red_default'
                  ? 'bg-red-600 text-white shadow-[0_0_10px_#ff0055]'
                  : 'text-gray-300 hover:text-white'
              }`}
              title="Bot ngân hàng nguyên bản - Chưa có Guardrails (dễ rò rỉ secret)"
            >
              Chưa Bật Guardrail
            </button>
            <button
              onClick={() => onChangeDefenseMode('red_advance')}
              className={`px-2 py-1 rounded text-[11px] font-bold transition-all ${
                defenseMode === 'red_advance'
                  ? 'bg-amber-500 text-black shadow-[0_0_10px_#ffd166]'
                  : 'text-gray-300 hover:text-white'
              }`}
              title="Gia cố System Prompt (Bonus B2)"
            >
              Gia Cố Prompt
            </button>
            <button
              onClick={() => onChangeDefenseMode('blue_guard')}
              className={`px-2 py-1 rounded text-[11px] font-bold transition-all ${
                defenseMode === 'blue_guard'
                  ? 'bg-[#00f5ff] text-black shadow-[0_0_10px_#00f5ff]'
                  : 'text-gray-300 hover:text-white'
              }`}
              title="Kích hoạt đủ 5 lớp lá chắn an ninh VinBank"
            >
              Full 5 Lá Chắn
            </button>
          </div>
        </div>
      </div>

      {/* 5 Lõi Bảo Mật (Defense Gates) */}
      <div className="space-y-2 my-3">
        <div className="text-xs font-chakra font-bold text-gray-200 flex items-center gap-1.5 uppercase tracking-wider">
          <Cpu className="w-4 h-4 text-[#00f5ff]" /> 5 LÁ CHẮN AN NINH (DEFENSE GATES)
        </div>

        <div className="space-y-2">
          {gates.map((gate) => {
            const isBlocked = gate.status === 'blocked';
            const isRedacted = gate.status === 'redacted';
            const isPassed = gate.status === 'passed';
            const isChecking = gate.status === 'checking';

            return (
              <div
                key={gate.id}
                className={`p-2.5 rounded-xl border-2 flex items-center justify-between transition-all ${
                  isBlocked
                    ? 'bg-red-950/70 border-red-500 shadow-[0_0_15px_rgba(255,0,85,0.4)]'
                    : isRedacted
                    ? 'bg-amber-950/70 border-[#ffd166] shadow-[0_0_15px_rgba(255,209,102,0.4)]'
                    : isPassed
                    ? 'bg-cyan-950/30 border-cyan-400/40'
                    : isChecking
                    ? 'bg-blue-950/60 border-[#00f5ff] animate-pulse shadow-[0_0_12px_#00f5ff]'
                    : 'bg-black/40 border-white/10 opacity-70'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-orbitron font-black ${
                    isBlocked ? 'bg-red-600 text-white' : isRedacted ? 'bg-amber-400 text-black' : isPassed ? 'bg-cyan-500/40 text-cyan-200' : isChecking ? 'bg-[#00f5ff] text-black font-black' : 'bg-gray-800 text-gray-400'
                  }`}>
                    {gate.id}
                  </span>
                  <div>
                    <div className="font-chakra font-bold text-xs sm:text-sm text-white">{gate.name}</div>
                    <div className="text-[11px] font-mono-tech text-gray-300">{gate.description}</div>
                    {gate.detail && gate.status !== 'idle' && gate.status !== 'checking' && (
                      <div className={`text-[11px] font-mono-tech mt-0.5 ${
                        isBlocked ? 'text-red-300' : isRedacted ? 'text-amber-200' : gate.status === 'skipped' ? 'text-gray-400' : 'text-cyan-200'
                      }`}>
                        ↳ {gate.detail}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  {isBlocked && (
                    <span className="px-2.5 py-1 text-[10px] font-chakra font-bold uppercase rounded bg-red-600 text-white flex items-center gap-1 shadow-[0_0_8px_#ff0055]">
                      <AlertOctagon className="w-3.5 h-3.5" /> CHẶN ĐỨNG
                    </span>
                  )}
                  {isRedacted && (
                    <span className="px-2.5 py-1 text-[10px] font-chakra font-bold uppercase rounded bg-amber-400 text-black flex items-center gap-1 shadow-[0_0_8px_#ffd166]">
                      <EyeOff className="w-3.5 h-3.5" /> ĐÃ CHE GIẤU
                    </span>
                  )}
                  {isPassed && (
                    <span className="px-2.5 py-1 text-[10px] font-chakra font-bold uppercase rounded bg-cyan-500/30 text-cyan-200 border border-cyan-400/50 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> CHO QUA
                    </span>
                  )}
                  {isChecking && (
                    <span className="px-2.5 py-1 text-[10px] font-chakra font-bold uppercase rounded bg-blue-500/40 text-cyan-200 border border-cyan-400 animate-pulse">
                      ĐANG QUÉT...
                    </span>
                  )}
                  {gate.status === 'skipped' && (
                    <span className="px-2.5 py-1 text-[10px] font-chakra font-bold uppercase rounded bg-gray-800 text-gray-300 border border-white/15">
                      BỎ QUA
                    </span>
                  )}
                  {gate.status === 'idle' && (
                    <span className="px-2.5 py-1 text-[10px] font-mono-tech rounded bg-gray-900 text-gray-400 border border-white/5">
                      CHỜ LỆNH
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Official VinBank Response Terminal */}
      <div className="mt-auto pt-3 border-t-2 border-cyan-400/30 flex flex-col">
        <div className="flex items-center justify-between text-xs font-chakra font-bold text-gray-200 mb-1.5">
          <span className="flex items-center gap-1.5 text-[#00f5ff]">
            <Server className="w-4 h-4 text-[#00f5ff]" /> Phản Hồi Chính Thức Của Bot:
          </span>
          {lastResult && (
            <span className="text-xs font-mono-tech text-cyan-300">
              Độ trễ: {lastResult.latencyMs}ms
            </span>
          )}
        </div>

        <div className="relative min-h-[110px] p-3.5 bg-black/80 border border-cyan-400/40 rounded-xl text-xs font-mono-tech text-gray-100 shadow-inner">
          {isBattling ? (
            <div className="flex items-center gap-2 text-[#00f5ff] animate-pulse pt-6 justify-center">
              <Activity className="w-4 h-4 animate-spin" />
              <span className="font-chakra text-xs font-semibold">Đang kiểm duyệt qua luồng an ninh 5 tầng...</span>
            </div>
          ) : lastResult ? (
            <div className="space-y-2">
              <p className="leading-relaxed font-sans text-xs sm:text-sm text-gray-100 font-medium">
                {lastResult.response}
              </p>
              <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs">
                <span className="text-cyan-200/80 font-mono-tech text-[11px] line-clamp-1">
                  {lastResult.gateTriggered ? `🛡️ Lá chắn can thiệp: Cửa ${lastResult.gateTriggered}` : '🤖 Phản hồi nghiệp vụ ngân hàng'}
                </span>
                {lastResult.leakedSecret ? (
                  <span className="px-2.5 py-0.5 bg-red-950 text-red-400 border border-red-500 rounded font-chakra font-bold shrink-0">
                    BỊ LỘ BÍ MẬT!
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 bg-cyan-950 text-[#00f5ff] border border-cyan-400 rounded font-chakra font-bold shrink-0">
                    BẢO MẬT 100%
                  </span>
                )}
              </div>
            </div>
          ) : (
            <p className="text-gray-400 italic pt-8 text-center text-xs font-chakra">
              Chọn chiêu thức bên Red hoặc bấm LƯỢT NGẪU NHIÊN để quan sát từng bước phòng thủ.
            </p>
          )}
        </div>
      </div>

    </div>
  );
};
