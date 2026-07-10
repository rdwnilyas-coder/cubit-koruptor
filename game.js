// ============================================================
// CUBIT KORUPTOR — engine utama
// Aset gambar opsional di ./assets/ ; fallback: emoji.
// ============================================================
'use strict';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const video = document.getElementById('cam');
const camOverlay = document.getElementById('cam-overlay');
const camCtx = camOverlay.getContext('2d');
const camBox = document.getElementById('cam-box');
const overlay = document.getElementById('overlay');
const panelText = document.getElementById('panel-text');
const panelScore = document.getElementById('panel-score');
const btnStart = document.getElementById('btn-start');
const elWave = document.getElementById('wave');
const elScore = document.getElementById('score');
const elWaktu = document.getElementById('waktu');
const elKorup = document.getElementById('korup');
const elNyawa = document.getElementById('nyawa');
const waveBanner = document.getElementById('wave-banner');

const CHAR_SIZE = 64;         // ukuran gambar karakter (px)
const HIT_RADIUS = 70;        // radius sentilan
const MAX_WAVE = 5;           // 5 wave, bersihkan semuanya = menang
const TYPES = ['polisi', 'tentara', 'jaksa'];
const EMOJI = { polisi: '👮', tentara: '💂', jaksa: '🧑‍⚖️', pengusaha: '👨‍💼' };

// ---------- Aset (opsional, fallback emoji) ----------
const IMG_NAMES = ['polisi', 'tentara', 'jaksa',
  'polisi_koruptor', 'tentara_koruptor', 'jaksa_koruptor', 'pengusaha_koruptor',
  'jari', 'jari_cubit', 'karung', 'background'];
const IMGS = {};
for (const name of IMG_NAMES) {
  const img = new Image();
  img.onload = () => { IMGS[name] = img; if (name === 'background') resize(); };
  img.src = `assets/${name}.png`; // gagal load = biarkan, pakai emoji/gambar kanvas
}

// ---------- Kanvas & background taman ----------
// Tema peta per wave: makin tinggi wave makin mencekam.
const THEMES = [
  { nama: 'TAMAN CERAH', grass: ['#7ec850', '#559b38'], path: '#d9c68f',
    water: ['#6db3d8', '#8fcbe8'],
    deco: ['🌳', '🌳', '🌴', '🌲', '🌳', '⛲', '🪑', '🌷', '🌻', '🌼',
      '🪨', '🍄', '🌲', '🌳', '🛝', '🪑', '💐', '🌴', '🦆', '⛲'],
    tint: null },
  { nama: 'MENDUNG KELABU', grass: ['#6da457', '#47713a'], path: '#b8ab8a',
    water: ['#5f8fa8', '#7aa3b5'],
    deco: ['🌳', '🌫️', '🌴', '🌲', '🌳', '⛲', '🪑', '🌾', '🍂', '🐦',
      '🪨', '🍄', '🌲', '🌳', '🌫️', '🪑', '🍂', '🌴', '🐦', '⛲'],
    tint: 'rgba(80,90,110,.18)' },
  { nama: 'SENJA KELAM', grass: ['#9a8a4a', '#4d5a2a'], path: '#a8906a',
    water: ['#4a7a96', '#618d9f'],
    deco: ['🌳', '🍂', '🌴', '🌲', '🌳', '⛲', '🪑', '🥀', '🍂', '🦉',
      '🪨', '🍄', '🌲', '🌳', '🕯️', '🪑', '🍂', '🌴', '🦇', '⛲'],
    tint: 'rgba(140,60,30,.22)' },
  { nama: 'MALAM MENCEKAM', grass: ['#31473a', '#16241c'], path: '#4a4a55',
    water: ['#1e3346', '#2b4256'],
    deco: ['🌲', '🪦', '🌲', '🦇', '🕸️', '⛲', '🪦', '🥀', '🦉', '🕷️',
      '🪨', '💀', '🌲', '🕸️', '🪦', '🦇', '🥀', '🌲', '🦇', '🌫️'],
    tint: 'rgba(5,8,35,.42)', moon: '🌕', fog: 'rgba(200,200,220,.08)' },
  { nama: 'MALAM BERDARAH', grass: ['#3d2430', '#180c14'], path: '#553844',
    water: ['#3a1a24', '#4a2430'],
    deco: ['🌲', '⚰️', '💀', '🦇', '🕸️', '🔥', '🪦', '🥀', '💀', '🕷️',
      '🪦', '💀', '🌲', '🕸️', '⚰️', '🦇', '🔥', '🪦', '🦇', '🌑'],
    tint: 'rgba(60,0,10,.45)', moon: '🔴', fog: 'rgba(120,0,20,.12)' },
];

