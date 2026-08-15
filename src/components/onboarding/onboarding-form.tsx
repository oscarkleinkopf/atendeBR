"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createCompany, joinCompany } from "@/lib/cloud/session";

export function OnboardingForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<"create" | "join" | null>(null);
  const [invite, setInvite] = useState<string | null>(null);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy("create");
    try {
      const result = await createCompany(name);
      setInvite(result.invite_code);
      router.replace("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo crear la empresa");
    } finally {
      setBusy(null);
    }
  }

  async function onJoin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy("join");
    try {
      await joinCompany(code);
      router.replace("/dashboard");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message.replace("invalid invite", "Código inválido")
          : "No se pudo unir",
      );
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-900/45">
        Onboarding
      </p>
      <h1 className="mt-1 font-[family-name:var(--font-display)] text-4xl font-bold text-teal-950">
        Tu empresa en atendeBR
      </h1>
      <p className="mt-2 text-teal-900/65">
        Crea el espacio de tu equipo (quedas como admin) o únete con el código de invitación.
      </p>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <form
          onSubmit={onCreate}
          className="rounded-3xl border border-teal-900/10 bg-white p-6 shadow-sm"
        >
          <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-teal-950">
            Crear empresa
          </h2>
          <label className="mt-4 block text-sm font-medium text-teal-950">
            Nombre
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Retail Andes"
              className="mt-1.5 w-full rounded-xl border border-teal-900/15 bg-[var(--sand)] px-4 py-3 text-sm outline-none ring-teal-700/30 focus:ring-2"
            />
          </label>
          <Button type="submit" className="mt-4 w-full" disabled={busy !== null}>
            {busy === "create" ? "Creando…" : "Crear y entrar"}
          </Button>
          {invite && (
            <p className="mt-3 text-sm text-teal-800">
              Código de invitación: <strong>{invite}</strong>
            </p>
          )}
        </form>

        <form
          onSubmit={onJoin}
          className="rounded-3xl border border-teal-900/10 bg-white p-6 shadow-sm"
        >
          <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-teal-950">
            Unirme con código
          </h2>
          <label className="mt-4 block text-sm font-medium text-teal-950">
            Invitación
            <input
              required
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="DEMO2026"
              className="mt-1.5 w-full rounded-xl border border-teal-900/15 bg-[var(--sand)] px-4 py-3 text-sm uppercase tracking-widest outline-none ring-teal-700/30 focus:ring-2"
            />
          </label>
          <p className="mt-2 text-xs text-teal-900/50">
            El tenant demo usa <span className="font-semibold">DEMO2026</span>.
          </p>
          <Button type="submit" variant="secondary" className="mt-4 w-full" disabled={busy !== null}>
            {busy === "join" ? "Uniendo…" : "Unirme"}
          </Button>
        </form>
      </div>
      {error && <p className="mt-4 text-sm text-rose-700">{error}</p>}
    </div>
  );
}
