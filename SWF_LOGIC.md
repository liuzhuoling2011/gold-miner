# SWF logic — 4399/1602 黄金矿工

Source: `swf/game.swf` (CWS v6). Analysis: FFDec AS2 export + tag walk.
REA not used for SWF.

## Stage
| Prop | Value |
|------|-------|
| Stage | 550×400 |
| FPS | 18 |
| Labels | main, start, next, end, yes, no, L1_1…L10_3 |

## New game (DefineButton2_29)
```
minerStrength=10; total=10; time=60; goalAddOn=0; goal=375;
level=0; stick=0; score=0; levelDis=0;
```
Then frame_15:
```
goal=375; goalAddOn+=275; goal+=goalAddon; // typo: goalAddon unset→0 in FP
levelDis=1; level=1;
```
**Remake intent (fix goalAddOn):** L1 goal=650; each next level `goalAddOn+=270` (while levelDis≤9) then `goal+=goalAddOn`.

## Pull speed (sprite 288 frame_44 enterFrame)
```
if (stickBonus==1 || strength==1) frame += 15; // fast
else frame += (minerStrength - weight);
```
Base minerStrength=10; 生力水 shop: +2; bag "power": strength=1 for remainder of level.

## Hit test
Claw tip (DefineSprite_256 = shape40, ±6.2) hitTests `_root.T{n}.ob.box` while busy==0.
Item box = shape40 × internal scale (e.g. gold 2.476, bag 3.25, tnt 4.1×5.1) × PlaceObject sx/sy.
Remake: AABB tip vs (item + box offset).

## Miner effort
`miner.gotoAndStop("up")` → nested sprite 238 (37f winch loop). Heavy when weight>1 (slow pull); remake plays pant.mp3.

## Objects (object id → price, weight)
| id | price | weight | art |
|----|-------|--------|-----|
| 2 | 50 | 3 | small gold |
| 3 | 100 | 7 | med gold |
| 4 | 250 | 8 | large gold |
| 5 | 500 | 9 | XL gold |
| 6 | 2 | 3 | pig |
| 7 | 7 | 3 | bone |
| 8 | 20 / 60 rockBonus | 9 | big rock |
| 9 | 1 | 2 | TNT barrel |
| 10 | 602 / 902 diamondBonus | 5 | diamond m |
| 11 | 600 / 900 diamondBonus | 2 | diamond s |
| 12 | random / power / dynamite | random | mystery bag |
| 13 | 20 | 2 | skull |
| 14 | 11 / 33 rockBonus | 8 | med rock |

## Shop (between levels)
- 炸药 stick+1; price random(300)+1+level*2; hide if stick≥5
- 生力水 minerStrength+2; price random(level*50)+1+level*2; ~50% stock
- 幸运草 cloverBonus=1; price random(level*100)+1+200; ~40% stock
- 石头收藏书 rockBonus=1; price random(300)+100
- 优质钻石 diamondBonus=1; price random(150)+1
Bonuses clear on shop exit (frame_130) except stick & minerStrength persistence patterns — frame_130 resets strength/minerStrength/diamond/rock/clover; remake keeps stick, resets per-level bonuses, keeps minerStrength bought this run until reset rule mirrored as: frame_130 sets minerStrength=10 — so 生力水 is **one level only** via strength flag from bag, and shop +2 is wiped at end panel. Remake: shop 生力水 applies to next level only (+2 for one level).

## Timer
Sprite 188: time -= 1 per tick (~1s); at 0 → end if not busy.

## Level thing counts
L1:15 L2:20 L3:17 L4:18 L5:22 L6:22 L7:20 L8:18/27 L9:26 L10:16/26 (layout variants _1/_2/_3)

## Claw physics (sprite 289 + 288) — remake v2
- Pivot `_root.C` at **(275.5, 48.6)**; miner at (285.85, 34.75) scale 0.389
- Swing: sprite 289 timeline **87 frames**, angle table ≈ **−67°…+68°** (see `swing_angles.json`)
- Drop: claw Y += **≈9.86 px/frame** @18fps (~177 px/s); max len ~407
- Pull: timeline ~1.385 px/frame; each enterFrame advances `(minerStrength−weight)` frames, or **+15** if stickBonus/strength
- Dynamite (↑): destroys **caught item only** (price=0, stickBonus=1); boom sound 254 — not AOE
- ←/→ during drop force pull-up

## Level layouts
All `L1_1`…`L10_3` PlaceObject coords extracted to `levels.json` / remake `levels.js`.

## SFX (DefineSound chid → event)
| id | event |
|----|-------|
| 47 | level start / next |
| 54 | win / yes |
| 86 | money |
| 123 | click/UI |
| 137 | grab |
| 219 | tick |
| 236 | throw dynamite |
| 254 | boom |
| 257 | drop whoosh |
| 261 | hit |
| 294 | score popup |