let bg = null;
function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  bg = drawPark(canvas.width, canvas.height, G.wave);
}
function drawPark(w, h, wave) {
  const t = THEMES[Math.min(Math.max(wave, 1), MAX_WAVE) - 1];
  const off = document.createElement('canvas');
  off.width = w; off.height = h;
  const c = off.getContext('2d');
  if (IMGS.background) {
    c.drawImage(IMGS.background, 0, 0, w, h);
    if (t.tint) { c.fillStyle = t.tint; c.fillRect(0, 0, w, h); }
    drawCredit(c, w, h);
    return off;
  }
  // rumput bergradasi
  const grad = c.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, t.grass[0]);
  grad.addColorStop(1, t.grass[1]);
  c.fillStyle = grad;
  c.fillRect(0, 0, w, h);
  // petak rumput lebih gelap (variasi tekstur)
  c.fillStyle = 'rgba(0,80,0,.07)';
  for (let i = 0; i < 14; i++) {
    const x = ((i * 173 + 37) % 100) / 100 * w;
    const y = ((i * 97 + 53) % 100) / 100 * h;
    c.beginPath();
    c.ellipse(x, y, 60 + (i % 4) * 30, 30 + (i % 3) * 15, 0, 0, Math.PI * 2);
    c.fill();
  }
  // dua jalan setapak menyilang
  c.strokeStyle = t.path;
  c.lineWidth = 70;
  c.lineCap = 'round';
  c.beginPath();
  c.moveTo(-50, h * 0.7);
  c.bezierCurveTo(w * 0.3, h * 0.4, w * 0.6, h * 0.9, w + 50, h * 0.55);
  c.stroke();
  c.lineWidth = 45;
  c.beginPath();
  c.moveTo(w * 0.35, -30);
  c.bezierCurveTo(w * 0.45, h * 0.4, w * 0.25, h * 0.7, w * 0.4, h + 30);
  c.stroke();
  // kolam + air mancur
  c.fillStyle = t.water[0];
  c.beginPath(); c.ellipse(w * 0.8, h * 0.2, 95, 58, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = t.water[1];
  c.beginPath(); c.ellipse(w * 0.8, h * 0.2, 60, 35, 0, 0, Math.PI * 2); c.fill();
  // kolam kecil kedua
  c.fillStyle = t.water[0];
  c.beginPath(); c.ellipse(w * 0.12, h * 0.85, 65, 38, 0, 0, Math.PI * 2); c.fill();
  // dekorasi emoji (posisi deterministik)
  c.textBaseline = 'middle'; c.textAlign = 'center';
  const deco = t.deco;
  for (let i = 0; i < deco.length; i++) {
    const x = ((i * 137 + 61) % 100) / 100 * w;
    const y = ((i * 83 + 29) % 100) / 100 * h;
    c.font = `${34 + (i % 4) * 12}px serif`;
    c.fillText(deco[i], x, y);
  }
  // bebek di kolam (wave 3: kolam sunyi)
  if (!t.moon) {
    c.font = '24px serif';
    c.fillText('🦆', w * 0.82, h * 0.21);
  }
  // semburat tema (senja/malam) di atas segalanya
  if (t.tint) { c.fillStyle = t.tint; c.fillRect(0, 0, w, h); }
  // bulan + kabut malam
  if (t.moon) {
    c.font = '70px serif';
    c.fillText(t.moon, w * 0.9, h * 0.1);
    c.fillStyle = t.fog;
    for (let i = 0; i < 5; i++) {
      c.beginPath();
      c.ellipse(((i * 211 + 89) % 100) / 100 * w, h * (0.55 + i * 0.09), w * 0.35, 26, 0, 0, Math.PI * 2);
      c.fill();
    }
  }
  drawCredit(c, w, h);
  return off;
}
// marker kreator di pojok kanan-bawah peta
function drawCredit(c, w, h) {
  c.font = '14px sans-serif';
  c.textAlign = 'right';
  c.textBaseline = 'bottom';
  c.fillStyle = 'rgba(255,255,255,.55)';
  c.fillText('created by @rdwnilyas', w - 12, h - 10);
}
window.addEventListener('resize', resize);
// resize() awal dipanggil setelah G dideklarasikan (butuh G.wave)

