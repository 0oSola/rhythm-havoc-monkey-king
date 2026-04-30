# Rhythm Havoc: Monkey King Agent Guide

## 1. 项目定位

本项目是一款 Web 端 2D 节奏动作游戏，玩法参考《节奏天国》的“示范 -> 模仿”结构，题材基于孙悟空大闹天宫。

MVP 阶段目标是完成 4 个可玩关卡：

1. 南天门 · 混进天庭
2. 弼马温上班记
3. 蟠桃园偷桃
4. 偷吃金丹

核心验证目标：

- 节奏输入是否稳定
- 玩家输入与动画反馈是否同步
- 西游喜剧剧情与节奏玩法是否成立
- 2 人前端协作是否可以高效推进完整 MVP

## 2. 技术栈

优先使用以下技术：

- TypeScript
- Phaser 3
- Vite
- Web Audio API
- Phaser Animation + Spine 导出序列帧 / Spritesheet / Texture Atlas
- pnpm
- ESLint
- Prettier

动画制作可以使用 Spine，但运行时只使用 Spine 导出的序列帧、spritesheet 或 Phaser texture atlas，由 Phaser Animation 统一播放。MVP 阶段禁止接入 Spine Runtime、Live2D Runtime 或其他骨骼动画运行时，也不要在游戏运行时加载 Spine skeleton `.json` / `.skel` 及 Spine 骨骼 `.atlas` 数据。

禁止优先引入大型状态管理库，除非明确必要。

## 3. 推荐项目结构

```text
src/
├── main.ts
├── game/
│   ├── GameApp.ts
│   ├── scenes/
│   │   ├── BootScene.ts
│   │   ├── PreloadScene.ts
│   │   ├── MenuScene.ts
│   │   ├── LevelScene.ts
│   │   └── ResultScene.ts
│   ├── rhythm/
│   │   ├── RhythmEngine.ts
│   │   ├── BeatTimeline.ts
│   │   ├── JudgeSystem.ts
│   │   └── RhythmTypes.ts
│   ├── input/
│   │   ├── InputSystem.ts
│   │   └── InputTypes.ts
│   ├── animation/
│   │   ├── AnimationController.ts
│   │   └── AnimationTypes.ts
│   ├── level/
│   │   ├── LevelLoader.ts
│   │   ├── LevelTypes.ts
│   │   └── levels/
│   │       ├── gate_01.json
│   │       ├── horse_02.json
│   │       ├── peach_03.json
│   │       └── pill_04.json
│   ├── feedback/
│   │   ├── FeedbackSystem.ts
│   │   └── ScoreSystem.ts
│   └── ui/
│       ├── BeatHUD.ts
│       ├── InputHint.ts
│       └── ResultPanel.ts
├── assets/
│   ├── audio/
│   ├── sprites/
│   ├── atlases/
│   ├── data/
│   └── source/
│       └── spine/
└── shared/
    ├── constants.ts
    └── utils.ts
```

## 4. 开发命令

项目脚本建立后，优先使用：

```bash
pnpm install
pnpm dev
pnpm build
pnpm test
pnpm lint
pnpm format
```

提交前至少运行 `pnpm test` 和 `pnpm lint`。涉及可玩流程时，还必须手动跑通第一关。

## 5. 核心开发原则

### 5.1 音频是唯一时间基准

节奏游戏必须以 `AudioContext.currentTime` 或 Phaser Sound 的实际播放时间作为主时间源。

禁止使用 `setTimeout()`、`setInterval()` 或 `Date.now()` 作为节奏判定的核心时间依据。

### 5.2 所有关卡必须数据驱动

禁止把谱面、拍点、关卡流程硬编码在 Scene 中。关卡数据应通过 JSON 描述：

```json
{
  "levelId": "gate_01",
  "name": "南天门 · 混进天庭",
  "bpm": 120,
  "timeSignature": [4, 4],
  "units": [
    {
      "demo": ["C", "C", "A", "C"],
      "player": [null, null, "A", null]
    }
  ]
}
```

### 5.3 输入判定必须可测试

`JudgeSystem` 需要独立于 Phaser Scene。判定规则：

- `PERFECT`: ±80ms
- `GREAT`: ±150ms
- `GOOD`: ±220ms
- `MISS`: >220ms

### 5.4 动画只响应游戏事件

动画系统不直接处理输入，也不直接决定得分。正确流程：

