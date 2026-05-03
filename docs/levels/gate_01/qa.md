# Gate 01 QA

## Automated Checks

- `npx tsc --noEmit`
  - status: pass
- `npm run build`
  - status: pass

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

### Practice Warmup

- Clear `attention_free`
- Verify `attention_rhythm` first enters a warmup state before beat tracking starts
- Verify the practice clock starts only after warmup ends and loop BGM begins
- Repeat the same check for `salute_rhythm`

### Practice Rules

- Verify `attention_free` requires 4 correct `A` presses total
- Verify first milestone dialogue appears after the first successful `A`
- Verify practice pass count increases when the whole player bar is `GOOD` or better
- Verify `GOOD`, `GREAT`, and `PERFECT` all count as a passed practice loop
- Verify wrong-time player input plays `PLAYER-failed.wav`
- Verify no-input `MISS` stays silent
- Verify NPC demo bars in practice do not double-play separate NPC action sfx on top of BGM

### Exam

- Verify exam uses the updated 34-bar chart shape
- Specifically verify bars 19-22 behave as:
  - 19: NPC
  - 20: PLAYER
  - 21: NPC
  - 22: PLAYER
- Verify bars 25-26 remain empty break bars

## Known Gaps

- Opening is now structured and staged, but still not final-polish presentation
- Warmup and exam audio still use temporary runtime replacements for some locked source wav names
- A dedicated full end-to-end manual playthrough is still needed after final audio swap
