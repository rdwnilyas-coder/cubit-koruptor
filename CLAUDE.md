# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Cubit Koruptor

Game HTML5 berbasis deteksi tangan (MediaPipe Hands via CDN). Pemain menggerakkan
telunjuk di depan webcam untuk mengarahkan kursor jari, lalu mencubit (jempol+telunjuk
menutup) para koruptor yang berkeliaran di taman. Kredit "created by @rdwnilyas"
digambar di pojok peta (`drawCredit`) dan di panel menu.

## Menjalankan

Butuh server lokal (kamera perlu `localhost` atau HTTPS):

```bash
python3 -m http.server 8765
# buka http://localhost:8765
```

Tanpa kamera, game tetap bisa dites: gerakkan mouse + klik = cubit.

## Struktur

- `index.html` — layout: sidebar kiri (preview kamera di atas, HUD vertikal di bawahnya) + canvas game di kanan, overlay menu.
- `style.css` — semua styling.
- `game.js` — seluruh engine dalam satu file: asset loader, tema peta per wave, entitas, wave, MediaPipe, SFX + musik latar (WebAudio, tanpa file audio).
- `assets/` — gambar PNG opsional (transparan). Kalau tidak ada, game pakai emoji sebagai placeholder.

## Aset yang diharapkan di `assets/`

| File | Isi |
|---|---|
| `polisi.png`, `tentara.png`, `jaksa.png` | karakter bersih |
| `polisi_koruptor.png`, `tentara_koruptor.png`, `jaksa_koruptor.png` | varian bawa karung uang (tertular) |
| `pengusaha_koruptor.png` | pengusaha korup bawa karung uang — koruptor awal tiap wave |
| `jari.png` | kursor tangan, pose jempol+telunjuk terbuka (siap cubit) |
| `jari_cubit.png` | kursor tangan saat mencubit (jempol+telunjuk menutup) |
| `karung.png` | karung uang (belum dipakai engine, cadangan) |
| `background.png` | opsional, mengganti taman yang digambar kanvas |

Loader di atas `game.js` (`IMG_NAMES`) mencoba memuat semuanya; yang gagal
otomatis fallback ke emoji — tidak perlu ubah kode saat menambah aset, cukup
taruh file dengan nama yang benar.

## Aturan main

- Karakter (polisi 👮, tentara 💂, jaksa 🧑‍⚖️) berjalan acak di taman, memantul di tepi.
- Hanya **5 wave** (`MAX_WAVE`), tiap wave petanya beda & makin mencekam (`THEMES`):
  taman cerah → mendung kelabu → senja kelam → malam mencekam → malam berdarah.
  Bersihkan kelimanya = **menang**.
- Musik latar loop per wave (`MUSIC`, sequencer WebAudio 16 langkah): makin tinggi
  wave makin gelap/disonan. `playMusic()` di `nextWave()`, `stopMusic()` di `gameOver()`.
- Tiap wave menambah 4+2×wave aparat bersih, lalu melepas sejumlah-wave **pengusaha korup** (👨‍💼, koruptor awal — semua aparat mulai bersih).
- Koruptor menular: kolisi koruptor ↔ warga bersih → warga ikut korup (ada SFX + partikel 💰).
- Cubit koruptor = +1 skor; salah cubit warga bersih = −1 nyawa + flash merah.
- Nyawa 3 (❤️ di HUD). Wave bersih (semua koruptor dicubit) → lanjut wave berikutnya, makin cepat.
- **Kalah** jika nyawa habis ATAU semua karakter menjadi koruptor.

## Deteksi tangan (game.js)

- MediaPipe Hands, `maxNumHands:1`, `modelComplexity:0` (kecepatan > akurasi).
- Kursor = landmark 8 (ujung telunjuk), di-mirror horizontal, di-lerp biar halus.
- Cubit = rasio jarak jempol(4)–telunjuk(8) dibagi ukuran telapak (0–9):
  turun < 0.35 → `doFlick()` langsung; harus naik > 0.6 dulu sebelum bisa cubit lagi.
- Marker tangan digambar di canvas `#cam-overlay` di atas preview video
  (skeleton hijau, garis jempol–telunjuk kuning, merah saat armed).

## Konstanta tuning (atas game.js)

- `CHAR_SIZE` (64) — ukuran karakter.
- `HIT_RADIUS` (70) — radius cubitan.
- `MAX_WAVE` (5) dan `THEMES` — jumlah wave + tema peta per wave (warna & dekorasi).
- `MUSIC` — melodi/bass 16 langkah per wave (Hz, 0 = diam) + bpm + jenis osilator.
- Ambang pinch 0.35 (cubit) / 0.6 (reset) — di `onHands()`.
- Kecepatan wave: `speedMul` di `loop()`.
- Koruptor awal per wave = nomor wave (`nKoruptor = G.wave` di `updateWave()`).

## Status repo

- Remote: https://github.com/rdwnilyas-coder/cubit-koruptor (branch `main`).
- Live via GitHub Pages: https://rdwnilyas-coder.github.io/cubit-koruptor/ (auto-deploy tiap push ke `main`).
- Rename "Sentil" → "Cubit": commit awal & sebagian komentar masih pakai istilah "sentil"/`doFlick()`.
