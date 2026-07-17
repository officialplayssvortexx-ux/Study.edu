import React, { useState } from "react";
import { MessageSquare, Send, CheckCircle2, AlertCircle, X } from "lucide-react";

interface SuggestionModalProps {
  userEmail: string;
}

export default function SuggestionModal({ userEmail }: SuggestionModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [suggestion, setSuggestion] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!suggestion.trim() || status === "submitting") return;

    setStatus("submitting");
    setErrorMessage("");

    try {
      const res = await fetch("/api/suggestion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          suggestion: suggestion.trim(),
          userEmail,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit suggestion");
      }

      setStatus("success");
      setSuggestion("");
      setTimeout(() => {
        setStatus("idle");
        setIsOpen(false);
      }, 2500);
    } catch (err: any) {
      console.error(err);
      setStatus("error");
      setErrorMessage(err.message || "Failed to transmit suggestion. Ensure API server is active.");
    }
  };

  return (
    <div id="suggestion-widget-root">
      {/* Trigger floating button */}
      <button
        type="button"
        id="btn-suggestion-trigger"
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 bg-white/80 hover:bg-slate-50 backdrop-blur-md border border-slate-200 text-slate-700 hover:text-slate-900 text-xs py-2.5 px-4 rounded-2xl shadow-md transition-all cursor-pointer font-medium"
      >
        <MessageSquare className="w-4 h-4 text-emerald-600" />
        <span>Submit Suggestion</span>
      </button>

      {/* Suggestion Modal window */}
      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div
            id="suggestion-modal-card"
            className="w-full max-w-md bg-white/95 border border-white rounded-3xl shadow-2xl shadow-slate-200/50 overflow-hidden text-slate-800 p-6 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-emerald-700" />
                <h3 className="font-bold text-sm">Submit Feature Suggestion</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {status === "success" ? (
              <div className="text-center py-6 space-y-3">
                <div className="w-12 h-12 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-emerald-800">Suggestion Transmitted!</h4>
                  <p className="text-xs text-slate-500 mt-1">Thank you. Your feedback was posted directly to our Discord server.</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Your Feature suggestion</label>
                  <textarea
                    id="input-suggestion-box"
                    placeholder="Enter your suggestions or bug reports here... How can we make the Study Portal better?"
                    rows={4}
                    value={suggestion}
                    onChange={(e) => setSuggestion(e.target.value)}
                    required
                    className="w-full bg-white border border-slate-200 rounded-2xl p-3 text-xs focus:outline-none focus:border-emerald-500 text-slate-800 resize-none shadow-sm"
                  />
                </div>

                {status === "error" && (
                  <div className="bg-rose-50 border border-rose-100 text-rose-700 text-xs p-3 rounded-2xl flex gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    id="btn-suggestion-submit"
                    disabled={status === "submitting" || !suggestion.trim()}
                    className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold px-4 py-2 rounded-2xl text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                  >
                    {status === "submitting" ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Transmitting...
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" /> Submit Suggestion
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
