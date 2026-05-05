# Source Map

Use this reference to keep context loading small during level work.

## Always Read First

- `AGENTS.md`
- `docs/workflows/level-production-workflow.md`

## Read When Relevant

### Requirement Sources

- `prd.md`
- `docs/scence/<scene>.md`
- `docs/scence/image.png` when the scene doc references a visual mock

### Existing Level State

- `docs/levels/<levelId>/spec.md`
- `docs/levels/<levelId>/assets.md`
- `docs/levels/<levelId>/qa.md`
- `src/game/level/levels/<levelId>.json`

### Core Runtime Files

- `src/game/scenes/LevelScene.ts`
- `src/game/scenes/LevelScenePresentation.ts`
- `src/game/level/LevelLoader.ts`
- `src/game/level/LevelTypes.ts`
- `src/game/rhythm/JudgeSystem.ts`

### Existing Level Tooling

- `scripts/init-level.mjs`
- `scripts/levelWorkflowScaffold.mjs`
- `scripts/commit-guided.ps1`

## Expected Outputs Per Gate

### Spec Gate

- Updated `docs/levels/<levelId>/spec.md`
- Explicit open questions or frozen decisions

### Asset Gate

- Updated `docs/levels/<levelId>/assets.md`
- Runtime key mapping
- Missing asset list

### Data Gate

- Updated `src/game/level/levels/<levelId>.json`
- Matching types or loader changes when required

### TDD Gate

- New or updated failing tests first
- Minimal implementation second

### QA Gate

- Updated `docs/levels/<levelId>/qa.md`
- Verification notes for typecheck, build, tests, and manual playthrough
