'use strict';
/**
 * 黄金矿工 HTML5 remake — 4399 flash/1602
 * Logic constants from SWF AVM1 (see /workspace/4399-1602/SWF_LOGIC.md)
 */
const W = 550, H = 400;
const ASSET_VER = '1';
const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');

// ----- DPR -----
function fit() {
  const dpr = Math.min(window.devicePixelRatio || 1, 3);
  canvas.width = Math.round(W * dpr);
  canvas.height = Math.round(H * dpr);
  canvas.style.width = Math.min(window.innerWidth, window.innerHeight * W / H) + 'px';
  canvas.style.height = Math.min(window.innerHeight, window.innerWidth * H / W) + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
}
fit();
addEventListener('resize', fit);

// ----- Assets -----
const images = {};
const TITLE_PACK = [
  ['titleBg', 'assets/ui/title_bg.webp'],
  ['startBtn', 'assets/ui/start_btn.webp'],
  ['controls', 'assets/ui/controls.webp'],
  ['titleMiner', 'assets/ui/title_miner.webp'],
];
const PLAY_PACK = [
  ['minerIdle', 'assets/miner/miner_idle.webp'],
  ['minerPull', 'assets/miner/miner_pull.webp'],
  ['shopkeeper', 'assets/ui/shopkeeper.webp'],
  ['gold_s', 'assets/items/gold_s.webp'],
  ['gold_m', 'assets/items/gold_m.webp'],
  ['gold_l', 'assets/items/gold_l.webp'],
  ['gold_xl', 'assets/items/gold_xl.webp'],
  ['rock_m', 'assets/items/rock_m.webp'],
  ['rock_l', 'assets/items/rock_l.webp'],
  ['diamond_s', 'assets/items/diamond_s.webp'],
  ['diamond_m', 'assets/items/diamond_m.webp'],
  ['bag', 'assets/items/bag.webp'],
  ['bone', 'assets/items/bone.webp'],
  ['pig', 'assets/items/pig.webp'],
  ['skull', 'assets/items/skull.webp'],
  ['tnt', 'assets/items/tnt.webp'],
];
const SFX_NAMES = ['sfx1','sfx2','sfx3','sfx4','sfx5','sfx6','sfx7','sfx8','sfx9','sfx10','sfx11'];

function loadImage(key, url) {
  return new Promise((res, rej) => {
    const im = new Image();
    im.onload = () => { images[key] = im; res(im); };
    im.onerror = () => rej(new Error(url));
    im.src = url + (url.includes('?') ? '&' : '?') + 'v=' + ASSET_VER;
  });
}

// Web Audio
let audioCtx = null;
const audioBuffers = {};
function ensureAudio() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === 'suspended') audioCtx.resume();
}
async function loadSfx(name) {
  try {
    ensureAudio();
    const r = await fetch('assets/sfx/' + name + '.mp3?v=' + ASSET_VER);
    const ab = await r.arrayBuffer();
    audioBuffers[name] = await audioCtx.decodeAudioData(ab);
  } catch (e) { /* optional */ }
}
function playSfx(name, rate = 1) {
  try {
    ensureAudio();
    const buf = audioBuffers[name];
    if (!buf) return;
    const src = audioCtx.createBufferSource();
    src.buffer = buf;
    src.playbackRate.value = rate;
    const g = audioCtx.createGain();
    g.gain.value = 0.55;
    src.connect(g); g.connect(audioCtx.destination);
    src.start(0);
  } catch (e) {}
}

function setLoad(p) {
  const bar = document.getElementById('bar');
  const pct = document.getElementById('pct');
  if (bar) bar.style.width = (p * 100).toFixed(0) + '%';
  if (pct) pct.textContent = (p * 100).toFixed(0) + '%';
}

// ----- Game constants from SWF -----
const PIVOT = { x: 275, y: 72 }; // claw origin under miner
const SWING_MAX = 1.15; // radians from vertical
const SWING_SPEED = 1.35; // rad/s
const DROP_SPEED = 220; // px/s
const BASE_STRENGTH = 10;
const LEVEL_THINGS = [15, 20, 17, 18, 22, 22, 20, 18, 26, 26];

