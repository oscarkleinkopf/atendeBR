import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { SimulatorChat } from "@/components/simulator/simulator-chat";
import { getDemoSession, getScenario } from "@/lib/data/session";

export default async function SimulatorScenarioPage({
  params,
}: {
  params: Promise<{ scenarioId: string }>;
}) {
  const session = await getDemoSession();
  if (!session) redirect("/login");

  const { scenarioId } = await params;
  const scenario = getScenario(scenarioId);
  if (!scenario) notFound();

  return (
    <AppShell profile={session.profile} companyName={session.company.name}>
      <Link href="/simulator" className="mb-4 inline-block text-sm font-medium text-teal-700 hover:underline">
        ← Todos los escenarios
      </Link>
      <SimulatorChat scenario={scenario} />
    </AppShell>
  );
}
