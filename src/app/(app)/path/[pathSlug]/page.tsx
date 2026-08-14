import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { PathLessonList } from "@/components/learning/path-lesson-list";
import { getDemoSession, getLearningPath } from "@/lib/data/session";

export default async function PathPage() {
  const session = await getDemoSession();
  if (!session) redirect("/login");

  const path = getLearningPath();
  const lessons = path.lessons ?? [];

  return (
    <AppShell profile={session.profile} companyName={session.company.name}>
      <PathLessonList
        lessons={lessons}
        pathTitle={path.title}
        pathDescription={path.description}
        estimatedHours={path.estimated_hours}
      />
    </AppShell>
  );
}
