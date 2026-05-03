# 南天门 · 第一关 Spec

## Metadata

- levelId: `gate_01`
- levelNumber: `01`
- status: `locked-for-implementation`
- sourceDocs:
  - `prd.md`
  - `docs/scence/scence1.md`
  - latest user clarification on 2026-05-03

## 1. Goal

- Player fantasy: 悟空混进南天门，先被门卫当场抓包，再被迫学习天庭礼仪。
- Core loop: 先看门卫示范，再在自己的小节模仿输入。
- MVP focus:
  - 玩家能清楚理解 `A = 立正`
  - 玩家能清楚理解 `A+S = 敬礼`
  - 玩家能在正式考核中跟随 34 小节完成模仿
- Out of scope:
  - 不做额外 HUD 教程系统
  - 不做复杂镜头切换系统
  - 不做多角色评分差异

## 2. Input Rules

- Runtime input mapping:
  - `A` -> `ATTENTION`
  - `A+S` -> `SALUTE`
- Spec notation:
  - 设计稿中允许继续写 `A+B`
  - 运行时实现统一映射为 `A+S`
- Pointer support:
  - 开场对白 / 切换阶段允许点击确认
  - 节奏输入阶段不依赖 pointer 完成核心玩法
- Chord window:
  - `A+S` 组合键沿用现有组合键时间窗

## 3. Judgement And Scoring

- Judge windows:
  - `PERFECT`: `±80ms`
  - `GREAT`: `±150ms`
  - `GOOD`: `±220ms`
  - `MISS`: `>220ms`
- Phase 1 / Phase 2 practice pass rule:
  - 单轮所有玩家事件必须都达到 `GOOD` 及以上
  - `GOOD` / `GREAT` / `PERFECT` 都算通过
- Practice accumulation:
  - 采用累计通过 3 次，不要求连续
- Wrong-time input SFX rule:
  - 玩家在非目标时机按下 `A` 或 `A+S`，立即播放 `PLAYER-failed.wav`
  - 玩家若在目标时机完全没按，产生 `MISS`，但不播放 `PLAYER-failed.wav`
- Result ratings:
  - `天尊`
  - `真仙`
  - `道童`
  - `凡夫`

## 4. Audio Rules

### Shared action SFX

- `ATTENTION` -> `立正.wav`
- `SALUTE` -> `敬礼.wav`
- `wrong-time input` -> `PLAYER-failed.wav`

### Global audio ownership

- NPC 不再区分独立动作音效文件。
- NPC 在练习 / 正式考核中的动作点音效，统一合并在对应 BGM 中。
- 玩家动作音效仍单独播放。

### Phase audio map

- Phase 0 opening:
  - `LEVEL1-对话BGM-51小节.wav`
- Phase 1 practice warmup:
  - `LEVEL1-练习预播1小节提示.wav`
- Phase 1 practice loop:
  - `第一关练习BGM（立正）loop-BPM100-2小节.wav`
- Phase 2 practice warmup:
  - `LEVEL1-练习预播1小节提示.wav`
- Phase 2 practice loop:
  - `第一关练习BGM（敬礼）loop-BPM100-2小节.wav`
- Phase 3 exam:
  - `level1-NPC&BGM音效-0503版本.wav`

### Audio timing rules

- Practice / exam time zero starts when the practice or exam BGM actually begins playback.
- 练习阶段从预热音频结束、练习 BGM 开始播放那一刻才开始对拍。
- Phase switch must stop the previous phase BGM before the next one starts.

## 5. Visual Hard Constraints

- Phase 0 opening must include:
  - 黑屏白字
  - 空镜
  - 悟空从右侧进入
  - 门卫在南天门口渐显出现
  - 4 句对白后黑场切入 Phase 1
- Phase 1 / 2 / 3 must use the stage scene with:
  - 门卫在左
  - 悟空在右
  - 双方彼此相向
- Idle states:
  - 门卫待机使用 `npc-init-loop`
  - 悟空待机使用 `wukong-init-loop`
  - 待机必须跟随 BGM 呼吸节奏
- Dialogue box:
  - 开场和教学阶段的主对白仍放在画面下方
- Anticipation cue:
  - 每个 NPC 示范小节的第 `4.5` 拍要给下一个小节轮换提示
- Praise cue:
  - 每个玩家操作小节的第 `4.5` 拍，如果本小节全部命中，要给 NPC 赞赏动作和音效

