#!/usr/bin/env node
/**
 * Build estático para GitHub Pages.
 * Las Route Handlers (/api/*) no existen en output:export — se apartan temporalmente.
 */
import { existsSync, mkdirSync, renameSync, rmSync, cpSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const apiDir = join(root, "src/app/api");
const stashDir = join(root, ".api-stash");

function stashApi() {
  if (!existsSync(apiDir)) return false;
  rmSync(stashDir, { recursive: true, force: true });
  renameSync(apiDir, stashDir);
  return true;
}

function restoreApi(moved) {
  if (!moved) return;
  if (existsSync(apiDir)) rmSync(apiDir, { recursive: true, force: true });
  renameSync(stashDir, apiDir);
}

const moved = stashApi();
process.env.GITHUB_PAGES = "true";
process.env.GITHUB_REPOSITORY =
  process.env.GITHUB_REPOSITORY || "oscarkleinkopf/atendeBR";

let code = 1;
try {
  const result = spawnSync("npx", ["next", "build"], {
    stdio: "inherit",
    env: process.env,
    shell: true,
  });
  code = result.status ?? 1;

  if (code === 0 && existsSync(join(root, "out"))) {
    const docsDir = join(root, "docs");
    rmSync(docsDir, { recursive: true, force: true });
    mkdirSync(docsDir, { recursive: true });
    cpSync(join(root, "out"), docsDir, { recursive: true });
    writeFileSync(join(docsDir, ".nojekyll"), "");
    // SPA fallback for unknown client routes on Pages
    if (existsSync(join(docsDir, "404.html")) === false && existsSync(join(docsDir, "index.html"))) {
      cpSync(join(docsDir, "index.html"), join(docsDir, "404.html"));
    }
    console.log("Synced out/ → docs/ (+ .nojekyll)");
  }
} finally {
  restoreApi(moved);
}

process.exit(code);
