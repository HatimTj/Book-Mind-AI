"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Heart, BookOpen, Plus, X, Sparkles, Brain,
  Sun, Moon, Coffee, Flame, Leaf,
} from "lucide-react";
import { api } from "@/lib/api";
import BookCard from "@/components/ui/BookCard";
import GridSkeleton from "@/components/ui/LoadingSkeleton";
import type { BookRecommendation, Book } from "@/types";

const GENRES = [
  "Fiction", "Science Fiction", "Fantasy", "Mystery", "Thriller",
  "Biography", "History", "Self-Help", "Romance", "Horror",
  "Classic Literature", "Business", "Philosophy", "Travel",
];

const MOODS = [
  { label: "Adventurous",  icon: Flame,   color: "from-orange-500 to-red-500" },
  { label: "Reflective",   icon: Moon,    color: "from-blue-500 to-indigo-500" },
  { label: "Uplifting",    icon: Sun,     color: "from-yellow-400 to-orange-400" },
  { label: "Cozy",         icon: Coffee,  color: "from-amber-500 to-yellow-500" },
  { label: "Dark",         icon: Moon,    color: "from-purple-700 to-slate-600" },
  { label: "Intellectual", icon: Brain,   color: "from-teal-500 to-cyan-500" },
  { label: "Romantic",     icon: Heart,   color: "from-pink-500 to-rose-500" },
  { label: "Nature",       icon: Leaf,    color: "from-green-500 to-emerald-500" },
];

