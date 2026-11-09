import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { LessonActions } from "@/components/learning/lesson-actions";
import { SpeakButton } from "@/components/SpeakButton";
import { DEMO_LESSONS } from "@/lib/demo-data";
import { renderMarkdown } from "@/lib/markdown";

export function generateStaticParams() {
  return DEMO_LESSONS.map((lesson) => ({ lessonId: lesson.id }));
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ lessonId: string }>;
}) {
  const { lessonId } = await params;
  const lesson = DEMO_LESSONS.find((l) => l.id === lessonId || l.slug === lessonId);
  if (!lesson) notFound();

  return (
    <>
      <Link href="/path/atencion-al-cliente" className="text-sm font-medium text-teal-700 hover:underline">
        ← Volver a la ruta
      </Link>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Badge>{lesson.lesson_type}</Badge>
        <Badge>{lesson.duration_minutes} min</Badge>
      </div>
      <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-bold text-teal-950">
        {lesson.title}
      </h1>
      <p className="mt-2 text-teal-900/65">{lesson.summary}</p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
        <article
          className="prose-lesson rounded-3xl border border-teal-900/10 bg-white p-6 shadow-sm md:p-8"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(lesson.content_md) }}
        />
        <aside className="space-y-4">
          {lesson.audio_script && (
            <div className="rounded-3xl border border-teal-900/10 bg-gradient-to-br from-teal-900 to-teal-700 p-5 text-white shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-200">
                  Guion / audio
                </p>
                <SpeakButton
                  text={lesson.audio_script}
                  label="Escuchar guion"
                  className="border-white/20 bg-white/15 text-white hover:bg-white/25"
                />
              </div>
              <p className="mt-3 text-lg leading-relaxed">{lesson.audio_script}</p>
            </div>
          )}
          {lesson.phrases_json && lesson.phrases_json.length > 0 && (
            <div className="rounded-3xl border border-teal-900/10 bg-white p-5 shadow-sm">
              <h2 className="font-[family-name:var(--font-display)] text-lg font-bold text-teal-950">
                Frases útiles
              </h2>
              <ul className="mt-3 space-y-3">
                {lesson.phrases_json.map((phrase) => (
                  <li
                    key={phrase.pt}
                    className="flex items-start justify-between gap-3 rounded-xl bg-[var(--sand)] px-3 py-2"
                  >
                    <div>
                      <p className="font-semibold text-teal-900">{phrase.pt}</p>
                      <p className="text-sm text-teal-900/60">{phrase.es}</p>
                    </div>
                    <SpeakButton text={phrase.pt} label={`Escuchar ${phrase.pt}`} />
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="rounded-3xl border border-teal-900/10 bg-white p-5 shadow-sm">
            <LessonActions lessonId={lesson.id} quiz={lesson.quiz_json} />
          </div>
        </aside>
      </div>
    </>
  );
}
