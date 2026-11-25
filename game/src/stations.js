// stations.js — stasiun rebusan: empat keranjang mie di dalam panci besar.
// Setiap keranjang punya timer sendiri; pemain mengangkatnya tepat waktu.

import { BOIL_SECONDS, levelAt } from './recipes.js';

export const BASKET_COUNT = 4;

export function createBaskets() {
  const baskets = [];
  for (let i = 0; i < BASKET_COUNT; i++) {
    baskets.push({ pct: null }); // null = keranjang kosong
  }
  return baskets;
}

// Masukkan mie mentah ke keranjang kosong. true bila berhasil.
export function startBasket(basket) {
  if (basket.pct !== null) return false;
  basket.pct = 0;
  return true;
}

// Jalankan semua timer rebusan.
export function stepBaskets(baskets, dt) {
  for (const b of baskets) {
    if (b.pct !== null && b.pct < 1.3) b.pct += dt / BOIL_SECONDS;
  }
}

// Angkat keranjang: kembalikan hasil mie {level, pct} lalu kosongkan.
export function liftBasket(basket) {
  if (basket.pct === null) return null;
  const pct = basket.pct;
  basket.pct = null;
  return { level: levelAt(pct), pct };
}
