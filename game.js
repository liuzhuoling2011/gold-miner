'use strict';
/**
 * 黄金矿工 HTML5 remake — 4399 flash/1602
 * Physics/layouts/SFX from original SWF (CWS v6, 550×400 @18fps)
 */
const W = 550, H = 400, FPS = 18;
const ASSET_VER = '8';
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
  ['titleScreen', 'assets/ui/title_screen.webp'],
];
const TITLE_PACK_2X = [
  ['titleScreen', 'assets/ui/title_screen@2x.webp'],
];
const PLAY_PACK = [
  ['playBg', 'assets/ui/play_bg.webp'],
  ['goalSplash', 'assets/ui/goal_splash.webp'],
  ['shopBg', 'assets/ui/shop_bg.webp'],
  ['shopBgHappy', 'assets/ui/shop_bg_happy.webp'],
  ['shopBgAngry', 'assets/ui/shop_bg_angry.webp'],
  ['shopDyn', 'assets/shop/dyn.webp'],
  ['shopStr', 'assets/shop/str.webp'],
  ['shopClover', 'assets/shop/clover.webp'],
  ['shopRock', 'assets/shop/rock.webp'],
  ['shopDia', 'assets/shop/dia.webp'],
  ['shopNext', 'assets/shop/next.webp'],
  ['minerIdle', 'assets/miner/idle.webp'],
  ['minerDown', 'assets/miner/down.webp'],
  ['minerUp', 'assets/miner/up.webp'],
  ['minerPull', 'assets/miner/pull.webp'],
  ['minerThrow1', 'assets/miner/throw1.webp'],
  ['minerThrow2', 'assets/miner/throw2.webp'],
  ['minerThrow3', 'assets/miner/throw3.webp'],
  ['hookOpen', 'assets/hook/open.webp'],
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
const PLAY_PACK_2X = [
  ['playBg', 'assets/ui/play_bg@2x.webp'],
  ['shopBg', 'assets/ui/shop_bg@2x.webp'],
  ['shopBgHappy', 'assets/ui/shop_bg_happy@2x.webp'],
  ['shopBgAngry', 'assets/ui/shop_bg_angry@2x.webp'],
  ['shopNext', 'assets/shop/next@2x.webp'],
  ['minerIdle', 'assets/miner/idle@2x.webp'],
  ['minerDown', 'assets/miner/down@2x.webp'],
  ['minerUp', 'assets/miner/up@2x.webp'],
  ['minerPull', 'assets/miner/pull@2x.webp'],
  ['minerThrow1', 'assets/miner/throw1@2x.webp'],
  ['minerThrow2', 'assets/miner/throw2@2x.webp'],
  ['minerThrow3', 'assets/miner/throw3@2x.webp'],
];
const SFX_NAMES = ['level','win','money','click','grab','tick','throw','boom','drop','hit','score','pant'];

// SWF claw object frames (DefineSprite_281 frame = object id) + miner pull loop (sprite 238)
for (let o = 2; o <= 14; o++) {
  PLAY_PACK.push(['hookGrab' + o, 'assets/hook/grab_' + o + '.webp']);
  PLAY_PACK_2X.push(['hookGrab' + o, 'assets/hook/grab_' + o + '@2x.webp']);
}
for (let i = 1; i <= 37; i++) {
  const id = String(i).padStart(2, '0');
  PLAY_PACK.push(['minerPull' + i, 'assets/miner/pull_frames/' + id + '.webp']);
  PLAY_PACK_2X.push(['minerPull' + i, 'assets/miner/pull_frames/' + id + '@2x.webp']);
}
for (const k of ['gold_s','gold_m','gold_l','gold_xl','rock_m','rock_l','diamond_s','diamond_m','bag','bone','pig','skull','tnt','shopDyn','shopStr','shopClover','shopRock','shopDia','hookOpen','hookClosed','goalSplash']) {
  const base = PLAY_PACK.find(p => p[0] === k);
  if (base) PLAY_PACK_2X.push([k, base[1].replace('.webp', '@2x.webp')]);
}


function loadImage(key, url) {
  return new Promise((res, rej) => {
    const im = new Image();
    im.onload = () => { images[key] = im; res(im); };
    im.onerror = () => rej(new Error(url));
    im.src = url + (url.includes('?') ? '&' : '?') + 'v=' + ASSET_VER;
  });
}
async function loadPack(pack, pack2x, onProgress) {
  const dpr = Math.min(window.devicePixelRatio || 1, 3);
  const use2x = dpr >= 1.5 && pack2x;
  const byKey = new Map(pack);
  if (use2x) {
    for (const [k, u] of pack2x) byKey.set(k, u);
  }
  const merged = [...byKey.entries()];
  let i = 0;
  for (const [k, u] of merged) {
    try {
      await loadImage(k, u);
    } catch (e) {
      // fall back to 1x if @2x missing
      const one = pack.find(p => p[0] === k);
      if (one && one[1] !== u) {
        try { await loadImage(k, one[1]); } catch (e2) { console.warn(e2); }
      } else console.warn(e);
    }
    i++;
    if (onProgress) onProgress(i / merged.length);
  }
}

let audioCtx = null;
const audioBuffers = {};
const sfxLastAt = Object.create(null);   // debounce clock (AudioContext time)
const sfxActive = Object.create(null);   // exclusive one-shots we may stop
const SFX_DEBOUNCE = {
  pant: 0.68, drop: 0.55, hit: 0.14, grab: 0.14, money: 0.18,
  score: 0.14, click: 0.08, throw: 0.12, boom: 0.12, tick: 0.25,
  win: 0.6, level: 0.6,
};
const SFX_EXCLUSIVE = new Set(['pant', 'drop']);

function ensureAudio() {
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  if (!audioCtx) audioCtx = new AC();
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

/** Unlock autoplay policy on first user gesture (no setTimeout). */
function unlockAudio() {
  const ctx = ensureAudio();
  if (!ctx) return;
  try {
    const silent = ctx.createBuffer(1, 1, 22050);
    const src = ctx.createBufferSource();
    src.buffer = silent;
    src.connect(ctx.destination);
    src.start(0);
  } catch (e) {}
}

/** Trim leading/trailing near-silence so one-shots fire immediately. */
function trimSilence(buf, thresh = 0.018) {
  if (!buf || !audioCtx) return buf;
  const nch = buf.numberOfChannels;
  const len = buf.length;
  const sr = buf.sampleRate;
  let start = 0;
  let end = len - 1;
  outerStart: for (let i = 0; i < len; i++) {
    for (let c = 0; c < nch; c++) {
      if (Math.abs(buf.getChannelData(c)[i]) > thresh) { start = i; break outerStart; }
    }
  }
  outerEnd: for (let i = len - 1; i >= start; i--) {
    for (let c = 0; c < nch; c++) {
      if (Math.abs(buf.getChannelData(c)[i]) > thresh) { end = i; break outerEnd; }
    }
  }
  const pad = Math.max(1, (sr * 0.004) | 0);
  start = Math.max(0, start - pad);
  end = Math.min(len - 1, end + pad);
  const outLen = Math.max(1, end - start + 1);
  if (outLen >= len - 8) return buf; // already tight
  const out = audioCtx.createBuffer(nch, outLen, sr);
  for (let c = 0; c < nch; c++) {
    out.getChannelData(c).set(buf.getChannelData(c).subarray(start, end + 1));
  }
  return out;
}

async function loadSfx(name) {
  try {
    const ctx = ensureAudio();
    if (!ctx) return;
    const r = await fetch('assets/sfx/' + name + '.mp3?v=' + ASSET_VER);
    const raw = await ctx.decodeAudioData(await r.arrayBuffer());
    audioBuffers[name] = trimSilence(raw);
  } catch (e) {}
}

function stopSfx(name) {
  const slot = sfxActive[name];
  if (!slot || !audioCtx) return;
  try {
    const t = audioCtx.currentTime;
    slot.gain.gain.cancelScheduledValues(t);
    slot.gain.gain.setValueAtTime(0, t);
    slot.src.stop(t);
  } catch (e) {}
  if (sfxActive[name] === slot) delete sfxActive[name];
}

function stopPant() {
  stopSfx('pant');
  pantCool = 0;
}

/** Web Audio one-shot: pre-decoded, silence-trimmed, debounced, optional exclusive. */
function playSfx(name, vol = 0.55) {
  try {
    const ctx = ensureAudio();
    const buf = audioBuffers[name];
    if (!ctx || !buf) return;
    const now = ctx.currentTime;
    const gap = SFX_DEBOUNCE[name] != null ? SFX_DEBOUNCE[name] : 0.05;
    if (sfxLastAt[name] != null && now - sfxLastAt[name] < gap) return;
    if (SFX_EXCLUSIVE.has(name)) stopSfx(name);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const g = ctx.createGain();
    g.gain.value = vol;
    src.connect(g);
    g.connect(ctx.destination);
    src.onended = () => {
      if (sfxActive[name] && sfxActive[name].src === src) delete sfxActive[name];
    };
    src.start(0);
    sfxLastAt[name] = now;
    if (SFX_EXCLUSIVE.has(name)) sfxActive[name] = { src, gain: g };
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
const MINER_NATIVE = { w: 139, h: 144 }; // DefineSprite_238 export size (all poses)
const MINER_DRAW_SCALE = 0.42; // ~SWF 0.389, slight bump for readability
const DROP_PX_PER_FRAME = 9.86;       // timeline Y step
const PULL_PX_PER_FRAME = 1.385;      // claw Y step on pull timeline
const BASE_STRENGTH = 10;
const LEN_MIN = 12.45;
const LEN_MAX = 407;
const PULL_FRAME_MAX = 20; // DefineSprite_238 pull loop before throw label
// SWF hitTest: tip PlaceObject(256)=shape40 12.4×12.4 vs item.ob.box (shape40 × scales below)
const TIP_HALF = 6.2;
const HOOK_OPEN_NATIVE = { w: 28, h: 18 }; // cropped DefineSprite_281/1
const HOOK_GRAB_NATIVE = {
  2:{w:20,h:24},3:{w:32,h:33},4:{w:58,h:57},5:{w:74,h:71},6:{w:32,h:27},7:{w:29,h:30},
  8:{w:45,h:46},9:{w:22,h:40},10:{w:36,h:28},11:{w:20,h:24},12:{w:37,h:41},13:{w:29,h:31},14:{w:33,h:35}
};
// Internal box scales on art sprites (FFDec PlaceObject name=box)
const ITEM_BOX = {
  gold_s:   { sx: 2.476, sy: 2.476, ox: 1.05, oy: -1.0 },
  gold_m:   { sx: 2.476, sy: 2.476, ox: 1.05, oy: -1.0 },
  gold_l:   { sx: 2.476, sy: 2.476, ox: 1.05, oy: -1.0 },
  gold_xl:  { sx: 2.476, sy: 2.476, ox: 1.05, oy: -1.0 },
  rock_m:   { sx: 3.368, sy: 2.781, ox: 4.30, oy: -7.65 },
  rock_l:   { sx: 2.960, sy: 2.960, ox: 5.85, oy: 10.2 },
  diamond_s:{ sx: 1.379, sy: 1.379, ox: -0.45, oy: 4.2 },
  diamond_m:{ sx: 2.032, sy: 2.032, ox: 0.15, oy: -1.0 },
  bag:      { sx: 3.250, sy: 3.250, ox: -0.45, oy: 1.8 },
  bone:     { sx: 2.540, sy: 1.355, ox: 3.65, oy: 4.25 },
  pig:      { sx: 2.032, sy: 2.032, ox: 0.15, oy: -1.0 },
  skull:    { sx: 2.282, sy: 2.282, ox: 0.55, oy: -0.8 },
  tnt:      { sx: 4.105, sy: 5.081, ox: 4.95, oy: 10.4 },
};

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
let shopBought = 0;
let shopFace = 'idle'; // idle | happy | angry
let shopExitTimer = 0;
let resultOk = false;
let lastTs = 0;
let logicAcc = 0;
let isTouch = matchMedia('(pointer:coarse)').matches || 'ontouchstart' in window;
// Phone-only virtual buttons (bottom-right): drop claw + dynamite
let dropBtn = { x: W - 52, y: H - 118, r: 34 };
let dynBtn = { x: W - 52, y: H - 46, r: 34 };
let hintAlpha = 1;
let minerPose = 'idle'; // idle | down | up | pull | throw
let throwTimer = 0;
let boomFx = null; // {x,y,life}
let goalTimer = 0;
let minerAnim = 1;      // sprite 238 frame 1..37
let pantCool = 0;

function resetRun() {
  score = 0; level = 1; levelDis = 1;
  timeLeft = 60; stick = 0;
  minerStrength = BASE_STRENGTH;
  strengthBoost = 0; strengthFlag = 0;
  rockBonus = 0; diamondBonus = 0; cloverBonus = 0;
  goalAddOn = 275; goal = 375 + goalAddOn;
  showGoal();
}
function showGoal() {
  mode = 'goal';
  goalTimer = 0;
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
  minerAnim = 1;
  stopPant();
  items = [];
  const layout = pickLevelLayout(level);
  if (layout) {
    for (const spot of layout) {
      const def = ITEM_DEFS[spot.key];
      if (!def) continue;
      const sc = (spot.sx + spot.sy) / 2;
      const box = ITEM_BOX[def.key] || { sx: 2.5, sy: 2.5, ox: 0, oy: 0 };
      items.push({
        x: spot.x, y: spot.y,
        r: def.r * sc,
        sx: spot.sx, sy: spot.sy,
        key: def.key, def,
        price: priceOf(def), weight: weightOf(def),
        alive: true, object: def.object,
        // Flash AABB half-extents of .ob.box in stage px
        boxHx: TIP_HALF * box.sx * spot.sx,
        boxHy: TIP_HALF * box.sy * spot.sy,
        boxOx: box.ox * spot.sx,
        boxOy: box.oy * spot.sy,
      });
    }
  }
  playSfx('level', 0.45);
}

function clawTip() {
  // Flash _rotation: +deg = clockwise. With Y-down, local +Y maps to (-sin, +cos).
  // Tip must use the same mapping so the rope ends where the claw hinge faces.
  const rad = claw.angleDeg * Math.PI / 180;
  return {
    x: PIVOT.x - Math.sin(rad) * claw.len,
    y: PIVOT.y + Math.cos(rad) * claw.len,
  };
}

function dropClaw() {
  if (mode !== 'play' || claw.state !== 'swing') return;
  claw.state = 'drop';
  claw.busy = 0;
  minerPose = 'down';
  playSfx('drop', 0.45); // one-shot; no mid-drop retrigger (was stacking)
  hintAlpha = 0;
}

function useDynamite() {
  if (mode !== 'play' || stick < 1) return;
  if (claw.state !== 'pull' || !claw.caught) return;
  stick--;
  stopPant();
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
  minerPose = 'pull';
  minerAnim = 1;
  throwTimer = 0; // never inherit throw pose from a prior dynamite toss
  stopPant();
  playSfx('hit', 0.5);
  playSfx('grab', 0.35);
}

function finishPull() {
  stopPant();
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
  shopBought = 0;
  shopFace = 'idle';
  shopExitTimer = 0;
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

function leaveShop() {
  if (shopExitTimer > 0) return;
  // SWF DefineButton2_78: bought==0 → angry (frame 26), else happy (frame 19)
  shopFace = shopBought ? 'happy' : 'angry';
  shopExitTimer = 0.85;
  playSfx(shopBought ? 'money' : 'tick', 0.4);
}

function nextLevel() {
  if (levelDis <= 9) goalAddOn += 270;
  goal += goalAddOn;
  levelDis += 1;
  level += 1;
  if (level > 10) { mode = 'win'; return; }
  showGoal();
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
    if (tip.y > H - 6 || tip.x < 6 || tip.x > W - 6 || claw.len >= LEN_MAX) {
      claw.state = 'pull';
      claw.caught = null;
      claw.price = 0;
      claw.weight = 0;
      claw.stickBonus = 1; // empty return is fast (SWF stickBonus path)
      minerPose = 'up';
    } else {
      // SWF: tip (shape40 ±6.2) hitTest item.ob.box AABB
      for (const it of items) {
        if (!it.alive) continue;
        const cx = it.x + (it.boxOx || 0);
        const cy = it.y + (it.boxOy || 0);
        const hx = it.boxHx || Math.max(8, it.r * 0.7);
        const hy = it.boxHy || Math.max(8, it.r * 0.7);
        if (Math.abs(tip.x - cx) <= TIP_HALF + hx && Math.abs(tip.y - cy) <= TIP_HALF + hy) {
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
    // SWF miner.gotoAndStop("up") → sprite 238 frames 1–20 loop (frame_20 → 1).
    // Frames 31–33 are the "throw" label (dynamite); never play them while pulling.
    if (minerPose !== 'throw') {
      minerPose = 'pull';
      minerAnim = (minerAnim % PULL_FRAME_MAX) + 1;
    }
    // Heavy pull (weight>1 and not fast path): pant like original effort
    const heavy = claw.caught && !claw.stickBonus && !strengthFlag && (claw.weight || 0) > 1;
    if (heavy) {
      pantCool -= dt;
      if (pantCool <= 0) {
        playSfx('pant', 0.42); // exclusive + debounced; restarts cleanly
        const pd = audioBuffers.pant ? audioBuffers.pant.duration : 0.71;
        pantCool = pd + 0.04; // no overlap with previous pant
      }
    } else {
      stopPant();
    }
    if (claw.len <= LEN_MIN) {
      claw.len = LEN_MIN;
      finishPull(); // stopPant inside
      if (timeLeft <= 0) endLevel();
    }
  }
  hintAlpha = Math.max(0, hintAlpha - dt * 0.25);
}

function update(dt) {
  if (mode === 'shop' && shopExitTimer > 0) {
    shopExitTimer -= dt;
    if (shopExitTimer <= 0) {
      shopExitTimer = 0;
      nextLevel();
    }
  }
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
  // Original SWF: yellow top bar with 金钱/目标钱数 left, 时间/第N关 right
  ctx.textAlign = 'left';
  ctx.font = 'bold 14px "Microsoft YaHei","PingFang SC",sans-serif';
  ctx.fillStyle = '#4a2e0a';
  ctx.fillText('金钱：', 12, 24);
  ctx.fillStyle = '#1dbd2a';
  ctx.font = 'bold 16px "Microsoft YaHei",sans-serif';
  ctx.fillText('$' + score, 58, 25);
  ctx.fillStyle = '#4a2e0a';
  ctx.font = 'bold 13px "Microsoft YaHei",sans-serif';
  ctx.fillText('目标钱数：', 12, 48);
  ctx.fillStyle = '#6b3f12';
  ctx.fillText('$' + goal, 88, 48);

  ctx.fillStyle = '#4a2e0a';
  ctx.font = 'bold 13px "Microsoft YaHei",sans-serif';
  ctx.fillText('时间：', W - 118, 24);
  ctx.fillStyle = timeLeft <= 10 ? '#e23a2a' : '#e07020';
  ctx.font = 'bold 16px "Microsoft YaHei",sans-serif';
  ctx.fillText(String(Math.ceil(timeLeft)), W - 72, 25);
  ctx.fillStyle = '#4a2e0a';
  ctx.font = 'bold 13px "Microsoft YaHei",sans-serif';
  ctx.fillText('第', W - 118, 48);
  ctx.fillStyle = '#e07020';
  ctx.font = 'bold 15px "Microsoft YaHei",sans-serif';
  ctx.fillText(String(levelDis), W - 96, 48);
  ctx.fillStyle = '#4a2e0a';
  ctx.font = 'bold 13px "Microsoft YaHei",sans-serif';
  ctx.fillText('关', W - 78, 48);

  // exit-level chip (visual only / tap returns to title)
  ctx.fillStyle = '#f0c040';
  roundRect(W - 200, 8, 56, 28, 6); ctx.fill();
  ctx.strokeStyle = '#a07820'; ctx.lineWidth = 1; ctx.stroke();
  ctx.fillStyle = '#5a3a10';
  ctx.font = '11px "Microsoft YaHei",sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('退出', W - 172, 20);
  ctx.fillText('本关', W - 172, 32);
  ctx.textAlign = 'left';

  if (stick > 0) {
    ctx.fillStyle = 'rgba(80,40,10,0.55)';
    roundRect(W - 200, 42, 56, 20, 5); ctx.fill();
    ctx.fillStyle = '#fff3c0';
    ctx.font = '11px "Microsoft YaHei",sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('炸药×' + stick, W - 172, 56);
    ctx.textAlign = 'left';
  }
}

function drawMiner() {
  let im = images.minerIdle;
  if (minerPose === 'down') im = images.minerDown || im;
  else if (minerPose === 'throw' && throwTimer > 0) {
    const t = throwTimer;
    const key = t > 0.3 ? 'minerThrow1' : t > 0.15 ? 'minerThrow2' : 'minerThrow3';
    im = images[key] || images.minerPull || im;
  } else if (minerPose === 'pull' || minerPose === 'up' || minerPose === 'throw') {
    const frame = ((minerAnim - 1) % PULL_FRAME_MAX) + 1;
    im = images['minerPull' + frame] || images.minerPull || images.minerUp || im;
  }
  if (!im) return;
  // All DefineSprite_238 frames are 139×144 — fixed stage size prevents flicker
  const mw = MINER_NATIVE.w * MINER_DRAW_SCALE;
  const mh = MINER_NATIVE.h * MINER_DRAW_SCALE;
  const x = MINER_POS.x - mw / 2;
  const y = Math.max(2, MINER_POS.y - mh * 0.42);
  ctx.drawImage(im, x, y, mw, mh);
}

function drawClaw() {
  const tip = clawTip();
  // rope to claw hinge (SWF tip/claw registration ≈ rope end)
  ctx.strokeStyle = '#1a1a1a';
  ctx.lineWidth = 1.6;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(PIVOT.x, PIVOT.y);
  ctx.lineTo(tip.x, tip.y);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,0.22)';
  ctx.lineWidth = 0.7;
  ctx.beginPath();
  ctx.moveTo(PIVOT.x + 0.5, PIVOT.y);
  ctx.lineTo(tip.x + 0.5, tip.y);
  ctx.stroke();

  // Original claw: DefineSprite_281 — open frame1, grabbed = gotoAndStop(object)
  let hk = images.hookOpen;
  let nw = HOOK_OPEN_NATIVE.w, nh = HOOK_OPEN_NATIVE.h;
  let drewGrab = false;
  if (claw.state === 'pull' && claw.caught) {
    const oid = claw.caught.object;
    const grab = images['hookGrab' + oid];
    if (grab) {
      hk = grab;
      const nat = HOOK_GRAB_NATIVE[oid] || HOOK_OPEN_NATIVE;
      nw = nat.w; nh = nat.h;
      drewGrab = true;
    } else {
      hk = images.hookClosed || images.hookOpen;
    }
  } else if (claw.state === 'pull') {
    hk = images.hookClosed || images.hookOpen;
  }

  ctx.save();
  ctx.translate(tip.x, tip.y);
  // Same clockwise angle as Flash _rotation / clawTip()
  ctx.rotate(claw.angleDeg * Math.PI / 180);
  if (hk) {
    // hinge at top-center (rope end); native SWF pixel size
    ctx.drawImage(hk, -nw / 2, 0, nw, nh);
  } else {
    ctx.strokeStyle = '#9aa0a6';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-8, 1); ctx.quadraticCurveTo(-11, 12, -3, 14);
    ctx.moveTo(8, 1); ctx.quadraticCurveTo(11, 12, 3, 14);
    ctx.stroke();
  }
  ctx.restore();

  // Fallback: draw item under claw if no composite grab frame
  if (claw.caught && !drewGrab) {
    const it = claw.caught;
    const im = images[it.key];
    if (im) {
      const s = it.r * 2.15;
      ctx.drawImage(im, tip.x - s / 2, tip.y + 4, s, s * im.height / im.width);
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
  if (images.titleScreen) {
    ctx.drawImage(images.titleScreen, 0, 0, W, H);
  } else {
    ctx.fillStyle = '#f5d76e';
    ctx.font = 'bold 48px sans-serif';
    ctx.fillText('开始', 100, 160);
  }
}

function drawGoal() {
  if (images.goalSplash) ctx.drawImage(images.goalSplash, 0, 0, W, H);
  else {
    ctx.fillStyle = '#1a0a00'; ctx.fillRect(0, 0, W, H);
  }
  ctx.fillStyle = '#22cc33';
  ctx.font = 'bold 40px "Microsoft YaHei",sans-serif';
  ctx.textAlign = 'center';
  ctx.strokeStyle = 'rgba(0,0,0,0.55)';
  ctx.lineWidth = 4;
  ctx.strokeText('$' + goal, W / 2, 240);
  ctx.fillText('$' + goal, W / 2, 240);
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  roundRect(W / 2 - 110, 300, 220, 28, 8); ctx.fill();
  ctx.fillStyle = '#fff8d0';
  ctx.font = '14px "Microsoft YaHei",sans-serif';
  ctx.fillText(isTouch ? '点屏幕继续' : '点击或按 Enter 继续', W / 2, 320);
  ctx.textAlign = 'left';
}

function drawShop() {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, W, H);
  // Face: idle shopkeeper; after buy → happy; leaving without buy → angry (SWF frames 19/26)
  let bg = images.shopBg;
  if (shopFace === 'happy') bg = images.shopBgHappy || bg;
  else if (shopFace === 'angry') bg = images.shopBgAngry || bg;
  if (bg) {
    // panels are ~550×347 — pin to bottom like original
    const bh = Math.min(H, bg.height * (W / bg.width));
    ctx.drawImage(bg, 0, H - bh, W, bh);
  }

  // money / tip banner (left) — one clear continue button on the right
  ctx.fillStyle = 'rgba(0,0,0,0.72)';
  roundRect(16, 10, W - 160, 70, 8); ctx.fill();
  ctx.strokeStyle = '#e0b84a'; ctx.lineWidth = 1.5; ctx.stroke();
  ctx.fillStyle = '#ffe9a0';
  ctx.font = 'bold 15px "Microsoft YaHei",sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('金钱 $' + score + '　　炸药 ×' + stick, 28, 34);
  ctx.font = '12px "Microsoft YaHei",sans-serif';
  ctx.fillStyle = '#ddd';
  const sel = shopItems[shopSel];
  let tip = '点击下面的物品即可买卖，买好后点下一关';
  if (shopFace === 'happy' && shopExitTimer > 0) tip = '谢谢惠顾！下一关见～';
  else if (shopFace === 'angry' && shopExitTimer > 0) tip = '……一件都不买就走？哼。';
  else if (sel) tip = sel.name + ' $' + sel.price + ' — ' + sel.desc;
  wrapText(tip, 28, 54, W - 200, 16);

  // Single next-level button (SWF DefineButton2_78)
  const nb = { x: W - 140, y: 14, w: 124, h: 42 };
  if (images.shopNext) {
    ctx.drawImage(images.shopNext, nb.x, nb.y, nb.w, nb.h);
  } else {
    ctx.fillStyle = '#1a6b2a';
    roundRect(nb.x, nb.y, nb.w, nb.h, 6); ctx.fill();
    ctx.strokeStyle = '#3dff6a'; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 18px "Microsoft YaHei",sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('下一关', nb.x + nb.w / 2, nb.y + 28);
  }
  ctx.textAlign = 'left';

  if (shopExitTimer > 0) return; // freeze item shelf while face plays

  const iconKey = { dyn: 'shopDyn', str: 'shopStr', clover: 'shopClover', rock: 'shopRock', dia: 'shopDia' };
  shopItems.forEach((it, i) => {
    const x = 30 + i * 120, y = H - 150;
    ctx.fillStyle = score >= it.price ? 'rgba(90,60,25,0.85)' : 'rgba(40,40,40,0.75)';
    roundRect(x, y, 105, 100, 10); ctx.fill();
    ctx.strokeStyle = shopSel === i ? '#fff36a' : '#f5d76e';
    ctx.lineWidth = shopSel === i ? 2.5 : 1.2;
    ctx.stroke();
    const ik = images[iconKey[it.id]];
    if (ik) {
      const iw = 48, ih = iw * ik.height / ik.width;
      ctx.drawImage(ik, x + (105 - iw) / 2, y + 8, iw, ih);
    }
    ctx.fillStyle = '#ffe9a0';
    ctx.font = 'bold 13px "Microsoft YaHei",sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(it.name, x + 52, y + 72);
    ctx.fillText('$' + it.price, x + 52, y + 90);
    ctx.textAlign = 'left';
  });
}

function wrapText(text, x, y, maxW, lineH) {
  const chars = text.split('');
  let line = '';
  for (const ch of chars) {
    const test = line + ch;
    if (ctx.measureText(test).width > maxW) {
      ctx.fillText(line, x, y);
      line = ch; y += lineH;
    } else line = test;
  }
  if (line) ctx.fillText(line, x, y);
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
  function pad(btn, label, active, sub) {
    ctx.beginPath();
    ctx.arc(btn.x, btn.y, btn.r, 0, Math.PI * 2);
    ctx.fillStyle = active ? 'rgba(220,80,40,0.55)' : 'rgba(20,20,20,0.45)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.6)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 13px "Microsoft YaHei",sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(label, btn.x, btn.y + (sub ? -4 : 5));
    if (sub != null) {
      ctx.font = '12px sans-serif';
      ctx.fillText(String(sub), btn.x, btn.y + 14);
    }
    ctx.textAlign = 'left';
  }
  pad(dropBtn, '放钩', claw.state === 'swing', null);
  pad(dynBtn, '炸药', stick > 0, stick);
  if (hintAlpha > 0 && claw.state === 'swing') {
    ctx.globalAlpha = Math.min(1, hintAlpha);
    ctx.fillStyle = '#fff';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('点「放钩」或屏幕放钩子', W / 2, H - 24);
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
  else if (mode === 'goal') drawGoal();
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
  unlockAudio();
  const p = canvasPos(e);
  if (mode === 'title') {
    // gold nugget start region (upper-left)
    if (p.x > 30 && p.x < 290 && p.y > 20 && p.y < 260) {
      resetRun();
    }
    return;
  }
  if (mode === 'goal') {
    startLevel();
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
    if (shopExitTimer > 0) return;
    if (p.x > W - 148 && p.y < 64) { leaveShop(); return; }
    shopItems.forEach((it, i) => {
      const x = 30 + i * 120, y = H - 150;
      if (p.x > x && p.x < x + 105 && p.y > y && p.y < y + 100) {
        shopSel = i;
        if (score >= it.price) {
          score -= it.price;
          it.buy();
          shopBought = 1;
          shopFace = 'happy';
          shopItems.splice(i, 1);
          playSfx('money');
        }
      }
    });
    return;
  }
  if (mode === 'play') {
    if (p.x > W - 200 && p.x < W - 144 && p.y > 6 && p.y < 38) {
      mode = 'title';
      return;
    }
    if (isTouch) {
      if (Math.hypot(p.x - dynBtn.x, p.y - dynBtn.y) < dynBtn.r + 10) {
        useDynamite();
        return;
      }
      if (Math.hypot(p.x - dropBtn.x, p.y - dropBtn.y) < dropBtn.r + 10) {
        dropClaw();
        return;
      }
    }
    dropClaw();
  }
}

canvas.addEventListener('mousedown', onPointer);
canvas.addEventListener('touchstart', (e) => { e.preventDefault(); onPointer(e); }, { passive: false });
// Extra unlock path for browsers that suspend AudioContext until gesture
['pointerdown', 'touchstart', 'keydown'].forEach((ev) => {
  addEventListener(ev, unlockAudio, { once: true, passive: true });
});

addEventListener('keydown', (e) => {
  unlockAudio();
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
  if (e.code === 'Enter' && mode === 'goal') startLevel();
  if (e.code === 'Enter' && mode === 'shop') leaveShop();
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
    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    const use2x = dpr >= 1.5;
    // Phase 1: title only → playable shell
    const titleList = use2x ? TITLE_PACK_2X : TITLE_PACK;
    for (const [k, u] of titleList) {
      try { await loadImage(k, u); } catch (e) {
        if (use2x) await loadImage(k, TITLE_PACK[0][1]);
      }
    }
    setLoad(0.12);
    document.getElementById('load').classList.add('hide');
    requestAnimationFrame(frame);

    // Phase 2: critical play (bg + miner idle + hook + shop)
    const critical = new Set(['playBg','goalSplash','shopBg','shopBgHappy','shopBgAngry','shopNext',
      'minerIdle','minerDown','minerPull','minerUp','minerThrow1','minerThrow2','minerThrow3',
      'hookOpen','hookClosed']);
    const phase2 = PLAY_PACK.filter(([k]) => critical.has(k) || k.startsWith('hookGrab') || k.startsWith('gold_') || k.startsWith('rock_') || k.startsWith('diamond_') || ['bag','bone','pig','skull','tnt'].includes(k) || k.startsWith('shop'));
    const phase3 = PLAY_PACK.filter(([k]) => !phase2.find(p => p[0] === k));

    let done = 0;
    const total = phase2.length + phase3.length + SFX_NAMES.length;
    await loadPack(phase2, use2x ? PLAY_PACK_2X : null, (p) => {
      done = Math.floor(p * phase2.length);
      setLoad(0.12 + 0.55 * (done / Math.max(1, phase2.length)));
    });
    // Phase 3: pull animation frames + remaining
    await loadPack(phase3, use2x ? PLAY_PACK_2X : null, (p) => {
      setLoad(0.67 + 0.2 * p);
    });
    ensureAudio();
    await Promise.all(SFX_NAMES.map(loadSfx));
    setLoad(1);
  } catch (err) {
    console.error(err);
    document.getElementById('pct').textContent = '加载出错，请刷新';
  }
})();

window.__GM = { resetRun, dropClaw, useDynamite, get mode(){return mode}, get items(){return items}, get claw(){return claw} };
