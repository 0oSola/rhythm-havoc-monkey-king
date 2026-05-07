import type { OpeningStepDefinition } from "../level/LevelTypes";
import { NORMAL_CONFIRM_SFX_KEY } from "./LevelCueRules";

export const OPENING_CONTINUE_PROMPT = "按 A 或点击继续";
export const OPENING_CONTINUE_PROMPT_FONT_SIZE_PX = 14;
export const OPENING_CONTINUE_PROMPT_COLOR = "#8e8e8e";
export const OPENING_BEAT_MATCHED_IDLE_FRAME_RATE = 5 / 3;
export const OPENING_STORY_FONT_SIZE_PX = 20;
export const OPENING_STORY_LINE_SPACING_PX = 20;
export const OPENING_STORY_TOP_Y = 88;

export type OpeningStoryAdvanceResult =
  | "none"
  | "complete-current-line"
  | "advance-next-line";

export function openingStepAutoAdvanceMs(step: OpeningStepDefinition | undefined): number | null {
  if (!step || step.kind !== "story-caption" || step.requireConfirm) {
    return null;
  }

  return step.autoAdvanceAfterMs ?? 1800;
}

export function canConfirmOpeningStep(step: OpeningStepDefinition | undefined): boolean {
  if (!step) {
    return false;
  }

  if (step.kind === "story-caption") {
    return step.requireConfirm === true;
  }

  return step.kind === "dialogue";
}

export function openingShouldAutoAdvanceAfterAnimation(
  step: OpeningStepDefinition | undefined
): boolean {
  return step?.kind === "wukong-run-in" || step?.kind === "guard-reveal";
}

export function openingShouldUseBeatMatchedIdleLoop(step: OpeningStepDefinition | undefined): boolean {
  return step?.kind === "guard-reveal" || step?.kind === "dialogue";
}

export function openingShouldForceIdleReset(step: OpeningStepDefinition | undefined): boolean {
  return step?.kind === "dialogue";
}

export function openingContinuePromptForStep(step: OpeningStepDefinition | undefined): string | null {
  if (step?.kind === "story-caption" && step.requireConfirm) {
    return OPENING_CONTINUE_PROMPT;
  }

  return null;
}

export function openingRevealSfxKeyForStep(
  step: OpeningStepDefinition | undefined
): string | null {
  if (step?.kind === "guard-reveal") {
    return "level1_guard_oi_sfx";
  }

  return null;
}

export function openingShouldAcceptAdvanceKey(step: OpeningStepDefinition | undefined): boolean {
  return step?.kind === "story-caption";
}

export function openingAdvanceSfxKeyForStep(step: OpeningStepDefinition | undefined): string | null {
  return step?.kind === "story-caption" ? NORMAL_CONFIRM_SFX_KEY : null;
}

export function shouldPlayOpeningAdvanceSfx(result: OpeningStoryAdvanceResult): boolean {
  return result === "advance-next-line";
}

export function openingDisplayTextForStep(
  steps: readonly OpeningStepDefinition[],
  stepIndex: number,
  visibleChars: number
): string {
  return steps
    .slice(0, stepIndex + 1)
    .filter((step): step is OpeningStepDefinition & { text: string } => Boolean(step.text))
    .flatMap((step, index) => {
      if (index < stepIndex) {
        return [step.text];
      }

      const currentLine = step.text.slice(0, visibleChars);
      return currentLine.length > 0 ? [currentLine] : [];
    })
    .join("\n");
}

export function shouldHideBackgroundForOpeningStep(step: OpeningStepDefinition | undefined): boolean {
  return step?.kind === "story-caption";
}

export function openingStoryTopY(steps: readonly OpeningStepDefinition[]): number {
  void steps;
  return OPENING_STORY_TOP_Y;
}
