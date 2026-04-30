import type {
  InputType,
  TimelineActor,
  TimelineCell,
  TimelineCue,
  TimelineCueCell,
  TimelineUnit
} from "../rhythm/RhythmTypes";
import type { ActionMap, LevelDefinition, LevelType } from "./LevelTypes";

const VALID_INPUT_TYPES: readonly InputType[] = ["A", "B", "AB", "Hold", "Mash"];
const VALID_LEVEL_TYPES: readonly LevelType[] = ["call_response", "loop", "mechanic", "reaction"];
const VALID_TIMELINE_ACTORS: readonly TimelineActor[] = ["guard", "wukong"];

export function parseLevelDefinition(value: unknown): LevelDefinition {
  const record = expectRecord(value, "Level definition must be an object");
  const units = parseUnits(record.units);

  if (units.length === 0) {
    throw new Error("Level must include at least one unit");
  }

  return {
    levelId: expectString(record.levelId, "levelId"),
    name: expectString(record.name, "name"),
    bpm: expectPositiveNumber(record.bpm, "bpm"),
    audioKey: expectString(record.audioKey, "audioKey"),
    type: expectLevelType(record.type),
    introText: parseStringArray(record.introText, "introText"),
    actions: parseActions(record.actions),
    units
  };
}

function parseUnits(value: unknown): TimelineUnit[] {
  if (!Array.isArray(value)) {
    throw new Error("units must be an array");
  }

  return value.map((unit) => {
    const record = expectRecord(unit, "unit must be an object");
    const parsedUnit: TimelineUnit = {
      demo: parseTimelineCells(record.demo, "demo"),
      player: parseTimelineCells(record.player, "player")
    };

    if (record.demoCues !== undefined) {
      parsedUnit.demoCues = parseCueCells(record.demoCues, "demoCues");
    }

    if (record.playerCues !== undefined) {
      parsedUnit.playerCues = parseCueCells(record.playerCues, "playerCues");
    }

    return parsedUnit;
  });
}

function parseTimelineCells(value: unknown, fieldName: string): TimelineCell[] {
  if (!Array.isArray(value)) {
    throw new Error(`${fieldName} must be an array`);
  }

  return value.map((cell) => {
    if (cell === null) {
      return null;
    }

    return expectInputType(cell, fieldName);
  });
}

function parseActions(value: unknown): ActionMap {
  const record = expectRecord(value, "actions must be an object");
  const actions: ActionMap = {};

  Object.entries(record).forEach(([inputType, action]) => {
    const parsedInput = expectInputType(inputType, "actions key");
    actions[parsedInput] = expectString(action, `actions.${inputType}`);
  });

  return actions;
}

function parseCueCells(value: unknown, fieldName: string): TimelineCueCell[] {
  if (!Array.isArray(value)) {
    throw new Error(`${fieldName} must be an array`);
  }

  return value.map((cell, index) => {
    if (cell === null) {
      return null;
    }

    return parseCue(cell, `${fieldName}[${index}]`);
  });
}

function parseCue(value: unknown, fieldName: string): TimelineCue {
  const record = expectRecord(value, `${fieldName} must be an object`);

  return {
    actor: expectTimelineActor(record.actor, `${fieldName}.actor`),
    prompt: expectString(record.prompt, `${fieldName}.prompt`),
    hitFrame: expectNonNegativeNumber(record.hitFrame, `${fieldName}.hitFrame`),
    sfxKey: expectString(record.sfxKey, `${fieldName}.sfxKey`)
  };
}

function parseStringArray(value: unknown, fieldName: string): string[] {
  if (!Array.isArray(value)) {
    throw new Error(`${fieldName} must be an array`);
  }

  return value.map((item, index) => expectString(item, `${fieldName}[${index}]`));
}

function expectRecord(value: unknown, message: string): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error(message);
  }

  return value as Record<string, unknown>;
}

function expectString(value: unknown, fieldName: string): string {
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`${fieldName} must be a non-empty string`);
  }

  return value;
}

function expectPositiveNumber(value: unknown, fieldName: string): number {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    throw new Error(`${fieldName} must be a positive number`);
  }

  return value;
}

function expectNonNegativeNumber(value: unknown, fieldName: string): number {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    throw new Error(`${fieldName} must be a non-negative number`);
  }

  return value;
}

function expectInputType(value: unknown, fieldName: string): InputType {
  if (typeof value !== "string" || !VALID_INPUT_TYPES.includes(value as InputType)) {
    throw new Error(`${fieldName} must be a supported input type`);
  }

  return value as InputType;
}

function expectLevelType(value: unknown): LevelType {
  if (typeof value !== "string" || !VALID_LEVEL_TYPES.includes(value as LevelType)) {
    throw new Error("type must be a supported level type");
  }

  return value as LevelType;
}

function expectTimelineActor(value: unknown, fieldName: string): TimelineActor {
  if (typeof value !== "string" || !VALID_TIMELINE_ACTORS.includes(value as TimelineActor)) {
    throw new Error(`${fieldName} must be a supported actor`);
  }

  return value as TimelineActor;
}
