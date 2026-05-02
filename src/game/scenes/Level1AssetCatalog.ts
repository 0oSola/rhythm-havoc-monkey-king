import openingBgUrl from "../../assets/backgrounds/level1/opening.png";
import stageBgUrl from "../../assets/backgrounds/level1/stage.png";

export const LEVEL1_FRAME_GLOB_PATTERNS = [
  "../../assets/sprites/level1/wukong/**/*.png",
  "../../assets/sprites/level1/guard/**/*.png"
] as const;

export const LEVEL1_SOUND_ENTRIES: Record<string, string> = {
  level1_speak_bgm: "../../assets/audio/level1/speak-bgm.wav",
  level1_practice_bgm: "../../assets/audio/level1/level1-NPC&玩家全对音效BGM.wav",
  level1_exam_bgm: "../../assets/audio/level1/lever1-BPM100-34bar.wav",
  "PLAYER-attention.wav": "../../assets/audio/level1/PLAYER-attention.wav",
  "PLAYER-salute.wav": "../../assets/audio/level1/PLAYER-salute.wav",
  "PLAYER-failed.wav": "../../assets/audio/level1/PLAYER-failed.wav",
  "NPC-attention.wav": "../../assets/audio/level1/NPC-attention.wav",
  "NPC-salute.wav": "../../assets/audio/level1/NPC-salute.wav"
};

export const LEVEL1_BACKGROUND_ENTRIES: Record<string, string> = {
  "level1-opening-bg": openingBgUrl,
  "level1-stage-bg": stageBgUrl
};
