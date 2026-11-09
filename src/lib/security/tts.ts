const ALLOWED_TTS_LANGS = new Set(["pt-BR", "pt", "es", "es-CL", "es-ES"]);

export const MAX_TTS_QUERY_CHARS = 180;

export function parseTtsQuery(
  url: URL,
): { ok: true; q: string; tl: string } | { ok: false; error: string } {
  const q = (url.searchParams.get("q") || "").trim().slice(0, MAX_TTS_QUERY_CHARS);
  const tl = (url.searchParams.get("tl") || "pt-BR").trim();
  if (!q) return { ok: false, error: "missing q" };
  if (!ALLOWED_TTS_LANGS.has(tl)) return { ok: false, error: "unsupported tl" };
  return { ok: true, q, tl };
}
