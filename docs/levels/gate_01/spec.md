# Gate 01 Spec

## Metadata

- levelId: `gate_01`
- levelNumber: `01`
- status: `locked-for-implementation`
- sourceDocs:
  - `prd.md`
  - `docs/scence/scence1.md`
  - user clarifications through `2026-05-04`

## Goal

- 玩家目标：混进南天门，先学会 `立正` 和 `敬礼`，再完成正式检查。
- 核心循环：`看门卫示范 -> 玩家模仿 -> 门卫反馈`
- 关卡重点：
  - `A = ATTENTION`
  - `A+S = SALUTE`
  - 练习和考试都以音频实际播放时间为准

## Input Rules

- Runtime input mapping:
  - `A` -> `ATTENTION`
  - `A+S` -> `SALUTE`
- 文案里仍允许出现 `A+B`，运行时统一按 `A+S` 处理
- Pointer:
  - 仅用于 opening / dialogue confirm
  - 不承担节奏输入

## Judgement Rules

- `PERFECT`: `±80ms`
- `GREAT`: `±150ms`
- `GOOD`: `±220ms`
- `MISS`: `>220ms`
- Wrong-time input:
  - 玩家在错误时机按 `A` 或 `A+S` 时立刻播 `PLAYER-failed.wav`
  - 如果目标点完全没按，只记 `MISS`，不播失败音效

## Audio Rules

### Player SFX

- `ATTENTION` -> `立正.wav`
- `SALUTE` -> `敬礼.wav`
- wrong-time input -> `PLAYER-failed.wav`
- player bar full-hit praise -> `PLAYER-correct.wav`

### Dialogue SFX

- opening 对话阶段，玩家按 `A` 进入下一句时：
  - 普通对白切换 -> `普通按A.wav`
  - 当前轮对白最后一次 `A` -> `最后一下按A.wav`

### Phase Audio Map

- opening dialogue / free teaching:
  - `LEVEL1-对话BGM-51小节.wav`
- practice warmup:
  - `LEVEL1-练习预播1小节提示.wav`
- Phase 1 practice loop:
  - `第一关练习BGM （立正）loop-BPM100-2小节.wav`
- Phase 2 practice loop:
  - `第一关练习BGM （敬礼）loop-BPM100-2小节.wav`
- Phase 3 exam:
  - `level1-NPC&BGM音效-0503版本.wav`

### Timing Ownership

- Practice / exam 的 `0ms` 从对应 BGM 实际开始播放那一刻算起
- 切 phase 时必须先停旧音频，再起新音频
- NPC 在练习 / 考试里的动作点音效已并入 BGM，不额外单播

## Visual Constraints

- Phase 0 opening:
  - 黑屏白字
  - 空镜
  - 悟空从右侧进入
  - 门卫淡入出现
  - 4 句对白后黑场切到 Phase 1
- Stage phases:
  - 门卫在左
  - 悟空在右
  - 双方始终相向
- Idle:
  - 门卫使用 `guard_idle_left`
  - 悟空使用 `wukong_idle_right`

## NPC Cue Rules

- 在每个 NPC 示范小节的 `4.5` 拍：
  - 不额外播提示音效
  - 门卫切到 watch cue
  - watch cue 必须持续整个玩家操作小节
- 在每个玩家操作小节的 `4.5` 拍：
  - 如果该小节所有目标事件都不是 `MISS`
  - 门卫播放 praise cue
  - 同时播放 `PLAYER-correct.wav`

## Phase Flow

### Phase 0 Opening

1. 黑屏字幕
2. 空镜
3. 悟空潜入
4. 门卫现身
5. 4 句对白
6. 黑场切入 `attention_free`

### Phase 1 Free Teaching

1. 门卫提示：学会立正，按 `A`
2. 第一次正确输入后：
  - 悟空播立正动作
  - 播 `立正.wav`
3. 第 1 次成功后出现里程碑对白
4. 总计成功 `4` 次后进入 `attention_rhythm`

### Phase 1 Practice

- warmup: `2400ms`
- loopDuration: `4800ms`
- 结构：
  - 第 1 小节 NPC 示范
  - 第 2 小节玩家模仿
- passThreshold:
  - 以当前 runtime 配置为准
- requiredPassCount:
  - `3`

### Phase 2 Free Teaching

1. 门卫提示：学敬礼，同时按 `A+S`
2. 玩家自由成功 `3` 次后出现第二段里程碑对白
3. 进入 `salute_rhythm`

### Phase 2 Practice

- 与 Phase 1 practice 结构一致
- action 改为 `SALUTE`

### Phase 3 Exam

- 使用 34 小节 chart
- bars `1-2`: 只听不操作
- 后续按现有 `gate_01.json` chart 执行

## Result Copy

- `天尊`: “好！此人可替我值班！”
- `真仙`: “不错，像练过的。”
- `道童`: “手脚倒是齐全。”
- `凡夫`: “来人，把他叉出去！”

## Acceptance Criteria

- opening 对话 `A` 切句必须有 confirm sfx
- opening 最后一句的 `A` 必须播放 final confirm sfx
- practice / exam 的 NPC handoff cue 必须落在 `4.5` 拍
- handoff cue 必须持续到玩家小节结束
- 玩家整小节 full-hit 时，`4.5` 拍必须触发 praise cue + `PLAYER-correct.wav`
- 所有正式音频键都指向 `第一关音效5-4` 对应 runtime 文件
