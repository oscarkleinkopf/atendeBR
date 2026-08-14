import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { LessonActions } from "@/components/learning/lesson-actions";
import { SpeakButton } from "@/components/SpeakButton";
import { getDemoSession, getLesson } from "@/lib/data/session";

function renderMarkdown(md: string) {
  // Minimal markdown for MVP content (headings, lists, bold, italic, tables)
  const lines = md.split("\n");
  const html: string[] = [];
  let inUl = false;
  let inTable = false;

  const closeUl = () => {
    if (inUl) {
      html.push("</ul>");
      inUl = false;
    }
  };
  const closeTable = () => {
    if (inTable) {
      html.push("</tbody></table>");
      inTable = false;
    }
  };

  const inline = (text: string) =>
    text
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>")
      .replace(/`(.+?)`/g, "<code>$1</code>");

  for (const line of lines) {
    if (line.startsWith("|")) {
      closeUl();
      const cells = line
        .split("|")
        .slice(1, -1)
        .map((c) => c.trim());
      if (cells.every((c) => /^:?-+:?$/.test(c))) continue;
      if (!inTable) {
        html.push("<table><tbody>");
        inTable = true;
        html.push(`<tr>${cells.map((c) => `<th>${inline(c)}</th>`).join("")}</tr>`);
      } else {
        html.push(`<tr>${cells.map((c) => `<td>${inline(c)}</td>`).join("")}</tr>`);
      }
      continue;
    }
    closeTable();

    if (line.startsWith("# ")) {
      closeUl();
      html.push(`<h1>${inline(line.slice(2))}</h1>`);
    } else if (line.startsWith("## ")) {
      closeUl();
      html.push(`<h2>${inline(line.slice(3))}</h2>`);
    } else if (line.startsWith("- ")) {
      if (!inUl) {
        html.push("<ul>");
        inUl = true;
      }
      html.push(`<li>${inline(line.slice(2))}</li>`);
    } else if (line.trim() === "") {
      closeUl();
    } else if (/^\d+\.\s/.test(line)) {
      closeUl();
      html.push(`<p>${inline(line)}</p>`);
    } else {
      closeUl();
      html.push(`<p>${inline(line)}</p>`);
    }
  }
  closeUl();
  closeTable();
  return html.join("\n");
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ lessonId: string }>;
}) {
  const session = await getDemoSession();
  if (!session) redirect("/login");

  const { lessonId } = await params;
  const lesson = getLesson(lessonId);
  if (!lesson) notFound();

  return (
    <AppShell profile={session.profile} companyName={session.company.name}>
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
              <p className="mt-4 text-xs text-teal-100/70">
                TTS pt-BR (patrón Ulpan: Web Speech → /api/tts → Google TTS).
              </p>
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
    </AppShell>
  );
}
