# Rhythm Havoc: Monkey King

Web 端 2D 节奏动作游戏原型，玩法参考《节奏天国》的“示范 -> 模仿”结构，题材基于孙悟空大闹天宫。

## 开发

```bash
npm install
npm run dev
```

常用命令：

```bash
npm run build
npm test
```

## 调试指令

在第一关场景中直接键入以下字母序列即可触发调试功能：

- `dev`：打开气泡调试面板
- `dvo`：跳回开场阶段
- `dvf`：跳到第一次自由练习
- `dvw`：跳到第一次练习预备阶段
- `dvl`：直接跳到第一次练习循环
- `dve`：跳到正式考核阶段
- `dvr`：直接触发结算转场
- `dga`：持续播放门卫 `attention`
- `dgs`：持续播放门卫 `salute`
- `dgp`：持续播放门卫 `praise`
- `dwa`：持续播放悟空 `attention`
- `dws`：持续播放悟空 `salute`
- `dax`：停止动作预览

`dvr` 会播放结算前点击音效，先黑幕渐隐，再进入结算页；结算页内容本身也会再做一次淡入。
`dgp` 适合用来盯门卫赞动作的位置和回待机时机；当前 `praise` 会先完整停留约 1 秒，再切回 `idle`。
