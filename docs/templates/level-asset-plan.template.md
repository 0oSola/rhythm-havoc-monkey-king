# <Level Name> Asset Plan

## Metadata

- levelId: `<level_id>`
- status: `draft`

## 1. Character Animation List

| Actor | Action | Facing | Frames | Loop | Runtime Key | Source Status |
| --- | --- | --- | --- | --- | --- | --- |
| Wukong | idle | left/right | TBD | yes | `wukong_idle` | missing |
| Wukong | action-1 | left/right | TBD | no | `wukong_action_1` | missing |
| Guard | idle | left/right | TBD | yes | `guard_idle` | missing |
| Guard | action-1 | left/right | TBD | no | `guard_action_1` | missing |

## 2. Background And Props

| Asset | Runtime Key | Source File | Notes |
| --- | --- | --- | --- |
| Stage background | `<level_id>-stage-bg` | TBD | |
| Opening background | `<level_id>-opening-bg` | TBD | |
| UI prop | TBD | TBD | |

## 3. Audio Mapping

| Usage | Runtime Key | Source File | Loop | Notes |
| --- | --- | --- | --- | --- |
| Dialogue / teaching | `<level_id>_speak_bgm` | TBD | yes | |
| Practice | `<level_id>_practice_bgm` | TBD | yes | |
| Exam | `<level_id>_exam_bgm` | TBD | no | |
| Action SFX | TBD | TBD | no | |

## 4. Export Rules

- Runtime assets must use safe ASCII paths when copied into live asset folders.
- Animation keys must stay stable even if source filenames change.
- Sequence frames must be numbered consistently for Phaser animation loading.
- Missing source art must be listed before implementation starts.

## 5. Acceptance Criteria

- [ ] Every runtime key has a mapped source file.
- [ ] Missing assets are explicit.
- [ ] Background, actor, and audio assets are separated.
- [ ] Naming is consistent with Phaser preload usage.