const ITEM_DEFS = {
  gold_s:  { object: 2,  price: 50,  weight: 3, r: 16, key: 'gold_s' },
  gold_m:  { object: 3,  price: 100, weight: 7, r: 14, key: 'gold_m' },
  gold_l:  { object: 4,  price: 250, weight: 8, r: 22, key: 'gold_l' },
  gold_xl: { object: 5,  price: 500, weight: 9, r: 28, key: 'gold_xl' },
  rock_m:  { object: 14, price: 11, weight: 8, r: 22, key: 'rock_m', rock: true },
  rock_l:  { object: 8,  price: 20, weight: 9, r: 26, key: 'rock_l', rock: true },
  diamond_s:{object: 11, price: 600, weight: 2, r: 12, key: 'diamond_s', diamond: true },
  diamond_m:{object: 10, price: 602, weight: 5, r: 16, key: 'diamond_m', diamond: true },
  bag:     { object: 12, price: 0,   weight: 4, r: 20, key: 'bag', bag: true },
  bone:    { object: 7,  price: 7,   weight: 3, r: 12, key: 'bone' },
  pig:     { object: 6,  price: 2,   weight: 3, r: 12, key: 'pig' },
  skull:   { object: 13, price: 20,  weight: 2, r: 12, key: 'skull' },
  tnt:     { object: 9,  price: 1,   weight: 2, r: 16, key: 'tnt', tnt: true },
};

const LEVEL_POOLS = [
  ['gold_s','gold_s','gold_m','gold_l','rock_m','rock_l','bone','skull','bag','gold_s','rock_m','gold_m','pig','diamond_s','tnt'],
  ['gold_s','gold_m','gold_l','gold_xl','rock_m','rock_l','rock_l','bag','bone','skull','diamond_s','gold_m','gold_s','rock_m','pig','tnt','gold_l','skull','bone','bag'],
  ['gold_m','gold_l','gold_xl','rock_l','rock_m','diamond_s','diamond_m','bag','gold_s','rock_m','bone','skull','gold_l','tnt','pig','gold_m','rock_l'],
  ['gold_l','gold_xl','gold_m','rock_l','rock_m','diamond_m','bag','bone','gold_s','skull','rock_l','gold_l','tnt','diamond_s','pig','gold_m','rock_m','bag'],
  ['gold_xl','gold_l','gold_m','rock_l','rock_l','diamond_m','diamond_s','bag','bag','gold_s','skull','bone','tnt','pig','rock_m','gold_l','gold_m','rock_m','diamond_s','gold_xl','skull','bone'],
];

function poolForLevel(lv) {
  const base = LEVEL_POOLS[Math.min(lv - 1, LEVEL_POOLS.length - 1)];
  const n = LEVEL_THINGS[Math.min(lv - 1, LEVEL_THINGS.length - 1)] || 20;
  const out = [];
  for (let i = 0; i < n; i++) out.push(base[i % base.length]);
  return out;
}

// ----- State -----
let mode = 'title'; // title | play | shop | result | win
let score = 0, goal = 650, level = 1, levelDis = 1;
let timeLeft = 60, stick = 0, minerStrength = BASE_STRENGTH;
let strengthBoost = 0; // one-level +2 from 生力水
let strengthFlag = 0; // bag power
let rockBonus = 0, diamondBonus = 0, cloverBonus = 0;
let goalAddOn = 275;
let items = [];
let claw = {
  angle: 0, dir: 1, state: 'swing', // swing | drop | pull
  len: 28, caught: null, busy: 0,
};
let floatTexts = [];
let shopItems = [];
let shopSel = -1;
let resultOk = false;
let lastTs = 0;
let tickAcc = 0;
let isTouch = matchMedia('(pointer:coarse)').matches || 'ontouchstart' in window;
let dynBtn = { x: W - 70, y: H - 70, r: 36 };
let hintAlpha = 1;

function resetRun() {
  score = 0; level = 1; levelDis = 1;
  timeLeft = 60; stick = 0;
  minerStrength = BASE_STRENGTH;
  strengthBoost = 0; strengthFlag = 0;
  rockBonus = 0; diamondBonus = 0; cloverBonus = 0;
  goalAddOn = 275; goal = 375 + goalAddOn; // 650
  startLevel();
}

function effectiveStrength() {
  return minerStrength + strengthBoost;
}

