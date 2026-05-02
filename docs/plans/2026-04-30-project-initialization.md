# Project Initialization Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Initialize the Phaser + TypeScript rhythm action MVP scaffold from `prd.md` and `AGENTS.md`.

**Architecture:** Core rhythm, input, judge, level, animation, feedback, and UI systems are separated under `src/game/`. Pure gameplay contracts are testable without Phaser; Phaser scenes compose those contracts into the playable shell.

**Tech Stack:** TypeScript, Phaser 3, Vite, Vitest, ESLint, Prettier.

---

### Task 1: Project Tooling

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `vite.config.ts`
- Create: `eslint.config.js`
- Create: `.prettierrc.json`
- Create: `index.html`

**Steps:**
1. Add Vite, Phaser, TypeScript, Vitest, ESLint, and Prettier configuration.
2. Prefer pnpm scripts while allowing local verification with the available npm executable.
3. Verify install, test, lint, and build commands after dependencies are present.

### Task 2: Testable Core Contracts

**Files:**
- Test: `tests/rhythm/BeatTimeline.test.ts`
- Test: `tests/rhythm/JudgeSystem.test.ts`
- Test: `tests/input/InputSystem.test.ts`
- Test: `tests/feedback/ScoreSystem.test.ts`
- Test: `tests/level/LevelLoader.test.ts`

**Steps:**
1. Write failing tests for BPM conversion, judgement windows, AB input, scoring, and level parsing.
2. Run tests to confirm failure from missing modules.
3. Implement minimal pure TypeScript systems to pass.

### Task 3: Phaser Shell

**Files:**
- Create: `src/main.ts`
- Create: `src/game/GameApp.ts`
- Create: scene files under `src/game/scenes/`
- Create: UI and animation controller placeholders.

**Steps:**
1. Add Boot, Preload, Menu, Level, and Result scenes.
2. Keep gameplay scenes data-driven through dedicated level definition files.
3. Use generated placeholder shapes/text until exported sequence-frame art exists.

### Task 4: MVP Data Layout

**Files:**
- Create: initial level definition files under `src/game/level/levels/`
- Create: placeholder README files under `src/assets/`.

**Steps:**
1. Add initial level data using the chosen gameplay structure.
2. Document sequence-frame Spine export rules in the asset folders.
3. Keep additional levels as future JSON-only additions.
