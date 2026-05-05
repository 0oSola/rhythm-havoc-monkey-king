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
  - runtime file: `src/assets/audio/level1/level1-dialogue-bgm.wav`
  - source file: `src/assets/origin/LEVEL1-对话BGM-51小节.wav`
  - usage: opening dialogue + free teaching
- `level1_dialogue_confirm_sfx`
  - runtime file: `src/assets/audio/level1/dialogue-confirm.wav`
  - source file: `src/assets/origin/音乐/第一关音效5-4/普通按A.wav`
  - usage: dialogue-step confirm with `A`
- `level1_dialogue_confirm_final_sfx`
  - runtime file: `src/assets/audio/level1/dialogue-confirm-final.wav`
  - source file: `src/assets/origin/音乐/第一关音效5-4/最后一下按A.wav`
  - usage: final `A` that exits the current dialogue round
- `level1_practice_ready_bgm`
  - runtime file: `src/assets/audio/level1/level1-practice-ready.wav`
  - source file: `src/assets/origin/音乐/第一关音效5-4/LEVEL1-练习预播1小节提示.wav`
  - usage: 1-bar warmup before each practice loop
- `level1_attention_practice_bgm`
  - runtime file: `src/assets/audio/level1/level1-practice-attention.wav`
  - source file: `src/assets/origin/音乐/第一关音效5-4/第一关练习BGM （立正）loop-BPM100-2小节.wav`
  - usage: Phase 1 attention practice loop
- `level1_salute_practice_bgm`
  - runtime file: `src/assets/audio/level1/level1-practice-salute.wav`
  - source file: `src/assets/origin/音乐/第一关音效5-4/第一关练习BGM （敬礼）loop-BPM100-2小节.wav`
  - usage: Phase 2 salute practice loop
- `level1_exam_bgm_0503`
  - runtime file: `src/assets/audio/level1/level1-exam-bgm-0503.wav`
  - source file: `src/assets/origin/音乐/第一关音效5-4/level1-NPC&BGM音效-0503版本.wav`
  - usage: Phase 3 exam
- `绔嬫.wav`
  - runtime file: `src/assets/audio/level1/player-attention.wav`
  - source file: `src/assets/origin/音乐/第一关音效5-4/立正.wav`
  - usage: player attention hit sfx
- `鏁ぜ.wav`
  - runtime file: `src/assets/audio/level1/player-salute.wav`
  - source file: `src/assets/origin/音乐/第一关音效5-4/敬礼.wav`
  - usage: player salute hit sfx
- `PLAYER-failed.wav`
  - runtime file: `src/assets/audio/level1/player-failed.wav`
  - source file: `src/assets/origin/音乐/第一关音效5-4/PLAYER-failed.wav`
  - usage: wrong-time player input only
- `PLAYER-correct.wav`
  - runtime file: `src/assets/audio/level1/player-correct.wav`
  - source file: `src/assets/origin/音乐/第一关音效5-4/PLAYER-correct.wav`
  - usage: NPC praise cue after a full-hit player bar

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
  - `guard_watch_left`
  - `guard_praise_left`
    - runtime alias to the salute animation for now

## Source Art Notes

- Wukong / Guard runtime frames are normalized into:
  - `src/assets/sprites/level1/wukong/`
  - `src/assets/sprites/level1/guard/`
- `guard_watch_left` was generated from:
  - `src/assets/origin/第一关图片/NPC看玩家做.gif`
- `guard_praise_left` currently reuses the guard salute runtime animation as a temporary praise action.

## Remaining Gaps

- There is still no dedicated runtime `guard_praise_left` art set.
- `NPC赞扬.png` and `NPC捂耳（玩家弹错时）.gif` are still source-only and not connected to runtime yet.
