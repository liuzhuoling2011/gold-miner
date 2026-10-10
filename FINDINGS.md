# 4399 flash/1602 黄金矿工中文版 — findings

## Identity
- 4399 id **1602**, title 《黄金矿工中文版》
- Live shell: `_strGamePath=/upload_swf/ftp5/haibo/20110624/2/jifen2.htm`
- Real game SWF sibling: `https://s1.4399.com/4399swf/upload_swf/ftp5/haibo/20110624/2/game.swf`
- Verified: **CWS Flash 6**, compressed **117,348** B, decompressed **182,792** B
- Stage **550×400**, **18 fps**, 302 timeline frames
- Chinese shop / HUD strings embedded (炸药、生力水、幸运草、石头收藏书、优质钻石)

## Controls (title screen + AS)
- **↓** 放钩子 (drop claw)
- **↑** 丢炸药 (throw dynamite if stick≥1)
- ←/→ also force pull-up in AS
- Remake: mouse/touch tap = drop; mobile dynamite button; ↑/D for dynamite

## Files
- `swf/game.swf` — real game
- `swf/mainload.swf`, `swf/as3.swf` — 4399 loader shells
- `ffdec-export/` — FFDec script/shape/sprite/sound export
- `refs/ruffle_*.png` — Ruffle title screenshots

## Polish 2026-10-10 (claw / hit / pant)
- Claw art: DefineSprite_281 open + object grab frames (native ~28×18 open)
- HitTest: tip AABB ±6.2 vs item.ob.box (shape40 × FFDec scales × place sx/sy)
- Miner pull: sprite 238 frame loop; pant.mp3 when weight>1 and slow pull
