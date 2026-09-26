'use client';

import React from 'react';
import { Skull, Shield, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface VerdictToastProps {
  verdict?: {
    winner: 'RED' | 'BLUE';
    title: string;
    points: number;
    description: string;
  };
  onClose: () => void;
}

export const VerdictToast: React.FC<VerdictToastProps> = ({ verdict, onClose }) => {
  if (!verdict) return null;

  const isRed = verdict.winner === 'RED';

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 duration-300">
      <div
        className={`p-4 rounded-2xl border-2 shadow-2xl backdrop-blur-xl max-w-sm sm:max-w-md flex items-start gap-3.5 ${
          isRed
            ? 'bg-red-950/95 border-red-500 shadow-[0_0_30px_rgba(255,69,0,0.5)]'
            : 'bg-[#021825]/95 border-cyan-400 shadow-[0_0_30px_rgba(0,245,255,0.5)]'
        }`}
      >
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${
            isRed
              ? 'bg-red-500/20 text-[#ff4500] border-red-500/40'
              : 'bg-cyan-500/20 text-[#00f5ff] border-cyan-400/40'
          }`}
        >
          {isRed ? <Skull className="w-6 h-6" /> : <Shield className="w-6 h-6" />}
        </div>

        <div className="flex-1 pr-2">
          <div className="flex items-center justify-between">
            <h4
              className={`font-orbitron font-black text-sm tracking-wide uppercase ${
                isRed ? 'text-red-400' : 'text-[#00f5ff]'
              }`}
            >
              {verdict.title}
            </h4>
            <span
              className={`font-mono-tech font-black text-xs px-2.5 py-0.5 rounded-full uppercase border ${
                isRed
                  ? 'bg-red-500/30 text-red-200 border-red-500/40'
                  : 'bg-cyan-500/30 text-cyan-200 border-cyan-400/40'
              }`}
            >
              {isRed ? 'MẤT 1 VẠCH MÁU' : 'BẢO TOÀN MÁU'}
            </span>
          </div>
          <p className="text-xs text-gray-200 mt-1.5 leading-relaxed font-chakra">
            {verdict.description}
          </p>
        </div>

        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white text-xs font-bold p-1 cursor-pointer"
        >
          ✕
        </button>
      </div>
    </div>
  );
};
