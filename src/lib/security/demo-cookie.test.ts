import { afterEach, describe, expect, it } from "vitest";
import {
  assertDemoAuthAvailable,
  getDemoAuthSecret,
  isDemoAuthEnabled,
  isDemoRole,
  signDemoRole,
  verifyDemoCookie,
} from "./demo-cookie";

const ENV_KEYS = ["DEMO_AUTH_ENABLED", "DEMO_AUTH_SECRET", "NODE_ENV"] as const;
const originalEnv: Record<string, string | undefined> = {};

function snapshotEnv() {
  for (const key of ENV_KEYS) originalEnv[key] = process.env[key];
}

function restoreEnv() {
  for (const key of ENV_KEYS) {
    const value = originalEnv[key];
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
}

afterEach(() => {
  restoreEnv();
});

snapshotEnv();

describe("demo cookie signing", () => {
  it("round-trips a signed role", () => {
    const token = signDemoRole("supervisor", "unit-test-secret");
    expect(verifyDemoCookie(token, "unit-test-secret")).toBe("supervisor");
  });

  it("rejects unsigned role values and tampering", () => {
    expect(verifyDemoCookie("company_admin", "unit-test-secret")).toBeNull();
    const token = signDemoRole("collaborator", "unit-test-secret");
    expect(verifyDemoCookie(token.replace("collaborator", "company_admin"), "unit-test-secret")).toBeNull();
    expect(verifyDemoCookie(`${token}a`, "unit-test-secret")).toBeNull();
    expect(verifyDemoCookie(token, "other-secret")).toBeNull();
  });

  it("accepts only known demo roles", () => {
    expect(isDemoRole("company_admin")).toBe(true);
    expect(isDemoRole("super_admin")).toBe(false);
  });
});

describe("demo auth gates", () => {
  it("is off in production unless DEMO_AUTH_ENABLED=true", () => {
    process.env.NODE_ENV = "production";
    delete process.env.DEMO_AUTH_ENABLED;
    expect(isDemoAuthEnabled()).toBe(false);
    process.env.DEMO_AUTH_ENABLED = "true";
    expect(isDemoAuthEnabled()).toBe(true);
  });

  it("refuses production without DEMO_AUTH_SECRET", () => {
    process.env.NODE_ENV = "production";
    process.env.DEMO_AUTH_ENABLED = "true";
    delete process.env.DEMO_AUTH_SECRET;
    expect(getDemoAuthSecret()).toBeNull();
    expect(assertDemoAuthAvailable()).toEqual({
      ok: false,
      status: 503,
      error: "DEMO_AUTH_SECRET no configurado",
    });
  });

  it("uses a non-production fallback secret in development", () => {
    process.env.NODE_ENV = "development";
    delete process.env.DEMO_AUTH_SECRET;
    delete process.env.DEMO_AUTH_ENABLED;
    expect(isDemoAuthEnabled()).toBe(true);
    expect(getDemoAuthSecret()).toBe("atendebr-dev-only-not-for-production");
    expect(assertDemoAuthAvailable().ok).toBe(true);
  });
});
