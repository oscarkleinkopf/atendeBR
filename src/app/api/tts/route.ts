import { NextResponse } from "next/server";

/**
 * Proxy TTS pt-BR (patrón Ulpan /api/tts).
 * GET /api/tts?q=Oi+tudo+bem&tl=pt-BR
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const q = (url.searchParams.get("q") || "").trim().slice(0, 180);
  const tl = (url.searchParams.get("tl") || "pt-BR").trim();

  if (!q) {
    return NextResponse.json({ error: "missing q" }, { status: 400 });
  }

  const tts = new URL("https://translate.google.com/translate_tts");
  tts.searchParams.set("ie", "UTF-8");
  tts.searchParams.set("client", "tw-ob");
  tts.searchParams.set("tl", tl);
  tts.searchParams.set("q", q);

  const upstream = await fetch(tts.toString(), {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Accept: "audio/mpeg,audio/*;q=0.9,*/*;q=0.8",
    },
  });

  if (!upstream.ok) {
    return new NextResponse("TTS upstream error", { status: 502 });
  }

  const buf = await upstream.arrayBuffer();
  return new NextResponse(buf, {
    status: 200,
    headers: {
      "Content-Type": "audio/mpeg",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
