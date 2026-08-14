"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

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
  const [magicError, setMagicError] = useState<string | null>(null);
  const cloudReady = isSupabaseConfigured();

  async function enterDemo(role: string) {
    setLoading(role);
    const { setDemoRole } = await import("@/lib/demo-auth");
    setDemoRole(role as "collaborator" | "supervisor" | "company_admin");
    try {
      await fetch("/api/auth/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
    } catch {
      /* GitHub Pages: sin API */
    }
    router.push(search.get("next") || "/dashboard");
    router.refresh();
  }

  async function requestMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setMagicNote(null);
    setMagicError(null);
    const supabase = createClient();
    if (!supabase) {
      setMagicNote(
        "Supabase no configurado. Usa la demo multi-rol abajo (como en Ulpan sin cloud).",
      );
      return;
    }
    const redirectTo = `${window.location.origin}${process.env.NEXT_PUBLIC_BASE_PATH || ""}/auth/callback?next=${encodeURIComponent(
      search.get("next") || "/dashboard",
    )}`;
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo },
    });
    if (error) {
      setMagicError(error.message);
      return;
    }
    setMagicNote("Revisa tu correo: te enviamos un magic link (patrón Ulpan/Supabase).");
  }

  async function signInGoogle() {
    setMagicNote(null);
    setMagicError(null);
    const supabase = createClient();
    if (!supabase) {
      setMagicNote("Supabase no configurado. Usa la demo multi-rol.");
      return;
    }
    const redirectTo = `${window.location.origin}${process.env.NEXT_PUBLIC_BASE_PATH || ""}/auth/callback?next=/dashboard`;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
        queryParams: { access_type: "offline", prompt: "select_account" },
      },
    });
    if (error) setMagicError(error.message);
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
              Auth Supabase (magic link / Google), mismo enfoque que{" "}
              <a
                className="font-semibold text-teal-800 underline"
                href="https://github.com/oscarkleinkopf/Ulpan"
                target="_blank"
                rel="noreferrer"
              >
                Ulpan
              </a>
              . Cloud: {cloudReady ? "listo" : "pendiente"}.
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
              <Button type="button" variant="secondary" className="w-full" onClick={() => void signInGoogle()}>
                Continuar con Google
              </Button>
            </form>
            {magicNote && <p className="mt-3 text-sm text-teal-800">{magicNote}</p>}
            {magicError && <p className="mt-3 text-sm text-rose-700">{magicError}</p>}
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
