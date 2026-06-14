import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Image as ImageIcon, Video as VideoIcon, FileText, Code, 
  Download, RefreshCw, AlertTriangle, Play, Save, Check
} from 'lucide-react';
import { GeneratedImage, GeneratedVideo } from '../types';

interface CreateScreenProps {
  onSaveImage: (img: GeneratedImage) => void;
  onSaveVideo: (vid: GeneratedVideo) => void;
  incrementStats: (key: string) => void;
  onAddLog: (logText: string) => void;
}

export const CreateScreen: React.FC<CreateScreenProps> = ({
  onSaveImage,
  onSaveVideo,
  incrementStats,
  onAddLog
}) => {
  const [activeTab, setActiveTab] = useState<'image' | 'video' | 'text' | 'code'>('image');
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  /* ==========================================
     IMAGE GENERATOR STATES
     ========================================== */
  const [imgPrompt, setImgPrompt] = useState('A retro-futuristic holographic matrix glowing inside a dark cyberpunk space, 8k resolution');
  const [imgAspectRatio, setImgAspectRatio] = useState('1:1');
  const [imgResult, setImgResult] = useState<string | null>(null);
  const [imageSaveFeedback, setImageSaveFeedback] = useState(false);

  /* ==========================================
     VIDEO GENERATOR (VEO) STATES
     ========================================== */
  const [vidPrompt, setVidPrompt] = useState('An astronaut exploring a neon liquid mercury ocean with purple ring planets, cinematography');
  const [vidAspectRatio, setVidAspectRatio] = useState('16:9');
  const [vidOperationName, setVidOperationName] = useState<string | null>(null);
  const [vidPollStatus, setVidPollStatus] = useState<string>('idle'); // idle, polling, ready
  const [vidResultUrl, setVidResultUrl] = useState<string | null>(null);
  const [vidProgressMsg, setVidProgressMsg] = useState('');

  /* ==========================================
     TEXT & CODE QUICK GENERATOR STATES
     ========================================== */
  const [textPrompt, setTextPrompt] = useState('');
  const [textTone, setTextTone] = useState('Creative');
  const [textResult, setTextResult] = useState('');
  
  const [codePrompt, setCodePrompt] = useState('');
  const [codeLang, setCodeLang] = useState('typescript');
  const [codeResult, setCodeResult] = useState('');

  /* ==========================================
     7. VEO VIDEO POLL LOOP IMPLEMENTATION
     ========================================== */
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    const checkStatus = async () => {
      if (!vidOperationName) return;
      try {
        const res = await fetch('/api/video-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ operationName: vidOperationName }),
        });
        const statusData = await res.json();
        
        if (statusData.done) {
          // Status completed, proceed to stream download URI
          triggerVideoDownload();
        } else {
          // Keep polling every 2.5 seconds
          const loadMsgs = [
            'Extrapolating fluid cinematic grids...',
            'Injecting relativistic lighting rays...',
            'Compiling vector field arrays...',
            'Aligning hyper-spectral canvas details...',
            'Suturing final space-time frame sequences...'
          ];
          setVidProgressMsg(loadMsgs[Math.floor(Math.random() * loadMsgs.length)]);
          timer = setTimeout(checkStatus, 2500);
        }
      } catch (err) {
        setErrorText("Status polling telemetry disrupted.");
        setVidPollStatus('idle');
        setLoading(false);
      }
    };

    if (vidPollStatus === 'polling') {
      timer = setTimeout(checkStatus, 1500);
    }

    return () => clearTimeout(timer);
  }, [vidOperationName, vidPollStatus]);

  const triggerVideoDownload = async () => {
    if (!vidOperationName) return;
    setVidProgressMsg('Extracting render payload elements...');
    try {
      const res = await fetch('/api/video-download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operationName: vidOperationName }),
      });
      const data = await res.json();
      
      if (res.ok && data.videoUrl) {
        setVidResultUrl(data.videoUrl);
        setVidPollStatus('ready');
        setLoading(false);
        incrementStats('videosCreated');
        onSaveVideo({
          id: 'video_' + Date.now(),
          prompt: vidPrompt,
          operationName: vidOperationName,
          status: 'completed',
          url: data.videoUrl,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        });
        onAddLog(`Successfully compiled physical cinematic mp4 clip.`);
      } else {
        setErrorText("Decoder failed: " + (data.error || "Uplink empty."));
        setVidPollStatus('idle');
        setLoading(false);
      }
    } catch (err: any) {
      setErrorText("Video stream unreleased: " + err.message);
      setVidPollStatus('idle');
      setLoading(false);
    }
  };


  /* ==========================================
     ACTION DISPATCHERS
     ========================================== */

  // Image Dispatcher
  const handleGenerateImage = async () => {
    if (!imgPrompt) return;
    setLoading(true);
    setErrorText(null);
    setImgResult(null);
    setImageSaveFeedback(false);
    onAddLog("Initiating image generator.");

    try {
      const res = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: imgPrompt, aspectRatio: imgAspectRatio }),
      });
      const data = await res.json();
      
      if (res.ok && data.imageUrl) {
        setImgResult(data.imageUrl);
        incrementStats('imagesCreated');
        if (data.warning) {
          onAddLog(`System warning: ${data.warning}`);
        } else {
          onAddLog("Image generator output rendering complete.");
        }
      } else {
        setErrorText(data.error || "Generative pipeline refused requests. Check credentials.");
      }
    } catch (err: any) {
      setErrorText("Telemetry mismatch: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToGallery = () => {
    if (!imgResult) return;
    onSaveImage({
      id: 'img_' + Date.now(),
      prompt: imgPrompt,
      url: imgResult,
      aspectRatio: imgAspectRatio,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
    setImageSaveFeedback(true);
    onAddLog("Saved cosmic painting to device history.");
  };

  // Video Dispatcher
  const handleGenerateVideo = async () => {
    if (!vidPrompt) return;
    setLoading(true);
    setErrorText(null);
    setVidResultUrl(null);
    setVidOperationName(null);
    setVidPollStatus('polling');
    setVidProgressMsg('Scheduling Veo cluster matrices...');
    onAddLog("Formulating Veo vector job.");

    try {
      const res = await fetch('/api/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: vidPrompt, 
          aspectRatio: vidAspectRatio, 
          resolution: '720p' 
        }),
      });
      const data = await res.json();
      
      if (res.ok && data.operationName) {
        setVidOperationName(data.operationName);
      } else {
        setErrorText(data.error || "Video scheduler declined rendering.");
        setVidPollStatus('idle');
        setLoading(false);
      }
    } catch (err: any) {
      setErrorText("Video core linkage disruption: " + err.message);
      setVidPollStatus('idle');
      setLoading(false);
    }
  };

  // Quick Text Creator
  const handleGenerateText = async () => {
    if (!textPrompt) return;
    setLoading(true);
    setErrorText(null);
    try {
      const res = await fetch('/api/tools/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          toolType: 'writer', 
          prompt: textPrompt, 
          extraParams: { tone: textTone } 
        }),
      });
      const data = await res.json();
      if (res.ok && data.text) {
        setTextResult(data.text);
        incrementStats('tokensEstimated');
      } else {
        setErrorText("Synthesizer reported disruption.");
      }
    } catch (err: any) {
      setErrorText("Text core failure: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Quick Code Creator
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
          prompt: `${codePrompt} in language ${codeLang}` 
        }),
      });
      const data = await res.json();
      if (res.ok && data.code) {
        setCodeResult(data.code);
        incrementStats('tokensEstimated');
      } else {
        setErrorText("Compiler reported disruption.");
      }
    } catch (err: any) {
      setErrorText("Compiler link failure: " + err.message);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="w-full flex-1 overflow-y-auto space-y-6 pb-28 pt-2 px-4 max-w-lg mx-auto text-white scroll-smooth">
      
      {/* Header tabs */}
      <div className="flex flex-col mt-2">
        <h2 className="text-2xl font-black tracking-tight uppercase">CREATIVE STUDIO</h2>
        <p className="text-xs text-purple-400">Spawn original graphic assets, videos & articles</p>
      </div>

      {/* Visual toggle tabs */}
      <div className="flex bg-slate-950/40 p-1 rounded-xl border border-white/5">
        {[
          { id: 'image', label: 'Image', icon: ImageIcon },
          { id: 'video', label: 'Video (Veo)', icon: VideoIcon },
          { id: 'text', label: 'Text', icon: FileText },
          { id: 'code', label: 'Code', icon: Code },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => {
                if (loading) return;
                setActiveTab(tab.id as any);
                setErrorText(null);
              }}
              className={`flex-1 py-2 rounded-lg text-[10.5px] font-mono uppercase tracking-widest flex items-center justify-center space-x-1 transition-all ${
                activeTab === tab.id 
                  ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-purple-400/30 text-cyan-300 font-bold' 
                  : 'text-slate-400 border border-transparent'
              }`}
            >
              <Icon className="h-3 w-3" />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Global Error Notice */}
      {errorText && (
        <div className="flex items-start space-x-2.5 bg-rose-950/20 border border-rose-500/30 p-3.5 rounded-xl">
          <AlertTriangle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="text-xs text-rose-300 font-sans space-y-1">
            <span className="font-bold">Generative disruption</span>
            <p>{errorText}</p>
          </div>
        </div>
      )}

      {/* SUB-SECTIONS CONTENT */}
      <div className="space-y-4">
        
        {/* 1. IMAGE PORT */}
        {activeTab === 'image' && (
          <div className="space-y-4">
            <div className="glass-panel p-4 rounded-xl border border-white/5 space-y-3">
              <div>
                <label className="text-[10px] font-mono text-cyan-400 tracking-wider mb-1 block uppercase">ART INTAKE PROMPT</label>
                <textarea
                  value={imgPrompt}
                  onChange={(e) => setImgPrompt(e.target.value)}
                  className="w-full h-20 bg-slate-950/40 border border-white/10 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 leading-normal"
                />
              </div>

              <div>
                <span className="text-[10px] font-mono text-cyan-400 tracking-wider mb-2 block uppercase">CANVAS ASPECT RATIO</span>
                <div className="grid grid-cols-4 gap-1.5">
                  {['1:1', '16:9', '9:16', '4:3'].map((aspect) => (
                    <button
                      key={aspect}
                      onClick={() => setImgAspectRatio(aspect)}
                      className={`py-1 rounded-lg font-mono text-[10px] border text-center transition-all ${
                        imgAspectRatio === aspect 
                          ? 'bg-purple-950/50 border-purple-400 text-purple-200' 
                          : 'bg-slate-950/40 border-white/5 text-slate-400'
                      }`}
                    >
                      {aspect}
                    </button>
                  ))}
                </div>
              </div>

              <button
                disabled={loading || !imgPrompt}
                onClick={handleGenerateImage}
                className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 px-4 py-2.5 rounded-xl text-xs font-bold font-mono tracking-widest transition-all hover:opacity-90 transform active:scale-95"
              >
                {loading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                <span>{loading ? "PAINTING VECTORS..." : "INITIALIZE BRUSHES"}</span>
              </button>
            </div>

            {imgResult && (
              <div className="rounded-xl overflow-hidden glass-panel-heavy border border-cyan-500/20 p-4 space-y-3">
                <div className="relative rounded-lg overflow-hidden border border-white/5 bg-slate-950 aspect-square max-h-80 mx-auto select-none">
                  {/* Linear slide shader */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-[150%] skew-x-12 animate-[shimmer-slide_4s_ease-in-out_infinite]" />
                  <img 
                    src={imgResult} 
                    alt="Generated Asset" 
                    className="w-full h-full object-contain"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="flex items-center space-x-2 mt-2">
                  <button
                    onClick={handleSaveToGallery}
                    className="flex-1 py-2 bg-slate-900 border border-white/10 text-xs font-mono font-bold hover:border-cyan-500/30 text-white rounded-lg active:scale-95 transition-all flex items-center justify-center space-x-1.5"
                  >
                    {imageSaveFeedback ? <Check className="h-3.5 w-3.5 text-green-400 animate-pulse" /> : <Save className="h-3.5 w-3.5" />}
                    <span>{imageSaveFeedback ? "ADDED TO ARCHIVE" : "SAVE TO LOCAL HIST"}</span>
                  </button>
                  <a
                    href={imgResult}
                    download={`ai_universe_${Date.now()}.png`}
                    className="p-2 bg-slate-900 border border-white/10 hover:border-cyan-500/30 text-slate-300 rounded-lg active:scale-95 transition-all"
                  >
                    <Download className="h-4 w-4" />
                  </a>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 2. VIDEO PORT (VEO) */}
        {activeTab === 'video' && (
          <div className="space-y-4">
            <div className="glass-panel p-4 rounded-xl border border-white/5 space-y-3">
              <div>
                <label className="text-[10px] font-mono text-cyan-400 tracking-wider mb-1 block uppercase">VEO CINEMATICS PROMPT</label>
                <textarea
                  value={vidPrompt}
                  onChange={(e) => setVidPrompt(e.target.value)}
                  className="w-full h-20 bg-slate-950/40 border border-white/10 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 leading-normal"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[9.5px] font-mono text-cyan-400 tracking-wider mb-1.5 block uppercase">ASPECT ASPECT</span>
                  <select
                    value={vidAspectRatio}
                    onChange={(e) => setVidAspectRatio(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-2 text-xs text-slate-300 font-mono"
                  >
                    <option value="16:9">Landscape 16:9</option>
                    <option value="9:16">Portrait 9:16</option>
                  </select>
                </div>
                <div>
                  <span className="text-[9.5px] font-mono text-cyan-400 tracking-wider mb-1.5 block uppercase">KINETIC RESOLUTION</span>
                  <select
                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-2 text-xs text-slate-500 font-mono"
                    disabled
                  >
                    <option value="720p">HD 720p (Lite)</option>
                    <option value="1080p" disabled>FHD 1080p (Paid)</option>
                  </select>
                </div>
              </div>

              <button
                disabled={loading || !vidPrompt}
                onClick={handleGenerateVideo}
                className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-4 py-2.5 rounded-xl text-xs font-bold font-mono tracking-widest uppercase transition-all shadow-md transform active:scale-95"
              >
                {loading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3 w-3 fill-white" />}
                <span>{loading ? "STITCHING KINETICS..." : "GENERATE CINEMATIC"}</span>
              </button>
            </div>

            {/* Rendering Progress display */}
            {loading && vidPollStatus === 'polling' && (
              <div className="glass-panel p-5 rounded-xl border border-fuchsia-500/20 text-center space-y-3">
                <RefreshCw className="h-8 w-8 text-fuchsia-400 animate-spin mx-auto" />
                <div className="space-y-1">
                  <div className="text-xs font-bold font-mono text-slate-200">Veo Generative Cluster Working...</div>
                  <div className="text-[10px] text-fuchsia-400 font-mono animate-pulse">{vidProgressMsg}</div>
                </div>
                <div className="text-[9px] text-slate-500 font-mono uppercase bg-slate-950/40 px-3 py-1 border border-white/5 rounded w-fit mx-auto">
                  Job ID: {vidOperationName?.substring(0, 32)}...
                </div>
              </div>
            )}

            {/* Video result rendering */}
            {vidResultUrl && vidPollStatus === 'ready' && (
              <div className="rounded-xl overflow-hidden glass-panel-heavy border border-purple-500/20 p-4 space-y-3 select-none">
                <div className="relative rounded-lg overflow-hidden border border-white/5 bg-slate-950 aspect-video max-h-72 mx-auto">
                  <video 
                    src={vidResultUrl} 
                    controls 
                    autoPlay 
                    loop 
                    muted
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex items-center space-x-2 justify-between">
                  <span className="text-[9.5px] font-mono text-purple-300 uppercase tracking-widest break-all">VEO_RECOGNITION COMPLETED // 16:9</span>
                  <a
                    href={vidResultUrl}
                    download={`veo_video_${Date.now()}.mp4`}
                    className="flex items-center space-x-1 py-1.5 px-3 rounded-lg border border-white/10 bg-slate-900 text-[10px] font-mono font-bold hover:border-purple-500/35 text-white active:scale-95"
                  >
                    <Download className="h-3 w-3" />
                    <span>DL MP4</span>
                  </a>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 3. TEXT PORT */}
        {activeTab === 'text' && (
          <div className="space-y-4">
            <div className="glass-panel p-4 rounded-xl border border-white/5 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-mono text-cyan-400 uppercase">Input prompt context</label>
                <select
                  value={textTone}
                  onChange={(e) => setTextTone(e.target.value)}
                  className="bg-slate-950 border border-white/10 rounded px-2 py-0.5 text-[10px] text-slate-300"
                >
                  <option value="Creative">Creative Draft</option>
                  <option value="Professional">Corporate Pitch</option>
                  <option value="Scientific">Academic Formulaic</option>
                </select>
              </div>
              <textarea
                value={textPrompt}
                onChange={(e) => setTextPrompt(e.target.value)}
                placeholder="Compose a blog outline of solar sail physics..."
                className="w-full h-20 bg-slate-950/40 border border-white/10 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500"
              />
              <button
                disabled={loading || !textPrompt}
                onClick={handleGenerateText}
                className="w-full py-2 bg-gradient-to-r from-fuchsia-500 to-indigo-600 rounded-xl text-xs font-mono font-bold uppercase transition-all"
              >
                {loading ? "Drafting..." : "Synthesize Narrative"}
              </button>
            </div>

            {textResult && (
              <div className="glass-panel p-4 rounded-xl border border-white/10 text-xs text-slate-200 leading-relaxed font-sans whitespace-pre-wrap max-h-60 overflow-y-auto">
                {textResult}
              </div>
            )}
          </div>
        )}

        {/* 4. CODE PORT */}
        {activeTab === 'code' && (
          <div className="space-y-4">
            <div className="glass-panel p-4 rounded-xl border border-white/5 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-mono text-cyan-400 uppercase">Logical Requirements</label>
                <select
                  value={codeLang}
                  onChange={(e) => setCodeLang(e.target.value)}
                  className="bg-slate-950 border border-white/10 rounded px-2 py-0.5 text-[10px] text-slate-300"
                >
                  <option value="typescript">TypeScript</option>
                  <option value="python">Python</option>
                  <option value="html">HTML layout</option>
                </select>
              </div>
              <textarea
                value={codePrompt}
                onChange={(e) => setCodePrompt(e.target.value)}
                placeholder="Express required operation, e.g. Dijkstra fast routing solver method..."
                className="w-full h-20 bg-slate-950/40 border border-white/10 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500"
              />
              <button
                disabled={loading || !codePrompt}
                onClick={handleGenerateCode}
                className="w-full py-2 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl text-xs font-mono font-bold uppercase transition-all"
              >
                {loading ? "Assembling Core..." : "Assemble code core"}
              </button>
            </div>

            {codeResult && (
              <pre className="p-4 bg-slate-950 rounded-xl text-emerald-400 text-[10px] font-mono overflow-x-auto whitespace-pre max-h-60">
                {codeResult}
              </pre>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
