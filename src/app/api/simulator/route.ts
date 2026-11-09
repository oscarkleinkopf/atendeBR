import { NextResponse } from "next/server";
import { evaluateSimulation, generateCustomerReply } from "@/lib/ai/simulator";
import { getDemoSession, getScenario } from "@/lib/data/session";
import { parseJsonBody } from "@/lib/security/http";
import { allowRequest, clientIp } from "@/lib/security/rate-limit";
import { parseSimulatorInput } from "@/lib/security/simulator-input";

const RATE_LIMIT = 20;
const RATE_WINDOW_MS = 10 * 60 * 1000;

export async function POST(request: Request) {
  if (!allowRequest(`simulator:${clientIp(request)}`, RATE_LIMIT, RATE_WINDOW_MS)) {
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

  const parsed = parseSimulatorInput(parsedBody.value);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const scenario = getScenario(parsed.value.scenarioId);
  if (!scenario) {
    return NextResponse.json({ error: "Escenario no encontrado" }, { status: 404 });
  }

  if (parsed.value.action === "evaluate") {
    const score = await evaluateSimulation(scenario, parsed.value.messages);
    return NextResponse.json({
      score,
      saved: true,
      durationSeconds: parsed.value.durationSeconds,
      userId: session.profile.id,
    });
  }

  const reply = await generateCustomerReply(scenario, parsed.value.messages);
  return NextResponse.json({ reply });
}
