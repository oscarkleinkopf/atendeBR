/** Demo auth client-side (GitHub Pages friendly, patrón Ulpan). */

import {
  DEMO_COMPANY,
  DEMO_USERS,
} from "@/lib/demo-data";
import type { DemoSession } from "@/types";

export const DEMO_COOKIE = "atendebr_demo_role";
export const DEMO_STORAGE_KEY = "atendebr_demo_role";
export const DEMO_AUTH_EVENT = "atendebr-demo-auth";

export type DemoRole = "collaborator" | "supervisor" | "company_admin";

export function subscribeDemoSession(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(DEMO_AUTH_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(DEMO_AUTH_EVENT, onStoreChange);
  };
}

export function getDemoRole(): DemoRole | null {
  if (typeof window === "undefined") return null;
  const fromStorage = localStorage.getItem(DEMO_STORAGE_KEY);
  if (fromStorage && fromStorage in DEMO_USERS) return fromStorage as DemoRole;
  return null;
}

let cachedRole: DemoRole | null = null;
let cachedSession: DemoSession | null = null;

export function getClientDemoSession(): DemoSession | null {
  const role = getDemoRole();
  if (role === cachedRole) return cachedSession;
  cachedRole = role;
  cachedSession = role
    ? { profile: DEMO_USERS[role], company: DEMO_COMPANY }
    : null;
  return cachedSession;
}

export function setDemoRole(role: DemoRole) {
  localStorage.setItem(DEMO_STORAGE_KEY, role);
  window.dispatchEvent(new Event(DEMO_AUTH_EVENT));
}

export function clearDemoRole() {
  localStorage.removeItem(DEMO_STORAGE_KEY);
  document.cookie = `${DEMO_COOKIE}=; path=/; max-age=0; samesite=lax`;
  window.dispatchEvent(new Event(DEMO_AUTH_EVENT));
}

export function withBasePath(path: string) {
  const base = process.env.NEXT_PUBLIC_BASE_PATH || "";
  if (!path.startsWith("/")) return `${base}/${path}`;
  return `${base}${path}`;
}
