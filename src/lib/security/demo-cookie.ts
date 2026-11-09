import { createHmac, timingSafeEqual } from "node:crypto";
import type { DemoRole } from "@/lib/demo-auth";

export const DEMO_ROLES = ["collaborator", "supervisor", "company_admin"] as const;

export function isDemoRole(value: string): value is DemoRole {
  return (DEMO_ROLES as readonly string[]).includes(value);
}

export function isDemoAuthEnabled(): boolean {
  if (process.env.DEMO_AUTH_ENABLED === "true") return true;
  if (process.env.DEMO_AUTH_ENABLED === "false") return false;
  return process.env.NODE_ENV !== "production";
}

/** Production requires DEMO_AUTH_SECRET. Dev uses a non-production fallback. */
export function getDemoAuthSecret(): string | null {
  const secret = process.env.DEMO_AUTH_SECRET?.trim();
  if (secret) return secret;
  if (process.env.NODE_ENV === "production") return null;
  return "atendebr-dev-only-not-for-production";
}

export function assertDemoAuthAvailable():
  | { ok: true; secret: string }
  | { ok: false; status: number; error: string } {
  if (!isDemoAuthEnabled()) {
    return { ok: false, status: 403, error: "Demo auth deshabilitado" };
  }
  const secret = getDemoAuthSecret();
  if (!secret) {
    return { ok: false, status: 503, error: "DEMO_AUTH_SECRET no configurado" };
  }
  return { ok: true, secret };
}

export function signDemoRole(role: DemoRole, secret: string): string {
  const sig = createHmac("sha256", secret).update(role).digest("hex");
  return `${role}.${sig}`;
}

export function verifyDemoCookie(value: string | undefined, secret: string): DemoRole | null {
  if (!value) return null;
  const dot = value.indexOf(".");
  if (dot <= 0) return null;
  const role = value.slice(0, dot);
  const sig = value.slice(dot + 1);
  if (!isDemoRole(role) || !/^[0-9a-f]{64}$/i.test(sig)) return null;

  const expected = createHmac("sha256", secret).update(role).digest("hex");
  const a = Buffer.from(sig, "hex");
  const b = Buffer.from(expected, "hex");
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  return role;
}
