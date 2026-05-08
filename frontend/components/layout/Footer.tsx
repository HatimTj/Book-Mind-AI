import Link from "next/link";
import { BookOpen, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.06] bg-[#07070f]">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 xl:px-20 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-16">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-500 flex items-center justify-center shadow-[0_0_16px_rgba(124,58,237,0.4)]">
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-base gradient-text">BookMind AI</span>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed max-w-xs">
              Intelligent book recommendations powered by TF-IDF semantic similarity
              and collaborative filtering on 1.1 M real ratings.
            </p>
          </div>

          {/* Platform links */}
          <div>
            <h4 className="text-slate-300 text-sm font-semibold mb-5">Platform</h4>
            <div className="space-y-3">
              {[
                { href: "/discover",  label: "Discover Books" },
                { href: "/profile",   label: "My Profile" },
                { href: "/analytics", label: "Analytics" },
                { href: "/chat",      label: "AI Chat" },
              ].map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="block text-slate-500 hover:text-slate-300 text-sm transition-colors"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Tech stack */}
          <div>
            <h4 className="text-slate-300 text-sm font-semibold mb-5">Tech Stack</h4>
            <div className="flex flex-wrap gap-2">
              {["Next.js 15", "FastAPI", "TF-IDF", "Cosine Sim.", "Claude AI", "Recharts"].map((t) => (
                <span
                  key={t}
                  className="px-2.5 py-1 rounded-lg text-xs glass text-slate-400 border border-white/[0.06]"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-white/[0.05] pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-slate-600 text-xs">© 2026 BookMind AI — Book-Crossing Dataset</p>
          <div className="flex items-center gap-1.5 text-slate-600 text-xs">
            Built with <Heart className="w-3 h-3 text-pink-500 mx-0.5" /> using AI
          </div>
        </div>
      </div>
    </footer>
  );
}
