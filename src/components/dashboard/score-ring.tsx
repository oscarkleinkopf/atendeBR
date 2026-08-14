"use client";

import { motion } from "framer-motion";
import { cn, scoreColor } from "@/lib/utils";

export function ScoreRing({ score, label }: { score: number; label: string }) {
  const radius = 36;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (score / 100) * circ;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative h-24 w-24">
        <svg className="h-24 w-24 -rotate-90" viewBox="0 0 88 88">
          <circle cx="44" cy="44" r={radius} stroke="rgba(10,77,104,0.12)" strokeWidth="8" fill="none" />
          <motion.circle
            cx="44"
            cy="44"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            className="text-teal-700"
            strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 0.9, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={cn("text-xl font-bold", scoreColor(score))}>{score}</span>
        </div>
      </div>
      <span className="text-xs font-medium uppercase tracking-wide text-teal-900/60">{label}</span>
    </div>
  );
}