// ---------- Audio (blip sederhana via WebAudio) ----------
let audioCtx = null;
function beep(freq, dur, type = 'square', vol = 0.15) {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const o = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  o.type = type; o.frequency.value = freq;
  g.gain.setValueAtTime(vol, audioCtx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
  o.connect(g).connect(audioCtx.destination);
  o.start(); o.stop(audioCtx.currentTime + dur);
}
function sfxSentil() { beep(880, 0.12); beep(1320, 0.1); }
function sfxSalah() { beep(140, 0.25, 'sawtooth'); }
function sfxInfeksi() { beep(330, 0.1, 'sawtooth', 0.12); setTimeout(() => beep(220, 0.18, 'sawtooth', 0.12), 90); }
function sfxWave() { beep(523, 0.12, 'triangle'); setTimeout(() => beep(659, 0.12, 'triangle'), 130); setTimeout(() => beep(784, 0.2, 'triangle'), 260); }
function sfxKalah() { beep(300, 0.3, 'sawtooth'); setTimeout(() => beep(220, 0.3, 'sawtooth'), 300); setTimeout(() => beep(150, 0.6, 'sawtooth'), 600); }

// ---------- Musik latar (sequencer WebAudio, loop, beda tiap wave) ----------
// mel/bass = 16 langkah not-1/8 (Hz, 0 = diam), makin tinggi wave makin mencekam.
const MUSIC = [
  { bpm: 132, type: 'triangle', // wave 1: ceria mayor
    mel: [523, 0, 659, 0, 784, 0, 659, 0, 880, 0, 784, 0, 659, 0, 587, 0],
    bass: [131, 0, 0, 0, 196, 0, 0, 0, 131, 0, 0, 0, 196, 0, 0, 0] },
  { bpm: 116, type: 'triangle', // wave 2: minor murung
    mel: [440, 0, 523, 0, 494, 0, 440, 0, 415, 0, 440, 0, 330, 0, 0, 0],
    bass: [110, 0, 0, 0, 165, 0, 0, 0, 110, 0, 0, 0, 155, 0, 0, 0] },
  { bpm: 104, type: 'sawtooth', // wave 3: senja suram
    mel: [330, 0, 392, 0, 370, 0, 330, 0, 294, 0, 311, 0, 247, 0, 0, 0],
    bass: [82, 0, 0, 0, 123, 0, 0, 0, 82, 0, 0, 0, 117, 0, 0, 0] },
  { bpm: 92, type: 'square', // wave 4: malam, jarang + tritone
    mel: [262, 0, 0, 0, 370, 0, 0, 0, 262, 0, 0, 0, 247, 0, 233, 0],
    bass: [65, 0, 0, 0, 0, 0, 92, 0, 65, 0, 0, 0, 0, 0, 62, 0] },
  { bpm: 150, type: 'sawtooth', // wave 5: cepat & disonan
    mel: [220, 233, 220, 0, 220, 233, 262, 0, 220, 233, 220, 0, 196, 0, 175, 0],
    bass: [55, 55, 0, 55, 55, 0, 55, 55, 58, 58, 0, 58, 58, 0, 62, 62] },
];
let musicTimer = null;
function playMusic(wave) {
  stopMusic();
  const m = MUSIC[Math.min(Math.max(wave, 1), MAX_WAVE) - 1];
  const stepDur = 60 / m.bpm / 2; // not 1/8
  let step = 0;
  musicTimer = setInterval(() => {
    const mel = m.mel[step % 16];
    if (mel) beep(mel, stepDur * 0.9, m.type, 0.04);
    const bass = m.bass[step % 16];
    if (bass) beep(bass, stepDur * 1.8, 'triangle', 0.07);
    step++;
  }, stepDur * 1000);
}
function stopMusic() {
  if (musicTimer) { clearInterval(musicTimer); musicTimer = null; }
}

// ---------- Entitas ----------
class Character {
  constructor(type, corrupt) {
    this.type = type;
    this.corrupt = corrupt;
    this.x = Math.random() * (canvas.width - 120) + 60;
    this.y = Math.random() * (canvas.height - 120) + 60;
    this.speed = 40 + Math.random() * 40;
    this.dir = Math.random() * Math.PI * 2;
    this.turnTimer = 0;
    this.bob = Math.random() * Math.PI * 2; // animasi jalan
  }
  update(dt, speedMul) {
    this.turnTimer -= dt;
    if (this.turnTimer <= 0) {
      this.dir += (Math.random() - 0.5) * 2.2;
      this.turnTimer = 1 + Math.random() * 2.5;
    }
    const s = this.speed * speedMul * (this.corrupt ? 1.25 : 1);
    this.x += Math.cos(this.dir) * s * dt;
    this.y += Math.sin(this.dir) * s * dt;
    // pantul di tepi arena
    const m = CHAR_SIZE / 2;
    if (this.x < m) { this.x = m; this.dir = Math.PI - this.dir; }
    if (this.x > canvas.width - m) { this.x = canvas.width - m; this.dir = Math.PI - this.dir; }
    if (this.y < m) { this.y = m; this.dir = -this.dir; }
    if (this.y > canvas.height - m) { this.y = canvas.height - m; this.dir = -this.dir; }
    this.bob += dt * 10;
  }
  draw(c) {
    const bobY = Math.sin(this.bob) * 3;
    const key = this.corrupt ? `${this.type}_koruptor` : this.type;
    const img = IMGS[key];
    // bayangan
    c.fillStyle = 'rgba(0,0,0,.25)';
    c.beginPath();
    c.ellipse(this.x, this.y + CHAR_SIZE / 2 - 4, CHAR_SIZE * 0.32, 8, 0, 0, Math.PI * 2);
    c.fill();
    if (img) {
      const flip = Math.cos(this.dir) < 0;
      c.save();
      c.translate(this.x, this.y + bobY);
      if (flip) c.scale(-1, 1);
      c.drawImage(img, -CHAR_SIZE / 2, -CHAR_SIZE / 2, CHAR_SIZE, CHAR_SIZE);
      c.restore();
    } else {
      c.textAlign = 'center'; c.textBaseline = 'middle';
      c.font = `${CHAR_SIZE - 10}px serif`;
      c.fillText(EMOJI[this.type], this.x, this.y + bobY);
      if (this.corrupt) {
        c.font = `${CHAR_SIZE * 0.5}px serif`;
        c.fillText('💰', this.x + CHAR_SIZE * 0.35, this.y + bobY + CHAR_SIZE * 0.2);
      }
    }
    if (this.corrupt) { // tanda seru merah besar biar jelas
      c.font = 'bold 38px sans-serif';
      c.textAlign = 'center';
      c.strokeStyle = '#fff';
      c.lineWidth = 5;
      c.strokeText('!', this.x, this.y + bobY - CHAR_SIZE * 0.75);
      c.fillStyle = '#e53935';
      c.fillText('!', this.x, this.y + bobY - CHAR_SIZE * 0.75);
    }
  }
}

class Particle {
  constructor(x, y, emoji) {
    this.x = x; this.y = y;
    this.vx = (Math.random() - 0.5) * 260;
    this.vy = -Math.random() * 220 - 60;
    this.life = 0.8;
    this.emoji = emoji;
  }
  update(dt) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.vy += 500 * dt;
    this.life -= dt;
  }
  draw(c) {
    c.globalAlpha = Math.max(this.life / 0.8, 0);
    c.font = '26px serif';
    c.textAlign = 'center';
    c.fillText(this.emoji, this.x, this.y);
    c.globalAlpha = 1;
  }
}

