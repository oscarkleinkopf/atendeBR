"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { loadProgress } from "@/lib/progress-local";
import { formatPercent } from "@/lib/utils";
import type { Lesson } from "@/types";

export function PathLessonList({
  lessons,
  pathTitle,
  pathDescription,
  estimatedHours,
}: {
  lessons: Lesson[];
  pathTitle: string;
  pathDescription: string;
  estimatedHours: number;
}) {
  const [completed, setCompleted] = useState<string[]>([]);

  useEffect(() => {
    const refresh = () => setCompleted(loadProgress().completedLessons);
    refresh();
    window.addEventListener("atendebr-progress", refresh);
    void (async () => {
      const { fetchMyLessonCompletions } = await import("@/lib/cloud/session");
      const ids = await fetchMyLessonCompletions();
      if (ids.length) {
        setCompleted((prev) => Array.from(new Set([...prev, ...ids])));
      }
    })();
    return () => window.removeEventListener("atendebr-progress", refresh);
  }, []);

  const pct = lessons.length ? (completed.length / lessons.length) * 100 : 0;

  return (
    <>
      <div className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-teal-900/45">
        Ruta de aprendizaje
      </div>
      <h1 className="font-[family-name:var(--font-display)] text-4xl font-bold text-teal-950">
        {pathTitle}
      </h1>
      <p className="mt-2 max-w-2xl text-teal-900/65">{pathDescription}</p>
      <div className="mt-6 max-w-md">
        <Progress value={pct} />
        <p className="mt-2 text-sm text-teal-900/60">
          {completed.length}/{lessons.length} · {formatPercent(pct)} · ~{estimatedHours}h
        </p>
      </div>

      <ol className="mt-8 space-y-3">
        {lessons.map((lesson, index) => {
          const done = completed.includes(lesson.id);
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
                  <Badge className={done ? "bg-emerald-100 text-emerald-800" : ""}>
                    {done ? "Hecha" : "Nueva"}
                  </Badge>
                </div>
              </Link>
            </li>
          );
        })}
      </ol>
    </>
  );
}
