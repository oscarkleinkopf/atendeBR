import { describe, expect, it } from "vitest";
import { EMPTY_PROGRESS, getServerProgressSnapshot, loadProgress } from "./progress-local";

describe("progress snapshots", () => {
  it("returns a cached object for useSyncExternalStore", () => {
    expect(getServerProgressSnapshot()).toBe(EMPTY_PROGRESS);
    expect(loadProgress()).toBe(loadProgress());
  });
});
