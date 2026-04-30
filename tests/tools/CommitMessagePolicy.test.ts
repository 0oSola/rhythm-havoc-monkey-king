import { describe, expect, it } from "vitest";
import { validateCommitMessage } from "../../scripts/commitMessagePolicy.mjs";

describe("commit message policy", () => {
  it("accepts a conventional subject with a reason", () => {
    expect(
      validateCommitMessage(`feat: add gate cue metadata

reason: first level needs explicit prompts and animation cues so LevelScene can stay data-driven`)
    ).toEqual({ valid: true, errors: [] });
  });

  it("rejects commits that do not explain the reason", () => {
    expect(
      validateCommitMessage(`fix: correct AB timing

verification: npm test`)
    ).toEqual({
      valid: false,
      errors: ["Commit message must include a non-empty reason: line."]
    });
  });

  it("rejects commits without a supported conventional subject", () => {
    expect(
      validateCommitMessage(`update stuff

reason: unclear changes are hard to review
`)
    ).toEqual({
      valid: false,
      errors: [
        "Commit subject must use '<type>: <summary>' with type feat, fix, refactor, test, docs, chore, build, ci, perf, or style."
      ]
    });
  });
});
