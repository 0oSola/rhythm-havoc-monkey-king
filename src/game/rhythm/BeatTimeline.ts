import type { TimelineConfig, TimelineNote } from "./RhythmTypes";

export function beatToMs(beat: number, bpm: number): number {
  if (bpm <= 0) {
    throw new Error("BPM must be greater than 0");
  }

  return Math.round((beat - 1) * (60_000 / bpm));
}

export function createBeatTimeline(config: TimelineConfig): TimelineNote[] {
  const notes: TimelineNote[] = [];
  const unitLengthBeats = config.beatsPerBar * 2;

  config.units.forEach((unit, unitIndex) => {
    const unitStartBeat = unitIndex * unitLengthBeats + 1;

    unit.demo.forEach((expectedType, beatIndex) => {
      if (expectedType === null) {
        return;
      }

      const beat = unitStartBeat + beatIndex;
      notes.push({
        phase: "demo",
        beat,
        timeMs: beatToMs(beat, config.bpm),
        expectedType
      });
    });

    unit.player.forEach((expectedType, beatIndex) => {
      if (expectedType === null) {
        return;
      }

      const beat = unitStartBeat + config.beatsPerBar + beatIndex;
      notes.push({
        phase: "player",
        beat,
        timeMs: beatToMs(beat, config.bpm),
        expectedType
      });
    });
  });

  return notes;
}
