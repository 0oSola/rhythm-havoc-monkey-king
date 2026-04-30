const SUPPORTED_TYPES = ["feat", "fix", "refactor", "test", "docs", "chore", "build", "ci", "perf", "style"];

const SUBJECT_PATTERN = new RegExp(
  `^(${SUPPORTED_TYPES.join("|")})(\\([a-z0-9-]+\\))?: .+`
);

export function validateCommitMessage(message) {
  const normalized = message.replace(/\r\n/g, "\n").trim();
  const lines = normalized.split("\n");
  const subject = lines[0] ?? "";
  const errors = [];

  if (!SUBJECT_PATTERN.test(subject)) {
    errors.push(
      "Commit subject must use '<type>: <summary>' with type feat, fix, refactor, test, docs, chore, build, ci, perf, or style."
    );
  }

  if (!hasNonEmptyTokenLine(lines, "reason")) {
    errors.push("Commit message must include a non-empty reason: line.");
  }

  if (!hasNonEmptyTokenLine(lines, "verification")) {
    errors.push("Commit message must include a non-empty verification: line.");
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

function hasNonEmptyTokenLine(lines, token) {
  const prefix = `${token}:`;

  return lines.some((line) => {
    const trimmed = line.trim();
    return trimmed.toLowerCase().startsWith(prefix) && trimmed.slice(prefix.length).trim().length > 0;
  });
}
