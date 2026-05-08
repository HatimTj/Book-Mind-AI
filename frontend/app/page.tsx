"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Sparkles, BarChart3, MessageSquare, User, BookOpen,
  ArrowRight, Brain, Zap, Star, Search,
} from "lucide-react";
import { formatNumber } from "@/lib/utils";

/* ── Constants ───────────────────────────────────────────────────────── */
const STATS = [
  { label: "Books indexed",    value: 271380,  suffix: "+" },
  { label: "Ratings analyzed", value: 1149780, suffix: "+" },
  { label: "ML models",        value: 4,       suffix: "" },
  { label: "Hybrid accuracy",  value: 94,      suffix: "%" },
];

const FEATURES = [
  {
    icon: Sparkles,
    title: "Semantic Discovery",
    desc: "TF-IDF vectorization and cosine similarity find books that truly match your taste — not just keywords or bestseller lists.",
    color: "from-violet-600 to-indigo-500",
    glow: "rgba(124,58,237,0.18)",
    tag: "Content-Based AI",
    href: "/discover",
  },
  {
    icon: User,
    title: "Reader Profiles",
    desc: "Build your reader DNA with genres, authors, mood, and loved books. Every preference shapes hyper-personal recommendations.",
    color: "from-pink-500 to-rose-500",
    glow: "rgba(236,72,153,0.18)",
    tag: "Personalized",
    href: "/profile",
  },
  {
    icon: BarChart3,
    title: "Deep Analytics",
    desc: "Explore similarity heatmaps, rating distributions, author radars, and publication trends from 1.1 M real ratings.",
    color: "from-cyan-500 to-blue-500",
    glow: "rgba(6,182,212,0.18)",
    tag: "Data-Driven",
    href: "/analytics",
  },
  {
    icon: MessageSquare,
    title: "AI Chat Librarian",
    desc: "Ask naturally. Claude AI understands context, mood, and nuance to give recommendations that feel human.",
    color: "from-emerald-500 to-teal-500",
    glow: "rgba(16,185,129,0.18)",
    tag: "Claude AI",
    href: "/chat",
  },
];

const STEPS = [
  { step: "01", icon: Search,   title: "Search a book",  desc: "Type any title or author you enjoy. Full-text search spans 270 k titles from the Book-Crossing dataset." },
  { step: "02", icon: Brain,    title: "AI analyses",    desc: "Three ML engines run in parallel: TF-IDF content similarity, collaborative filtering, and hybrid fusion." },
  { step: "03", icon: Sparkles, title: "Discover",       desc: "Ranked recommendations arrive with match scores, AI reasoning, and one-click book detail pages." },
];

/* ── Hero book cards (float via CSS — zero JS-thread cost) ───────────── */
const HERO_CARDS = [
  { initials: "DU", title: "Dune",         author: "F. Herbert",  color: "from-amber-500 to-orange-500",  glow: "#f59e0b", score: 96, pos: { top: "4%",  left: "6%"  }, rotate: "-7deg", dur: 4.8, delay: 0    },
  { initials: "FO", title: "Foundation",   author: "I. Asimov",   color: "from-violet-600 to-purple-600", glow: "#7c3aed", score: 91, pos: { top: "38%", left: "45%" }, rotate: "4deg",  dur: 5.3, delay: 0.8  },
  { initials: "TM", title: "The Martian",  author: "A. Weir",     color: "from-cyan-500 to-blue-600",     glow: "#06b6d4", score: 88, pos: { top: "2%",  left: "59%" }, rotate: "8deg",  dur: 4.5, delay: 1.2  },
  { initials: "AH", title: "Atomic Habits",author: "J. Clear",    color: "from-emerald-500 to-teal-600",  glow: "#10b981", score: 84, pos: { top: "64%", left: "16%" }, rotate: "-3deg", dur: 5.8, delay: 1.6  },
  { initials: "SA", title: "Sapiens",      author: "Y.N. Harari", color: "from-pink-500 to-rose-600",     glow: "#ec4899", score: 79, pos: { top: "62%", left: "65%" }, rotate: "6deg",  dur: 6.1, delay: 0.4  },
];

