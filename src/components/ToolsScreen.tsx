import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, FileText, Code, GraduationCap, ArrowLeft, Send, Copy, 
  Check, FileUp, Image as ImageIcon, Volume2, Mic, Play, RefreshCw, AlertCircle
} from 'lucide-react';
import { SavedNote, GeneratedCode, SavedContent, StudySession, QuizQuestion } from '../types';

interface ToolsScreenProps {
  openedToolId: string | null;
  setOpenedToolId: (id: string | null) => void;
  onSaveNote: (note: SavedNote) => void;
  onSaveCode: (code: GeneratedCode) => void;
  onSaveContent: (content: SavedContent) => void;
  incrementStats: (key: string) => void;
  onAddLog: (logText: string) => void;
}

export const ToolsScreen: React.FC<ToolsScreenProps> = ({
  openedToolId,
  setOpenedToolId,
  onSaveNote,
  onSaveCode,
  onSaveContent,
  incrementStats,
  onAddLog
}) => {
  // Navigation grid metadata
  const toolsList = [
    { id: 'notes', name: 'AI Notes Generator', icon: FileText, desc: 'Summarize topics, create study outlines, and format flashcards instantly.', color: 'from-blue-500 to-indigo-600', group: 'productivity' },
    { id: 'code', name: 'AI Code Generator', icon: Code, desc: 'Instantly build documented scripts in JavaScript, Python, C++, etc.', color: 'from-cyan-500 to-teal-600', group: 'developer' },
    { id: 'writer', name: 'AI Content Writer', icon: Sparkles, desc: 'Elegantly draft professional emails, blogs, pitch decks, and social media posts.', color: 'from-purple-500 to-fuchsia-600', group: 'productivity' },
    { id: 'solver', name: 'Photo Solver', icon: ImageIcon, desc: 'Upload chemistry formulas, physics diagrams, or geometry notes to solve step-by-step.', color: 'from-rose-500 to-red-600', group: 'academic' },
    { id: 'pdf', name: 'PDF Document Reader', icon: FileUp, desc: 'Load text, instructions, or articles. Extract paragraphs and explain elements.', color: 'from-amber-500 to-orange-600', group: 'academic' },
    { id: 'study', name: 'AI Study Helper', icon: GraduationCap, desc: 'Construct dynamic multi-choice interactive quizzes to self-evaluate knowledge structures.', color: 'from-emerald-500 to-green-600', group: 'academic' },
    { id: 'voice', name: 'AI Voice Assistant', icon: Volume2, desc: 'Converse verbally with Cosmos. Utilizes voice input and synthetic playback.', color: 'from-sky-500 to-blue-600', group: 'core' },
  ];

  /* ==========================================
     UNIVERSAL CONTROLLERS & SHARED STATES
     ========================================== */
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [copyFeedback, setCopyFeedback] = useState(false);

  // States for individual sub-views
  // Notes state
  const [notesPrompt, setNotesPrompt] = useState('');
  const [notesResult, setNotesResult] = useState('');

  // Code state
  const [codePrompt, setCodePrompt] = useState('Create a custom binary search tree implementation with pre-order traversals in TypeScript.');
  const [codeLanguage, setCodeLanguage] = useState('typescript');
  const [codeResult, setCodeResult] = useState<{ code: string; explanation: string } | null>(null);

  // Writer state
  const [writerPrompt, setWriterPrompt] = useState('');
  const [writerTone, setWriterTone] = useState('professional');
  const [writerResult, setWriterResult] = useState('');

  // Photo Solver state
  const [photoSolved, setPhotoSolved] = useState<string | null>(null);
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [photoName, setPhotoName] = useState<string | null>(null);
  const solverFileInputRef = useRef<HTMLInputElement>(null);

  // PDF Reader state
  const [pdfTextContent, setPdfTextContent] = useState('');
  const [pdfFileName, setPdfFileName] = useState('');
  const [pdfResult, setPdfResult] = useState('');
  const pdfInputRef = useRef<HTMLInputElement>(null);

  // Study Helper state
  const [studyTopic, setStudyTopic] = useState('General Relativistic Gravitation');
  const [studyResult, setStudyResult] = useState<{ summary: string; quiz: QuizQuestion[] } | null>(null);
  const [quizAnswersSelected, setQuizAnswersSelected] = useState<{ [key: number]: number }>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // Voice Assistant state
  const [voiceInput, setVoiceInput] = useState('');
  const [voiceDialogue, setVoiceDialogue] = useState<{ talker: 'user' | 'cosmos'; text: string }[]>([
    { talker: 'cosmos', text: "Greetings. I am standard vocal channel Cosmos. Speak to me by pressing the microphone icon or type below." }
  ]);
  const [isListening, setIsListening] = useState(false);
  const voiceSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Copy Feedback logic
  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
    onAddLog("Copied text content to clipboard.");
  };

  /* ==========================================
     1. NOTES GENERATOR HANDLER
     ========================================== */
  const handleGenerateNotes = async () => {
    if (!notesPrompt) return;
    setLoading(true);
    setErrorText(null);
    try {
      const res = await fetch('/api/tools/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toolType: 'notes', prompt: notesPrompt }),
      });
      const data = await res.json();
      if (res.ok) {
        setNotesResult(data.text);
        incrementStats('tokensEstimated');
        onSaveNote({
          id: 'note_' + Date.now(),
          title: notesPrompt.substring(0, 30) + (notesPrompt.length > 30 ? '...' : ''),
          content: data.text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          category: 'Notes'
        });
        onAddLog(`Successfully generated structured notes for: ${notesPrompt.substring(0, 20)}...`);
      } else {
        setErrorText(data.error || "Notes generation was interrupted.");
      }
    } catch (err: any) {
      setErrorText("Telemetry breakdown: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  /* ==========================================
     2. CODE ARCHITECT HANDLER
     ========================================== */
  const handleGenerateCode = async () => {
    if (!codePrompt) return;
    setLoading(true);
    setErrorText(null);
    try {
      const res = await fetch('/api/tools/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          toolType: 'code', 
          prompt: `${codePrompt} Code in ${codeLanguage}.` 
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setCodeResult(data);
        incrementStats('tokensEstimated');
        onSaveCode({
          id: 'code_' + Date.now(),
          title: codePrompt.substring(0, 30) + '...',
          language: codeLanguage,
          code: data.code,
          explanation: data.explanation,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        });
        onAddLog(`Successfully compiled custom code structure.`);
      } else {
        setErrorText(data.error || "Compiler reported interruption.");
      }
    } catch (err: any) {
      setErrorText("Compilation link faulty: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  /* ==========================================
     3. CONTENT WRITER HANDLER
     ========================================== */
  const handleGenerateWriter = async () => {
    if (!writerPrompt) return;
    setLoading(true);
    setErrorText(null);
    try {
      const res = await fetch('/api/tools/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          toolType: 'writer', 
          prompt: writerPrompt,
          extraParams: { tone: writerTone }
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setWriterResult(data.text);
        incrementStats('tokensEstimated');
        onSaveContent({
          id: 'content_' + Date.now(),
          title: writerPrompt.substring(0, 25) + '...',
          prompt: writerPrompt,
          content: data.text,
          tone: writerTone,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        });
        onAddLog(`Created written copy draft formatted in ${writerTone} tone.`);
      } else {
        setErrorText(data.error || "Content writer failed.");
      }
    } catch (err: any) {
      setErrorText("Synapse failure: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  /* ==========================================
     4. PHOTO SOLVER HANDLER
     ========================================== */
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoName(file.name);
    
    const reader = new FileReader();
    reader.onload = () => {
      setPhotoBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
    onAddLog(`Staged student photo for physics/math assessment.`);
  };

  const handleSolvePhoto = async () => {
    if (!photoBase64) return;
    setLoading(true);
    setErrorText(null);
    try {
      const res = await fetch('/api/solve-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          imageBytes: photoBase64,
          mimeType: 'image/png',
          prompt: "Please look closely at this homework / workbook science question. Solve it meticulously and list step-by-step steps clearly using markdown formatting."
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setPhotoSolved(data.solution);
        incrementStats('tokensEstimated');
        onAddLog(`Resolved problem coordinates successfully.`);
      } else {
        setErrorText(data.error || "Multimodal vision solver declined requests.");
      }
    } catch (err: any) {
      setErrorText("Vision core unreached: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  /* ==========================================
     5. PDF READER & EXPLAINER HANDLER
     ========================================== */
  const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPdfFileName(file.name);
    
    const reader = new FileReader();
    reader.onload = () => {
      setPdfTextContent(reader.result as string);
    };
    reader.readAsText(file); // Support loading text representation of documents
    onAddLog(`Loaded documentation: ${file.name}`);
  };

  const handleExplainPdf = async () => {
    const textToAnalyze = pdfTextContent || "Cosmic documentation outlines standard orbital patterns.";
    const name = pdfFileName || "CosmicGuidelines.txt";
    setLoading(true);
    setErrorText(null);
    try {
      const res = await fetch('/api/explain-file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          textContent: textToAnalyze, 
          fileName: name,
          type: 'text/plain'
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setPdfResult(data.text);
        incrementStats('documentsExplained');
        onAddLog(`Processed and organized highlights of: ${name}`);
      } else {
        setErrorText(data.error || "System failed to read document tree.");
      }
    } catch (err: any) {
      setErrorText("Telemetric file read error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  /* ==========================================
     6. STUDY HELPER INTERACTIVE QUIZ & STUDY
     ========================================== */
  const handleConstructQuiz = async () => {
    if (!studyTopic) return;
    setLoading(true);
    setErrorText(null);
    setQuizAnswersSelected({});
    setQuizSubmitted(false);
    try {
      const res = await fetch('/api/tools/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toolType: 'study', prompt: studyTopic }),
      });
      const data = await res.json();
      if (res.ok && data.quiz) {
        setStudyResult(data);
        incrementStats('tokensEstimated');
        onAddLog(`Constructed dynamic quiz for: ${studyTopic}`);
      } else {
        setErrorText("Model generated answers but structured schema formatting misaligned: " + (data.rawText ? "Raw text received." : "Try again."));
      }
    } catch (err: any) {
      setErrorText("Educational link failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectQuizAnswer = (qIndex: number, optionIndex: number) => {
    if (quizSubmitted) return;
    setQuizAnswersSelected(prev => ({ ...prev, [qIndex]: optionIndex }));
  };

  /* ==========================================
     7. VOICE ASSISTANT AND SPEECH CONSOLE
     ========================================== */
  // Use speech recognition if supported by Android WebView / Chrome Browser
  const startSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      onAddLog("Local speech recognition not supported in container frame.");
      // Simulated mic typing
      setIsListening(true);
      const simulatedVoices = [
        "What is the physical size limit of quantum dots?",
        "Explain orbital mechanics inside black hole event horizons.",
        "Synthesize instructions to calculate standard Fibonacci sets."
      ];
      setTimeout(() => {
        const text = simulatedVoices[Math.floor(Math.random() * simulatedVoices.length)];
        setVoiceInput(text);
        setIsListening(false);
        onAddLog("Mock voice input transcribed: " + text);
      }, 1500);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      onAddLog("Active microphone voice stream connected.");
    };

    recognition.onresult = (event: any) => {
      const resultText = event.results[0][0].transcript;
      setVoiceInput(resultText);
    };

    recognition.onerror = (e: any) => {
      console.error(e);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const handleSendVoiceQuery = async () => {
    const prompt = voiceInput.trim();
    if (!prompt) return;
    
    // Add user question to dialog list
    setVoiceDialogue(prev => [...prev, { talker: 'user', text: prompt }]);
    setVoiceInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: prompt }),
      });
      const data = await res.json();
      
      if (res.ok) {
        const cosmosAnswer = data.text;
        setVoiceDialogue(prev => [...prev, { talker: 'cosmos', text: cosmosAnswer }]);
        incrementStats('voiceDialogsCount');
        
        // Speak response out loud using WebSpeech Synthesis
        triggerSpeechSynthesis(cosmosAnswer);
      } else {
        setVoiceDialogue(prev => [...prev, { talker: 'cosmos', text: "Forgive me, the communication grid is experiencing noise." }]);
      }
    } catch (err) {
      setVoiceDialogue(prev => [...prev, { talker: 'cosmos', text: "Neural synchronicity error: Communication drop-off." }]);
    } finally {
      setLoading(false);
    }
  };

  const triggerSpeechSynthesis = (text: string) => {
    // Sanitise markdown for cleaner reading
    const textToRead = text.replace(/[*#`_\-]/g, '').slice(0, 150) + (text.length > 150 ? ' and so on.' : '');
    
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Stop current speech
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.rate = 1.05;
      utterance.pitch = 0.95;
      
      // Attempt to load general english robotic space voice
      const voices = window.speechSynthesis.getVoices();
      const defaultVoice = voices.find(v => v.lang.includes('en') && v.name.toLowerCase().includes('google')) || voices[0];
      if (defaultVoice) utterance.voice = defaultVoice;

      window.speechSynthesis.speak(utterance);
      onAddLog("Dispatched synthesized audio response.");
    }
  };

  // Auto clean speech synthesis on navigate away
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);


  /* ==========================================
     STANDALONE MOCK PDF DOCUMENT LOADER
     ========================================== */
  const loadMockPdfTemplate = (topic: string) => {
    let mockText = "";
    if (topic === 'guidelines') {
      mockText = "[AI Universe Operational Manual]\nRevision: 2026.06\nConfiguration Mode: FULL COGNITIVE SYNAPSE DEPLOYED\n\nSection 1: Quantum Shimmer Architecture\nTo sustain flawless hardware rendering under multi-layered backdrop constraints, developers must strictly avoid dynamic style re-evaluations inside loop timers. Rendering computations should run off-thread on the browser's composite GPU layer using translate3d matrix conversions.\n\nSection 2: High Frequency API Proxies\nDirect browser authorization secrets degrade client trust. The node gateway operates endpoints safely on port 3000 mapping user questions to gemini-3.5-flash context nodes.";
    } else {
      mockText = "[Quantum Electrodynamics Cheat Sheet]\nAuthor: Feynman Cosmos Lab\n\nRule A: Electron Wave Spacings\nAt celestial distances, the probability wave forms a dense path integral. Calculations correspond to high-order complex vectors mapped in Hilbert spaces:\n\nS(t) = i * ∫ L(x, dx/dt) dt\n\nRule B: virtual photon trajectories operate perpendicular to electron vector offsets.";
    }
    setPdfFileName(topic === 'guidelines' ? 'ai_universe_manual.pdf' : 'quantum_physics_notes.pdf');
    setPdfTextContent(mockText);
    onAddLog("Preloaded interactive study dataset.");
  };


  /* ==========================================
     DURABLE VIEW RENDERERS
     ========================================== */

  // Grid screen
  if (!openedToolId) {
    return (
      <div className="w-full flex-1 overflow-y-auto space-y-6 pb-28 pt-2 px-4 max-w-lg mx-auto text-white scroll-smooth">
        
        {/* Title */}
        <div className="flex flex-col mt-2">
          <h2 className="text-2xl font-black tracking-tight uppercase">AI TOOLS</h2>
          <p className="text-xs text-purple-400">Deploy high-performance specialized modular operations</p>
        </div>

        {/* Categories filters */}
        <div className="grid grid-cols-1 gap-3">
          {toolsList.map((tool) => {
            const IconComp = tool.icon;
            return (
              <div
                key={tool.id}
                onClick={() => {
                  setErrorText(null);
                  setOpenedToolId(tool.id);
                }}
                className="group relative cursor-pointer overflow-hidden rounded-xl bg-slate-900/40 hover:bg-slate-900/70 border border-white/5 hover:border-purple-500/35 p-4 transition-all hover:translate-y-[-2px] active:scale-98"
              >
                {/* Visual neon light trail */}
                <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-cyan-400 to-purple-500 opacity-60 group-hover:opacity-100" />
                
                <div className="flex items-start space-x-3.5 pl-2">
                  <div className={`p-2.5 rounded-lg bg-gradient-to-br ${tool.color} text-white shadow-lg flex-shrink-0`}>
                    <IconComp className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm text-slate-100 group-hover:text-cyan-300 transition-colors">
                      {tool.name}
                    </h4>
                    <p className="text-xs text-slate-400 font-sans leading-normal">
                      {tool.desc}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Sub-view active applet container wrapper
  const activeTool = toolsList.find(t => t.id === openedToolId);
  const ToolIcon = activeTool?.icon || Sparkles;

  return (
    <div className="w-full flex-1 overflow-y-auto pb-28 text-white px-4 pt-2 max-w-lg mx-auto select-none scroll-smooth">
      
      {/* Back Header */}
      <div className="flex items-center space-x-3 mt-2 mb-6">
        <button
          onClick={() => {
            setOpenedToolId(null);
            setErrorText(null);
          }}
          className="p-2 rounded-lg bg-slate-900/60 border border-white/5 hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 text-cyan-400" />
        </button>
        <div className="flex items-center space-x-2.5">
          <div className={`p-1.5 rounded-md bg-gradient-to-br ${activeTool?.color} text-white`}>
            <ToolIcon className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-bold text-base leading-tight">{activeTool?.name}</h3>
            <span className="text-[10px] font-mono text-purple-400 tracking-wider">SECURE AI SUB-SYSTEM</span>
          </div>
        </div>
      </div>

      {/* Global Error Notice */}
      {errorText && (
        <div className="rounded-xl border border-rose-500/20 bg-rose-950/30 p-3.5 mb-5 flex items-start space-x-2.5">
          <AlertCircle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="text-xs text-rose-300 font-sans space-y-1">
            <span className="font-bold block">Uplink Interrupted</span>
            <span>{errorText}</span>
          </div>
        </div>
      )}

      {/* SUB-VIEW CONTENTS */}
      <div className="space-y-5">
        
        {/* VIEW 1: AI NOTES GENERATOR */}
        {openedToolId === 'notes' && (
          <div className="space-y-4">
            <div className="glass-panel p-4 rounded-xl border border-white/5">
              <label className="text-[11px] font-mono text-cyan-400 block mb-2 uppercase tracking-widest">Outline Input Topic</label>
              <textarea
                value={notesPrompt}
                onChange={(e) => setNotesPrompt(e.target.value)}
                placeholder="Enter what you want notes on, e.g. Quantum Computing, Photosynthesis in alien planet, French Revolution causes..."
                className="w-full h-24 bg-slate-950/40 border border-white/10 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 leading-normal"
              />
              <button
                disabled={loading || !notesPrompt}
                onClick={handleGenerateNotes}
                className="w-full mt-3 flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 disabled:opacity-40 px-4 py-2.5 rounded-xl text-xs font-bold font-mono text-white transition-all transform active:scale-95 shadow-md"
              >
                {loading ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                <span>{loading ? "SYNTHESIZING CORES..." : "GENERATE DETAILED OUTLINE"}</span>
              </button>
            </div>

            {notesResult && (
              <div className="glass-panel-heavy p-4 rounded-xl border border-purple-500/20 space-y-3">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <span className="text-[10px] font-mono text-purple-400">GENERATED TEXT RECORD</span>
                  <button
                    onClick={() => handleCopyText(notesResult)}
                    className="p-1 rounded bg-white/5 hover:bg-white/10 border border-white/5 text-slate-300 hover:text-white"
                  >
                    {copyFeedback ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
                <div className="text-xs text-slate-200 leading-relaxed font-sans max-h-72 overflow-y-auto whitespace-pre-wrap pr-1">
                  {notesResult}
                </div>
              </div>
            )}
          </div>
        )}

        {/* VIEW 2: AI CODE COMPILER */}
        {openedToolId === 'code' && (
          <div className="space-y-4">
            <div className="glass-panel p-4 rounded-xl border border-white/5 space-y-3">
              <div>
                <label className="text-[11px] font-mono text-cyan-400 block mb-1.5 uppercase tracking-widest">Programming Language</label>
                <select
                  value={codeLanguage}
                  onChange={(e) => setCodeLanguage(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-xs text-slate-100"
                >
                  <option value="typescript">TypeScript / JavaScript</option>
                  <option value="python">Python 3</option>
                  <option value="cpp">C++ (GCC 12)</option>
                  <option value="go">Golang</option>
                  <option value="html">HTML canvas / CSS layout</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-mono text-cyan-400 block mb-1.5 uppercase tracking-widest">Coding Requirement</label>
                <textarea
                  value={codePrompt}
                  onChange={(e) => setCodePrompt(e.target.value)}
                  placeholder="Describe your logical requirement..."
                  className="w-full h-20 bg-slate-950/40 border border-white/10 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500"
                />
              </div>

              <button
                disabled={loading || !codePrompt}
                onClick={handleGenerateCode}
                className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-cyan-500 to-teal-600 hover:from-cyan-400 hover:to-teal-500 disabled:opacity-40 px-4 py-2.5 rounded-xl text-xs font-bold font-mono text-white transition-all"
              >
                {loading ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Code className="h-3.5 w-3.5" />}
                <span>{loading ? "COMPILING SYSTEM CORES..." : "COMPILE CODE OBJECT"}</span>
              </button>
            </div>

            {codeResult && (
              <div className="space-y-3">
                <div className="glass-panel-heavy rounded-xl border border-cyan-500/20 overflow-hidden">
                  <div className="flex items-center justify-between bg-slate-950/80 px-4 py-2 border-b border-white/5">
                    <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest">{codeLanguage} compiled output</span>
                    <button
                      onClick={() => handleCopyText(codeResult.code)}
                      className="p-1 rounded bg-white/5 hover:bg-white/10 text-slate-300"
                    >
                      {copyFeedback ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                  <pre className="p-4 bg-slate-950 text-[11px] font-mono overflow-x-auto text-emerald-400 whitespace-pre pr-1 max-h-56">
                    {codeResult.code}
                  </pre>
                </div>

                <div className="glass-panel p-4 rounded-xl border border-white/5">
                  <h4 className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest mb-1">Architectural Explanation</h4>
                  <p className="text-xs text-slate-300 leading-normal font-sans text-justify">
                    {codeResult.explanation}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* VIEW 3: AI CONTENT WRITER */}
        {openedToolId === 'writer' && (
          <div className="space-y-4">
            <div className="glass-panel p-4 rounded-xl border border-white/5 space-y-3">
              <div className="grid grid-cols-3 gap-2">
                {['professional', 'creative', 'casual'].map((tone) => (
                  <button
                    key={tone}
                    onClick={() => setWriterTone(tone)}
                    className={`py-1.5 text-[10px] font-mono uppercase tracking-wider rounded-lg border text-center transition-all ${
                      writerTone === tone 
                        ? 'bg-purple-950/60 border-purple-400 text-purple-200 shadow-[0_0_8px_rgba(168,85,247,0.25)]' 
                        : 'bg-slate-950/40 border-white/5 text-slate-400'
                    }`}
                  >
                    {tone}
                  </button>
                ))}
              </div>

              <div>
                <label className="text-[11px] font-mono text-cyan-400 block mb-1.5 uppercase tracking-widest">Brief / Prompts</label>
                <textarea
                  value={writerPrompt}
                  onChange={(e) => setWriterPrompt(e.target.value)}
                  placeholder="Outline the copy requirements, e.g. Apology email to boss for missing system crash diagnostic meetings..."
                  className="w-full h-24 bg-slate-950/40 border border-white/10 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 leading-relaxed"
                />
              </div>

              <button
                disabled={loading || !writerPrompt}
                onClick={handleGenerateWriter}
                className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-500 to-fuchsia-600 hover:from-purple-400 hover:to-fuchsia-500 disabled:opacity-40 px-4 py-2.5 rounded-xl text-xs font-bold font-mono text-white transition-all transform active:scale-95"
              >
                {loading ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                <span>{loading ? "CRAFTING DRAFT..." : "CRAFT CONTENT OBJECT"}</span>
              </button>
            </div>

            {writerResult && (
              <div className="glass-panel-heavy p-4 rounded-xl border border-fuchsia-500/20 space-y-3">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <span className="text-[10px] font-mono text-fuchsia-400 uppercase tracking-widest">Cosmic draft copy</span>
                  <button
                    onClick={() => handleCopyText(writerResult)}
                    className="p-1 rounded bg-white/5 hover:bg-white/10 text-slate-300"
                  >
                    {copyFeedback ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
                <div className="text-xs text-slate-100 leading-relaxed font-sans whitespace-pre-wrap max-h-72 overflow-y-auto">
                  {writerResult}
                </div>
              </div>
            )}
          </div>
        )}

        {/* VIEW 4: PHOTO SOLVER */}
        {openedToolId === 'solver' && (
          <div className="space-y-4">
            <div className="glass-panel p-4 rounded-xl border border-white/5 space-y-3">
              <label className="text-[11.5px] font-mono text-cyan-400 block uppercase tracking-widest">STAGE LESSON GRAPHICS</label>
              
              {/* Image Drag and Drop and select container */}
              <div 
                onClick={() => solverFileInputRef.current?.click()}
                className="border-2 border-dashed border-white/10 hover:border-cyan-500/35 rounded-xl p-5 text-center cursor-pointer bg-slate-950/40 relative aspect-video flex flex-col items-center justify-center space-y-2 overflow-hidden group transition-all"
              >
                {photoBase64 ? (
                  <img 
                    src={photoBase64} 
                    alt="Upload Preview"
                    className="absolute inset-0 w-full h-full object-cover opacity-60" 
                  />
                ) : (
                  <>
                    <ImageIcon className="h-8 w-8 text-rose-400 group-hover:scale-105 transition-transform" />
                    <div className="text-xs font-bold text-slate-200">Drag or select a camera workbook photo</div>
                    <div className="text-[10px] text-slate-500 font-mono">PNG, JPG, BMP up to 10MB</div>
                  </>
                )}
                {photoName && (
                  <div className="absolute bottom-2 bg-slate-950/80 px-2 py-0.5 border border-white/10 rounded font-mono text-[9px] text-cyan-400 tracking-wider">
                    {photoName}
                  </div>
                )}
              </div>

              <input
                type="file"
                accept="image/*"
                ref={solverFileInputRef}
                onChange={handlePhotoUpload}
                className="hidden"
              />

              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setPhotoBase64("https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=800&q=80");
                    setPhotoName("physics_orbital_vectors.png");
                    onAddLog("Pre-selected sample orbital physics equation sheet.");
                  }}
                  className="px-3 py-1.5 rounded-lg border border-white/5 bg-slate-900/60 font-mono text-[9.5px] text-purple-300 uppercase tracking-wider hover:border-purple-500/35 active:scale-95"
                >
                  Load Sample Physics
                </button>
                {photoBase64 && (
                  <button
                    disabled={loading}
                    onClick={handleSolvePhoto}
                    className="flex-1 flex items-center justify-center space-x-1.5 bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500 px-4 py-1.5 rounded-lg text-xs font-bold font-mono text-white transition-all transform active:scale-95"
                  >
                    {loading ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                    <span>{loading ? "SOLVING..." : "SOLVE MULTI-SPECTRUM"}</span>
                  </button>
                )}
              </div>
            </div>

            {photoSolved && (
              <div className="glass-panel-heavy p-4 rounded-xl border border-rose-500/20 space-y-3">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <span className="text-[10px] font-mono text-rose-400 uppercase tracking-widest">Cosmos Core explanation & result</span>
                  <button
                    onClick={() => handleCopyText(photoSolved)}
                    className="p-1 rounded bg-white/5 hover:bg-white/10 text-slate-300"
                  >
                    {copyFeedback ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
                <div className="text-xs text-slate-100 leading-relaxed font-sans max-h-72 overflow-y-auto whitespace-pre-wrap pr-1">
                  {photoSolved}
                </div>
              </div>
            )}
          </div>
        )}

        {/* VIEW 5: PDF READER */}
        {openedToolId === 'pdf' && (
          <div className="space-y-4">
            <div className="glass-panel p-4 rounded-xl border border-white/5 space-y-3">
              <label className="text-[11.5px] font-mono text-cyan-400 block uppercase tracking-widest">DRAG OR SELECT DOCUMENT</label>
              
              <div 
                onClick={() => pdfInputRef.current?.click()}
                className="border-2 border-dashed border-white/10 hover:border-amber-500/35 rounded-xl p-6 text-center cursor-pointer bg-slate-950/40 hover:bg-slate-950/60 transition-all flex flex-col items-center justify-center space-y-2 group"
              >
                <FileUp className="h-10 w-10 text-amber-500 group-hover:translate-y-[-2px] transition-transform animate-pulse" />
                <div className="text-xs font-bold text-slate-200">Upload Text or Instruction files</div>
                <div className="text-[10px] text-slate-500 font-mono">TXT, Markdown or XML guidelines</div>
                {pdfFileName && (
                  <div className="mt-2 bg-slate-950/90 text-amber-400 font-mono text-[9px] border border-amber-950 px-2 py-0.5 rounded">
                    {pdfFileName} ({Math.round(pdfTextContent.length / 1024)} KB)
                  </div>
                )}
              </div>

              <input
                type="file"
                accept=".txt,.md,.json,.js,.py,.xml"
                ref={pdfInputRef}
                onChange={handlePdfUpload}
                className="hidden"
              />

              <div className="flex flex-col space-y-2">
                <div className="text-[10px] font-mono text-slate-500 uppercase">Load simulation manuals:</div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => loadMockPdfTemplate('guidelines')}
                    className="flex-1 py-1.5 rounded-lg border border-white/5 bg-slate-900/60 font-mono text-[10px] text-amber-300 hover:border-amber-500/30 transition-all uppercase"
                  >
                    AI System Manual
                  </button>
                  <button
                    onClick={() => loadMockPdfTemplate('quantum')}
                    className="flex-1 py-1.5 rounded-lg border border-white/5 bg-slate-900/60 font-mono text-[10px] text-amber-300 hover:border-amber-500/30 transition-all uppercase"
                  >
                    Feynman electro QED
                  </button>
                </div>
              </div>

              <button
                disabled={loading || !pdfTextContent}
                onClick={handleExplainPdf}
                className="w-full flex items-center justify-center space-x-1.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 disabled:opacity-40 px-4 py-2.5 rounded-xl text-xs font-bold font-mono text-white transition-all transform active:scale-95"
              >
                {loading ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                <span>{loading ? "DIGESTING DOCUMENT..." : "EXPLAIN SCIENTIFIC SECTIONS"}</span>
              </button>
            </div>

            {pdfResult && (
              <div className="glass-panel-heavy p-4 rounded-xl border border-amber-500/20 space-y-3">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest">Document Analysis summary</span>
                  <button
                    onClick={() => handleCopyText(pdfResult)}
                    className="p-1 rounded bg-white/5 hover:bg-white/10 text-slate-300"
                  >
                    {copyFeedback ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
                <div className="text-xs text-slate-100 leading-relaxed font-sans max-h-72 overflow-y-auto whitespace-pre-wrap pr-1">
                  {pdfResult}
                </div>
              </div>
            )}
          </div>
        )}

        {/* VIEW 6: AI STUDY COMPANION INTERACTIVE QUIZ */}
        {openedToolId === 'study' && (
          <div className="space-y-4">
            <div className="glass-panel p-4 rounded-xl border border-white/5 space-y-3">
              <label className="text-[11.5px] font-mono text-cyan-400 block uppercase tracking-widest">STUDY SUBJECT TARGET</label>
              <input
                type="text"
                value={studyTopic}
                onChange={(e) => setStudyTopic(e.target.value)}
                placeholder="Enter targeted topic e.g. Mitochondria electron transport chain, Dark matter vectors..."
                className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500"
              />
              <button
                disabled={loading || !studyTopic}
                onClick={handleConstructQuiz}
                className="w-full flex items-center justify-center space-x-1.5 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 disabled:opacity-40 px-4 py-2.5 rounded-xl text-xs font-bold font-mono text-white transition-all transform active:scale-95"
              >
                {loading ? <RefreshCw className="h-3 w-3 animate-spin" /> : <GraduationCap className="h-4 w-4" />}
                <span>{loading ? "CONSTRUCTING CURRICULUM..." : "GENERATE MCQ STUDY CORES"}</span>
              </button>
            </div>

            {studyResult && (
              <div className="space-y-4">
                {/* 1. Study Digest */}
                <div className="glass-panel p-4 rounded-xl border border-white/5 space-y-2">
                  <h4 className="text-[11px] font-mono text-emerald-400 uppercase tracking-widest">COSMIC SUBJECT DIGEST</h4>
                  <div className="text-xs text-slate-300 leading-relaxed max-h-48 overflow-y-auto whitespace-pre-wrap">
                    {studyResult.summary}
                  </div>
                </div>

                {/* 2. Interactive quiz */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-widest border-b border-white/5 pb-2">
                    🎓 INTERACTIVE ASSESSMENT ({studyResult.quiz.length} QUESTIONS)
                  </h4>
                  
                  {studyResult.quiz.map((q, qIdx) => {
                    const selectedOptIdx = quizAnswersSelected[qIdx];
                    const isCorrect = selectedOptIdx === q.correctAnswerIndex;
                    
                    return (
                      <div key={qIdx} className="glass-panel p-4 rounded-xl border border-white/5 space-y-3">
                        <div className="text-xs font-black text-slate-100 leading-relaxed flex items-start">
                          <span className="text-emerald-400 mr-2 font-mono">Q{qIdx + 1}.</span>
                          <span>{q.question}</span>
                        </div>

                        <div className="space-y-2">
                          {q.options.map((opt, optIdx) => {
                            const isThisSelected = selectedOptIdx === optIdx;
                            let style = "bg-slate-950/40 border-white/5 hover:border-slate-700 hover:bg-slate-900 text-slate-300";
                            if (isThisSelected) {
                              if (quizSubmitted) {
                                style = isCorrect 
                                  ? "bg-emerald-950/60 border-emerald-500 text-emerald-300" 
                                  : "bg-rose-950/60 border-rose-500 text-rose-300";
                              } else {
                                style = "bg-cyan-950/60 border-cyan-400 text-cyan-200 shadow-[0_0_8px_rgba(34,211,238,0.25)]";
                              }
                            } else if (quizSubmitted && optIdx === q.correctAnswerIndex) {
                              style = "bg-emerald-900/40 border-emerald-500/50 text-emerald-300";
                            }

                            return (
                              <button
                                key={optIdx}
                                disabled={quizSubmitted}
                                onClick={() => handleSelectQuizAnswer(qIdx, optIdx)}
                                className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-center justify-between ${style}`}
                              >
                                <span>{opt}</span>
                                {isThisSelected && quizSubmitted && (
                                  <span className="text-[10px] font-bold font-mono uppercase tracking-wider">
                                    {isCorrect ? 'Correct ✓' : 'Incorrect ✗'}
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>

                        {quizSubmitted && selectedOptIdx !== undefined && (
                          <div className={`mt-2.5 p-2.5 rounded-lg text-[11px] leading-normal font-sans border ${
                            selectedOptIdx === q.correctAnswerIndex 
                              ? 'bg-emerald-950/30 border-emerald-500/20 text-emerald-400' 
                              : 'bg-rose-950/30 border-rose-500/20 text-rose-400'
                          }`}>
                            <span className="font-bold underline block mb-0.5">EXPLANATION:</span>
                            {q.explanation}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {!quizSubmitted && (
                    <button
                      onClick={() => setQuizSubmitted(true)}
                      disabled={Object.keys(quizAnswersSelected).length < studyResult.quiz.length}
                      className="w-full flex items-center justify-center space-x-1 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 disabled:opacity-40 px-4 py-2.5 rounded-xl text-xs font-mono font-bold tracking-widest text-white transition-all transform active:scale-95 shadow-md"
                    >
                      <Check className="h-4 w-4" />
                      <span>SUBMIT ANSWERS FOR GRADING</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* VIEW 7: AI VOICE ASSISTANT */}
        {openedToolId === 'voice' && (
          <div className="space-y-4">
            <div className="glass-panel p-4 rounded-xl border border-white/5 space-y-4">
              
              {/* Voice Dialogue Logger */}
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {voiceDialogue.map((diag, dIdx) => (
                  <div 
                    key={dIdx} 
                    className={`flex flex-col max-w-[85%] rounded-xl p-3 text-xs leading-relaxed ${
                      diag.talker === 'cosmos'
                        ? 'bg-slate-900 border border-white/5 mr-auto text-slate-100'
                        : 'bg-gradient-to-r from-sky-600 to-blue-700 ml-auto text-white'
                    }`}
                  >
                    <span className="font-mono text-[9px] text-cyan-400 mb-1 uppercase tracking-widest">
                      {diag.talker === 'cosmos' ? '✦ COSMOS CORE VOICE' : '🛰️ USER TRANSMISSION'}
                    </span>
                    <p>{diag.text}</p>
                    {diag.talker === 'cosmos' && (
                      <button 
                        onClick={() => triggerSpeechSynthesis(diag.text)}
                        className="mt-2 text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center space-x-1 font-mono w-fit border border-cyan-800/20 bg-cyan-950/40 px-2 py-0.5 rounded"
                      >
                        <Volume2 className="h-3 w-3" />
                        <span>LISTEN AGAIN</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Action mic panel */}
              <div className="flex flex-col items-center justify-center space-y-3 border-t border-white/5 pt-4">
                
                {/* Large pulsating Mic Button */}
                <button
                  onClick={startSpeechRecognition}
                  disabled={loading}
                  className={`relative h-16 w-16 rounded-full flex items-center justify-center transition-all ${
                    isListening 
                      ? 'bg-rose-500 scale-105 shadow-[0_0_20px_rgba(239,68,68,0.5)]' 
                      : 'bg-gradient-to-r from-sky-500 to-blue-600 hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(14,165,233,0.3)]'
                  }`}
                >
                  {isListening && (
                    <span className="absolute inset-0 rounded-full border-4 border-rose-400 animate-ping opacity-75" />
                  )}
                  <Mic className="h-7 w-7 text-white" />
                </button>

                <div className="text-[10px] font-mono text-slate-400 text-center">
                  {isListening ? (
                    <span className="text-rose-400 animate-pulse font-bold">TRANSMISSION CHANNEL SPEECH RECORDING...</span>
                  ) : (
                    <span>TAP MICROPHONE TO DIALOGUE VERBALLY</span>
                  )}
                </div>
              </div>

              {/* Text input override */}
              <div className="flex items-center space-x-2 bg-slate-950/60 p-2 border border-white/15 rounded-xl">
                <input
                  type="text"
                  value={voiceInput}
                  onChange={(e) => setVoiceInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendVoiceQuery()}
                  placeholder="Or type voice query manually..."
                  className="flex-1 bg-transparent border-none text-xs text-white"
                />
                <button
                  disabled={loading || !voiceInput.trim()}
                  onClick={handleSendVoiceQuery}
                  className="p-1.5 rounded-lg bg-sky-500 text-white hover:bg-sky-400"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