function priceOf(def) {
  if (def.rock && rockBonus) return def.key === 'rock_l' ? 60 : 33;
  if (def.diamond && diamondBonus) return def.key === 'diamond_m' ? 902 : 900;
  if (def.bag) return rollBag();
  return def.price;
}
function weightOf(def) {
  if (def.bag) {
    const w = (Math.random() * 4 | 0) + 1;
    if (w === 1) return (Math.random() * 9 | 0) + 1;
    if (w === 2) return -((Math.random() * 5 | 0) + 1);
    if (w === 3) return 9;
    return -1;
  }
  return def.weight;
}
function rollBag() {
  const w2 = (Math.random() * 6 | 0) + 1;
  if (cloverBonus) {
    if (w2 <= 2) return 'power';
    if (w2 <= 4) return stick <= 3 ? 'dynamite' : ((Math.random() * 300 | 0) + 300);
    return 700;
  }
  if (w2 <= 3) return (Math.random() * 600 | 0) + 1;
  if (w2 === 4) return 'power';
  if (w2 === 5) return stick <= 3 ? 'dynamite' : ((Math.random() * 100 | 0) + 100);
  return 800;
}

function startLevel() {
  mode = 'play';
  timeLeft = 60;
  strengthFlag = 0;
  claw = { angle: 0, dir: 1, state: 'swing', len: 28, caught: null, busy: 0 };
  floatTexts = [];
  items = [];
  const names = poolForLevel(level);
  const placed = [];
  for (const name of names) {
    const def = ITEM_DEFS[name];
    if (!def) continue;
    let x, y, ok = false;
    for (let t = 0; t < 40; t++) {
      x = 40 + Math.random() * (W - 80);
      y = 130 + Math.random() * (H - 170);
      ok = placed.every(p => Math.hypot(p.x - x, p.y - y) > (p.r + def.r) * 0.85);
      if (ok) break;
    }
    const it = {
      x, y, r: def.r, key: def.key, def,
      price: priceOf(def), weight: weightOf(def),
      alive: true, object: def.object,
    };
    items.push(it);
    placed.push(it);
  }
  playSfx('sfx4');
}

function clawTip() {
  const a = claw.angle + Math.PI / 2; // 0 = down
  // angle 0 = straight down; negative = left, positive = right
  const ang = claw.angle; // from vertical
  return {
    x: PIVOT.x + Math.sin(ang) * claw.len,
    y: PIVOT.y + Math.cos(ang) * claw.len,
  };
}

function dropClaw() {
  if (mode !== 'play' || claw.state !== 'swing') return;
  claw.state = 'drop';
  claw.busy = 0;
  playSfx('sfx5');
  hintAlpha = 0;
}

function useDynamite() {
  if (mode !== 'play' || stick < 1) return;
  if (claw.state !== 'pull' || !claw.caught) return;
  stick--;
  const it = claw.caught;
  it.alive = false;
  claw.caught = null;
  claw.price = 0;
  // explode nearby
  const tip = clawTip();
  for (const o of items) {
    if (!o.alive) continue;
    if (Math.hypot(o.x - tip.x, o.y - tip.y) < 55) o.alive = false;
  }
  playSfx('sfx8');
  // fast return
  claw.stickBonus = 1;
}

function grabItem(it) {
  claw.busy = 1;
  claw.state = 'pull';
  claw.caught = it;
  claw.price = it.price;
  claw.weight = it.weight;
  claw.stickBonus = (it.weight === -1) ? 1 : 0;
  if (it.weight === -1) claw.weight = 0;
  it.alive = false;
  playSfx('sfx6');
}

function finishPull() {
  const price = claw.price;
  claw.state = 'swing';
  claw.len = 28;
  claw.caught = null;
  claw.busy = 0;
  claw.stickBonus = 0;
  if (price === 'power') {
    strengthFlag = 1;
    floatTexts.push({ x: PIVOT.x, y: PIVOT.y + 40, t: '力气↑', life: 1.2 });
    playSfx('sfx9');
  } else if (price === 'dynamite') {
    stick++;
    floatTexts.push({ x: PIVOT.x, y: PIVOT.y + 40, t: '炸药+1', life: 1.2 });
    playSfx('sfx9');
  } else if (typeof price === 'number' && price > 0) {
    score += price;
    floatTexts.push({ x: PIVOT.x, y: PIVOT.y + 40, t: '$' + price, life: 1.2 });
    playSfx('sfx3');
  } else {
    playSfx('sfx7');
  }
}

