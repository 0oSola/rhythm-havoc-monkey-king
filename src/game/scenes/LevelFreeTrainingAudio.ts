import type { InputType } from "../rhythm/RhythmTypes";
import type { FreeTrainingPhaseDefinition, LevelDefinition } from "../level/LevelTypes";

export function playerSfxKeyForFreeTrainingInput(
  level: LevelDefinition,
  phase: FreeTrainingPhaseDefinition,
  inputType: InputType
): string | null {
  const action = level.actions[phase.actionId];

  if (!action || action.inputType !== inputType) {
    return null;
  }

  return action.playerSfxKey ?? null;
}
