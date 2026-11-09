import { describe, expect, it } from "vitest";
import { DEMO_LESSONS } from "@/lib/demo-data";
import { parseProgressInput } from "./progress-input";

describe("parseProgressInput", () => {
  it("accepts a known lesson id and clamps score", () => {
    const lessonId = DEMO_LESSONS[0]?.id;
    expect(lessonId).toBeTruthy();
    const parsed = parseProgressInput({ lessonId, score: 140, timeSpentSeconds: 12 });
    expect(parsed.ok).toBe(true);
    if (parsed.ok) expect(parsed.value.score).toBe(100);
  });

  it("rejects unknown lessons", () => {
    expect(parseProgressInput({ lessonId: "not-a-lesson" }).ok).toBe(false);
  });
});