function endLevel() {
  // clear per-level shop bonuses as frame_130
  strengthFlag = 0;
  rockBonus = 0; diamondBonus = 0; cloverBonus = 0;
  strengthBoost = 0;
  minerStrength = BASE_STRENGTH;
  resultOk = score >= goal;
  mode = 'result';
  playSfx(resultOk ? 'sfx1' : 'sfx2');
}

function buildShop() {
  shopItems = [];
  // 炸药
  if (stick < 5) {
    const price = (Math.random() * 300 | 0) + 1 + level * 2;
    shopItems.push({ id: 'dyn', name: '炸药', desc: '抓到重物时可按↑炸掉，节省时间。', price, buy() { stick++; } });
  }
  // 生力水 ~50%
  if ((Math.random() * 10 | 0) + 1 < 5) {
    const price = (Math.random() * (level * 50) | 0) + 1 + level * 2;
    shopItems.push({ id: 'str', name: '生力水', desc: '下一关力气+2，拉得更快。', price, buy() { strengthBoost = 2; } });
  }
  // 幸运草 ~40%
  if ((Math.random() * 10 | 0) + 1 < 6) {
    const price = (Math.random() * (level * 100) | 0) + 1 + 200;
    shopItems.push({ id: 'clover', name: '幸运草', desc: '下一关从色袋中更容易开到好东西。', price, buy() { cloverBonus = 1; } });
  }
  // 石头书
  if ((Math.random() * 10 | 0) + 1 < 5) {
    const price = (Math.random() * 300 | 0) + 100;
    shopItems.push({ id: 'rock', name: '石头收藏书', desc: '下一关石头更值钱。', price, buy() { rockBonus = 1; } });
  }
  // 优质钻石
  if ((Math.random() * 10 | 0) + 1 >= 7) {
    const price = (Math.random() * 150 | 0) + 1;
    shopItems.push({ id: 'dia', name: '优质钻石', desc: '下一关钻石相当值钱。', price, buy() { diamondBonus = 1; } });
  }
  // shuffle take up to 4
  shopItems.sort(() => Math.random() - 0.5);
  shopItems = shopItems.slice(0, 4);
  shopSel = -1;
  mode = 'shop';
}

function nextLevel() {
  if (levelDis <= 9) goalAddOn += 270;
  goal += goalAddOn;
  levelDis += 1;
  level += 1;
  if (level > 10) {
    mode = 'win';
    return;
  }
  startLevel();
}

// ----- Update -----
function update(dt) {
  if (mode === 'play') {
    tickAcc += dt;
    while (tickAcc >= 1) {
      tickAcc -= 1;
      timeLeft -= 1;
      if (timeLeft <= 0) {
        timeLeft = 0;
        if (claw.state === 'swing') endLevel();
      }
    }
    if (claw.state === 'swing') {
      claw.angle += claw.dir * SWING_SPEED * dt;
      if (claw.angle > SWING_MAX) { claw.angle = SWING_MAX; claw.dir = -1; }
      if (claw.angle < -SWING_MAX) { claw.angle = -SWING_MAX; claw.dir = 1; }
    } else if (claw.state === 'drop') {
      claw.len += DROP_SPEED * dt;
      const tip = clawTip();
      // hit floor / sides
      if (tip.y > H - 8 || tip.x < 8 || tip.x > W - 8) {
        claw.state = 'pull';
        claw.caught = null;
        claw.price = 0;
        claw.weight = 0;
        claw.stickBonus = 1;
      } else {
        for (const it of items) {
          if (!it.alive) continue;
          // point-ish hitTest on item body (not padding)
          if (Math.hypot(it.x - tip.x, it.y - tip.y) < it.r * 0.72) {
            if (it.def.tnt) {
              // grab TNT then it just pays $1 (SWF); optional blast on dynamite only
              grabItem(it);
            } else {
              grabItem(it);
            }
            break;
          }
        }
      }
    } else if (claw.state === 'pull') {
      let step;
      if (claw.stickBonus || strengthFlag) step = 15 * 18; // frames→px approx
      else {
        const w = claw.weight || 0;
        const s = Math.max(1, effectiveStrength() - w);
        step = s * 18; // px/s scaled from frame skip at 18fps
      }
      // map frame advance to length reduce: full rope ~320px
      claw.len -= (step / 18) * 12 * dt;
      if (claw.caught) {
        const tip = clawTip();
        claw.caught.x = tip.x;
        claw.caught.y = tip.y + claw.caught.r * 0.3;
      }
      if (claw.len <= 28) {
        claw.len = 28;
        finishPull();
        if (timeLeft <= 0) endLevel();
      }
    }
    hintAlpha = Math.max(0, hintAlpha - dt * 0.25);
  }
  for (const f of floatTexts) f.life -= dt;
  floatTexts = floatTexts.filter(f => f.life > 0);
}

