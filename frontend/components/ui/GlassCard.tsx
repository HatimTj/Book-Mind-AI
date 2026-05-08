"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
  delay?: number;
}

export default function GlassCard({
  children,
  className,
  hover = false,
  glow = false,
  delay = 0,
}: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.45 }}
      whileHover={hover ? { y: -4, scale: 1.01 } : undefined}
      className={cn(
        "glass rounded-2xl",
        glow && "shadow-[0_0_40px_rgba(124,58,237,0.15)]",
        hover && "cursor-pointer transition-shadow hover:shadow-[0_8px_48px_rgba(0,0,0,0.5),0_0_20px_rgba(124,58,237,0.15)]",
        className
      )}
    >
      {children}
    </motion.div>
  );
}
