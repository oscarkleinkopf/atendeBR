"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  loadProgress,
  markLessonComplete,
  saveProgress,
} from "@/lib/progress-local";
import type { QuizQuestion } from "@/types";

export function LessonActions({
  lessonId,
  quiz,
}: {
  lessonId: string;
  quiz?: { questions: QuizQuestion[] } | null;
}) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [saving, setSaving] = useState(false);
  const [quizResult, setQuizResult] = useState<number | null>(null);

  function gradeQuiz() {
    if (!quiz?.questions?.length) return 100;
    let correct = 0;
    quiz.questions.forEach((q, i) => {
      if (answers[i] === q.answer) correct += 1;
    });
    return Math.round((correct / quiz.questions.length) * 100);
  }

  async function complete() {
    setSaving(true);
    const score = gradeQuiz();
    setQuizResult(score);
    const next = markLessonComplete(loadProgress(), lessonId, score);
    saveProgress(next);
    window.dispatchEvent(new Event("atendebr-progress"));
    try {
      const { saveLessonProgressCloud } = await import("@/lib/cloud/session");
      await saveLessonProgressCloud(lessonId, score, 360);
    } catch {
      /* demo / Pages */
    }
    try {
      await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId, score, timeSpentSeconds: 360 }),
      });
    } catch {
      /* Pages static */
    }
    setSaving(false);
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      {quiz?.questions?.map((question, qi) => (
        <div key={question.q} className="rounded-2xl border border-teal-900/10 bg-white p-4">
          <p className="font-semibold text-teal-950">{question.q}</p>
          <div className="mt-3 space-y-2">
            {question.options.map((option, oi) => (
              <label
                key={option}
                className="flex cursor-pointer items-center gap-3 rounded-xl bg-[var(--sand)] px-3 py-2 text-sm"
              >
                <input
                  type="radio"
                  name={`q-${qi}`}
                  checked={answers[qi] === oi}
                  onChange={() => setAnswers((prev) => ({ ...prev, [qi]: oi }))}
                />
                {option}
              </label>
            ))}
          </div>
        </div>
      ))}
      {quizResult !== null && (
        <p className="text-sm font-medium text-teal-800">Quiz: {quizResult}%</p>
      )}
      <Button onClick={() => void complete()} disabled={saving} size="lg">
        {saving ? "Guardando…" : "Marcar lección como completada"}
      </Button>
    </div>
  );
}
