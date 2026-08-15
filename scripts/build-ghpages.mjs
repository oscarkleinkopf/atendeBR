#!/usr/bin/env node
/**
 * Build estático para GitHub Pages (patrón Ulpan).
 * - Aparta /api (no soportado en output:export)
 * - Publica en raíz del repo + docs/
 */
import {
  existsSync,
  mkdirSync,
  renameSync,
  rmSync,
  cpSync,
  writeFileSync,
  readdirSync,
  statSync,
} from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const apiDir = join(root, "src/app/api");
const stashDir = join(root, ".api-stash");
const outDir = join(root, "out");

const ROOT_PUBLISH = new Set([
  "index.html",
  "404.html",
  "favicon.ico",
  "file.svg",
  "globe.svg",
  "next.svg",
  "vercel.svg",
  "window.svg",
  "_next",
  "404",
  "_not-found",
  "auth",
  "dashboard",
  "lesson",
  "login",
  "path",
  "phrases",
  "simulator",
  "team",
]);

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

function cleanRootPublish() {
  for (const name of ROOT_PUBLISH) {
    const target = join(root, name);
    if (existsSync(target)) rmSync(target, { recursive: true, force: true });
  }
  // leftover next txt dumps from previous sync
  for (const name of readdirSync(root)) {
    if (name.startsWith("__next.")) {
      rmSync(join(root, name), { force: true });
    }
  }
}

function syncToRoot() {
  cleanRootPublish();
  for (const name of readdirSync(outDir)) {
    if (name.endsWith(".txt")) continue; // skip RSC text dumps at root
    const from = join(outDir, name);
    const to = join(root, name);
    cpSync(from, to, { recursive: true });
  }
  writeFileSync(join(root, ".nojekyll"), "");
  // SPA-ish fallback
  if (existsSync(join(root, "index.html"))) {
    cpSync(join(root, "index.html"), join(root, "404.html"));
  }
}

function syncToDocs() {
  const docsDir = join(root, "docs");
  rmSync(docsDir, { recursive: true, force: true });
  mkdirSync(docsDir, { recursive: true });
  cpSync(outDir, docsDir, { recursive: true });
  writeFileSync(join(docsDir, ".nojekyll"), "");
  if (existsSync(join(docsDir, "index.html"))) {
    cpSync(join(docsDir, "index.html"), join(docsDir, "404.html"));
  }
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

  if (code === 0 && existsSync(outDir)) {
    syncToRoot();
    syncToDocs();
    console.log("Synced out/ → repo root + docs/ (+ .nojekyll)");
    console.log("Enable Pages: Settings → Pages → Branch main → / (root)");
  }
} finally {
  restoreApi(moved);
}

process.exit(code);
