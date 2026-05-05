# 第一关资产生成与管理说明

## 目的

这份文档用于记录第一关 `gate_01` 当前的角色动作资产策略，方便后续继续生成、验收、替换、切图和接入 Phaser。

适用范围：

- 第一关角色动作图素生成
- AI 生成资产验收
- 资产命名与目录管理
- 后续切图与动画接入

## 当前目标

第一关是教学关，当前优先保障这些动作可用：

- 悟空 `idle`
- 悟空 `attention`
- 悟空 `salute`
- 悟空 `run`
- 悟空 `fail`
- 门卫 `idle`
- 门卫 `attention`
- 门卫 `salute`

这些动作足以支撑：

- `opening`
- `attention_free`
- `attention_rhythm`
- `salute_free`
- `salute_rhythm`
- `exam`
- `result`

## 参考图

当前 AI 生成统一参考以下角色图：

- 悟空参考图：
  - [wukong-init.png](D:/workspace/rhythm-havoc-monkey-king/src/assets/origin/图片素材/第一关图片/wukong-init.png:1)
- 门卫参考图：
  - [npc-init.png](D:/workspace/rhythm-havoc-monkey-king/src/assets/origin/图片素材/第一关图片/npc-init.png:1)

## 生成策略

### 不再使用的大总表策略

已经验证过，一次生成包含全部动作的大总表虽然能用于动作探索，但不适合作为最终生产素材。

主要问题：

- 动作语义容易跑偏
- 条带结构不稳定
- 帧间一致性不够
- 难以直接切图
- 容易混入错误视角或多余动作

### 当前采用的策略

当前统一按“单动作独立生成”处理。

建议每次只生成：

- 单个动作
- 单个角色，或同动作双角色
- 明确帧数
- 明确朝向
- 明确 loop / once
- 明确 hit 帧位置

这样更适合：

- 动作语义控制
- 帧间一致性控制
- 后续切图
- Phaser 动画接入

## 当前可保留资产结论

以下结论基于“是否可进入第一关原型”判断。

### 保留

- `wukong_idle_right`
- `guard_idle_left`
- `wukong_attention_right`
- `guard_attention_left`
- `wukong_salute_right`
- `guard_salute_left`
- `wukong_run_right`

### 临时保留

- `wukong_fail_right`

说明：

- `fail` 当前可用于原型
- 如果后续需要更克制、更偏游戏内反馈的表现，可以再重生一版

## 当前动作规格

### 悟空

- `wukong_idle_right`
  - 4 帧
  - `loop`
- `wukong_attention_right`
  - 4 帧
  - `once`
  - 建议 `hit frame = 3`
- `wukong_salute_right`
  - 7 帧
  - `once`
  - 建议 `hit frame = 4`
- `wukong_run_right`
  - 6 帧
  - `loop`
- `wukong_fail_right`
  - 5 帧
  - `once`
  - 建议 `hit frame = 2` 或 `3`

### 门卫

- `guard_idle_left`
  - 4 帧
  - `loop`
- `guard_attention_left`
  - 4 帧
  - `once`
  - 建议 `hit frame = 3`
- `guard_salute_left`
  - 7 帧
  - `once`
  - 建议 `hit frame = 4`

## AI 资产验收标准

后续每次生成完，都需要按以下标准检查。

### 1. 动作语义

必须一眼能看出动作是什么。

例如：

- `attention` 必须明显是“立正”
- `salute` 必须明显是“敬礼”
- `run` 必须明显是“跑步”
- `fail` 必须明显是“失误反馈”

### 2. 朝向稳定

必须锁定朝向：

- 悟空：朝右
- 门卫：朝左

禁止出现：

- 背身
- 正面突变
- 左右反转

### 3. 帧间一致性

必须保证：

- 角色比例稳定
- 武器长度和位置基本稳定
- 服装结构不乱跳
- 头身比不漂移

### 4. 节奏动作可读性

节奏游戏动作必须有明确命中感。

重点检查：

- `frame 1` 到 `hit frame` 是否有明显动作变化
- `hit frame` 是否足够清晰
- 玩家是否能一眼看出“这一拍打中了”

### 5. 可切图性

必须便于后处理：

- 横向 strip 清晰
- 留白足够
- 人物不重叠
- 四肢和武器不被裁切
- 背景统一

### 6. 禁止事项

以下情况默认判定为不通过：

- 动作语义跑偏
- 混入攻击姿态
- 混入敬礼以外手势
- 帧中出现漫画编号、说明文字
- 帧中出现大面积装饰特效
- 背景复杂
- 明显透视漂移

## 当前命名规范

### sheet 命名

建议统一为：

- `wukong_idle_right_sheet.png`
- `wukong_attention_right_sheet.png`
- `wukong_salute_right_sheet.png`
- `wukong_run_right_sheet.png`
- `wukong_fail_right_sheet.png`
- `guard_idle_left_sheet.png`
- `guard_attention_left_sheet.png`
- `guard_salute_left_sheet.png`

### 拆帧命名

拆帧后统一为：

- `wukong_idle_right_0001.png`
- `wukong_idle_right_0002.png`
- `wukong_attention_right_0001.png`
- `guard_salute_left_0007.png`

### 动画 key 命名

Phaser 动画 key 建议统一为：

- `wukong_idle_right`
- `wukong_attention_right`
- `wukong_salute_right`
- `wukong_run_right`
- `wukong_fail_right`
- `guard_idle_left`
- `guard_attention_left`
- `guard_salute_left`

## 建议目录结构

建议后续将可用资产整理到：

```text
src/assets/sprites/level1/
├── wukong/
│   ├── wukong_idle_right_sheet.png
│   ├── wukong_attention_right_sheet.png
│   ├── wukong_salute_right_sheet.png
│   ├── wukong_run_right_sheet.png
│   └── wukong_fail_right_sheet.png
└── guard/
    ├── guard_idle_left_sheet.png
    ├── guard_attention_left_sheet.png
    └── guard_salute_left_sheet.png
```

如果后续拆成序列帧，可改为：

```text
src/assets/sprites/level1/
├── wukong/
│   ├── idle/
│   ├── attention/
│   ├── salute/
│   ├── run/
│   └── fail/
└── guard/
    ├── idle/
    ├── attention/
    └── salute/
```

## 后续建议

### 可以直接进入接入流程的资产

- `idle`
- `attention`
- `salute`
- `run`

### 后续建议二修的资产

- `wukong_fail_right`

建议二修方向：

- 减少漫画化辅助符号
- 减少过强表情特效
- 更像“节奏 miss 反馈”而不是夸张摔倒

### 第一关后续还可补的资产

如果要继续提升表现，可以补：

- 门卫 `appear`
- 悟空 `recover`
- 门卫 `recover`
- 对话头像
- 结算插图
- `perfect` / `miss` 特效帧

## 更新规则

后续如果重生或替换资产，请同步更新这份文档中的：

- 保留 / 淘汰结论
- 帧数
- loop / once
- hit frame
- 命名方案
- 是否进入项目正式目录

建议每次更新至少记录：

- 更新日期
- 替换了哪组动作
- 为什么替换
- 新资产是否通过验收
