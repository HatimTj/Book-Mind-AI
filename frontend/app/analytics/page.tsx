"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { BarChart3, BookOpen, Star, Users, TrendingUp } from "lucide-react";
import { api } from "@/lib/api";
import { formatNumber } from "@/lib/utils";
import { StatCardSkeleton } from "@/components/ui/LoadingSkeleton";
import type { AnalyticsData } from "@/types";

/* Recharts bundle loaded only when charts are actually needed */
const Charts = dynamic(() => import("./Charts"), {
  ssr: false,
  loading: () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className={`glass rounded-2xl p-6 h-80 shimmer-bg${i === 0 || i === 5 ? " lg:col-span-2" : ""}`}
        />
      ))}
    </div>
  ),
});

interface StatCardProps {
  label: string; value: string | number;
  icon: React.ElementType; color: string; delay?: number;
}
function StatCard({ label, value, icon: Icon, color, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="glass rounded-2xl p-5 flex flex-col gap-3"
      style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)" }}
    >
      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg shrink-0`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <div className="text-2xl font-bold text-slate-100 leading-tight">{value}</div>
        <div className="text-xs text-slate-500 mt-0.5">{label}</div>
      </div>
    </motion.div>
  );
}

export default function AnalyticsPage() {
  const [data,    setData]    = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  useEffect(() => {
    api.analytics()
      .then(setData)
      .catch(() => setError("Failed to load analytics — is the backend running on port 8001?"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen pt-24 pb-24 px-6 md:px-12 xl:px-20">
      {/* BG */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 50% 40% at 80% -5%, rgba(6,182,212,0.12) 0%, transparent 70%)" }}
      />

      <div className="max-w-[1440px] mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-cyan-500/20 text-xs text-cyan-300 mb-4">
            <BarChart3 className="w-3 h-3" />
            Dataset Intelligence
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">
            Analytics <span className="gradient-text">Dashboard</span>
          </h1>
          <p className="text-slate-500 text-sm">Insights from 1.1 M book ratings and 271 k titles.</p>
        </motion.div>

        {error && (
          <div className="glass rounded-2xl p-5 border border-red-500/20 text-red-400 mb-8 text-sm">{error}</div>
        )}

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {loading ? (
            [...Array(4)].map((_, i) => <StatCardSkeleton key={i} />)
          ) : data ? (
            <>
              <StatCard label="Books Indexed"  value={formatNumber(data.stats.total_books)}    icon={BookOpen}   color="from-violet-600 to-indigo-500" delay={0}    />
              <StatCard label="Total Ratings"  value={formatNumber(data.stats.total_ratings)}  icon={Star}       color="from-yellow-500 to-orange-500" delay={0.05} />
              <StatCard label="Avg Rating"     value={`${data.stats.avg_rating}/10`}           icon={TrendingUp} color="from-emerald-500 to-teal-500"  delay={0.1}  />
              <StatCard label="Unique Authors" value={formatNumber(data.stats.unique_authors)} icon={Users}      color="from-pink-500 to-rose-500"     delay={0.15} />
            </>
          ) : null}
        </div>

        {/* Charts — lazy loaded so Recharts doesn't block initial render */}
        {data && <Charts data={data} />}
      </div>
    </div>
  );
}
