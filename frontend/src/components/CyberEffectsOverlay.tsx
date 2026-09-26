'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface CyberEffectsOverlayProps {
  isBattling: boolean;
  verdictWinner?: 'RED' | 'BLUE' | 'DRAW';
}

export const CyberEffectsOverlay: React.FC<CyberEffectsOverlayProps> = ({
  isBattling,
  verdictWinner,
}) => {
  const laserRef = useRef<SVGGElement | null>(null);
  const shieldRef = useRef<SVGGElement | null>(null);
  const sparksRef = useRef<SVGGElement | null>(null);

  useEffect(() => {
    if (isBattling) {
      // 1. Kích hoạt Laser beam từ Red (trái) sang Blue (phải)
      if (laserRef.current) {
        gsap.fromTo(
          laserRef.current,
          { opacity: 0, scaleX: 0, transformOrigin: 'left center' },
          { opacity: 1, scaleX: 1, duration: 0.35, ease: 'power2.inOut' }
        );
      }
    } else if (verdictWinner) {
      if (verdictWinner === 'BLUE') {
        // Lá chắn Blue kích hoạt bùng sáng phản xạ đòn đánh
        if (shieldRef.current) {
          gsap.fromTo(
            shieldRef.current,
            { scale: 0.5, opacity: 0, transformOrigin: 'center center' },
            {
              scale: 1.2,
              opacity: 1,
              duration: 0.3,
              yoyo: true,
              repeat: 1,
              ease: 'elastic.out(1, 0.5)',
            }
          );
        }
        if (laserRef.current) {
          gsap.to(laserRef.current, { opacity: 0, duration: 0.2 });
        }
      } else if (verdictWinner === 'RED') {
        // Red xuyên thủng: Tia laser nổ hạt lửa
        if (sparksRef.current) {
          gsap.fromTo(
            sparksRef.current,
            { scale: 0.2, opacity: 1, transformOrigin: 'center center' },
            { scale: 2.2, opacity: 0, duration: 0.6, ease: 'power3.out' }
          );
        }
        if (laserRef.current) {
          gsap.to(laserRef.current, { opacity: 0, duration: 0.4 });
        }
      }
    }
  }, [isBattling, verdictWinner]);

  return (
    <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
      <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          {/* Laser Gradient */}
          <linearGradient id="laserGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ff0055" stopOpacity="0.8" />
            <stop offset="70%" stopColor="#ff3366" stopOpacity="1" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="1" />
          </linearGradient>

          {/* Shield Glow */}
          <radialGradient id="shieldGlow">
            <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.9" />
            <stop offset="60%" stopColor="#0077ff" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* 1. Laser Beam Stream */}
        <g ref={laserRef} className="opacity-0">
          <line
            x1="25%"
            y1="50%"
            x2="70%"
            y2="50%"
            stroke="url(#laserGrad)"
            strokeWidth="5"
            strokeLinecap="round"
            className="filter drop-shadow-[0_0_12px_#ff0055]"
          />
          <line
            x1="25%"
            y1="50%"
            x2="70%"
            y2="50%"
            stroke="#ffffff"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </g>

        {/* 2. Blue Team Hexagonal Energy Shield */}
        <g ref={shieldRef} className="opacity-0">
          <polygon
            points="700,320 740,360 740,420 700,460 660,420 660,360"
            fill="url(#shieldGlow)"
            stroke="#00f0ff"
            strokeWidth="3"
            className="filter drop-shadow-[0_0_20px_#00f0ff]"
          />
          <circle cx="700" cy="390" r="45" fill="none" stroke="#70f8ff" strokeWidth="1.5" strokeDasharray="6 3" />
        </g>

        {/* 3. Red Team Breach Sparks */}
        <g ref={sparksRef} className="opacity-0">
          <circle cx="700" cy="390" r="30" fill="#ff0055" className="filter drop-shadow-[0_0_25px_#ff0055]" />
          <circle cx="700" cy="390" r="10" fill="#ffffff" />
        </g>
      </svg>
    </div>
  );
};
