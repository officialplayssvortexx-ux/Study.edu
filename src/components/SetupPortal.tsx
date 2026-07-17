import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  BookOpen,
  GraduationCap,
  Music,
  CheckCircle2,
  ArrowRight,
  Plus,
  Trash2,
  Heart,
  History,
  Chrome,
  LogIn,
  User,
  X,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Award,
  Bookmark,
  Eye,
  Sliders,
  Settings,
  Calendar,
  Flame,
  FileText,
  Sparkles,
  Clock,
  CheckSquare,
  Square
} from "lucide-react";
import { Playlist } from "../types";
import { PRESET_PLAYLISTS } from "../constants";
import { StudyPetWidget } from "./StudyPetWidget";

const LOGO_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M25,55 L25,65 C25,78 75,78 75,65 L75,55" fill="%231e293b"/><path d="M25,55 C25,67 75,67 75,55 Z" fill="%230f172a"/><path d="M50,25 L92,42 L50,59 L8,42 Z" fill="%231e293b"/><path d="M8,42 L8,45 L50,62 L92,45 L92,42 L50,59 Z" fill="%230f172a"/><ellipse cx="50" cy="42" rx="3.5" ry="2" fill="%230f172a"/><path d="M50,42 L80,51 L80,74" fill="none" stroke="%23f59e0b" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/><ellipse cx="80" cy="74" rx="4" ry="7" fill="%23d97706"/></svg>`;

interface SetupPortalProps {
  onComplete: (data: {
    studyTopic: string;
    isHomework: boolean;
    selectedPlaylists: Playlist[];
    userProfile: { name: string; email: string; picture: string };
    randomFactsEnabled?: boolean;
  }) => void;
  userEmail: string;
  sessionsHistory: any[];
  onDeleteSession?: (sessionId: string) => void;
}

