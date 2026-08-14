import { redirect } from "next/navigation";
import Link from "next/link";
import { Flame, MessageSquare, Trophy } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScoreRing } from "@/components/dashboard/score-ring";
import {
  getAttemptsForUser,
  getDemoSession,
  getLearningPath,
  getProgressForUser,
} from "@/lib/data/session";
import { formatPercent, scoreColor } from "@/lib/utils";

export default async function DashboardPage() {
  const session = await getDemoSession();
  if (!session) redirect("/login");

  const path = getLearningPath();
  const lessons = path.lessons ?? [];
  const progress = await getProgressForUser(session.profile.id);
  const attempts = await getAttemptsForUser(session.profile.id);
  const completed = progress.filter((p) => p.status === "completed").length;
  const pct = (completed / lessons.length) * 100;
  const nextLesson =
    lessons.find((l) => !progress.some((p) => p.lesson_id === l.id && p.status === "completed")) ??
    lessons[0];
  const avgScore =
    attempts.length > 0
      ? Math.round(
          attempts.reduce((acc, a) => acc + (a.overall_score ?? 0), 0) / attempts.length,
        )
      : null;

  return (
    <AppShell profile={session.profile} companyName={session.company.name}>
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-900/45">
          Hola, {session.profile.full_name.split(" ")[0]}
        </p>
        <h1 className="mt-1 font-[family-name:var(--font-display)] text-4xl font-bold text-teal-950">
          Tu progreso
        </h1>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-teal-900/10 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-teal-900/60">
            <Flame className="h-4 w-4 text-amber-500" />
            <span className="text-xs font-semibold uppercase tracking-wide">Racha</span>
          </div>
          <p className="mt-3 font-[family-name:var(--font-display)] text-4xl font-bold text-teal-950">
            {session.profile.streak_days}
            <span className="text-lg font-semibold text-teal-900/50"> días</span>
          </p>
        </div>
        <div className="rounded-3xl border border-teal-900/10 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-teal-900/60">
            <Trophy className="h-4 w-4 text-amber-500" />
            <span className="text-xs font-semibold uppercase tracking-wide">Ruta actual</span>
          </div>
          <p className="mt-3 text-lg font-semibold text-teal-950">{path.title}</p>
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
              <ScoreRing score={avgScore} label="Promedio" />
            ) : (
              <p className="text-sm text-teal-900/60">Aún no hay intentos</p>
            )}
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
              <p className="mt-1 text-teal-900/60">{nextLesson.summary}</p>
            </div>
            <Badge>{nextLesson.duration_minutes} min</Badge>
          </div>
          <h3 className="mt-4 text-xl font-semibold text-teal-900">{nextLesson.title}</h3>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href={`/lesson/${nextLesson.id}`}>
              <Button>Continuar</Button>
            </Link>
            <Link href="/simulator">
              <Button variant="secondary">Ir al simulador</Button>
            </Link>
          </div>
        </div>

        <div className="rounded-3xl border border-teal-900/10 bg-gradient-to-br from-teal-900 to-teal-700 p-6 text-white shadow-sm">
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold">Badges</h2>
          <ul className="mt-4 space-y-3">
            <li className="rounded-2xl bg-white/10 px-4 py-3 text-sm">✨ Primeira aula</li>
            <li className="rounded-2xl bg-white/10 px-4 py-3 text-sm">💬 Simulador bronze</li>
            <li className="rounded-2xl bg-white/5 px-4 py-3 text-sm text-white/50">
              🔥 Semana seguida — 3 días más
            </li>
          </ul>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-teal-950">
          Historial de simulaciones
        </h2>
        <div className="mt-4 space-y-3">
          {attempts.map((attempt) => (
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
              <p className={`text-2xl font-bold ${scoreColor(attempt.overall_score ?? 0)}`}>
                {attempt.overall_score}
              </p>
            </div>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
