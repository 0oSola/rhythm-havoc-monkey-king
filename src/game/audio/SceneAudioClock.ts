import { AudioClock, type AudioClockContext } from "./AudioClock";

interface SoundManagerWithPossibleContext {
  context?: AudioClockContext;
}

export function createSceneAudioClock(
  soundManager: unknown,
  fallbackFactory: () => AudioClockContext = () => new AudioContext()
): AudioClock {
  return new AudioClock(resolveSceneAudioContext(soundManager) ?? fallbackFactory());
}

function resolveSceneAudioContext(soundManager: unknown): AudioClockContext | null {
  if (!soundManager || typeof soundManager !== "object") {
    return null;
  }

  const candidate = soundManager as SoundManagerWithPossibleContext;
  return candidate.context ?? null;
}
