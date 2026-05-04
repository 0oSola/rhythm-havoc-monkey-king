# Level 1 GIF Replacement Reference

Use this reference when replacing Level 1 character action GIFs.

## Runtime Targets

- Wukong runtime frames:
  - `src/assets/sprites/level1/wukong/idle`
  - `src/assets/sprites/level1/wukong/attention`
  - `src/assets/sprites/level1/wukong/salute`
  - `src/assets/sprites/level1/wukong/run`
  - `src/assets/sprites/level1/wukong/fail`
- Guard runtime frames:
  - `src/assets/sprites/level1/guard/idle`
  - `src/assets/sprites/level1/guard/attention`
  - `src/assets/sprites/level1/guard/salute`

## Idle Baselines

Normalize replacement actions to these baselines instead of changing scene scale.

### Wukong

- Idle canvas: `216x393`
- Idle visible bbox: `(left=8, top=16, right=208, bottom=381)`
- Use for:
  - `wukong_attention_right`
  - `wukong_salute_right`
  - `wukong_fail_right`
  - Any future standing action that should match current on-screen size

### Guard

- Idle canvas: `262x471`
- Idle visible bbox: `(left=12, top=12, right=250, bottom=459)`
- Use for:
  - `guard_attention_left`
  - `guard_salute_left`
  - Any future standing action that should match current on-screen size

## Current Runtime Keys

- Wukong:
  - `wukong_idle_right`
  - `wukong_attention_right`
  - `wukong_salute_right`
  - `wukong_run_right`
  - `wukong_fail_right`
- Guard:
  - `guard_idle_left`
  - `guard_attention_left`
  - `guard_salute_left`

## Metadata File To Update

- `src/game/animation/Level1SpriteAssets.ts`

Update these fields when the GIF changes the runtime sequence:

- `frameCount`
- `frameRate`
- `hitFrame`

## Tests To Check

- `tests/animation/Level1SpriteAssets.test.ts`
- `tests/scenes/Level1AssetCatalog.test.ts` if asset keys/paths changed
- `npx tsc --noEmit`
- `npm run build`

## Replacement Checklist

1. Inspect GIF frame count before replacement.
2. Replace frames into the existing runtime folder.
3. Delete stale numbered PNG frames when the new action has fewer frames.
4. Update `Level1SpriteAssets.ts` if frame count or timing changed.
5. Re-run typecheck and build.
6. Visually verify the pose size matches idle in scene.
