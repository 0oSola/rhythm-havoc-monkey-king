import { DEFAULT_BEATS_PER_BAR } from "../../shared/constants";
import type { TimelineCue, TimelineNote } from "../rhythm/RhythmTypes";
import type { LevelDefinition } from "./LevelTypes";

export function cueForTimelineNote(
  level: LevelDefinition,
  note: TimelineNote,
  beatsPerBar = DEFAULT_BEATS_PER_BAR
): TimelineCue | null {
  const unitLengthBeats = beatsPerBar * 2;
  const unitIndex = Math.floor((note.beat - 1) / unitLengthBeats);
  const unit = level.units[unitIndex];

  if (!unit) {
    return null;
  }

  const beatOffset = (note.beat - 1) % unitLengthBeats;
  const cueIndex = note.phase === "demo" ? beatOffset : beatOffset - beatsPerBar;
  const cues = note.phase === "demo" ? unit.demoCues : unit.playerCues;

  if (!cues || cueIndex < 0 || cueIndex >= cues.length) {
    return null;
  }

  return cues[cueIndex];
}
