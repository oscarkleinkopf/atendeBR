"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  clearDemoRole,
  getClientDemoSession,
  type DemoRole,
} from "@/lib/demo-auth";
import { AppShell } from "@/components/layout/app-shell";
import type { DemoSession } from "@/types";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState<DemoSession | null | undefined>(undefined);

  useEffect(() => {
    const current = getClientDemoSession();
    setSession(current);
    if (!current) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [pathname, router]);

  if (session === undefined) {
    return (
      <div className="grid min-h-screen place-items-center bg-[var(--sand)] text-teal-900">
        Cargando…
      </div>
    );
  }

  if (!session) return null;

  async function logout() {
    clearDemoRole();
    try {
      await fetch("/api/auth/demo", { method: "DELETE" });
    } catch {
      /* static / Pages: ignore */
    }
    router.push("/login");
  }

  return (
    <AppShell
      profile={session.profile}
      companyName={session.company.name}
      onLogout={() => void logout()}
    >
      {children}
    </AppShell>
  );
}

export function useDemoSessionState() {
  const [session, setSession] = useState<DemoSession | null>(null);
  useEffect(() => {
    setSession(getClientDemoSession());
  }, []);
  return session;
}

export type { DemoRole };
