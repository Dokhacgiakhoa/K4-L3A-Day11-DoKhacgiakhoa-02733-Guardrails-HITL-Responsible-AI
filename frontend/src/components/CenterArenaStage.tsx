'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Shield, Zap, Sparkles, AlertTriangle, CheckCircle2, Lock } from 'lucide-react';
import { RoundResult } from '../types';

interface CenterArenaStageProps {
  isBattling: boolean;
  lastResult?: RoundResult;
  vaultHp: number;
}

export const CenterArenaStage: React.FC<CenterArenaStageProps> = ({
  isBattling,
  lastResult,
  vaultHp,
}) => {
  const redDiscRef = useRef<HTMLDivElement | null>(null);
  const blueShieldRef = useRef<HTMLDivElement | null>(null);
  const clashSparkRef = useRef<HTMLDivElement | null>(null);
  const arenaContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isBattling) {
      // Đĩa Red phóng từ trái qua giữa với hiệu ứng xoay tròn và vệt sáng
      if (redDiscRef.current) {
        gsap.fromTo(
          redDiscRef.current,
          { x: -160, opacity: 0, scale: 0.5, rotation: 0 },
          { x: 0, opacity: 1, scale: 1.2, rotation: 720, duration: 0.5, ease: 'power2.in' }
        );
      }
    } else if (lastResult) {
      if (lastResult.winner === 'BLUE') {
        // Blue Defend: Lá chắn xuất hiện tại tâm sàn đấu cản văng đĩa Red
        if (blueShieldRef.current && redDiscRef.current && clashSparkRef.current) {
          const tl = gsap.timeline();
          tl.to(clashSparkRef.current, { scale: 2, opacity: 1, duration: 0.15 })
            .to(clashSparkRef.current, { scale: 0, opacity: 0, duration: 0.3 })
            .to(redDiscRef.current, { x: -100, y: -40, opacity: 0, rotation: 1080, duration: 0.4 }, '<')
            .fromTo(blueShieldRef.current, { scale: 0.8, opacity: 0 }, { scale: 1.3, opacity: 1, duration: 0.3, yoyo: true, repeat: 1 }, 0);
        }
      } else if (lastResult.winner === 'RED') {
        // Red Breach: Đĩa Red đâm thủng tâm sàn đấu bay thẳng sang phía Blue
        if (redDiscRef.current && clashSparkRef.current) {
          const tl = gsap.timeline();
          tl.to(redDiscRef.current, { x: 140, scale: 1.4, duration: 0.4, ease: 'power3.in' })
            .to(clashSparkRef.current, { scale: 3, opacity: 1, color: '#ff4500', duration: 0.2 }, '-=0.2')
            .to(clashSparkRef.current, { opacity: 0, duration: 0.4 })
            .to(redDiscRef.current, { opacity: 0, duration: 0.2 });
        }
      }
    }
  }, [isBattling, lastResult]);

  return (
    <div
      ref={arenaContainerRef}
      className="relative flex flex-col items-center justify-between w-full md:w-[320px] lg:w-[380px] h-full bg-[#02050e] border-x-2 border-white/10 p-4 shrink-0 overflow-hidden shadow-[inset_0_0_40px_rgba(0,0,0,0.9)]"
    >
      {/* Background Perspective Grid Floor */}
      <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#00f5ff_1px,transparent_1px)] [background-size:16px_16px]" />

      {/* Top Combat Stage Header */}
      <div className="relative z-10 w-full text-center py-2 px-3 bg-black/60 border border-white/10 rounded-xl backdrop-blur-md">
        <span className="text-[10px] font-mono-tech tracking-widest text-amber-300 font-bold uppercase">
          ⚔️ THE GRID ARENA // LIVE COMBAT
        </span>
        <div className="text-xs font-chakra text-gray-300 font-semibold mt-0.5">
          {isBattling
            ? '🔥 PHÓNG ĐĨA TẤN CÔNG...'
            : lastResult
            ? lastResult.winner === 'RED'
              ? '💥 VAULT BREACH DETECTED!'
              : '🛡️ ATTACK DEFENDED 100%'
            : 'SẴN SÀNG KHỞI TRANH'}
        </div>
      </div>

      {/* Center 3D Battle Ring (Nơi diễn ra va chạm) */}
      <div className="relative z-10 my-auto flex items-center justify-center w-56 h-56 rounded-full border-2 border-dashed border-white/20 bg-gradient-to-b from-transparent via-[#00f5ff]/5 to-transparent">
        
        {/* Outer Orbiting Ring */}
        <div className="absolute inset-2 rounded-full border border-cyan-400/30 animate-spin [animation-duration:12s]" />
        <div className="absolute inset-8 rounded-full border border-orange-500/30 animate-spin [animation-duration:8s] [animation-direction:reverse]" />

        {/* 1. Red Light Disc (Đĩa tấn công của CLU) */}
        <div
          ref={redDiscRef}
          className="absolute w-14 h-14 rounded-full bg-gradient-to-tr from-[#ff4500] via-[#ff7700] to-white border-2 border-[#ff4500] shadow-[0_0_30px_#ff4500] flex items-center justify-center text-black font-black opacity-0"
        >
          <div className="w-6 h-6 rounded-full bg-[#180400] border border-[#ff4500]" />
        </div>

        {/* 2. Blue Light Shield (Lá chắn Tron cản phá) */}
        <div
          ref={blueShieldRef}
          className="absolute w-28 h-28 rounded-full bg-gradient-to-br from-[#00f5ff]/30 to-blue-600/10 border-2 border-[#00f5ff] shadow-[0_0_35px_#00f5ff] flex items-center justify-center opacity-0 backdrop-blur-sm"
        >
          <Shield className="w-12 h-12 text-[#00f5ff] filter drop-shadow-[0_0_12px_#00f5ff]" />
        </div>

        {/* 3. Clash Sparks Sparkle Explosion */}
        <div
          ref={clashSparkRef}
          className="absolute w-20 h-20 rounded-full bg-white opacity-0 filter blur-[2px] shadow-[0_0_40px_#ffffff] flex items-center justify-center pointer-events-none"
        />

        {/* Idle Energy Core in Center */}
        {!isBattling && !lastResult && (
          <div className="flex flex-col items-center gap-1.5 opacity-60">
            <Lock className="w-8 h-8 text-[#00f5ff] animate-pulse" />
            <span className="text-[10px] font-mono-tech text-cyan-300 tracking-wider">SECURE GRID</span>
          </div>
        )}

        {/* Verdict Badge in Center when idle */}
        {!isBattling && lastResult && (
          <div className="flex flex-col items-center text-center animate-in zoom-in-75 duration-300">
            {lastResult.winner === 'RED' ? (
              <>
                <div className="w-12 h-12 rounded-full bg-red-600/30 border-2 border-red-500 flex items-center justify-center shadow-[0_0_20px_#ff0055]">
                  <AlertTriangle className="w-6 h-6 text-red-400" />
                </div>
                <span className="font-orbitron font-black text-sm text-red-400 mt-2 tracking-wider">
                  BREACH!
                </span>
                <span className="text-xs font-mono-tech text-orange-200 mt-0.5">
                  +200 PTS
                </span>
              </>
            ) : (
              <>
                <div className="w-12 h-12 rounded-full bg-cyan-600/30 border-2 border-cyan-400 flex items-center justify-center shadow-[0_0_20px_#00f5ff]">
                  <CheckCircle2 className="w-6 h-6 text-[#00f5ff]" />
                </div>
                <span className="font-orbitron font-black text-sm text-[#00f5ff] mt-2 tracking-wider">
                  DEFENDED!
                </span>
                <span className="text-xs font-mono-tech text-cyan-200 mt-0.5">
                  +150 PTS
                </span>
              </>
            )}
          </div>
        )}

      </div>

      {/* Bottom Telemetry HUD */}
      <div className="relative z-10 w-full p-3 bg-black/70 border border-white/10 rounded-xl space-y-1.5 backdrop-blur-md">
        <div className="flex items-center justify-between text-[11px] font-mono-tech">
          <span className="text-gray-400">VAULT HP:</span>
          <span className="font-bold text-[#00f5ff]">{vaultHp}%</span>
        </div>
        <div className="w-full h-2 bg-gray-900 rounded-full overflow-hidden border border-white/10">
          <div
            className="h-full bg-gradient-to-r from-red-500 via-amber-400 to-[#00f5ff] transition-all duration-500"
            style={{ width: `${vaultHp}%` }}
          />
        </div>
        <div className="text-[10px] text-gray-400 font-mono-tech text-center line-clamp-1">
          {lastResult ? lastResult.reason : 'Sẵn sàng ghi nhận diễn biến...'}
        </div>
      </div>

    </div>
  );
};
