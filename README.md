# 黄金矿工（HTML5 remake）

4399 Flash [1602](https://www.4399.com/flash/1602_2.htm) 《黄金矿工中文版》的现代 Canvas 复刻。

**游玩：** https://liuzhuoling2011.github.io/gold-miner/

## 相对原版 SWF 的对齐（v2）
- 舞台 550×400，逻辑步进 **18fps**
- 钩爪摆动：原版 sprite 289 的 **87 帧角度表**（约 ±67°）
- 下放 / 上拉速度按 SWF 时间轴（约 9.86 / 1.385 px·frame）
- **全部 L1_1…L10_3** 物件坐标来自 PlaceObject，不再随机散落
- 炸药只炸掉当前抓取物（与原版一致）
- 音效按 DefineSound 事件映射（level/win/money/drop/hit/boom…）
- 矿工 idle / down / up / pull / throw 多帧；金属钩爪与泥土背景

操作：↓ / 点屏幕放钩；↑ / 右下角按钮丢炸药。
