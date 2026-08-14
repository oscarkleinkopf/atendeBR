import { redirect } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  getDemoSession,
  getLearningPath,
  getProgressForUser,
} from "@/lib/data/session";
import { formatPercent } from "@/lib/utils";

export default async function PathPage() {
  const session = await getDemoSession();
  if (!session) redirect("/login");

  const path = getLearningPath();
  const lessons = path.lessons ?? [];
  const progress = await getProgressForUser(session.profile.id);
  const completed = progress.filter((p) => p.status === "completed").length;
  const pct = (completed / lessons.length) * 100;

  return (
    <AppShell profile={session.profile} companyName={session.company.name}>
      <div className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-teal-900/45">
        Ruta de aprendizaje
      </div>
      <h1 className="font-[family-name:var(--font-display)] text-4xl font-bold text-teal-950">
        {path.title}
      </h1>
      <p className="mt-2 max-w-2xl text-teal-900/65">{path.description}</p>
      <div className="mt-6 max-w-md">
        <Progress value={pct} />
        <p className="mt-2 text-sm text-teal-900/60">
          {completed}/{lessons.length} · {formatPercent(pct)} · ~{path.estimated_hours}h
        </p>
      </div>

      <ol className="mt-8 space-y-3">
        {lessons.map((lesson, index) => {
          const status =
            progress.find((p) => p.lesson_id === lesson.id)?.status ?? "not_started";
          return (
            <li key={lesson.id}>
              <Link
                href={`/lesson/${lesson.id}`}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-teal-900/10 bg-white px-5 py-4 shadow-sm transition hover:-translate-y-0.5 hover:border-teal-700/25"
              >
                <div className="flex items-start gap-4">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-900 text-sm font-bold text-white">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-semibold text-teal-950">{lesson.title}</p>
                    <p className="text-sm text-teal-900/60">{lesson.summary}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge>{lesson.duration_minutes} min</Badge>
                  <Badge
                    className={
                      status === "completed"
                        ? "bg-emerald-100 text-emerald-800"
                        : status === "in_progress"
                          ? "bg-amber-100 text-amber-900"
                          : ""
                    }
                  >
                    {status === "completed"
                      ? "Hecha"
                      : status === "in_progress"
                        ? "En curso"
                        : "Nueva"}
                  </Badge>
                </div>
              </Link>
            </li>
          );
        })}
      </ol>
    </AppShell>
  );
}
