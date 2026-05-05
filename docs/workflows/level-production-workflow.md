# Level Production Workflow

This workflow is the default path for every new level in this repo. The goal is to make each level reproducible, data-driven, and reviewable before it reaches scene integration.

## 1. Spec Gate

Inputs:

- `prd.md`
- scene-specific source doc under `docs/scence/`
- latest user clarifications

Outputs:

- level spec document under `docs/levels/<levelId>/spec.md`

Rules:

- Freeze the gameplay loop before coding.
- Write down exact input mappings, pass thresholds, score rules, and phase exits.
- Convert visual statements like "must", "always", "cannot overlap", and "100% restore" into hard constraints.
- If the spec is still changing, do not start scene implementation.

## 2. Asset Gate

Outputs:

- asset plan under `docs/levels/<levelId>/assets.md`
- runtime asset key map
- explicit missing-asset list

Rules:

- Separate source assets from runtime asset keys.
- Record actor actions, facing directions, frame counts, loop flags, and source status.
- Keep ASCII-safe runtime paths when copying from origin assets with localized names.
- Do not connect Phaser animation until the required runtime mapping is clear.

## 3. Data Gate

Outputs:

- level JSON scaffold under `src/game/level/levels/<levelId>.json`

Rules:

- Keep phase flow, actions, dialogues, practice loops, and exam bars in data.
- Do not hardcode the whole level flow in `LevelScene`.
- Audio ownership must be explicit per phase.

## 4. TDD Gate

Rules:

1. Write a failing automated test for the intended behavior first.
2. Run it and confirm the failure is correct.
3. Implement the minimum change.
4. Run the targeted tests again.
5. Refactor only after behavior is protected.

If a behavior cannot be automated, document why and add the smallest manual verification path in `qa.md`.

## 5. Integration Gate

Scope:

- Phaser preload wiring
- animation keys
- dialogue presentation
- rhythm flow
- result handoff

Rules:

- Keep scene logic thin and driven by level data.
- Audio is the time authority for rhythm logic.
- Animation reacts to gameplay events; it does not decide judgement or score.

## 6. QA Gate

Outputs:

- `docs/levels/<levelId>/qa.md` filled in during validation

Required checks:

- visual constraints
- audio transitions
- gameplay thresholds
- typecheck
- build
- manual end-to-end playthrough

## 7. Commit Gate

Rules:

- Use the guided commit flow.
- Commit message format:

```text
type(scope): summary

reason: why this change is needed
```

Useful commands:

```bash
npm run init:level -- --levelId horse_02 --levelName "弼马温上班记"
npm run commit:guided
```

## Standard Deliverables

Each new level should end up with:

- `docs/levels/<levelId>/spec.md`
- `docs/levels/<levelId>/assets.md`
- `docs/levels/<levelId>/qa.md`
- `src/game/level/levels/<levelId>.json`
- `tests/level/<levelId>.test.ts`

## Acceptance To Start Coding

Coding can start only when:

- spec is stable enough
- missing assets are visible
- runtime keys are named
- the JSON shape can represent the level
- the first automated failing test is identified