```text
InputSystem
-> JudgeSystem
-> Game Event
-> AnimationController
-> FeedbackSystem
```

`AnimationController` 负责把游戏事件映射为序列帧动画 key。关键动作必须包含 `start`、`hit`、`recover` 三段，`hit` 帧需要对齐目标拍点或判定反馈点。

## 6. 两人协作分工

### Developer A：核心玩法与节奏系统

负责 `RhythmEngine`、`BeatTimeline`、`JudgeSystem`、`InputSystem`、`LevelLoader` 和 `LevelScene` 主流程。

重点目标：

- 音频时间轴准确
- 输入判定稳定
- 谱面数据可加载
- 第一关完整跑通

### Developer B：表现层与关卡内容

负责 `AnimationController`、`FeedbackSystem`、`ScoreSystem`、UI HUD、`ResultScene`、4 关 JSON 数据和临时美术资源接入。

重点目标：

- 序列帧动作反馈清晰
- `Perfect` / `Miss` 有明显区别
- 结算体验完整
- 关卡演出具备喜剧感

## 7. MVP 开发优先级

### Phase 1：第一关闭环

目标：完成“南天门”可玩闭环。

必须完成：

- BPM 120
- A / AB 输入
- 示例 -> 模仿
- `Perfect` / `Great` / `Good` / `Miss` 判定
- 简单序列帧角色动画
- 结算页

不做复杂 UI、多角色系统、商店、存档或关卡编辑器。

### Phase 2：抽象关卡系统

目标：让第二、三、四关可以通过 JSON 快速接入。

必须完成 `LevelLoader`、不同玩法类型配置、Tap / Hold / Mash 支持和统一评分系统。

### Phase 3：完成 4 关 MVP

4 关分别验证：

| 关卡 | 验证点 |
| --- | --- |
| 南天门 | 教学与模仿 |
| 弼马温 | 循环节奏 |
| 蟠桃园 | Tap / Hold / Mash 混合 |
| 金丹房 | 高频输入与爽感 |

## 8. 编码规范

TypeScript 规则：

- 所有核心模块必须显式声明类型
- 禁止使用 `any`
- 可用 `unknown`，但必须做类型收窄
- 公共类型放入 `*Types.ts`

命名规范：

- 类名：`PascalCase`
- 函数名：`camelCase`
- 常量：`UPPER_SNAKE_CASE`
- 关卡 ID：`snake_case`
- 事件名：`kebab-case`

```ts
class RhythmEngine {}
function calculateBeatTime() {}
const PERFECT_WINDOW_MS = 80;
```

只在节奏判定逻辑、音频延迟补偿、Phaser 生命周期特殊处理或非直观算法处写注释。

## 9. 游戏事件规范

统一使用事件驱动：

```ts
type GameEvent =
  | "beat-hit"
  | "note-hit"
  | "note-miss"
  | "input-perfect"
  | "input-great"
  | "input-good"
  | "input-miss"
  | "combo-changed"
  | "level-complete";
```

## 10. 判定系统要求

`JudgeSystem` 输入：

```ts
{
  inputTimeMs: number;
  targetTimeMs: number;
  inputType: InputType;
  expectedType: InputType;
}
```

输出：

```ts
{
  result: "PERFECT" | "GREAT" | "GOOD" | "MISS";
  deltaMs: number;
  score: number;
}
```

## 11. 输入规则

MVP 支持：

- `A`：单点
- `B`：辅助键
- `AB`：组合键
- `Hold`：长按
- `Mash`：短时间连续点击

`AB` 判定要求：A 与 B 输入间隔 <= 50ms，视为一次 AB 输入。

`Hold` 判定要求：按下时间点需要接近目标拍点，持续时长达到配置要求。

`Mash` 判定要求：在指定窗口内达到点击次数要求。

## 12. 关卡 JSON 设计

每关必须包含：

```json
{
  "levelId": "gate_01",
  "name": "南天门 · 混进天庭",
  "bpm": 120,
  "audioKey": "gate_01_bgm",
  "type": "call_response",
  "introText": ["新来的？先学礼仪！", "俺也去？"],
  "actions": {
    "A": "stand",
    "AB": "salute"
  },
  "units": []
}
```

## 13. UI 设计原则

MVP UI 保持极简：

- 顶部：关卡名 / Combo
- 中间：角色演出
- 底部：输入提示
- 结算：评级 + 评语

不做复杂菜单、角色养成或长期系统。

