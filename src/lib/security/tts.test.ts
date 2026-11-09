import { describe, expect, it } from "vitest";
import { parseTtsQuery } from "./tts";

describe("parseTtsQuery", () => {
  it("defaults language to pt-BR and truncates long queries", () => {
    const url = new URL("https://example.test/api/tts?q=" + "a".repeat(200));
    const parsed = parseTtsQuery(url);
    expect(parsed.ok).toBe(true);
    if (parsed.ok) {
      expect(parsed.tl).toBe("pt-BR");
      expect(parsed.q).toHaveLength(180);
    }
  });

  it("rejects empty queries and unknown languages", () => {
    expect(parseTtsQuery(new URL("https://example.test/api/tts")).ok).toBe(false);
    expect(
      parseTtsQuery(new URL("https://example.test/api/tts?q=oi&tl=en-US")).ok,
    ).toBe(false);
  });
});