// ----- Draw -----
function drawDirtBg() {
  const g = ctx.createLinearGradient(0, 90, 0, H);
  g.addColorStop(0, '#5a3a22');
  g.addColorStop(0.35, '#4a2e18');
  g.addColorStop(1, '#2a180c');
  ctx.fillStyle = g;
  ctx.fillRect(0, 95, W, H - 95);
  // speckles
  ctx.fillStyle = 'rgba(0,0,0,0.15)';
  for (let i = 0; i < 40; i++) {
    const x = (i * 97 + 13) % W;
    const y = 110 + ((i * 53) % (H - 120));
    ctx.fillRect(x, y, 3, 2);
  }
  // surface
  ctx.fillStyle = '#3d7a2a';
  ctx.fillRect(0, 88, W, 12);
  ctx.fillStyle = '#6bb344';
  ctx.fillRect(0, 88, W, 5);
  // sky panel behind miner
  ctx.fillStyle = '#87b7e0';
  ctx.fillRect(0, 0, W, 90);
}

function drawHUD() {
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  roundRect(8, 8, 150, 70, 8);
  ctx.fill();
  ctx.fillStyle = '#ffe9a0';
  ctx.font = 'bold 14px sans-serif';
  ctx.fillText('金钱 $' + score, 18, 28);
  ctx.fillText('目标 $' + goal, 18, 48);
  ctx.fillText('关卡 ' + levelDis, 18, 68);

  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  roundRect(W - 120, 8, 112, 50, 8);
  ctx.fill();
  ctx.fillStyle = timeLeft <= 10 ? '#ff6b6b' : '#ffe9a0';
  ctx.font = 'bold 16px sans-serif';
  ctx.fillText('时间 ' + timeLeft, W - 108, 38);

  if (stick > 0) {
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    roundRect(W - 120, 62, 112, 28, 8);
    ctx.fill();
    ctx.fillStyle = '#ffb347';
    ctx.font = '13px sans-serif';
    ctx.fillText('炸药 ×' + stick, W - 108, 82);
  }
}

function roundRect(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawMiner() {
  const im = (claw.state === 'pull') ? images.minerPull : images.minerIdle;
  if (im) {
    const mw = 110, mh = mw * im.height / im.width;
    ctx.drawImage(im, PIVOT.x - mw / 2, 8, mw, mh);
  } else {
    ctx.fillStyle = '#c4a070';
    ctx.fillRect(PIVOT.x - 30, 20, 60, 50);
  }
}

function drawClaw() {
  const tip = clawTip();
  ctx.strokeStyle = '#222';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(PIVOT.x, PIVOT.y);
  ctx.lineTo(tip.x, tip.y);
  ctx.stroke();
  // hook
  ctx.save();
  ctx.translate(tip.x, tip.y);
  ctx.rotate(claw.angle);
  ctx.fillStyle = '#c0c4c8';
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(0, 4, 7, -0.2, Math.PI + 0.2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-6, 4); ctx.lineTo(-10, 14); ctx.lineTo(-2, 10);
  ctx.moveTo(6, 4); ctx.lineTo(10, 14); ctx.lineTo(2, 10);
  ctx.stroke();
  ctx.restore();

  if (claw.caught) {
    const it = claw.caught;
    const im = images[it.key];
    if (im) {
      const s = it.r * 2.2;
      ctx.drawImage(im, tip.x - s / 2, tip.y + 4, s, s * im.height / im.width);
    }
  }
}

function drawItems() {
  for (const it of items) {
    if (!it.alive) continue;
    const im = images[it.key];
    if (im) {
      const s = it.r * 2.2;
      ctx.drawImage(im, it.x - s / 2, it.y - s / 2, s, s * (im.height / im.width));
    } else {
      ctx.fillStyle = '#daa520';
      ctx.beginPath(); ctx.arc(it.x, it.y, it.r, 0, Math.PI * 2); ctx.fill();
    }
  }
}

function drawTitle() {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, W, H);
  if (images.titleMiner) ctx.drawImage(images.titleMiner, W - 270, 20, 260, 370);
  if (images.startBtn) ctx.drawImage(images.startBtn, 40, 40, 240, 220);
  else {
    ctx.fillStyle = '#f5d76e';
    ctx.font = 'bold 48px sans-serif';
    ctx.fillText('开始', 100, 160);
  }
  if (images.controls) ctx.drawImage(images.controls, 20, 280, 260, 110);
  ctx.fillStyle = '#f5d76e';
  ctx.font = 'bold 22px sans-serif';
  ctx.fillText('黄金矿工', 18, 28);
  if (isTouch) {
    ctx.font = '13px sans-serif';
    ctx.fillStyle = '#ccc';
    ctx.fillText('点金块开始 · 游戏中点屏幕放钩', 18, H - 12);
  }
}

