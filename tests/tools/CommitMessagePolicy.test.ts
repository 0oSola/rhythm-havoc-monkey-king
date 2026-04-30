import { describe, expect, it } from "vitest";
import { validateCommitMessage } from "../../scripts/commitMessagePolicy.mjs";

describe("commit message policy", () => {
  it("accepts a conventional subject with reason and verification", () => {
    expect(
      validateCommitMessage(`feat: add gate cue metadata

reason: first level needs explicit prompts and animation cues so LevelScene can stay data-driven
verification: npm test -- tests/level/GateLevel.test.ts tests/level/LevelLoader.test.ts`)
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

  it("rejects commits that do not include verification evidence", () => {
    expect(
      validateCommitMessage(`test: add judgement coverage

reason: judgement windows are core gameplay contracts`)
    ).toEqual({
      valid: false,
      errors: ["Commit message must include a non-empty verification: line."]
    });
  });

  it("rejects commits without a supported conventional subject", () => {
    expect(
      validateCommitMessage(`update stuff

reason: unclear changes are hard to review
verification: npm test`)
    ).toEqual({
      valid: false,
      errors: [
        "Commit subject must use '<type>: <summary>' with type feat, fix, refactor, test, docs, chore, build, ci, perf, or style."
      ]
    });
  });
});
