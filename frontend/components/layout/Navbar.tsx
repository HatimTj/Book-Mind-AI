"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Sparkles,
  BarChart3,
  User,
  MessageSquare,
  Menu,
  X,
  Zap,
} from "lucide-react";

const links = [
  { href: "/discover",  label: "Discover",  icon: Sparkles },
  { href: "/profile",   label: "Profile",   icon: User },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/chat",      label: "AI Chat",   icon: MessageSquare },
];

export default function Navbar() {
  const pathname  = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open,     setOpen]     = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled ? "glass border-b border-white/[0.06]" : "bg-transparent"
      }`}
    >
      <nav className="max-w-[1440px] mx-auto px-6 md:px-12 xl:px-20 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-500 flex items-center justify-center shadow-[0_0_16px_rgba(124,58,237,0.5)] group-hover:shadow-[0_0_24px_rgba(124,58,237,0.7)] transition-shadow">
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-base tracking-tight">
            <span className="gradient-text">BookMind</span>
            <span className="text-slate-400 font-normal"> AI</span>
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-1">
          {links.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`relative flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? "text-white"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-lg glass border-violet-500/20"
                    style={{ borderColor: "rgba(139,92,246,0.2)" }}
                    transition={{ type: "spring", duration: 0.4 }}
                  />
                )}
                <Icon className="w-3.5 h-3.5 relative z-10" />
                <span className="relative z-10">{label}</span>
              </Link>
            );
          })}
        </div>

        {/* CTA + Hamburger */}
        <div className="flex items-center gap-3">
          <Link
            href="/discover"
            className="hidden md:flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-500 text-white text-sm font-semibold hover:opacity-90 transition-opacity shadow-[0_0_20px_rgba(124,58,237,0.35)]"
          >
            <Zap className="w-3.5 h-3.5" />
            Get Recommendations
          </Link>

          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 rounded-lg glass text-slate-300"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="md:hidden glass border-b border-white/[0.06] px-4 pb-4 space-y-1"
          >
            {links.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  pathname === href
                    ? "bg-violet-600/20 text-violet-300"
                    : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-200"
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
            <Link
              href="/discover"
              onClick={() => setOpen(false)}
              className="flex items-center justify-center gap-2 mt-2 w-full px-4 py-2.5 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-500 text-white text-sm font-semibold"
            >
              <Zap className="w-4 h-4" />
              Get Recommendations
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
