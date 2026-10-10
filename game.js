'use strict';
/**
 * 黄金矿工 HTML5 remake — 4399 flash/1602
 * Physics/layouts/SFX from original SWF (CWS v6, 550×400 @18fps)
 */
const W = 550, H = 400, FPS = 18;
const ASSET_VER = '2';
const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');

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

const images = {};
const TITLE_PACK = [
  ['titleMiner', 'assets/ui/title_miner.webp'],
  ['startBtn', 'assets/ui/start_btn.webp'],
  ['controls', 'assets/ui/controls.webp'],
];
const PLAY_PACK = [
  ['playBg', 'assets/ui/play_bg.webp'],
  ['hudPanel', 'assets/ui/hud_panel.webp'],
  ['shopkeeper', 'assets/ui/shopkeeper.webp'],
  ['minerIdle', 'assets/miner/idle.webp'],
  ['minerDown', 'assets/miner/down.webp'],
  ['minerUp', 'assets/miner/up.webp'],
  ['minerPull', 'assets/miner/pull.webp'],
  ['minerThrow1', 'assets/miner/throw1.webp'],
  ['minerThrow2', 'assets/miner/throw2.webp'],
  ['minerThrow3', 'assets/miner/throw3.webp'],
  ['hookOpen', 'assets/hook/open.webp'],
  ['hookGrab', 'assets/hook/grab.webp'],
  ['hookClosed', 'assets/hook/closed.webp'],
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
const SFX_NAMES = ['level','win','money','click','grab','tick','throw','boom','drop','hit','score'];

function loadImage(key, url) {
  return new Promise((res, rej) => {
    const im = new Image();
    im.onload = () => { images[key] = im; res(im); };
    im.onerror = () => rej(new Error(url));
    im.src = url + (url.includes('?') ? '&' : '?') + 'v=' + ASSET_VER;
  });
}

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
    audioBuffers[name] = await audioCtx.decodeAudioData(await r.arrayBuffer());
  } catch (e) {}
}
function playSfx(name, vol = 0.55) {
  try {
    ensureAudio();
    const buf = audioBuffers[name];
    if (!buf) return;
    const src = audioCtx.createBufferSource();
    src.buffer = buf;
    const g = audioCtx.createGain();
    g.gain.value = vol;
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

// ----- SWF constants -----
const PIVOT = { x: 275.5, y: 48.6 };
const MINER_POS = { x: 285.85, y: 34.75, scale: 0.389 };
const DROP_PX_PER_FRAME = 9.86;       // timeline Y step
const PULL_PX_PER_FRAME = 1.385;      // claw Y step on pull timeline
const BASE_STRENGTH = 10;
const LEN_MIN = 12.45;
const LEN_MAX = 407;

const ITEM_DEFS = {
  gold_s:   { object: 2,  price: 50,  weight: 3, r: 10, key: 'gold_s' },
  gold_m:   { object: 3,  price: 100, weight: 7, r: 14, key: 'gold_m' },
  gold_l:   { object: 4,  price: 250, weight: 8, r: 26, key: 'gold_l' },
  gold_xl:  { object: 5,  price: 500, weight: 9, r: 34, key: 'gold_xl' },
  rock_m:   { object: 14, price: 11, weight: 8, r: 22, key: 'rock_m', rock: true },
  rock_l:   { object: 8,  price: 20, weight: 9, r: 30, key: 'rock_l', rock: true },
  diamond_s:{ object: 11, price: 600, weight: 2, r: 10, key: 'diamond_s', diamond: true },
  diamond_m:{ object: 10, price: 602, weight: 5, r: 14, key: 'diamond_m', diamond: true },
  bag:      { object: 12, price: 0,   weight: 4, r: 22, key: 'bag', bag: true },
  bone:     { object: 7,  price: 7,   weight: 3, r: 14, key: 'bone' },
  pig:      { object: 6,  price: 2,   weight: 3, r: 12, key: 'pig' },
  skull:    { object: 13, price: 20,  weight: 2, r: 14, key: 'skull' },
  tnt:      { object: 9,  price: 1,   weight: 2, r: 18, key: 'tnt', tnt: true },
};

const SWING = (typeof GM_SWING !== 'undefined' && GM_SWING.length) ? GM_SWING : (() => {
  const a = [];
  for (let i = 0; i < 87; i++) a.push(Math.sin(i / 86 * Math.PI * 2) * 67);
  return a;
})();

// ----- State -----
let mode = 'title';
let score = 0, goal = 650, level = 1, levelDis = 1;
let timeLeft = 60, stick = 0, minerStrength = BASE_STRENGTH;
let strengthBoost = 0, strengthFlag = 0;
let rockBonus = 0, diamondBonus = 0, cloverBonus = 0;
let goalAddOn = 275;
let items = [];
let claw = {
  swingFrame: 2, angleDeg: 0,
  state: 'swing', // swing | drop | pull
  len: LEN_MIN, caught: null, busy: 0,
  price: 0, weight: 0, stickBonus: 0,
};
let floatTexts = [];
let shopItems = [];
let shopSel = -1;
let resultOk = false;
let lastTs = 0;
let logicAcc = 0;
let isTouch = matchMedia('(pointer:coarse)').matches || 'ontouchstart' in window;
let dynBtn = { x: W - 64, y: H - 64, r: 40 };
let hintAlpha = 1;
let minerPose = 'idle'; // idle | down | up | pull | throw
let throwTimer = 0;
let boomFx = null; // {x,y,life}
let dropSfxCool = 0;

function resetRun() {
  score = 0; level = 1; levelDis = 1;
  timeLeft = 60; stick = 0;
  minerStrength = BASE_STRENGTH;
  strengthBoost = 0; strengthFlag = 0;
  rockBonus = 0; diamondBonus = 0; cloverBonus = 0;
  goalAddOn = 275; goal = 375 + goalAddOn;
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
    return -1; // stickBonus fast pull
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

function pickLevelLayout(lv) {
  const variants = [1, 2, 3].map(v => 'L' + lv + '_' + v).filter(k => window.GM_LEVELS && GM_LEVELS[k]);
  if (!variants.length) return null;
  return GM_LEVELS[variants[(Math.random() * variants.length) | 0]];
}

function startLevel() {
  mode = 'play';
  timeLeft = 60;
  strengthFlag = 0;
  claw = {
    swingFrame: 2 + ((Math.random() * 80) | 0),
    angleDeg: 0, state: 'swing', len: LEN_MIN,
    caught: null, busy: 0, price: 0, weight: 0, stickBonus: 0,
  };
  claw.angleDeg = SWING[claw.swingFrame % SWING.length] || 0;
  floatTexts = [];
  boomFx = null;
  minerPose = 'idle';
  throwTimer = 0;
  hintAlpha = 1;
  items = [];
  const layout = pickLevelLayout(level);
  if (layout) {
    for (const spot of layout) {
      const def = ITEM_DEFS[spot.key];
      if (!def) continue;
      const sc = (spot.sx + spot.sy) / 2;
      items.push({
        x: spot.x, y: spot.y,
        r: def.r * sc,
        sx: spot.sx, sy: spot.sy,
        key: def.key, def,
        price: priceOf(def), weight: weightOf(def),
        alive: true, object: def.object,
      });
    }
  }
  playSfx('level', 0.45);
}

function clawTip() {
  const rad = claw.angleDeg * Math.PI / 180;
  return {
    x: PIVOT.x + Math.sin(rad) * claw.len,
    y: PIVOT.y + Math.cos(rad) * claw.len,
  };
}

function dropClaw() {
  if (mode !== 'play' || claw.state !== 'swing') return;
  claw.state = 'drop';
  claw.busy = 0;
  minerPose = 'down';
  playSfx('drop', 0.4);
  dropSfxCool = 0.12;
  hintAlpha = 0;
}

function useDynamite() {
  if (mode !== 'play' || stick < 1) return;
  if (claw.state !== 'pull' || !claw.caught) return;
  stick--;
  const tip = clawTip();
  boomFx = { x: tip.x, y: tip.y, life: 0.45 };
  claw.caught.alive = false;
  claw.caught = null;
  claw.price = 0;
  claw.weight = 0;
  claw.stickBonus = 1;
  minerPose = 'throw';
  throwTimer = 0.45;
  playSfx('throw', 0.5);
  playSfx('boom', 0.7);
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
  minerPose = 'up';
  playSfx('hit', 0.5);
  playSfx('grab', 0.35);
}

function finishPull() {
  const price = claw.price;
  claw.state = 'swing';
  claw.len = LEN_MIN;
  claw.caught = null;
  claw.busy = 0;
  claw.stickBonus = 0;
  minerPose = 'idle';
  if (price === 'power') {
    strengthFlag = 1;
    floatTexts.push({ x: PIVOT.x, y: PIVOT.y + 36, t: '力气↑', life: 1.2 });
    playSfx('score');
  } else if (price === 'dynamite') {
    stick++;
    floatTexts.push({ x: PIVOT.x, y: PIVOT.y + 36, t: '炸药+1', life: 1.2 });
    playSfx('score');
  } else if (typeof price === 'number' && price > 0) {
    score += price;
    floatTexts.push({ x: PIVOT.x, y: PIVOT.y + 36, t: '$' + price, life: 1.2 });
    playSfx('money');
    playSfx('score', 0.4);
  } else {
    playSfx('click', 0.35);
  }
}

function endLevel() {
  strengthFlag = 0;
  rockBonus = 0; diamondBonus = 0; cloverBonus = 0;
  strengthBoost = 0;
  minerStrength = BASE_STRENGTH;
  resultOk = score >= goal;
  mode = 'result';
  playSfx(resultOk ? 'win' : 'tick');
}

function buildShop() {
  shopItems = [];
  if (stick < 5) {
    const price = (Math.random() * 300 | 0) + 1 + level * 2;
    shopItems.push({ id: 'dyn', name: '炸药', desc: '抓到重物时可按↑炸掉，节省时间。', price, buy() { stick++; } });
  }
  if ((Math.random() * 10 | 0) + 1 < 5) {
    const price = (Math.random() * (level * 50) | 0) + 1 + level * 2;
    shopItems.push({ id: 'str', name: '生力水', desc: '下一关力气+2，拉得更快。', price, buy() { strengthBoost = 2; } });
  }
  if ((Math.random() * 10 | 0) + 1 < 6) {
    const price = (Math.random() * (level * 100) | 0) + 1 + 200;
    shopItems.push({ id: 'clover', name: '幸运草', desc: '下一关从色袋中更容易开到好东西。', price, buy() { cloverBonus = 1; } });
  }
  if ((Math.random() * 10 | 0) + 1 < 5) {
    const price = (Math.random() * 300 | 0) + 100;
    shopItems.push({ id: 'rock', name: '石头收藏书', desc: '下一关石头更值钱。', price, buy() { rockBonus = 1; } });
  }
  if ((Math.random() * 10 | 0) + 1 >= 7) {
    const price = (Math.random() * 150 | 0) + 1;
    shopItems.push({ id: 'dia', name: '优质钻石', desc: '下一关钻石相当值钱。', price, buy() { diamondBonus = 1; } });
  }
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
  if (level > 10) { mode = 'win'; return; }
  startLevel();
}

// ----- Fixed 18fps logic step (matches SWF timeline) -----
function logicStep() {
  const dt = 1 / FPS;
  if (mode !== 'play') {
    if (throwTimer > 0) throwTimer -= dt;
    if (boomFx) { boomFx.life -= dt; if (boomFx.life <= 0) boomFx = null; }
    return;
  }

  if (throwTimer > 0) {
    throwTimer -= dt;
    if (throwTimer <= 0 && claw.state === 'pull') minerPose = 'up';
  }
  if (boomFx) { boomFx.life -= dt; if (boomFx.life <= 0) boomFx = null; }
  if (dropSfxCool > 0) dropSfxCool -= dt;

  // timer ~1s per SWF sprite 188 tick
  timeLeft -= dt;
  if (timeLeft <= 0) {
    timeLeft = 0;
    if (claw.state === 'swing') endLevel();
  }

  if (claw.state === 'swing') {
    claw.swingFrame = (claw.swingFrame + 1) % SWING.length;
    claw.angleDeg = SWING[claw.swingFrame];
    minerPose = 'idle';
  } else if (claw.state === 'drop') {
    claw.len += DROP_PX_PER_FRAME;
    const tip = clawTip();
    if (dropSfxCool <= 0) { playSfx('drop', 0.15); dropSfxCool = 0.2; }
    if (tip.y > H - 6 || tip.x < 6 || tip.x > W - 6 || claw.len >= LEN_MAX) {
      claw.state = 'pull';
      claw.caught = null;
      claw.price = 0;
      claw.weight = 0;
      claw.stickBonus = 1; // empty return is fast (SWF stickBonus path)
      minerPose = 'up';
    } else {
      // hitTest tip vs item body (SWF: claw.box hitTests T.ob.box)
      for (const it of items) {
        if (!it.alive) continue;
        const hr = Math.max(6, it.r * 0.62);
        if (Math.hypot(it.x - tip.x, it.y - tip.y) < hr) {
          grabItem(it);
          break;
        }
      }
    }
  } else if (claw.state === 'pull') {
    let step;
    if (claw.stickBonus || strengthFlag) step = 15;
    else step = Math.max(1, effectiveStrength() - (claw.weight || 0));
    claw.len -= step * PULL_PX_PER_FRAME;
    if (claw.caught) {
      const tip = clawTip();
      claw.caught.x = tip.x;
      claw.caught.y = tip.y + Math.max(6, claw.caught.r * 0.25);
    }
    if (minerPose !== 'throw') minerPose = (claw.caught && (claw.weight || 0) >= 7) ? 'pull' : 'up';
    if (claw.len <= LEN_MIN) {
      claw.len = LEN_MIN;
      finishPull();
      if (timeLeft <= 0) endLevel();
    }
  }
  hintAlpha = Math.max(0, hintAlpha - dt * 0.25);
}

function update(dt) {
  logicAcc += dt;
  const step = 1 / FPS;
  let guard = 0;
  while (logicAcc >= step && guard++ < 5) {
    logicAcc -= step;
    logicStep();
  }
  for (const f of floatTexts) f.life -= dt;
  floatTexts = floatTexts.filter(f => f.life > 0);
}

// ----- Draw -----
function roundRect(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawPlayBg() {
  if (images.playBg) ctx.drawImage(images.playBg, 0, 0, W, H);
  else {
    ctx.fillStyle = '#87b7e0'; ctx.fillRect(0, 0, W, 95);
    ctx.fillStyle = '#4a2e18'; ctx.fillRect(0, 95, W, H - 95);
    ctx.fillStyle = '#3d7a2a'; ctx.fillRect(0, 88, W, 12);
  }
}

function drawHUD() {
  if (images.hudPanel) {
    ctx.drawImage(images.hudPanel, 8, 6, 150, 72);
    ctx.drawImage(images.hudPanel, W - 118, 6, 110, 48);
  } else {
    ctx.fillStyle = 'rgba(12,20,40,0.72)';
    roundRect(8, 6, 150, 72, 8); ctx.fill();
    ctx.strokeStyle = '#e0b84a'; ctx.lineWidth = 1.5; ctx.stroke();
    roundRect(W - 118, 6, 110, 48, 8); ctx.fill(); ctx.stroke();
  }
  ctx.fillStyle = '#ffe9a0';
  ctx.font = 'bold 14px "Microsoft YaHei",sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('金钱 $' + score, 18, 28);
  ctx.fillText('目标 $' + goal, 18, 48);
  ctx.fillText('关卡 ' + levelDis, 18, 68);
  ctx.fillStyle = timeLeft <= 10 ? '#ff6b6b' : '#ffe9a0';
  ctx.font = 'bold 16px "Microsoft YaHei",sans-serif';
  ctx.fillText('时间 ' + Math.ceil(timeLeft), W - 106, 36);

  if (stick > 0) {
    ctx.fillStyle = 'rgba(12,20,40,0.72)';
    roundRect(W - 118, 58, 110, 26, 8); ctx.fill();
    ctx.strokeStyle = '#e0b84a'; ctx.stroke();
    ctx.fillStyle = '#ffb347';
    ctx.font = '13px "Microsoft YaHei",sans-serif';
    ctx.fillText('炸药 ×' + stick, W - 106, 76);
  }
}

function drawMiner() {
  let key = 'minerIdle';
  if (minerPose === 'down') key = 'minerDown';
  else if (minerPose === 'up') key = 'minerUp';
  else if (minerPose === 'pull') key = 'minerPull';
  else if (minerPose === 'throw') {
    const t = throwTimer;
    key = t > 0.3 ? 'minerThrow1' : t > 0.15 ? 'minerThrow2' : 'minerThrow3';
  }
  const im = images[key] || images.minerIdle || images.minerPull;
  if (!im) return;
  // SWF miner placed at scale ~0.389 of 166×150 ≈ 64×58, but art looks larger in practice
  const mw = 96;
  const mh = mw * im.height / im.width;
  ctx.drawImage(im, MINER_POS.x - mw / 2, 6, mw, mh);
}

function drawClaw() {
  const tip = clawTip();
  // rope
  ctx.strokeStyle = '#1a1a1a';
  ctx.lineWidth = 2.2;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(PIVOT.x, PIVOT.y);
  ctx.lineTo(tip.x, tip.y);
  ctx.stroke();
  // thin highlight
  ctx.strokeStyle = 'rgba(255,255,255,0.25)';
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(PIVOT.x + 0.6, PIVOT.y);
  ctx.lineTo(tip.x + 0.6, tip.y);
  ctx.stroke();

  // hook sprite
  let hk = images.hookOpen;
  if (claw.state === 'pull' && claw.caught) hk = images.hookGrab || images.hookClosed;
  else if (claw.state === 'pull') hk = images.hookClosed || images.hookGrab;
  else if (claw.state === 'drop') hk = images.hookOpen;
  ctx.save();
  ctx.translate(tip.x, tip.y);
  ctx.rotate(claw.angleDeg * Math.PI / 180);
  if (hk) {
    const s = 36;
    ctx.drawImage(hk, -s / 2, -4, s, s);
  } else {
    ctx.strokeStyle = '#c8ccd0';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-7, 2); ctx.quadraticCurveTo(-12, 16, -2, 18);
    ctx.moveTo(0, 2); ctx.lineTo(0, 18);
    ctx.moveTo(7, 2); ctx.quadraticCurveTo(12, 16, 2, 18);
    ctx.stroke();
  }
  ctx.restore();

  if (claw.caught) {
    const it = claw.caught;
    const im = images[it.key];
    if (im) {
      const s = it.r * 2.15;
      ctx.drawImage(im, tip.x - s / 2, tip.y + 2, s, s * im.height / im.width);
    }
  }

  if (boomFx) {
    const a = Math.max(0, boomFx.life / 0.45);
    ctx.globalAlpha = a;
    ctx.fillStyle = '#ff8844';
    ctx.beginPath();
    ctx.arc(boomFx.x, boomFx.y, 18 + (1 - a) * 40, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffe66d';
    ctx.beginPath();
    ctx.arc(boomFx.x, boomFx.y, 8 + (1 - a) * 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

function drawItems() {
  for (const it of items) {
    if (!it.alive) continue;
    const im = images[it.key];
    if (im) {
      const s = it.r * 2.15;
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
  ctx.fillStyle = 'rgba(0,0,0,0.7)';
  roundRect(16, 12, W - 32, 96, 10); ctx.fill();
  ctx.strokeStyle = '#e0b84a'; ctx.lineWidth = 1.5; ctx.stroke();
  ctx.fillStyle = '#ffe9a0';
  ctx.font = 'bold 18px "Microsoft YaHei",sans-serif';
  ctx.fillText('商店 — 金钱 $' + score, 28, 40);
  ctx.font = '13px "Microsoft YaHei",sans-serif';
  ctx.fillStyle = '#ddd';
  const sel = shopItems[shopSel];
  ctx.fillText(sel ? (sel.name + '：$' + sel.price + ' — ' + sel.desc) : '点击商品购买，或点「下一关」', 28, 64);
  ctx.fillText('炸药持有：' + stick, 28, 88);

  shopItems.forEach((it, i) => {
    const x = 24 + i * 100, y = H - 120;
    ctx.fillStyle = score >= it.price ? '#5a4020' : '#333';
    roundRect(x, y, 90, 70, 8); ctx.fill();
    ctx.strokeStyle = '#f5d76e'; ctx.stroke();
    ctx.fillStyle = '#ffe9a0';
    ctx.font = 'bold 13px "Microsoft YaHei",sans-serif';
    ctx.fillText(it.name, x + 10, y + 28);
    ctx.fillText('$' + it.price, x + 10, y + 52);
  });

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
  ctx.font = 'bold 28px "Microsoft YaHei",sans-serif';
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
  ctx.beginPath();
  ctx.arc(dynBtn.x, dynBtn.y, dynBtn.r, 0, Math.PI * 2);
  ctx.fillStyle = stick > 0 ? 'rgba(220,80,40,0.5)' : 'rgba(80,80,80,0.35)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.55)';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 13px sans-serif';
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
    ctx.globalAlpha = Math.max(0, Math.min(1, f.life));
    ctx.fillStyle = '#ffe66d';
    ctx.font = 'bold 22px "Microsoft YaHei",sans-serif';
    ctx.textAlign = 'center';
    ctx.strokeStyle = 'rgba(0,0,0,0.55)';
    ctx.lineWidth = 3;
    const y = f.y - (1.2 - f.life) * 34;
    ctx.strokeText(f.t, f.x, y);
    ctx.fillText(f.t, f.x, y);
    ctx.textAlign = 'left';
    ctx.globalAlpha = 1;
  }
}

function render() {
  if (mode === 'title') drawTitle();
  else if (mode === 'shop') drawShop();
  else if (mode === 'result') { drawPlayBg(); drawMiner(); drawHUD(); drawResult(); }
  else if (mode === 'win') drawWin();
  else {
    drawPlayBg();
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
    if (p.x > 40 && p.x < 300 && p.y > 40 && p.y < 280) {
      resetRun();
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
          playSfx('money');
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
  // ←/→ force pull-up like SWF
  if ((e.code === 'ArrowLeft' || e.code === 'ArrowRight') && claw.state === 'drop') {
    e.preventDefault();
    claw.state = 'pull';
    claw.caught = null;
    claw.price = 0;
    claw.weight = 0;
    claw.stickBonus = 1;
    minerPose = 'up';
  }
  if (e.code === 'Enter' && mode === 'title') resetRun();
});

function frame(ts) {
  if (!lastTs) lastTs = ts;
  let dt = (ts - lastTs) / 1000;
  lastTs = ts;
  if (dt > 0.08) dt = 0.08;
  update(dt);
  render();
  requestAnimationFrame(frame);
}

(async function boot() {
  try {
    let done = 0;
    const total = TITLE_PACK.length + PLAY_PACK.length + SFX_NAMES.length;
    for (const [k, u] of TITLE_PACK) {
      await loadImage(k, u);
      done++; setLoad(done / total);
    }
    document.getElementById('load').classList.add('hide');
    requestAnimationFrame(frame);
    for (const [k, u] of PLAY_PACK) {
      try { await loadImage(k, u); } catch (e) { console.warn(e); }
      done++; setLoad(Math.min(0.95, done / total));
    }
    ensureAudio();
    await Promise.all(SFX_NAMES.map(loadSfx));
    setLoad(1);
  } catch (err) {
    console.error(err);
    document.getElementById('pct').textContent = '加载出错，请刷新';
  }
})();

window.__GM = { resetRun, dropClaw, useDynamite, get mode(){return mode}, get items(){return items}, get claw(){return claw} };
