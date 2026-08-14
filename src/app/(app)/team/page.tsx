"use client";

import { TeamDashboard } from "@/components/dashboard/team-dashboard";
import { useDemoSessionState } from "@/components/layout/auth-gate";
import { canViewTeam } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function TeamPage() {
  const session = useDemoSessionState();
  const router = useRouter();

  useEffect(() => {
    if (session && !canViewTeam(session.profile.role)) {
      router.replace("/dashboard");
    }
  }, [session, router]);

  if (!session || !canViewTeam(session.profile.role)) {
    return <p className="text-sm text-teal-900/60">Cargando equipo…</p>;
  }

  return <TeamDashboard companyName={session.company.name} />;
}