## 14. 资源约定

序列帧资源命名：

```text
角色_动作_方向_帧号
```

示例：

```text
wukong_idle_right_0001
wukong_stand_right_0001
wukong_salute_right_0001
guard_idle_left_0001
guard_stand_left_0001
```

动画 key 使用不带帧号的稳定名称，例如 `wukong_salute_right`。

如果动画由 Spine 制作，`assets/source/spine/` 只保存源工程文件；运行时资源必须导出到 `assets/sprites/` 或 `assets/atlases/`，并由 Phaser Animation 播放。不要提交需要 Spine Runtime 才能播放的运行时数据。

音频命名：

```text
levelId_bgm
levelId_sfx_action
```

示例：

```text
gate_01_bgm
gate_01_sfx_salute
```

## 15. 性能要求

MVP 目标：

- 桌面 Chrome 稳定 60 FPS
- 输入延迟可控
- 首屏加载 < 5 秒
- 单关切换无明显卡顿

优先保证输入和音频同步，不优先追求画面复杂度。

## 16. 禁止事项

禁止：

- 在 Scene 内写死整关谱面
- 用 `setTimeout` 做节奏判定
- 让动画系统直接决定得分
- 一次性开发 4 关而不先跑通第一关
- 引入过度复杂的架构
- 在 MVP 阶段做账号、存档、商城、联网

## 17. 推荐开发顺序

1. 初始化 Phaser + Vite + TypeScript
2. BootScene / PreloadScene / LevelScene
3. RhythmEngine
4. InputSystem
5. JudgeSystem
6. 第一关 `gate_01.json`
7. 简单序列帧动画反馈
8. ScoreSystem
9. ResultScene
10. 扩展第二、三、四关

## 18. 每次提交要求

每次提交必须满足：

- 可运行
- 不破坏主流程
- 不提交无用资源
- 不提交 console 噪音
- 任何代码或行为变更都必须有对应自动化测试
- 必须先看到测试失败，再写实现，再看到测试通过
- 提交信息必须写清楚变更原因，不能只描述“做了什么”

提交信息必须包含：

- `type`: 变更类型，如 `feat`、`fix`、`refactor`、`test`、`docs`、`chore`
- `summary`: 一句话说明做了什么
- `reason`: 说明为什么需要这次变更

推荐格式：

```text
feat: add gate cue metadata

reason: first level needs explicit prompts and animation cues so LevelScene can stay data-driven
```

强制限制建议：

- 本地使用 `commit-msg` hook 拒绝缺少 `reason:` 的提交
- CI 中重复校验最近提交信息，防止绕过本地 hook
- 禁止使用 `--no-verify` 绕过提交检查，除非维护者明确批准并在提交正文说明原因

推荐提交格式：

```text
feat: add rhythm judge system
fix: correct AB input timing window
refactor: split level loader from scene
chore: add gate level placeholder assets
```

## 19. AI Agent 工作方式

当 AI Agent 执行任何任务时，必须遵守：

- 先阅读本 `AGENTS.md`
- 必须先检查并使用适用的 Superpowers skill
- 代码、玩法、配置、数据结构或行为变更必须严格执行 `superpowers:test-driven-development`
- TDD 流程不可省略：先写失败测试 -> 运行并确认失败原因正确 -> 写最小实现 -> 运行并确认通过 -> 必要时重构
- 若变更属于 bug 修复，必须先写能复现问题的失败测试
- 若变更无法自动化测试，必须先说明原因，并提供最小可验证 demo 或手动验收步骤
- 不擅自扩大技术栈
- 不改变核心目录结构，除非说明原因
- 修改核心模块时同步更新类型定义
- 新增关卡逻辑优先通过 JSON 配置实现
- 不写死玩法流程
- 动画优先通过 Spine 导出序列帧和 Phaser Animation 实现
- 保持代码简单、可读、可调试

## 20. 当前 MVP 成功标准

当以下条件全部满足，视为 MVP 第一阶段完成：

- 第一关可完整游玩
- 玩家输入有准确判定
- 角色序列帧动作能响应判定
- 有 Combo 和 Score
- 有结算评级
- 谱面来自 JSON
- 第二关可以在不改核心代码的情况下接入

## 21. 项目核心原则

本项目不是普通音乐游戏，而是：

> 用节奏控制行为，用行为推动喜剧，用喜剧包装西游。

所有代码、关卡和动画设计，都应服务这个原则。
