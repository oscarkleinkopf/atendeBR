import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { CollaboratorProgress } from "@/components/dashboard/collaborator-progress";
import {
  getAttemptsForUser,
  getDemoSession,
  getLearningPath,
} from "@/lib/data/session";

export default async function DashboardPage() {
  const session = await getDemoSession();
  if (!session) redirect("/login");

  const path = getLearningPath();
  const lessons = path.lessons ?? [];
  const attempts = await getAttemptsForUser(session.profile.id);

  return (
    <AppShell profile={session.profile} companyName={session.company.name}>
      <CollaboratorProgress
        lessons={lessons}
        pathTitle={path.title}
        fallbackAttempts={attempts}
        initialName={session.profile.full_name}
      />
    </AppShell>
  );
}
