export interface DialogueBubbleStyle {
  fontSize: number;
  lineSpacing: number;
  maxTextWidth: number;
  paddingX: number;
  paddingTop: number;
  paddingBottom: number;
  textOffsetY: number;
  textPaddingTop: number;
  textPaddingBottom: number;
  textPaddingLeft: number;
  textPaddingRight: number;
  minBubbleWidth: number;
  textColor: string;
}

export const DEFAULT_DIALOGUE_BUBBLE_STYLE: DialogueBubbleStyle = {
  fontSize: 18,
  lineSpacing: 8,
  maxTextWidth: 260,
  paddingX: 26,
  paddingTop: 18,
  paddingBottom: 22,
  textOffsetY: 6,
  textPaddingTop: 6,
  textPaddingBottom: 2,
  textPaddingLeft: 2,
  textPaddingRight: 2,
  minBubbleWidth: 188,
  textColor: "#2f241c"
};

export const DIALOGUE_BUBBLE_STYLE_STORAGE_KEY = "level1-dialogue-bubble-style";

export function clampDialogueBubbleStyle(
  partial: Partial<DialogueBubbleStyle>
): DialogueBubbleStyle {
  return {
    fontSize: clampNumber(partial.fontSize, DEFAULT_DIALOGUE_BUBBLE_STYLE.fontSize, 12, 40),
    lineSpacing: clampNumber(
      partial.lineSpacing,
      DEFAULT_DIALOGUE_BUBBLE_STYLE.lineSpacing,
      0,
      24
    ),
    maxTextWidth: clampNumber(
      partial.maxTextWidth,
      DEFAULT_DIALOGUE_BUBBLE_STYLE.maxTextWidth,
      140,
      420
    ),
    paddingX: clampNumber(partial.paddingX, DEFAULT_DIALOGUE_BUBBLE_STYLE.paddingX, 8, 48),
    paddingTop: clampNumber(
      partial.paddingTop,
      DEFAULT_DIALOGUE_BUBBLE_STYLE.paddingTop,
      8,
      40
    ),
    paddingBottom: clampNumber(
      partial.paddingBottom,
      DEFAULT_DIALOGUE_BUBBLE_STYLE.paddingBottom,
      8,
      48
    ),
    textOffsetY: clampNumber(
      partial.textOffsetY,
      DEFAULT_DIALOGUE_BUBBLE_STYLE.textOffsetY,
      0,
      16
    ),
    textPaddingTop: clampNumber(
      partial.textPaddingTop,
      DEFAULT_DIALOGUE_BUBBLE_STYLE.textPaddingTop,
      0,
      16
    ),
    textPaddingBottom: clampNumber(
      partial.textPaddingBottom,
      DEFAULT_DIALOGUE_BUBBLE_STYLE.textPaddingBottom,
      0,
      16
    ),
    textPaddingLeft: clampNumber(
      partial.textPaddingLeft,
      DEFAULT_DIALOGUE_BUBBLE_STYLE.textPaddingLeft,
      0,
      16
    ),
    textPaddingRight: clampNumber(
      partial.textPaddingRight,
      DEFAULT_DIALOGUE_BUBBLE_STYLE.textPaddingRight,
      0,
      16
    ),
    minBubbleWidth: clampNumber(
      partial.minBubbleWidth,
      DEFAULT_DIALOGUE_BUBBLE_STYLE.minBubbleWidth,
      120,
      320
    ),
    textColor: normalizeColor(partial.textColor, DEFAULT_DIALOGUE_BUBBLE_STYLE.textColor)
  };
}

export function mergeDialogueBubbleStyle(
  current: DialogueBubbleStyle,
  partial: Partial<DialogueBubbleStyle>
): DialogueBubbleStyle {
  return clampDialogueBubbleStyle({
    ...current,
    ...partial
  });
}

function clampNumber(
  value: number | undefined,
  fallback: number,
  min: number,
  max: number
): number {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return fallback;
  }

  return Math.min(max, Math.max(min, Math.round(value)));
}

function normalizeColor(value: string | undefined, fallback: string): string {
  if (typeof value !== "string") {
    return fallback;
  }

  const normalized = value.trim();
  return /^#[0-9a-fA-F]{6}$/.test(normalized) ? normalized : fallback;
}
