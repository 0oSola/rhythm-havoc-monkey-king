# 南天门 · 混进天庭 关卡拆解

## 1. 关卡目标

`gate_01` 是 MVP 第一关，也是完整玩法闭环的教学关。它只验证两件事：玩家能否理解“示范 -> 模仿”的节奏结构，以及能否把 `A` / `AB` 输入理解为“立正 / 敬礼”两个天庭礼仪动作。

成功体验应是：玩家不需要长教程，只看守卫示范和底部输入提示，就能在第二小节复现动作，并通过动作反馈理解 Perfect 与 Miss 的差异。

## 2. 叙事场景

- 场景：南天门入口，守卫检查新来的“临时天庭打工猴”。
- 冲突：天庭礼仪高度流程化，悟空必须装作规矩人混进去。
- 喜剧点：悟空把严肃礼仪做得过于用力，Perfect 时一本正经，Miss 时露出猴性或动作变形。
- 关卡结尾：守卫暂时放行，为后续“弼马温上班记”建立职场压迫感。

## 3. 核心玩法规则

基础参数：

- BPM：120
- 拍号：4/4
- 单位结构：2 小节 = 1 UNIT
- 第 1 小节：系统示范
- 第 2 小节：玩家模仿
- 判定窗口：Perfect ±80ms，Great ±150ms，Good ±220ms

输入映射：

| 输入 | 行为 | 说明 |
| --- | --- | --- |
| `A` | 立正 | 单点输入，教学第一动作 |
| `AB` | 敬礼 | A 与 B 在 50ms 内组合，教学第二动作 |

## 4. 推荐谱面拆解

当前实现已有 2 个 UNIT，可作为第一版最小闭环：

| UNIT | 小节 | Beat 1 | Beat 2 | Beat 3 | Beat 4 | 设计目的 |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 示范 | A | - | AB | - | 建立“看守卫动作”的规则 |
| 1 | 玩家 | - | A | - | AB | 让玩家错开半拍模仿，降低同时观察压力 |
| 2 | 示范 | A | A | - | AB | 加入连续单点，检查稳定节奏 |
| 2 | 玩家 | A | - | A | AB | 要求玩家主动维持拍点 |

后续扩展建议增加第 3 个 UNIT，但不要加入 Hold / Mash。第一关必须保持只教 `A` 与 `AB`。

建议第 3 个 UNIT：

| UNIT | 小节 | Beat 1 | Beat 2 | Beat 3 | Beat 4 | 设计目的 |
| --- | --- | --- | --- | --- | --- | --- |
| 3 | 示范 | A | AB | A | - | 形成轻微变化 |
| 3 | 玩家 | A | AB | - | A | 检查组合键是否真正学会 |

## 5. 动画与表现需求

悟空动作需要优先制作以下 Spine 导出序列帧：

- `wukong_idle_right`：待机，轻微呼吸或晃动
- `wukong_stand_right`：立正，Hit 帧对齐拍点
- `wukong_salute_right`：敬礼，Hit 帧对齐拍点
- `wukong_fail_right`：Miss，身体歪斜或露馅

守卫动作：

- `guard_idle_left`：待机
- `guard_stand_left`：示范立正
- `guard_salute_left`：示范敬礼

所有运行时动画由 Phaser Animation 播放，不接 Spine Runtime。

## 6. UI 与反馈

UI 保持极简：

- 顶部：关卡名、Combo、Score
- 中间：悟空和守卫动作演出
- 底部：当前输入提示，如 `A 立正`、`A+S 敬礼`

反馈规则：

- Perfect：动作完整、轻微高亮、音效更清脆
- Great / Good：动作完成但高亮弱化
- Miss：动作中断、角色短暂停顿、Combo 清零

不要使用大段文字解释玩法。第一关应通过“守卫做一次 -> 玩家做一次”的结构教学。

## 7. 数据结构建议

当前 `src/game/level/levels/gate_01.json` 可以继续沿用：

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

后续实现需要给关卡数据补充更明确的表现字段，例如：

- `actor`: 当前动作属于守卫还是悟空
- `prompt`: 底部提示文案
- `hitFrame`: 动作关键帧索引或归一化时间
- `sfxKey`: 动作音效 key

这些字段应先通过测试扩展 `LevelLoader`，再修改 JSON。

## 8. 验收标准

第一关完成标准：

- 玩家可从标题进入南天门并完整游玩到结算
- 谱面来自 `gate_01.json`，Scene 内不硬编码整关节奏
- `A` 和 `AB` 都能稳定判定
- Perfect / Miss 有明显不同的动画和 UI 反馈
- 至少 2 个 UNIT 可玩，推荐 3 个 UNIT
- 结算页显示评级、Score、Accuracy
- 新增数据字段或判定行为必须按 TDD 流程先写失败测试

## 9. 实现顺序建议

1. 为第 3 个 UNIT 写 `LevelLoader` 或谱面生成测试。
2. 扩展 `gate_01.json`，补齐第 3 个 UNIT。
3. 为 `AnimationController` 增加 action -> animation key 映射测试。
4. 接入 `wukong_fail_right` 与守卫示范动画。
5. 为 LevelScene 的“示范阶段 / 玩家阶段”状态拆分写最小测试或可验证 demo。
6. 手动跑通第一关，确认 `A`、`AB`、Miss、结算都能触发。
