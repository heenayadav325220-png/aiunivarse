import React, { useEffect, useState } from 'react';
import { Space, Sparkles, Orbit, Cpu } from 'lucide-react';

interface SplashProps {
  onComplete: () => void;
}

export const Splash: React.FC<SplashProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [phaseText, setPhaseText] = useState('Aligning orbital matrices...');

  useEffect(() => {
    // Elegant progression sequence
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 550); // Fluid exit
          return 100;
        }
        
        // Progress text transitions
        const next = prev + Math.floor(Math.random() * 15) + 5;
        const bounded = Math.min(next, 100);
        
        if (bounded > 85) setPhaseText('Calibrating neural synapses...');
        else if (bounded > 60) setPhaseText('Initializing quantum vision engines...');
        else if (bounded > 35) setPhaseText('Charging multi-spectral core...');
        else if (bounded > 15) setPhaseText('Establishing full-duplex uplink...');
        
        return bounded;
      });
    }, 180);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-[#04000f] flex flex-col items-center justify-center z-50 overflow-hidden select-none">
      {/* High-contrast background cosmic aura */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full bg-cyan-700/20 blur-[130px] animate-pulse" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[220px] h-[220px] rounded-full bg-purple-700/20 blur-[90px]" />

      {/* Futuristic animated logo frame */}
      <div className="relative mb-8 flex items-center justify-center">
        {/* Halo rotation using pure CSS */}
        <div className="absolute w-36 h-36 border-2 border-dashed border-cyan-500/30 rounded-full animate-[spin_10s_linear_infinite]" />
        <div className="absolute w-44 h-44 border border-purple-500/10 rounded-full animate-[spin_25s_linear_infinite_reverse]" />
        
        {/* Core emblem */}
        <div className="relative w-28 h-28 rounded-full bg-gradient-to-tr from-[#0b0021] to-[#250059] flex items-center justify-center border border-purple-400/40 shadow-[0_0_40px_rgba(168,85,247,0.35)]">
          <Orbit className="h-14 w-14 text-cyan-400 animate-[spin_15s_linear_infinite_reverse]" />
          <div className="absolute">
            <Cpu className="h-6 w-6 text-purple-300 animate-pulse" />
          </div>
          <Sparkles className="absolute -top-1 -right-1 h-5 w-5 text-yellow-300 animate-bounce" />
        </div>
      </div>

      {/* Title */}
      <h1 className="text-4xl font-extrabold tracking-[0.25em] bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-purple-300 to-indigo-400 mb-2 font-sans select-none text-center">
        AI UNIVERSE
      </h1>
      <p className="text-xs text-purple-400/60 uppercase tracking-[0.4em] mb-12 select-none font-mono">
        All-in-One Superintelligence
      </p>

      {/* Progress indicators */}
      <div className="w-64 space-y-3 px-4 z-10">
        <div className="h-1 w-full bg-purple-950/60 rounded-full overflow-hidden border border-purple-900/20">
          <div 
            className="h-full bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 transition-all duration-150 ease-out shadow-[0_0_12px_rgba(6,182,212,0.6)]"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        <div className="flex justify-between items-center text-[10px] font-mono text-purple-400/40 uppercase tracking-widest">
          <span className="animate-pulse">{phaseText}</span>
          <span className="font-bold text-cyan-400">{progress}%</span>
        </div>
      </div>

      {/* Core version tag */}
      <span className="absolute bottom-6 font-mono text-[9px] text-purple-500/30 uppercase tracking-widest">
        AIU ENGINE OS v4.16a // SECURE UPLINK ACTIVE
      </span>
    </div>
  );
};
