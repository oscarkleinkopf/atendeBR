#!/usr/bin/env node
/**
 * Copia `out/` → `docs/` para Pages "Deploy from a branch /docs"
 * (alternativa al workflow Actions). Patrón similar a Ulpan pages:sync.
 */
import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const outDir = join(root, "out");
const docsDir = join(root, "docs");

if (!existsSync(outDir)) {
  console.error("No existe out/. Corre: npm run build:ghpages");
  process.exit(1);
}

rmSync(docsDir, { recursive: true, force: true });
mkdirSync(docsDir, { recursive: true });
cpSync(outDir, docsDir, { recursive: true });
writeFileSync(join(docsDir, ".nojekyll"), "");
console.log("Synced out/ → docs/ (+ .nojekyll)");
