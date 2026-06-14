import React, { useMemo } from 'react';

// Memoized star to keep CSS positions completely static and avoid re-renders or layout recalculations.
const StaticStars: React.FC = React.memo(() => {
  const starsArray = useMemo(() => {
    return Array.from({ length: 22 }).map((_, i) => {
      const size = i % 3 === 0 ? 'h-1.5 w-1.5' : i % 2 === 0 ? 'h-1 w-1' : 'h-0.5 w-0.5';
      const delay = (i * 0.2).toFixed(2);
      const duration = (12 + (i % 5) * 5).toFixed(2);
      const top = (Math.random() * 100).toFixed(2);
      const left = (Math.random() * 100).toFixed(2);
      const glowStr = i % 4 === 0 
        ? 'shadow-[0_0_8px_rgba(34,211,238,0.8)] bg-cyan-400' 
        : i % 3 === 0 
          ? 'shadow-[0_0_8px_rgba(168,85,247,0.8)] bg-purple-400' 
          : 'shadow-[0_0_4px_rgba(255,255,255,0.6)] bg-white';

      // Only animate a subset (every 3rd star) to minimize compositor workload, other stars stay static and crispy
      const animationStyle = i % 3 === 0 
        ? { animation: `cosmicFloat ${duration}s ease-in-out ${delay}s infinite alternate`, willChange: 'transform' } 
        : {};

      return {
        id: i,
        style: {
          top: `${top}%`,
          left: `${left}%`,
          ...animationStyle,
        } as React.CSSProperties,
        className: `absolute rounded-full opacity-60 ${size} ${glowStr}`
      };
    });
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
      {starsArray.map((star) => (
        <div key={star.id} className={star.className} style={star.style} />
      ))}
    </div>
  );
});

StaticStars.displayName = 'StaticStars';

export const CosmicBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-[#060012] bg-radial-gradient from-[#0e0026] via-[#050014] to-[#010005] overflow-hidden z-0 pointer-events-none select-none">
      {/* Aurora / Nebula glowing gradients - static GPU blurred layers (removed slow pulsing to prevent composition lag) */}
      <div 
        className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-cyan-700/15 blur-[120px]" 
        style={{ willChange: 'opacity' }}
      />
      <div 
        className="absolute top-1/2 -right-20 w-[450px] h-[450px] rounded-full bg-purple-800/10 blur-[150px]" 
        style={{ willChange: 'opacity' }}
      />
      <div 
        className="absolute -bottom-20 left-1/3 w-80 h-80 rounded-full bg-blue-900/10 blur-[110px]" 
        style={{ willChange: 'opacity' }}
      />
      
      {/* Floating cosmos particle field */}
      <StaticStars />

      {/* Grid overlay with perspective for high-end look */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(14,20,50,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(14,20,50,0.04)_1px,transparent_1px)] bg-[size:44px_44px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-40 z-0 pointer-events-none" />
    </div>
  );
};
