#!/usr/bin/env node

import { readFileSync } from "node:fs";
import { validateCommitMessage } from "./commitMessagePolicy.mjs";

const messageFile = process.argv[2];

if (!messageFile) {
  console.error("Usage: node scripts/validate-commit-message.mjs <commit-message-file>");
  process.exit(2);
}

const message = readFileSync(messageFile, "utf8");
const result = validateCommitMessage(message);

if (!result.valid) {
  console.error("Commit message rejected:");
  result.errors.forEach((error) => console.error(`- ${error}`));
  console.error("");
  console.error("Required format:");
  console.error("feat: add useful summary");
  console.error("");
  console.error("reason: explain why this change is needed");
  process.exit(1);
}
