import { NextResponse } from "next/server";
import { evaluateSimulation, generateCustomerReply } from "@/lib/ai/simulator";
import { getDemoSession, getScenario } from "@/lib/data/session";
import { createClient } from "@/lib/supabase/server";
import type { ChatMessage } from "@/types";

export async function POST(request: Request) {
  const demo = await getDemoSession();
  const supabase = await createClient();
  const user = supabase ? (await supabase.auth.getUser()).data.user : null;

  if (!demo && !user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const body = (await request.json()) as {
    scenarioId: string;
    messages: ChatMessage[];
    action: "continue" | "evaluate";
    durationSeconds?: number;
  };

  const scenario = getScenario(body.scenarioId);
  if (!scenario) {
    return NextResponse.json({ error: "Escenario no encontrado" }, { status: 404 });
  }

  if (body.action === "evaluate") {
    const score = await evaluateSimulation(scenario, body.messages ?? []);
    return NextResponse.json({
      score,
      saved: true,
      durationSeconds: body.durationSeconds ?? 0,
      userId: user?.id ?? demo?.profile.id,
    });
  }

  const reply = await generateCustomerReply(scenario, body.messages ?? []);
  return NextResponse.json({ reply });
}
