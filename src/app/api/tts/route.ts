import { NextResponse } from "next/server";
import { getDemoSession } from "@/lib/data/session";
import { MAX_TTS_AUDIO_BYTES, readBodyWithLimit } from "@/lib/security/http";
import { allowRequest, clientIp } from "@/lib/security/rate-limit";
import { parseTtsQuery } from "@/lib/security/tts";

const RATE_LIMIT = 30;
const RATE_WINDOW_MS = 10 * 60 * 1000;

export async function GET(request: Request) {
  if (!allowRequest(`tts:${clientIp(request)}`, RATE_LIMIT, RATE_WINDOW_MS)) {
    return NextResponse.json({ error: "Demasiadas solicitudes" }, { status: 429 });
  }

  const session = await getDemoSession();
  if (!session) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const parsed = parseTtsQuery(new URL(request.url));
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const tts = new URL("https://translate.google.com/translate_tts");
  tts.searchParams.set("ie", "UTF-8");
  tts.searchParams.set("client", "tw-ob");
  tts.searchParams.set("tl", parsed.tl);
  tts.searchParams.set("q", parsed.q);

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

  const audio = await readBodyWithLimit(upstream.body, MAX_TTS_AUDIO_BYTES);
  if (!audio.ok) {
    return new NextResponse("TTS response too large", { status: 502 });
  }

  return new NextResponse(Buffer.from(audio.bytes), {
    status: 200,
    headers: {
      "Content-Type": "audio/mpeg",
      "Cache-Control": "private, max-age=86400",
    },
  });
}
