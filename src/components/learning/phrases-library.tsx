"use client";

import { Button } from "@/components/ui/button";
import { SpeakButton } from "@/components/SpeakButton";

type PhraseRow = { pt: string; es: string; note?: string; lessonTitle: string };

export function PhrasesLibrary({ phrases }: { phrases: PhraseRow[] }) {
  const csv = [
    "portugues,espanol,nota,leccion",
    ...phrases.map((p) =>
      [`"${p.pt}"`, `"${p.es}"`, `"${p.note ?? ""}"`, `"${p.lessonTitle}"`].join(","),
    ),
  ].join("\n");

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-900/45">
            Biblioteca
          </p>
          <h1 className="mt-1 font-[family-name:var(--font-display)] text-4xl font-bold text-teal-950">
            Frases útiles
          </h1>
          <p className="mt-2 text-teal-900/65">
            Colección descargable del contenido MVP de Atención al Cliente.
          </p>
        </div>
        <a
          href={`data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`}
          download="atendebr-frases-utiles.csv"
        >
          <Button variant="accent">Descargar CSV</Button>
        </a>
      </div>

      <div className="mt-8 grid gap-3 md:grid-cols-2">
        {phrases.map((phrase) => (
          <div
            key={`${phrase.lessonTitle}-${phrase.pt}`}
            className="flex items-start justify-between gap-3 rounded-2xl border border-teal-900/10 bg-white px-5 py-4 shadow-sm"
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-teal-900/40">
                {phrase.lessonTitle}
              </p>
              <p className="mt-1 text-lg font-semibold text-teal-950">{phrase.pt}</p>
              <p className="text-sm text-teal-900/65">{phrase.es}</p>
              {phrase.note && <p className="mt-2 text-xs text-amber-800">{phrase.note}</p>}
            </div>
            <SpeakButton text={phrase.pt} />
          </div>
        ))}
      </div>
    </>
  );
}
