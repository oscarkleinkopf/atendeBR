import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#071820] text-white">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "linear-gradient(120deg, rgba(7,24,32,0.82), rgba(10,77,104,0.55)), url('https://images.unsplash.com/photo-1556745757-8d76bdb6984b?auto=format&fit=crop&w=2000&q=80')",
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(245,183,0,0.18),transparent_35%)]" />

      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-4 py-6">
        <span className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight">
          atende<span className="text-amber-400">BR</span>
        </span>
        <Link href="/login">
          <Button variant="secondary" className="border-white/20 bg-white/10 text-white hover:bg-white/20">
            Entrar
          </Button>
        </Link>
      </header>

      <main className="relative z-10 mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl flex-col justify-end px-4 pb-16 pt-24 md:justify-center md:pb-24">
        <p className="mb-4 max-w-xl text-sm font-semibold uppercase tracking-[0.25em] text-amber-300/90 animate-[fadeUp_0.7s_ease_both]">
          Para equipos chilenos que atienden Brasil
        </p>
        <h1 className="max-w-3xl font-[family-name:var(--font-display)] text-5xl font-bold leading-[1.05] tracking-tight md:text-7xl animate-[fadeUp_0.9s_ease_both]">
          atende<span className="text-amber-400">BR</span>
        </h1>
        <p className="mt-5 max-w-xl text-lg text-white/85 md:text-xl animate-[fadeUp_1.05s_ease_both]">
          Que el cliente brasileño sienta que habla con alguien que lo entiende — no con alguien que traduce.
        </p>
        <div className="mt-8 flex flex-wrap gap-3 animate-[fadeUp_1.2s_ease_both]">
          <Link href="/login">
            <Button size="lg" variant="accent">
              Probar demo
            </Button>
          </Link>
          <Link href="/login">
            <Button
              size="lg"
              variant="secondary"
              className="border-white/25 bg-transparent text-white hover:bg-white/10"
            >
              Ver rutas de aprendizaje
            </Button>
          </Link>
        </div>
      </main>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
