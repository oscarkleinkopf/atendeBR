import { describe, expect, it } from "vitest";
import { parseJsonBody, readBodyWithLimit } from "./http";

describe("readBodyWithLimit", () => {
  it("accepts bodies at the limit and rejects larger streams", async function () {
    const ok = await readBodyWithLimit(
      new Blob([new Uint8Array(4)]).stream(),
      4,
    );
    expect(ok.ok).toBe(true);
    if (ok.ok) expect(ok.bytes.byteLength).toBe(4);

    const tooBig = await readBodyWithLimit(
      new Blob([new Uint8Array(5)]).stream(),
      4,
    );
    expect(tooBig.ok).toBe(false);
  });
});

describe("parseJsonBody", () => {
  it("parses a small JSON object", async () => {
    const request = new Request("http://localhost/api/x", {
      method: "POST",
      body: JSON.stringify({ action: "continue" }),
      headers: { "content-type": "application/json" },
    });
    const parsed = await parseJsonBody(request);
    expect(parsed).toEqual({ ok: true, value: { action: "continue" } });
  });

  it("rejects invalid JSON and oversized Content-Length", async () => {
    const invalid = await parseJsonBody(
      new Request("http://localhost/api/x", { method: "POST", body: "{nope" }),
    );
    expect(invalid.ok).toBe(false);
    if (!invalid.ok) expect(invalid.status).toBe(400);

    const huge = await parseJsonBody(
      new Request("http://localhost/api/x", {
        method: "POST",
        body: "{}",
        headers: { "content-length": "999999" },
      }),
      100,
    );
    expect(huge.ok).toBe(false);
    if (!huge.ok) expect(huge.status).toBe(413);
  });
});
