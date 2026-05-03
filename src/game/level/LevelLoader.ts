import type { ScoreSummary } from "../feedback/ScoreSystem";
import type { InputType, JudgementResult } from "../rhythm/RhythmTypes";
import type {
  ExamBarDefinition,
  ExamBarEventDefinition,
  FreeTrainingMilestone,
  LevelActionDefinition,
  LevelActor,
  LevelAudioDefinition,
  LevelDefinition,
  LevelPhaseDefinition,
  LevelPhaseType,
  LevelType,
  OpeningPhaseDefinition,
  OpeningStepDefinition,
  OpeningStepKind,
  PracticeEventDefinition,
  PracticePhaseDefinition
} from "./LevelTypes";

const VALID_INPUT_TYPES: readonly InputType[] = ["A", "B", "AB", "Hold", "Mash"];
const VALID_LEVEL_TYPES: readonly LevelType[] = ["teaching"];
const VALID_LEVEL_PHASE_TYPES: readonly LevelPhaseType[] = ["opening", "free", "practice", "exam"];
const VALID_ACTORS: readonly LevelActor[] = ["guard", "wukong"];
const VALID_JUDGEMENTS: readonly JudgementResult[] = ["PERFECT", "GREAT", "GOOD", "MISS"];
const VALID_RATINGS: readonly ScoreSummary["rating"][] = ["天尊", "真仙", "道童", "凡夫"];
const VALID_OPENING_STEP_KINDS: readonly OpeningStepKind[] = [
  "title-card",
  "establishing-shot",
  "wukong-run-in",
  "guard-reveal",
  "dialogue"
];

export function parseLevelDefinition(value: unknown): LevelDefinition {
  const record = expectRecord(value, "Level definition must be an object");
  const phases = parsePhases(record.phases);

  if (phases.length === 0) {
    throw new Error("Level must include at least one phase");
  }

  return {
    levelId: expectString(record.levelId, "levelId"),
    name: expectString(record.name, "name"),
    bpm: expectPositiveNumber(record.bpm, "bpm"),
    type: expectLevelType(record.type),
    audio: parseAudio(record.audio),
    actions: parseActions(record.actions),
    phases,
    resultTexts: parseResultTexts(record.resultTexts)
  };
}

function parseAudio(value: unknown): LevelAudioDefinition {
  const record = expectRecord(value, "audio must be an object");

  return {
    practiceKey: expectString(record.practiceKey, "audio.practiceKey"),
    examKey: expectString(record.examKey, "audio.examKey")
  };
}

function parseActions(value: unknown): Readonly<Record<string, LevelActionDefinition>> {
  const record = expectRecord(value, "actions must be an object");
  const actions: Record<string, LevelActionDefinition> = {};

  Object.entries(record).forEach(([actionId, actionValue]) => {
    const actionRecord = expectRecord(actionValue, `actions.${actionId} must be an object`);

    actions[actionId] = {
      name: expectString(actionRecord.name, `actions.${actionId}.name`),
      inputType: expectInputType(actionRecord.inputType, `actions.${actionId}.inputType`),
      animationKey: expectString(actionRecord.animationKey, `actions.${actionId}.animationKey`),
      playerSfxKey: parseOptionalString(actionRecord.playerSfxKey, `actions.${actionId}.playerSfxKey`),
      npcSfxKey: parseOptionalString(actionRecord.npcSfxKey, `actions.${actionId}.npcSfxKey`)
    };
  });

  return actions;
}

function parsePhases(value: unknown): LevelPhaseDefinition[] {
  if (!Array.isArray(value)) {
    throw new Error("phases must be an array");
  }

  return value.map((phase, index) => parsePhase(phase, index));
}

function parsePhase(value: unknown, index: number): LevelPhaseDefinition {
  const record = expectRecord(value, `phases[${index}] must be an object`);
  const type = expectPhaseType(record.type, `phases[${index}].type`);

  switch (type) {
    case "opening":
      return parseOpeningPhase(record, index);
    case "free":
      return parseFreePhase(record, index);
    case "practice":
      return parsePracticePhase(record, index);
    case "exam":
      return parseExamPhase(record, index);
  }
}

function parseOpeningPhase(record: Record<string, unknown>, index: number): OpeningPhaseDefinition {
  return {
    id: expectString(record.id, `phases[${index}].id`),
    type: "opening",
    backgroundKey: expectString(record.backgroundKey, `phases[${index}].backgroundKey`),
    steps: parseOpeningSteps(record.steps, `phases[${index}].steps`),
    nextPhaseId: expectString(record.nextPhaseId, `phases[${index}].nextPhaseId`)
  };
}

