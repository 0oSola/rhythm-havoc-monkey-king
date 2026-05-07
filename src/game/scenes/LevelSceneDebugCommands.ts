import type { LevelFlowState } from "../level/LevelFlow";
import type { LevelDefinition } from "../level/LevelTypes";

export type LevelDebugCommand =
  | "toggle-debug-panel"
  | "skip-opening"
  | "skip-free"
  | "skip-practice-warmup"
  | "skip-practice-loop"
  | "skip-exam"
  | "skip-result"
  | "preview-guard-attention"
  | "preview-guard-salute"
  | "preview-guard-praise"
  | "preview-wukong-attention"
  | "preview-wukong-salute"
  | "stop-animation-preview";

export type DebugAnimationPreview = {
  actor: "guard" | "wukong";
  action: "attention" | "salute" | "praise";
};

const DEBUG_ANIMATION_PREVIEW_INTERVAL_MS = 1100;
const DEBUG_PRAISE_PREVIEW_INTERVAL_MS = 1400;

const DEBUG_COMMAND_BY_SEQUENCE: Record<string, LevelDebugCommand> = {
  dev: "toggle-debug-panel",
  dvo: "skip-opening",
  dvf: "skip-free",
  dvw: "skip-practice-warmup",
  dvl: "skip-practice-loop",
  dve: "skip-exam",
  dvr: "skip-result",
  dga: "preview-guard-attention",
  dgs: "preview-guard-salute",
  dgp: "preview-guard-praise",
  dwa: "preview-wukong-attention",
  dws: "preview-wukong-salute",
  dax: "stop-animation-preview"
};

const MAX_DEBUG_SEQUENCE_LENGTH = 3;

export function consumeLevelDebugSequence(
  currentBuffer: string,
  key: string
): {
  nextBuffer: string;
  command?: LevelDebugCommand;
} {
  if (!/^[a-z]$/.test(key)) {
    return {
      nextBuffer: ""
    };
  }

  const nextBuffer = `${currentBuffer}${key}`.slice(-MAX_DEBUG_SEQUENCE_LENGTH);
  const command = DEBUG_COMMAND_BY_SEQUENCE[nextBuffer];

  if (command) {
    return {
      nextBuffer: "",
      command
    };
  }

  return {
    nextBuffer
  };
}

export function debugAnimationPreviewForCommand(
  command: Extract<
    LevelDebugCommand,
    | "preview-guard-attention"
    | "preview-guard-salute"
    | "preview-guard-praise"
    | "preview-wukong-attention"
    | "preview-wukong-salute"
  >
): DebugAnimationPreview {
  switch (command) {
    case "preview-guard-attention":
      return { actor: "guard", action: "attention" };
    case "preview-guard-salute":
      return { actor: "guard", action: "salute" };
    case "preview-guard-praise":
      return { actor: "guard", action: "praise" };
    case "preview-wukong-attention":
      return { actor: "wukong", action: "attention" };
    case "preview-wukong-salute":
      return { actor: "wukong", action: "salute" };
  }

  throw new Error(`Unsupported animation preview command: ${command}`);
}

export function debugAnimationPreviewIntervalMsForCommand(
  command: Extract<
    LevelDebugCommand,
    | "preview-guard-attention"
    | "preview-guard-salute"
    | "preview-guard-praise"
    | "preview-wukong-attention"
    | "preview-wukong-salute"
  >
): number {
  return command === "preview-guard-praise"
    ? DEBUG_PRAISE_PREVIEW_INTERVAL_MS
    : DEBUG_ANIMATION_PREVIEW_INTERVAL_MS;
}

export function levelFlowStateForDebugCommand(
  level: LevelDefinition,
  command: Extract<
    LevelDebugCommand,
    | "skip-opening"
    | "skip-free"
    | "skip-practice-warmup"
    | "skip-practice-loop"
    | "skip-exam"
    | "skip-result"
  >
): LevelFlowState {
  switch (command) {
    case "skip-opening":
      return {
        phaseType: "opening",
        currentPhaseId: findPhaseIdByType(level, "opening"),
        stepIndex: 0
      };
    case "skip-free":
      return {
        phaseType: "free",
        currentPhaseId: findPhaseIdByType(level, "free"),
        progressCount: 0
      };
    case "skip-practice-warmup":
      return {
        phaseType: "practice",
        currentPhaseId: findPhaseIdByType(level, "practice"),
        passCount: 0,
        attempts: 0,
        stage: "warmup"
      };
    case "skip-practice-loop":
      return {
        phaseType: "practice",
        currentPhaseId: findPhaseIdByType(level, "practice"),
        passCount: 0,
        attempts: 0,
        stage: "loop"
      };
    case "skip-exam":
      return {
        phaseType: "exam",
        currentPhaseId: findPhaseIdByType(level, "exam")
      };
    case "skip-result":
      return {
        phaseType: "result",
        currentPhaseId: "result"
      };
  }

  throw new Error(`Unsupported flow debug command: ${command}`);
}

function findPhaseIdByType(
  level: LevelDefinition,
  phaseType: Exclude<LevelFlowState["phaseType"], "result">
): string {
  const phase = level.phases.find((entry) => entry.type === phaseType);
  if (!phase) {
    throw new Error(`Missing phase type for debug command: ${phaseType}`);
  }

  return phase.id;
}