// ---------- State game & sistem wave ----------
const G = {
  running: false,
  chars: [],
  particles: [],
  score: 0,
  lives: 3,
  time: 0,
  wave: 0,
  waveState: 'idle',   // 'banner' | 'playing'
  waveTimer: 0,
  koruptorsSpawned: false,
};
resize();

function startGame() {
  G.running = true;
  G.chars = [];
  G.particles = [];
  G.score = 0;
  G.lives = 3;
  G.time = 0;
  G.wave = 0;
  overlay.classList.add('hidden');
  nextWave();
  if (!camStarted) initCamera();
}

function nextWave() {
  G.wave++;
  G.waveState = 'banner';
  G.waveTimer = 2;
  G.koruptorsSpawned = false;
  bg = drawPark(canvas.width, canvas.height, G.wave); // peta baru tiap wave
  // tambah warga bersih baru (yang selamat dari wave lalu tetap ada)
  const nBaru = 4 + G.wave * 2;
  for (let i = 0; i < nBaru && G.chars.length < 60; i++) {
    G.chars.push(new Character(TYPES[Math.floor(Math.random() * 3)], false));
  }
  waveBanner.textContent = `🌊 WAVE ${G.wave} — ${THEMES[G.wave - 1].nama}`;
  waveBanner.hidden = false;
  sfxWave();
  playMusic(G.wave);
}

