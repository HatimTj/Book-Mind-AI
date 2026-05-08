"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { User, Calendar, Zap } from "lucide-react";
import type { BookRecommendation } from "@/types";

interface Props {
  book: BookRecommendation;
  index?: number;
  showScore?: boolean;
}

const COVER_COLORS = [
  "from-violet-600 to-indigo-500",
  "from-indigo-500 to-cyan-500",
  "from-pink-500 to-rose-500",
  "from-emerald-500 to-teal-500",
  "from-amber-500 to-orange-500",
  "from-purple-500 to-pink-500",
  "from-blue-500 to-violet-500",
  "from-teal-500 to-cyan-400",
];

function getColor(title: string): string {
  const idx =
    (title.charCodeAt(0) + (title.charCodeAt(title.length - 1) ?? 0)) %
    COVER_COLORS.length;
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

export default function BookCard({ book, index = 0, showScore = true }: Props) {
  const color    = getColor(book.title);
  const initials = getInitials(book.title);
  const pct      = Math.min(100, Math.round(book.score * 100));

  return (
    /* Entrance animation only — hover handled by CSS so no JS-thread cost */
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.04, 0.4), duration: 0.4 }}
      className="group relative glass rounded-2xl overflow-hidden"
      style={{
        boxShadow: "0 4px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
      }}
      whileHover={{ y: -4 }}
    >
      {/* Hover glow — pure CSS opacity transition */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 pointer-events-none"
        style={{
          background: "linear-gradient(135deg, rgba(124,58,237,0.12) 0%, rgba(79,70,229,0.06) 100%)",
          border: "1px solid rgba(124,58,237,0.25)",
          transition: "opacity 0.3s ease",
        }}
      />

      <Link href={`/books/${book.isbn}`}>
        <div className="p-5">
          {/* Cover + meta */}
          <div className="flex gap-4">
            <div
              className={`w-14 h-20 shrink-0 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-white font-bold text-base shadow-lg select-none`}
            >
              {initials}
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-slate-100 line-clamp-2 leading-snug group-hover:text-white mb-1.5"
                  style={{ transition: "color 0.2s" }}>
                {book.title}
              </h3>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                <User className="w-3 h-3 shrink-0" />
                <span className="truncate">{book.author}</span>
              </div>
              {book.year && (
                <div className="flex items-center gap-1.5 text-xs text-slate-600">
                  <Calendar className="w-3 h-3 shrink-0" />
                  <span>{book.year}</span>
                </div>
              )}
            </div>
          </div>

          {/* Score bar — CSS width transition, no JS animation */}
          {showScore && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-violet-400" />
                  {book.score_label}
                </span>
                <span className="text-xs font-semibold text-violet-300">{pct}%</span>
              </div>
              <div className="h-1.5 bg-white/[0.07] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${color}`}
                  style={{
                    width: `${pct}%`,
                    transition: `width 0.6s ease ${Math.min(index * 0.04 + 0.3, 0.7)}s`,
                  }}
                />
              </div>
            </div>
          )}

          {/* Reason */}
          {book.reason && (
            <p className="mt-3 text-xs text-slate-500 italic line-clamp-2 leading-relaxed">
              &ldquo;{book.reason}&rdquo;
            </p>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
