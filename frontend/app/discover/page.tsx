"use client";

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Sparkles, BookOpen, X } from "lucide-react";
import { api } from "@/lib/api";
import BookCard from "@/components/ui/BookCard";
import GridSkeleton from "@/components/ui/LoadingSkeleton";
import type { BookRecommendation, Book } from "@/types";

const METHODS = [
  { value: "hybrid",        label: "Hybrid AI",      desc: "CF + Content" },
  { value: "collaborative", label: "Collaborative",   desc: "Similar readers" },
  { value: "content",       label: "Content-Based",   desc: "TF-IDF semantic" },
  { value: "popular",       label: "Popular",         desc: "Top rated" },
] as const;

type Method = typeof METHODS[number]["value"];

export default function DiscoverPage() {
  const [query,    setQuery]    = useState("");
  const [results,  setResults]  = useState<Book[]>([]);
  const [selected, setSelected] = useState<Book | null>(null);
  const [method,   setMethod]   = useState<Method>("hybrid");
  const [recs,     setRecs]     = useState<BookRecommendation[]>([]);
  const [loading,  setLoading]  = useState(false);
  const [showDrop, setShowDrop] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const searchBooks = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); setShowDrop(false); return; }
    try {
      const data = await api.books(q, 8);
      setResults(data.books);
      setShowDrop(true);
    } catch {
      setResults([]);
    }
  }, []);

  const handleInput = (val: string) => {
    setQuery(val);
    if (!val.trim()) { setSelected(null); setResults([]); setShowDrop(false); }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchBooks(val), 320);
  };

  const selectBook = async (book: Book) => {
    setSelected(book);
    setQuery(book.title);
    setShowDrop(false);
    setResults([]);
    await fetchRecs(book.isbn, method);
  };

  const fetchRecs = async (isbn: string, m: string) => {
    setLoading(true);
    setRecs([]);
    try {
      const data = await api.recommend({ isbn, method: m as Method, n: 12 });
      setRecs(data.recommendations);
    } catch {
      setRecs([]);
    } finally {
      setLoading(false);
    }
  };

  const changeMethod = (m: Method) => {
    setMethod(m);
    if (selected) fetchRecs(selected.isbn, m);
  };

  const clear = () => {
    setSelected(null);
    setQuery("");
    setRecs([]);
    setResults([]);
    setShowDrop(false);
  };

  return (
    <div className="min-h-screen pt-24 pb-20 px-6 md:px-12 xl:px-20">
      {/* BG */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 50% -5%, rgba(124,58,237,0.18) 0%, transparent 70%)",
        }}
      />

      <div className="max-w-[1280px] mx-auto relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-violet-500/20 text-xs text-violet-300 mb-5">
            <Sparkles className="w-3 h-3" />
            Smart Recommendation Engine
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Discover Your Next<br />
            <span className="gradient-text">Great Read</span>
          </h1>
          <p className="text-slate-400 max-w-xl mx-auto">
            Search a book you love and let our AI find semantically similar titles.
          </p>
        </motion.div>

        {/* Search bar */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative max-w-2xl mx-auto mb-8"
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none" />
            <input
              value={query}
              onChange={(e) => handleInput(e.target.value)}
              onFocus={() => results.length > 0 && setShowDrop(true)}
              onBlur={() => setTimeout(() => setShowDrop(false), 200)}
              placeholder="Search for a book title or author…"
              className="w-full pl-11 pr-12 py-4 rounded-2xl glass-strong text-slate-100 placeholder-slate-600 text-sm border border-white/10 focus:border-violet-500/40 transition-colors"
            />
            {(query || selected) && (
              <button
                onClick={clear}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Results dropdown */}
          <AnimatePresence>
            {showDrop && results.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.98 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full mt-2 inset-x-0 glass-strong rounded-2xl border border-white/10 overflow-hidden z-50"
                style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.6)" }}
              >
                {results.map((book) => (
                  <button
                    key={book.isbn}
                    onMouseDown={() => selectBook(book)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/[0.05] transition-colors text-left border-b border-white/[0.04] last:border-0"
                  >
                    <div className="w-8 h-10 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-500 flex items-center justify-center shrink-0">
                      <BookOpen className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-slate-100 truncate">{book.title}</div>
                      <div className="text-xs text-slate-500 truncate">{book.author}</div>
                    </div>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Method selector */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="flex flex-wrap justify-center gap-2 mb-10"
        >
          {METHODS.map((m) => (
            <button
              key={m.value}
              onClick={() => changeMethod(m.value)}
              className={`flex flex-col items-center px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                method === m.value
                  ? "bg-gradient-to-r from-violet-600 to-indigo-500 text-white shadow-[0_0_20px_rgba(124,58,237,0.35)]"
                  : "glass text-slate-400 hover:text-slate-200 border border-white/[0.06]"
              }`}
            >
              <span>{m.label}</span>
              <span
                className={`text-xs mt-0.5 ${
                  method === m.value ? "text-violet-200" : "text-slate-600"
                }`}
              >
                {m.desc}
              </span>
            </button>
          ))}
        </motion.div>

        {/* Selected indicator */}
        <AnimatePresence>
          {selected && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="flex items-center justify-center gap-2 mb-8 text-sm"
            >
              <div className="flex items-center gap-2 px-4 py-2 rounded-full glass border border-violet-500/20 text-violet-300">
                <Sparkles className="w-3.5 h-3.5 shrink-0" />
                <span>
                  Showing recommendations for&nbsp;
                  <span className="font-semibold text-white">&ldquo;{selected.title}&rdquo;</span>
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        {loading && <GridSkeleton count={9} />}

        {!loading && recs.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-slate-200">
                {recs.length} Recommendations
              </h2>
              <span className="text-xs text-slate-600 glass px-3 py-1 rounded-full border border-white/[0.06]">
                {METHODS.find((m) => m.value === method)?.label}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {recs.map((rec, i) => (
                <BookCard key={rec.isbn} book={rec} index={i} />
              ))}
            </div>
          </motion.div>
        )}

        {/* Empty state */}
        {!loading && recs.length === 0 && !selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-violet-600/20 to-indigo-500/20 flex items-center justify-center mx-auto mb-5 border border-violet-500/20">
              <BookOpen className="w-9 h-9 text-violet-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-300 mb-2">Search for a book</h3>
            <p className="text-slate-600 max-w-xs mx-auto text-sm">
              Type any book title or author name above to get AI-powered recommendations.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
