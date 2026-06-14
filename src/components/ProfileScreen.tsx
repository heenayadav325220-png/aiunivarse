import React, { useState } from 'react';
import { 
  User, Shield, Key, Database, RefreshCw, Trash2, 
  Terminal, Sparkles, Activity, Award, BarChart3, Disc,
  Sun, Moon
} from 'lucide-react';
import { UsageStats } from '../types';

interface ProfileScreenProps {
  stats: UsageStats;
  onResetStats: () => void;
  logs: string[];
  onClearLogs: () => void;
  onPurgeAllLocalStorage: () => void;
  currentUser: any;
  onLogout: () => void;
  onTriggerLogin?: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  stats,
  onResetStats,
  logs,
  onClearLogs,
  onPurgeAllLocalStorage,
  currentUser,
  onLogout,
  onTriggerLogin,
  theme,
  onToggleTheme
}) => {
  const [userName, setUserName] = useState(() => {
    if (currentUser?.displayName) return currentUser.displayName;
    return 'Cosmos Pilot #331';
  });
  const [userRank, setUserRank] = useState(() => {
    if (currentUser?.email) return currentUser.email;
    return 'Astral Commander (Guest Explorer)';
  });
  const [showKeyInfo, setShowKeyInfo] = useState(false);
  const [simulationActive, setSimulationActive] = useState(false);

  // Bento metric nodes
  const metrics = [
    { title: 'DIA-LINKS', count: stats.chatsCount, label: 'Sessions Initiated', color: 'text-cyan-400' },
    { title: 'PAINT CORES', count: stats.imagesCreated, label: 'Base64 Formulations', color: 'text-pink-400' },
    { title: 'VEO RENDERS', count: stats.videosCreated, label: 'HD 720p Frames', color: 'text-purple-400' },
    { title: 'PDF ANALYTICS', count: stats.documentsExplained, label: 'Document Paragraphs', color: 'text-amber-400' },
    { title: 'VOCAL LOOPS', count: stats.voiceDialogsCount, label: 'Sound Waves Synthesized', color: 'text-sky-400' },
    { title: 'ESTIMATED TKNS', count: stats.tokensEstimated * 240, label: 'Estimated Synapses', color: 'text-emerald-400' },
  ];

  const handleEditProfile = () => {
    const nextName = prompt("Enter custom pilot identification:", userName);
    if (nextName && nextName.trim()) {
      setUserName(nextName.trim());
    }
  };

  return (
    <div className="w-full flex-1 overflow-y-auto space-y-6 pb-28 pt-2 px-4 max-w-lg mx-auto text-white scroll-smooth">
      
      {/* Title */}
      <div className="flex flex-col mt-2">
        <h2 className="text-2xl font-black tracking-tight uppercase">USER PROFILE</h2>
        <p className="text-xs text-purple-400">Manage astral telemetry, secrets and stats</p>
      </div>

      {/* Astro Pilot Profile Card */}
      <div className="relative rounded-2xl glass-panel-heavy p-5 border border-cyan-500/15 overflow-hidden flex items-center space-x-4 select-none">
        
        {/* Glowing holographic vector portal of pilot */}
        <div className="relative h-16 w-16 rounded-full bg-[#0b0021] flex items-center justify-center border-2 border-purple-500/40 shadow-[0_0_15px_rgba(168,85,247,0.3)] shrink-0 overflow-hidden">
          {currentUser?.photoURL ? (
            <img src={currentUser.photoURL} alt="Avatar" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
          ) : (
            <User className="h-8 w-8 text-cyan-300" />
          )}
          <div className="absolute -bottom-1 -right-1 h-5.5 w-5.5 bg-emerald-500 rounded-full border-2 border-[#04000e] flex items-center justify-center text-[10px] font-bold">
            {currentUser ? '√' : 'G'}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <h3 className="font-extrabold text-base text-slate-100 truncate">{currentUser ? (currentUser.displayName || userName) : userName}</h3>
            {!currentUser && (
              <button 
                onClick={handleEditProfile}
                className="text-[10px] text-cyan-400 hover:underline uppercase tracking-wider font-mono shrink-0"
              >
                [edit]
              </button>
            )}
          </div>
          <p className="text-xs text-purple-300/80 font-mono font-semibold truncate uppercase tracking-widest mt-0.5">{currentUser ? currentUser.email : userRank}</p>
          
          <div className="flex items-center space-x-2 mt-2">
            {currentUser ? (
              <button
                onClick={onLogout}
                className="px-2.5 py-1 rounded bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 font-mono text-[9px] uppercase tracking-wider transition-all"
              >
                Sign Out
              </button>
            ) : (
              <button
                onClick={onTriggerLogin}
                className="px-2.5 py-1 rounded bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 font-mono text-[9px] uppercase tracking-wider transition-all animate-pulse"
              >
                Log In Google
              </button>
            )}
            <div className="flex items-center space-x-1 text-[9px] text-slate-500 font-mono uppercase">
              <Shield className="h-3 w-3 text-emerald-500" />
              <span>TLS Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Usage Bento Diagnostics */}
      <div className="flex flex-col space-y-2.5">
        <h4 className="text-xs font-bold tracking-wider text-purple-300 uppercase font-mono flex items-center space-x-1.5">
          <Activity className="h-4 w-4 text-cyan-400" />
          <span>CELESTIAL METRICS DIAGNOSTICS</span>
        </h4>
        
        <div className="grid grid-cols-2 gap-3.5 select-none">
          {metrics.map((m, idx) => (
            <div 
              key={idx}
              className="glass-panel p-3 rounded-xl border border-white/5 flex flex-col justify-between min-h-[82px] hover:border-cyan-500/10 transition-all"
            >
              <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">{m.title}</div>
              <div className="mt-1">
                <div className={`text-2xl font-black ${m.color} tracking-tight`}>
                  {m.count}
                </div>
                <div className="text-[9px] text-slate-500/80 truncate mt-0.5">{m.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Environment secrets information */}
      <div className="glass-panel p-4 rounded-xl border border-white/5 space-y-3">
        <div className="flex items-center justify-between border-b border-white/5 pb-2">
          <h4 className="text-xs font-bold font-mono text-purple-300 uppercase tracking-widest flex items-center space-x-1.5">
            <Key className="h-4 w-4 text-pink-400" />
            <span>SECURE API SECRET KEY</span>
          </h4>
          <button
            onClick={() => setShowKeyInfo(!showKeyInfo)}
            className="text-[9.5px] font-mono text-cyan-400 hover:underline"
          >
            {showKeyInfo ? "[HIDE]" : "[SHOW GUIDELINE]"}
          </button>
        </div>

        {showKeyInfo && (
          <div className="text-[11.5px] text-slate-300 leading-relaxed font-sans space-y-2 mt-2 select-none">
            <p>
              AI Universe operates on full-stack **Gemini API v3.5 Flash** endpoints securely handled through Node servers.
            </p>
            <div className="bg-slate-950 p-2.5 rounded-lg border border-white/5 font-mono text-[10px] leading-relaxed text-pink-300">
              UPLINK HOST: port 3000 (ingress secure)<br/>
              CREDENTIALS: Settings &gt; Secrets &gt; GEMINI_API_KEY
            </div>
            <p className="text-[10.5px] text-slate-400">
              If no API key is specified, the application launches its High-Fidelity Creator simulation context seamlessly to guarantee pristine app evaluation.
            </p>
          </div>
        )}
      </div>

      {/* Core Systems Live Console Logs */}
      <div className="glass-panel p-4 rounded-xl border border-white/5 space-y-2 select-none">
        <div className="flex items-center justify-between border-b border-white/5 pb-2">
          <h4 className="text-xs font-bold font-mono text-purple-300 uppercase tracking-widest flex items-center space-x-1.5">
            <Terminal className="h-4 w-4 text-emerald-400 animate-pulse" />
            <span>CELESTIAL SYSTEM CONSOLE LOGS</span>
          </h4>
          {logs.length > 0 && (
            <button
              onClick={onClearLogs}
              className="text-[9.5px] font-mono text-slate-500 hover:text-rose-400 uppercase"
            >
              Clear Logs
            </button>
          )}
        </div>
        
        <div className="bg-slate-950/80 p-3 rounded-lg border border-white/5 h-24 overflow-y-auto font-mono text-[9.5px] text-emerald-400 space-y-1.5 select-text">
          {logs.length === 0 ? (
            <div className="text-slate-600 italic">No events recorded. Perform actions across AI screens to log activity here.</div>
          ) : (
            logs.map((log, lIdx) => (
              <div key={lIdx} className="flex">
                <span className="text-slate-600 select-none mr-2">[{lIdx + 1}]</span>
                <p className="break-all">{log}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Visual Interface Theme configuration */}
      <div className="glass-panel p-4 rounded-xl border border-purple-500/10 space-y-3 select-none">
        <h4 className="text-xs font-bold font-mono text-purple-300 uppercase tracking-widest flex items-center space-x-1.5">
          <Sparkles className="h-4 w-4 text-cyan-400" />
          <span>VISUAL INTERFACE ENVIRONMENT</span>
        </h4>
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-300 font-mono">Current Theme Protocol:</span>
          <button
            onClick={onToggleTheme}
            className="px-3 py-1.5 rounded-xl border border-cyan-500/30 bg-[#0d0725]/80 hover:bg-[#120cfd]/10 text-cyan-200 text-xs font-mono uppercase tracking-wider active:scale-95 transition-all text-center flex items-center space-x-1.5 cursor-pointer shadow-[0_0_15px_rgba(34,211,238,0.1)]"
          >
            {theme === 'dark' ? (
              <>
                <Moon className="h-3.5 w-3.5 text-yellow-400" />
                <span>Midnight Dark</span>
              </>
            ) : (
              <>
                <Sun className="h-3.5 w-3.5 text-amber-500" />
                <span>Pristine Light</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Reset Operations control */}
      <div className="glass-panel p-4 rounded-xl border border-rose-500/10 space-y-3 select-none">
        <h4 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-widest flex items-center space-x-1.5">
          <Database className="h-4 w-4 text-rose-500" />
          <span>DATA INTEGRITY OPERATIONS</span>
        </h4>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => {
              if (window.confirm("Confirm reset of statistical log counters to zero?")) {
                onResetStats();
              }
            }}
            className="py-2 rounded-xl border border-slate-800 hover:border-slate-700 bg-slate-950/60 font-mono text-[10.5px] text-slate-300 uppercase tracking-widest active:scale-95 transition-all text-center"
          >
            Reset Metrics
          </button>
          <button
            onClick={() => {
              if (window.confirm("Confirm permanent removal of custom logs, saved history, creations, and user session records of this app?")) {
                onPurgeAllLocalStorage();
              }
            }}
            className="py-2 rounded-xl border border-rose-500/15 bg-rose-950/15 hover:bg-rose-950/25 font-mono text-[10.5px] text-rose-400 uppercase tracking-widest active:scale-95 transition-all text-center flex items-center justify-center space-x-1"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Purge Storage</span>
          </button>
        </div>
      </div>

    </div>
  );
};
