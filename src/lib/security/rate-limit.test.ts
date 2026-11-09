import { describe, expect, it } from "vitest";
import { allowRequest, clientIp, resetRateLimitForTests } from "./rate-limit";

describe("allowRequest", () => {
  it("allows up to the limit inside the window, then blocks", () => {
    resetRateLimitForTests();
    const start = 1_000_000;
    expect(allowRequest("ip-a", 2, 60_000, start)).toBe(true);
    expect(allowRequest("ip-a", 2, 60_000, start + 10)).toBe(true);
    expect(allowRequest("ip-a", 2, 60_000, start + 20)).toBe(false);
    expect(allowRequest("ip-b", 2, 60_000, start + 20)).toBe(true);
  });

  it("replenishes after the window elapses", () => {
    resetRateLimitForTests();
    const start = 2_000_000;
    expect(allowRequest("ip-c", 1, 1_000, start)).toBe(true);
    expect(allowRequest("ip-c", 1, 1_000, start + 999)).toBe(false);
    expect(allowRequest("ip-c", 1, 1_000, start + 1_000)).toBe(true);
  });
});

describe("clientIp", () => {
  it("prefers the first x-forwarded-for hop", () => {
    const request = new Request("http://localhost/api/tts", {
      headers: {
        "x-forwarded-for": "203.0.113.9, 10.0.0.1",
        "x-real-ip": "10.0.0.1",
      },
    });
    expect(clientIp(request)).toBe("203.0.113.9");
  });
});
