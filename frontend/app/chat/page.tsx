"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, Sparkles, BookOpen, MessageSquare, RotateCcw } from "lucide-react";
import { api } from "@/lib/api";
import type { BookRecommendation } from "@/types";

const STARTERS = [
  "What should I read if I loved Atomic Habits and Deep Work?",
  "Recommend me a gripping thriller like Gone Girl.",
  "I want something like Dune but more philosophical.",
  "Best science fiction books from the last decade?",
  "Books that changed people's lives — not just bestsellers.",
];

interface Message {
  role: "user" | "assistant";
  content: string;
  recs?: BookRecommendation[];
}

const COVER_COLORS = [
  "from-violet-600 to-indigo-500",
  "from-indigo-500 to-cyan-500",
  "from-pink-500 to-rose-500",
  "from-emerald-500 to-teal-500",
];

function RecMini({ rec, i }: { rec: BookRecommendation; i: number }) {
  const color = COVER_COLORS[i % COVER_COLORS.length];
  return (
    <a
      href={`/books/${rec.isbn}`}
      className="flex items-center gap-3 p-3 rounded-xl glass border border-white/[0.06] hover:border-violet-500/20 transition-colors group"
    >
      <div
        className={`w-9 h-12 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center shrink-0`}
      >
        <BookOpen className="w-4 h-4 text-white" />
      </div>
      <div className="min-w-0">
        <div className="text-xs font-semibold text-slate-200 truncate group-hover:text-white">
          {rec.title}
        </div>
        <div className="text-xs text-slate-500 truncate">{rec.author}</div>
        <div className="text-xs text-violet-400 mt-0.5">{Math.round(rec.score * 100)}% match</div>
      </div>
    </a>
  );
}

function BubbleUser({ content }: { content: string }) {
  return (
    <div className="flex justify-end">
      <div className="flex items-end gap-2 max-w-xl">
        <div
          className="px-4 py-3 rounded-2xl rounded-br-sm text-sm text-white leading-relaxed"
          style={{ background: "linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)" }}
        >
          {content}
        </div>
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-indigo-500 flex items-center justify-center shrink-0 mb-1">
          <User className="w-4 h-4 text-white" />
        </div>
      </div>
    </div>
  );
}

function BubbleAI({ content, recs }: { content: string; recs?: BookRecommendation[] }) {
  return (
    <div className="flex gap-3 max-w-2xl">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center shrink-0 mt-1 shadow-[0_0_12px_rgba(6,182,212,0.4)]">
        <Bot className="w-4 h-4 text-white" />
      </div>
      <div className="flex-1 space-y-3">
        <div className="glass rounded-2xl rounded-tl-sm px-4 py-3 text-sm text-slate-200 leading-relaxed border border-white/[0.06]">
          {content}
        </div>
        {recs && recs.length > 0 && (
          <div>
            <p className="text-xs text-slate-600 mb-2 ml-1">Suggested reads:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {recs.slice(0, 4).map((rec, i) => (
                <RecMini key={rec.isbn} rec={rec} i={i} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex gap-3">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center shrink-0 mt-1">
        <Bot className="w-4 h-4 text-white" />
      </div>
      <div className="glass rounded-2xl rounded-tl-sm px-5 py-4 border border-white/[0.06]">
        <div className="flex gap-1.5 items-center">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-violet-400"
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 0.7, delay: i * 0.15, repeat: Infinity }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = async (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;

    const userMsg: Message = { role: "user", content: msg };
    setMessages((p) => [...p, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const history = messages.map(({ role, content }) => ({ role, content }));
      const data = await api.chat({ message: msg, history });
      setMessages((p) => [
        ...p,
        { role: "assistant", content: data.response, recs: data.recommendations },
      ]);
    } catch {
      setMessages((p) => [
        ...p,
        {
          role: "assistant",
          content: "Sorry, I couldn't connect to the backend. Make sure it's running on port 8001.",
        },
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const reset = () => {
    setMessages([]);
    setInput("");
  };

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    /* Full-height container accounting for fixed navbar (h-16 = 64px) */
    <div
      className="flex flex-col overflow-hidden"
      style={{ height: "calc(100vh - 64px)", marginTop: "64px" }}
    >
      {/* BG glow */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% -5%, rgba(6,182,212,0.12) 0%, transparent 70%)",
        }}
      />

      {/* Chat header */}
      <div className="border-b border-white/[0.06] px-4 py-4 glass-strong relative z-10 shrink-0">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center shadow-[0_0_16px_rgba(6,182,212,0.4)]">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-100">AI Librarian</div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Powered by Claude AI
              </div>
            </div>
          </div>
          {messages.length > 0 && (
            <button
              onClick={reset}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass border border-white/[0.06] text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              <RotateCcw className="w-3 h-3" /> Clear
            </button>
          )}
        </div>
      </div>

      {/* Messages scroll area */}
      <div className="flex-1 overflow-y-auto relative">
        <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
          {/* Empty state */}
          {messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <div
                className="w-20 h-20 rounded-3xl bg-gradient-to-br from-cyan-500/20 to-violet-600/20 flex items-center justify-center mx-auto mb-5 border border-cyan-500/20"
                style={{ boxShadow: "0 0 40px rgba(6,182,212,0.1)" }}
              >
                <MessageSquare className="w-9 h-9 text-cyan-400" />
              </div>
              <h2 className="text-2xl font-bold mb-2">
                Ask your <span className="gradient-text">AI Librarian</span>
              </h2>
              <p className="text-slate-500 text-sm mb-8 max-w-sm mx-auto">
                Get personalized book recommendations in natural language.
              </p>
              <div className="space-y-2 max-w-lg mx-auto text-left">
                {STARTERS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="w-full text-left px-4 py-3 rounded-xl glass border border-white/[0.06] text-sm text-slate-400 hover:text-slate-200 hover:border-violet-500/20 transition-all"
                  >
                    <Sparkles className="w-3.5 h-3.5 inline-block text-violet-400 mr-2" />
                    {s}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Message bubbles */}
          <AnimatePresence mode="popLayout">
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {msg.role === "user" ? (
                  <BubbleUser content={msg.content} />
                ) : (
                  <BubbleAI content={msg.content} recs={msg.recs} />
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {loading && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <TypingIndicator />
            </motion.div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input bar — sticks to the bottom */}
      <div className="border-t border-white/[0.06] glass-strong px-4 py-4 shrink-0">
        <div className="max-w-3xl mx-auto">
          <div className="flex gap-3 items-end">
            <div className="flex-1 glass-strong rounded-2xl border border-white/10 focus-within:border-violet-500/40 transition-colors p-3">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Ask about books… (Enter to send, Shift+Enter for newline)"
                rows={1}
                style={{ outline: "none", resize: "none" }}
                className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-600 max-h-32 leading-relaxed"
              />
            </div>
            <button
              onClick={() => send()}
              disabled={!input.trim() || loading}
              className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                input.trim() && !loading
                  ? "bg-gradient-to-br from-violet-600 to-indigo-500 text-white shadow-[0_0_20px_rgba(124,58,237,0.4)] hover:shadow-[0_0_30px_rgba(124,58,237,0.6)]"
                  : "bg-white/[0.05] text-slate-600 cursor-not-allowed"
              }`}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-slate-700 mt-2 text-center">
            Powered by Claude Sonnet — responses use your book database
          </p>
        </div>
      </div>
    </div>
  );
}
