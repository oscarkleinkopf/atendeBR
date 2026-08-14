import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { difficultyLabel } from "@/lib/utils";
import { DEMO_SCENARIOS } from "@/lib/demo-data";

export default function SimulatorIndexPage() {
  return (
    <>
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-900/45">
        Diferenciador core
      </p>
      <h1 className="mt-1 font-[family-name:var(--font-display)] text-4xl font-bold text-teal-950">
        Simulador de conversaciones
      </h1>
      <p className="mt-2 max-w-2xl text-teal-900/65">
        Role-play con un cliente brasileño. Responde en portugués y recibe score de lenguaje, tono,
        cultura y empatía.
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {DEMO_SCENARIOS.map((scenario) => (
          <Link
            key={scenario.id}
            href={`/simulator/${scenario.id}`}
            className="group rounded-3xl border border-teal-900/10 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-teal-700/30 hover:shadow-md"
          >
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-teal-950 group-hover:text-teal-800">
                {scenario.title}
              </h2>
              <Badge>{difficultyLabel(scenario.difficulty)}</Badge>
            </div>
            <p className="mt-2 text-sm text-teal-900/65">{scenario.description}</p>
            <p className="mt-4 text-xs font-medium text-teal-900/45">{scenario.customer_persona}</p>
          </Link>
        ))}
      </div>
    </>
  );
}
