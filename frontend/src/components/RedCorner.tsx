'use client';

import React from 'react';
import { Skull, Zap, Send, ShieldCheck, Target, Terminal, Flame, Play } from 'lucide-react';
import { AgentType } from '../types';
import { ATTACK_PRESETS, SAFE_PRESETS } from '../data/battlePresets';

interface RedCornerProps {
  selectedAgent: AgentType;
  onChangeAgent: (agent: AgentType) => void;
  promptInput: string;
  onChangePrompt: (prompt: string) => void;
  onFireAttack: (prompt: string) => void;
  isBattling: boolean;
}

export const RedCorner: React.FC<RedCornerProps> = ({
  selectedAgent,
  onChangeAgent,
  promptInput,
  onChangePrompt,
  onFireAttack,
  isBattling,
}) => {
  return (
    <div className="flex-1 flex flex-col h-full tron-panel-red p-4 sm:p-5 overflow-y-auto">
      
      {/* Header Profile Switcher */}
      <div className="flex items-center justify-between pb-3 border-b-2 border-[#ff4500]/30">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-[#200600] border-2 border-[#ff4500] flex items-center justify-center text-[#ff4500] shadow-[0_0_15px_rgba(255,69,0,0.5)]">
            <Skull className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-orbitron font-black text-sm sm:text-base text-white tracking-wider glow-text-orange flex items-center gap-1.5">
              RED ADVERSARY
            </h2>
            <p className="text-xs font-mono-tech text-gray-400">Jailbreak & Extraction</p>
          </div>
        </div>

        {/* Profile Tabs */}
        <div className="flex items-center gap-1 bg-black/60 p-1 rounded-lg border border-[#ff4500]/30 text-xs font-mono-tech">
          <button
            onClick={() => onChangeAgent('red_default')}
            className={`px-2.5 py-1 rounded font-bold transition-all ${
              selectedAgent === 'red_default'
                ? 'bg-[#ff4500] text-black shadow-[0_0_10px_#ff4500]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Default
          </button>
          <button
            onClick={() => onChangeAgent('red_advance')}
            className={`px-2.5 py-1 rounded font-bold transition-all ${
              selectedAgent === 'red_advance'
                ? 'bg-[#cc3300] text-white shadow-[0_0_10px_rgba(255,69,0,0.6)]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Advance
          </button>
          <button
            onClick={() => onChangeAgent('blue_guard')}
            className={`px-2.5 py-1 rounded font-bold transition-all ${
              selectedAgent === 'blue_guard'
                ? 'bg-[#00f5ff] text-black shadow-[0_0_10px_#00f5ff]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Vs Blue
          </button>
        </div>
      </div>

      {/* Target Secret Bounty */}
      <div className="my-2.5 px-3 py-2 bg-black/50 border border-[#ff4500]/30 rounded-lg flex items-center justify-between text-xs font-mono-tech">
        <span className="text-gray-400 flex items-center gap-1.5 font-chakra font-semibold">
          <Target className="w-3.5 h-3.5 text-[#ff4500]" /> Secret Mục Tiêu:
        </span>
        <div className="space-x-1 font-bold text-orange-200">
          <span className="px-1.5 py-0.5 rounded bg-[#2a0800] border border-[#ff4500]/30">admin123</span>
          <span className="px-1.5 py-0.5 rounded bg-[#2a0800] border border-[#ff4500]/30">api_key</span>
          <span className="px-1.5 py-0.5 rounded bg-[#2a0800] border border-[#ff4500]/30">db_host</span>
        </div>
      </div>

      {/* 5 Attack Weapon Slots (Game Style) */}
      <div className="space-y-2 mb-3">
        <div className="text-xs font-chakra font-bold text-gray-300 flex items-center gap-1.5 uppercase tracking-wider">
          <Zap className="w-3.5 h-3.5 text-[#ff4500]" /> KHO CHIÊU THỨC TẤN CÔNG (CP4)
        </div>

        <div className="grid grid-cols-1 gap-2">
          {ATTACK_PRESETS.map((preset, index) => (
            <button
              key={preset.id}
              onClick={() => {
                onChangePrompt(preset.prompt);
                onFireAttack(preset.prompt);
              }}
              disabled={isBattling}
              className="text-left p-2.5 bg-[#0f0402] hover:bg-[#250800] border border-[#ff4500]/30 hover:border-[#ff4500] rounded-xl transition-all group disabled:opacity-40 flex items-center justify-between shadow-sm hover:shadow-[0_0_15px_rgba(255,69,0,0.3)]"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-lg bg-[#ff4500]/20 text-[#ff4500] text-xs font-orbitron font-bold flex items-center justify-center border border-[#ff4500]/40">
                  {index + 1}
                </span>
                <div>
                  <div className="font-chakra font-bold text-xs sm:text-sm text-white group-hover:text-orange-200">
                    {preset.name}
                  </div>
                  <div className="text-[11px] font-mono-tech text-gray-400">
                    {preset.technique}
                  </div>
                </div>
              </div>

              <span className="p-1.5 bg-[#ff4500]/20 text-[#ff4500] rounded-lg group-hover:bg-[#ff4500] group-hover:text-black transition-all">
                <Play className="w-3.5 h-3.5 fill-current" />
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Benign / Safe Queries Selector (Quick Pill Buttons) */}
      <div className="mb-3 space-y-1.5">
        <div className="text-[11px] font-chakra font-bold text-emerald-400 flex items-center gap-1 uppercase tracking-wider">
          <ShieldCheck className="w-3 h-3" /> CÂU HỎI AN TOÀN (TEST FALSE POSITIVE)
        </div>
        <div className="flex flex-wrap gap-1.5">
          {SAFE_PRESETS.slice(0, 3).map((safe) => (
            <button
              key={safe.id}
              onClick={() => {
                onChangePrompt(safe.prompt);
                onFireAttack(safe.prompt);
              }}
              disabled={isBattling}
              className="px-2.5 py-1 text-xs font-chakra bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-200 border border-emerald-500/30 rounded-lg transition-all disabled:opacity-40"
            >
              {safe.name}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Prompt Input & Fire Button */}
      <div className="mt-auto pt-3 border-t-2 border-[#ff4500]/30 space-y-2">
        <div className="flex items-center justify-between text-xs font-chakra font-bold text-gray-300">
          <span className="flex items-center gap-1.5 text-[#ff5500]">
            <Terminal className="w-3.5 h-3.5" /> Payload Tùy Chỉnh:
          </span>
          <span className="text-[10px] font-mono-tech text-gray-400">[Enter để bắn]</span>
        </div>

        <div className="relative">
          <textarea
            value={promptInput}
            onChange={(e) => onChangePrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (promptInput.trim() && !isBattling) onFireAttack(promptInput);
              }
            }}
            placeholder="Nhập prompt thử thách hệ thống bảo mật..."
            rows={2}
            disabled={isBattling}
            className="w-full p-3 pr-24 text-xs sm:text-sm font-mono-tech bg-black/80 border-2 border-[#ff4500]/40 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#ff4500] focus:ring-1 focus:ring-[#ff4500] transition-all resize-none shadow-inner"
          />
          <button
            onClick={() => onFireAttack(promptInput)}
            disabled={isBattling || !promptInput.trim()}
            className="absolute right-2.5 bottom-3 px-4 py-2 bg-gradient-to-r from-[#ff4500] to-[#ff2200] hover:from-[#ff5500] hover:to-[#ff3300] disabled:opacity-40 text-black font-orbitron font-black text-xs rounded-lg shadow-md shadow-[#ff4500]/40 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>BẮN</span>
          </button>
        </div>
      </div>

    </div>
  );
};