function parseOpeningSteps(value: unknown, fieldName: string): OpeningStepDefinition[] {
  if (!Array.isArray(value)) {
    throw new Error(`${fieldName} must be an array`);
  }

  return value.map((entry, index) => {
    const record = expectRecord(entry, `${fieldName}[${index}] must be an object`);
    const kind = expectOpeningStepKind(record.kind, `${fieldName}[${index}].kind`);
    return {
      kind,
      speaker:
        kind === "dialogue"
          ? expectActor(record.speaker, `${fieldName}[${index}].speaker`)
          : undefined,
      text:
        kind === "dialogue"
          ? expectString(record.text, `${fieldName}[${index}].text`)
          : parseOptionalString(record.text, `${fieldName}[${index}].text`)
    };
  });
}

function parseFreePhase(record: Record<string, unknown>, index: number): LevelPhaseDefinition {
  return {
    id: expectString(record.id, `phases[${index}].id`),
    type: "free",
    backgroundKey: expectString(record.backgroundKey, `phases[${index}].backgroundKey`),
    prompt: expectString(record.prompt, `phases[${index}].prompt`),
    actionId: expectString(record.actionId, `phases[${index}].actionId`),
    requiredCount: expectPositiveInteger(record.requiredCount, `phases[${index}].requiredCount`),
    milestones: parseMilestones(record.milestones, `phases[${index}].milestones`),
    nextPhaseId: expectString(record.nextPhaseId, `phases[${index}].nextPhaseId`)
  };
}

function parseMilestones(value: unknown, fieldName: string): FreeTrainingMilestone[] {
  if (!Array.isArray(value)) {
    throw new Error(`${fieldName} must be an array`);
  }

  return value.map((entry, index) => {
    const record = expectRecord(entry, `${fieldName}[${index}] must be an object`);
    return {
      count: expectPositiveInteger(record.count, `${fieldName}[${index}].count`),
      text: expectString(record.text, `${fieldName}[${index}].text`)
    };
  });
}

function parsePracticePhase(record: Record<string, unknown>, index: number): PracticePhaseDefinition {
  return {
    id: expectString(record.id, `phases[${index}].id`),
    type: "practice",
    backgroundKey: expectString(record.backgroundKey, `phases[${index}].backgroundKey`),
    promptTemplate: expectString(record.promptTemplate, `phases[${index}].promptTemplate`),
    warmupAudioKey: expectString(record.warmupAudioKey, `phases[${index}].warmupAudioKey`),
    warmupDurationMs: expectPositiveNumber(record.warmupDurationMs, `phases[${index}].warmupDurationMs`),
    audioKey: expectString(record.audioKey, `phases[${index}].audioKey`),
    bpm: expectPositiveNumber(record.bpm, `phases[${index}].bpm`),
    timeSignature: parseTimeSignature(record.timeSignature, `phases[${index}].timeSignature`),
    beatMs: expectPositiveNumber(record.beatMs, `phases[${index}].beatMs`),
    barMs: expectPositiveNumber(record.barMs, `phases[${index}].barMs`),
    loopBars: expectPositiveInteger(record.loopBars, `phases[${index}].loopBars`),
    loopDurationMs: expectPositiveNumber(record.loopDurationMs, `phases[${index}].loopDurationMs`),
    requiredPassCount: expectPositiveInteger(record.requiredPassCount, `phases[${index}].requiredPassCount`),
    passThreshold: expectPassThreshold(record.passThreshold, `phases[${index}].passThreshold`),
    npcEvents: parsePracticeEvents(record.npcEvents, `phases[${index}].npcEvents`),
    playerEvents: parsePracticeEvents(record.playerEvents, `phases[${index}].playerEvents`),
    nextPhaseId: expectString(record.nextPhaseId, `phases[${index}].nextPhaseId`)
  };
}

function parsePracticeEvents(value: unknown, fieldName: string): PracticeEventDefinition[] {
  if (!Array.isArray(value)) {
    throw new Error(`${fieldName} must be an array`);
  }

  return value.map((entry, index) => parsePracticeEvent(entry, `${fieldName}[${index}]`));
}

function parsePracticeEvent(value: unknown, fieldName: string): PracticeEventDefinition {
  const record = expectRecord(value, `${fieldName} must be an object`);
  return {
    timeMs: expectNonNegativeNumber(record.timeMs, `${fieldName}.timeMs`),
    bar: expectPositiveInteger(record.bar, `${fieldName}.bar`),
    beat: expectPositiveNumber(record.beat, `${fieldName}.beat`),
    actionId: expectString(record.actionId, `${fieldName}.actionId`)
  };
}

