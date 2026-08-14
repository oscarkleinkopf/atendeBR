import { NextResponse } from "next/server";
import { DEMO_COOKIE } from "@/lib/data/session";

export async function POST(request: Request) {
  const body = (await request.json()) as { role?: string };
  const role = body.role;
  if (!role || !["collaborator", "supervisor", "company_admin"].includes(role)) {
    return NextResponse.json({ error: "Rol inválido" }, { status: 400 });
  }

  const response = NextResponse.json({ ok: true, role });
  response.cookies.set(DEMO_COOKIE, role, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  });
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(DEMO_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
  return response;
}
