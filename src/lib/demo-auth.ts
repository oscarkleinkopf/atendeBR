/** Demo auth client-side (GitHub Pages friendly, patrón Ulpan). */

import {
  DEMO_COMPANY,
  DEMO_USERS,
} from "@/lib/demo-data";
import type { DemoSession } from "@/types";

export const DEMO_COOKIE = "atendebr_demo_role";
export const DEMO_STORAGE_KEY = "atendebr_demo_role";

export type DemoRole = "collaborator" | "supervisor" | "company_admin";

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function getDemoRole(): DemoRole | null {
  if (typeof window === "undefined") return null;
  const fromStorage = localStorage.getItem(DEMO_STORAGE_KEY);
  const fromCookie = readCookie(DEMO_COOKIE);
  const role = (fromStorage || fromCookie) as DemoRole | null;
  if (role && role in DEMO_USERS) return role;
  return null;
}

export function getClientDemoSession(): DemoSession | null {
  const role = getDemoRole();
  if (!role) return null;
  return {
    profile: DEMO_USERS[role],
    company: DEMO_COMPANY,
  };
}

export function setDemoRole(role: DemoRole) {
  localStorage.setItem(DEMO_STORAGE_KEY, role);
  document.cookie = `${DEMO_COOKIE}=${encodeURIComponent(role)}; path=/; max-age=${60 * 60 * 24 * 14}; samesite=lax`;
}

export function clearDemoRole() {
  localStorage.removeItem(DEMO_STORAGE_KEY);
  document.cookie = `${DEMO_COOKIE}=; path=/; max-age=0; samesite=lax`;
}

export function withBasePath(path: string) {
  const base = process.env.NEXT_PUBLIC_BASE_PATH || "";
  if (!path.startsWith("/")) return `${base}/${path}`;
  return `${base}${path}`;
}
