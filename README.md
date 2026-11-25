# Ramen Rush — Kedai Mie Malam

[![make.fun bounty](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137)
![rank](https://make.fun/badge/best-cooking-game-20261125-0137/pesulapcrypto/makefun-best-cooking-game-20261125/rank.svg)
![reward](https://make.fun/badge/best-cooking-game-20261125-0137/pesulapcrypto/makefun-best-cooking-game-20261125/reward.svg)

Bounty: https://make.fun/bounty/best-cooking-game-20261125-0137

Game masak kedai ramen malam bergaya neon. Kamu menjalankan shift malam
sendirian: tiket pesanan berdatangan di papan, dan setiap tiket menuntut
kombinasi kuah (shoyu / miso / pedas), tingkat kematangan mie, dan topping
yang persis.

## Cara main

1. **Rebus mie** — klik satu dari 4 keranjang rebusan (atau tombol Q/W/E/R).
   Setiap keranjang punya timer sendiri dengan bar zona warna.
2. **Angkat tepat waktu** — klik keranjang lagi untuk mengangkat mie:
   zona kuning = Katame (keras), hijau = Futsuu (sedang), oranye = Yawame
   (lembek). Terlalu cepat mie masih mentah; terlalu lama mie gosong.
3. **Tuang kuah** — klik tombol kuah (atau tombol 1–3).
4. **Susun topping** — klik bahan di meja: telur ajitama, chashu, nori,
   daun bawang, jagung (atau tombol 4–8). Klik lagi untuk melepas.
5. **Sajikan** — tombol SAJIKAN / Space. Mangkok yang persis sama dengan
   tiket dibayar penuh plus tip dari sisa kesabaran; kematangan meleset
   satu tingkat dibayar setengah; tidak ada tiket yang cocok = tidak
   bisa disajikan.

Perhatikan bar kesabaran tiap tiket — tiket yang hangus menjadi strike.
Tiga strike (atau jam shift habis) dan kedai tutup. Semakin malam,
pelanggan datang semakin cepat dan kesabaran mereka semakin pendek.

## Menjalankan

Buka `game/index.html` di browser (atau layani folder `game/` dengan
server statis apa pun). Tidak ada aset luar — semua gambar digambar
dengan kode canvas.

Mode screenshot deterministik untuk pratinjau adegan:
`?shot=cover|rush|serve&seed=7`.
