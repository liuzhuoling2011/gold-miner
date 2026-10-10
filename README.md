# 黄金矿工（HTML5）

4399 Flash《黄金矿工中文版》（flash id **1602**）的现代 HTML5 Canvas 复刻。

- 原版 SWF：`game.swf`（CWS Flash 6，550×400 @ 18fps）
- 逻辑常量来自 FFDec 导出的 AVM1/AS2（关卡目标、力气、重量、商店）
- 素材从原版 SWF 导出并转 WebP；音效为原版 DefineSound

## 操作

| 桌面 | 手机 |
|------|------|
| ↓ / 空格 / 点击：放钩 | 点屏幕：放钩 |
| ↑ / D：丢炸药 | 右下角「炸药」按钮 |

## 本地打开

直接打开 `index.html`，或：

```bash
python3 -m http.server 8080
```

## 在线

GitHub Pages：见仓库 Settings → Pages，或 `https://liuzhuoling2011.github.io/gold-miner/`

## 说明

非商业、学习向复刻；原游戏版权归原作者/4399。通关数值按 SWF 中 `goalAddOn` 意图实现（原脚本存在 `goalAddon` 拼写不一致）。
