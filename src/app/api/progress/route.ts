import { NextResponse } from "next/server";
import { getDemoSession } from "@/lib/data/session";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const demo = await getDemoSession();
  const supabase = await createClient();
  const user = supabase ? (await supabase.auth.getUser()).data.user : null;

  if (!demo && !user) {
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
    userId: user?.id ?? demo?.profile.id,
  });
}
