import { describe, expect, it } from "vitest";
import { escapeHtml, renderMarkdown } from "./markdown";

describe("escapeHtml", () => {
  it("escapes HTML special characters", () => {
    expect(escapeHtml(`<img src="x" onerror='alert(1)'>`)).toBe(
      "&lt;img src=&quot;x&quot; onerror=&#39;alert(1)&#39;&gt;",
    );
  });
});

describe("renderMarkdown", () => {
  it("keeps safe emphasis markup", () => {
    expect(renderMarkdown("Hola **mundo** y *ciao*")).toContain("<strong>mundo</strong>");
    expect(renderMarkdown("Hola **mundo** y *ciao*")).toContain("<em>ciao</em>");
  });

  it("does not emit raw HTML from lesson content", () => {
    const html = renderMarkdown(`# Title\n\n<script>alert(1)</script>\n\n<img src=x onerror=alert(1)>`);
    expect(html).not.toMatch(/<script/i);
    expect(html).not.toMatch(/<img/i);
    expect(html).toContain("&lt;script&gt;");
    expect(html).toContain("&lt;img");
  });

  it("escapes HTML inside markdown emphasis and tables", () => {
    const html = renderMarkdown(
      `** <script>bad</script> **\n\n| col |\n| --- |\n| <img src=x> |\n`,
    );
    expect(html).not.toMatch(/<script/i);
    expect(html).not.toMatch(/<img/i);
    expect(html).toContain("&lt;script&gt;");
    expect(html).toContain("<th>");
    expect(html).toContain("&lt;img");
  });
});