function HeroVisual() {
  return (
    <div className="relative h-[580px] w-full select-none pointer-events-none">
      {/* Glow orb */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 72% 72% at 50% 46%, rgba(124,58,237,0.2) 0%, rgba(79,70,229,0.08) 45%, transparent 70%)",
        }}
      />

      {/* Book cards — entrance via Framer Motion, float via CSS animation */}
      {HERO_CARDS.map((c) => (
        <motion.div
          key={c.initials}
          className="absolute"
          style={{ ...c.pos, rotate: c.rotate } as React.CSSProperties}
          initial={{ opacity: 0, y: 48, scale: 0.72 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: c.delay * 0.25, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Float runs entirely on compositor thread */}
          <div
            style={{
              animation: `floatY ${c.dur}s ease-in-out ${(c.delay * 0.25 + 0.7).toFixed(2)}s infinite`,
              willChange: "transform",
            }}
          >
            <div
              className={`w-36 h-52 rounded-2xl bg-gradient-to-br ${c.color} flex flex-col items-center justify-center gap-1 px-3 py-4`}
              style={{
                boxShadow: `0 28px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.12), 0 0 48px ${c.glow}55`,
              }}
            >
              <div className="text-3xl font-black text-white drop-shadow">{c.initials}</div>
              <div className="text-xs font-bold text-white/90 text-center leading-snug mt-1">{c.title}</div>
              <div className="text-[10px] text-white/55 text-center">{c.author}</div>
              <div className="mt-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/30 border border-white/20 backdrop-blur-sm">
                <Zap className="w-2.5 h-2.5 text-white/80" />
                <span className="text-[10px] font-semibold text-white/90">{c.score}% match</span>
              </div>
            </div>
          </div>
        </motion.div>
      ))}

      {/* Floating micro-labels */}
      <motion.div
        className="absolute"
        style={{ top: "33%", left: "0%", rotate: "-4deg" } as React.CSSProperties}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.2, duration: 0.5 }}
      >
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-strong border border-violet-500/30 text-xs font-medium text-violet-300 shadow-lg">
          <Brain className="w-3 h-3" /> AI-Powered
        </div>
      </motion.div>

      <motion.div
        className="absolute"
        style={{ top: "26%", left: "73%", rotate: "3deg" } as React.CSSProperties}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.4, duration: 0.5 }}
      >
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-strong border border-emerald-500/30 text-xs font-medium text-emerald-300 shadow-lg">
          <Star className="w-3 h-3" /> 1.1 M ratings
        </div>
      </motion.div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════ */