function drawShop() {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, W, H);
  if (images.shopkeeper) ctx.drawImage(images.shopkeeper, 0, 40, W, H - 40);
  ctx.fillStyle = 'rgba(0,0,0,0.65)';
  roundRect(16, 16, W - 32, 100, 10); ctx.fill();
  ctx.fillStyle = '#ffe9a0';
  ctx.font = 'bold 18px sans-serif';
  ctx.fillText('商店 — 金钱 $' + score + '　已达目标可进下一关', 28, 42);
  ctx.font = '13px sans-serif';
  ctx.fillStyle = '#ddd';
  const sel = shopItems[shopSel];
  ctx.fillText(sel ? (sel.name + '：$'+sel.price+' — '+sel.desc) : '点击商品购买，或点「下一关」', 28, 68);
  ctx.fillText('炸药持有：' + stick, 28, 92);

  shopItems.forEach((it, i) => {
    const x = 24 + i * 100;
    const y = H - 120;
    ctx.fillStyle = score >= it.price ? '#5a4020' : '#333';
    roundRect(x, y, 90, 70, 8); ctx.fill();
    ctx.strokeStyle = '#f5d76e'; ctx.stroke();
    ctx.fillStyle = '#ffe9a0';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText(it.name, x + 10, y + 28);
    ctx.fillText('$' + it.price, x + 10, y + 52);
  });

  // next level button
  ctx.fillStyle = '#2e8b57';
  roundRect(W - 120, 20, 100, 36, 8); ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 16px sans-serif';
  ctx.fillText('下一关', W - 100, 44);
}

function drawResult() {
  ctx.fillStyle = 'rgba(0,0,0,0.7)';
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#1a1208';
  roundRect(80, 100, W - 160, 200, 12); ctx.fill();
  ctx.strokeStyle = '#f5d76e'; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = '#ffe9a0';
  ctx.font = 'bold 28px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(resultOk ? '过关！' : '未达到目标', W / 2, 150);
  ctx.font = '18px sans-serif';
  ctx.fillText('金钱 $' + score + ' / 目标 $' + goal, W / 2, 190);
  ctx.fillStyle = '#2e8b57';
  roundRect(W / 2 - 70, 230, 140, 40, 8); ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 18px sans-serif';
  ctx.fillText(resultOk ? '去商店' : '再试一次', W / 2, 256);
  ctx.textAlign = 'left';
}

function drawWin() {
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#f5d76e';
  ctx.font = 'bold 36px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('恭喜通关！', W / 2, 160);
  ctx.font = '20px sans-serif';
  ctx.fillText('共获得 $' + score, W / 2, 210);
  ctx.fillStyle = '#2e8b57';
  roundRect(W / 2 - 70, 250, 140, 40, 8); ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.fillText('再来一局', W / 2, 276);
  ctx.textAlign = 'left';
}

function drawTouchControls() {
  if (!isTouch || mode !== 'play') return;
  // dynamite button
  ctx.beginPath();
  ctx.arc(dynBtn.x, dynBtn.y, dynBtn.r, 0, Math.PI * 2);
  ctx.fillStyle = stick > 0 ? 'rgba(220,80,40,0.45)' : 'rgba(80,80,80,0.35)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.5)';
  ctx.stroke();
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 12px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('炸药', dynBtn.x, dynBtn.y - 4);
  ctx.fillText(String(stick), dynBtn.x, dynBtn.y + 14);
  ctx.textAlign = 'left';
  if (hintAlpha > 0 && claw.state === 'swing') {
    ctx.globalAlpha = Math.min(1, hintAlpha);
    ctx.fillStyle = '#fff';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('点屏幕放钩子', W / 2, H - 24);
    ctx.textAlign = 'left';
    ctx.globalAlpha = 1;
  }
}

