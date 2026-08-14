import Link from "next/link";
import { notFound } from "next/navigation";
import { SimulatorChat } from "@/components/simulator/simulator-chat";
import { DEMO_SCENARIOS } from "@/lib/demo-data";

export function generateStaticParams() {
  return DEMO_SCENARIOS.map((scenario) => ({ scenarioId: scenario.id }));
}

export default async function SimulatorScenarioPage({
  params,
}: {
  params: Promise<{ scenarioId: string }>;
}) {
  const { scenarioId } = await params;
  const scenario = DEMO_SCENARIOS.find((s) => s.id === scenarioId || s.slug === scenarioId);
  if (!scenario) notFound();

  return (
    <>
      <Link href="/simulator" className="mb-4 inline-block text-sm font-medium text-teal-700 hover:underline">
        ← Todos los escenarios
      </Link>
      <SimulatorChat scenario={scenario} />
    </>
  );
}
