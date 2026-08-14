"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Flame, MessageSquare, Trophy } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScoreRing } from "@/components/dashboard/score-ring";
import { loadProgress, type AtendeProgress } from "@/lib/progress-local";
import { formatPercent } from "@/lib/utils";
import type { Lesson, SimulationAttempt } from "@/types";

export function CollaboratorProgress({
  lessons,
  pathTitle,
  fallbackAttempts,
  initialName,
}: {
  lessons: Lesson[];
  pathTitle: string;
  fallbackAttempts: SimulationAttempt[];
  initialName: string;
}) {
  const [progress, setProgress] = useState<AtendeProgress | null>(null);

  useEffect(() => {
    setProgress(loadProgress());
    const onStorage = () => setProgress(loadProgress());
    window.addEventListener("storage", onStorage);
    window.addEventListener("atendebr-progress", onStorage);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("atendebr-progress", onStorage);
    };
  }, []);

  const state = progress;
  const completed = state?.completedLessons.length ?? 0;
  const pct = lessons.length ? (completed / lessons.length) * 100 : 0;
  const nextLesson =
    lessons.find((l) => !state?.completedLessons.includes(l.id)) ?? lessons[0];
  const avgScore = state?.lastSimulationScore ?? null;
  const streak = state?.streak ?? 0;

  return (
    <>
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-900/45">
          Hola, {initialName.split(" ")[0]}
        </p>
        <h1 className="mt-1 font-[family-name:var(--font-display)] text-4xl font-bold text-teal-950">
          Tu progreso
        </h1>
        <p className="mt-1 text-sm text-teal-900/50">
          Sync local (patrón Ulpan) · se guarda en este dispositivo
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-teal-900/10 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-teal-900/60">
            <Flame className="h-4 w-4 text-amber-500" />
            <span className="text-xs font-semibold uppercase tracking-wide">Racha</span>
          </div>
          <p className="mt-3 font-[family-name:var(--font-display)] text-4xl font-bold text-teal-950">
            {streak}
            <span className="text-lg font-semibold text-teal-900/50"> días</span>
          </p>
          <p className="mt-1 text-xs text-teal-900/45">{state?.xp ?? 0} XP</p>
        </div>
        <div className="rounded-3xl border border-teal-900/10 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-teal-900/60">
            <Trophy className="h-4 w-4 text-amber-500" />
            <span className="text-xs font-semibold uppercase tracking-wide">Ruta actual</span>
          </div>
          <p className="mt-3 text-lg font-semibold text-teal-950">{pathTitle}</p>
          <Progress value={pct} className="mt-3" />
          <p className="mt-2 text-sm text-teal-900/60">
            {completed}/{lessons.length} lecciones · {formatPercent(pct)}
          </p>
        </div>
        <div className="rounded-3xl border border-teal-900/10 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-teal-900/60">
            <MessageSquare className="h-4 w-4 text-amber-500" />
            <span className="text-xs font-semibold uppercase tracking-wide">Simulaciones</span>
          </div>
          <div className="mt-2 flex items-center gap-4">
            {avgScore !== null ? (
              <ScoreRing score={avgScore} label="Última" />
            ) : (
              <p className="text-sm text-teal-900/60">Aún no hay intentos</p>
            )}
            <p className="text-sm text-teal-900/55">{state?.simulationCount ?? 0} hechas</p>
          </div>
        </div>
      </div>

      <section className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-3xl border border-teal-900/10 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-teal-950">
                Próxima lección
              </h2>
              <p className="mt-1 text-teal-900/60">{nextLesson?.summary}</p>
            </div>
            {nextLesson && <Badge>{nextLesson.duration_minutes} min</Badge>}
          </div>
          <h3 className="mt-4 text-xl font-semibold text-teal-900">{nextLesson?.title}</h3>
          <div className="mt-5 flex flex-wrap gap-3">
            {nextLesson && (
              <Link href={`/lesson/${nextLesson.id}`}>
                <Button>Continuar</Button>
              </Link>
            )}
            <Link href="/simulator">
              <Button variant="secondary">Ir al simulador</Button>
            </Link>
          </div>
        </div>

        <div className="rounded-3xl border border-teal-900/10 bg-gradient-to-br from-teal-900 to-teal-700 p-6 text-white shadow-sm">
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold">Badges</h2>
          <ul className="mt-4 space-y-3">
            <li className="rounded-2xl bg-white/10 px-4 py-3 text-sm">
              {completed > 0 ? "✨ Primeira aula" : "✨ Primeira aula — completa 1 lección"}
            </li>
            <li className="rounded-2xl bg-white/10 px-4 py-3 text-sm">
              {(state?.simulationCount ?? 0) >= 3
                ? "💬 Simulador bronze"
                : `💬 Simulador bronze — ${(state?.simulationCount ?? 0)}/3`}
            </li>
            <li className="rounded-2xl bg-white/5 px-4 py-3 text-sm text-white/50">
              🔥 Semana seguida — {streak}/7 días
            </li>
          </ul>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-teal-950">
          Historial de simulaciones
        </h2>
        <div className="mt-4 space-y-3">
          {fallbackAttempts.map((attempt) => (
            <div
              key={attempt.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-teal-900/10 bg-white px-5 py-4 shadow-sm"
            >
              <div>
                <p className="font-semibold text-teal-950">{attempt.scenario?.title}</p>
                <p className="text-sm text-teal-900/55">
                  {new Date(attempt.created_at).toLocaleString("es-CL")}
                </p>
              </div>
              <p className="text-2xl font-bold text-teal-800">{attempt.overall_score}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
