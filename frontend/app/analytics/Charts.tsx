"use client";

import { motion } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, CartesianGrid,
} from "recharts";
import type { AnalyticsData } from "@/types";
import { formatNumber } from "@/lib/utils";

interface TooltipPayload { name: string; value: number; color?: string }
interface TooltipProps   { active?: boolean; payload?: TooltipPayload[]; label?: string }

const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-strong rounded-xl px-4 py-3 border border-white/10 text-sm shadow-2xl">
      {label && <p className="text-slate-400 mb-1.5 text-xs">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color ?? "#a78bfa" }} className="font-semibold">
          {p.name}: {typeof p.value === "number" ? p.value.toLocaleString() : p.value}
        </p>
      ))}
    </div>
  );
};

function Panel({
  title, subtitle, span2 = false, delay = 0, children,
}: {
  title: string; subtitle?: string; span2?: boolean; delay?: number;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`glass rounded-2xl p-6 flex flex-col gap-4${span2 ? " lg:col-span-2" : ""}`}
      style={{
        minWidth: 0,
        boxShadow: "0 4px 32px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.05)",
      }}
    >
      <div>
        <h2 className="font-semibold text-slate-200 text-base">{title}</h2>
        {subtitle && <p className="text-xs text-slate-600 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </motion.div>
  );
}

const trunc = (s: string, n: number) => (s.length > n ? s.slice(0, n) + "…" : s);

const GRADS = [
  ["#7c3aed", "#4f46e5"],
  ["#4f46e5", "#06b6d4"],
  ["#ec4899", "#8b5cf6"],
  ["#06b6d4", "#10b981"],
  ["#f59e0b", "#f97316"],
];

export default function Charts({ data }: { data: AnalyticsData }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

      {/* 1 — Top Books */}
      <Panel title="Top 15 Books by Popularity Score" span2 delay={0}>
        <div style={{ width: "100%", height: 500, minWidth: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.top_books} layout="vertical" margin={{ top: 4, right: 48, bottom: 4, left: 8 }}>
              <defs>
                {GRADS.map(([c1, c2], i) => (
                  <linearGradient key={i} id={`grad${i}`} x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor={c1} />
                    <stop offset="100%" stopColor={c2} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid horizontal={false} stroke="rgba(255,255,255,0.04)" />
              <XAxis type="number" domain={[0, 10]} tick={{ fill: "#64748b", fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey="title" width={200} tick={{ fill: "#94a3b8", fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v: string) => trunc(v, 26)} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(124,58,237,0.06)" }} />
              <Bar dataKey="score" name="Score" radius={[0, 6, 6, 0]} maxBarSize={28}>
                {data.top_books.map((_, i) => (
                  <Cell key={i} fill={`url(#grad${i % GRADS.length})`} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      {/* 2 — Rating Distribution */}
      <Panel title="Rating Distribution" delay={0.05}>
        <div style={{ width: "100%", height: 300, minWidth: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.rating_distribution} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
              <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="rating" tick={{ fill: "#64748b", fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: "#64748b", fontSize: 11 }} tickLine={false} axisLine={false} width={48} tickFormatter={(v: number) => formatNumber(v)} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(124,58,237,0.06)" }} />
              <Bar dataKey="count" name="Books" fill="#7c3aed" radius={[4, 4, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      {/* 3 — Year Distribution */}
      <Panel title="Books by Publication Period" delay={0.1}>
        <div style={{ width: "100%", height: 300, minWidth: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.year_distribution} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
              <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="period" tick={{ fill: "#64748b", fontSize: 10 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: "#64748b", fontSize: 11 }} tickLine={false} axisLine={false} width={48} tickFormatter={(v: number) => formatNumber(v)} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(6,182,212,0.06)" }} />
              <Bar dataKey="count" name="Books" fill="#06b6d4" radius={[4, 4, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      {/* 4 — Top Authors */}
      <Panel title="Top Authors by Total Ratings" delay={0.15}>
        <div style={{ width: "100%", height: 340, minWidth: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.top_authors} layout="vertical" margin={{ top: 4, right: 40, bottom: 4, left: 8 }}>
              <CartesianGrid horizontal={false} stroke="rgba(255,255,255,0.04)" />
              <XAxis type="number" tick={{ fill: "#64748b", fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={(v: number) => formatNumber(v)} />
              <YAxis type="category" dataKey="author" width={130} tick={{ fill: "#94a3b8", fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={(v: string) => trunc(v, 17)} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(236,72,153,0.06)" }} />
              <Bar dataKey="total_ratings" name="Ratings" fill="#ec4899" radius={[0, 4, 4, 0]} maxBarSize={26} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      {/* 5 — Radar */}
      <Panel title="Author Average Rating Radar" delay={0.2}>
        <div style={{ width: "100%", height: 320, minWidth: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data.top_authors.slice(0, 8)}>
              <PolarGrid stroke="rgba(255,255,255,0.07)" />
              <PolarAngleAxis dataKey="author" tick={{ fill: "#64748b", fontSize: 10 }} tickFormatter={(v: string) => trunc(v.split(" ").pop() ?? v, 12)} />
              <Radar name="Avg Rating" dataKey="avg_rating" stroke="#7c3aed" fill="#7c3aed" fillOpacity={0.3} strokeWidth={2} />
              <Tooltip content={<CustomTooltip />} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      {/* 6 — Heatmap */}
      {data.similarity_heatmap.length > 0 && (
        <Panel
          title="Similarity Heatmap"
          subtitle="Collaborative-filtering cosine similarity between the most popular books."
          span2
          delay={0.25}
        >
          <div className="overflow-x-auto">
            {(() => {
              const xs = [...new Set(data.similarity_heatmap.map((d) => d.x))];
              const ys = [...new Set(data.similarity_heatmap.map((d) => d.y))];
              const lookup: Record<string, number> = {};
              data.similarity_heatmap.forEach((d) => { lookup[`${d.x}||${d.y}`] = d.value; });
              return (
                <table className="text-xs border-separate w-full" style={{ borderSpacing: 3 }}>
                  <thead>
                    <tr>
                      <th style={{ minWidth: 110 }} />
                      {xs.map((x) => (
                        <th key={x} title={x} className="text-slate-500 font-normal pb-2 px-1 text-center" style={{ minWidth: 64 }}>
                          {trunc(x, 11)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {ys.map((y) => (
                      <tr key={y}>
                        <td title={y} className="text-slate-500 pr-3 text-right py-1 whitespace-nowrap" style={{ minWidth: 110 }}>
                          {trunc(y, 15)}
                        </td>
                        {xs.map((x) => {
                          const v = lookup[`${x}||${y}`] ?? 0;
                          return (
                            <td
                              key={x}
                              title={`${x} × ${y}: ${v.toFixed(3)}`}
                              className="rounded text-center font-semibold py-2 transition-opacity hover:opacity-80 cursor-default"
                              style={{
                                background: `rgba(124,58,237,${0.08 + v * 0.85})`,
                                color: v > 0.4 ? "#e2e8f0" : v > 0.15 ? "#94a3b8" : "#475569",
                                minWidth: 64,
                              }}
                            >
                              {Math.round(v * 100)}%
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              );
            })()}
          </div>
        </Panel>
      )}
    </div>
  );
}
