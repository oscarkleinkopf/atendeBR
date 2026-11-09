import { describe, expect, it } from "vitest";
import {
  MAX_MESSAGE_CHARS,
  MAX_SIMULATOR_MESSAGES,
  parseSimulatorInput,
} from "./simulator-input";

const valid = {
  scenarioId: "d0000001-0000-0000-0000-000000000001",
  action: "continue" as const,
  messages: [
    { role: "customer", content: "Oi", at: "2026-01-01T00:00:00.000Z" },
    { role: "agent", content: "Olá, posso ajudar?" },
  ],
  durationSeconds: 12,
};

describe("parseSimulatorInput", () => {
  it("accepts a well-formed payload", () => {
    const parsed = parseSimulatorInput(valid);
    expect(parsed.ok).toBe(true);
    if (parsed.ok) {
      expect(parsed.value.messages).toHaveLength(2);
      expect(parsed.value.durationSeconds).toBe(12);
    }
  });

  it("rejects extra-large transcripts and overlong messages", () => {
    const tooMany = {
      ...valid,
      messages: Array.from({ length: MAX_SIMULATOR_MESSAGES + 1 }, () => ({
        role: "agent",
        content: "oi",
      })),
    };
    expect(parseSimulatorInput(tooMany).ok).toBe(false);

    const tooLong = {
      ...valid,
      messages: [{ role: "agent", content: "x".repeat(MAX_MESSAGE_CHARS + 1) }],
    };
    expect(parseSimulatorInput(tooLong).ok).toBe(false);
  });

  it("rejects unknown actions, roles, and scenario ids", () => {
    expect(parseSimulatorInput({ ...valid, action: "hack" }).ok).toBe(false);
    expect(
      parseSimulatorInput({
        ...valid,
        messages: [{ role: "root", content: "oi" }],
      }).ok,
    ).toBe(false);
    expect(parseSimulatorInput({ ...valid, scenarioId: "../etc/passwd" }).ok).toBe(false);
    expect(parseSimulatorInput("not-an-object").ok).toBe(false);
  });
});
