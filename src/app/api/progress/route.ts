import { NextResponse } from "next/server";
import { getDemoSession } from "@/lib/data/session";

export async function POST(request: Request) {
  const session = await getDemoSession();
  if (!session) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const body = (await request.json()) as {
    lessonId: string;
    score?: number;
    timeSpentSeconds?: number;
  };

  return NextResponse.json({
    ok: true,
    lessonId: body.lessonId,
    status: "completed",
    score: body.score ?? 100,
    userId: session.profile.id,
  });
}
