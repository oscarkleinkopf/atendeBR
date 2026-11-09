import { NextResponse } from "next/server";
import { DEMO_COOKIE } from "@/lib/data/session";
import {
  assertDemoAuthAvailable,
  isDemoRole,
  signDemoRole,
} from "@/lib/security/demo-cookie";
import { parseJsonBody } from "@/lib/security/http";
import { allowRequest, clientIp } from "@/lib/security/rate-limit";

const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 15 * 60 * 1000;

export async function POST(request: Request) {
  if (!allowRequest(`demo:${clientIp(request)}`, RATE_LIMIT, RATE_WINDOW_MS)) {
    return NextResponse.json({ error: "Demasiadas solicitudes" }, { status: 429 });
  }

  const available = assertDemoAuthAvailable();
  if (!available.ok) {
    return NextResponse.json({ error: available.error }, { status: available.status });
  }

  const parsed = await parseJsonBody(request);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: parsed.status });
  }

  const role =
    typeof parsed.value === "object" &&
    parsed.value !== null &&
    "role" in parsed.value &&
    typeof (parsed.value as { role?: unknown }).role === "string"
      ? (parsed.value as { role: string }).role
      : "";

  if (!isDemoRole(role)) {
    return NextResponse.json({ error: "Rol inválido" }, { status: 400 });
  }

  const response = NextResponse.json({ ok: true, role });
  response.cookies.set(DEMO_COOKIE, signDemoRole(role, available.secret), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
    secure: process.env.NODE_ENV === "production",
  });
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(DEMO_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
  return response;
}
