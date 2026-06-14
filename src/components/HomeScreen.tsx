import React from 'react';
import { Sparkles, MessageSquare, Image, Video, FileText, Code, GraduationCap, ChevronRight, Zap, Play } from 'lucide-react';
import { UsageStats } from '../types';
import { playNavClick } from '../utils/audio';

interface HomeScreenProps {
  setActiveTab: (tab: string) => void;
  setOpenedToolId: (id: string | null) => void;
  stats: UsageStats;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ setActiveTab, setOpenedToolId, stats }) => {
  
  // Highlighted features
  const features = [
    {
      id: 'chat',
      title: 'Cosmic AI Dialogue',
      desc: 'Converse with an authorized server-side superintelligence.',
      icon: MessageSquare,
      color: 'from-cyan-500 to-blue-600',
      tab: 'chat'
    },
    {
      id: 'image',
      title: 'Multimodal Painter',
      desc: 'Translate words into ultra-crisp artistic renderings.',
      icon: Image,
      color: 'from-purple-500 to-pink-600',
      tab: 'create'
    },
    {
      id: 'video',
      title: 'Cinematic Veo Generator',
      desc: 'Animate high-fidelity cosmic videos on the fly.',
      icon: Video,
      color: 'from-blue-600 to-indigo-700',
      tab: 'create'
    }
  ];

  // Quick Action Matrix
  const quickActions = [
    { id: 'math-photo', name: 'Photo Solver', icon: Sparkles, desc: 'Analyze & Solve Photo Issues', tool: 'solver' },
    { id: 'study-companion', name: 'Study Planner', icon: GraduationCap, desc: 'Construct dynamic flashcards', tool: 'study' },
    { id: 'notes-architect', name: 'Notes Creator', icon: FileText, desc: 'Synthesize structured summaries', tool: 'notes' },
    { id: 'code-compiler', name: 'Code Generator', icon: Code, desc: 'Instantly build syntactical logic', tool: 'code' },
  ];

  const handleLaunchTool = (toolId: string) => {
    playNavClick();
    setOpenedToolId(toolId);
    setActiveTab('tools');
  };

  const handleLaunchTab = (tabName: string) => {
    playNavClick();
    setOpenedToolId(null);
    setActiveTab(tabName);
  };

  return (
    <div className="w-full flex-1 overflow-y-auto space-y-6 pb-24 text-white p-4 max-w-lg mx-auto scroll-smooth">
      
      {/* Top Header */}
      <div className="flex items-center justify-between mt-2">
        <div className="flex flex-col">
          <span className="text-[10px] font-mono text-cyan-400 capitalize bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/30 w-fit">
            QUANTUM LINK SECURED
          </span>
          <h2 className="text-2xl font-black tracking-tight mt-1 bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-300">
            AI UNIVERSE
          </h2>
        </div>
        
        {/* Simple futuristic pulsing system status indicator */}
        <div className="flex items-center space-x-2 bg-slate-900/80 px-3 py-1.5 rounded-full border border-white/5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[10px] font-mono text-emerald-400 font-semibold tracking-wider">ONLINE</span>
        </div>
      </div>

      {/* Large Glowing AI Banner - High Contrast Cosmic card */}
      <div className="relative overflow-hidden rounded-2xl glass-panel-heavy p-6 border border-purple-500/25 shadow-[0_0_25px_rgba(168,85,247,0.15)] flex flex-col justify-between h-48 select-none">
        {/* GPU Sliding light reflection */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-[150%] skew-x-12 animate-[shimmer-slide_4s_ease-in-out_infinite]" />
        
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-cyan-600/25 rounded-full blur-2xl pointer-events-none" />
        
        <div className="z-10">
          <div className="flex items-center space-x-1.5 bg-white/10 w-fit px-2 py-0.5 rounded-md border border-white/10 mb-2">
            <Zap className="h-3.5 w-3.5 text-yellow-400 animate-pulse" />
            <span className="text-[9px] uppercase tracking-widest font-mono font-bold text-yellow-300">SYSTEM CORES ACTIVE</span>
          </div>
          <h3 className="text-xl font-bold tracking-tight text-white leading-tight">
            Explore the Multiverse <br/>of Generative Intelligence
          </h3>
          <p className="text-xs text-slate-300/80 mt-1 max-w-[85%] font-sans">
            A combined powerhouse of 10+ advanced AI creators, chat dialogue & academic solvers.
          </p>
        </div>

        <button 
          onClick={() => handleLaunchTab('chat')}
          className="z-10 mt-4 flex items-center space-x-2 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 px-4 py-2 rounded-xl text-xs font-semibold tracking-wide shadow-[0_4px_12px_rgba(6,182,212,0.3)] transition-all transform hover:scale-[1.03] active:scale-95 w-fit"
        >
          <Play className="h-3 w-3 fill-white" />
          <span>INITIALIZE DIA-LINK</span>
        </button>
      </div>

      {/* Featured AI Tools Carousel Section */}
      <div className="flex flex-col space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold tracking-wider text-purple-300 uppercase font-mono">
            FEATURED CORE PLATFORMS
          </h4>
          <button 
            onClick={() => handleLaunchTab('create')}
            className="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center font-mono tracking-widest uppercase"
          >
            STUDIO <ChevronRight className="h-3 w-3" />
          </button>
        </div>

        {/* Carousel containing scrollable elements */}
        <div className="flex space-x-4 overflow-x-auto pb-2 scrollbar-none snap-x select-none">
          {features.map((feat) => {
            const IconComponent = feat.icon;
            return (
              <div 
                key={feat.id}
                onClick={() => handleLaunchTab(feat.tab)}
                className="flex-shrink-0 w-72 rounded-xl bg-gradient-to-br from-slate-900/60 to-purple-950/20 border border-white/5 p-4 flex flex-col justify-between hover:border-purple-500/30 transition-all cursor-pointer snap-start relative group"
              >
                {/* Micro glow bullet */}
                <div className="absolute top-4 right-4 h-2 w-2 rounded-full bg-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity animate-pulse shadow-[0_0_8px_rgba(34,211,238,1)]" />

                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${feat.color} shadow-lg`}>
                    <IconComponent className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h5 className="font-semibold text-sm group-hover:text-cyan-300 transition-colors">{feat.title}</h5>
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">{feat.desc}</p>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-purple-400">
                  <span>DEPLOYED VIA V3.5 FLASH</span>
                  <div className="flex items-center space-x-1 text-cyan-400 font-bold">
                    <span>LAUNCH</span>
                    <ChevronRight className="h-3 w-3 animate-pulse" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Launch Action Grid */}
      <div className="flex flex-col space-y-3">
        <h4 className="text-xs font-bold tracking-wider text-purple-300 uppercase font-mono">
          QUICK ACCESS MATRIX
        </h4>
        
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map((action) => {
            const IconComponent = action.icon;
            return (
              <button
                key={action.id}
                onClick={() => handleLaunchTool(action.tool)}
                className="glass-panel hover:bg-slate-900/60 p-3.5 rounded-xl border border-white/5 hover:border-cyan-500/20 text-left transition-all hover:scale-[1.02] active:scale-98 group flex flex-col justify-between min-h-[90px]"
              >
                <div className="flex items-center justify-between w-full">
                  <div className="p-1.5 rounded-lg bg-slate-950/70 border border-white/5 group-hover:border-cyan-500/30 group-hover:text-cyan-400 text-slate-300 transition-all">
                    <IconComponent className="h-4 w-4" />
                  </div>
                  <ChevronRight className="h-3 w-3 text-slate-600 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
                </div>
                <div className="mt-2.5">
                  <div className="text-[11.5px] font-bold text-white group-hover:text-cyan-300 transition-colors truncate">
                    {action.name}
                  </div>
                  <div className="text-[9.5px] text-slate-400/80 truncate mt-0.5 font-sans">
                    {action.desc}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Futuristic Real-Time Diagnostics (Usage statistics) */}
      <div className="rounded-xl glass-panel p-4 border border-cyan-500/10">
        <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2">
          <div className="flex items-center space-x-2">
            <span className="flex h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping" />
            <span className="text-[10px] font-mono tracking-widest text-[#a855f7] font-semibold uppercase">COGNITIVE SYMMETRY LOGS</span>
          </div>
          <span className="text-[9px] font-mono text-slate-500">SYS_UP: 99.98%</span>
        </div>
        
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-slate-950/40 py-2.5 px-1 rounded-lg border border-white/5">
            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">DIA-LINKS</div>
            <div className="text-base font-black text-cyan-400 mt-0.5">{stats.chatsCount}</div>
          </div>
          <div className="bg-slate-950/40 py-2.5 px-1 rounded-lg border border-white/5">
            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">IMAGE ART</div>
            <div className="text-base font-black text-purple-400 mt-0.5">{stats.imagesCreated}</div>
          </div>
          <div className="bg-slate-950/40 py-2.5 px-1 rounded-lg border border-white/5">
            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">DOC ANALYZED</div>
            <div className="text-base font-black text-indigo-400 mt-0.5">{stats.documentsExplained}</div>
          </div>
        </div>
      </div>

    </div>
  );
};
