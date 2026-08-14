import { PhrasesLibrary } from "@/components/learning/phrases-library";
import { DEMO_LESSONS } from "@/lib/demo-data";

export default function PhrasesPage() {
  const phrases = DEMO_LESSONS.flatMap((lesson) =>
    (lesson.phrases_json ?? []).map((phrase) => ({
      ...phrase,
      lessonTitle: lesson.title,
    })),
  );
  return <PhrasesLibrary phrases={phrases} />;
}