export default function SetupPortal({ onComplete, userEmail, sessionsHistory, onDeleteSession }: SetupPortalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1: Topic / Focus State
  const [isHomework, setIsHomework] = useState(false);
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [randomFactsEnabled, setRandomFactsEnabled] = useState(false);

  // Step 2: Spotify State
  const [spotifyLinked, setSpotifyLinked] = useState(false);
  const [selectedPlaylists, setSelectedPlaylists] = useState<Playlist[]>([]);
  const [customPlaylistName, setCustomPlaylistName] = useState("");
  const [customPlaylistUrl, setCustomPlaylistUrl] = useState("");

  // Step 3: Google State
  const [googleAuthActive, setGoogleAuthActive] = useState(false);
  const [googleProfile, setGoogleProfile] = useState<{ name: string; email: string; picture: string } | null>(null);
  const [preferredName, setPreferredName] = useState("");

  // --- ACCOUNT PORTAL MASTER TAB STATES ---
  const [isAccountHistoryOpen, setIsAccountHistoryOpen] = useState(false);
  const [accountTab, setAccountTab] = useState<"dashboard" | "planner" | "ai-review" | "diploma" | "history">("dashboard");
  const [selectedReviewSession, setSelectedReviewSession] = useState<any>(null);
  const [reviewTab, setReviewTab] = useState<"transcript" | "flashcards" | "scores">("transcript");
  const [flippedReviewCards, setFlippedReviewCards] = useState<Record<string, boolean>>({});

  // Account settings
  const [selectedGrade, setSelectedGrade] = useState(() => localStorage.getItem("aura_selected_grade") || "12th Grade");
  const [schoolBegins, setSchoolBegins] = useState(() => localStorage.getItem("aura_school_begins") || "2026-09-01");
  const [lastDayOfSchool, setLastDayOfSchool] = useState(() => localStorage.getItem("aura_last_day_of_school") || "2027-06-15");
  const [activePetId, setActivePetId] = useState(() => localStorage.getItem("aura_companion_pet") || "luna");
  const [streak, setStreak] = useState(() => parseInt(localStorage.getItem("aura_streak_count") || "0", 10));
  const [simulateEndSchool, setSimulateEndSchool] = useState(false);

  // Planner states
  const [scheduleList, setScheduleList] = useState<{ id: string; day: string; topic: string; time: string; mode: "Study" | "Homework"; completed: boolean }[]>(() => {
    const cached = localStorage.getItem("aura_schedule_list");
    if (cached) {
      try { return JSON.parse(cached); } catch { return []; }
    }
    return [
      { id: "p1", day: "Monday", topic: "AP Calculus Homework Check", time: "16:00", mode: "Homework", completed: false },
      { id: "p2", day: "Wednesday", topic: "Modern Physics Concept Drilling", time: "15:30", mode: "Study", completed: false },
      { id: "p3", day: "Friday", topic: "English Literature Thesis Writing", time: "17:00", mode: "Study", completed: false },
    ];
  });

  const [newScheduleTopic, setNewScheduleTopic] = useState("");
  const [newScheduleTime, setNewScheduleTime] = useState("16:00");
  const [newScheduleDay, setNewScheduleDay] = useState("Monday");
  const [newScheduleMode, setNewScheduleMode] = useState<"Study" | "Homework">("Study");

  // AI Diagnostic report
  const [aiAnalysis, setAiAnalysis] = useState(() => localStorage.getItem("aura_ai_analysis") || null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Save changes to localStorage on states update
  useEffect(() => {
    localStorage.setItem("aura_selected_grade", selectedGrade);
  }, [selectedGrade]);

  useEffect(() => {
    localStorage.setItem("aura_school_begins", schoolBegins);
  }, [schoolBegins]);

  useEffect(() => {
    localStorage.setItem("aura_last_day_of_school", lastDayOfSchool);
  }, [lastDayOfSchool]);

  useEffect(() => {
    localStorage.setItem("aura_companion_pet", activePetId);
  }, [activePetId]);

  useEffect(() => {
    localStorage.setItem("aura_streak_count", streak.toString());
  }, [streak]);

  useEffect(() => {
    localStorage.setItem("aura_schedule_list", JSON.stringify(scheduleList));
  }, [scheduleList]);

  // Read latest streak value when Account modal opens
  useEffect(() => {
    if (isAccountHistoryOpen) {
      const latestStreak = parseInt(localStorage.getItem("aura_streak_count") || "0", 10);
      setStreak(latestStreak);
    }
  }, [isAccountHistoryOpen]);

  const handleTogglePlaylist = (playlist: Playlist) => {
    if (selectedPlaylists.some((p) => p.id === playlist.id)) {
      setSelectedPlaylists(selectedPlaylists.filter((p) => p.id !== playlist.id));
    } else {
      setSelectedPlaylists([...selectedPlaylists, playlist]);
    }
  };

  const handleAddCustomPlaylist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPlaylistName.trim()) return;

    const url = customPlaylistUrl.trim() || "https://open.spotify.com/playlist/37i9dQZF1DX8U6mS960u9I";
    const newPlaylist: Playlist = {
      id: `custom-${Date.now()}`,
      name: customPlaylistName,
      description: "Custom user linked Spotify playlist.",
      artwork: "https://images.unsplash.com/photo-1614680376593-902f74fa0d41?w=300&auto=format&fit=crop&q=60",
      spotifyUrl: url,
      isCustom: true,
      tracks: [
        {
          id: `custom-track-${Date.now()}`,
          title: "Ambient Study Resonance",
          artist: "Aura LoFi Custom",
          duration: "4:32",
          audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
          artwork: "https://images.unsplash.com/photo-1614680376593-902f74fa0d41?w=300&auto=format&fit=crop&q=60",
        },
      ],
    };

    setSelectedPlaylists([...selectedPlaylists, newPlaylist]);
    setCustomPlaylistName("");
    setCustomPlaylistUrl("");
  };

  const simulateGoogleLogin = () => {
    setGoogleAuthActive(true);
    setTimeout(() => {
      const defaultName = userEmail ? userEmail.split("@")[0] : "Student";
      const formattedName = defaultName.charAt(0).toUpperCase() + defaultName.slice(1);
      
      setGoogleProfile({
        name: formattedName,
        email: userEmail || "student@gmail.com",
        picture: LOGO_SVG, // Logo with removed background
      });
      setPreferredName(formattedName);
      setGoogleAuthActive(false);
    }, 1500);
  };

  const handleFinishSetup = () => {
    if (!googleProfile) return;
    onComplete({
      studyTopic: `${subject.trim()} - ${topic.trim()}`,
      isHomework,
      selectedPlaylists: selectedPlaylists.length > 0 ? selectedPlaylists : [PRESET_PLAYLISTS[0]],
      userProfile: {
        ...googleProfile,
        name: preferredName.trim() || googleProfile.name,
      },
      randomFactsEnabled: !isHomework && randomFactsEnabled,
    });
  };

  const handlePermanentlyDeleteAccount = () => {
    if (window.confirm("Are you absolutely sure you want to permanently delete your account? This will clear all progress logs, scores, flashcards, settings, and reload the application.")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfbfa] flex flex-col items-center justify-center p-6 relative font-sans select-none overflow-y-auto">
      
      {/* Background Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-40 pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-100 rounded-full blur-3xl opacity-40 pointer-events-none" />

       {/* Main Setup Card (Blue and Orange-red styling) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-xl bg-white/90 backdrop-blur-xl border border-slate-100 rounded-3xl shadow-2xl p-8 text-slate-800 overflow-hidden relative z-10"
      >
        {/* Floating Account Portal Launcher (Moved to top right with hover-only text) */}
        <div className="absolute top-4 right-4 z-20 group">
          <button
            type="button"
            onClick={() => setIsAccountHistoryOpen(true)}
            className="flex items-center justify-center w-8.5 h-8.5 bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-blue-700 border border-slate-200/60 rounded-full transition-all cursor-pointer shadow-sm relative"
            title="Account & Records"
          >
            <User className="w-4 h-4 text-blue-600" />
            
            {/* Hover tooltip displaying the text */}
            <span className="absolute right-full mr-2 top-1/2 -translate-y-1/2 whitespace-nowrap bg-slate-800 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              Account & Records
            </span>
          </button>
        </div>

        {/* Cap Logo inside Setup Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <img
            src={LOGO_SVG}
            alt="Aluminum Education Logo"
            className="w-16 h-16 object-contain mb-3 drop-shadow-sm"
          />
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">Aluminum Education</h1>
          <p className="text-[11px] text-orange-600 font-bold uppercase tracking-wider mt-1 max-w-[340px]">
            Where artificial intelligence challenges you, not gives you the answer
          </p>
        </div>

        {/* Progress Bar (Blue / Orange-red theme, centered and more clustered) */}
        <div className="flex items-center justify-between mb-8 max-w-[280px] mx-auto w-full">
          {[1, 2, 3].map((num) => (
            <div key={num} className="flex-1 flex items-center">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                  step === num
                    ? "bg-blue-600 text-white ring-4 ring-blue-500/20 shadow-md"
                    : step > num
                    ? "bg-orange-50 text-orange-600 border border-orange-100"
                    : "bg-slate-100 text-slate-400"
                }`}
              >
                {step > num ? "✓" : num}
              </div>
              {num < 3 && (
                <div
                  className={`flex-1 h-[2px] mx-2 transition-colors duration-300 ${
                    step > num ? "bg-orange-200" : "bg-slate-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* STEP 1: SUBJECT & FOCUS SELECTION */}
          {step === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="text-center space-y-1.5">
                <h2 className="text-xl font-bold tracking-tight text-slate-800">What are we focusing on today?</h2>
                <p className="text-slate-500 text-xs">Select your current session mode and focus subject to begin.</p>
              </div>

              {/* Mode Selection Buttons (Blue & Orange-red styling) */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  id="btn-mode-study"
                  onClick={() => setIsHomework(false)}
                  className={`flex flex-col items-center justify-center p-5 rounded-2xl border-2 transition-all text-center gap-2 cursor-pointer ${
                    !isHomework
                      ? "bg-blue-50 border-blue-500 text-blue-800 shadow-sm"
                      : "bg-slate-50/50 border-slate-200 text-slate-500 hover:border-slate-300"
                  }`}
                >
                  <GraduationCap className={`w-6 h-6 ${!isHomework ? "text-blue-600" : "text-slate-400"}`} />
                  <span className="text-xs font-bold">Study Mode</span>
                  <span className="text-[10px] text-slate-400">Concept breakdown & random facts</span>
                </button>

                <button
                  type="button"
                  id="btn-mode-homework"
                  onClick={() => setIsHomework(true)}
                  className={`flex flex-col items-center justify-center p-5 rounded-2xl border-2 transition-all text-center gap-2 cursor-pointer ${
                    isHomework
                      ? "bg-orange-50 border-orange-500 text-orange-800 shadow-sm"
                      : "bg-slate-50/50 border-slate-200 text-slate-500 hover:border-slate-300"
                  }`}
                >
                  <BookOpen className={`w-6 h-6 ${isHomework ? "text-orange-600" : "text-slate-400"}`} />
                  <span className="text-xs font-bold">Homework Help</span>
                  <span className="text-[10px] text-slate-400">Step-by-step rigorous work checking</span>
                </button>
              </div>

              {/* Subject & Topic Inputs (Mandatory) */}
              <div className="space-y-4">
                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1">
                    Specify Subject <span className="text-rose-500 font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    id="input-subject"
                    placeholder="e.g., Mathematics, Science, History, Literature"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-2.5 text-xs focus:outline-none focus:border-blue-500 transition-colors text-slate-800 shadow-sm font-medium"
                    required
                  />
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1">
                    Specify Topic <span className="text-rose-500 font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    id="input-topic"
                    placeholder={isHomework ? "e.g., Derivative Rules homework, Chapter 4 worksheet" : "e.g., Quantum Mechanics, American Revolution"}
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-2.5 text-xs focus:outline-none focus:border-blue-500 transition-colors text-slate-800 shadow-sm font-medium"
                    required
                  />
                </div>
              </div>

              {/* Random Facts Toggle (Only in Study Mode) */}
              {!isHomework && (
                <div className="flex items-center justify-between p-3.5 bg-blue-50/40 border border-blue-100 rounded-2xl shadow-sm text-left">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-slate-800">Enable Random Facts</span>
                    <p className="text-[10px] text-slate-500">Should the AI offer interesting random facts during this session?</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setRandomFactsEnabled(!randomFactsEnabled)}
                    className={`w-11 h-6 rounded-full transition-colors relative p-1 cursor-pointer ${
                      randomFactsEnabled ? "bg-orange-600" : "bg-slate-200"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 bg-white rounded-full shadow-md transition-transform ${
                        randomFactsEnabled ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  id="btn-step1-next"
                  onClick={() => {
                    if (!subject.trim() || !topic.trim()) {
                      alert("Both Subject and Topic fields are mandatory. Please fill in both to continue.");
                      return;
                    }
                    setStep(2);
                  }}
                  className={`font-bold py-2.5 px-6 rounded-2xl text-xs transition-all flex items-center gap-2 cursor-pointer shadow-md ${
                    subject.trim() && topic.trim()
                      ? "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/10"
                      : "bg-slate-200 text-slate-400 cursor-not-allowed"
                  }`}
                >
                  <span>Link Background Vibe</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 2: SPOTIFY & MUSIC VIBE */}
          {step === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="text-center space-y-1.5">
                <h2 className="text-xl font-bold tracking-tight text-slate-800">Configure Cozy Audio</h2>
                <p className="text-slate-500 text-xs">Link your Spotify account or add custom playlists to set your workspace flow.</p>
              </div>

              {/* Fake OAuth Connector (Seamless UX) */}
              {!spotifyLinked ? (
                <div className="p-4 bg-emerald-50/40 border border-emerald-100 rounded-2xl flex items-center justify-between text-left">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                      <Music className="w-4 h-4 text-emerald-600" /> Connect Spotify Account
                    </span>
                    <p className="text-[10px] text-emerald-700/80">Authorize to sync and load your focus libraries immediately.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSpotifyLinked(true)}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] px-4 py-2 rounded-xl transition-all shadow-md cursor-pointer"
                  >
                    Quick Connect
                  </button>
                </div>
              ) : (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-left">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <div>
                      <span className="text-xs font-bold text-emerald-950 block">Spotify Account Connected</span>
                      <p className="text-[10px] text-emerald-600">Personal study tracks are loaded and ready to sync.</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSpotifyLinked(false)}
                    className="text-[10px] text-rose-600 hover:underline font-bold"
                  >
                    Disconnect
                  </button>
                </div>
              )}

              {/* Playlists Picker list */}
              <div className="space-y-3">
                <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Available Playlists</label>
                <div className="grid grid-cols-1 gap-2.5 max-h-40 overflow-y-auto pr-1">
                  {PRESET_PLAYLISTS.map((playlist) => {
                    const isSelected = selectedPlaylists.some((p) => p.id === playlist.id);
                    return (
                      <button
                        key={playlist.id}
                        type="button"
                        onClick={() => handleTogglePlaylist(playlist)}
                        className={`w-full text-left p-3 border rounded-xl flex items-center justify-between transition-all cursor-pointer ${
                          isSelected
                            ? "bg-blue-50/50 border-blue-500 text-blue-900 shadow-sm"
                            : "bg-slate-50/30 border-slate-200 text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={playlist.artwork}
                            alt={playlist.name}
                            className="w-10 h-10 rounded-lg object-cover bg-slate-100 shadow-sm"
                          />
                          <div>
                            <span className="font-bold text-xs block">{playlist.name}</span>
                            <span className="text-[9px] text-slate-400 truncate max-w-[240px] block">{playlist.description}</span>
                          </div>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                            isSelected ? "bg-blue-600 border-blue-600 text-white" : "border-slate-300"
                          }`}
                        >
                          {isSelected && <span className="text-[9px] font-bold">✓</span>}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom URL Input */}
              <form onSubmit={handleAddCustomPlaylist} className="bg-slate-50 border border-slate-200/60 p-3.5 rounded-2xl space-y-2.5 text-left">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Add Custom Spotify / Audio URL</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Playlist / Album Name"
                    value={customPlaylistName}
                    onChange={(e) => setCustomPlaylistName(e.target.value)}
                    className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="https://open.spotify.com/playlist/..."
                    value={customPlaylistUrl}
                    onChange={(e) => setCustomPlaylistUrl(e.target.value)}
                    className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none"
                  />
                </div>
                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    disabled={!customPlaylistName.trim()}
                    className="bg-orange-600 hover:bg-orange-500 disabled:opacity-40 text-white font-bold text-[10px] px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Playlist
                  </button>
                </div>
              </form>

              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs text-slate-500 hover:text-slate-800 font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 px-6 rounded-2xl text-xs transition-all flex items-center gap-2 cursor-pointer shadow-md"
                >
                  <span>Verify Identity</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: GOOGLE AUTHENTICATION */}
          {step === 3 && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="text-center space-y-1.5">
                <h2 className="text-xl font-bold tracking-tight text-slate-800">Secure Your Session</h2>
                <p className="text-slate-500 text-xs">Synchronize with your student credentials to log scores, flashcards, and study progress securely.</p>
              </div>

              {!googleProfile ? (
                <div className="py-6 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center text-center space-y-4 px-6">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center shadow-inner">
                    <Chrome className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <span className="font-bold text-xs text-slate-800 block">Google Account Auth</span>
                    <p className="text-[10px] text-slate-400 max-w-xs leading-relaxed">
                      We'll fetch your profile and graduation credentials to sync your focus records.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={simulateGoogleLogin}
                    disabled={googleAuthActive}
                    className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs px-6 py-2.5 rounded-2xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
                  >
                    {googleAuthActive ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Connecting Account...</span>
                      </>
                    ) : (
                      <>
                        <LogIn className="w-4 h-4" />
                        <span>Link Google Profile</span>
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="space-y-5 text-left">
                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl flex items-center gap-4">
                    <img
                      src={googleProfile.picture}
                      alt={googleProfile.name}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded-full border-2 border-white shadow-md object-cover bg-slate-50"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Linked Account</span>
                      <div className="font-bold text-xs text-slate-800">{googleProfile.name}</div>
                      <div className="text-[10px] text-slate-400 truncate">{googleProfile.email}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setGoogleProfile(null);
                        setPreferredName("");
                      }}
                      className="text-[10px] text-rose-600 hover:underline font-bold"
                    >
                      Change
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Confirm Preferred Nickname</label>
                    <input
                      type="text"
                      placeholder="e.g., Alex"
                      value={preferredName}
                      onChange={(e) => setPreferredName(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-2.5 text-xs focus:outline-none focus:border-blue-500 text-slate-800"
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="text-xs text-slate-500 hover:text-slate-800 font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
                <button
                  type="button"
                  onClick={handleFinishSetup}
                  disabled={!googleProfile}
                  className="bg-orange-600 hover:bg-orange-500 disabled:opacity-40 text-white font-bold py-2.5 px-6 rounded-2xl text-xs transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-orange-600/10"
                >
                  <span>Launch Study Portal</span>
                  <CheckCircle2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer info branding */}
        <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-center text-[10px] text-slate-400 font-bold">
          <div>ALUMINUM EDUCATION</div>
        </div>
      </motion.div>

      {/* --- REUSABLE FRONT PAGE ACCOUNT OVERVIEW & HISTORY PORTAL MODAL --- */}
      <AnimatePresence>
        {isAccountHistoryOpen && (
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xl z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="bg-white border border-slate-200 w-full max-w-4xl rounded-[2.5rem] p-6 shadow-2xl space-y-5 text-slate-800 relative flex flex-col h-[90vh] md:h-[80vh] overflow-hidden"
            >
              
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-2xl">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wider">Academic Command Center</h3>
                    <p className="text-[10px] text-slate-400">Manage companion pets, streaks, study schedule planner, and view credentials.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsAccountHistoryOpen(false);
                    setSelectedReviewSession(null);
                  }}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {selectedReviewSession ? (
                // --- SUB-SCREEN: DETAILED SESSION RECORDS REVIEW ---
                <div className="flex-1 flex flex-col overflow-hidden space-y-4">
                  {/* Session Overview Block */}
                  <div className="flex items-center justify-between bg-slate-50 border border-slate-200/60 p-3.5 rounded-2xl flex-shrink-0 text-left">
                    <div>
                      <button
                        type="button"
                        onClick={() => setSelectedReviewSession(null)}
                        className="text-[10px] text-blue-600 font-bold hover:underline flex items-center gap-1 mb-1 cursor-pointer"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" /> Back to History list
                      </button>
                      <h4 className="font-bold text-xs text-slate-800 truncate max-w-[340px]">
                        Review Focus: {selectedReviewSession.topic}
                      </h4>
                      <p className="text-[9px] text-slate-400 mt-0.5">
                        Logged on {selectedReviewSession.date} • {selectedReviewSession.mode} • Focused for {selectedReviewSession.duration}
                      </p>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <span className="text-[10px] font-bold text-blue-600 block">{selectedReviewSession.aiCount} AI assists</span>
                    </div>
                  </div>

                  {/* Sub-tabs for Review Panel */}
                  <div className="flex bg-slate-100 p-1 rounded-xl flex-shrink-0 gap-1">
                    <button
                      type="button"
                      onClick={() => setReviewTab("transcript")}
                      className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                        reviewTab === "transcript" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      <MessageSquare className="w-3.5 h-3.5 inline-block mr-1 text-blue-600" />
                      Chat Transcript
                    </button>
                    <button
                      type="button"
                      onClick={() => setReviewTab("flashcards")}
                      className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                        reviewTab === "flashcards" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      <Bookmark className="w-3.5 h-3.5 inline-block mr-1 text-purple-600" />
                      Archived Flashcards
                    </button>
                    <button
                      type="button"
                      onClick={() => setReviewTab("scores")}
                      className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                        reviewTab === "scores" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      <Award className="w-3.5 h-3.5 inline-block mr-1 text-emerald-600" />
                      Exam Scores
                    </button>
                  </div>

                  {/* Review Content viewport */}
                  <div className="flex-1 overflow-y-auto pr-1">
                    {/* A. TRANSCRIPTS REVIEW */}
                    {reviewTab === "transcript" && (
                      <div className="space-y-2.5">
                        {!selectedReviewSession.transcript || selectedReviewSession.transcript.length === 0 ? (
                          <div className="text-center py-8 text-xs text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                            No chat transcripts registered in this study session.
                          </div>
                        ) : (
                          selectedReviewSession.transcript.map((msg: any, idx: number) => (
                            <div key={idx} className={`p-3 rounded-2xl text-xs text-left ${msg.role === "user" ? "bg-blue-50/50 border border-blue-100 ml-6" : "bg-slate-50 border border-slate-200/50 mr-6"}`}>
                              <span className="font-bold text-[9px] uppercase tracking-wider text-slate-400 block mb-1">
                                {msg.role === "user" ? "You" : "Homework AI"}
                              </span>
                              <div className="whitespace-pre-wrap leading-relaxed text-slate-700">{msg.content}</div>
                            </div>
                          ))
                        )}
                      </div>
                    )}

                    {/* B. ARCHIVED FLASHCARDS REVIEW */}
                    {reviewTab === "flashcards" && (
                      <div className="space-y-3">
                        {!selectedReviewSession.flashcards || selectedReviewSession.flashcards.length === 0 ? (
                          <div className="text-center py-8 text-xs text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                            No custom flashcards saved during this session.
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {selectedReviewSession.flashcards.map((fc: any, idx: number) => {
                              const isFlipped = flippedReviewCards[`review-${fc.id}`];
                              return (
                                <div
                                  key={fc.id || idx}
                                  onClick={() => setFlippedReviewCards(prev => ({ ...prev, [`review-${fc.id}`]: !prev[`review-${fc.id}`] }))}
                                  className="p-4 min-h-[110px] bg-slate-50/60 border border-slate-200 rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer hover:border-purple-300 transition-colors relative"
                                >
                                  <div className="absolute top-1.5 right-2 text-[8px] uppercase font-bold text-slate-400">
                                    Tap to flip
                                  </div>
                                  {!isFlipped ? (
                                    <div className="space-y-1">
                                      <span className="text-[8px] uppercase tracking-wider text-purple-600 font-bold">Question</span>
                                      <div className="text-xs font-bold text-slate-800 leading-snug">{fc.question}</div>
                                    </div>
                                  ) : (
                                    <div className="space-y-1">
                                      <span className="text-[8px] uppercase tracking-wider text-emerald-600 font-bold">Answer</span>
                                      <div className="text-[11px] text-slate-600 leading-relaxed">{fc.answer}</div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}

                    {/* C. PRACTICE EXAM SCORES REVIEW */}
                    {reviewTab === "scores" && (
                      <div className="space-y-2">
                        {!selectedReviewSession.testScores || selectedReviewSession.testScores.length === 0 ? (
                          <div className="text-center py-8 text-xs text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                            No diagnostic quiz scores stored from this session.
                          </div>
                        ) : (
                          selectedReviewSession.testScores.map((scoreCard: any, idx: number) => (
                            <div key={idx} className="p-4 bg-slate-50 border border-slate-200/60 rounded-2xl flex items-center justify-between text-left">
                              <div className="flex items-center gap-3">
                                <Award className="w-8 h-8 text-emerald-600" />
                                <div>
                                  <span className="font-bold text-xs text-slate-800 block">Practice Exam Score</span>
                                  <p className="text-[10px] text-slate-400 mt-0.5">
                                    {scoreCard.correct} out of {scoreCard.total} correct • Logged on {scoreCard.date || selectedReviewSession.date}
                                  </p>
                                </div>
                              </div>
                              <div className="font-mono font-bold text-emerald-700 text-lg">
                                {scoreCard.score}%
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                // --- MULTI-TAB MASTER LAYOUT (SIDEBAR + DISPLAY CANVASES) ---
                <div className="flex-1 flex flex-col md:flex-row gap-5 overflow-hidden">
                  
                  {/* Left-side tab navigation list */}
                  <div className="w-full md:w-56 flex md:flex-col gap-1 flex-shrink-0 bg-slate-50 p-2.5 rounded-2xl md:h-full overflow-x-auto md:overflow-x-visible">
                    <button
                      type="button"
                      onClick={() => setAccountTab("dashboard")}
                      className={`flex-shrink-0 md:flex-shrink md:w-full px-4 py-2 text-xs font-bold rounded-xl text-left flex items-center gap-2 cursor-pointer transition-all ${
                        accountTab === "dashboard" ? "bg-blue-600 text-white shadow-md shadow-blue-600/10" : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      <Flame className="w-4 h-4" />
                      <span>My Pet & Companion</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setAccountTab("planner")}
                      className={`flex-shrink-0 md:flex-shrink md:w-full px-4 py-2 text-xs font-bold rounded-xl text-left flex items-center gap-2 cursor-pointer transition-all ${
                        accountTab === "planner" ? "bg-blue-600 text-white shadow-md shadow-blue-600/10" : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      <Calendar className="w-4 h-4" />
                      <span>Study Scheduler</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setAccountTab("ai-review")}
                      className={`flex-shrink-0 md:flex-shrink md:w-full px-4 py-2 text-xs font-bold rounded-xl text-left flex items-center gap-2 cursor-pointer transition-all ${
                        accountTab === "ai-review" ? "bg-blue-600 text-white shadow-md shadow-blue-600/10" : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>AI Diagnostic Audit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setAccountTab("diploma")}
                      className={`flex-shrink-0 md:flex-shrink md:w-full px-4 py-2 text-xs font-bold rounded-xl text-left flex items-center gap-2 cursor-pointer transition-all ${
                        accountTab === "diploma" ? "bg-blue-600 text-white shadow-md shadow-blue-600/10" : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      <GraduationCap className="w-4 h-4" />
                      <span>Academic Diploma</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setAccountTab("history")}
                      className={`flex-shrink-0 md:flex-shrink md:w-full px-4 py-2 text-xs font-bold rounded-xl text-left flex items-center gap-2 cursor-pointer transition-all ${
                        accountTab === "history" ? "bg-blue-600 text-white shadow-md shadow-blue-600/10" : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      <History className="w-4 h-4" />
                      <span>Study Records ({sessionsHistory.length})</span>
                    </button>
                  </div>

                  {/* Right-side main tab content viewport */}
                  <div className="flex-1 overflow-y-auto pr-1">
                    <AnimatePresence mode="wait">
                      
                      {/* TAB A: COMPANION & PROFILE DASHBOARD */}
                      {accountTab === "dashboard" && (
                        <motion.div
                          key="tab-dashboard"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="space-y-5 text-left pb-4"
                        >
                          <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl flex items-center gap-3.5 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-100 rounded-full blur-2xl opacity-40 pointer-events-none" />
                            <img
                              src={LOGO_SVG}
                              alt="Profile"
                              className="w-12 h-12 rounded-full border-2 border-white shadow-md bg-slate-100 object-cover z-10"
                            />
                            <div className="flex-1 min-w-0 z-10">
                              <span className="text-[9px] uppercase font-bold text-orange-600 tracking-wider">Active Student Profile</span>
                              <div className="font-extrabold text-sm text-slate-800">
                                {googleProfile ? preferredName || googleProfile.name : "Study Session Member"}
                              </div>
                              <div className="text-[10px] text-slate-400 truncate">{userEmail}</div>
                            </div>

                            <button
                              type="button"
                              onClick={handlePermanentlyDeleteAccount}
                              className="flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 px-3 py-2 rounded-xl text-[10px] font-bold cursor-pointer transition-colors z-10"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete Account</span>
                            </button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Academic Grade and Dates Setting */}
                            <div className="bg-white border border-slate-200 p-5 rounded-3xl space-y-4 shadow-sm">
                              <div className="border-b border-slate-100 pb-2">
                                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Class Level & School Year Setting</span>
                              </div>

                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-500 uppercase">Grade Level</label>
                                <div className="grid grid-cols-4 gap-1.5">
                                  {["9th", "10th", "11th", "12th"].map((g) => {
                                    const label = `${g} Grade`;
                                    const isSelected = selectedGrade === label;
                                    return (
                                      <button
                                        key={g}
                                        type="button"
                                        onClick={() => setSelectedGrade(label)}
                                        className={`py-1.5 text-[10px] font-extrabold rounded-lg border transition-all cursor-pointer ${
                                          isSelected
                                            ? "bg-orange-50 border-orange-500 text-orange-700 font-bold"
                                            : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                                        }`}
                                      >
                                        {g}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-3.5 pt-1">
                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-slate-500 uppercase block">School Begins</label>
                                  <input
                                    type="date"
                                    value={schoolBegins}
                                    onChange={(e) => setSchoolBegins(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-[10px] focus:outline-none focus:border-blue-500 text-slate-700 font-bold"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-slate-500 uppercase block">Last Day of School</label>
                                  <input
                                    type="date"
                                    value={lastDayOfSchool}
                                    onChange={(e) => setLastDayOfSchool(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-[10px] focus:outline-none focus:border-blue-500 text-slate-700 font-bold"
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Companion Widget Embedding */}
                            <div className="flex justify-center">
                              <StudyPetWidget
                                currentPetId={activePetId}
                                onChangePet={setActivePetId}
                                streak={streak}
                                isSessionCompletedToday={sessionsHistory.some(s => s.date === new Date().toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" }))}
                              />
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {/* TAB B: STUDY SCHEDULER & PLANNER */}
                      {accountTab === "planner" && (
                        <motion.div
                          key="tab-planner"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="space-y-5 text-left pb-4"
                        >
                          <div className="bg-gradient-to-r from-blue-50 to-orange-50 border border-blue-100 p-4 rounded-2xl flex items-center justify-between">
                            <div className="space-y-1">
                              <span className="text-[10px] uppercase font-bold tracking-wider text-orange-600 block">Weekly planner</span>
                              <h4 className="font-bold text-xs text-slate-800">Plan Ahead, Earn Flames, and Guard Your Streak</h4>
                              <p className="text-[9px] text-slate-400 max-w-md">Schedule study slots. Attend your planned sessions to level up and feed your active companion pet!</p>
                            </div>
                            <Calendar className="w-10 h-10 text-orange-500/20" />
                          </div>

                          {/* Quick Add Form */}
                          <div className="bg-white border border-slate-200 p-4 rounded-2xl space-y-3">
                            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">Schedule a New Study/Homework Session</span>
                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                              <div className="space-y-0.5">
                                <label className="text-[8px] font-bold text-slate-400 block">Topic / Focus</label>
                                <input
                                  type="text"
                                  placeholder="e.g. AP Calculus derivatives"
                                  value={newScheduleTopic}
                                  onChange={(e) => setNewScheduleTopic(e.target.value)}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-[10px] focus:outline-none"
                                />
                              </div>
                              <div className="space-y-0.5">
                                <label className="text-[8px] font-bold text-slate-400 block">Day of the Week</label>
                                <select
                                  value={newScheduleDay}
                                  onChange={(e) => setNewScheduleDay(e.target.value)}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-[10px]"
                                >
                                  {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(d => (
                                    <option key={d} value={d}>{d}</option>
                                  ))}
                                </select>
                              </div>
                              <div className="space-y-0.5">
                                <label className="text-[8px] font-bold text-slate-400 block">Time Slot & Mode</label>
                                <div className="flex gap-1.5">
                                  <input
                                    type="time"
                                    value={newScheduleTime}
                                    onChange={(e) => setNewScheduleTime(e.target.value)}
                                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-2 py-1 text-[10px]"
                                  />
                                  <select
                                    value={newScheduleMode}
                                    onChange={(e) => setNewScheduleMode(e.target.value as any)}
                                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-1.5 py-1 text-[10px]"
                                  >
                                    <option value="Study">Study</option>
                                    <option value="Homework">HW Help</option>
                                  </select>
                                </div>
                              </div>
                              <div className="flex items-end">
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (!newScheduleTopic.trim()) return;
                                    const newTask = {
                                      id: `sched-${Date.now()}`,
                                      day: newScheduleDay,
                                      topic: newScheduleTopic,
                                      time: newScheduleTime,
                                      mode: newScheduleMode,
                                      completed: false,
                                    };
                                    setScheduleList(prev => [...prev, newTask]);
                                    setNewScheduleTopic("");
                                  }}
                                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] py-1.5 rounded-xl cursor-pointer shadow-sm transition-colors"
                                >
                                  Add Schedule Slot
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Interactive Checklist list */}
                          <div className="space-y-2">
                            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">Active Study Calendar Slots</span>
                            {scheduleList.length === 0 ? (
                              <div className="text-center py-6 text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                No study tasks scheduled yet.
                              </div>
                            ) : (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                                {scheduleList.map((slot) => (
                                  <div
                                    key={slot.id}
                                    className={`p-3.5 border rounded-2xl flex items-center justify-between text-xs transition-all ${
                                      slot.completed
                                        ? "bg-slate-50 border-slate-200/50 opacity-70"
                                        : "bg-white border-slate-200 shadow-sm hover:border-blue-200"
                                    }`}
                                  >
                                    <div className="flex items-center gap-3 min-w-0">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setScheduleList(prev =>
                                            prev.map(item => item.id === slot.id ? { ...item, completed: !item.completed } : item)
                                          );
                                        }}
                                        className="text-slate-400 hover:text-blue-600 transition-colors"
                                      >
                                        {slot.completed ? (
                                          <CheckSquare className="w-5 h-5 text-blue-600" />
                                        ) : (
                                          <Square className="w-5 h-5" />
                                        )}
                                      </button>
                                      <div className="min-w-0 text-left">
                                        <span className={`font-bold text-xs text-slate-800 truncate block ${slot.completed ? "line-through text-slate-400" : ""}`}>
                                          {slot.topic}
                                        </span>
                                        <p className="text-[10px] text-slate-400 mt-0.5">
                                          {slot.day} @ {slot.time} • <span className={slot.mode === "Homework" ? "text-orange-600 font-bold" : "text-blue-600 font-bold"}>{slot.mode}</span>
                                        </p>
                                      </div>
                                    </div>

                                    <button
                                      type="button"
                                      onClick={() => setScheduleList(prev => prev.filter(item => item.id !== slot.id))}
                                      className="p-1.5 hover:bg-rose-50 text-slate-300 hover:text-rose-500 rounded-lg transition-colors"
                                      title="Remove"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}

                      {/* TAB C: AI PROGRESS REVIEW & STRUGGLES AUDIT */}
                      {accountTab === "ai-review" && (
                        <motion.div
                          key="tab-ai-review"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="space-y-4 text-left pb-4"
                        >
                          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-5 rounded-3xl relative overflow-hidden shadow-lg shadow-blue-600/15">
                            <div className="absolute top-0 right-0 w-36 h-36 bg-white/5 rounded-full blur-2xl pointer-events-none" />
                            <span className="text-[9px] uppercase font-bold tracking-wider text-blue-200 block mb-1">AI Academic Superintendent Diagnostics</span>
                            <h4 className="font-bold text-sm">Combined Struggles Review & Learning Diagnostic</h4>
                            <p className="text-[11px] text-blue-100 max-w-lg leading-relaxed mt-1">
                              Superintendent Dominique reviews all of your combined study session transcripts, exam cards, and quiz results to generate a personalized struggle audit and action plan.
                            </p>
                          </div>

                          <div className="bg-white border border-slate-200 p-5 rounded-3xl space-y-4 shadow-sm">
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Diagnostic Status</span>
                                <p className="text-xs font-bold text-slate-800">
                                  {aiAnalysis ? "Analysis Complete & Ready" : "Unanalyzed - Start diagnostic"}
                                </p>
                              </div>

                              <button
                                type="button"
                                onClick={handleReviewAllSessions}
                                disabled={isAnalyzing || sessionsHistory.length === 0}
                                className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-[10px] font-extrabold px-5 py-2 rounded-2xl cursor-pointer shadow-md shadow-blue-600/10 flex items-center gap-2"
                              >
                                {isAnalyzing ? (
                                  <>
                                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    <span>Auditing Sessions...</span>
                                  </>
                                ) : (
                                  <>
                                    <Sparkles className="w-3.5 h-3.5" />
                                    <span>Generate Superintendent struggles Review</span>
                                  </>
                                )}
                              </button>
                            </div>

                            {sessionsHistory.length === 0 && (
                              <div className="text-[10px] text-amber-600 font-semibold bg-amber-50 p-3 rounded-2xl border border-amber-100">
                                ⚠️ No focus logs detected yet. Please complete at least one focus session so Superintendent Dominique can audit your academic performance!
                              </div>
                            )}

                            {aiAnalysis ? (
                              <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl overflow-y-auto max-h-[300px] text-slate-700 text-xs leading-relaxed space-y-3 whitespace-pre-wrap font-medium">
                                {aiAnalysis}
                              </div>
                            ) : (
                              !isAnalyzing && (
                                <div className="text-center py-10 text-slate-400 text-xs">
                                  <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                  <span>No struggles audit generated yet. Click the button above to run our diagnostic AI report.</span>
                                </div>
                              )
                            )}
                          </div>
                        </motion.div>
                      )}

                      {/* TAB D: ACADEMIC CREDENTIALS & DIPLOMA */}
                      {accountTab === "diploma" && (
                        <motion.div
                          key="tab-diploma"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="space-y-4 text-left pb-4"
                        >
                          {/* Simulation Switch */}
                          <div className="flex justify-between items-center bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-2xl">
                            <div>
                              <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">Graduation Sandbox Toggle</span>
                              <p className="text-[10px] text-slate-500 font-medium">Force simulate end-of-year so you can view the official diploma certificate instantly.</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => setSimulateEndSchool(!simulateEndSchool)}
                              className={`w-11 h-6 rounded-full transition-colors relative p-1 cursor-pointer ${
                                simulateEndSchool ? "bg-orange-600" : "bg-slate-200"
                              }`}
                            >
                              <div
                                className={`w-4 h-4 bg-white rounded-full shadow-md transition-transform ${
                                  simulateEndSchool ? "translate-x-5" : "translate-x-0"
                                }`}
                              />
                            </button>
                          </div>

                          {/* Check End of School Date */}
                          {(() => {
                            const today = new Date();
                            const end = new Date(lastDayOfSchool);
                            const ended = today >= end || simulateEndSchool;
                            const daysRemaining = Math.max(0, Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));

                            if (!ended) {
                              return (
                                <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-3xl space-y-4">
                                  <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                                    <Clock className="w-7 h-7" />
                                  </div>
                                  <div className="space-y-1.5">
                                    <h5 className="font-extrabold text-slate-800 text-sm">Graduation Credentials Sealed</h5>
                                    <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                                      There are <span className="text-orange-600 font-extrabold">{daysRemaining} days</span> remaining until the last day of school ({new Date(lastDayOfSchool).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}). Your final diploma will unlock automatically on that date.
                                    </p>
                                    <p className="text-[10px] text-slate-400 italic">
                                      Tip: Use the "Graduation Sandbox Toggle" above to force-unlock and inspect the diploma right now!
                                    </p>
                                  </div>
                                </div>
                              );
                            }

                            const is12th = selectedGrade === "12th Grade";

                            return (
                              <div className="space-y-5">
                                {is12th && (
                                  <motion.div
                                    initial={{ scale: 0.95, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="bg-gradient-to-r from-yellow-500 via-orange-500 to-amber-500 p-6 rounded-3xl text-white text-center shadow-xl space-y-2.5 relative overflow-hidden"
                                  >
                                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-white/10 to-transparent pointer-events-none" />
                                    <motion.div
                                      animate={{ y: [0, -8, 0] }}
                                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                      className="inline-block"
                                    >
                                      🎓
                                    </motion.div>
                                    <h4 className="text-base font-extrabold tracking-tight uppercase">CONGRATULATIONS, GRADUATE!</h4>
                                    <p className="text-xs text-amber-50 leading-relaxed max-w-xl mx-auto font-medium">
                                      You have fully completed the 12th-grade curriculum of the Aluminum Education District. We are incredibly proud of your rigorous mental discipline and academic resilience!
                                    </p>
                                    <div className="text-[10px] text-yellow-100 font-semibold tracking-wider uppercase">
                                      Certified by Superintendent Dominique
                                    </div>
                                  </motion.div>
                                )}

                                {/* Prestigious Ivory Diploma */}
                                <div className="bg-[#fdfbf7] border-[12px] border-double border-amber-600 p-8 rounded-2xl shadow-lg relative text-center text-amber-950 font-serif space-y-5 select-none md:p-12 overflow-hidden max-w-2xl mx-auto">
                                  {/* Background Watermark Crest */}
                                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-amber-600/[0.02] rounded-full pointer-events-none flex items-center justify-center">
                                    <GraduationCap className="w-56 h-56 text-amber-600/[0.04]" />
                                  </div>

                                  <div className="space-y-1 z-10 relative">
                                    <span className="text-[10px] md:text-xs tracking-[0.25em] font-bold text-amber-800 uppercase block">Diploma of Graduation</span>
                                    <h3 className="text-lg md:text-2xl font-extrabold tracking-tight text-amber-900 uppercase">Aluminum Education District</h3>
                                    <div className="w-32 h-[1px] bg-amber-300 mx-auto mt-2" />
                                  </div>

                                  <div className="space-y-3 z-10 relative text-sm font-medium italic text-amber-800 leading-relaxed">
                                    <p className="text-xs md:text-sm">By authority of the Board of Education of the Aluminum District, this credential certifies that</p>
                                    
                                    <h4 className="text-xl md:text-3xl font-extrabold text-amber-950 not-italic tracking-wide my-4 font-sans uppercase">
                                      {googleProfile ? preferredName || googleProfile.name : "Rigorous Student Scholar"}
                                    </h4>

                                    <p className="text-xs md:text-sm">
                                      has satisfactorily completed the prescribed scholastic requirements of the
                                    </p>
                                    
                                    <p className="not-italic font-bold text-sm md:text-base text-amber-900 font-sans tracking-wide uppercase">
                                      {selectedGrade} Curriculum
                                    </p>

                                    <p className="text-[11px] md:text-xs">
                                      and is therefore declared a graduate of this district with all rights, honors, and privileges thereunto appertaining.
                                    </p>
                                  </div>

                                  <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-6 border-t border-amber-100 z-10 relative">
                                    <div className="text-left font-sans">
                                      <span className="text-[9px] uppercase tracking-wider text-amber-700 block font-bold">Granted On</span>
                                      <span className="text-xs font-bold text-amber-950 block">{new Date(lastDayOfSchool).toLocaleDateString([], { month: "long", day: "numeric", year: "numeric" })}</span>
                                    </div>

                                    {/* Gold Crest */}
                                    <div className="w-14 h-14 bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-500 rounded-full border-4 border-white flex items-center justify-center shadow-md relative group shrink-0">
                                      <div className="absolute inset-0.5 border border-dashed border-white/40 rounded-full" />
                                      <span className="text-[8px] font-extrabold text-amber-950 tracking-tight">ALUMINUM</span>
                                      {/* Ornate ribbons */}
                                      <div className="absolute -bottom-2 -left-1 w-3 h-6 bg-amber-500 origin-top rotate-12 clip-path-ribbon" />
                                      <div className="absolute -bottom-2 -right-1 w-3 h-6 bg-amber-600 origin-top -rotate-12 clip-path-ribbon" />
                                    </div>

                                    <div className="text-right font-sans">
                                      {/* Superintendent Sign */}
                                      <div className="font-cursive italic text-base text-indigo-900 tracking-wider mb-0.5 font-semibold">
                                        Dominique
                                      </div>
                                      <span className="text-[8px] uppercase tracking-wider text-amber-700 block font-bold">Dominique, Superintendent of the aluminum district</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })()}
                        </motion.div>
                      )}

                      {/* TAB E: COMPLETED SESSIONS REGISTER LIST */}
                      {accountTab === "history" && (
                        <motion.div
                          key="tab-history"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="space-y-4 text-left pb-4"
                        >
                          <div className="flex-1 flex flex-col overflow-hidden space-y-2">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block text-left">
                              Completed Sessions Register ({sessionsHistory.length})
                            </span>

                            {sessionsHistory.length === 0 ? (
                              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                                <History className="w-8 h-8 text-slate-300 mb-2" />
                                <span className="font-bold text-xs text-slate-800">No session logs registered yet</span>
                                <p className="text-[10px] text-slate-400 max-w-xs mt-0.5 leading-relaxed">
                                  Your progress logs, flashcard decks, and quiz scores will render here once you complete study intervals.
                                </p>
                              </div>
                            ) : (
                              <div className="flex-1 overflow-y-auto pr-1 space-y-2.5 max-h-[350px]">
                                {sessionsHistory.map((sess) => (
                                  <div key={sess.id} className="bg-slate-50 hover:bg-slate-100 border border-slate-100 hover:border-slate-200 p-3.5 rounded-2xl flex items-center justify-between text-xs transition-all text-left">
                                    <div className="space-y-0.5 min-w-0">
                                      <span className="font-bold text-slate-800 truncate block max-w-[260px]">{sess.topic}</span>
                                      <span className="text-[9px] text-slate-400 block">{sess.date} • {sess.mode} Mode • Focused {sess.duration}</span>
                                    </div>

                                    <div className="flex items-center gap-2 flex-shrink-0">
                                      <button
                                        type="button"
                                        onClick={() => setSelectedReviewSession(sess)}
                                        className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] px-3.5 py-1.5 rounded-xl transition-all cursor-pointer shadow-sm"
                                      >
                                        Review Records
                                      </button>
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          if (window.confirm("WARNING: Are you absolutely sure you want to permanently delete this study session? Once deleted, it will disappear immediately and all of its diagnostic test records, flashcards, and transcript files will be gone permanently. This action cannot be undone.")) {
                                            onDeleteSession?.(sess.id);
                                            if (selectedReviewSession?.id === sess.id) {
                                              setSelectedReviewSession(null);
                                            }
                                          }
                                        }}
                                        className="p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-xl transition-colors cursor-pointer animate-fade-in"
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
                        </motion.div>
                      )}

                    </AnimatePresence>
                  </div>

                </div>
              )}

              {/* Modal Footer */}
              <div className="pt-2 border-t border-slate-100 flex justify-end flex-shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setIsAccountHistoryOpen(false);
                    setSelectedReviewSession(null);
                  }}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                >
                  Close Portal
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
