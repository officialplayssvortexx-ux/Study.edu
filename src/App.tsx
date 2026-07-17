import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { BookOpen, Clock, Calendar, LogOut, Disc, Compass, Award, Trophy, Timer, GraduationCap, X, ChevronRight, User, History, MessageSquare, Flame, Trash2 } from "lucide-react";
import { Playlist, BackgroundPreset, UserProfile, Message } from "./types";
import { BACKGROUND_PRESETS } from "./constants";
import BackgroundEffect from "./components/BackgroundEffect";
import SetupPortal from "./components/SetupPortal";
import AITutorPanel from "./components/AITutorPanel";
import SpotifyController from "./components/SpotifyController";
import SuggestionModal from "./components/SuggestionModal";
import PaletteControls from "./components/PaletteControls";

const LOGO_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M25,55 L25,65 C25,78 75,78 75,65 L75,55" fill="%231e293b"/><path d="M25,55 C25,67 75,67 75,55 Z" fill="%230f172a"/><path d="M50,25 L92,42 L50,59 L8,42 Z" fill="%231e293b"/><path d="M8,42 L8,45 L50,62 L92,45 L92,42 L50,59 Z" fill="%230f172a"/><ellipse cx="50" cy="42" rx="3.5" ry="2" fill="%230f172a"/><path d="M50,42 L80,51 L80,74" fill="none" stroke="%23f59e0b" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/><ellipse cx="80" cy="74" rx="4" ry="7" fill="%23d97706"/></svg>`;

