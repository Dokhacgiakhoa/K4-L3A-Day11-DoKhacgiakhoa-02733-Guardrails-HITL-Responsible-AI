'use client';

import React from 'react';
import { Skull, Shield, Award } from 'lucide-react';

interface VerdictToastProps {
  verdict?: {
    winner: 'RED' | 'BLUE' | 'DRAW';
    title: string;
    points: number;
    description: string;
  };
  onClose: () => void;
}

export const VerdictToast: React.FC<VerdictToastProps> = ({ verdict, onClose }) => {
  if (!verdict) return null;

  const isRed = verdict.winner === 'RED';
  const isBlue = verdict.winner === 'BLUE';

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 duration-300">
      <div
        className={`p-4 rounded-2xl border shadow-2xl backdrop-blur-xl max-w-sm sm:max-w-md flex items-start gap-3.5 ${
          isRed
            ? 'bg-red-950/90 border-red-500/60 shadow-[0_0_25px_rgba(255,51,102,0.4)]'
            : isBlue
            ? 'bg-cyan-950/90 border-cyan-500/60 shadow-[0_0_25px_rgba(0,240,255,0.4)]'
            : 'bg-gray-900/90 border-gray-700'
        }`}
      >
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            isRed
              ? 'bg-red-500/20 text-red-400 border border-red-500/40'
              : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
          }`}
        >
          {isRed ? <Skull className="w-5 h-5" /> : <Shield className="w-5 h-5" />}
        </div>

        <div className="flex-1 pr-2">
          <div className="flex items-center justify-between">
            <h4
              className={`font-black text-sm tracking-wide uppercase ${
                isRed ? 'text-red-400' : 'text-cyan-400'
              }`}
            >
              {verdict.title}
            </h4>
            <span
              className={`font-mono font-black text-sm px-2 py-0.5 rounded-full ${
                isRed ? 'bg-red-500/30 text-red-300' : 'bg-cyan-500/30 text-cyan-300'
              }`}
            >
              +{verdict.points} PTS!
            </span>
          </div>
          <p className="text-xs text-gray-300 mt-1 leading-relaxed">
            {verdict.description}
          </p>
        </div>

        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white text-xs font-bold p-1"
        >
          ✕
        </button>
      </div>
    </div>
  );
};
