import type Phaser from "phaser";
import { FINAL_CONFIRM_SFX_KEY } from "./LevelCueRules";

export const MENU_OPENING_BGM_KEY = "menu-opening-bgm";
const MENU_OPENING_BGM_CONFIG = {
  loop: true,
  volume: 0.65
} as const;

type MenuSoundManager = Pick<Phaser.Sound.BaseSoundManager, "add" | "get" | "locked" | "off" | "once">;
type MenuSound = Pick<Phaser.Sound.BaseSound, "isPlaying" | "play" | "stop">;
type MenuPlayableSoundManager = Pick<Phaser.Sound.BaseSoundManager, "play">;

function resumeAudioContext(sound: MenuSoundManager): Promise<void> | null {
  const context = (sound as unknown as { context?: AudioContext }).context;
  if (context && context.state === "suspended") {
    return context.resume();
  }

  return null;
}

export function attachMenuOpeningBgm(sound: MenuSoundManager): () => void {
  const menuBgm = getOrCreateMenuOpeningBgm(sound);

  const tryPlay = (): void => {
    if (!menuBgm.isPlaying) {
      menuBgm.play();
    }
  };

  // Always try to play immediately
  tryPlay();
  void resumeAudioContext(sound)?.then(tryPlay).catch(() => undefined);

  // Also listen for Phaser's unlock event as fallback
  sound.once("unlocked", tryPlay);

  // Resume AudioContext on any document-level interaction (browser only)
  const onDocumentInteraction = (): void => {
    const resumePromise = resumeAudioContext(sound);
    tryPlay();
    void resumePromise?.then(tryPlay).catch(() => undefined);
  };

  const hasDocument = typeof document !== "undefined";
  if (hasDocument) {
    document.addEventListener("pointerdown", onDocumentInteraction, { once: true });
    document.addEventListener("keydown", onDocumentInteraction, { once: true });
  }

  return () => {
    sound.off("unlocked", tryPlay);
    if (hasDocument) {
      document.removeEventListener("pointerdown", onDocumentInteraction);
      document.removeEventListener("keydown", onDocumentInteraction);
    }
    menuBgm.stop();
  };
}

export function playMenuStartConfirmSfx(sound: MenuPlayableSoundManager): void {
  sound.play(FINAL_CONFIRM_SFX_KEY, { volume: 0.75 });
}

function getOrCreateMenuOpeningBgm(sound: MenuSoundManager): MenuSound {
  const existing = sound.get(MENU_OPENING_BGM_KEY) as MenuSound | null;

  if (existing) {
    return existing;
  }

  return sound.add(MENU_OPENING_BGM_KEY, MENU_OPENING_BGM_CONFIG) as MenuSound;
}
