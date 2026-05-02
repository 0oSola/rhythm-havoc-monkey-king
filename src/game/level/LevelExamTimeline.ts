import type { InputType } from "../rhythm/RhythmTypes";
import type { ExamPhaseDefinition, LevelActionId, LevelActor, LevelDefinition } from "./LevelTypes";

export interface ExamTimelineEvent {
  actor: LevelActor;
  bar: number;
  beat: number;
  timeMs: number;
  actionId: LevelActionId;
  inputType: InputType;
}

export interface ExamTimeline {
  npcEvents: readonly ExamTimelineEvent[];
  playerEvents: readonly ExamTimelineEvent[];
}

export function createExamTimeline(level: LevelDefinition): ExamTimeline {
  const examPhase = level.phases.find((phase): phase is ExamPhaseDefinition => phase.type === "exam");

  if (!examPhase) {
    throw new Error("Level is missing an exam phase");
  }

  const npcEvents: ExamTimelineEvent[] = [];
  const playerEvents: ExamTimelineEvent[] = [];

  examPhase.bars.forEach((bar) => {
    if (bar.role === "NONE") {
      return;
    }

    const actor: LevelActor = bar.role === "NPC" ? "guard" : "wukong";
    const target = bar.role === "NPC" ? npcEvents : playerEvents;

    bar.events.forEach((event) => {
      const action = level.actions[event.actionId];

      if (!action) {
        throw new Error(`Unknown action id in exam timeline: ${event.actionId}`);
      }

      target.push({
        actor,
        bar: bar.bar,
        beat: event.beat,
        timeMs: event.timeMs,
        actionId: event.actionId,
        inputType: action.inputType
      });
    });
  });

  return {
    npcEvents,
    playerEvents
  };
}
