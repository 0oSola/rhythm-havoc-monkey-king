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

export function attachMenuOpeningBgm(sound: MenuSoundManager): () => void {
  const menuBgm = getOrCreateMenuOpeningBgm(sound);

  const tryPlay = (): void => {
    if (!menuBgm.isPlaying) {
      menuBgm.play();
    }
  };

  if (sound.locked) {
    sound.once("unlocked", tryPlay);
  } else {
    tryPlay();
  }

  return () => {
    sound.off("unlocked", tryPlay);
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
