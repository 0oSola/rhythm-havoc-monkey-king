import { describe, expect, it } from "vitest";
import gateLevelData from "../../src/game/level/levels/gate_01.json";
import { parseLevelDefinition } from "../../src/game/level/LevelLoader";
import {
  consumeLevelDebugSequence,
  debugAnimationPreviewForCommand,
  debugAnimationPreviewIntervalMsForCommand,
  levelFlowStateForDebugCommand
} from "../../src/game/scenes/LevelSceneDebugCommands";

describe("LevelSceneDebugCommands", () => {
  it("keeps the existing dev command for opening the bubble debug panel", () => {
    let buffer = "";

    ({ nextBuffer: buffer } = consumeLevelDebugSequence(buffer, "d"));
    ({ nextBuffer: buffer } = consumeLevelDebugSequence(buffer, "e"));
    const result = consumeLevelDebugSequence(buffer, "v");

    expect(result).toEqual({
      nextBuffer: "",
      command: "toggle-debug-panel"
    });
  });

  it("recognizes phase skip commands from the rolling debug buffer", () => {
    let buffer = "";

    for (const key of ["x", "d", "v", "e"]) {
      const result = consumeLevelDebugSequence(buffer, key);
      buffer = result.nextBuffer;
      if (key === "e") {
        expect(result.command).toBe("skip-exam");
      }
    }

    expect(consumeLevelDebugSequence("dv", "l")).toEqual({
      nextBuffer: "",
      command: "skip-practice-loop"
    });
    expect(consumeLevelDebugSequence("dv", "r")).toEqual({
      nextBuffer: "",
      command: "skip-result"
    });
  });

  it("recognizes animation preview debug commands from the rolling debug buffer", () => {
    expect(consumeLevelDebugSequence("dg", "p")).toEqual({
      nextBuffer: "",
      command: "preview-guard-praise"
    });
    expect(consumeLevelDebugSequence("dg", "a")).toEqual({
      nextBuffer: "",
      command: "preview-guard-attention"
    });
    expect(consumeLevelDebugSequence("dg", "s")).toEqual({
      nextBuffer: "",
      command: "preview-guard-salute"
    });
    expect(consumeLevelDebugSequence("dw", "a")).toEqual({
      nextBuffer: "",
      command: "preview-wukong-attention"
    });
    expect(consumeLevelDebugSequence("dw", "s")).toEqual({
      nextBuffer: "",
      command: "preview-wukong-salute"
    });
    expect(consumeLevelDebugSequence("da", "x")).toEqual({
      nextBuffer: "",
      command: "stop-animation-preview"
    });
  });

  it("maps debug commands to stable level flow states", () => {
    const level = parseLevelDefinition(gateLevelData);

    expect(levelFlowStateForDebugCommand(level, "skip-opening")).toEqual({
      phaseType: "opening",
      currentPhaseId: "opening",
      stepIndex: 0
    });
    expect(levelFlowStateForDebugCommand(level, "skip-free")).toEqual({
      phaseType: "free",
      currentPhaseId: "attention_free",
      progressCount: 0
    });
    expect(levelFlowStateForDebugCommand(level, "skip-practice-warmup")).toEqual({
      phaseType: "practice",
      currentPhaseId: "attention_rhythm",
      passCount: 0,
      attempts: 0,
      stage: "warmup"
    });
    expect(levelFlowStateForDebugCommand(level, "skip-practice-loop")).toEqual({
      phaseType: "practice",
      currentPhaseId: "attention_rhythm",
      passCount: 0,
      attempts: 0,
      stage: "loop"
    });
    expect(levelFlowStateForDebugCommand(level, "skip-exam")).toEqual({
      phaseType: "exam",
      currentPhaseId: "exam"
    });
    expect(levelFlowStateForDebugCommand(level, "skip-result")).toEqual({
      phaseType: "result",
      currentPhaseId: "result"
    });
  });

  it("maps animation preview commands to actor and action targets", () => {
    expect(debugAnimationPreviewForCommand("preview-guard-praise")).toEqual({
      actor: "guard",
      action: "praise"
    });
    expect(debugAnimationPreviewForCommand("preview-guard-attention")).toEqual({
      actor: "guard",
      action: "attention"
    });
    expect(debugAnimationPreviewForCommand("preview-guard-salute")).toEqual({
      actor: "guard",
      action: "salute"
    });
    expect(debugAnimationPreviewForCommand("preview-wukong-attention")).toEqual({
      actor: "wukong",
      action: "attention"
    });
    expect(debugAnimationPreviewForCommand("preview-wukong-salute")).toEqual({
      actor: "wukong",
      action: "salute"
    });
  });

  it("keeps preview replay intervals long enough for each action to fully finish", () => {
    expect(debugAnimationPreviewIntervalMsForCommand("preview-guard-praise")).toBe(1400);
    expect(debugAnimationPreviewIntervalMsForCommand("preview-guard-attention")).toBe(1100);
    expect(debugAnimationPreviewIntervalMsForCommand("preview-guard-salute")).toBe(1100);
    expect(debugAnimationPreviewIntervalMsForCommand("preview-wukong-attention")).toBe(1100);
    expect(debugAnimationPreviewIntervalMsForCommand("preview-wukong-salute")).toBe(1100);
  });
});
