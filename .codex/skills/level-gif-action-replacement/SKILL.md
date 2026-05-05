---
name: level-gif-action-replacement
description: Replace character action GIFs with normalized Phaser runtime frame sequences in this repository. Use when a user provides new role or action GIF assets, asks to swap existing sprites without changing gameplay code, or asks to keep all poses the same on-screen size as idle while updating src/assets/sprites/level1, Level1SpriteAssets.ts, and related tests.
---

# Level Gif Action Replacement

Use this skill when the task is to replace existing character action frames from GIF source assets while preserving runtime animation keys and scene behavior.

## Workflow

1. Read `AGENTS.md`.
2. Read `references/level1.md` when the task is for Level 1.
3. Inspect the source GIFs first.
   - Confirm frame count.
   - Confirm whether the GIF should replace `idle`, `attention`, `salute`, `fail`, or another existing action.
   - Confirm whether the target runtime actor is `wukong` or `guard`.
4. Keep the existing runtime key and folder structure stable.
   - Replace PNG frames under `src/assets/sprites/level1/...`.
   - Do not rename runtime animation keys unless the user explicitly asks for a new action.
5. Normalize frame size to the idle baseline instead of changing scene scale.
   - Do not fix oversized poses by editing `ACTOR_LAYOUT.scale` first.
   - Rebuild each action frame onto the target idle canvas and target visible bbox.
6. Use the bundled script for deterministic replacement.
   - `scripts/replace_gif_action.py`
7. If the GIF frame count changes:
   - Update `src/game/animation/Level1SpriteAssets.ts`
   - Update tests that assert frame counts, hit frames, or phase slices.
   - Remove stale extra PNG frames if the new action has fewer frames.
8. Validate after replacement.
   - `npx tsc --noEmit`
   - `npm run build`
9. If the user cares about future reuse, update `docs/levels/<levelId>/assets.md` with the new source asset note.

## Rules

- Preserve gameplay and runtime identifiers unless the request explicitly changes them.
- Prefer asset normalization over scene scale tweaks.
- Keep the actor anchored to the same bottom alignment as idle.
- If a new GIF has fewer frames than the current runtime action, delete stale higher-numbered PNGs.
- If the source motion changes semantic timing, update `frameCount`, `frameRate`, and `hitFrame` together.
- When replacing only art, avoid changing `LevelScene` logic unless the new asset count or timing makes it necessary.

## Script

Use:

```powershell
& "C:\Users\sola\AppData\Local\Programs\Python\Python312\python.exe" `
  ".codex/skills/level-gif-action-replacement/scripts/replace_gif_action.py" `
  --source-gif "src/assets/origin/<folder>/<action>.gif" `
  --output-dir "src/assets/sprites/level1/wukong/attention" `
  --prefix "wukong_attention_right" `
  --target-width 216 `
  --target-height 393 `
  --bbox-left 8 `
  --bbox-top 16 `
  --bbox-right 208 `
  --bbox-bottom 381
```

Use the Level 1 baseline values from `references/level1.md`.

## References

- Read `references/level1.md` for Level 1 runtime folders, idle baselines, and file update checklist.
