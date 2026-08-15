"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { getDemoTeamProgress } from "@/lib/demo-data";
import { fetchTeamProgressLive } from "@/lib/cloud/session";
import { formatPercent, scoreColor } from "@/lib/utils";
import type { Company, Profile, TeamMemberProgress } from "@/types";

export function TeamDashboard({
  company,
  profile,
  source,
}: {
  company: Company;
  profile: Profile;
  source: "cloud" | "demo" | null;
}) {
  const [team, setTeam] = useState<TeamMemberProgress[] | null>(
    source === "cloud" ? null : getDemoTeamProgress(),
  );
  const [loading, setLoading] = useState(source === "cloud");

  useEffect(() => {
    if (source !== "cloud" || !company.id) {
      return;
    }
    let alive = true;
    void (async () => {
      const live = await fetchTeamProgressLive(company.id, profile.role);
      if (!alive) return;
      if (live) setTeam(live);
      else setTeam([]);
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, [company.id, profile.role, source]);

  const rows = team ?? [];

  const avgCompletion =
    rows.length === 0
      ? 0
      : rows.reduce((acc, m) => acc + m.lessons_completed / m.lessons_total, 0) / rows.length;
  const scored = rows.filter((m) => m.avg_simulation_score !== null);
  const avgSim =
    scored.length > 0
      ? scored.reduce((acc, m) => acc + (m.avg_simulation_score ?? 0), 0) / scored.length
      : 0;
  const behind = rows.filter((m) => m.is_behind);

  return (
    <>
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-900/45">
        Dashboard empresa
      </p>
      <h1 className="mt-1 font-[family-name:var(--font-display)] text-4xl font-bold text-teal-950">
        Equipo · {company.name}
      </h1>
      <p className="mt-2 text-teal-900/65">
        {source === "cloud"
          ? "Datos en vivo del tenant (Supabase)."
          : "Vista demo. Entra con magic link para ver tu equipo real."}
      </p>

      {source === "cloud" && company.invite_code && (
        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-3 text-sm text-amber-950">
          Código de invitación:{" "}
          <span className="font-mono text-base font-bold tracking-widest">{company.invite_code}</span>
          <span className="ml-2 text-amber-800/70">Compártelo con colaboradores.</span>
        </div>
      )}

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-teal-900/10 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-teal-900/50">
            Completitud promedio
          </p>
          <p className="mt-2 font-[family-name:var(--font-display)] text-4xl font-bold text-teal-950">
            {formatPercent(avgCompletion * 100)}
          </p>
        </div>
        <div className="rounded-3xl border border-teal-900/10 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-teal-900/50">
            Score simulación
          </p>
          <p className={`mt-2 font-[family-name:var(--font-display)] text-4xl font-bold ${scoreColor(avgSim)}`}>
            {Math.round(avgSim) || "—"}
          </p>
        </div>
        <div className="rounded-3xl border border-teal-900/10 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-teal-900/50">Atrasados</p>
          <p className="mt-2 font-[family-name:var(--font-display)] text-4xl font-bold text-rose-700">
            {behind.length}
          </p>
        </div>
      </div>

      <div className="mt-8 overflow-hidden rounded-3xl border border-teal-900/10 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-teal-900/8 px-5 py-4">
          <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-teal-950">
            Colaboradores {loading ? "…" : `(${rows.length})`}
          </h2>
          <Button variant="secondary" size="sm">
            Ruta asignada: Atención al Cliente
          </Button>
        </div>
        <div className="divide-y divide-teal-900/8">
          {rows.length === 0 && !loading && (
            <p className="px-5 py-6 text-sm text-teal-900/55">
              Aún no hay colaboradores. Comparte el código de invitación.
            </p>
          )}
          {rows.map((member) => {
            const pct = (member.lessons_completed / member.lessons_total) * 100;
            return (
              <div
                key={member.profile.id}
                className="grid gap-4 px-5 py-4 md:grid-cols-[1.2fr_1fr_0.6fr_0.6fr] md:items-center"
              >
                <div>
                  <p className="font-semibold text-teal-950">{member.profile.full_name}</p>
                  <p className="text-sm text-teal-900/55">{member.profile.email}</p>
                </div>
                <div>
                  <div className="mb-1 flex justify-between text-xs text-teal-900/55">
                    <span>{member.assigned_path_title}</span>
                    <span>
                      {member.lessons_completed}/{member.lessons_total}
                    </span>
                  </div>
                  <Progress value={pct} />
                </div>
                <div>
                  {member.avg_simulation_score !== null ? (
                    <p className={`text-lg font-bold ${scoreColor(member.avg_simulation_score)}`}>
                      {member.avg_simulation_score}
                    </p>
                  ) : (
                    <p className="text-sm text-teal-900/45">Sin sims</p>
                  )}
                </div>
                <div>
                  {member.is_behind ? (
                    <Badge className="bg-rose-100 text-rose-800">Atrasado</Badge>
                  ) : (
                    <Badge className="bg-emerald-100 text-emerald-800">Al día</Badge>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
