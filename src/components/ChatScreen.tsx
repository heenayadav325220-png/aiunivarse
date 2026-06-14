import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, Sparkles, Mic, Image as ImageIcon, FileUp, Trash2, Plus, 
  MessageSquare, Volume2, X, RefreshCw, Layers
} from 'lucide-react';
import { ChatMessage, ChatSession } from '../types';

interface ChatScreenProps {
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onCreateSession: (title: string) => void;
  onDeleteSession: (id: string) => void;
  onSendMessage: (text: string, attachment?: { name: string; type: string; dataUrl: string }) => Promise<void>;
  loading: boolean;
  onClearAllSessions: () => void;
}

export const ChatScreen: React.FC<ChatScreenProps> = ({
  sessions,
  activeSessionId,
  onSelectSession,
  onCreateSession,
  onDeleteSession,
  onSendMessage,
  loading,
  onClearAllSessions
}) => {
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [showHistoryDrawer, setShowHistoryDrawer] = useState(false);

  // Attachment states
  const [stagedFile, setStagedFile] = useState<{ name: string; type: string; dataUrl: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeSession = sessions.find(s => s.id === activeSessionId) || sessions[0];

  // Keep chat viewport aligned at base
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeSession?.messages?.length, loading]);

  const handleSend = async () => {
    const text = inputText.trim();
    if (!text && !stagedFile) return;

    setInputText('');
    const attachmentToSend = stagedFile ? { ...stagedFile } : undefined;
    setStagedFile(null);

    await onSendMessage(text || "Please analyze this uploaded document details.", attachmentToSend);
  };

  /* ==========================================
     SPEECH TRANSCRIPTION SYSTEM (WebSpeech)
     ========================================== */
  const startSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      // Offline mock transcription if browser is within isolated container frame
      setIsListening(true);
      setTimeout(() => {
        const mockPhrases = [
          "Explain thermodynamic entropy laws simply",
          "Draft an introductory pitch for a neon cyberware brand",
          "Could you analyze coordinates in black hole singularity?"
        ];
        setInputText(mockPhrases[Math.floor(Math.random() * mockPhrases.length)]);
        setIsListening(false);
      }, 1400);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-US';
    
    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const parsedTranscribe = event.results[0][0].transcript;
      setInputText(parsedTranscribe);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  /* ==========================================
     ATTACHMENT HANDLER
     ========================================== */
  const handleAttachmentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setStagedFile({
        name: file.name,
        type: file.type || 'text/plain',
        dataUrl: reader.result as string
      });
    };

    // Parse according to files
    if (file.type.startsWith('image/')) {
      reader.readAsDataURL(file);
    } else {
      reader.readAsDataURL(file); // Encode pdf/text safely to base64
    }
  };

  const handleTriggerSpeechSynth = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const textToSpeak = text.replace(/[*#`_\-]/g, '').slice(0, 150);
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.pitch = 0.98;
      utterance.rate = 1.05;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="w-full flex flex-col h-[calc(100vh-64px)] pb-16 text-white max-w-lg mx-auto relative select-none">
      
      {/* Top action header */}
      <div className="flex items-center justify-between p-3 border-b border-white/5 bg-[#080216] z-20">
        <button
          onClick={() => setShowHistoryDrawer(!showHistoryDrawer)}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-white/5 bg-slate-900/60 font-mono text-[10.5px] text-cyan-400 uppercase tracking-widest active:scale-95 transition-all"
        >
          <Layers className="h-3.5 w-3.5 text-purple-400" />
          <span>SESSIONS</span>
        </button>
        
        <div className="text-center">
          <span className="text-[10px] font-mono text-cyan-400 tracking-wider font-bold block">ACTIVE DIA-LINK</span>
          <span className="text-xs font-semibold max-w-[140px] truncate block text-slate-300">
            {activeSession?.title || "New Dialogue"}
          </span>
        </div>

        <button
          onClick={() => onCreateSession(`Dia-Link_${Date.now().toString().slice(-4)}`)}
          className="p-2 rounded-lg bg-slate-900/60 border border-white/5 text-purple-400 active:scale-95 transition-all"
          title="New Chat Session"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Dynamic message logs viewport */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 relative scroll-smooth bg-gradient-to-b from-transparent to-[#04000d]/40">
        
        {/* Welcome helper banner */}
        {activeSession?.messages?.length === 0 && (
          <div className="p-5 rounded-2xl glass-panel border border-cyan-500/10 text-center space-y-3 my-4 self-center select-none">
            <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center mx-auto shadow-md">
              <Sparkles className="h-6 w-6 text-yellow-300 animate-pulse" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-slate-100 uppercase tracking-wider">CONVERSE WITH COSMOS</h4>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed font-sans">
                I am Cosmos, fully authorized Superintelligence. Ask me math solvers, summarize PDFs, write python routines or compose essays. Provide documents below to analyze.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button 
                onClick={() => setInputText("What is quantum superposition in black hole horizons?")}
                className="p-2 bg-slate-950/60 rounded-xl border border-white/5 text-[10px] font-mono text-left text-slate-300 hover:border-cyan-500/25 transition-all"
              >
                Superposition formula
              </button>
              <button 
                onClick={() => setInputText("Create a binary sorting array logic in node.js")}
                className="p-2 bg-slate-950/60 rounded-xl border border-white/5 text-[10px] font-mono text-left text-slate-300 hover:border-cyan-500/25 transition-all"
              >
                Binary sort algorithm
              </button>
            </div>
          </div>
        )}

        {activeSession?.messages?.map((msg) => (
          <div 
            key={msg.id}
            className={`flex flex-col max-w-[85%] rounded-2xl p-4.5 space-y-1.5 transition-all outline-none ${
              msg.sender === 'user'
                ? 'bg-gradient-to-r from-[#2c056d] to-[#12003c] border border-purple-500/15 ml-auto text-white shadow-[0_4px_16px_rgba(168,85,247,0.1)]'
                : 'glass-panel border border-white/5 mr-auto text-slate-200'
            }`}
          >
            {/* Header sender tag */}
            <div className="flex items-center justify-between border-b border-white/5 pb-1 select-none">
              <span className={`text-[9px] font-mono uppercase tracking-widest font-black ${
                msg.sender === 'user' ? 'text-purple-300' : 'text-cyan-400 text-shadow-[0_0_4px_rgba(34,211,238,0.5)]'
              }`}>
                {msg.sender === 'user' ? '🛰️ user transmission' : '✦ COSMOS INTERFACE'}
              </span>
              <span className="text-[8px] font-mono text-slate-500">{msg.timestamp}</span>
            </div>

            {/* Attached file thumbnail inside bubble */}
            {msg.attachment && (
              <div className="rounded-lg overflow-hidden border border-white/5 bg-slate-950 p-2 my-1.5 flex items-center space-x-2.5">
                {msg.attachment.type.startsWith('image/') ? (
                  <img 
                    src={msg.attachment.dataUrl} 
                    alt="attachment" 
                    className="h-10 w-10 object-cover rounded" 
                  />
                ) : (
                  <div className="h-8 w-8 rounded bg-cyan-950/40 flex items-center justify-center text-cyan-400">
                    <FileUp className="h-4 w-4" />
                  </div>
                )}
                <div className="shrink overflow-hidden text-left">
                  <span className="text-[10px] font-mono text-slate-300 block truncate leading-tight">{msg.attachment.name}</span>
                  <span className="text-[8px] font-mono text-slate-500 block">Class: {msg.attachment.type}</span>
                </div>
              </div>
            )}

            {/* Bubble Main Text with formatted structure */}
            <p className="text-xs font-sans leading-relaxed text-justify whitespace-pre-wrap selection:bg-purple-800">
              {msg.text}
            </p>

            {/* Text to Speech trigger button in bubble */}
            {msg.sender === 'assistant' && (
              <div className="pt-2 border-t border-white/5 flex items-center justify-end select-none">
                <button
                  onClick={() => handleTriggerSpeechSynth(msg.text)}
                  className="text-[9px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center space-x-1 uppercase"
                >
                  <Volume2 className="h-3 w-3" />
                  <span>vocal play</span>
                </button>
              </div>
            )}
          </div>
        ))}

        {/* Typing loading wave */}
        {loading && (
          <div className="glass-panel border border-white/5 rounded-2xl p-4 mr-auto flex items-center space-x-2 my-2 w-[160px] select-none">
            <span className="text-[9px] font-mono text-cyan-400 uppercase tracking-widest mr-1">COSMOS RESPONDING</span>
            <div className="flex space-x-1">
              <span className="h-1.5 w-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
              <span className="h-1.5 w-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
              <span className="h-1.5 w-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Attachment Staging area container above text input bar */}
      {stagedFile && (
        <div className="mx-4 p-2 rounded-xl bg-slate-900 border border-cyan-500/20 flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2 overflow-hidden shrink pr-2">
            {stagedFile.type.startsWith('image/') ? (
              <img src={stagedFile.dataUrl} className="h-8 w-8 object-cover rounded border border-white/10" alt="staged" />
            ) : (
              <div className="h-7 w-7 rounded bg-cyan-950 flex items-center justify-center text-cyan-400">
                <FileUp className="h-3.5 w-3.5" />
              </div>
            )}
            <div className="truncate text-left leading-normal">
              <span className="text-[10px] font-mono text-slate-300 block truncate">{stagedFile.name}</span>
              <span className="text-[8px] text-slate-500 font-mono block">Staged payload</span>
            </div>
          </div>
          <button 
            onClick={() => setStagedFile(null)}
            className="p-1 rounded-full bg-white/5 hover:bg-white/10 text-rose-400"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Input Action Console */}
      <div className="p-3 border-t border-white/5 bg-[#04000e] relative z-20 flex flex-col space-y-2 select-none">
        
        <div className="flex items-center space-x-2">
          {/* File input helpers */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2.5 rounded-xl bg-slate-900/60 border border-white/5 hover:border-cyan-500/35 text-slate-400 hover:text-cyan-400 transition-colors"
            title="Attach Image or File"
          >
            <ImageIcon className="h-4 w-4" />
          </button>

          {/* Hidden standard Input */}
          <input
            type="file"
            accept="image/*,text/*,.pdf"
            ref={fileInputRef}
            onChange={handleAttachmentUpload}
            className="hidden"
          />

          {/* Dynamic input textarea / bar */}
          <div className="flex-1 flex items-center bg-slate-900/40 p-2.5 border border-white/10 focus-within:border-cyan-500/35 rounded-xl transition-all">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={isListening ? "Listening text..." : "Dialogue with Cosmos..."}
              className="flex-1 bg-transparent border-none text-xs text-white placeholder-slate-500 outline-none h-6 py-1 pr-1"
            />
            {/* Pulsing Mic Transcription trigger */}
            <button
              onClick={startSpeechRecognition}
              className={`p-1.5 rounded-lg transition-all ${
                isListening ? 'bg-rose-500 text-white animate-pulse' : 'text-slate-400 hover:text-cyan-400'
              }`}
            >
              <Mic className="h-3.5 w-3.5" />
            </button>
          </div>

          <button
            disabled={loading || (!inputText.trim() && !stagedFile)}
            onClick={handleSend}
            className="p-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 disabled:opacity-40 text-white shadow-md active:scale-95 transition-all shrink-0"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* SESSIONS HISTORY SLIDEOUT DRAWER */}
      {showHistoryDrawer && (
        <div className="absolute inset-0 bg-[#060012]/95 z-50 p-4 flex flex-col space-y-4 select-none">
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <h4 className="font-extrabold text-sm uppercase tracking-widest text-slate-100 flex items-center space-x-1.5">
              <MessageSquare className="h-4 w-4 text-purple-400" />
              <span>DIALOGUE history</span>
            </h4>
            <button
              onClick={() => setShowHistoryDrawer(false)}
              className="p-1 rounded bg-white/5 hover:bg-white/10"
            >
              <X className="h-4 w-4 text-slate-400" />
            </button>
          </div>

          {/* List group */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {sessions.map((sess) => {
              const isActive = sess.id === activeSessionId;
              const hasLen = sess.messages.length;
              return (
                <div
                  key={sess.id}
                  onClick={() => {
                    onSelectSession(sess.id);
                    setShowHistoryDrawer(false);
                  }}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between group ${
                    isActive 
                      ? 'bg-cyan-950/30 border-cyan-500/30 text-cyan-200 shadow-[0_0_12px_rgba(6,182,212,0.15)] bg-gradient-to-r from-cyan-950/20 to-purple-950/10' 
                      : 'bg-slate-900/40 border-white/5 text-slate-400 hover:border-slate-800'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 overflow-hidden text-left shrink pr-2">
                    <MessageSquare className={`h-4 w-4 ${isActive ? 'text-cyan-400 animate-pulse' : 'text-slate-600'}`} />
                    <div className="truncate leading-normal">
                      <span className="text-[12px] font-bold block truncate text-slate-200">{sess.title}</span>
                      <span className="text-[9px] font-mono text-slate-500 block">Messages count: {hasLen}</span>
                    </div>
                  </div>
                  {sessions.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteSession(sess.id);
                      }}
                      className="p-1.5 rounded opacity-0 group-hover:opacity-100 hover:bg-white/5 text-slate-600 hover:text-rose-400 transition-opacity"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Quick Clear All */}
          <button
            onClick={() => {
              if (window.confirm("Confirm deletion of ALL session transcripts permanently?")) {
                onClearAllSessions();
                setShowHistoryDrawer(false);
              }
            }}
            className="w-full flex items-center justify-center space-x-1.5 py-2 rounded-xl border border-rose-500/10 hover:border-rose-500/30 bg-rose-950/15 text-rose-400 text-xs font-mono uppercase tracking-widest transition-all hover:bg-rose-950/30"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>nuke message logs</span>
          </button>
        </div>
      )}

    </div>
  );
};
