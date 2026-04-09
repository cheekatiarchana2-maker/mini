import React from 'react';
import './EnergyFlowAnimation.css';

export default function EnergyFlowAnimation() {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden z-0"
      aria-hidden="true"
    >
      <svg
        className="w-full h-full"
        viewBox="0 0 1400 600"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="diagFlow1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"  stopColor="#38bdf8" stopOpacity="0" />
            <stop offset="30%" stopColor="#a855f7" stopOpacity="0.85" />
            <stop offset="60%" stopColor="#38bdf8" stopOpacity="1" />
            <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
          </linearGradient>

          <linearGradient id="diagFlow2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%"  stopColor="#22c55e" stopOpacity="0" />
            <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
          </linearGradient>

          <linearGradient id="diagFlow3" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%"  stopColor="#a855f7" stopOpacity="0" />
            <stop offset="50%" stopColor="#f97316" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
          </linearGradient>

          <filter id="glow-heavy" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="10" result="b1" />
            <feGaussianBlur stdDeviation="4"  result="b2" />
            <feMerge>
              <feMergeNode in="b1" />
              <feMergeNode in="b2" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="glow-mid" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="5" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Diagonal wave paths */}
          <path id="diagWave1" d="M -100 600 Q 200 350, 500 300 T 900 200 T 1300 50 T 1600 -100" />
          <path id="diagWave2" d="M -100 700 Q 250 450, 600 380 T 1000 250 T 1400 80 T 1700 -50" />
          <path id="diagWave3" d="M -100 500 Q 300 300, 700 250 T 1100 100 T 1500 -80" />

          {/* Circuit path - diagonal zig zag */}
          <path id="circuitDiag"
            d="M -100 550 L 150 550 L 250 400 L 500 400 L 650 250 L 900 250 L 1050 100 L 1300 100 L 1500 -50"
          />
        </defs>

        {/* Ghost track lines */}
        <use href="#diagWave1"   fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
        <use href="#diagWave2"   fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="2" />
        <use href="#circuitDiag" fill="none" stroke="rgba(125,211,252,0.07)"  strokeWidth="3" />

        {/* Circuit pulse */}
        <use
          href="#circuitDiag"
          fill="none"
          stroke="#7dd3fc"
          strokeWidth="4"
          filter="url(#glow-mid)"
          className="diag-circuit"
        />

        {/* Primary diagonal wave */}
        <use
          href="#diagWave1"
          fill="none"
          stroke="url(#diagFlow1)"
          strokeWidth="8"
          strokeLinecap="round"
          filter="url(#glow-heavy)"
          className="diag-wave-primary"
        />

        {/* Secondary diagonal wave (opposite direction) */}
        <use
          href="#diagWave3"
          fill="none"
          stroke="url(#diagFlow2)"
          strokeWidth="5"
          strokeLinecap="round"
          filter="url(#glow-heavy)"
          className="diag-wave-secondary"
        />

        {/* Tertiary accent wave */}
        <use
          href="#diagWave2"
          fill="none"
          stroke="url(#diagFlow3)"
          strokeWidth="3"
          strokeLinecap="round"
          filter="url(#glow-mid)"
          className="diag-wave-tertiary"
        />

        {/* Lightning arc 1 */}
        <path
          d="M 380 370 L 410 310 L 430 360 L 470 290 L 500 340 L 530 290"
          fill="none"
          stroke="#ffffff"
          strokeWidth="3"
          filter="url(#glow-heavy)"
          className="diag-lightning-1"
        />

        {/* Lightning arc 2 */}
        <path
          d="M 820 210 L 855 145 L 870 195 L 910 125 L 940 180 L 970 130"
          fill="none"
          stroke="#c084fc"
          strokeWidth="3"
          filter="url(#glow-heavy)"
          className="diag-lightning-2"
        />
      </svg>
    </div>
  );
}
