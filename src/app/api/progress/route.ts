import { NextResponse } from "next/server";
import { getDemoSession } from "@/lib/data/session";
import { parseJsonBody } from "@/lib/security/http";
import { parseProgressInput } from "@/lib/security/progress-input";
import { allowRequest, clientIp } from "@/lib/security/rate-limit";

const RATE_LIMIT = 40;
const RATE_WINDOW_MS = 10 * 60 * 1000;

export async function POST(request: Request) {
  if (!allowRequest(`progress:${clientIp(request)}`, RATE_LIMIT, RATE_WINDOW_MS)) {
    return NextResponse.json({ error: "Demasiadas solicitudes" }, { status: 429 });
  }

  const session = await getDemoSession();
  if (!session) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const parsedBody = await parseJsonBody(request);
  if (!parsedBody.ok) {
    return NextResponse.json({ error: parsedBody.error }, { status: parsedBody.status });
  }

  const parsed = parseProgressInput(parsedBody.value);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    lessonId: parsed.value.lessonId,
    status: "completed",
    score: parsed.value.score,
    userId: session.profile.id,
  });
}
