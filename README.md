# 🤏 Cubit Koruptor

> Gerakkan telunjukmu di depan webcam, lalu **CUBIT** para koruptor yang berkeliaran di taman!

Game HTML5 berbasis **deteksi tangan** (MediaPipe Hands). Tanpa install, tanpa tombol —
tanganmu adalah kontrolernya.

### 🎮 [▶️ MAIN SEKARANG](https://rdwnilyas-coder.github.io/cubit-koruptor/)

*(Butuh webcam & izin kamera. Tanpa kamera? Tetap bisa main pakai mouse: gerak = arahkan, klik = cubit.)*

---

## 🧍 Para Karakter

### Aparat Bersih — JANGAN dicubit! (−1 nyawa 💔)

| <img src="assets/polisi.png" width="120"> | <img src="assets/tentara.png" width="120"> | <img src="assets/jaksa.png" width="120"> |
|:---:|:---:|:---:|
| **Polisi** 👮 | **Tentara** 💂 | **Jaksa** 🧑‍⚖️ |

### Koruptor — CUBIT semuanya! (+1 skor 💯)

Lihat karung uangnya 💰 — itu tanda mereka sudah tertular korupsi.

| <img src="assets/pengusaha_koruptor.png" width="120"> | <img src="assets/polisi_koruptor.png" width="120"> | <img src="assets/tentara_koruptor.png" width="120"> | <img src="assets/jaksa_koruptor.png" width="120"> |
|:---:|:---:|:---:|:---:|
| **Pengusaha Korup** 👨‍💼<br>*biang keroknya — koruptor awal tiap wave* | **Polisi Korup** | **Tentara Korup** | **Jaksa Korup** |

### Tanganmu

| <img src="assets/jari.png" width="120"> | <img src="assets/jari_cubit.png" width="120"> | <img src="assets/karung.png" width="120"> |
|:---:|:---:|:---:|
| **Siap cubit** — jempol & telunjuk terbuka | **CUBIT!** — jempol & telunjuk menutup | **Karung uang** — barang bukti 💰 |

---

## 📜 Aturan Main

- 🏞️ Aparat berjalan acak di taman. Tiap wave, **pengusaha korup** dilepas — dan korupsi **MENULAR**: koruptor yang menabrak warga bersih membuatnya ikut korup!
- 🤏 Cubit koruptor = **+1 skor**. Salah cubit warga bersih = **−1 nyawa** (dari 3 ❤️).
- 🌗 Ada **5 wave**, petanya makin mencekam: taman cerah → mendung → senja → malam mencekam → malam berdarah. Musiknya pun makin gelap tiap wave 🎵.
- 🏆 **Menang:** bersihkan kelima wave. **Kalah:** nyawa habis, atau semua karakter keburu jadi koruptor.

## 🖥️ Jalankan Lokal

Kamera butuh `localhost` atau HTTPS:

```bash
python3 -m http.server 8765
# buka http://localhost:8765
```

## 🔧 Teknologi

- **MediaPipe Hands** (via CDN) — deteksi 21 titik tangan, kursor = ujung telunjuk.
- **Canvas 2D** — seluruh game digambar di kanvas, satu file `game.js`.
- **WebAudio** — SFX & musik latar di-sequence langsung dari kode, tanpa file audio.

---

*created by [@rdwnilyas](https://github.com/rdwnilyas-coder)* 🤏💰