function drawFloats() {
  for (const f of floatTexts) {
    ctx.globalAlpha = Math.max(0, f.life);
    ctx.fillStyle = '#ffe66d';
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(f.t, f.x, f.y - (1.2 - f.life) * 30);
    ctx.textAlign = 'left';
    ctx.globalAlpha = 1;
  }
}

function render() {
  if (mode === 'title') drawTitle();
  else if (mode === 'shop') drawShop();
  else if (mode === 'result') { drawDirtBg(); drawMiner(); drawHUD(); drawResult(); }
  else if (mode === 'win') drawWin();
  else {
    drawDirtBg();
    drawItems();
    drawClaw();
    drawMiner();
    drawHUD();
    drawFloats();
    drawTouchControls();
  }
}

// ----- Input -----
function canvasPos(e) {
  const r = canvas.getBoundingClientRect();
  const src = e.touches ? e.touches[0] : e;
  return {
    x: (src.clientX - r.left) * (W / r.width),
    y: (src.clientY - r.top) * (H / r.height),
  };
}

function onPointer(e) {
  ensureAudio();
  const p = canvasPos(e);
  if (mode === 'title') {
    // start nugget area
    if (p.x > 40 && p.x < 300 && p.y > 40 && p.y < 280) {
      resetRun();
      playSfx('sfx4');
    }
    return;
  }
  if (mode === 'result') {
    if (p.y > 220 && p.y < 280 && p.x > W / 2 - 80 && p.x < W / 2 + 80) {
      if (resultOk) buildShop();
      else resetRun();
    }
    return;
  }
  if (mode === 'win') {
    if (p.y > 240 && p.y < 300) resetRun();
    return;
  }
  if (mode === 'shop') {
    if (p.x > W - 120 && p.y < 60) { nextLevel(); return; }
    shopItems.forEach((it, i) => {
      const x = 24 + i * 100, y = H - 120;
      if (p.x > x && p.x < x + 90 && p.y > y && p.y < y + 70) {
        shopSel = i;
        if (score >= it.price) {
          score -= it.price;
          it.buy();
          shopItems.splice(i, 1);
          playSfx('sfx3');
        }
      }
    });
    return;
  }
  if (mode === 'play') {
    if (isTouch && Math.hypot(p.x - dynBtn.x, p.y - dynBtn.y) < dynBtn.r + 8) {
      useDynamite();
      return;
    }
    dropClaw();
  }
}

canvas.addEventListener('mousedown', onPointer);
canvas.addEventListener('touchstart', (e) => { e.preventDefault(); onPointer(e); }, { passive: false });

addEventListener('keydown', (e) => {
  ensureAudio();
  if (e.code === 'ArrowDown' || e.code === 'Space') { e.preventDefault(); dropClaw(); }
  if (e.code === 'ArrowUp' || e.code === 'KeyD') { e.preventDefault(); useDynamite(); }
  if (e.code === 'Enter' && mode === 'title') resetRun();
});

// ----- Loop -----
function frame(ts) {
  if (!lastTs) lastTs = ts;
  let dt = (ts - lastTs) / 1000;
  lastTs = ts;
  if (dt > 0.05) dt = 0.05;
  update(dt);
  render();
  requestAnimationFrame(frame);
}

// ----- Boot -----
(async function boot() {
  try {
    let done = 0;
    const total = TITLE_PACK.length + 2;
    for (const [k, u] of TITLE_PACK) {
      await loadImage(k, u);
      done++; setLoad(done / (TITLE_PACK.length + PLAY_PACK.length + 3));
    }
    document.getElementById('load').classList.add('hide');
    requestAnimationFrame(frame);
    // play pack + sfx in background
    for (const [k, u] of PLAY_PACK) {
      await loadImage(k, u);
      done++; setLoad(Math.min(0.95, done / (TITLE_PACK.length + PLAY_PACK.length)));
    }
    ensureAudio();
    await Promise.all(SFX_NAMES.map(loadSfx));
    setLoad(1);
  } catch (err) {
    console.error(err);
    document.getElementById('pct').textContent = '加载出错，请刷新';
  }
})();
