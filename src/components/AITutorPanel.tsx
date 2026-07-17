import React, { useState, useRef, useEffect } from "react";
import { Message } from "../types";
import {
  HelpCircle,
  Send,
  CheckCircle,
  AlertCircle,
  Sparkles,
  BookOpen,
  ChevronRight,
  ChevronLeft,
  HelpCircle as HintIcon,
  Lightbulb,
  RefreshCw,
  Sliders,
  Eye,
  Settings,
  Flame,
  Save,
  Trash2,
  Bookmark,
  Award
} from "lucide-react";

interface AITutorPanelProps {
  studyTopic: string;
  isHomework: boolean;
  userEmail: string;
  onIncrementAICount?: () => void;
  onSaveChatMessage?: (msg: Message) => void;
  onSaveFlashcards?: (cards: any[]) => void;
  onSaveTestScore?: (testResult: any) => void;
}

export default function AITutorPanel({
  studyTopic,
  isHomework,
  userEmail,
  onIncrementAICount,
  onSaveChatMessage,
  onSaveFlashcards,
  onSaveTestScore
}: AITutorPanelProps) {
  const [activeTab, setActiveTab] = useState<"chat" | "checker" | "test" | "flashcards">("chat");

  // --- 1. CHAT TAB STATE ---
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "initial",
      role: "assistant",
      content: `Hello! I'm your AI Study Assistant. Today we are focusing on **${studyTopic}** in **${
        isHomework ? "Homework Mode" : "Study Mode"
      }**.

How can I help you understand your work today? Feel free to ask a question, share a formula, or prompt for a step-by-step conceptual walkthrough. (Remember, I will explain the steps and guide you, but I won't give you the final answer right away!)`,
      timestamp: new Date(),
    },
  ]);
  const [userInput, setUserInput] = useState("");
  const [loadingChat, setLoadingChat] = useState(false);
  const [hintCount, setHintCount] = useState(0);

  // --- 2. WORK CHECKER STATE ---
  const [problemText, setProblemText] = useState("");
  const [userWorkText, setUserWorkText] = useState("");
  const [checkingWork, setCheckingWork] = useState(false);
  const [checkerResponse, setCheckerResponse] = useState<string | null>(null);

  // --- 3. DIAGNOSTIC TEST MODE STATE ---
  const [testQuestions, setTestQuestions] = useState<any[]>([]);
  const [generatingTest, setGeneratingTest] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [testSubmitted, setTestSubmitted] = useState(false);
  const [testScorePercent, setTestScorePercent] = useState<number | null>(null);
  const [testScoreCorrect, setTestScoreCorrect] = useState<number>(0);
  const [savedTestResult, setSavedTestResult] = useState(false);

  // --- 4. ADAPTIVE FLASHCARDS STATE ---
  const [flashcards, setFlashcards] = useState<any[]>([]);
  const [generatingFlashcards, setGeneratingFlashcards] = useState(false);
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});
  const [currentCardIdx, setCurrentCardIdx] = useState(0);
  const [savedFlashcards, setSavedFlashcards] = useState(false);

  // Adaptive Constraints / blacklists / pivots
  const [excludedThemes, setExcludedThemes] = useState<string[]>([]);
  const [preferredSubtopics, setPreferredSubtopics] = useState<string[]>([]);
  const [learningGoals, setLearningGoals] = useState("");
  const [customGoalInput, setCustomGoalInput] = useState("");
  const [showCustomGoalInput, setShowCustomGoalInput] = useState(false);
  const [adaptiveToast, setAdaptiveToast] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (activeTab === "chat") {
      scrollToBottom();
    }
  }, [messages, loadingChat, activeTab]);

  // Show adaptive toasts briefly
  const triggerToast = (msg: string) => {
    setAdaptiveToast(msg);
    setTimeout(() => {
      setAdaptiveToast(null);
    }, 4000);
  };

  // --- CHAT API ACTIONS ---
  const handleSendChat = async (textToSend?: string) => {
    const text = textToSend || userInput;
    if (!text.trim() || loadingChat) return;

    if (!textToSend) {
      setUserInput("");
    }

    const newUserMessage: Message = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date(),
    };

    const updatedMessages = [...messages, newUserMessage];
    setMessages(updatedMessages);
    setLoadingChat(true);

    if (onSaveChatMessage) {
      onSaveChatMessage(newUserMessage);
    }
    if (onIncrementAICount) {
      onIncrementAICount();
    }

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages,
          studyTopic,
          isHomework,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Server responded with error");
      }

      const data = await res.json();
      const newResponse: Message = {
        id: `msg-resp-${Date.now()}`,
        role: "assistant",
        content: data.content,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, newResponse]);
      if (onSaveChatMessage) {
        onSaveChatMessage(newResponse);
      }
    } catch (err: any) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-err-${Date.now()}`,
          role: "assistant",
          content: `⚠️ Sorry, I could not process that request. Error: ${err.message || "Failed to reach server"}. Ensure your Gemini API Key is configured in Secrets.`,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoadingChat(false);
    }
  };

  const handleRequestHint = () => {
    const nextHint = hintCount + 1;
    setHintCount(nextHint);

    let prompt = "";
    if (nextHint === 1) {
      prompt = "Can you give me Hint 1? I need a small hint on how to start solving this or the general formula.";
    } else if (nextHint === 2) {
      prompt = "Can you give me Hint 2? I am still trying to solve it, please explain the middle steps conceptually.";
    } else if (nextHint === 3) {
      prompt = "Can you give me Hint 3? I have attempted the steps and still cannot get it. Please guide me with a major hint or help me finish.";
    } else {
      prompt = "I have received multiple hints and I'm still completely stuck. Please show me the final correct answer and explain how to solve it so I can try the next one by myself!";
    }

    handleSendChat(prompt);
  };

  // --- WORK CHECKER ACTION ---
  const handleCheckWork = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!problemText.trim() || !userWorkText.trim() || checkingWork) return;

    setCheckingWork(true);
    setCheckerResponse(null);

    if (onIncrementAICount) {
      onIncrementAICount();
    }

    try {
      const res = await fetch("/api/check-work", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problem: problemText,
          userWork: userWorkText,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to check work");
      }

      const data = await res.json();
      setCheckerResponse(data.content);
    } catch (err: any) {
      console.error(err);
      setCheckerResponse(`⚠️ Check failed. Error: ${err.message || "Could not reach server"}. Ensure your Gemini API Key is configured.`);
    } finally {
      setCheckingWork(false);
    }
  };

  // --- TEST MODE ACTIONS ---
  const handleGeneratePracticeTest = async () => {
    setGeneratingTest(true);
    setTestQuestions([]);
    setSelectedAnswers({});
    setTestSubmitted(false);
    setTestScorePercent(null);
    setSavedTestResult(false);

    if (onIncrementAICount) {
      onIncrementAICount();
    }

    try {
      const res = await fetch("/api/generate-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: isHomework ? "Homework Topic" : "Study Session",
          topic: studyTopic,
          chatLog: messages.map((m) => ({ role: m.role, content: m.content }))
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to compile quiz model");
      }

      const quizData = await res.json();
      setTestQuestions(quizData);
    } catch (err: any) {
      console.error(err);
      triggerToast("⚠️ Practice test generation failed. Check your API key.");
    } finally {
      setGeneratingTest(false);
    }
  };

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    if (testSubmitted) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  const handleSubmitTest = () => {
    if (testQuestions.length === 0 || testSubmitted) return;

    let correct = 0;
    testQuestions.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctOptionIndex) {
        correct++;
      }
    });

    const percent = Math.round((correct / testQuestions.length) * 100);
    setTestScoreCorrect(correct);
    setTestScorePercent(percent);
    setTestSubmitted(true);
  };

  const handleSaveTestToAccount = () => {
    if (!onSaveTestScore || savedTestResult || !testSubmitted) return;

    onSaveTestScore({
      id: `score-${Date.now()}`,
      date: new Date().toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" }),
      topic: studyTopic,
      correct: testScoreCorrect,
      total: testQuestions.length,
      score: testScorePercent
    });

    setSavedTestResult(true);
    triggerToast("🏆 Diagnostic score saved successfully to your Account Portal!");
  };

  // --- FLASHCARDS API ACTIONS ---
  const handleGenerateFlashcards = async () => {
    setGeneratingFlashcards(true);
    setFlashcards([]);
    setFlippedCards({});
    setCurrentCardIdx(0);
    setSavedFlashcards(false);

    if (onIncrementAICount) {
      onIncrementAICount();
    }

    try {
      const res = await fetch("/api/generate-flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: isHomework ? "Homework Support" : "Cozy Study",
          topic: studyTopic,
          learningGoals,
          excludedThemes,
          preferredSubtopics
        }),
      });

      if (!res.ok) {
        throw new Error("Server failed to construct cards");
      }

      const cardData = await res.json();
      setFlashcards(cardData);
    } catch (err: any) {
      console.error(err);
      triggerToast("⚠️ Card generation failed. Ensure your Gemini API Key is configured.");
    } finally {
      setGeneratingFlashcards(false);
    }
  };

  const handleCardFlip = (cardId: string) => {
    setFlippedCards((prev) => ({
      ...prev,
      [cardId]: !prev[cardId]
    }));
  };

  const handleExcludeTheme = (card: any) => {
    const term = card.question.slice(0, 15).trim();
    if (term) {
      setExcludedThemes((prev) => [...prev, term]);
      triggerToast(`🚫 Theme containing "${term}..." has been blacklisted. Subsequent decks will exclude it!`);
    }

    // Filter card out of active array
    const updated = flashcards.filter((fc) => fc.id !== card.id);
    setFlashcards(updated);
    if (currentCardIdx >= updated.length && updated.length > 0) {
      setCurrentCardIdx(updated.length - 1);
    }
  };

  const handlePivotTheme = (card: any) => {
    const term = card.question.slice(0, 15).trim();
    if (term) {
      setPreferredSubtopics((prev) => [...prev, term]);
      triggerToast(`🎯 Subject Focus aligned to "${term}...". Subsequent card models will deepen this pivot!`);
    }
  };

  const handleApplyCustomGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customGoalInput.trim()) return;

    setLearningGoals(customGoalInput);
    setShowCustomGoalInput(false);
    triggerToast(`💡 Learning goal updated! Let's build a smart deck aligning with: "${customGoalInput}"`);
    handleGenerateFlashcards();
  };

  const handleSaveFlashcardsToAccount = () => {
    if (!onSaveFlashcards || savedFlashcards || flashcards.length === 0) return;

    onSaveFlashcards(flashcards);
    setSavedFlashcards(true);
    triggerToast("🔖 Flashcards stored successfully! You can review them in the Account Portal on the front page.");
  };

  const hasCommunicated = messages.some((m) => m.role === "user");

  return (
    <div id="ai-assistant-panel" className="w-full h-full flex flex-col bg-white/70 backdrop-blur-2xl border border-white/80 rounded-[2rem] overflow-hidden shadow-2xl shadow-slate-200/50 text-slate-800">
      
      {/* Header Tabs Navigation Grid */}
      <div className="grid grid-cols-4 bg-slate-100/50 border-b border-slate-200/50 p-1 flex-shrink-0">
        <button
          type="button"
          id="tab-ai-chat"
          onClick={() => setActiveTab("chat")}
          className={`flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 py-2.5 text-[10px] md:text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === "chat"
              ? "bg-white text-blue-700 border border-blue-100/80 shadow-sm"
              : "text-slate-500 hover:text-slate-800 hover:bg-white/30"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>AI Help</span>
        </button>
 
        <button
          type="button"
          id="tab-work-checker"
          onClick={() => setActiveTab("checker")}
          className={`flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 py-2.5 text-[10px] md:text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === "checker"
              ? "bg-white text-orange-700 border border-orange-100/80 shadow-sm"
              : "text-slate-500 hover:text-slate-800 hover:bg-white/30"
          }`}
        >
          <CheckCircle className="w-3.5 h-3.5 text-orange-600" />
          <span>Work Checker</span>
        </button>
 
        <button
          type="button"
          id="tab-diagnostic-test"
          onClick={() => {
            setActiveTab("test");
            if (hasCommunicated && testQuestions.length === 0 && !generatingTest) {
              handleGeneratePracticeTest();
            }
          }}
          className={`flex flex-col md:flex-row items-center justify-center gap-0.5 md:gap-1.5 py-2.5 text-[10px] md:text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === "test"
              ? "bg-white text-emerald-700 border border-emerald-100/80 shadow-sm"
              : "text-slate-500 hover:text-slate-800 hover:bg-white/30"
          }`}
        >
          <Award className="w-3.5 h-3.5 text-emerald-600" />
          <span>Diagnostic Test</span>
          {!hasCommunicated && <span className="text-[10px] ml-0.5 select-none" title="Talk to AI first to unlock">🔒</span>}
        </button>
 
        <button
          type="button"
          id="tab-adaptive-flashcards"
          onClick={() => {
            setActiveTab("flashcards");
            if (hasCommunicated && flashcards.length === 0 && !generatingFlashcards) {
              handleGenerateFlashcards();
            }
          }}
          className={`flex flex-col md:flex-row items-center justify-center gap-0.5 md:gap-1.5 py-2.5 text-[10px] md:text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === "flashcards"
              ? "bg-white text-purple-700 border border-purple-100/80 shadow-sm"
              : "text-slate-500 hover:text-slate-800 hover:bg-white/30"
          }`}
        >
          <Bookmark className="w-3.5 h-3.5 text-purple-600" />
          <span>Flashcards</span>
          {!hasCommunicated && <span className="text-[10px] ml-0.5 select-none" title="Talk to AI first to unlock">🔒</span>}
        </button>
      </div>

      {/* Main Workspace Frame */}
      <div className="flex-1 overflow-hidden p-4 relative flex flex-col">
        
        {/* Adaptive Toast Banner */}
        {adaptiveToast && (
          <div className="absolute top-4 left-4 right-4 bg-slate-900 text-white rounded-xl px-4 py-2.5 text-xs font-semibold shadow-2xl z-50 flex items-center gap-2 animate-fade-in">
            <Sparkles className="w-4 h-4 text-orange-400 animate-spin" />
            <span>{adaptiveToast}</span>
          </div>
        )}

        {/* TAB 1: CONCEPTUAL CHAT TUTOR */}
        {activeTab === "chat" && (
          <div className="h-full flex flex-col justify-between">
            <div className="flex-1 overflow-y-auto space-y-4 pr-1 mb-4 max-h-[300px]">
              {messages.map((m) => (
                <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] rounded-[1.5rem] px-4 py-3 text-xs leading-relaxed ${
                      m.role === "user"
                        ? "bg-blue-50 text-blue-950 border border-blue-100"
                        : "bg-white border border-slate-200 text-slate-700 shadow-sm"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <span className="text-[9px] font-bold tracking-wider uppercase text-slate-400">
                        {m.role === "user" ? "You" : "Homework AI"}
                      </span>
                    </div>
                    <div className="whitespace-pre-wrap leading-relaxed">{m.content}</div>
                  </div>
                </div>
              ))}
              {loadingChat && (
                <div className="flex justify-start">
                  <div className="bg-white border border-slate-200 text-slate-500 rounded-[1.5rem] px-4 py-3 text-xs flex items-center gap-2 shadow-sm">
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" />
                      <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:0.2s]" />
                      <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                    <span>Formulating conceptual guide...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Hint System Row */}
            <div className="pb-3 border-t border-slate-100 pt-3 mb-2.5 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
                <Lightbulb className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                <span>Stuck? Use Hint system:</span>
              </div>
              <button
                type="button"
                id="btn-request-hint"
                onClick={handleRequestHint}
                className="text-[11px] bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-all font-bold cursor-pointer"
              >
                <HintIcon className="w-3 h-3 text-amber-500" />
                {hintCount === 0
                  ? "Get Hint 1"
                  : hintCount === 1
                  ? "Get Hint 2"
                  : hintCount === 2
                  ? "Get Hint 3"
                  : "Reveal Answer"}
              </button>
            </div>

            {/* Message input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendChat();
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                id="input-ai-chat"
                placeholder="Ask a question or paste your homework problem..."
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                disabled={loadingChat}
                className="flex-1 bg-white/80 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs focus:outline-none focus:border-blue-500 transition-colors text-slate-800 disabled:opacity-50 shadow-sm"
              />
              <button
                type="submit"
                id="btn-send-chat"
                disabled={loadingChat}
                className="bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-bold px-4 rounded-2xl flex items-center justify-center transition-all cursor-pointer shadow-md"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* TAB 2: AI WORK CHECKER */}
        {activeTab === "checker" && (
          <div className="h-full flex flex-col justify-between overflow-y-auto max-h-[360px] pr-1">
            <div className="space-y-4">
              <div className="bg-orange-50/60 border border-orange-100/70 p-3.5 rounded-2xl flex gap-2.5 text-xs text-orange-900 leading-relaxed">
                <BookOpen className="w-5 h-5 text-orange-600 flex-shrink-0" />
                <div>
                  <span className="font-semibold block mb-0.5 text-orange-800">Rigorous Solution Checker</span>
                  Paste your assignment problem and your actual work. The AI will cross-verify each step. It is honest, strict, and will output "I do not know the answer to this scenario." if uncertain.
                </div>
              </div>

              <form onSubmit={handleCheckWork} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500">1. Problem / Question</label>
                  <textarea
                    id="input-checker-problem"
                    placeholder="e.g., Solve for x: 3x + 15 = 45"
                    rows={2}
                    value={problemText}
                    onChange={(e) => setProblemText(e.target.value)}
                    className="w-full bg-white/80 border border-slate-200 rounded-2xl p-3 text-xs focus:outline-none focus:border-orange-500 text-slate-800 shadow-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500">2. Your Work / Steps / Solution</label>
                  <textarea
                    id="input-checker-work"
                    placeholder="e.g., Subtract 15: 3x = 30. Divide by 3: x = 10."
                    rows={3}
                    value={userWorkText}
                    onChange={(e) => setUserWorkText(e.target.value)}
                    className="w-full bg-white/80 border border-slate-200 rounded-2xl p-3 text-xs focus:outline-none focus:border-orange-500 text-slate-800 shadow-sm"
                  />
                </div>

                <button
                  type="submit"
                  id="btn-submit-checker"
                  disabled={checkingWork || !problemText.trim() || !userWorkText.trim()}
                  className="w-full bg-orange-600 hover:bg-orange-500 disabled:opacity-40 text-white font-bold py-2.5 px-4 rounded-2xl flex items-center justify-center gap-2 transition-all text-xs cursor-pointer shadow-md"
                >
                  {checkingWork ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Analyzing solutions...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>Check My Solution</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {checkerResponse && (
              <div id="checker-response-card" className="mt-4 bg-white border border-slate-200/80 rounded-2xl p-4 space-y-2 shadow-lg">
                <div className="flex items-center gap-1.5">
                  {checkerResponse.toLowerCase().includes("correct") && !checkerResponse.toLowerCase().includes("incorrect") ? (
                    <div className="flex items-center gap-1 text-xs text-blue-700 font-bold bg-blue-50 border border-blue-100 px-2.5 py-0.5 rounded-full">
                      <CheckCircle className="w-3 h-3 text-blue-600" /> VERIFIED CORRECT
                    </div>
                  ) : checkerResponse.includes("do not know") ? (
                    <div className="flex items-center gap-1 text-xs text-slate-600 font-bold bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-full">
                      <HelpCircle className="w-3 h-3 text-slate-500" /> UNRESOLVED SCENARIO
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-xs text-rose-700 font-bold bg-rose-50 border border-rose-100 px-2.5 py-0.5 rounded-full">
                      <AlertCircle className="w-3 h-3 text-rose-600" /> STEP INCORRECT
                    </div>
                  )}
                </div>
                <div className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed max-h-[140px] overflow-y-auto">{checkerResponse}</div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: DIAGNOSTIC TEST MODE */}
        {activeTab === "test" && (
          <div className="h-full flex flex-col justify-between overflow-y-auto max-h-[360px] pr-1">
            {generatingTest ? (
              <div className="flex-1 flex flex-col items-center justify-center py-12 space-y-4">
                <RefreshCw className="w-10 h-10 text-emerald-600 animate-spin" />
                <p className="text-xs font-semibold text-slate-500 text-center animate-pulse">
                  Analyzing chat concepts and study topic...<br />
                  Assembling custom diagnostic exam.
                </p>
              </div>
            ) : !hasCommunicated ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-10 space-y-4 px-4">
                <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center animate-pulse">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div className="space-y-1 max-w-sm">
                  <h3 className="font-bold text-sm text-slate-800">Diagnostic Test Locked</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    You must first communicate with the AI in the <strong>AI Help</strong> chat about <strong>"{studyTopic}"</strong> before generating practice exams! Ask questions or provide details to begin.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab("chat")}
                  className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-md cursor-pointer"
                >
                  Go to AI Help Chat
                </button>
              </div>
            ) : testQuestions.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-10 space-y-4">
                <Award className="w-12 h-12 text-emerald-600" />
                <div className="space-y-1 max-w-sm">
                  <h3 className="font-bold text-sm text-slate-800">Generate Practice Exam</h3>
                  <p className="text-xs text-slate-500">
                    The AI will compile a 3-question conceptual exam based on "{studyTopic}" and any struggles detected in your chat history!
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleGeneratePracticeTest}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-5 py-2.5 rounded-2xl transition-all shadow-md cursor-pointer"
                >
                  Start Diagnostic Practice Test
                </button>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                    Diagnostic Quiz: 3 Questions
                  </div>
                  <button
                    type="button"
                    onClick={handleGeneratePracticeTest}
                    className="text-[10px] text-emerald-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" /> Start Over
                  </button>
                </div>

                <div className="space-y-4">
                  {testQuestions.map((q, idx) => {
                    const isCorrect = selectedAnswers[q.id] === q.correctOptionIndex;
                    return (
                      <div key={q.id} className="p-4 bg-white border border-slate-200/60 rounded-2xl shadow-sm space-y-3 text-left">
                        <div className="text-xs font-bold text-slate-800">
                          {idx + 1}. {q.question}
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                          {q.options.map((opt: string, optIdx: number) => {
                            const isSelected = selectedAnswers[q.id] === optIdx;
                            const isAnswerCorrectIndex = q.correctOptionIndex === optIdx;

                            let optClass = "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100";
                            if (isSelected) {
                              optClass = "bg-blue-50 border-blue-300 text-blue-900";
                            }
                            if (testSubmitted) {
                              if (isAnswerCorrectIndex) {
                                optClass = "bg-emerald-50 border-emerald-400 text-emerald-950 font-semibold";
                              } else if (isSelected && !isCorrect) {
                                optClass = "bg-rose-50 border-rose-400 text-rose-950";
                              } else {
                                optClass = "bg-slate-50 border-slate-100 text-slate-400 opacity-60";
                              }
                            }

                            return (
                              <button
                                key={optIdx}
                                type="button"
                                disabled={testSubmitted}
                                onClick={() => handleSelectOption(q.id, optIdx)}
                                className={`text-left text-xs px-3.5 py-2.5 border rounded-xl transition-all cursor-pointer ${optClass}`}
                              >
                                <span className="font-bold mr-1">{String.fromCharCode(65 + optIdx)}.</span> {opt}
                              </button>
                            );
                          })}
                        </div>

                        {testSubmitted && (
                          <div className="mt-2 pt-2 border-t border-slate-100 flex gap-2 text-[11px] text-slate-600 leading-relaxed bg-blue-50/20 p-2.5 rounded-xl">
                            <Lightbulb className="w-4 h-4 text-amber-500 flex-shrink-0" />
                            <div>
                              <span className="font-bold text-slate-800">Explanation:</span> {q.explanation}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Submit Row / Score Badge */}
                <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                  {testSubmitted ? (
                    <div className="flex items-center gap-3 w-full">
                      <div className="flex-1 flex items-center gap-2 p-3 bg-slate-100/80 rounded-2xl border border-slate-200">
                        <Award className="w-5 h-5 text-emerald-600" />
                        <div className="text-left text-xs">
                          <span className="font-bold block text-slate-800">Practice Score: {testScorePercent}%</span>
                          <span className="text-[10px] text-slate-500">{testScoreCorrect} out of {testQuestions.length} correct</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleSaveTestToAccount}
                        disabled={savedTestResult}
                        className={`px-4 py-2.5 text-xs font-bold rounded-xl shadow-md cursor-pointer transition-all flex items-center gap-1.5 ${
                          savedTestResult
                            ? "bg-slate-200 text-slate-500 cursor-default"
                            : "bg-emerald-600 hover:bg-emerald-500 text-white"
                        }`}
                      >
                        <Save className="w-4 h-4" />
                        <span>{savedTestResult ? "Saved" : "Save Score"}</span>
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSubmitTest}
                      disabled={Object.keys(selectedAnswers).length < testQuestions.length}
                      className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold py-2.5 rounded-2xl text-xs transition-all cursor-pointer shadow-md"
                    >
                      Submit Diagnostic Exam
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: ADAPTIVE FLASHCARDS */}
        {activeTab === "flashcards" && (
          <div className="h-full flex flex-col justify-between overflow-y-auto max-h-[360px] pr-1">
            {generatingFlashcards ? (
              <div className="flex-1 flex flex-col items-center justify-center py-12 space-y-4">
                <RefreshCw className="w-10 h-10 text-purple-600 animate-spin" />
                <p className="text-xs font-semibold text-slate-500 text-center animate-pulse">
                  Synthesizing flashcards for topic: "{studyTopic}"...<br />
                  Honoring excluded subtopics and preferred goals.
                </p>
              </div>
            ) : !hasCommunicated ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-10 space-y-4 px-4">
                <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center animate-pulse">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div className="space-y-1 max-w-sm">
                  <h3 className="font-bold text-sm text-slate-800">Flashcards Locked</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    You must first communicate with the AI in the <strong>AI Help</strong> chat about <strong>"{studyTopic}"</strong> before generating study flashcards! Chat or provide details first.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab("chat")}
                  className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-md cursor-pointer"
                >
                  Go to AI Help Chat
                </button>
              </div>
            ) : flashcards.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-10 space-y-4">
                <Bookmark className="w-12 h-12 text-purple-600 animate-pulse" />
                <div className="space-y-1 max-w-sm">
                  <h3 className="font-bold text-sm text-slate-800">Adaptive Flashcard deck</h3>
                  <p className="text-xs text-slate-500">
                    The AI will curate 4 robust Q&A cards. You can actively exclude unwanted subtopics or pivot focus on-the-fly!
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleGenerateFlashcards}
                  className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold px-5 py-2.5 rounded-2xl transition-all shadow-md cursor-pointer"
                >
                  Generate Flashcard Deck
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Active Constraints / Controls bar */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-2 flex-wrap gap-2">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                    Smart Flashcards ({currentCardIdx + 1}/{flashcards.length})
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowCustomGoalInput(!showCustomGoalInput)}
                      className="text-[10px] text-purple-700 bg-purple-50 hover:bg-purple-100 px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Settings className="w-3 h-3" /> Goal Setting
                    </button>
                    <button
                      type="button"
                      onClick={handleGenerateFlashcards}
                      className="text-[10px] text-slate-500 hover:text-slate-800 flex items-center gap-1 font-semibold cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" /> Redraw Deck
                    </button>
                  </div>
                </div>

                {/* Custom Goal Input Sub-pane */}
                {showCustomGoalInput && (
                  <form onSubmit={handleApplyCustomGoal} className="bg-purple-50 p-3 rounded-2xl border border-purple-100 space-y-2 text-left animate-fade-in">
                    <label className="text-[9px] uppercase font-bold text-purple-700 tracking-wider">State What You Are Learning (AI adapts dynamically)</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g., Focus more on historical dates, explain simply..."
                        value={customGoalInput}
                        onChange={(e) => setCustomGoalInput(e.target.value)}
                        className="flex-1 bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none"
                      />
                      <button
                        type="submit"
                        className="bg-purple-700 hover:bg-purple-600 text-white font-bold px-3 py-1 text-xs rounded-xl cursor-pointer"
                      >
                        Apply
                      </button>
                    </div>
                  </form>
                )}

                {/* 3D Interactive Card Block */}
                {flashcards[currentCardIdx] && (
                  <div className="space-y-3">
                    <div
                      onClick={() => handleCardFlip(flashcards[currentCardIdx].id)}
                      className="min-h-[140px] bg-slate-50 border border-slate-200/80 rounded-3xl p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-all hover:scale-[1.01] hover:border-purple-300 shadow-sm relative overflow-hidden"
                    >
                      <div className="absolute top-2.5 right-3 text-[9px] uppercase font-bold text-slate-400 select-none">
                        Tap to flip <Eye className="w-3 h-3 inline-block ml-0.5" />
                      </div>

                      {!flippedCards[flashcards[currentCardIdx].id] ? (
                        <div className="space-y-2">
                          <span className="text-[9px] uppercase font-bold text-purple-600 tracking-wider">Concept Question</span>
                          <div className="text-xs md:text-sm font-bold text-slate-800 px-4">
                            {flashcards[currentCardIdx].question}
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <span className="text-[9px] uppercase font-bold text-emerald-600 tracking-wider">AI Explanation / Answer</span>
                          <div className="text-xs text-slate-700 leading-relaxed px-4">
                            {flashcards[currentCardIdx].answer}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Navigation Carousel row */}
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        disabled={currentCardIdx === 0}
                        onClick={() => {
                          setCurrentCardIdx((prev) => prev - 1);
                        }}
                        className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 disabled:opacity-40 flex items-center justify-center text-slate-600 cursor-pointer"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>

                      <div className="text-[11px] font-mono font-bold text-slate-400">
                        Card {currentCardIdx + 1} of {flashcards.length}
                      </div>

                      <button
                        type="button"
                        disabled={currentCardIdx === flashcards.length - 1}
                        onClick={() => {
                          setCurrentCardIdx((prev) => prev + 1);
                        }}
                        className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 disabled:opacity-40 flex items-center justify-center text-slate-600 cursor-pointer"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Feedback & Constraint Adaptation Buttons */}
                    <div className="pt-3 border-t border-slate-100 space-y-2">
                      <div className="text-[9px] uppercase font-bold text-slate-400 text-left">
                        Adapt AI Generation Constraints
                      </div>
                      <div className="flex gap-2 w-full">
                        <button
                          type="button"
                          onClick={() => handleExcludeTheme(flashcards[currentCardIdx])}
                          className="flex-1 flex items-center justify-center gap-1 py-1.5 border border-rose-200 hover:bg-rose-50 rounded-xl text-[10px] font-bold text-rose-700 transition-colors cursor-pointer"
                          title="Blacklist this subtopic from subsequent decks"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Not Related to Topic
                        </button>
                        <button
                          type="button"
                          onClick={() => handlePivotTheme(flashcards[currentCardIdx])}
                          className="flex-1 flex items-center justify-center gap-1 py-1.5 border border-purple-200 hover:bg-purple-50 rounded-xl text-[10px] font-bold text-purple-700 transition-colors cursor-pointer"
                          title="Direct the AI to focus more deeply on this concept"
                        >
                          <Sliders className="w-3.5 h-3.5" /> Relate to Topic
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Save Flashcards trigger */}
                <div className="pt-2 border-t border-slate-100 flex justify-end">
                  <button
                    type="button"
                    onClick={handleSaveFlashcardsToAccount}
                    disabled={savedFlashcards}
                    className={`px-4 py-2 text-xs font-bold rounded-xl shadow-sm cursor-pointer transition-all flex items-center gap-1.5 ${
                      savedFlashcards
                        ? "bg-slate-200 text-slate-500 cursor-default"
                        : "bg-purple-700 hover:bg-purple-600 text-white"
                    }`}
                  >
                    <Save className="w-4 h-4" />
                    <span>{savedFlashcards ? "Saved" : "Save Deck to Account"}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
