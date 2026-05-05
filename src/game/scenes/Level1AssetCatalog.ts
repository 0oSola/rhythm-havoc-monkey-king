import openingBgUrl from "../../assets/backgrounds/level1/opening.png";
import stageBgUrl from "../../assets/backgrounds/level1/stage.png";

export const LEVEL1_FRAME_GLOB_PATTERNS = [
  "../../assets/sprites/level1/wukong/**/*.png",
  "../../assets/sprites/level1/guard/**/*.png"
] as const;

export const LEVEL1_SOUND_ENTRIES: Record<string, string> = {
  level1_dialogue_bgm: "../../assets/audio/level1/level1-dialogue-bgm.wav",
  level1_dialogue_confirm_sfx: "../../assets/audio/level1/dialogue-confirm.wav",
  level1_dialogue_confirm_final_sfx: "../../assets/audio/level1/dialogue-confirm-final.wav",
  level1_guard_oi_sfx: "../../assets/audio/level1/guard-oi.wav",
  level1_practice_ready_bgm: "../../assets/audio/level1/level1-practice-ready.wav",
  level1_attention_practice_bgm: "../../assets/audio/level1/level1-practice-attention.wav",
  level1_salute_practice_bgm: "../../assets/audio/level1/level1-practice-salute.wav",
  level1_exam_bgm_0503: "../../assets/audio/level1/level1-exam-bgm-0503.wav",
  level1_player_attention_sfx: "../../assets/audio/level1/PLAYER-attention.wav",
  level1_player_salute_sfx: "../../assets/audio/level1/PLAYER-salute.wav",
  "立正.wav": "../../assets/audio/level1/PLAYER-attention.wav",
  "敬礼.wav": "../../assets/audio/level1/PLAYER-salute.wav",
  "PLAYER-failed.wav": "../../assets/audio/level1/PLAYER-failed.wav",
  "PLAYER-correct.wav": "../../assets/audio/level1/player-correct.wav",
  level1_speak_bgm: "../../assets/audio/level1/level1-dialogue-bgm.wav",
  level1_practice_bgm: "../../assets/audio/level1/level1-practice-attention.wav",
  level1_exam_bgm: "../../assets/audio/level1/level1-exam-bgm-0503.wav"
};

export const LEVEL1_BACKGROUND_ENTRIES: Record<string, string> = {
  "level1-opening-bg": openingBgUrl,
  "level1-stage-bg": stageBgUrl
};