function updateWave(dt) {
  if (G.waveState === 'banner') {
    G.waveTimer -= dt;
    if (G.waveTimer <= 0) {
      waveBanner.hidden = true;
      G.waveState = 'playing';
      // lepas koruptor: pengusaha korup, makin tinggi wave makin banyak
      const nKoruptor = G.wave; // wave 1→1, 2→2, 3→3
      for (let i = 0; i < nKoruptor; i++) {
        G.chars.push(new Character('pengusaha', true));
      }
      G.koruptorsSpawned = true;
      beep(200, 0.3, 'sawtooth', 0.1); // koruptor masuk!
    }
    return;
  }
  if (G.waveState === 'cleared') {
    G.waveTimer -= dt;
    if (G.waveTimer <= 0) {
      if (G.wave >= MAX_WAVE) {
        gameOver('🏆 <b>TAMAN BERSIH DARI KORUPSI!</b><br>Kelima wave berhasil kamu bersihkan. Kamu MENANG!', true);
      } else {
        nextWave();
      }
    }
    return;
  }
  // wave selesai jika semua koruptor sudah disentil
  if (G.waveState === 'playing' && G.koruptorsSpawned && !G.chars.some(c => c.corrupt)) {
    waveBanner.textContent = `✅ WAVE ${G.wave} BERSIH!`;
    waveBanner.hidden = false;
    G.waveState = 'cleared';
    G.waveTimer = 1.5;
    sfxWave();
  }
}

function gameOver(msg, menang) {
  G.running = false;
  G.waveState = 'idle';
  waveBanner.hidden = true;
  stopMusic();
  panelText.innerHTML = msg;
  panelScore.hidden = false;
  panelScore.textContent = `Skor: ${G.score} koruptor dicubit — sampai Wave ${G.wave} — waktu ${fmtTime(G.time)}`;
  btnStart.textContent = 'Main Lagi';
  overlay.classList.remove('hidden');
  if (menang) sfxWave(); else sfxKalah();
}

