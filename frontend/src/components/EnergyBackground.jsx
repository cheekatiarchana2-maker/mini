import React from 'react';

export default function EnergyBackground() {
  return (
    <div className="energy-bg fixed inset-0 pointer-events-none">
      {/* Energy Lines */}
      {Array.from({ length: 15 }).map((_, i) => (
        <div
          key={`line-${i}`}
          className="energy-line"
          style={{
            top: `${Math.random() * 100}%`,
            left: 0,
            animationDelay: `${Math.random() * 10}s`,
            animationDuration: `${10 + Math.random() * 20}s`
          }}
        />
      ))}
      
      {/* Subtle Particles */}
      {Array.from({ length: 30 }).map((_, i) => (
        <div
          key={`particle-${i}`}
          className="particle"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 15}s`,
            animationDuration: `${15 + Math.random() * 20}s`
          }}
        />
      ))}
    </div>
  );
}
