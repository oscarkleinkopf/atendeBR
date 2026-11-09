"use client";

import { useEffect, useSyncExternalStore } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  clearDemoRole,
  getClientDemoSession,
  subscribeDemoSession,
  type DemoRole,
} from "@/lib/demo-auth";
import { AppShell } from "@/components/layout/app-shell";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const session = useSyncExternalStore(
    subscribeDemoSession,
    getClientDemoSession,
    () => null,
  );

  useEffect(() => {
    if (!session) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [pathname, router, session]);

  if (!session) {
    return (
      <div className="grid min-h-screen place-items-center bg-[var(--sand)] text-teal-900">
        Cargando…
      </div>
    );
  }

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
  return useSyncExternalStore(subscribeDemoSession, getClientDemoSession, () => null);
}

export type { DemoRole };
