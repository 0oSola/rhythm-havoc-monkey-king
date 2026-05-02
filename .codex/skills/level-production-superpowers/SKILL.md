---
name: level-production-superpowers
description: Guide level development in this repository from requirement lock to asset planning, data design, TDD, Phaser integration, QA, and commit. Use when a request is about designing, scoping, rebuilding, implementing, reviewing, or accepting a game level, especially when the task references `prd.md`, `docs/scence/`, level JSON, Phaser scenes, art/audio intake, or asks to follow a strict workflow before coding.
---

# Level Production Superpowers

Use this skill as the default workflow for level work in this repo.

## Quick Start

1. Read `AGENTS.md`.
2. Read `docs/workflows/level-production-workflow.md`.
3. Read only the level-specific source materials you need:
   - `prd.md`
   - `docs/scence/<scene>.md`
   - `docs/levels/<levelId>/...` if the level already exists
4. Decide the current gate before doing work.
5. Do not skip TDD for code, config, data structure, or behavior changes unless automation is genuinely impossible.

## Gate Order

Follow this order and do not jump ahead unless the earlier gate is already complete.

### 1. Spec Gate

- Lock gameplay rules before coding.
- Make inputs, pass thresholds, score rules, failure rules, and phase exits explicit.
- Convert visual language like "must", "always", "cannot overlap", and "100% restore" into hard acceptance constraints.
- If the user is still clarifying requirements, stay in spec work.

When the user gives hard UI or layout constraints, also use `$ui-hard-constraint-spec`.

### 2. Asset Gate

- Build or update `docs/levels/<levelId>/assets.md`.
- Separate source assets from runtime keys.
- Record missing assets explicitly before integration.
- Keep runtime asset paths ASCII-safe when copying from localized source folders.

### 3. Data Gate

- Keep level flow in `src/game/level/levels/<levelId>.json`.
- Do not hardcode the whole level into `LevelScene`.
- Make phase audio ownership explicit.

### 4. TDD Gate

For any code, config, data shape, or behavior change:

1. Write a failing test first.
2. Run it and confirm the failure is correct.
3. Implement the smallest change.
4. Re-run targeted verification.
5. Refactor only after behavior is protected.

If a change cannot be automated, state why and add the smallest manual QA step to `docs/levels/<levelId>/qa.md`.

### 5. Integration Gate

- Keep scene logic thin and data-driven.
- Use audio as the timing authority for rhythm behavior.
- Keep animation reactive to game events, not scoring logic.

### 6. QA Gate

- Update `docs/levels/<levelId>/qa.md`.
- Validate visual constraints, audio transitions, gameplay thresholds, typecheck, build, and manual playthrough.

### 7. Commit Gate

- Use the guided commit flow.
- Keep the commit reason explicit.

## Standard Commands

- Scaffold a new level:
  `npm run init:level -- --levelId horse_02 --levelName "Horse Level"`
- Dry-run the scaffold:
  `npm run init:level -- --levelId horse_02 --levelName "Horse Level" --dry-run`
- Create a guided commit:
  `npm run commit:guided`

## References

Read `references/source-map.md` for the repo-specific file map and the expected outputs per gate.
