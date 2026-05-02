# 第一关正式资产表

## 目的

这份表用于把当前第一关 AI 生成素材映射成可接入项目的正式资产清单。

使用顺序：

1. 先以本表为准确认资产 ID
2. 再按本表中的暂存 sheet 切图
3. 切图后按本表中的正式命名入库
4. 再接入 Phaser 动画

## 当前暂存目录

当前通过验收并已复制到工作区的素材位于：

- [src/assets/sprites/level1/staging](D:/workspace/rhythm-havoc-monkey-king/src/assets/sprites/level1/staging:1)

## 正式资产映射

| Asset ID | 角色 | 动作 | 朝向 | 帧数 | 播放 | Hit Frame | 当前来源 Sheet | 正式状态 |
| --- | --- | --- | --- | ---: | --- | ---: | --- | --- |
| `wukong_idle_right` | 悟空 | idle | right | 4 | loop | - | `level1_idle_dual_sheet.png` | 通过，可切图 |
| `guard_idle_left` | 门卫 | idle | left | 4 | loop | - | `level1_idle_dual_sheet.png` | 通过，可切图 |
| `wukong_attention_right` | 悟空 | attention | right | 4 | once | 3 | `level1_attention_dual_sheet.png` | 通过，可切图 |
| `guard_attention_left` | 门卫 | attention | left | 4 | once | 3 | `level1_attention_dual_sheet.png` | 通过，可切图 |
| `wukong_salute_right` | 悟空 | salute | right | 7 | once | 4 | `level1_salute_dual_sheet.png` | 通过，可切图 |
| `guard_salute_left` | 门卫 | salute | left | 7 | once | 4 | `level1_salute_dual_sheet.png` | 通过，可切图 |
| `wukong_run_right` | 悟空 | run | right | 6 | loop | - | `wukong_run_right_sheet.png` | 通过，可切图 |
| `wukong_fail_right` | 悟空 | fail | right | 5 | once | 2-3 | `wukong_fail_right_sheet.png` | 临时通过，后续可二修 |

## 当前源文件追踪

这些是 `.codex` 生成目录中的原始文件来源，便于后续回溯。

| 暂存 Sheet | 生成源文件 |
| --- | --- |
| `level1_idle_dual_sheet.png` | `ig_0605a7813143723e0169f5a12616f4819ba99a290bcaed78c6.png` |
| `level1_attention_dual_sheet.png` | `ig_0605a7813143723e0169f5aa5e1e38819b9ecc1ba6407b2774.png` |
| `level1_salute_dual_sheet.png` | `ig_0605a7813143723e0169f5a4d68454819b85c249b499067adb.png` |
| `wukong_run_right_sheet.png` | `ig_0605a7813143723e0169f5a619edc0819bb64a85397707bb31.png` |
| `wukong_fail_right_sheet.png` | `ig_0605a7813143723e0169f5a66c6e70819b809378e5eb14e662.png` |

## 暂存 Sheet 拆分规则

### 1. `level1_idle_dual_sheet.png`

需要拆成：

- `wukong_idle_right_0001.png` ~ `0004.png`
- `guard_idle_left_0001.png` ~ `0004.png`

说明：

- 上排是悟空
- 下排是门卫
- 背景统一，适合按行拆分再按帧切分

### 2. `level1_attention_dual_sheet.png`

需要拆成：

- `wukong_attention_right_0001.png` ~ `0004.png`
- `guard_attention_left_0001.png` ~ `0004.png`

说明：

- 使用最新 4 帧版本
- `frame 3` 为推荐命中帧

### 3. `level1_salute_dual_sheet.png`

需要拆成：

- `wukong_salute_right_0001.png` ~ `0007.png`
- `guard_salute_left_0001.png` ~ `0007.png`

说明：

- `frame 4` 为推荐命中帧

### 4. `wukong_run_right_sheet.png`

需要拆成：

- `wukong_run_right_0001.png` ~ `0006.png`

### 5. `wukong_fail_right_sheet.png`

需要拆成：

- `wukong_fail_right_0001.png` ~ `0005.png`

说明：

- 可用于原型
- 如果后面要更克制的 fail 反馈，可替换这组

## 正式入库命名

### Sheet 命名

- `wukong_idle_right_sheet.png`
- `guard_idle_left_sheet.png`
- `wukong_attention_right_sheet.png`
- `guard_attention_left_sheet.png`
- `wukong_salute_right_sheet.png`
- `guard_salute_left_sheet.png`
- `wukong_run_right_sheet.png`
- `wukong_fail_right_sheet.png`

### 帧图命名

- `wukong_idle_right_0001.png`
- `guard_idle_left_0001.png`
- `wukong_attention_right_0001.png`
- `guard_attention_left_0001.png`
- `wukong_salute_right_0001.png`
- `guard_salute_left_0001.png`
- `wukong_run_right_0001.png`
- `wukong_fail_right_0001.png`

## Phaser 动画接入目标

后续进入 Phaser 时，建议注册以下动画 key：

- `wukong_idle_right`
- `guard_idle_left`
- `wukong_attention_right`
- `guard_attention_left`
- `wukong_salute_right`
- `guard_salute_left`
- `wukong_run_right`
- `wukong_fail_right`

建议播放方式：

- `idle` / `run`: `repeat: -1`
- `attention` / `salute` / `fail`: `repeat: 0`

## 下一步

进入 Phaser 动画前，建议按这个顺序推进：

1. 将暂存 sheet 切分成帧图，或整理成标准可切 spritesheet
2. 更新 `PreloadScene`，改用真实素材而不是占位图形
3. 注册第一关角色动画 key
4. 用新动画替换当前占位动画逻辑
5. 最后再接第一关 phase-based 流程
