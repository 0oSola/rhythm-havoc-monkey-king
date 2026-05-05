# Menu Start Scene Spec

## Scope

- 只覆盖开始场景本身
- 边界是完整 `960x540` 画面

## Hard Constraints

- 必须使用 `src/assets/origin/开始游戏图片/bg-0.png` 作为完整合成图
- 默认态下不得自行重绘标题、云、山、角色或按钮外壳
- 背景图必须 1:1 填满 `960x540`
- “开始游戏”只允许在中间牌匾区域触发
- 按钮外区域点击不得进入 `LevelScene`

## Reference Geometry

- canvas: `960x540`
- start button hotspot:
  - `x: 278`
  - `y: 225`
  - `width: 404`
  - `height: 115`

## Forbidden Shortcuts

- 不允许再用纯文本和矩形近似首页
- 不允许为了“像一点”临时叠加额外装饰层
- 不允许扩大点击区域到整屏

## Acceptance

- 默认显示时和参考图无可命名差异
- 点击“开始游戏”区域进入 `LevelScene`
- 点击按钮外区域无跳转
- `Space` / `Enter` 仍可开始游戏
