import { describe, expect, it, vi } from "vitest";
import {
  attachMenuOpeningBgm,
  playMenuStartConfirmSfx,
  MENU_OPENING_BGM_KEY
} from "../../src/game/scenes/MenuSceneAudio";

type MockSoundInstance = {
  isPlaying: boolean;
  play: ReturnType<typeof vi.fn>;
  stop: ReturnType<typeof vi.fn>;
};

type MockSoundManager = {
  locked: boolean;
  add: ReturnType<typeof vi.fn>;
  get: ReturnType<typeof vi.fn>;
  once: ReturnType<typeof vi.fn>;
  off: ReturnType<typeof vi.fn>;
  context?: {
    state: AudioContextState;
    resume: ReturnType<typeof vi.fn>;
  };
};

function createSoundHarness(locked = false): {
  sound: MockSoundManager;
  soundInstance: MockSoundInstance;
} {
  const soundInstance: MockSoundInstance = {
    isPlaying: false,
    play: vi.fn(() => {
      soundInstance.isPlaying = true;
      return true;
    }),
    stop: vi.fn(() => {
      soundInstance.isPlaying = false;
    })
  };

  const sound: MockSoundManager = {
    locked,
    add: vi.fn(() => soundInstance),
    get: vi.fn(() => null),
    once: vi.fn(),
    off: vi.fn()
  };

  return { sound, soundInstance };
}

describe("MenuSceneAudio", () => {
  it("starts the menu opening bgm immediately when sound is unlocked", () => {
    const { sound, soundInstance } = createSoundHarness(false);

    attachMenuOpeningBgm(sound);

    expect(sound.add).toHaveBeenCalledWith(MENU_OPENING_BGM_KEY, {
      loop: true,
      volume: 0.65
    });
    expect(soundInstance.play).toHaveBeenCalledWith();
  });

  it("retries the menu opening bgm after resuming a suspended audio context", async () => {
    const { sound, soundInstance } = createSoundHarness(false);
    soundInstance.play.mockImplementation(() => {
      if (soundInstance.play.mock.calls.length > 1) {
        soundInstance.isPlaying = true;
      }
      return true;
    });
    const context = {
      state: "suspended" as AudioContextState,
      resume: vi.fn(async () => {
        context.state = "running" as AudioContextState;
      })
    };
    sound.context = context;

    attachMenuOpeningBgm(sound);
    await Promise.resolve();

    expect(context.resume).toHaveBeenCalledTimes(1);
    expect(soundInstance.play).toHaveBeenCalledTimes(2);
  });

  it("stops the menu opening bgm when leaving the menu", () => {
    const { sound, soundInstance } = createSoundHarness(false);

    const cleanup = attachMenuOpeningBgm(sound);
    cleanup();

    expect(soundInstance.stop).toHaveBeenCalledTimes(1);
  });

  it("reuses the final dialogue confirm sfx when starting the game from the menu", () => {
    const sound = {
      play: vi.fn()
    };

    playMenuStartConfirmSfx(sound as never);

    expect(sound.play).toHaveBeenCalledWith("level1_dialogue_confirm_final_sfx", {
      volume: 0.75
    });
  });
});