function fmtTime(t) {
  const m = Math.floor(t / 60), s = Math.floor(t % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

// ---------- Kursor jari & sentilan ----------
const cursor = { x: -100, y: -100, tx: -100, ty: -100, visible: false, flick: 0 };
let flashRed = 0;

function doFlick() {
  if (!G.running) return;
  cursor.flick = 0.18; // animasi
  let hitAny = false;
  for (let i = G.chars.length - 1; i >= 0; i--) {
    const ch = G.chars[i];
    const d = Math.hypot(ch.x - cursor.x, ch.y - cursor.y);
    if (d < HIT_RADIUS) {
      hitAny = true;
      if (ch.corrupt) {
        G.chars.splice(i, 1);
        G.score++;
        for (let p = 0; p < 6; p++) G.particles.push(new Particle(ch.x, ch.y, ['💥', '💸', '⭐'][p % 3]));
        sfxSentil();
      } else {
        // salah sentil warga bersih: nyawa berkurang
        G.lives--;
        flashRed = 0.25;
        sfxSalah();
        if (G.lives <= 0) gameOver('💔 <b>NYAWA HABIS!</b><br>Terlalu banyak salah cubit aparat bersih...');
      }
      break; // satu sentilan = satu target
    }
  }
  if (!hitAny) beep(440, 0.06, 'triangle', 0.08); // sentil angin
}

// Fallback mouse (untuk testing tanpa kamera)
canvas.addEventListener('mousemove', e => {
  if (handActive) return; // deteksi tangan lebih prioritas
  cursor.tx = e.clientX; cursor.ty = e.clientY; cursor.visible = true;
});
canvas.addEventListener('mousedown', () => { if (!handActive) doFlick(); });

// ---------- MediaPipe Hands ----------
let camStarted = false;
let handActive = false;
let handLostTimer = 0;
let pinchArmed = false;

function initCamera() {
  camStarted = true;
  if (typeof Hands === 'undefined') {
    document.getElementById('cam-status').textContent = 'MediaPipe gagal dimuat — pakai mouse';
    return;
  }
  const hands = new Hands({
    locateFile: f => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${f}`,
  });
  hands.setOptions({
    maxNumHands: 1,
    modelComplexity: 0,
    minDetectionConfidence: 0.6,
    minTrackingConfidence: 0.5,
  });
  hands.onResults(onHands);
  const cam = new Camera(video, {
    onFrame: async () => { await hands.send({ image: video }); },
    width: 320,
    height: 240,
  });
  cam.start().then(() => camBox.classList.add('on'))
    .catch(() => { document.getElementById('cam-status').textContent = 'Kamera ditolak — pakai mouse'; });
}

function onHands(res) {
  // sinkronkan ukuran overlay dengan video
  if (camOverlay.width !== video.videoWidth && video.videoWidth) {
    camOverlay.width = video.videoWidth;
    camOverlay.height = video.videoHeight;
  }
  camCtx.clearRect(0, 0, camOverlay.width, camOverlay.height);

  if (!res.multiHandLandmarks || !res.multiHandLandmarks.length) {
    handLostTimer++;
    if (handLostTimer > 15) handActive = false;
    return;
  }
  handLostTimer = 0;
  handActive = true;
  cursor.visible = true;
  const lm = res.multiHandLandmarks[0];

  // ---- gerakan: telunjuk (8) → posisi kursor arena, mirror horizontal ----
  cursor.tx = (1 - lm[8].x) * canvas.width;
  cursor.ty = lm[8].y * canvas.height;

  // ---- deteksi sentil: jarak jempol(4)-telunjuk(8) dinormalisasi telapak ----
  const pinch = Math.hypot(lm[4].x - lm[8].x, lm[4].y - lm[8].y);
  const palm = Math.hypot(lm[0].x - lm[9].x, lm[0].y - lm[9].y) || 1e-6;
  const ratio = pinch / palm;
  if (ratio < 0.35 && !pinchArmed) {
    pinchArmed = true;
    doFlick(); // cubit = langsung sentil objek dalam lingkaran
  } else if (ratio > 0.6) {
    pinchArmed = false; // harus lepas dulu sebelum bisa sentil lagi
  }

  // ---- marker tangan di kamera kecil ----
  if (typeof drawConnectors !== 'undefined') {
    drawConnectors(camCtx, lm, HAND_CONNECTIONS, { color: '#00e676', lineWidth: 2 });
    drawLandmarks(camCtx, lm, { color: '#ffffff', lineWidth: 1, radius: 2.5 });
  }
  // jempol & telunjuk ditonjolkan; merah saat mencubit (armed)
  const w = camOverlay.width, h = camOverlay.height;
  camCtx.strokeStyle = pinchArmed ? '#ff1744' : '#ffd24d';
  camCtx.lineWidth = 3;
  camCtx.beginPath();
  camCtx.moveTo(lm[4].x * w, lm[4].y * h);
  camCtx.lineTo(lm[8].x * w, lm[8].y * h);
  camCtx.stroke();
  camCtx.fillStyle = pinchArmed ? '#ff1744' : '#ffd24d';
  for (const i of [4, 8]) {
    camCtx.beginPath();
    camCtx.arc(lm[i].x * w, lm[i].y * h, 6, 0, Math.PI * 2);
    camCtx.fill();
  }
}

// ---------- Infeksi (kolisi antar karakter) ----------
function updateInfection() {
  const r = CHAR_SIZE * 0.55;
  for (const a of G.chars) {
    if (!a.corrupt) continue;
    for (const b of G.chars) {
      if (b.corrupt) continue;
      if (Math.hypot(a.x - b.x, a.y - b.y) < r) {
        b.corrupt = true;
        b.dir = Math.random() * Math.PI * 2;
        G.particles.push(new Particle(b.x, b.y - 20, '💰'));
        sfxInfeksi();
      }
    }
  }
}

// ---------- Loop utama ----------
let lastT = performance.now();
function loop(now) {
  const dt = Math.min((now - lastT) / 1000, 0.05);
  lastT = now;

  if (G.running) {
    G.time += dt;
    updateWave(dt);
    const speedMul = 1 + (G.wave - 1) * 0.25 + G.time / 240; // makin lama makin cepat
    for (const ch of G.chars) ch.update(dt, speedMul);
    updateInfection();
    const nKorup = G.chars.filter(c => c.corrupt).length;
    elWave.textContent = `Wave ${G.wave}/${MAX_WAVE}`;
    elScore.textContent = `Skor: ${G.score}`;
    elWaktu.textContent = fmtTime(G.time);
    elKorup.textContent = `Koruptor: ${nKorup}`;
    elNyawa.textContent = '❤️'.repeat(G.lives) + '🖤'.repeat(3 - G.lives);
    // kalah: SEMUA karakter sudah jadi koruptor
    if (G.chars.length > 0 && nKorup === G.chars.length) {
      gameOver('💥 <b>SEMUA APARAT JADI KORUPTOR!</b><br>Korupsi menguasai taman...');
    }
  }

  for (let i = G.particles.length - 1; i >= 0; i--) {
    G.particles[i].update(dt);
    if (G.particles[i].life <= 0) G.particles.splice(i, 1);
  }

  // kursor mengejar target (halus)
  cursor.x += (cursor.tx - cursor.x) * Math.min(dt * 14, 1);
  cursor.y += (cursor.ty - cursor.y) * Math.min(dt * 14, 1);
  if (cursor.flick > 0) cursor.flick -= dt;
  if (flashRed > 0) flashRed -= dt;

  render();
  requestAnimationFrame(loop);
}

function render() {
  ctx.drawImage(bg, 0, 0);
  // gambar karakter urut Y biar depan-belakang benar
  const sorted = [...G.chars].sort((a, b) => a.y - b.y);
  for (const ch of sorted) ch.draw(ctx);
  for (const p of G.particles) p.draw(ctx);

  if (flashRed > 0) {
    ctx.fillStyle = `rgba(229,57,53,${flashRed * 1.2})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  // kursor jari
  if (cursor.visible) {
    const scale = cursor.flick > 0 ? 1.5 : 1;
    ctx.strokeStyle = cursor.flick > 0 ? '#ffd24d' : 'rgba(255,255,255,.55)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cursor.x, cursor.y, HIT_RADIUS * (cursor.flick > 0 ? 1.15 : 1), 0, Math.PI * 2);
    ctx.stroke();
    // pose cubit saat jempol+telunjuk menutup (tangan) atau saat animasi sentil (mouse)
    const mencubit = pinchArmed || cursor.flick > 0;
    const img = (mencubit && IMGS.jari_cubit) || IMGS.jari;
    if (img) {
      const s = 90 * scale;
      const ar = img.width / img.height;
      ctx.drawImage(img, cursor.x - (s * ar) / 2, cursor.y - s / 2, s * ar, s);
    } else {
      ctx.font = `${56 * scale}px serif`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('🫰', cursor.x, cursor.y);
    }
  }
}

btnStart.addEventListener('click', startGame);
requestAnimationFrame(loop);
