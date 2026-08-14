import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPercent(value: number) {
  return `${Math.round(value)}%`;
}

export function scoreColor(score: number) {
  if (score >= 85) return "text-emerald-700";
  if (score >= 70) return "text-teal-700";
  if (score >= 55) return "text-amber-700";
  return "text-rose-700";
}

export function difficultyLabel(level: number) {
  const labels = ["", "Suave", "Media", "Desafiante", "Alta", "Experta"];
  return labels[level] ?? `${level}`;
}

export function canViewTeam(role: string) {
  return role === "supervisor" || role === "company_admin" || role === "super_admin";
}
