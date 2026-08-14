import { CollaboratorProgress } from "@/components/dashboard/collaborator-progress";
import { DEMO_LESSONS, DEMO_PATH, getDemoAttempts, DEMO_USERS } from "@/lib/demo-data";

export default function DashboardPage() {
  const userId = DEMO_USERS.collaborator.id;
  return (
    <CollaboratorProgress
      lessons={DEMO_LESSONS}
      pathTitle={DEMO_PATH.title}
      fallbackAttempts={getDemoAttempts(userId)}
      initialName={DEMO_USERS.collaborator.full_name}
    />
  );
}