## 6. Phase Flow

### Phase 0 Opening

1. 黑屏白字
2. 渐显空镜
3. 悟空从右侧进入
4. 门卫渐显出现
5. 对话 4 句：
   - 门卫：“Oi——什么人？”
   - 悟空：“俺是堂堂花果山水帘洞美猴王孙——”
   - 门卫：“管你是谁，要过南天门，先跟我学礼仪 (｀Д´)”
   - 悟空：“啊？什么礼仪？”
6. 黑场切入 Phase 1

### Phase 1 Basic Teaching: Attention

1. 门卫提示：“你先学会立正，按A”
2. 玩家第一次按 `A`：
   - 悟空播放立正动作
   - 播放 `立正.wav`
3. 玩家总计按满 1 次后，门卫说：
   - “就是这样，再按几次，我们就跟节奏来。”
4. 再额外按满 3 次后：
   - 关闭 `LEVEL1-对话BGM-51小节.wav`
   - 播放 `LEVEL1-练习预播1小节提示.wav`
   - 进入 `第一关练习BGM（立正）loop-BPM100-2小节.wav`
5. 进入 2 小节循环练习
6. 累计通过 3 轮后，进入敬礼自由教学

### Phase 2 Advanced Teaching: Salute

1. 门卫提示：“不错，还算有天赋，接下来跟我学敬礼，同时按A和B。”
2. 玩家自由输入 `A+S` 共 3 次
3. 门卫提示：“就是这样，那么，跟节奏来吧。”
4. 播放 `LEVEL1-练习预播1小节提示.wav`
5. 进入 `第一关练习BGM（敬礼）loop-BPM100-2小节.wav`
6. 累计通过 3 轮后，进入正式考核

### Phase 3 Exam

1. 门卫提示：“不错，那么，我们开始正式考核了。”
2. 播放 `level1-NPC&BGM音效-0503版本.wav`
3. 按 34 小节 chart 执行正式检查
4. 乐曲结束后进入结算

## 7. Practice Config

### Phase 1 Practice

- bpm: `100`
- timeSignature: `[4, 4]`
- beatMs: `600`
- barMs: `2400`
- loopBars: `2`
- loopDurationMs: `4800`
- requiredPassCount: `3`
- player pass condition:
  - `2400ms` `A` must be `GOOD` or better
  - `3600ms` `A` must be `GOOD` or better
- npc demo events:
  - `0ms` beat `1` -> `ATTENTION`
  - `1200ms` beat `3` -> `ATTENTION`
- player input events:
  - `2400ms` beat `1` -> `ATTENTION`
  - `3600ms` beat `3` -> `ATTENTION`

### Phase 2 Practice

- bpm: `100`
- timeSignature: `[4, 4]`
- beatMs: `600`
- barMs: `2400`
- loopBars: `2`
- loopDurationMs: `4800`
- requiredPassCount: `3`
- player pass condition:
  - player events for the salute loop must all be `GOOD` or better
- practice structure mirrors Phase 1 but action changes to `SALUTE`

## 8. Exam Chart Summary

- bpm: `100`
- timeSignature: `[4, 4]`
- beatMs: `600`
- barMs: `2400`
- totalBars: `34`
- macro structure:
  - bars `1-2`: listen only
  - bars `3-18`: `1 NPC bar + 1 PLAYER bar`
  - bars `19-22`: `2 NPC bars + 2 PLAYER bars`
  - bars `23-24`: back to `1 + 1`
  - bars `25-26`: break only
  - bars `27-34`: back to `1 + 1`
- detailed bar events:
  - source of truth is the latest user-provided `levelChart`

## 9. Result Copy

- `天尊`: “好！此人可替我值班！”
- `真仙`: “不错，像练过的。”
- `道童`: “手脚倒是齐全。”
- `凡夫`: “来人，把他叉出去！”

## 10. Acceptance Criteria

- [x] Runtime input remains `A` and `A+S`
- [x] Spec wording may continue to say `A+B`
- [x] Practice phases require all-player-events-hit with `GOOD`-or-better pass logic
- [x] Wrong-time player input immediately triggers `PLAYER-failed.wav`
- [x] No-input miss does not trigger failure SFX
- [x] NPC action-point SFX comes from BGM, not separate runtime playback
- [x] Practice and exam clocks start from actual BGM playback start
- [x] Opening phase includes black screen, title card, empty shot, run-in, and fade-in guard
