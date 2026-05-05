# Menu Opening BGM Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Start the opening BGM as soon as the menu loads, keep it looping on the menu, and stop it when gameplay begins.

**Architecture:** Add the opening BGM to the menu asset catalog and preload path, then keep menu-specific playback orchestration inside a small scene helper so `MenuScene` stays thin. Stop playback through the same helper before the menu transitions into `LevelScene`.

**Tech Stack:** TypeScript, Phaser 3, Vite, Vitest

---

### Task 1: Register the menu BGM asset

**Files:**
- Modify: `src/game/scenes/MenuAssetCatalog.ts`
- Modify: `src/game/scenes/PreloadScene.ts`
- Test: `tests/scenes/MenuAssetCatalog.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
it("provides the looping opening bgm used by the menu scene", () => {
  expect(MENU_SOUND_ENTRIES).toMatchObject({
    "menu-opening-bgm": expect.any(String)
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `corepack pnpm test tests/scenes/MenuAssetCatalog.test.ts`
Expected: FAIL because `MENU_SOUND_ENTRIES` does not exist yet.

- [ ] **Step 3: Write minimal implementation**

Add the imported wav URL to `MENU_SOUND_ENTRIES` and preload it from `PreloadScene`.

- [ ] **Step 4: Run test to verify it passes**

Run: `corepack pnpm test tests/scenes/MenuAssetCatalog.test.ts`
Expected: PASS

### Task 2: Add menu BGM playback orchestration

**Files:**
- Create: `src/game/scenes/MenuSceneAudio.ts`
- Modify: `src/game/scenes/MenuScene.ts`
- Test: `tests/scenes/MenuSceneAudio.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
it("starts the menu opening bgm immediately when sound is unlocked", () => {
  // expect sound.add/play to be called for menu-opening-bgm
});

it("stops the menu opening bgm when leaving the menu", () => {
  // expect stop on the managed sound instance
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `corepack pnpm test tests/scenes/MenuSceneAudio.test.ts`
Expected: FAIL because the helper does not exist yet.

- [ ] **Step 3: Write minimal implementation**

Create a helper that:
- reuses or creates a single looping sound instance,
- plays immediately when unlocked,
- retries once the sound manager unlocks,
- returns a cleanup function that removes listeners and stops playback.

- [ ] **Step 4: Run test to verify it passes**

Run: `corepack pnpm test tests/scenes/MenuSceneAudio.test.ts`
Expected: PASS

### Task 3: Verify the integrated menu audio path

**Files:**
- Test: `tests/scenes/MenuAssetCatalog.test.ts`
- Test: `tests/scenes/MenuSceneAudio.test.ts`

- [ ] **Step 1: Run targeted regression tests**

Run: `corepack pnpm test tests/scenes/MenuAssetCatalog.test.ts tests/scenes/MenuSceneAudio.test.ts`
Expected: PASS

- [ ] **Step 2: Run broader scene regression coverage**

Run: `corepack pnpm test tests/scenes/Level1AssetCatalog.test.ts tests/scenes/MenuSceneConfig.test.ts`
Expected: PASS
