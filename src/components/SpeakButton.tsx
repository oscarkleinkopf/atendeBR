"use client";

import { useEffect, useState, type MouseEvent } from "react";
import { Volume2 } from "lucide-react";
import { prefetchPortuguese, speakPortuguese } from "@/lib/speak";
import { cn } from "@/lib/utils";

export function SpeakButton({
  text,
  label = "Escuchar",
  className,
}: {
  text: string;
  label?: string;
  className?: string;
}) {
  const [state, setState] = useState<"idle" | "speaking" | "error">("idle");

  useEffect(() => {
    if (text) prefetchPortuguese(text);
  }, [text]);

  async function onSpeak(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    e.stopPropagation();
    setState("speaking");
    const result = await speakPortuguese(text);
    if (result === "ok") {
      setState("idle");
      return;
    }
    setState("error");
    window.setTimeout(() => setState("idle"), 2000);
  }

  return (
    <button
      type="button"
      onClick={onSpeak}
      aria-label={label}
      title={
        state === "error"
          ? "No se pudo reproducir. Prueba otro navegador."
          : state === "speaking"
            ? "Reproduciendo…"
            : label
      }
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-full border border-teal-900/15 bg-white text-teal-800 transition hover:bg-teal-50",
        state === "speaking" && "animate-pulse bg-amber-100 text-amber-800",
        state === "error" && "bg-rose-100 text-rose-700",
        className,
      )}
    >
      <Volume2 className="h-4 w-4" />
    </button>
  );
}
