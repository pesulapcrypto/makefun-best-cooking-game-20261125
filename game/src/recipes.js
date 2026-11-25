// recipes.js — data menu Kedai Mie Malam: kuah, tingkat kematangan mie,
// topping, harga. Semua angka permainan tinggal di sini supaya modul lain
// tinggal membaca.

export const BROTHS = [
  { id: 'shoyu', name: 'Shoyu', color: '#8a5427', light: '#c07f3d' },
  { id: 'miso', name: 'Miso', color: '#c07f24', light: '#eda83e' },
  { id: 'pedas', name: 'Pedas', color: '#b3321f', light: '#e8572f' },
];

export const LEVELS = [
  { id: 'katame', name: 'Katame', desc: 'mie keras', from: 0.3, to: 0.55 },
  { id: 'futsuu', name: 'Futsuu', desc: 'mie sedang', from: 0.55, to: 0.8 },
  { id: 'yawame', name: 'Yawame', desc: 'mie lembek', from: 0.8, to: 1.05 },
];

export const TOPPINGS = [
  { id: 'telur', name: 'Telur Ajitama', short: 'TELUR', color: '#f2b33d', price: 3000 },
  { id: 'chashu', name: 'Chashu', short: 'CHASHU', color: '#d08a63', price: 5000 },
  { id: 'nori', name: 'Nori', short: 'NORI', color: '#275c43', price: 2000 },
  { id: 'bawang', name: 'Daun Bawang', short: 'BAWANG', color: '#58b368', price: 1500 },
  { id: 'jagung', name: 'Jagung', short: 'JAGUNG', color: '#ffd94d', price: 2000 },
];

export const BASE_PRICE = 18000;
export const TIP_MAX = 6000;
export const BOIL_SECONDS = 7;

export function brothById(id) {
  return BROTHS.find((b) => b.id === id) || BROTHS[0];
}

export function toppingById(id) {
  return TOPPINGS.find((t) => t.id === id) || TOPPINGS[0];
}

// Tingkat kematangan dari kemajuan rebusan 0..1.25.
// Di bawah zona katame mie masih mentah; di atas yawame mie gosong.
export function levelAt(pct) {
  if (pct >= 1.18) return 'gosong';
  for (const lv of LEVELS) {
    if (pct >= lv.from && pct < lv.to) return lv.id;
  }
  if (pct >= LEVELS[2].to) return 'yawame';
  return 'mentah';
}

export function levelName(id) {
  if (id === 'mentah') return 'Mentah';
  if (id === 'gosong') return 'Gosong';
  const lv = LEVELS.find((l) => l.id === id);
  return lv ? lv.name : id;
}

// Harga tiket: harga dasar + semua topping di tiket.
export function priceOf(ticket) {
  let total = BASE_PRICE;
  for (const id of ticket.toppings) total += toppingById(id).price;
  return total;
}
