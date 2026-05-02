#!/usr/bin/env node

import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { buildLevelWorkflowScaffold, normalizeLevelWorkflowOptions } from "./levelWorkflowScaffold.mjs";

const args = parseArgs(process.argv.slice(2));

if (args.help || !args.levelId || !args.levelName) {
  printUsage();
  process.exit(args.help ? 0 : 1);
}

const options = normalizeLevelWorkflowOptions({
  levelId: args.levelId,
  levelName: args.levelName
});
const files = buildLevelWorkflowScaffold(options);
const overwrite = Boolean(args.force);
const dryRun = Boolean(args["dry-run"]);

for (const file of files) {
  const absolutePath = resolve(process.cwd(), file.path);

  if (!overwrite && existsSync(absolutePath)) {
    console.error(`Refusing to overwrite existing file: ${file.path}`);
    process.exit(1);
  }

  if (dryRun) {
    console.log(`[dry-run] ${file.path}`);
    continue;
  }

  mkdirSync(dirname(absolutePath), { recursive: true });
  writeFileSync(absolutePath, file.content, "utf8");
  console.log(`Created ${file.path}`);
}

function parseArgs(argv) {
  const parsed = {};

  for (let index = 0; index < argv.length; index += 1) {
    const current = argv[index];
    if (!current.startsWith("--")) {
      continue;
    }

    const key = current.slice(2);
    const next = argv[index + 1];
    if (!next || next.startsWith("--")) {
      parsed[key] = true;
      continue;
    }

    parsed[key] = next;
    index += 1;
  }

  return parsed;
}

function printUsage() {
  console.log("Usage:");
  console.log("node scripts/init-level.mjs --levelId horse_02 --levelName \"弼马温上班记\" [--dry-run] [--force]");
}
