"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { clearDemoRole, getClientDemoSession } from "@/lib/demo-auth";
import { loadCloudSession, signOutCloud } from "@/lib/cloud/session";
import { AppShell } from "@/components/layout/app-shell";
import type { DemoSession } from "@/types";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState<DemoSession | null | undefined>(undefined);
  const [source, setSource] = useState<"cloud" | "demo" | null>(null);

  useEffect(() => {
    let alive = true;
    void (async () => {
      const cloud = await loadCloudSession();
      if (!alive) return;

      if (cloud) {
        const needsCompany = !cloud.profile.company_id;
        const onOnboarding = pathname.includes("/onboarding");
        if (needsCompany && !onOnboarding) {
          router.replace("/onboarding");
          setSession(cloud);
          setSource("cloud");
          return;
        }
        if (!needsCompany && onOnboarding) {
          router.replace("/dashboard");
        }
        setSession(cloud);
        setSource("cloud");
        return;
      }

      const demo = getClientDemoSession();
      setSession(demo);
      setSource(demo ? "demo" : null);
      if (!demo) {
        router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      }
    })();
    return () => {
      alive = false;
    };
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
    await signOutCloud();
    try {
      await fetch("/api/auth/demo", { method: "DELETE" });
    } catch {
      /* Pages */
    }
    router.push("/login");
  }

  return (
    <AppShell
      profile={session.profile}
      companyName={session.company.name}
      onLogout={() => void logout()}
    >
      {source === "cloud" && session.profile.company_id && (
        <p className="mb-4 text-xs font-medium text-teal-800/70">
          Sesión en la nube · {session.profile.email}
        </p>
      )}
      {children}
    </AppShell>
  );
}

export function useAppSession() {
  const [session, setSession] = useState<DemoSession | null>(null);
  const [source, setSource] = useState<"cloud" | "demo" | null>(null);

  useEffect(() => {
    let alive = true;
    void (async () => {
      const cloud = await loadCloudSession();
      if (!alive) return;
      if (cloud?.profile.company_id) {
        setSession(cloud);
        setSource("cloud");
        return;
      }
      const demo = getClientDemoSession();
      setSession(demo);
      setSource(demo ? "demo" : null);
    })();
    return () => {
      alive = false;
    };
  }, []);

  return { session, source };
}

/** @deprecated use useAppSession */
export function useDemoSessionState() {
  return useAppSession().session;
}
