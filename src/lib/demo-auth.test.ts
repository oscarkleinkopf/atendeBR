import { describe, expect, it } from "vitest";
import { getClientDemoSession } from "./demo-auth";

describe("getClientDemoSession", () => {
  it("returns a stable snapshot when the role has not changed", () => {
    expect(getClientDemoSession()).toBe(getClientDemoSession());
  });
});
