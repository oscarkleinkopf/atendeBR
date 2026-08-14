import { PathLessonList } from "@/components/learning/path-lesson-list";
import { DEMO_LESSONS, DEMO_PATH } from "@/lib/demo-data";

export function generateStaticParams() {
  return [{ pathSlug: DEMO_PATH.slug }, { pathSlug: "atencion-al-cliente" }];
}

export default function PathPage() {
  return (
    <PathLessonList
      lessons={DEMO_LESSONS}
      pathTitle={DEMO_PATH.title}
      pathDescription={DEMO_PATH.description}
      estimatedHours={DEMO_PATH.estimated_hours}
    />
  );
}
