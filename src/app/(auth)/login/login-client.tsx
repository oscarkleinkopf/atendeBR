"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const roles = [
  {
    id: "collaborator",
    title: "Colaborador",
    description: "Dashboard, lecciones, simulador y rachas.",
  },
  {
    id: "supervisor",
    title: "Supervisor",
    description: "Ve avance del equipo y quién está atrasado.",
  },
  {
    id: "company_admin",
    title: "Admin empresa",
    description: "Visibilidad completa del tenant demo.",
  },
] as const;

export default function LoginPage() {
  const router = useRouter();
  const search = useSearchParams();
  const [loading, setLoading] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [magicNote, setMagicNote] = useState<string | null>(null);

  async function enterDemo(role: string) {
    setLoading(role);
    await fetch("/api/auth/demo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    router.push(search.get("next") || "/dashboard");
    router.refresh();
  }

  function requestMagicLink(e?: React.FormEvent) {
    e?.preventDefault();
    setMagicNote(
      "Magic link / Google se activan al conectar Supabase Auth. Por ahora usa la demo multi-rol.",
    );
  }

  return (
    <div className="relative min-h-screen bg-[var(--sand)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(10,77,104,0.12),_transparent_55%),radial-gradient(ellipse_at_bottom_right,_rgba(245,183,0,0.16),_transparent_40%)]" />
      <div className="relative mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-4 py-12">
        <Link
          href="/"
          className="mb-8 font-[family-name:var(--font-display)] text-3xl font-bold text-teal-900"
        >
          atende<span className="text-amber-500">BR</span>
        </Link>

        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-3xl border border-teal-900/10 bg-white p-8 shadow-sm">
            <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-teal-950">
              Entra a tu espacio
            </h1>
            <p className="mt-2 text-teal-900/65">
              Login con email + magic link o Google (Supabase). Para el MVP, elige un rol demo.
            </p>

            <form onSubmit={requestMagicLink} className="mt-6 space-y-3">
              <label className="block text-sm font-medium text-teal-950">
                Email corporativo
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@empresa.cl"
                  className="mt-1.5 w-full rounded-xl border border-teal-900/15 bg-[var(--sand)] px-4 py-3 text-sm outline-none ring-teal-700/30 focus:ring-2"
                />
              </label>
              <Button type="submit" className="w-full">
                Enviar magic link
              </Button>
              <Button type="button" variant="secondary" className="w-full" onClick={() => requestMagicLink()}>
                Continuar con Google
              </Button>
            </form>
            {magicNote && <p className="mt-3 text-sm text-amber-800">{magicNote}</p>}
          </section>

          <section className="space-y-3">
            <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-teal-950">
              Demo multi-tenant
            </h2>
            {roles.map((role) => (
              <button
                key={role.id}
                onClick={() => void enterDemo(role.id)}
                disabled={!!loading}
                className="w-full rounded-2xl border border-teal-900/10 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-teal-700/30 hover:shadow-md"
              >
                <p className="font-semibold text-teal-950">{role.title}</p>
                <p className="mt-1 text-sm text-teal-900/60">{role.description}</p>
                <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-amber-600">
                  {loading === role.id ? "Entrando…" : "Entrar como demo"}
                </p>
              </button>
            ))}
          </section>
        </div>
      </div>
    </div>
  );
}
