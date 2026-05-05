# Gate 01 Implementation Delta

This file lists the gap between the new locked spec and the current first-level implementation.

## 1. Input Spec

- Locked:
  - design wording may say `A+B`
  - runtime implementation must stay `A+S`
- Current status:
  - runtime already uses `A+S`
- Action:
  - keep runtime input mapping
  - normalize all UI prompts and docs to explain the spec/runtime distinction

## 2. Shared Action SFX

- Locked:
  - use `立正.wav` and `敬礼.wav`
  - do not separate NPC and PLAYER attention/salute SFX
- Current status:
  - code still references `PLAYER-attention.wav`, `PLAYER-salute.wav`, `NPC-attention.wav`, `NPC-salute.wav`
- Action:
  - replace action audio mapping in asset catalog and level JSON
  - remove NPC action-triggered runtime SFX in practice/exam

## 3. Opening Phase Structure

- Locked:
  - black screen white subtitle
  - empty stage shot
  - Wukong run-in from right
  - guard fade-in
  - 4 dialogue lines
  - black transition to Phase 1
- Current status:
  - current opening is already in-scene dialogue bubble flow
- Action:
  - add explicit Phase 0 presentation states before dialogue teaching

## 4. Phase 1 Free Teaching

- Locked:
  - first A press teaches the move
  - after that first press, guard speaks the second prompt
  - after 3 more presses, phase fades out
- Current status:
  - current free training count is different
- Action:
  - rewrite free-training thresholds and milestone text

## 5. Practice Audio Flow

- Locked:
  - stop dialogue BGM
  - play `LEVEL1-练习预播1小节提示.wav` once
  - then start the practice loop BGM
  - time zero begins exactly when loop BGM starts
- Current status:
  - current practice flow uses direct phase music switch without explicit warmup phase
- Action:
  - add a warmup sub-phase or phase state
  - start the clock only from loop BGM start

## 6. Practice Pass Logic

- Locked:
  - Phase 1 and Phase 2 pass if all player events in the loop are `GOOD` or better
  - cumulative 3 passes
- Current status:
  - current pass logic follows `GOOD`-or-better aggregate
- Action:
  - keep practice loop success evaluation threshold-based
  - keep tests aligned with `GOOD` / `GREAT` / `PERFECT` all counting as a pass

## 7. Wrong-Time Failure SFX

- Locked:
  - immediate `PLAYER-failed.wav` only when player presses at the wrong time
  - silent miss when player does nothing
- Current status:
  - current miss flow plays failure on judged miss
- Action:
  - separate `wrong input` from `no input miss`
  - update rhythm input processing accordingly

## 8. NPC 4.5 Beat Cues

- Locked:
  - each NPC demo bar has a `4.5` beat cue to tell the player the next bar is theirs
  - each successful player bar has a `4.5` beat praise cue
- Current status:
  - current implementation does not model these explicit cue events
- Action:
  - add cue event support to practice/exam data or scene presentation layer

## 9. Idle States

- Locked:
  - both actors must breathe with the BGM while idle
  - guard idle and Wukong idle loop assets are the current source of truth
- Current status:
  - runtime has idle loops, but beat-synced breathing is not yet formalized as a rule
- Action:
  - verify idle loop playback and synchronization expectations

## 10. Exam Audio And Chart

- Locked:
  - use `level1-NPC&BGM音效-0503版本.wav`
  - use the newly provided 34-bar chart as source of truth
- Current status:
  - current exam audio key and chart differ
- Action:
  - replace exam audio asset mapping
  - rewrite `gate_01.json` exam bars
  - update exam timeline tests

## 11. Result Copy

- Locked:
  - `天尊` / `真仙` / `道童` / `凡夫` copy updated
- Current status:
  - current copy differs
- Action:
  - update result texts in level data

## 12. Coding Order

Recommended implementation order:

1. Update spec-aligned tests for practice pass logic, wrong-time SFX logic, and audio routing.
2. Update level JSON audio/action/result data.
3. Add warmup flow and Phase 0 opening presentation states.
4. Rework practice/exam cue timing and SFX rules.
5. Re-run manual playthrough and acceptance checklist.
