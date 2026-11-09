import { afterEach, describe, expect, it } from "vitest";
import { resetRateLimitForTests } from "@/lib/security/rate-limit";
import { POST } from "./route";

const ENV_KEYS = ["DEMO_AUTH_ENABLED", "DEMO_AUTH_SECRET", "NODE_ENV"] as const;
const originalEnv: Record<string, string | undefined> = {};

for (const key of ENV_KEYS) originalEnv[key] = process.env[key];

function restoreEnv() {
  for (const key of ENV_KEYS) {
    const value = originalEnv[key];
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
}

afterEach(() => {
  restoreEnv();
  resetRateLimitForTests();
});

function postRole(role: unknown) {
  return POST(
    new Request("http://localhost/api/auth/demo", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ role }),
    }),
  );
}

describe("POST /api/auth/demo", () => {
  it("sets a signed httpOnly cookie instead of a raw role", async () => {
    process.env.DEMO_AUTH_ENABLED = "true";
    process.env.DEMO_AUTH_SECRET = "route-test-secret";
    const response = await postRole("company_admin");
    expect(response.status).toBe(200);
    const cookie = response.headers.get("set-cookie") ?? "";
    expect(cookie).toMatch(/atendebr_demo_role=company_admin\.[0-9a-f]+/i);
    expect(cookie.toLowerCase()).toContain("httponly");
    expect(cookie).not.toMatch(/atendebr_demo_role=company_admin;/);
  });

  it("rejects invalid roles", async () => {
    process.env.DEMO_AUTH_ENABLED = "true";
    process.env.DEMO_AUTH_SECRET = "route-test-secret";
    const response = await postRole("super_admin");
    expect(response.status).toBe(400);
  });

  it("is disabled when DEMO_AUTH_ENABLED=false", async () => {
    process.env.DEMO_AUTH_ENABLED = "false";
    process.env.DEMO_AUTH_SECRET = "route-test-secret";
    const response = await postRole("collaborator");
    expect(response.status).toBe(403);
  });
});