function parseExamPhase(record: Record<string, unknown>, index: number): LevelPhaseDefinition {
  return {
    id: expectString(record.id, `phases[${index}].id`),
    type: "exam",
    backgroundKey: expectString(record.backgroundKey, `phases[${index}].backgroundKey`),
    audioKey: expectString(record.audioKey, `phases[${index}].audioKey`),
    bpm: expectPositiveNumber(record.bpm, `phases[${index}].bpm`),
    timeSignature: parseTimeSignature(record.timeSignature, `phases[${index}].timeSignature`),
    beatMs: expectPositiveNumber(record.beatMs, `phases[${index}].beatMs`),
    barMs: expectPositiveNumber(record.barMs, `phases[${index}].barMs`),
    totalBars: expectPositiveInteger(record.totalBars, `phases[${index}].totalBars`),
    bars: parseExamBars(record.bars, `phases[${index}].bars`)
  };
}

function parseExamBars(value: unknown, fieldName: string): ExamBarDefinition[] {
  if (!Array.isArray(value)) {
    throw new Error(`${fieldName} must be an array`);
  }

  return value.map((entry, index) => {
    const record = expectRecord(entry, `${fieldName}[${index}] must be an object`);
    return {
      bar: expectPositiveInteger(record.bar, `${fieldName}[${index}].bar`),
      role: expectBarRole(record.role, `${fieldName}[${index}].role`),
      startTimeMs: expectNonNegativeNumber(record.startTimeMs, `${fieldName}[${index}].startTimeMs`),
      endTimeMs: expectPositiveNumber(record.endTimeMs, `${fieldName}[${index}].endTimeMs`),
      events: parseExamBarEvents(record.events, `${fieldName}[${index}].events`)
    };
  });
}

function parseExamBarEvents(value: unknown, fieldName: string): ExamBarEventDefinition[] {
  if (!Array.isArray(value)) {
    throw new Error(`${fieldName} must be an array`);
  }

  return value.map((entry, index) => {
    const record = expectRecord(entry, `${fieldName}[${index}] must be an object`);
    return {
      beat: expectPositiveNumber(record.beat, `${fieldName}[${index}].beat`),
      timeMs: expectNonNegativeNumber(record.timeMs, `${fieldName}[${index}].timeMs`),
      actionId: expectString(record.actionId, `${fieldName}[${index}].actionId`)
    };
  });
}

function parseResultTexts(value: unknown): Readonly<Record<ScoreSummary["rating"], string>> {
  const record = expectRecord(value, "resultTexts must be an object");
  const resultTexts = {} as Record<ScoreSummary["rating"], string>;

  VALID_RATINGS.forEach((rating) => {
    resultTexts[rating] = expectString(record[rating], `resultTexts.${rating}`);
  });

  return resultTexts;
}

function parseTimeSignature(value: unknown, fieldName: string): [number, number] {
  if (!Array.isArray(value) || value.length !== 2) {
    throw new Error(`${fieldName} must be a [numerator, denominator] tuple`);
  }

  return [
    expectPositiveInteger(value[0], `${fieldName}[0]`),
    expectPositiveInteger(value[1], `${fieldName}[1]`)
  ];
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

function parseOptionalString(value: unknown, fieldName: string): string | undefined {
  if (value === undefined) {
    return undefined;
  }

  return expectString(value, fieldName);
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

function expectPositiveInteger(value: unknown, fieldName: string): number {
  if (typeof value !== "number" || !Number.isInteger(value) || value <= 0) {
    throw new Error(`${fieldName} must be a positive integer`);
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

function expectPhaseType(value: unknown, fieldName: string): LevelPhaseType {
  if (typeof value !== "string" || !VALID_LEVEL_PHASE_TYPES.includes(value as LevelPhaseType)) {
    throw new Error(`${fieldName} must be a supported phase type`);
  }

  return value as LevelPhaseType;
}

function expectActor(value: unknown, fieldName: string): LevelActor {
  if (typeof value !== "string" || !VALID_ACTORS.includes(value as LevelActor)) {
    throw new Error(`${fieldName} must be a supported actor`);
  }

  return value as LevelActor;
}

function expectOpeningStepKind(value: unknown, fieldName: string): OpeningStepKind {
  if (typeof value !== "string" || !VALID_OPENING_STEP_KINDS.includes(value as OpeningStepKind)) {
    throw new Error(`${fieldName} must be a supported opening step kind`);
  }

  return value as OpeningStepKind;
}

function expectPassThreshold(value: unknown, fieldName: string): Exclude<JudgementResult, "MISS"> {
  if (
    typeof value !== "string" ||
    !VALID_JUDGEMENTS.includes(value as JudgementResult) ||
    value === "MISS"
  ) {
    throw new Error(`${fieldName} must be PERFECT, GREAT, or GOOD`);
  }

  return value as Exclude<JudgementResult, "MISS">;
}

function expectBarRole(value: unknown, fieldName: string): "NONE" | "NPC" | "PLAYER" {
  if (value !== "NONE" && value !== "NPC" && value !== "PLAYER") {
    throw new Error(`${fieldName} must be NONE, NPC, or PLAYER`);
  }

  return value;
}
