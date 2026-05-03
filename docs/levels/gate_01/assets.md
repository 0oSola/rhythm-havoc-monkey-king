# Gate 01 Assets

## Runtime Backgrounds

- `level1-opening-bg`
  - runtime file: `src/assets/backgrounds/level1/opening.png`
  - usage: Phase 0 opening
- `level1-stage-bg`
  - runtime file: `src/assets/backgrounds/level1/stage.png`
  - usage: Phase 1 / 2 / 3 gameplay stage

## Runtime Audio Keys

- `level1_dialogue_bgm`
  - runtime file: `src/assets/audio/level1/speak-bgm.wav`
  - usage: opening + free teaching
  - note: current runtime fallback for locked `LEVEL1-对话BGM-51小节.wav`
- `level1_practice_ready_bgm`
  - runtime file: `src/assets/audio/level1/level1-纯NPC音效.wav`
  - usage: 1-bar warmup before each practice loop
  - note: temporary runtime substitute until dedicated warmup wav is delivered
- `level1_attention_practice_bgm`
  - runtime file: `src/assets/audio/level1/level1-NPC&玩家全对音效BGM.wav`
  - usage: Phase 1 attention practice loop
- `level1_salute_practice_bgm`
  - runtime file: `src/assets/audio/level1/level1-NPC&玩家全对音效BGM.wav`
  - usage: Phase 2 salute practice loop
  - note: current runtime fallback; should split once dedicated salute loop wav arrives
- `level1_exam_bgm_0503`
  - runtime file: `src/assets/audio/level1/lever1-BPM100-34bar.wav`
  - usage: Phase 3 exam
  - note: current runtime fallback for locked `level1-NPC&BGM音效-0503版本.wav`
- `立正.wav`
  - runtime file: `src/assets/audio/level1/PLAYER-attention.wav`
  - usage: player attention hit sfx
- `敬礼.wav`
  - runtime file: `src/assets/audio/level1/PLAYER-salute.wav`
  - usage: player salute hit sfx
- `PLAYER-failed.wav`
  - runtime file: `src/assets/audio/level1/PLAYER-failed.wav`
  - usage: wrong-time player input only

## Runtime Character Animation Keys

- Wukong
  - `wukong_idle_right`
  - `wukong_run_right`
  - `wukong_attention_right`
  - `wukong_salute_right`
  - `wukong_fail_right`
- Guard
  - `guard_idle_left`
  - `guard_attention_left`
  - `guard_salute_left`

## Source Asset Notes

- Source art is still under localized origin folders:
  - `src/assets/origin/图片素材/第一关图片/`
  - `src/assets/origin/音乐/第一关音效/`
- Runtime sprite frames have already been normalized into:
  - `src/assets/sprites/level1/wukong/`
  - `src/assets/sprites/level1/guard/`

## Missing / Temporary Replacements

- Missing dedicated runtime wav for `LEVEL1-对话BGM-51小节.wav`
- Missing dedicated runtime wav for `LEVEL1-练习预播1小节提示.wav`
- Missing dedicated runtime wav for `第一关练习BGM（敬礼）loop-BPM100-2小节.wav`
- Missing dedicated runtime wav for `level1-NPC&BGM音效-0503版本.wav`
- Current implementation uses stable runtime keys now, so these files can be swapped in later without changing scene logic