export default function ProfilePage() {
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [authorInput, setAuthorInput]       = useState("");
  const [authors, setAuthors]               = useState<string[]>([]);
  const [bookInput, setBookInput]           = useState("");
  const [bookResults, setBookResults]       = useState<Book[]>([]);
  const [likedBooks, setLikedBooks]         = useState<Book[]>([]);
  const [mood, setMood]                     = useState("");
  const [recs, setRecs]                     = useState<BookRecommendation[]>([]);
  const [loading, setLoading]               = useState(false);
  const [generated, setGenerated]           = useState(false);

  const toggleGenre = (g: string) =>
    setSelectedGenres((prev) =>
      prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]
    );

  const addAuthor = () => {
    const a = authorInput.trim();
    if (a && !authors.includes(a)) setAuthors((p) => [...p, a]);
    setAuthorInput("");
  };

  const searchBook = async (q: string) => {
    setBookInput(q);
    if (!q.trim()) { setBookResults([]); return; }
    try {
      const data = await api.books(q, 5);
      setBookResults(data.books);
    } catch {
      setBookResults([]);
    }
  };

  const likeBook = (book: Book) => {
    if (!likedBooks.find((b) => b.isbn === book.isbn))
      setLikedBooks((p) => [...p, book]);
    setBookInput("");
    setBookResults([]);
  };

  const generate = async () => {
    setLoading(true);
    setGenerated(false);
    try {
      const data = await api.profileRecommend({
        genres: selectedGenres,
        authors,
        liked_isbns: likedBooks.map((b) => b.isbn),
        mood,
        n: 12,
      });
      setRecs(data.recommendations);
      setGenerated(true);
    } catch {
      setRecs([]);
    } finally {
      setLoading(false);
    }
  };

  const hasInput =
    selectedGenres.length > 0 || authors.length > 0 || likedBooks.length > 0;

  return (
    <div className="min-h-screen pt-24 pb-20 px-6 md:px-12 xl:px-20">
      {/* BG */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 50% 40% at 20% -5%, rgba(236,72,153,0.14) 0%, transparent 70%)",
        }}
      />

      <div className="max-w-[1280px] mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center mx-auto mb-5 shadow-[0_0_32px_rgba(236,72,153,0.35)]">
            <User className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-3">
            Your Reader <span className="gradient-text-warm">Profile</span>
          </h1>
          <p className="text-slate-400 max-w-md mx-auto">
            Tell us what you love and get hyper-personalized recommendations.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT — Config panels */}
          <div className="lg:col-span-2 space-y-5">
            {/* Genres */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="glass rounded-2xl p-6"
            >
              <h2 className="font-semibold text-slate-200 mb-4 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-violet-400" />
                Favorite Genres
              </h2>
              <div className="flex flex-wrap gap-2">
                {GENRES.map((g) => (
                  <button
                    key={g}
                    onClick={() => toggleGenre(g)}
                    className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      selectedGenres.includes(g)
                        ? "bg-violet-600 text-white shadow-[0_0_12px_rgba(124,58,237,0.4)]"
                        : "glass border border-white/[0.06] text-slate-400 hover:text-slate-200 hover:border-white/10"
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Mood */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass rounded-2xl p-6"
            >
              <h2 className="font-semibold text-slate-200 mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-yellow-400" />
                Reading Mood
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {MOODS.map(({ label, icon: Icon, color }) => (
                  <button
                    key={label}
                    onClick={() => setMood(mood === label ? "" : label)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      mood === label
                        ? `bg-gradient-to-r ${color} text-white shadow-lg`
                        : "glass border border-white/[0.06] text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{label}</span>
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Authors */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="glass rounded-2xl p-6"
            >
              <h2 className="font-semibold text-slate-200 mb-4 flex items-center gap-2">
                <User className="w-4 h-4 text-cyan-400" />
                Favorite Authors
              </h2>
              <div className="flex gap-2 mb-3">
                <input
                  value={authorInput}
                  onChange={(e) => setAuthorInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addAuthor()}
                  placeholder="Author name…"
                  className="flex-1 px-4 py-2.5 rounded-xl glass border border-white/10 text-sm text-slate-100 placeholder-slate-600 focus:border-cyan-500/40 transition-colors"
                />
                <button
                  onClick={addAuthor}
                  className="px-4 py-2.5 rounded-xl bg-cyan-600/30 text-cyan-400 border border-cyan-500/20 hover:bg-cyan-600/40 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              {authors.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {authors.map((a) => (
                    <span
                      key={a}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-full glass border border-cyan-500/20 text-cyan-300 text-sm"
                    >
                      {a}
                      <button onClick={() => setAuthors((p) => p.filter((x) => x !== a))}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Liked books */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass rounded-2xl p-6"
            >
              <h2 className="font-semibold text-slate-200 mb-4 flex items-center gap-2">
                <Heart className="w-4 h-4 text-pink-400" />
                Books I Loved
              </h2>
              <div className="relative mb-3">
                <input
                  value={bookInput}
                  onChange={(e) => searchBook(e.target.value)}
                  onBlur={() => setTimeout(() => setBookResults([]), 200)}
                  placeholder="Search a book you loved…"
                  className="w-full px-4 py-2.5 rounded-xl glass border border-white/10 text-sm text-slate-100 placeholder-slate-600 focus:border-pink-500/40 transition-colors"
                />
                <AnimatePresence>
                  {bookResults.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="absolute top-full mt-2 inset-x-0 glass-strong rounded-xl border border-white/10 overflow-hidden z-30"
                      style={{ boxShadow: "0 16px 48px rgba(0,0,0,0.5)" }}
                    >
                      {bookResults.map((b) => (
                        <button
                          key={b.isbn}
                          onMouseDown={() => likeBook(b)}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/[0.05] text-left border-b border-white/[0.04] last:border-0"
                        >
                          <Heart className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                          <div className="min-w-0">
                            <div className="text-sm text-slate-200 truncate">{b.title}</div>
                            <div className="text-xs text-slate-500 truncate">{b.author}</div>
                          </div>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              {likedBooks.length > 0 && (
                <div className="space-y-2">
                  {likedBooks.map((b) => (
                    <div
                      key={b.isbn}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-pink-500/[0.08] border border-pink-500/20"
                    >
                      <Heart className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-slate-200 truncate">{b.title}</div>
                        <div className="text-xs text-slate-500 truncate">{b.author}</div>
                      </div>
                      <button
                        onClick={() =>
                          setLikedBooks((p) => p.filter((x) => x.isbn !== b.isbn))
                        }
                        className="text-slate-600 hover:text-slate-400 shrink-0"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>

          {/* RIGHT — Summary card */}
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="glass rounded-2xl p-6 sticky top-24"
              style={{
                background:
                  "linear-gradient(135deg, rgba(236,72,153,0.08) 0%, rgba(124,58,237,0.06) 100%)",
              }}
            >
              <h3 className="font-semibold text-slate-200 mb-5">Profile Summary</h3>
              <div className="space-y-3 mb-6">
                {[
                  { label: "Genres selected", count: selectedGenres.length, color: "text-violet-400" },
                  { label: "Authors added",   count: authors.length,        color: "text-cyan-400" },
                  { label: "Books liked",     count: likedBooks.length,     color: "text-pink-400" },
                  { label: "Mood set",        count: mood ? 1 : 0,          color: "text-yellow-400" },
                ].map(({ label, count, color }) => (
                  <div key={label} className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">{label}</span>
                    <span className={`text-sm font-bold ${color}`}>{count}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={generate}
                disabled={!hasInput || loading}
                className={`w-full py-3 rounded-xl font-semibold text-sm transition-all ${
                  hasInput && !loading
                    ? "bg-gradient-to-r from-pink-500 to-violet-600 text-white shadow-[0_0_24px_rgba(236,72,153,0.35)] hover:shadow-[0_0_36px_rgba(236,72,153,0.5)]"
                    : "bg-white/[0.05] text-slate-600 cursor-not-allowed"
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Analyzing…
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Brain className="w-4 h-4" />
                    Generate Profile Recs
                  </span>
                )}
              </button>

              <p className="text-xs text-slate-600 mt-4 leading-relaxed">
                <span className="text-violet-400 font-medium">Tip:</span> More books you add → more
                personalized your recommendations become.
              </p>
            </motion.div>
          </div>
        </div>

        {/* Results */}
        <AnimatePresence>
          {(loading || generated) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-12"
            >
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-pink-400" />
                Your Personalized Picks
              </h2>
              {loading ? (
                <GridSkeleton count={9} />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recs.map((rec, i) => (
                    <BookCard key={rec.isbn} book={rec} index={i} />
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
