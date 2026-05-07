# Gate 01 QA

## Automated Checks

- `npx tsc --noEmit`
  - status: pass
- `npm run build`
  - status: pass
- `vitest`
  - status: targeted pass for `tests/scenes/LevelSceneDebugCommands.test.ts` and `tests/scenes/LevelSceneResultTransition.test.ts`

## Manual Acceptance Checklist

### Opening

- Launch Level 1 and verify the opening advances through 8 confirms:
  - black title card
  - establishing shot
  - Wukong run-in from right
  - guard reveal
  - 4 dialogue lines
- Verify non-dialogue opening steps do not show dialogue bubbles
- Verify dialogue steps still show actor-side bubbles
- Verify pressing `A` on a dialogue step plays `普通按A.wav`
- Verify pressing `A` on the last dialogue line plays `最后一下按A.wav`
- Verify pointer confirm still advances normally

### Practice Warmup

- Clear `attention_free`
- Verify `attention_rhythm` first enters a warmup state before beat tracking starts
- Verify the practice clock starts only after warmup ends and loop BGM begins
- Repeat the same check for `salute_rhythm`

### Practice Rules

- Verify `attention_free` requires 4 correct `A` presses total
- Verify first milestone dialogue appears after the first successful `A`
- Verify practice pass count increases under the current configured threshold
- Verify consecutive `ATTENTION` / `SALUTE` character actions always finish their full animation before the next action starts, with no visible dropped frames or mid-action interruption
- Verify wrong-time player input plays `PLAYER-failed.wav`
- Verify no-input `MISS` stays silent
- Verify NPC demo bars in practice do not double-play separate NPC action sfx on top of BGM
- Verify at beat `4.5` of the NPC demo bar the guard enters the watch cue and holds it through the whole player bar
- Verify at beat `4.5` of the player bar, if all player events in that bar are non-`MISS`, the guard plays praise feedback and `PLAYER-correct.wav`

### Exam

- Verify exam uses the updated 34-bar chart shape
- Specifically verify bars 19-22 behave as:
  - 19: NPC
  - 20: PLAYER
  - 21: NPC
  - 22: PLAYER
- Verify bars 25-26 remain empty break bars
- Verify each NPC-to-player handoff bar triggers the watch cue at beat `4.5`
- Verify each full-hit player bar triggers the praise cue and `PLAYER-correct.wav` at beat `4.5`
- After the formal exam ends, verify the game plays the same final confirm click used by the start button before the screen fades to black
- Verify the result screen appears only after the fade completes, not immediately on exam completion

### Debug Shortcuts

- Type `dev` to reopen the bubble debug panel
- Type `dvo` to jump back to the opening phase
- Type `dvf` to jump to the first free-training phase
- Type `dvw` to jump to the first practice warmup
- Type `dvl` to jump to the first practice loop directly
- Type `dve` to jump to the exam phase
- Type `dvr` to jump straight to the result phase

## Known Gaps

- Guard praise still reuses the salute animation as a temporary placeholder.
- Full `vitest` remains unverified here; only the new targeted scene tests were executed successfully with elevated permissions.
