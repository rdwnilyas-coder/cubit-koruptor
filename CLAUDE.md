# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Sentil Koruptor

Game HTML5 berbasis deteksi tangan (MediaPipe Hands via CDN). Pemain menggerakkan
telunjuk di depan webcam untuk mengarahkan kursor jari, lalu menyentil (cubit
jempol+telunjuk, lepas cepat) para koruptor yang berkeliaran di taman.

## Menjalankan

Butuh server lokal (kamera perlu `localhost` atau HTTPS):

```bash
python3 -m http.server 8765
# buka http://localhost:8765
```

Tanpa kamera, game tetap bisa dites: gerakkan mouse + klik = sentil.

## Struktur

- `index.html` — layout: canvas game, preview kamera kecil (kanan atas), HUD, overlay menu.
- `style.css` — semua styling.
- `game.js` — seluruh engine dalam satu file: asset loader, background taman, entitas, wave, MediaPipe, audio.
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
- Sistem **wave**: tiap wave menambah 4+2×wave aparat bersih, lalu melepas 1+wave/2 **pengusaha korup** (👨‍💼, koruptor awal — semua aparat mulai bersih).
- Koruptor menular: kolisi koruptor ↔ warga bersih → warga ikut korup (ada SFX + partikel 💰).
- Sentil koruptor = +1 skor; salah sentil warga bersih = −1 nyawa + flash merah.
- Nyawa 3 (❤️ di HUD). Wave bersih (semua koruptor disentil) → lanjut wave berikutnya, makin cepat.
- **Kalah** jika nyawa habis ATAU semua karakter menjadi koruptor.

## Deteksi tangan (game.js)

- MediaPipe Hands, `maxNumHands:1`, `modelComplexity:0` (kecepatan > akurasi).
- Kursor = landmark 8 (ujung telunjuk), di-mirror horizontal, di-lerp biar halus.
- Sentil = rasio jarak jempol(4)–telunjuk(8) dibagi ukuran telapak (0–9):
  turun < 0.35 → `doFlick()` langsung; harus naik > 0.6 dulu sebelum bisa sentil lagi.
- Marker tangan digambar di canvas `#cam-overlay` di atas preview video
  (skeleton hijau, garis jempol–telunjuk kuning, merah saat armed).

## Konstanta tuning (atas game.js)

- `CHAR_SIZE` (64) — ukuran karakter.
- `HIT_RADIUS` (70) — radius sentilan.
- Ambang pinch 0.35 (sentil) / 0.6 (reset) — di `onHands()`.
- Kecepatan wave: `speedMul` di `loop()`.
