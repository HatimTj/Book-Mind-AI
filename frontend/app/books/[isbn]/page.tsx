"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft, BookOpen, User, Calendar, Building2, Sparkles,
} from "lucide-react";
import { api } from "@/lib/api";
import BookCard from "@/components/ui/BookCard";
import { BookCardSkeleton, TextSkeleton } from "@/components/ui/LoadingSkeleton";
import type { Book, BookRecommendation } from "@/types";

const COVER_COLORS: [string, string][] = [
  ["#7c3aed", "#4f46e5"],
  ["#4f46e5", "#06b6d4"],
  ["#ec4899", "#f43f5e"],
  ["#10b981", "#14b8a6"],
  ["#f59e0b", "#f97316"],
  ["#8b5cf6", "#ec4899"],
];

function coverColor(isbn: string): [string, string] {
  const idx = (isbn.charCodeAt(0) ?? 0) % COVER_COLORS.length;
  return COVER_COLORS[idx];
}

function getInitials(title: string): string {
  return title
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export default function BookDetailPage() {
  const { isbn } = useParams<{ isbn: string }>();
  const [book, setBook] = useState<Book | null>(null);
  const [recs, setRecs] = useState<BookRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isbn) return;
    setLoading(true);
    api
      .book(isbn)
      .then(({ book, recommendations }) => {
        setBook(book);
        setRecs(recommendations);
      })
      .catch(() => setError("Book not found or backend unavailable."))
      .finally(() => setLoading(false));
  }, [isbn]);

  const [c1, c2] = book ? coverColor(book.isbn) : ["#7c3aed", "#4f46e5"];
  const initials = book ? getInitials(book.title) : "";

  return (
    <div className="min-h-screen pt-24 pb-20 px-6 md:px-12 xl:px-20">
      {/* BG glow tied to book color */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 60% 50% at 30% -10%, ${c1}22 0%, transparent 70%)`,
        }}
      />

      <div className="max-w-[1280px] mx-auto">
        <Link
          href="/discover"
          className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-300 text-sm mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Discover
        </Link>

        {error && (
          <div className="glass rounded-2xl p-8 text-center border border-red-500/20">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="glass rounded-3xl p-8 mb-8">
            <div className="flex gap-8">
              <div className="w-40 h-56 rounded-2xl shimmer-bg shrink-0" />
              <div className="flex-1 space-y-4 pt-2">
                <div className="h-8 rounded shimmer-bg w-3/4" />
                <div className="h-5 rounded shimmer-bg w-1/2" />
                <TextSkeleton lines={4} />
              </div>
            </div>
          </div>
        )}

        {/* Book detail */}
        {book && !loading && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div
              className="glass rounded-3xl p-8 mb-10 border border-white/[0.06]"
              style={{
                boxShadow: `0 0 80px ${c1}18, 0 4px 32px rgba(0,0,0,0.4)`,
              }}
            >
              <div className="flex flex-col md:flex-row gap-8">
                {/* Cover art */}
                <div className="shrink-0 flex flex-col items-center md:items-start gap-4">
                  <div
                    className="w-36 h-52 md:w-44 md:h-64 rounded-2xl flex items-center justify-center text-white text-3xl font-black shadow-2xl"
                    style={{
                      background: `linear-gradient(135deg, ${c1} 0%, ${c2} 100%)`,
                      boxShadow: `0 20px 60px ${c1}60`,
                    }}
                  >
                    {initials}
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <motion.h1
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="text-3xl font-bold text-slate-100 leading-tight mb-4"
                  >
                    {book.title}
                  </motion.h1>

                  <div className="flex flex-wrap gap-4 mb-6">
                    <div className="flex items-center gap-2 text-slate-400 text-sm">
                      <User className="w-4 h-4 text-violet-400 shrink-0" />
                      <span className="font-medium">{book.author}</span>
                    </div>
                    {book.year && (
                      <div className="flex items-center gap-2 text-slate-400 text-sm">
                        <Calendar className="w-4 h-4 text-cyan-400 shrink-0" />
                        <span>{book.year}</span>
                      </div>
                    )}
                    {book.publisher && (
                      <div className="flex items-center gap-2 text-slate-400 text-sm">
                        <Building2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>{book.publisher}</span>
                      </div>
                    )}
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-violet-600/20 text-violet-300 border border-violet-500/20">
                      ISBN: {book.isbn}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-medium glass border border-white/[0.08] text-slate-400">
                      Book-Crossing Dataset
                    </span>
                  </div>

                  {/* AI Insight */}
                  <div
                    className="glass rounded-xl p-4 border border-violet-500/10"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(124,58,237,0.06) 0%, transparent 100%)",
                    }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4 text-violet-400" />
                      <span className="text-xs font-semibold text-violet-300">AI Insight</span>
                    </div>
                    <p className="text-sm text-slate-400 leading-relaxed">
                      This book has been matched with{" "}
                      <span className="text-violet-300 font-medium">{recs.length} similar titles</span>{" "}
                      using collaborative filtering and TF-IDF semantic similarity. Readers who enjoyed
                      {" "}<em className="text-slate-300">&ldquo;{book.title}&rdquo;</em> also consistently
                      enjoyed the recommendations below.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Similar books */}
            <div>
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-violet-400" />
                Readers also enjoyed
              </h2>
              {recs.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {recs.map((rec, i) => (
                    <BookCard key={rec.isbn} book={rec} index={i} />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {[...Array(8)].map((_, i) => (
                    <BookCardSkeleton key={i} />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
