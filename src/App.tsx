import { useState, useEffect, useCallback, useMemo } from 'react';
import { Home, Compass, Sparkles, MessageSquare, User, Sun, Moon } from 'lucide-react';
import { CosmicBackground } from './components/CosmicBackground';
import { Splash } from './components/Splash';
import { HomeScreen } from './components/HomeScreen';
import { ToolsScreen } from './components/ToolsScreen';
import { CreateScreen } from './components/CreateScreen';
import { ChatScreen } from './components/ChatScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { AuthScreen } from './components/AuthScreen';
import { ChatSession, ChatMessage, GeneratedImage, GeneratedVideo, SavedNote, SavedContent, GeneratedCode, UsageStats } from './types';
import { playNavClick, playSaveSuccess } from './utils/audio';

// Firebase core configuration
import { auth, db, logoutUser, handleFirestoreError, OperationType, signInWithGoogle } from './lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { onSnapshot, collection, query, where, doc, setDoc, deleteDoc, getDoc, updateDoc } from 'firebase/firestore';

export default function App() {
  // Splash toggle phase
  const [showSplash, setShowSplash] = useState(true);

  // Authentication controllers states
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [isGuest, setIsGuest] = useState<boolean>(() => {
    return localStorage.getItem('aiu_guest_explorer') === 'true';
  });
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);

  // Active navigation controllers
  const [activeTab, setActiveTab] = useState<string>('home');
  const [openedToolId, setOpenedToolId] = useState<string | null>(null);

  // Core telemetry log records
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = useCallback((logText: string) => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLogs((prev) => [`[${timestamp}] ${logText}`, ...prev.slice(0, 49)]); // Maintain max 50 logs of history
  }, []);

  // Theme controllers (persisted)
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('aiu_theme') as 'dark' | 'light') || 'dark';
  });

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('aiu_theme', next);
      addLog(`Theme switch protocol activated: ${next.toUpperCase()}`);
      return next;
    });
  }, [addLog]);

  // Stored state caches loaded synchronously to prevent split-second rendering flash
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    try {
      const stored = localStorage.getItem('aiu_sessions');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    
    const defaultSId = 'sess_primary';
    return [{
      id: defaultSId,
      title: "Primary Dialogue",
      messages: [
        {
          id: 'msg_greet',
          sender: 'assistant',
          text: "📡 CONNECTION ESTABLISHED. Welcome to AI Universe. I am Cosmos 1.0, your flagship server-side virtual companion. Query me below on any subject.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ],
      lastUpdated: new Date().toISOString()
    }];
  });

  const [activeSessionId, setActiveSessionId] = useState<string | null>(() => {
    try {
      const stored = localStorage.getItem('aiu_active_session_id');
      if (stored) return stored;
    } catch (e) {}
    return 'sess_primary';
  });

  const [savedNotes, setSavedNotes] = useState<SavedNote[]>(() => {
    try {
      const stored = localStorage.getItem('aiu_saved_notes');
      return stored ? JSON.parse(stored) : [];
    } catch (e) { return []; }
  });

  const [savedCodes, setSavedCodes] = useState<GeneratedCode[]>(() => {
    try {
      const stored = localStorage.getItem('aiu_saved_codes');
      return stored ? JSON.parse(stored) : [];
    } catch (e) { return []; }
  });

  const [savedContents, setSavedContents] = useState<SavedContent[]>(() => {
    try {
      const stored = localStorage.getItem('aiu_saved_contents');
      return stored ? JSON.parse(stored) : [];
    } catch (e) { return []; }
  });

  const [savedImages, setSavedImages] = useState<GeneratedImage[]>(() => {
    try {
      const stored = localStorage.getItem('aiu_saved_images');
      return stored ? JSON.parse(stored) : [];
    } catch (e) { return []; }
  });

  const [savedVideos, setSavedVideos] = useState<GeneratedVideo[]>(() => {
    try {
      const stored = localStorage.getItem('aiu_saved_videos');
      return stored ? JSON.parse(stored) : [];
    } catch (e) { return []; }
  });

  const [stats, setStats] = useState<UsageStats>(() => {
    try {
      const stored = localStorage.getItem('aiu_stats');
      return stored ? JSON.parse(stored) : {
        chatsCount: 0,
        tokensEstimated: 0,
        imagesCreated: 0,
        videosCreated: 0,
        documentsExplained: 0,
        voiceDialogsCount: 0
      };
    } catch (e) {
      return {
        chatsCount: 0,
        tokensEstimated: 0,
        imagesCreated: 0,
        videosCreated: 0,
        documentsExplained: 0,
        voiceDialogsCount: 0
      };
    }
  });

  // Log booting sequence once on mount
  useEffect(() => {
    addLog("System bios booted synchronously.");
  }, [addLog]);

  // Auth subscriber to monitor state transitions
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      setIsAuthLoading(false);
      if (user) {
        setIsGuest(false);
        localStorage.setItem('aiu_guest_explorer', 'false');
        addLog(`Uplink activated for astronaut: ${user.email}`);

        // Ensure user profile metadata stats are synchronized
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const uDoc = await getDoc(userDocRef);
          if (!uDoc.exists()) {
            const initialUser = {
              uid: user.uid,
              email: user.email || '',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              stats: {
                chatsCount: 0,
                tokensEstimated: 0,
                imagesCreated: 0,
                videosCreated: 0,
                documentsExplained: 0,
                voiceDialogsCount: 0
              }
            };
            await setDoc(userDocRef, initialUser);
            setStats(initialUser.stats);
          } else {
            const cloudStats = uDoc.data()?.stats;
            if (cloudStats) {
              setStats(cloudStats);
            }
          }
        } catch (err) {
          addLog(`Could not sync stats profile in cloud: ${err instanceof Error ? err.message : String(err)}`);
        }
      } else {
        addLog("No active cloud session found.");
      }
    });

    return () => unsubscribe();
  }, [addLog]);

  // Real-time Firestore document synchronizations
  useEffect(() => {
    if (!currentUser) return;

    const uid = currentUser.uid;
    const unsubscribers: (() => void)[] = [];

    // 1. Sessions listener
    try {
      const q = query(collection(db, 'sessions'), where('userId', '==', uid));
      const unsub = onSnapshot(q, (snapshot) => {
        const loaded: ChatSession[] = [];
        snapshot.forEach((d) => {
          loaded.push(d.data() as ChatSession);
        });
        if (loaded.length > 0) {
          loaded.sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());
          setSessions(loaded);
          const hasActive = loaded.some(s => s.id === activeSessionId);
          if (!hasActive) {
            setActiveSessionId(loaded[0].id);
          }
        }
      }, (error) => {
        handleFirestoreError(error, OperationType.GET, 'sessions');
      });
      unsubscribers.push(unsub);
    } catch (e) {}

    // 2. Saved notes listener
    try {
      const q = query(collection(db, 'savedNotes'), where('userId', '==', uid));
      const unsub = onSnapshot(q, (snapshot) => {
        const loaded: SavedNote[] = [];
        snapshot.forEach((d) => {
          loaded.push(d.data() as SavedNote);
        });
        setSavedNotes(loaded);
      }, (error) => {
        handleFirestoreError(error, OperationType.GET, 'savedNotes');
      });
      unsubscribers.push(unsub);
    } catch (e) {}

    // 3. Saved codes listener
    try {
      const q = query(collection(db, 'savedCodes'), where('userId', '==', uid));
      const unsub = onSnapshot(q, (snapshot) => {
        const loaded: GeneratedCode[] = [];
        snapshot.forEach((d) => {
          loaded.push(d.data() as GeneratedCode);
        });
        setSavedCodes(loaded);
      }, (error) => {
        handleFirestoreError(error, OperationType.GET, 'savedCodes');
      });
      unsubscribers.push(unsub);
    } catch (e) {}

    // 4. Saved contents listener
    try {
      const q = query(collection(db, 'savedContents'), where('userId', '==', uid));
      const unsub = onSnapshot(q, (snapshot) => {
        const loaded: SavedContent[] = [];
        snapshot.forEach((d) => {
          loaded.push(d.data() as SavedContent);
        });
        setSavedContents(loaded);
      }, (error) => {
        handleFirestoreError(error, OperationType.GET, 'savedContents');
      });
      unsubscribers.push(unsub);
    } catch (e) {}

    // 5. Saved images listener
    try {
      const q = query(collection(db, 'savedImages'), where('userId', '==', uid));
      const unsub = onSnapshot(q, (snapshot) => {
        const loaded: GeneratedImage[] = [];
        snapshot.forEach((d) => {
          loaded.push(d.data() as GeneratedImage);
        });
        setSavedImages(loaded);
      }, (error) => {
        handleFirestoreError(error, OperationType.GET, 'savedImages');
      });
      unsubscribers.push(unsub);
    } catch (e) {}

    // 6. Saved videos listener
    try {
      const q = query(collection(db, 'savedVideos'), where('userId', '==', uid));
      const unsub = onSnapshot(q, (snapshot) => {
        const loaded: GeneratedVideo[] = [];
        snapshot.forEach((d) => {
          loaded.push(d.data() as GeneratedVideo);
        });
        setSavedVideos(loaded);
      }, (error) => {
        handleFirestoreError(error, OperationType.GET, 'savedVideos');
      });
      unsubscribers.push(unsub);
    } catch (e) {}

    return () => {
      unsubscribers.forEach((fn) => fn());
    };
  }, [currentUser, activeSessionId]);

  // General persistent sync helper
  const syncToDisk = (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  const syncStatsToFirestore = useCallback(async (nextStats: UsageStats) => {
    if (auth.currentUser) {
      try {
        const userDocRef = doc(db, 'users', auth.currentUser.uid);
        await updateDoc(userDocRef, {
          stats: nextStats,
          updatedAt: new Date().toISOString()
        });
      } catch (err) {
        addLog(`Could not sync stats to cloud: ${err}`);
      }
    }
  }, [addLog]);

  const incrementStats = useCallback((statKey: keyof UsageStats) => {
    setStats((prev) => {
      const updated = { ...prev, [statKey]: prev[statKey] + 1 };
      localStorage.setItem('aiu_stats', JSON.stringify(updated));
      syncStatsToFirestore(updated);
      return updated;
    });
  }, [syncStatsToFirestore]);

  const syncSessionToCloud = useCallback(async (session: ChatSession) => {
    if (auth.currentUser) {
      try {
        await setDoc(doc(db, 'sessions', session.id), {
          id: session.id,
          userId: auth.currentUser.uid,
          title: session.title,
          lastUpdated: session.lastUpdated,
          messages: session.messages
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `sessions/${session.id}`);
      }
    }
  }, []);

  const deleteSessionFromCloud = useCallback(async (id: string) => {
    if (auth.currentUser) {
      try {
        await deleteDoc(doc(db, 'sessions', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `sessions/${id}`);
      }
    }
  }, []);

  /* ==========================================
     CHAT ACTIONS ROUTING CONTROLS
     ========================================== */
  const [chatLoading, setChatLoading] = useState(false);

  const handleSendMessage = async (text: string, attachment?: { name: string; type: string; dataUrl: string }) => {
    if (!text && !attachment) return;
    if (!activeSessionId) return;

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const userMsg: ChatMessage = {
      id: 'msg_' + Date.now(),
      sender: 'user',
      text: text,
      timestamp,
      attachment
    };

    const updatedSessions = sessions.map((sess) => {
      if (sess.id === activeSessionId) {
        return {
          ...sess,
          messages: [...sess.messages, userMsg],
          lastUpdated: new Date().toISOString()
        };
      }
      return sess;
    });

    setSessions(updatedSessions);
    syncToDisk('aiu_sessions', updatedSessions);
    incrementStats('chatsCount');
    setChatLoading(true);
    addLog(`Sent chat payload: "${text.substring(0, 18)}..."`);

    const activeSess = updatedSessions.find(s => s.id === activeSessionId);
    if (activeSess) {
      syncSessionToCloud(activeSess);
    }

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, attachment }),
      });
      const data = await res.json();

      if (res.ok) {
        const aiMsg: ChatMessage = {
          id: 'msg_ai_' + Date.now(),
          sender: 'assistant',
          text: data.text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        const finalizedSessions = updatedSessions.map((sess) => {
          if (sess.id === activeSessionId) {
            return {
              ...sess,
              messages: [...sess.messages, aiMsg],
              lastUpdated: new Date().toISOString()
            };
          }
          return sess;
        });

        setSessions(finalizedSessions);
        syncToDisk('aiu_sessions', finalizedSessions);
        incrementStats('tokensEstimated');
        addLog("Received Cosmos AI answer response block.");

        const finalSess = finalizedSessions.find(s => s.id === activeSessionId);
        if (finalSess) {
          syncSessionToCloud(finalSess);
        }
      } else {
        addLog(`Response error: ${data.error || "System misaligned."}`);
        
        const errMsg: ChatMessage = {
          id: 'msg_err_' + Date.now(),
          sender: 'system',
          text: `🚨 UPLINK INTERRUPTED: ${data.error || "General Server Unresponsiveness"}.\n\nCredentials configurations require standard cloud subscription parameters. Double-check your secrets guidelines in Profile settings.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        const fallbackSessions = updatedSessions.map((sess) => {
          if (sess.id === activeSessionId) {
            return {
              ...sess,
              messages: [...sess.messages, errMsg],
              lastUpdated: new Date().toISOString()
            };
          }
          return sess;
        });
        setSessions(fallbackSessions);
        syncToDisk('aiu_sessions', fallbackSessions);

        const fallbackSess = fallbackSessions.find(s => s.id === activeSessionId);
        if (fallbackSess) {
          syncSessionToCloud(fallbackSess);
        }
      }
    } catch (err: any) {
      addLog(`Telemetries fault: ${err.message}`);
    } finally {
      setChatLoading(false);
    }
  };

  const handleSelectSession = useCallback((id: string) => {
    setActiveSessionId(id);
    localStorage.setItem('aiu_active_session_id', id);
    addLog(`Swapped active dialogue channel to session ID: ${id}`);
  }, [addLog]);

  const handleCreateSession = useCallback((title: string) => {
    const nextSId = 'sess_' + Date.now();
    const newS: ChatSession = {
      id: nextSId,
      title: title,
      messages: [
        {
          id: 'msg_init_' + Date.now(),
          sender: 'assistant',
          text: `✦ Connected to session thread: ${title}. Dialogue mainframe is fully initialized.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ],
      lastUpdated: new Date().toISOString()
    };

    setSessions((prev) => {
      const updated = [...prev, newS];
      localStorage.setItem('aiu_sessions', JSON.stringify(updated));
      return updated;
    });
    setActiveSessionId(nextSId);
    localStorage.setItem('aiu_active_session_id', nextSId);
    addLog(`Assembled and registered new session dialogue thread: "${title}"`);
    syncSessionToCloud(newS);
  }, [addLog, syncSessionToCloud]);

  const handleDeleteSession = useCallback((id: string) => {
    setSessions((prev) => {
      const updated = prev.filter(s => s.id !== id);
      localStorage.setItem('aiu_sessions', JSON.stringify(updated));
      
      if (activeSessionId === id && updated.length > 0) {
        const fallbackId = updated[0].id;
        setActiveSessionId(fallbackId);
        localStorage.setItem('aiu_active_session_id', fallbackId);
      }
      return updated;
    });
    addLog(`Erased dialogue logging session thread ID: ${id}`);
    deleteSessionFromCloud(id);
  }, [activeSessionId, addLog, deleteSessionFromCloud]);

  const handleClearAllSessions = useCallback(async () => {
    // Collect IDs to delete
    const sessionIds = sessions.map(s => s.id);
    setSessions([]);
    setActiveSessionId(null);
    localStorage.removeItem('aiu_sessions');
    localStorage.removeItem('aiu_active_session_id');
    addLog("Nuked all dynamic dialogue thread archives.");

    if (auth.currentUser) {
      for (const sId of sessionIds) {
        try {
          await deleteDoc(doc(db, 'sessions', sId));
        } catch (e) {}
      }
    }
  }, [sessions, addLog]);

  const handleSaveNote = useCallback(async (note: SavedNote) => {
    setSavedNotes((prev) => {
      const next = [note, ...prev];
      localStorage.setItem('aiu_saved_notes', JSON.stringify(next));
      return next;
    });
    playSaveSuccess();

    if (auth.currentUser) {
      try {
        const payload = { ...note, userId: auth.currentUser.uid };
        await setDoc(doc(db, 'savedNotes', note.id), payload);
        addLog(`Saved note "${note.title}" to firestore cloud.`);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `savedNotes/${note.id}`);
      }
    }
  }, [addLog]);

  const handleSaveCode = useCallback(async (code: GeneratedCode) => {
    setSavedCodes((prev) => {
      const next = [code, ...prev];
      localStorage.setItem('aiu_saved_codes', JSON.stringify(next));
      return next;
    });
    playSaveSuccess();

    if (auth.currentUser) {
      try {
        const payload = { ...code, userId: auth.currentUser.uid };
        await setDoc(doc(db, 'savedCodes', code.id), payload);
        addLog(`Saved code block "${code.title}" to firestore cloud.`);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `savedCodes/${code.id}`);
      }
    }
  }, [addLog]);

  const handleSaveContent = useCallback(async (content: SavedContent) => {
    setSavedContents((prev) => {
      const next = [content, ...prev];
      localStorage.setItem('aiu_saved_contents', JSON.stringify(next));
      return next;
    });
    playSaveSuccess();

    if (auth.currentUser) {
      try {
        const payload = { ...content, userId: auth.currentUser.uid };
        await setDoc(doc(db, 'savedContents', content.id), payload);
        addLog(`Saved marketing copywriting "${content.title}" to cloud.`);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `savedContents/${content.id}`);
      }
    }
  }, [addLog]);

  const handleSaveImage = useCallback(async (img: GeneratedImage) => {
    setSavedImages((prev) => {
      const next = [img, ...prev];
      localStorage.setItem('aiu_saved_images', JSON.stringify(next));
      return next;
    });
    playSaveSuccess();

    if (auth.currentUser) {
      try {
        const payload = { ...img, userId: auth.currentUser.uid };
        await setDoc(doc(db, 'savedImages', img.id), payload);
        addLog("Saved art creation to cloud.");
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `savedImages/${img.id}`);
      }
    }
  }, [addLog]);

  const handleSaveVideo = useCallback(async (vid: GeneratedVideo) => {
    setSavedVideos((prev) => {
      const next = [vid, ...prev];
      localStorage.setItem('aiu_saved_videos', JSON.stringify(next));
      return next;
    });
    playSaveSuccess();

    if (auth.currentUser) {
      try {
        const payload = {
          id: vid.id,
          userId: auth.currentUser.uid,
          prompt: vid.prompt,
          status: vid.status,
          timestamp: vid.timestamp,
          url: vid.url || ''
        };
        await setDoc(doc(db, 'savedVideos', vid.id), payload);
        addLog("Saved video segment metadata to database.");
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `savedVideos/${vid.id}`);
      }
    }
  }, [addLog]);

  const handleResetStats = useCallback(() => {
    const zeroed = {
      chatsCount: 0,
      tokensEstimated: 0,
      imagesCreated: 0,
      videosCreated: 0,
      documentsExplained: 0,
      voiceDialogsCount: 0
    };
    setStats(zeroed);
    localStorage.setItem('aiu_stats', JSON.stringify(zeroed));
    addLog("Reset all diagnostic operational metrics.");
  }, [addLog]);

  const handlePurgeAllLocalStorage = useCallback(() => {
    localStorage.clear();
    setSessions([]);
    setActiveSessionId(null);
    setSavedNotes([]);
    setSavedCodes([]);
    setSavedContents([]);
    setSavedImages([]);
    setSavedVideos([]);
    handleResetStats();
    setLogs([]);
    addLog("Completely cleared client local storage frameworks.");
    window.location.reload();
  }, [handleResetStats, addLog]);

  const onClearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  /* ==========================================
     MEMOIZED ACTIVE SCREEN ACTIVE ROUTING
     ========================================== */
  const activeScreen = useMemo(() => {
    switch (activeTab) {
      case 'home':
        return <HomeScreen setActiveTab={setActiveTab} setOpenedToolId={setOpenedToolId} stats={stats} />;
      case 'tools':
        return (
          <ToolsScreen 
            openedToolId={openedToolId} 
            setOpenedToolId={setOpenedToolId} 
            onSaveNote={handleSaveNote}
            onSaveCode={handleSaveCode}
            onSaveContent={handleSaveContent}
            incrementStats={incrementStats}
            onAddLog={addLog}
          />
        );
      case 'create':
        return <CreateScreen onSaveImage={handleSaveImage} onSaveVideo={handleSaveVideo} incrementStats={incrementStats} onAddLog={addLog} />;
      case 'chat':
        return (
          <ChatScreen 
            sessions={sessions}
            activeSessionId={activeSessionId}
            onSelectSession={handleSelectSession}
            onCreateSession={handleCreateSession}
            onDeleteSession={handleDeleteSession}
            onSendMessage={handleSendMessage}
            loading={chatLoading}
            onClearAllSessions={handleClearAllSessions}
          />
        );
      case 'profile':
        return (
          <ProfileScreen 
            stats={stats} 
            onResetStats={handleResetStats} 
            logs={logs} 
            onClearLogs={onClearLogs} 
            onPurgeAllLocalStorage={handlePurgeAllLocalStorage} 
            currentUser={currentUser}
            theme={theme}
            onToggleTheme={toggleTheme}
            onLogout={async () => {
              try {
                await logoutUser();
                addLog("Securely terminated Google cosmic uplink sessions.");
              } catch (e) {
                addLog("Failed to logout securely.");
              }
            }}
            onTriggerLogin={async () => {
              try {
                const user = await signInWithGoogle();
                if (user) {
                  addLog(`Google cloud handshake verified successfully: ${user.email}`);
                }
              } catch (e: any) {
                addLog(`Handshake aborted: ${e.message || String(e)}`);
              }
            }}
          />
        );
      default:
        return <HomeScreen setActiveTab={setActiveTab} setOpenedToolId={setOpenedToolId} stats={stats} />;
    }
  }, [activeTab, openedToolId, stats, sessions, activeSessionId, chatLoading, logs, handleSaveNote, handleSaveCode, handleSaveContent, incrementStats, addLog, handleSaveImage, handleSaveVideo, handleSelectSession, handleCreateSession, handleDeleteSession, handleSendMessage, handleClearAllSessions, handleResetStats, onClearLogs, handlePurgeAllLocalStorage, currentUser, theme, toggleTheme]);

  if (!showSplash && isAuthLoading) {
    return (
      <div className="h-screen w-screen bg-[#060012] flex items-center justify-center font-sans">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 rounded-full border-2 border-cyan-400 border-t-transparent border-r-transparent animate-spin" />
          <p className="text-xs font-mono uppercase tracking-widest text-cyan-400 animate-pulse">Establishing Cosmic Uplink...</p>
        </div>
      </div>
    );
  }

  if (!showSplash && !currentUser && !isGuest) {
    return (
      <AuthScreen 
        onSuccess={(user) => { 
          setCurrentUser(user); 
          setIsGuest(false);
          localStorage.setItem('aiu_guest_explorer', 'false');
        }} 
        onContinueAsGuest={() => { 
          setIsGuest(true); 
          localStorage.setItem('aiu_guest_explorer', 'true');
          addLog("Offline local storage telemetry session initiated.");
        }} 
      />
    );
  }

  return (
    <div className={`h-screen w-screen select-none overflow-hidden relative flex flex-col font-sans transition-colors duration-300 ${
      theme === 'light' ? 'light-theme bg-[#f8fafc] text-slate-800' : 'dark-theme bg-[#060012] text-white'
    }`}>
      {showSplash ? (
        <Splash onComplete={() => setShowSplash(false)} />
      ) : (
        <>
          <CosmicBackground />

          {/* Universal high-end floating theme toggle */}
          <button
            id="theme-glo-toggle-btn"
            onClick={toggleTheme}
            className={`fixed top-4 right-4 z-[999] h-9 w-9 rounded-full flex items-center justify-center transition-all duration-300 border cursor-pointer active:scale-95 shadow-md ${
              theme === 'light' 
                ? 'bg-white/95 border-slate-200 text-indigo-600 hover:bg-slate-50 shadow-slate-200/40' 
                : 'bg-slate-900/90 border-purple-500/20 text-yellow-400 hover:bg-slate-800'
            }`}
            title="Toggle Visual Theme Settings"
          >
            {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </button>

          <main className="flex-1 min-h-0 relative z-10 flex flex-col">
            {activeScreen}
          </main>

          <nav className="fixed bottom-0 left-0 right-0 h-16 bg-[#080218] border-t border-purple-500/10 z-40 select-none max-w-lg mx-auto rounded-t-xl flex items-center justify-around px-2 shadow-[0_-8px_30px_rgba(13,8,30,0.8)]">
            {[
              { id: 'home', label: 'Home', icon: Home },
              { id: 'tools', label: 'AI Tools', icon: Compass },
              { id: 'create', label: 'Create', icon: Sparkles },
              { id: 'chat', label: 'Chat', icon: MessageSquare },
              { id: 'profile', label: 'Profile', icon: User },
            ].map((tab) => {
              const TabIcon = tab.icon;
              const isSelected = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  id={`nav-btn-${tab.id}`}
                  onClick={() => {
                    playNavClick();
                    setActiveTab(tab.id);
                    if (tab.id !== 'tools') setOpenedToolId(null);
                  }}
                  className="flex flex-col items-center justify-center w-12.5 h-12.5 rounded-xl text-center group relative cursor-pointer active:scale-90 transition-all"
                >
                  {isSelected && (
                    <span 
                      className="absolute -top-1 h-[3px] w-6 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 shadow-[0_0_8px_rgba(34,211,238,0.8)] transition-all duration-300 active-nav-glow" 
                      style={{ willChange: 'opacity, transform' }}
                    />
                  )}
                  
                  <div className={`transition-all duration-250 ${
                    isSelected 
                      ? 'text-cyan-400 font-black scale-110 drop-shadow-[0_0_6px_rgba(34,211,238,0.45)]' 
                      : 'text-slate-500 group-hover:text-slate-300'
                  }`}>
                    <TabIcon className="h-5 w-5" />
                  </div>
                  
                  <span className={`text-[8.5px] font-mono uppercase tracking-widest mt-1 transition-colors ${
                    isSelected ? 'text-cyan-400 font-bold' : 'text-slate-500'
                  }`}>
                    {tab.label}
                  </span>
                </button>
              )
            })}
          </nav>
        </>
      )}
    </div>
  );
}