export default function LandingPage() {
  return (
    <div className="relative overflow-x-hidden">
      {/* Global bg */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 80% 50% at 50% -15%, rgba(124,58,237,0.22) 0%, transparent 65%)" }}
      />

      {/* ══ HERO ══════════════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex flex-col">
        <div className="flex-1 flex items-center w-full max-w-[1440px] mx-auto px-6 md:px-12 xl:px-20 pt-20 pb-12">
          <div className="grid lg:grid-cols-2 gap-12 xl:gap-20 items-center w-full">

            {/* Left — text */}
            <div className="flex flex-col items-start">
              <motion.div
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-violet-500/25 text-xs text-violet-300 font-medium mb-8"
              >
                <Brain className="w-3.5 h-3.5" />
                TF-IDF · Cosine Similarity · Collaborative Filtering
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="text-[2.75rem] sm:text-5xl md:text-6xl lg:text-[4rem] xl:text-[4.5rem] font-black tracking-tight leading-[1.05] mb-7"
              >
                Find your next<br />
                <span className="gradient-text">favourite book</span><br />
                with AI.
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.18, duration: 0.6 }}
                className="text-base sm:text-lg text-slate-400 leading-relaxed max-w-[520px] mb-10"
              >
                Semantic recommendations powered by NLP and real reader data.
                Discover books that truly resonate — not just bestseller lists.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.28, duration: 0.6 }}
                className="flex flex-col sm:flex-row items-start sm:items-center gap-4"
              >
                <Link
                  href="/discover"
                  className="group inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-500 text-white font-semibold text-sm shadow-[0_0_40px_rgba(124,58,237,0.45)] hover:shadow-[0_0_64px_rgba(124,58,237,0.65)] transition-all duration-300"
                >
                  <Zap className="w-4 h-4" />
                  Start Discovering
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/chat"
                  className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl glass border border-white/10 text-slate-300 font-medium text-sm hover:border-white/20 hover:text-white transition-all"
                >
                  <MessageSquare className="w-4 h-4" />
                  Ask AI Librarian
                </Link>
              </motion.div>

              {/* Inline stats */}
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="flex items-center gap-8 mt-10 pt-10 border-t border-white/[0.06] w-full"
              >
                {[
                  { val: "271k", label: "books" },
                  { val: "1.1M", label: "ratings" },
                  { val: "531",  label: "trained titles" },
                ].map(({ val, label }) => (
                  <div key={label}>
                    <div className="text-xl font-bold gradient-text">{val}</div>
                    <div className="text-xs text-slate-600 mt-0.5">{label}</div>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Right — visual (desktop only) */}
            <div className="hidden lg:block">
              <HeroVisual />
            </div>
          </div>
        </div>

        {/* Scroll hint — CSS animation, zero JS */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 1.8 }}
          className="flex justify-center pb-10"
        >
          <div
            className="w-5 h-8 rounded-full border border-white/15 flex items-start justify-center pt-1.5"
            style={{ animation: "floatYSm 2.4s ease-in-out 1.8s infinite", willChange: "transform" }}
          >
            <div className="w-1 h-2 rounded-full bg-white/30" />
          </div>
        </motion.div>
      </section>

      {/* ══ STATS BAND ════════════════════════════════════════════════
          gap-px + bg on the wrapper = clean 1-px dividers that work
          correctly in both 2-col (mobile) and 4-col (desktop) grid   */}
      <section
        className="border-y border-white/[0.05]"
        style={{ background: "rgba(255,255,255,0.025)" }}
      >
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 xl:px-20">
          <div
            className="grid grid-cols-2 lg:grid-cols-4"
            style={{ gap: "1px", background: "rgba(255,255,255,0.05)" }}
          >
            {STATS.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="flex flex-col items-center py-12 px-6 bg-[#07070f]"
              >
                <div className="text-4xl sm:text-5xl font-black gradient-text mb-2">
                  {formatNumber(s.value)}{s.suffix}
                </div>
                <div className="text-slate-500 text-sm text-center">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FEATURES ══════════════════════════════════════════════════ */}
      <section className="py-32 px-6 md:px-12 xl:px-20">
        <div className="max-w-[1440px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass border border-white/10 text-xs text-slate-400 mb-5">
              <Sparkles className="w-3 h-3 text-violet-400" />
              Everything you need
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.1] mb-5 max-w-2xl">
              Four engines.<br />
              <span className="gradient-text-warm">One perfect recommendation.</span>
            </h2>
            <p className="text-slate-400 text-base lg:text-lg leading-relaxed max-w-xl">
              Each engine approaches books differently — combined, they understand you like a knowledgeable friend.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {FEATURES.map(({ icon: Icon, title, desc, color, glow, tag, href }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -5, scale: 1.01 }}
              >
                <Link
                  href={href}
                  className="group block glass rounded-3xl p-8 xl:p-10 h-full border border-white/[0.06] hover:border-white/10 relative overflow-hidden transition-all duration-300"
                  style={{ boxShadow: "0 4px 32px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.05)" }}
                >
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-3xl"
                    style={{ background: `radial-gradient(ellipse 60% 50% at 0% 100%, ${glow}, transparent 70%)` }}
                  />
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium glass border border-white/[0.08] text-slate-500 mb-6">
                    {tag}
                  </div>
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-100 mb-3 group-hover:text-white transition-colors">
                    {title}
                  </h3>
                  <p className="text-slate-500 leading-relaxed text-[0.925rem]">{desc}</p>
                  <div className="flex items-center gap-1.5 mt-7 text-xs font-semibold text-slate-600 group-hover:text-violet-400 transition-colors">
                    Explore
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ══════════════════════════════════════════════ */}
      <section className="py-32 px-6 md:px-12 xl:px-20 border-t border-white/[0.05]">
        <div className="max-w-[1440px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass border border-white/10 text-xs text-slate-400 mb-5">
              <BookOpen className="w-3 h-3 text-cyan-400" />
              Simple to use
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight">
              How <span className="gradient-text">BookMind AI</span> works
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {/* Connector */}
            <div className="hidden md:block absolute top-16 left-[calc(33.33%+12px)] right-[calc(33.33%+12px)] h-px bg-gradient-to-r from-violet-500/30 via-white/8 to-violet-500/30 pointer-events-none" />

            {STEPS.map(({ step, icon: Icon, title, desc }, i) => (
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12, duration: 0.55 }}
              >
                <div
                  className="glass rounded-3xl p-8 xl:p-10 h-full border border-white/[0.06]"
                  style={{ boxShadow: "0 4px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)" }}
                >
                  <div className="flex items-center justify-between mb-7">
                    <div className="w-12 h-12 rounded-2xl bg-violet-600/20 border border-violet-500/20 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-violet-400" />
                    </div>
                    <span className="text-7xl font-black text-white/[0.04] leading-none select-none">{step}</span>
                  </div>
                  <div className="inline-flex items-center px-2.5 py-1 rounded-full bg-violet-600/15 border border-violet-500/20 text-xs font-semibold text-violet-400 mb-4">
                    Step {step}
                  </div>
                  <h3 className="text-lg font-bold text-slate-100 mb-3">{title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CTA ═══════════════════════════════════════════════════════ */}
      <section className="py-32 px-6 md:px-12 xl:px-20">
        <div className="max-w-[1440px] mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="relative rounded-3xl overflow-hidden"
            style={{
              background: "linear-gradient(135deg, rgba(124,58,237,0.12) 0%, rgba(79,70,229,0.06) 50%, rgba(6,182,212,0.08) 100%)",
              border: "1px solid rgba(124,58,237,0.2)",
              boxShadow: "0 0 120px rgba(124,58,237,0.1), 0 4px 64px rgba(0,0,0,0.5)",
            }}
          >
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ background: "radial-gradient(ellipse 60% 70% at 50% 0%, rgba(124,58,237,0.15) 0%, transparent 65%)" }}
            />
            <div className="relative px-8 md:px-20 py-20 md:py-28 text-center">
              <Star className="w-10 h-10 text-yellow-400 mx-auto mb-7 opacity-90" />
              <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black tracking-tight mb-6">
                Ready to find your next<br />
                <span className="gradient-text">obsession?</span>
              </h2>
              <p className="text-slate-400 text-base lg:text-lg max-w-lg mx-auto mb-12 leading-relaxed">
                Powered by 1.1 M real ratings and cutting-edge NLP.
                Your perfect read is already in the database.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/discover"
                  className="group inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-500 text-white font-semibold shadow-[0_0_48px_rgba(124,58,237,0.55)] hover:shadow-[0_0_72px_rgba(124,58,237,0.75)] transition-all duration-300"
                >
                  <Zap className="w-4 h-4" />
                  Get Recommendations
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/profile"
                  className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl glass border border-white/10 text-slate-300 font-medium hover:border-white/20 hover:text-white transition-all"
                >
                  <User className="w-4 h-4" />
                  Build my Profile
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
