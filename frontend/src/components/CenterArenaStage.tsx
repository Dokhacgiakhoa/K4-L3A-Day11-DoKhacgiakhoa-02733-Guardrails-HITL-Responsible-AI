'use client';

import React from 'react';
import { Activity } from 'lucide-react';
import { BattleStep, RoundResult } from '../types';

interface CenterArenaStageProps {
  isBattling: boolean;
  currentStep: BattleStep;
  stepMessage: string;
  lastResult?: RoundResult;
  vaultBars?: number;
  maxBars?: number;
}

export const CenterArenaStage: React.FC<CenterArenaStageProps> = ({
  isBattling,
  currentStep,
  stepMessage,
  lastResult,
}) => {
  return (
    <div className="relative flex flex-col items-center justify-between w-full md:w-[340px] lg:w-[400px] h-full bg-battle-field border-x border-white/10 p-4 shrink-0 overflow-hidden shadow-[inset_0_0_40px_rgba(0,0,0,0.9)]">
      
      {/* Top Combat Stage Header */}
      <div className="relative z-10 w-full text-center py-2 px-3 bg-black/80 border border-white/10 rounded-xl backdrop-blur-md">
        <span className="text-[10px] font-mono-tech tracking-widest text-[#ffd166] font-extrabold uppercase">
          ⚔️ ĐẤU TRƯỜNG AN NINH AI // TRỰC TIẾP
        </span>
        <div className="text-xs font-chakra text-white font-bold mt-0.5 line-clamp-1">
          {stepMessage}
        </div>
      </div>

      {/* Sơ Đồ Luồng AI Từng Bước 1 Giây (AI Security Telemetry Pipeline - Đồng đều 4 ô) */}
      <div className="relative z-10 w-full my-2 p-2.5 bg-black/75 border border-white/10 rounded-xl space-y-1.5 shadow-md">
        <div className="flex items-center justify-between text-gray-400 font-bold px-1 text-[10px] font-mono-tech">
          <span>TIẾN TRÌNH KIỂM SOÁT AN NINH AI (THEO THỨ TỰ THỰC THI)</span>
        </div>
        
        <div className="grid grid-cols-4 gap-1.5 text-center">
          {/* Step 1: Prompt Injection */}
          <div className={`min-h-[48px] flex flex-col items-center justify-center p-1 rounded-lg border transition-all ${
            currentStep === 'step1_attack'
              ? 'bg-[#ff4500]/30 border-[#ff4500] text-white shadow-[0_0_10px_#ff4500]'
              : 'bg-black/50 border-white/10 text-gray-400'
          }`}>
            <span className="font-bold text-[10px] block leading-tight font-chakra">1. INJECTION</span>
            <span className="text-[9px] text-gray-300 mt-0.5 leading-none">Đòn Tấn Công</span>
          </div>

          {/* Step 2: Input Guard */}
          <div className={`min-h-[48px] flex flex-col items-center justify-center p-1 rounded-lg border transition-all ${
            currentStep === 'step2_input_guard'
              ? 'bg-cyan-500/30 border-cyan-400 text-white shadow-[0_0_10px_#00f5ff]'
              : 'bg-black/50 border-white/10 text-gray-400'
          }`}>
            <span className="font-bold text-[10px] block leading-tight font-chakra">2. CỬA VÀO</span>
            <span className="text-[9px] text-gray-300 mt-0.5 leading-none">Lọc Độc Hại</span>
          </div>

          {/* Step 3: Core LLM */}
          <div className={`min-h-[48px] flex flex-col items-center justify-center p-1 rounded-lg border transition-all ${
            currentStep === 'step3_llm'
              ? 'bg-purple-500/30 border-purple-400 text-white shadow-[0_0_10px_#a855f7]'
              : 'bg-black/50 border-white/10 text-gray-400'
          }`}>
            <span className="font-bold text-[10px] block leading-tight font-chakra">3. CORE LLM</span>
            <span className="text-[9px] text-gray-300 mt-0.5 leading-none">Bot Suy Luận</span>
          </div>

          {/* Step 4: Output Guard */}
          <div className={`min-h-[48px] flex flex-col items-center justify-center p-1 rounded-lg border transition-all ${
            currentStep === 'step4_output_guard'
              ? 'bg-amber-500/30 border-amber-400 text-white shadow-[0_0_10px_#ffd166]'
              : 'bg-black/50 border-white/10 text-gray-400'
          }`}>
            <span className="font-bold text-[10px] block leading-tight font-chakra">4. CỬA RA</span>
            <span className="text-[9px] text-gray-300 mt-0.5 leading-none">Lọc Secret</span>
          </div>
        </div>
      </div>

      {/* KHU VỰC HIỂN THỊ CHỮ TRUNG TÂM (ĐÃ BỎ HOÀN TOÀN HÌNH TRÒN, KHIÊN VÀ HOẠT ẢNH RỐI MẮT) */}
      <div className="relative z-10 my-auto w-full px-2">
        {isBattling ? (
          <div className="flex flex-col items-center justify-center text-center p-6 bg-black/60 border border-cyan-400/40 rounded-2xl backdrop-blur-md shadow-[0_0_20px_rgba(0,245,255,0.1)]">
            <div className="text-base sm:text-lg font-orbitron font-black text-[#ffd166] tracking-wider animate-pulse">
              ⚡ ĐANG KIỂM SOÁT AN NINH...
            </div>
            <div className="text-xs font-chakra text-cyan-200 mt-2 font-medium">
              Đang phân tích gói tin qua 5 tầng phòng tuyến VinBank
            </div>
          </div>
        ) : lastResult ? (
          lastResult.winner === 'BLUE' ? (
            <div className="flex flex-col items-center justify-center text-center p-6 bg-emerald-950/50 border-2 border-[#00ff88] rounded-2xl backdrop-blur-md shadow-[0_0_30px_rgba(0,255,136,0.25)]">
              <div className="text-xl sm:text-2xl font-orbitron font-black text-[#00ff88] tracking-wider uppercase glow-text-green leading-tight">
                PHÒNG THỦ THÀNH CÔNG
              </div>
              <div className="text-xs sm:text-sm font-chakra text-white font-bold mt-2.5 tracking-wide">
                {lastResult.gateTriggered
                  ? `CỬA ${lastResult.gateTriggered} ĐÃ ${lastResult.outputGuardStatus === 'REDACTED' ? 'CHE GIẤU SECRET' : 'CHẶN ĐỨNG ĐÒN TẤN CÔNG'}`
                  : 'KHÔNG LỘ BÍ MẬT — TRẢ LỜI HỢP LỆ'}
              </div>
              <div className="text-xs font-mono-tech text-emerald-300 mt-1">
                Bảo toàn nguyên vẹn vạch máu Vault ngân hàng
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-6 bg-red-950/40 border-2 border-red-500 rounded-2xl backdrop-blur-md shadow-[0_0_25px_rgba(255,0,85,0.2)]">
              <div className="text-xl sm:text-2xl font-orbitron font-black text-red-400 tracking-wider uppercase glow-text-orange leading-tight">
                ĐỘT KÍCH THÀNH CÔNG
              </div>
              <div className="text-xs sm:text-sm font-chakra text-white font-bold mt-2.5 tracking-wide">
                PHÁT HIỆN RÒ RỈ THÔNG TIN BÍ MẬT!
              </div>
              <div className="text-xs font-mono-tech text-red-300 mt-1">
                Bị trừ 1 vạch máu Vault ngân hàng
              </div>
            </div>
          )
        ) : (
          <div className="flex flex-col items-center justify-center text-center p-6 bg-emerald-950/30 border border-emerald-500/40 rounded-2xl backdrop-blur-md shadow-[0_0_20px_rgba(0,255,136,0.15)]">
            <div className="text-base sm:text-lg font-orbitron font-black text-[#00ff88] tracking-wider glow-text-green">
              HỆ THỐNG TRỰC CHIẾN AN TOÀN
            </div>
            <div className="text-xs font-chakra text-emerald-100/80 mt-1.5 font-medium">
              Chọn chiêu thức bên Red hoặc bấm LƯỢT NGẪU NHIÊN để bắt đầu
            </div>
          </div>
        )}
      </div>

      {/* Bottom Telemetry HUD: Phân Tích Kỹ Thuật Đợt Tấn Công */}
      <div className="relative z-10 w-full p-3 bg-black/85 border border-white/10 rounded-xl space-y-2 backdrop-blur-md">
        <div className="flex items-center justify-between text-[11px] font-mono-tech border-b border-white/10 pb-1.5">
          <span className="text-gray-300 font-bold flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-[#00f5ff]" />
            THÔNG SỐ PHÂN TÍCH LƯỢT ĐẤU
          </span>
          {lastResult && (
            <span className="text-[10px] font-mono-tech text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/30">
              {lastResult.latencyMs}ms
            </span>
          )}
        </div>

        {lastResult ? (
          <div className="space-y-1.5 text-xs font-chakra">
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-[11px]">Kỹ thuật Injection:</span>
              <span className="font-bold text-orange-400 font-mono-tech">{lastResult.injectionTechnique}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-[11px]">Lá chắn xử lý:</span>
              <span className={`font-bold font-mono-tech ${lastResult.winner === 'BLUE' ? 'text-[#00f5ff]' : 'text-red-400'}`}>
                {lastResult.gateTriggered ? `Cửa ${lastResult.gateTriggered} (${lastResult.inputGuardStatus === 'BLOCKED' ? 'Chặn đứng' : 'Che giấu'})` : 'Vượt qua tất cả'}
              </span>
            </div>
            <div className="p-1.5 bg-black/60 rounded border border-white/5 text-[11px] text-gray-300 leading-tight">
              <span className="text-gray-400 font-mono-tech">Đánh giá: </span>
              {lastResult.reason}
            </div>
          </div>
        ) : (
          <div className="py-2.5 text-center text-[11px] text-gray-400 font-chakra italic">
            Sẵn sàng phân tích gói tin injection và phản hồi của 5 lá chắn an ninh...
          </div>
        )}
      </div>

    </div>
  );
};
