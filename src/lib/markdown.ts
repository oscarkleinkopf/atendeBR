/** Escape untrusted text, then apply a small Markdown subset for lesson HTML. */

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function inline(text: string): string {
  return escapeHtml(text)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`(.+?)`/g, "<code>$1</code>");
}

export function renderMarkdown(md: string): string {
  const lines = md.split("\n");
  const html: string[] = [];
  let inUl = false;
  let inTable = false;

  const closeUl = () => {
    if (inUl) {
      html.push("</ul>");
      inUl = false;
    }
  };
  const closeTable = () => {
    if (inTable) {
      html.push("</tbody></table>");
      inTable = false;
    }
  };

  for (const line of lines) {
    if (line.startsWith("|")) {
      closeUl();
      const cells = line
        .split("|")
        .slice(1, -1)
        .map((c) => c.trim());
      if (cells.every((c) => /^:?-+:?$/.test(c))) continue;
      if (!inTable) {
        html.push("<table><tbody>");
        inTable = true;
        html.push(`<tr>${cells.map((c) => `<th>${inline(c)}</th>`).join("")}</tr>`);
      } else {
        html.push(`<tr>${cells.map((c) => `<td>${inline(c)}</td>`).join("")}</tr>`);
      }
      continue;
    }
    closeTable();

    if (line.startsWith("# ")) {
      closeUl();
      html.push(`<h1>${inline(line.slice(2))}</h1>`);
    } else if (line.startsWith("## ")) {
      closeUl();
      html.push(`<h2>${inline(line.slice(3))}</h2>`);
    } else if (line.startsWith("- ")) {
      if (!inUl) {
        html.push("<ul>");
        inUl = true;
      }
      html.push(`<li>${inline(line.slice(2))}</li>`);
    } else if (line.trim() === "") {
      closeUl();
    } else if (/^\d+\.\s/.test(line)) {
      closeUl();
      html.push(`<p>${inline(line)}</p>`);
    } else {
      closeUl();
      html.push(`<p>${inline(line)}</p>`);
    }
  }
  closeUl();
  closeTable();
  return html.join("\n");
}
