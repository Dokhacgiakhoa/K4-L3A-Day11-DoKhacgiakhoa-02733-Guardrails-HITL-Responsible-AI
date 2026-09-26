'use client';

import React from 'react';
import { Shield, CheckCircle2, AlertOctagon, Lock, EyeOff, Activity, Cpu, Server } from 'lucide-react';
import { GateInfo, RoundResult } from '../types';

interface BlueCornerProps {
  vaultHp: number;
  gates: GateInfo[];
  lastResult?: RoundResult;
  isBattling: boolean;
}

export const BlueCorner: React.FC<BlueCornerProps> = ({
  vaultHp,
  gates,
  lastResult,
  isBattling,
}) => {
  return (
    <div className="flex-1 flex flex-col h-full tron-panel-blue p-4 sm:p-5 overflow-y-auto">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b-2 border-cyan-400/30">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-[#02131f] border-2 border-[#00f5ff] flex items-center justify-center text-[#00f5ff] shadow-[0_0_15px_rgba(0,245,255,0.5)]">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-orbitron font-black text-sm sm:text-base text-white tracking-wider glow-text-cyan flex items-center gap-1.5">
              BLUE GUARDIAN
            </h2>
            <p className="text-xs font-mono-tech text-gray-400">5-Tier VinBank Defense</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono-tech text-[#00f5ff] font-bold">
          <span className="w-2.5 h-2.5 rounded-full bg-[#00f5ff] animate-ping shadow-[0_0_8px_#00f5ff]"></span>
          <span>GRID SECURE</span>
        </div>
      </div>

      {/* Quantum Vault Health Bar */}
      <div className="my-2.5 p-3 bg-black/60 border border-cyan-400/40 rounded-xl space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-chakra font-bold text-gray-200 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-[#00f5ff]" /> VINBANK QUANTUM VAULT HP
          </span>
          <span className="font-orbitron font-black text-sm text-[#00f5ff] glow-text-cyan">
            {vaultHp}%
          </span>
        </div>
        <div className="w-full h-3 bg-[#010612] rounded-full overflow-hidden p-0.5 border border-cyan-400/40">
          <div
            className={`h-full rounded-full transition-all duration-500 bg-gradient-to-r ${
              vaultHp > 60 ? 'from-[#00f5ff] to-[#00ff88]' : vaultHp > 30 ? 'from-[#ffd166] to-[#ff9900]' : 'from-[#ff4500] to-[#ff0055] animate-pulse'
            }`}
            style={{ width: `${Math.max(vaultHp, 0)}%` }}
          />
        </div>
      </div>

      {/* 5 Defense Gates Energy Nodes (Clean Game Design) */}
      <div className="space-y-1.5 mb-3">
        <div className="text-xs font-chakra font-bold text-gray-200 flex items-center gap-1.5 uppercase tracking-wider">
          <Cpu className="w-3.5 h-3.5 text-[#00f5ff]" /> 5 LÁ CHẮN BẢO MẬT (DEFENSE GATES)
        </div>

        <div className="space-y-1.5">
          {gates.map((gate) => {
            const isBlocked = gate.status === 'blocked';
            const isRedacted = gate.status === 'redacted';
            const isPassed = gate.status === 'passed';
            const isChecking = gate.status === 'checking';

            return (
              <div
                key={gate.id}
                className={`p-2 rounded-xl border flex items-center justify-between transition-all ${
                  isBlocked
                    ? 'bg-red-950/70 border-red-500 shadow-[0_0_15px_rgba(255,0,85,0.4)]'
                    : isRedacted
                    ? 'bg-amber-950/70 border-[#ffd166] shadow-[0_0_15px_rgba(255,209,102,0.4)]'
                    : isPassed
                    ? 'bg-cyan-950/30 border-cyan-400/40'
                    : isChecking
                    ? 'bg-blue-950/50 border-[#00f5ff] animate-pulse'
                    : 'bg-black/40 border-white/10 opacity-70'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-orbitron font-black ${
                    isBlocked ? 'bg-red-600 text-white' : isRedacted ? 'bg-amber-400 text-black' : isPassed ? 'bg-cyan-500/40 text-cyan-200' : 'bg-gray-800 text-gray-400'
                  }`}>
                    {gate.id}
                  </span>
                  <div>
                    <div className="font-chakra font-bold text-xs sm:text-sm text-white">{gate.name}</div>
                    <div className="text-[10px] font-mono-tech text-gray-400">{gate.description}</div>
                  </div>
                </div>

                <div>
                  {isBlocked && (
                    <span className="px-2 py-0.5 text-[10px] font-orbitron font-extrabold uppercase rounded bg-red-600 text-white flex items-center gap-1 shadow-[0_0_8px_#ff0055]">
                      <AlertOctagon className="w-3 h-3" /> BLOCKED
                    </span>
                  )}
                  {isRedacted && (
                    <span className="px-2 py-0.5 text-[10px] font-orbitron font-extrabold uppercase rounded bg-amber-400 text-black flex items-center gap-1 shadow-[0_0_8px_#ffd166]">
                      <EyeOff className="w-3 h-3" /> REDACTED
                    </span>
                  )}
                  {isPassed && (
                    <span className="px-2 py-0.5 text-[10px] font-orbitron font-bold uppercase rounded bg-cyan-500/30 text-cyan-200 border border-cyan-400/50 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> PASSED
                    </span>
                  )}
                  {isChecking && (
                    <span className="px-2 py-0.5 text-[10px] font-orbitron font-bold uppercase rounded bg-blue-500/30 text-cyan-200 border border-cyan-400 animate-pulse">
                      SCANNING
                    </span>
                  )}
                  {gate.status === 'idle' && (
                    <span className="px-2 py-0.5 text-[10px] font-mono-tech rounded bg-gray-900 text-gray-500 border border-white/5">
                      STANDBY
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
        <div className="flex items-center justify-between text-xs font-chakra font-bold text-gray-200 mb-1">
          <span className="flex items-center gap-1.5 text-[#00f5ff]">
            <Server className="w-3.5 h-3.5" /> Phản Hồi Chính Thức VinBank:
          </span>
          {lastResult && (
            <span className="text-[11px] font-mono-tech text-cyan-300">
              Độ trễ: {lastResult.latencyMs}ms
            </span>
          )}
        </div>

        <div className="relative min-h-[90px] p-3 bg-black/80 border border-cyan-400/40 rounded-xl text-xs font-mono-tech text-gray-100 shadow-inner">
          {isBattling ? (
            <div className="flex items-center gap-2 text-[#00f5ff] animate-pulse pt-4 justify-center">
              <Activity className="w-4 h-4 animate-spin" />
              <span className="font-chakra text-xs font-semibold">Đang thẩm định qua 5 tầng bảo mật...</span>
            </div>
          ) : lastResult ? (
            <div className="space-y-2">
              <p className="leading-relaxed font-sans text-xs text-gray-100 font-medium">
                {lastResult.response}
              </p>
              <div className="flex items-center justify-between pt-1.5 border-t border-white/10 text-[11px]">
                <span className="text-gray-400 italic line-clamp-1">{lastResult.reason}</span>
                {lastResult.leakedSecret ? (
                  <span className="px-2 py-0.5 bg-red-950 text-red-400 border border-red-500 rounded font-orbitron font-bold shrink-0">
                    BREACHED
                  </span>
                ) : (
                  <span className="px-2 py-0.5 bg-cyan-950 text-[#00f5ff] border border-cyan-400 rounded font-orbitron font-bold shrink-0">
                    SECURED
                  </span>
                )}
              </div>
            </div>
          ) : (
            <p className="text-gray-500 italic pt-6 text-center text-xs">
              Chọn chiêu thức bên Red hoặc gõ prompt và bấm BẮN để kiểm tra phòng tuyến.
            </p>
          )}
        </div>
      </div>

    </div>
  );
};