export default function App() {
  // 1. Splash Screen State
  const [showSplash, setShowSplash] = useState(true);

  // 2. Core Setup State
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const [studyTopic, setStudyTopic] = useState("");
  const [isHomework, setIsHomework] = useState(false);
  const [selectedPlaylists, setSelectedPlaylists] = useState<Playlist[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // 3. Customizations & Visual State
  const [currentPreset, setCurrentPreset] = useState<BackgroundPreset>(BACKGROUND_PRESETS[0]);
  const [customBackgroundUrl, setCustomBackgroundUrl] = useState<string | null>(null);

  // 3b. Typography & Adaptive States
  const [selectedFont, setSelectedFont] = useState(() => {
    return localStorage.getItem("aura_selected_font") || "Plus Jakarta Sans";
  });
  const [activeSessionFlashcards, setActiveSessionFlashcards] = useState<any[]>([]);
  const [activeSessionTestScores, setActiveSessionTestScores] = useState<any[]>([]);

  useEffect(() => {
    localStorage.setItem("aura_selected_font", selectedFont);
    document.documentElement.style.setProperty("--font-sans", `"${selectedFont}", ui-sans-serif, system-ui, sans-serif`);
  }, [selectedFont]);

  // 4. Time State (ticks every second)
  const [time, setTime] = useState(new Date());

  // 5. Active Study Timer State
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(true);

  // 6. UI Navigation & Session Hub states
  const [isSessionHubOpen, setIsSessionHubOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [activeRiverTrack, setActiveRiverTrack] = useState<string | null>(null);

  // 7. Session Analytics & Logs
  const [aiCount, setAiCount] = useState(0);
  const [chatLog, setChatLog] = useState<Message[]>([]);
  const [sessionsHistory, setSessionsHistory] = useState<any[]>(() => {
    const cached = localStorage.getItem("aura_sessions_history");
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) {
          return parsed.map((sess, idx) => ({
            ...sess,
            id: sess.id || `session-legacy-${idx}-${Date.now()}`
          }));
        }
        return [];
      } catch {
        return [];
      }
    }
    return [];
  });

  const userEmail = "officialplayssvortexx@gmail.com";

  // Splash screen timing
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2200);
    return () => clearTimeout(timer);
  }, []);

  // Check LocalStorage for cached states
  useEffect(() => {
    const cachedSetup = localStorage.getItem("aura_study_setup");
    const cachedBackground = localStorage.getItem("aura_study_bg_preset");
    const cachedCustomBg = localStorage.getItem("aura_study_custom_bg");

    if (cachedSetup) {
      try {
        const parsed = JSON.parse(cachedSetup);
        setStudyTopic(parsed.studyTopic);
        setIsHomework(parsed.isHomework);
        setSelectedPlaylists(parsed.selectedPlaylists);
        setUserProfile({
          ...parsed.userProfile,
          picture: LOGO_SVG, // Ensure picture is always our graduation cap logo!
        });
        setIsSetupComplete(true);
      } catch (e) {
        console.error("Failed to parse cached session:", e);
      }
    }

    if (cachedCustomBg) {
      setCustomBackgroundUrl(cachedCustomBg);
    }

    if (cachedBackground) {
      try {
        setCurrentPreset(JSON.parse(cachedBackground));
      } catch (e) {
        setCurrentPreset(BACKGROUND_PRESETS[0]);
      }
    } else {
      setCurrentPreset(BACKGROUND_PRESETS[0]);
    }
  }, []);

  // Clock tick timer
  useEffect(() => {
    const clock = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(clock);
  }, []);

  // Study timer counting
  useEffect(() => {
    if (!isSetupComplete || !isTimerActive) return;
    const tracker = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(tracker);
  }, [isSetupComplete, isTimerActive]);

  const handleSetupComplete = (data: {
    studyTopic: string;
    isHomework: boolean;
    selectedPlaylists: Playlist[];
    userProfile: { name: string; email: string; picture: string };
    randomFactsEnabled?: boolean;
  }) => {
    setStudyTopic(data.studyTopic);
    setIsHomework(data.isHomework);
    setSelectedPlaylists(data.selectedPlaylists);
    setUserProfile({
      ...data.userProfile,
      picture: LOGO_SVG, // Ensure Google Account Profile Picture is the transparent graduation cap logo!
    });
    setIsSetupComplete(true);
    setSecondsElapsed(0);
    setIsTimerActive(true);
    setAiCount(0);
    setChatLog([]); // Reset AI conversation log so AI does not remember previous sessions!
    setActiveSessionFlashcards([]);
    setActiveSessionTestScores([]);

    localStorage.setItem("aura_study_setup", JSON.stringify({
      ...data,
      userProfile: { ...data.userProfile, picture: LOGO_SVG },
    }));
  };

  const handleSelectPreset = (preset: BackgroundPreset) => {
    setCurrentPreset(preset);
    localStorage.setItem("aura_study_bg_preset", JSON.stringify(preset));
  };

  const handleUploadCustomBackground = (dataUrl: string | null) => {
    setCustomBackgroundUrl(dataUrl);
    if (dataUrl) {
      localStorage.setItem("aura_study_custom_bg", dataUrl);
    } else {
      localStorage.removeItem("aura_study_custom_bg");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("aura_study_setup");
    setIsSetupComplete(false);
    setUserProfile(null);
    setSecondsElapsed(0);
    setIsSessionHubOpen(false);

    // Reset background to default on logout!
    setCurrentPreset(BACKGROUND_PRESETS[0]);
    setCustomBackgroundUrl(null);
    localStorage.removeItem("aura_study_bg_preset");
    localStorage.removeItem("aura_study_custom_bg");
  };

  // Format Elapsed Time
  const formatTimer = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs > 0 ? `${hrs}:` : ""}${mins < 10 && hrs > 0 ? "0" : ""}${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // Dynamic greetings matching local hours
  const getGreeting = () => {
    const hrs = time.getHours();
    if (hrs < 12) return "good morning";
    if (hrs < 17) return "good afternoon";
    if (hrs < 22) return "good evening";
    return "good night";
  };

  const getTimezoneString = () => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || "Local Time";
    } catch {
      return "Local Time";
    }
  };

  // End Session summary generator
  const handleEndSession = () => {
    setIsTimerActive(false);
    setIsSessionHubOpen(false);
    setIsSummaryOpen(true);
  };

  // Finalize Session, Redirect to main menu, and Save past logs
  const handleConfirmCloseSummary = () => {
    const newSession = {
      id: `session-${Date.now()}`,
      date: new Date().toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" }),
      duration: formatTimer(secondsElapsed),
      topic: studyTopic,
      aiCount,
      mode: isHomework ? "Homework" : "Study",
      transcript: chatLog,
      flashcards: activeSessionFlashcards,
      testScores: activeSessionTestScores,
    };

    const updatedHistory = [newSession, ...sessionsHistory];
    setSessionsHistory(updatedHistory);
    localStorage.setItem("aura_sessions_history", JSON.stringify(updatedHistory));

    // Clear active session flags & send back to main setup menu!
    setIsSummaryOpen(false);
    setSecondsElapsed(0);
    setIsTimerActive(true);
    setAiCount(0);
    setChatLog([]);
    setActiveSessionFlashcards([]);
    setActiveSessionTestScores([]);
    setIsSetupComplete(false);
    localStorage.removeItem("aura_study_setup"); // Reset setup states so user goes to Setup menu

    // Reset background to default on session close!
    setCurrentPreset(BACKGROUND_PRESETS[0]);
    setCustomBackgroundUrl(null);
    localStorage.removeItem("aura_study_bg_preset");
    localStorage.removeItem("aura_study_custom_bg");
  };

  const handleDeleteSession = (sessionId: string) => {
    setSessionsHistory((prev) => {
      const updated = prev.filter((sess) => sess.id !== sessionId);
      localStorage.setItem("aura_sessions_history", JSON.stringify(updated));
      return updated;
    });
  };

  const handleSaveChatMessage = (msg: Message) => {
    setChatLog((prev) => [...prev, msg]);
  };

  // List of cozy, relaxing, and motivational quotes
  const cozyQuotes = [
    { text: "It is during our darkest moments that we must focus to see the light.", author: "Aristotle" },
    { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
    { text: "With the new day comes new strength and new thoughts.", author: "Eleanor Roosevelt" },
    { text: "You don't have to see the whole staircase, just take the first step.", author: "Martin Luther King Jr." },
    { text: "Quiet minds cannot be perplexed or frightened, but go on in fortune or misfortune at their own private pace, like a clock during a thunderstorm.", author: "Robert Louis Stevenson" },
    { text: "Sometimes, the most productive thing you can do is relax.", author: "Mark Black" }
  ];

  const currentQuote = cozyQuotes[Math.floor((secondsElapsed + time.getDate()) % cozyQuotes.length)];

  return (
    <div className="relative min-h-screen font-sans text-slate-800 overflow-x-hidden select-none selection:bg-orange-500/20 selection:text-orange-800">
      
      {/* 1. BACKGROUND UNDERLAY */}
      <BackgroundEffect preset={currentPreset} customBackgroundUrl={customBackgroundUrl} />

      <AnimatePresence mode="wait">
        {/* A. SPLASH SCREEN (Portal Entry) */}
        {showSplash ? (
          <motion.div
            key="splash-screen"
            id="splash-screen-root"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="fixed inset-0 w-full h-full bg-[#fcfbfa] flex flex-col items-center justify-center z-50 p-6 font-sans"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="text-center space-y-5"
            >
              <div className="relative w-20 h-20 mx-auto">
                <div className="absolute inset-0 bg-blue-600 rounded-full blur-2xl opacity-10 animate-pulse" />
                <img
                  src={LOGO_SVG}
                  alt="Aluminum Education Logo"
                  className="w-20 h-20 object-contain mx-auto relative z-10"
                />
              </div>

              <div className="space-y-1.5">
                <h1 className="text-2xl font-black tracking-wider text-slate-800 font-sans">
                  ALUMINUM EDUCATION
                </h1>
                <p className="text-orange-600 text-[9px] uppercase tracking-widest font-bold">
                  Challenges you, not gives you the answer
                </p>
              </div>

              <div className="w-32 h-[1.5px] bg-slate-200 mx-auto rounded-full overflow-hidden relative">
                <div className="absolute left-0 top-0 h-full bg-blue-600 w-1/3 rounded-full animate-[loading-bar_1.8s_infinite_linear]" />
              </div>
            </motion.div>
          </motion.div>
        ) : !isSetupComplete ? (
          /* B. SETUP PORTAL */
          <motion.div
            key="setup-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative z-10"
          >
            <SetupPortal
              onComplete={handleSetupComplete}
              userEmail={userEmail}
              sessionsHistory={sessionsHistory}
              onDeleteSession={handleDeleteSession}
            />
          </motion.div>
        ) : (
          /* C. MAIN COZY STUDY BOARD */
          <motion.div
            key="dashboard-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="relative z-10 min-h-screen flex flex-col justify-between p-6 md:p-8"
          >
            {/* Minimal Top Header Row */}
            <header className="flex items-center justify-between w-full max-w-7xl mx-auto z-10">
              {/* Left Side Brand Info */}
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-blue-700 bg-white/90 border border-white/95 shadow-sm">
                  {isHomework ? <BookOpen className="w-4.5 h-4.5" /> : <GraduationCap className="w-4.5 h-4.5" />}
                </div>
                <div>
                  <h1 className={`text-sm font-bold font-sans tracking-wider ${currentPreset.isDark ? "text-white/90" : "text-slate-800/90"} uppercase`}>
                    Aluminum Space
                  </h1>
                  <p className={`text-[10px] font-mono mt-0.5 ${currentPreset.isDark ? "text-white/60" : "text-slate-500"}`}>
                    Focus: <span className="font-semibold">{studyTopic}</span>
                  </p>
                </div>
              </div>

              {/* Right Side: Google Profile Icon */}
              {userProfile && (
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsProfileModalOpen(true)}
                    className="relative group transition-all duration-300 hover:scale-[1.08] active:scale-95 focus:outline-none"
                    title="View Profile and History"
                  >
                    <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <img
                      src={userProfile.picture}
                      alt={userProfile.name}
                      referrerPolicy="no-referrer"
                      className="relative w-10 h-10 rounded-full border-2 border-white/90 shadow-xl object-cover bg-slate-50 transition-all duration-300 ring-2 ring-transparent group-hover:ring-blue-500/50 group-hover:ring-offset-1"
                    />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-orange-600 rounded-full border border-white flex items-center justify-center shadow-md transition-transform duration-300 group-hover:scale-110">
                      <Trophy className="w-2.5 h-2.5 text-white" />
                    </div>
                  </button>
                </div>
              )}
            </header>

            {/* Middle of the Screen: Elegant Digital Clock & Daily Greetings */}
            <main className="flex-1 flex flex-col items-center justify-center text-center my-auto py-10">
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="space-y-3 max-w-lg mx-auto"
              >
                {/* Greeting */}
                <p className={`font-serif italic text-2xl md:text-3xl tracking-wide ${currentPreset.isDark ? "text-white/80 drop-shadow-sm" : "text-slate-800/80"}`}>
                  {getGreeting().toLowerCase()}, {userProfile?.name.toLowerCase()}
                </p>

                {/* Digital Clock */}
                <h1 className={`text-6xl sm:text-8xl md:text-9xl font-bold tracking-tighter ${currentPreset.isDark ? "text-white drop-shadow-lg" : "text-slate-900 drop-shadow-sm"}`}>
                  {time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false })}
                </h1>

                {/* Subtitle / Topic details */}
                <div className="flex items-center justify-center gap-3 mt-4 text-xs tracking-wider opacity-90">
                  <span className={`font-bold ${currentPreset.isDark ? "text-orange-400" : "text-orange-700"}`}>
                    {time.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })}
                  </span>
                  <span className={currentPreset.isDark ? "text-white/40" : "text-slate-400"}>•</span>
                  <span className={`font-mono text-[11px] ${currentPreset.isDark ? "text-white/70" : "text-slate-500"}`}>
                    {getTimezoneString()}
                  </span>
                </div>
              </motion.div>
            </main>

            {/* Cozy Minimized Floating Dock at the Bottom */}
            <footer className="w-full max-w-2xl mx-auto z-10 flex flex-col items-center gap-4">
              {/* Dock Container */}
              <div className="bg-white/90 backdrop-blur-xl border border-slate-100 shadow-2xl px-6 py-3 rounded-full flex items-center justify-between gap-6 w-full max-w-xl">
                
                {/* 1. Active River Sound Status Indicator */}
                <button
                  type="button"
                  onClick={() => setIsSessionHubOpen(true)}
                  className="flex items-center gap-2.5 text-left text-slate-700 hover:text-blue-600 transition-colors cursor-pointer max-w-[160px] md:max-w-[200px]"
                >
                  <div className="w-7 h-7 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center flex-shrink-0 animate-pulse">
                    <Disc className="w-4 h-4 animate-[spin_6s_linear_infinite]" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">River Stream</div>
                    <div className="text-[10px] font-semibold truncate text-slate-700">
                      {activeRiverTrack ? `Playing: ${activeRiverTrack}` : "Soundchamber Quiet"}
                    </div>
                  </div>
                </button>

                {/* Spotify vibe controls nested inside dock */}
                <div className="border-l border-slate-100 pl-4">
                  <SpotifyController
                    initialPlaylists={selectedPlaylists}
                    onTrackChange={(trackName) => setActiveRiverTrack(trackName)}
                  />
                </div>

                {/* 2. Minimized AI Hub & Session trigger */}
                <div className="flex items-center gap-2 pl-4 border-l border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsSessionHubOpen(true)}
                    className="flex items-center justify-center w-8 h-8 bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-md transition-all hover:scale-105 cursor-pointer relative group"
                    title="Open AI Tutor"
                  >
                    <GraduationCap className="w-4.5 h-4.5" />
                    <span className="absolute -top-10 bg-slate-800 text-white text-[9px] py-1 px-2 rounded-md opacity-0 group-hover:opacity-100 transition-opacity font-bold pointer-events-none">
                      Tutor
                    </span>
                  </button>

                  {/* End Session Button */}
                  <button
                    type="button"
                    onClick={handleEndSession}
                    className="px-3.5 py-1.5 bg-orange-600 hover:bg-orange-500 text-white rounded-full text-[11px] font-bold transition-all hover:scale-[1.02] cursor-pointer"
                  >
                    End Session
                  </button>
                </div>
              </div>

              {/* Lower footer controls */}
              <div className="flex items-center justify-between w-full text-[9px] text-slate-400 font-bold tracking-wider px-4">
                <SuggestionModal userEmail={userProfile?.email || ""} />
                <div className="uppercase">artificial intelligence challenges you not gives you the answer</div>
                <div>
                  <PaletteControls
                    currentPreset={currentPreset}
                    onSelectPreset={handleSelectPreset}
                    customBackgroundUrl={customBackgroundUrl}
                    onUploadCustomBackground={handleUploadCustomBackground}
                    selectedFont={selectedFont}
                    onChangeFont={setSelectedFont}
                  />
                </div>
              </div>
            </footer>

            {/* D. STUDY SESSION HUB OVERLAY (Slide up Panel) */}
            <AnimatePresence>
              {isSessionHubOpen && (
                <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-md z-40 flex items-end justify-center p-4">
                  {/* Dismiss Backdrop click */}
                  <div className="absolute inset-0 cursor-pointer" onClick={() => setIsSessionHubOpen(false)} />

                  <motion.div
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "100%" }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    className="relative bg-white/95 border border-slate-200/60 rounded-t-[2.5rem] p-6 shadow-2xl w-full max-w-4xl h-[85vh] flex flex-col justify-between text-slate-800 z-50 overflow-hidden"
                  >
                    {/* Drawer Header */}
                    <div className="flex items-center justify-between pb-4 border-b border-slate-100 flex-shrink-0">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                          <GraduationCap className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500">Aluminum Space Session Guidance</h3>
                          <p className="text-[10px] text-slate-400 mt-0.5">Focus topic: {studyTopic}</p>
                        </div>
                      </div>

                      {/* Header Active statistics and timer */}
                      <div className="flex items-center gap-4">
                        <div className="bg-blue-50 border border-blue-100 py-1.5 px-3.5 rounded-2xl flex items-center gap-2 text-xs font-mono font-bold text-blue-700">
                          <Timer className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
                          <span>Focus Time: {formatTimer(secondsElapsed)}</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => setIsSessionHubOpen(false)}
                          className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* AI Assistant panel workspace */}
                    <div className="flex-1 overflow-hidden my-4">
                      <AITutorPanel
                        studyTopic={studyTopic}
                        isHomework={isHomework}
                        userEmail={userProfile?.email || ""}
                        onIncrementAICount={() => setAiCount((prev) => prev + 1)}
                        onSaveChatMessage={handleSaveChatMessage}
                        onSaveFlashcards={(cards) => setActiveSessionFlashcards((prev) => [...prev, ...cards])}
                        onSaveTestScore={(score) => setActiveSessionTestScores((prev) => [...prev, score])}
                      />
                    </div>

                    {/* Tagline at bottom of AI panel */}
                    <div className="pt-2 flex-shrink-0 flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-100 font-bold uppercase tracking-wider">
                      <div>artificial intelligence challenges you not gives you the answer</div>
                      <button
                        type="button"
                        onClick={handleEndSession}
                        className="text-orange-600 hover:underline font-bold"
                      >
                        Wrap up & End Session
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            {/* E. USER PROFILE DETAILS & HISTORY MODAL */}
            <AnimatePresence>
              {isProfileModalOpen && (
                <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-lg z-50 flex items-center justify-center p-6">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white w-full max-w-xl rounded-[2rem] p-6 shadow-2xl border border-slate-100 flex flex-col h-[75vh]"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between pb-4 border-b border-slate-100 flex-shrink-0">
                      <div className="flex items-center gap-2">
                        <User className="w-5 h-5 text-blue-600" />
                        <h3 className="font-bold text-slate-800 text-lg">My Profile & Workspace Logs</h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsProfileModalOpen(false)}
                        className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto py-4 space-y-6">
                      
                      {/* 1. Identity summary and editable Nickname */}
                      {userProfile && (
                        <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4 flex items-center gap-4">
                          <img
                            src={userProfile.picture}
                            alt={userProfile.name}
                            referrerPolicy="no-referrer"
                            className="w-14 h-14 rounded-full border-2 border-white shadow-md object-cover bg-slate-50"
                          />
                          <div className="flex-1 min-w-0 space-y-1.5">
                            <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                              Preferred Nickname (Editable)
                            </label>
                            <input
                              type="text"
                              value={userProfile.name}
                              onChange={(e) => {
                                const updated = { ...userProfile, name: e.target.value };
                                setUserProfile(updated);
                                localStorage.setItem("aura_study_setup", JSON.stringify({
                                  studyTopic,
                                  isHomework,
                                  selectedPlaylists,
                                  userProfile: updated,
                                }));
                              }}
                              className="w-full max-w-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-800 focus:outline-none focus:border-blue-500 font-semibold"
                            />
                            <div className="text-[10px] text-slate-400 truncate">{userProfile.email}</div>
                          </div>
                        </div>
                      )}

                      {/* 2. Previous Completed Sessions History */}
                      <div className="space-y-3">
                        <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                          <History className="w-4 h-4 text-orange-600" /> Previous Sessions Log
                        </h4>

                        {sessionsHistory.length === 0 ? (
                          <div className="text-center py-6 bg-slate-50/30 rounded-xl border border-dashed border-slate-200 text-xs text-slate-400">
                            No completed study sessions logged yet. Tap "End Session" to record your milestones!
                          </div>
                        ) : (
                          <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                            {sessionsHistory.map((sess) => (
                              <div key={sess.id} className="bg-slate-50 border border-slate-100 p-3 rounded-xl flex items-center justify-between text-xs hover:bg-slate-50 transition-colors">
                                <div className="space-y-0.5 min-w-0 flex-1 mr-2 text-left">
                                  <div className="font-bold text-slate-800 truncate max-w-[200px]">{sess.topic}</div>
                                  <div className="text-[10px] text-slate-400">{sess.date} • {sess.mode}</div>
                                </div>
                                <div className="flex items-center gap-3 flex-shrink-0">
                                  <div className="text-right space-y-0.5">
                                    <div className="font-mono font-bold text-blue-700">{sess.duration}</div>
                                    <div className="text-[9px] text-slate-400">{sess.aiCount} AI assists</div>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (window.confirm("WARNING: Are you absolutely sure you want to permanently delete this study session? Once deleted, it will disappear immediately and all of its diagnostic test records, flashcards, and transcript files will be gone permanently. This action cannot be undone.")) {
                                        handleDeleteSession(sess.id);
                                      }
                                    }}
                                    className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                                    title="Delete Session Permanently"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* 3. Conversations chat log of current session */}
                      <div className="space-y-3">
                        <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                          <MessageSquare className="w-4 h-4 text-blue-600" /> Session AI Conversation Log
                        </h4>

                        {chatLog.length === 0 ? (
                          <div className="text-center py-6 bg-slate-50/30 rounded-xl border border-dashed border-slate-200 text-xs text-slate-400">
                            No conversation logs registered in this session. Ask the AI Tutor a question to populate!
                          </div>
                        ) : (
                          <div className="space-y-2 max-h-48 overflow-y-auto pr-1 border border-slate-100 rounded-xl p-2.5 bg-slate-50/20">
                            {chatLog.map((log, idx) => (
                              <div key={idx} className={`p-2.5 rounded-lg text-xs ${log.role === "user" ? "bg-orange-50 text-orange-950 ml-4 border border-orange-100" : "bg-slate-100 text-slate-800 mr-4 border border-slate-200/50"}`}>
                                <div className="font-bold uppercase tracking-wider text-[9px] text-slate-400 mb-0.5">
                                  {log.role === "user" ? "You" : "AI Assistant"}
                                </div>
                                <div className="whitespace-pre-wrap">{log.content}</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                    </div>

                    {/* Exit button */}
                    <div className="pt-3 border-t border-slate-100 flex gap-2 flex-shrink-0">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="px-4 py-2 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl text-xs font-semibold cursor-pointer"
                      >
                        Exit Portal / Logout
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsProfileModalOpen(false)}
                        className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-xl text-xs font-bold cursor-pointer"
                      >
                        Return to Study space
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            {/* F. SESSION ENDED SUMMARY CARD (Cozy summary popup with tips & reminders) */}
            <AnimatePresence>
              {isSummaryOpen && (
                <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xl z-50 flex items-center justify-center p-6">
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-white/95 border border-white/80 w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl space-y-6 text-slate-800 relative overflow-hidden"
                  >
                    {/* Glowing cozy ambient backdrop circle */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-orange-100 rounded-full blur-3xl opacity-40 -mr-10 -mt-10" />

                    <div className="text-center space-y-2">
                      <div className="w-14 h-14 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center mx-auto shadow-inner mb-2">
                        <Award className="w-7 h-7" />
                      </div>
                      <h3 className="text-xl font-bold tracking-tight text-slate-800">
                        Excellent Work, {userProfile?.name}!
                      </h3>
                      <p className="text-slate-400 text-xs">
                        You've completed your focus intervals successfully.
                      </p>
                    </div>

                    {/* Stats metrics block */}
                    <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 border border-slate-100 rounded-3xl text-center">
                      <div className="space-y-0.5">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Duration Focused</span>
                        <div className="text-xl font-mono font-bold text-blue-700">{formatTimer(secondsElapsed)}</div>
                      </div>

                      <div className="space-y-0.5">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">AI Challenges Faced</span>
                        <div className="text-xl font-mono font-bold text-orange-700">
                          {aiCount} {aiCount === 1 ? "Time" : "Times"}
                        </div>
                      </div>
                    </div>

                    {/* Inspirational Quote */}
                    <div className="bg-orange-50/40 border border-orange-100/50 p-4.5 rounded-2xl relative">
                      <span className="absolute left-3 top-2 text-3xl font-serif text-orange-200">“</span>
                      <p className="text-xs italic text-orange-800 font-serif leading-relaxed px-4">
                        {currentQuote.text}
                      </p>
                      <span className="text-[10px] text-orange-600 font-bold block text-right mt-1.5">
                        — {currentQuote.author}
                      </span>
                    </div>

                    {/* Reminders / Tips */}
                    <div className="space-y-2 px-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
                        <Compass className="w-4 h-4 text-blue-600 animate-spin" /> Reminders & Session Guidance
                      </span>
                      <ul className="text-xs text-slate-500 space-y-1 list-disc pl-4 leading-relaxed font-medium">
                        <li>Give your neck a slow gentle stretch and look out of a window for 20 seconds.</li>
                        <li>Hydrate yourself! Grab a fresh mug of water or a soothing warm chamomile tea.</li>
                        <li>Your focus logs have been stored safely. Rest well before your next intervals!</li>
                      </ul>
                    </div>

                    {/* Button */}
                    <button
                      type="button"
                      onClick={handleConfirmCloseSummary}
                      className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-2xl text-xs font-bold transition-all shadow-md cursor-pointer text-center block"
                    >
                      Return to Main Menu
                    </button>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
