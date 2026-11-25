// orders.js — papan pesanan: membuat tiket pelanggan, menua kesabaran,
// dan menilai mangkok yang disajikan terhadap tiket.

import { BROTHS, LEVELS, TOPPINGS, priceOf } from './recipes.js';

let nextTicketId = 1;

// Tiket baru: satu kuah, satu tingkat kematangan, 1–3 topping acak.
// `heat` (0..1) menaikkan peluang tiket ganda topping dan kesabaran pendek.
export function spawnTicket(rng, heat) {
  const broth = BROTHS[Math.floor(rng() * BROTHS.length)].id;
  const level = LEVELS[Math.floor(rng() * LEVELS.length)].id;
  const pool = TOPPINGS.map((t) => t.id);
  const count = 1 + (rng() < 0.45 + heat * 0.3 ? 1 : 0) + (rng() < 0.18 + heat * 0.25 ? 1 : 0);
  const toppings = [];
  for (let i = 0; i < count && pool.length > 0; i++) {
    const pick = Math.floor(rng() * pool.length);
    toppings.push(pool.splice(pick, 1)[0]);
  }
  const patienceMax = Math.round(46 - heat * 16 + rng() * 10);
  const ticket = {
    id: nextTicketId++,
    broth,
    level,
    toppings,
    patience: patienceMax,
    patienceMax,
    price: 0,
  };
  ticket.price = priceOf(ticket);
  return ticket;
}

// Kurangi kesabaran semua tiket; kembalikan daftar tiket yang hangus.
export function ageTickets(tickets, dt) {
  const expired = [];
  for (const t of tickets) {
    t.patience -= dt;
    if (t.patience <= 0) expired.push(t);
  }
  return expired;
}

function sameSet(a, b) {
  if (a.length !== b.length) return false;
  const s = new Set(a);
  return b.every((x) => s.has(x));
}

function levelDistance(a, b) {
  const order = ['mentah', 'katame', 'futsuu', 'yawame', 'gosong'];
  return Math.abs(order.indexOf(a) - order.indexOf(b));
}

// Nilai mangkok terhadap satu tiket: 'exact' | 'near' | null.
// exact = kuah, kematangan, dan topping semua sama persis.
// near  = kuah + topping sama, kematangan meleset satu tingkat.
export function judgeBowl(bowl, ticket) {
  if (!bowl.noodle || !bowl.broth) return null;
  if (bowl.broth !== ticket.broth) return null;
  if (!sameSet(bowl.toppings, ticket.toppings)) return null;
  if (bowl.noodle.level === ticket.level) return 'exact';
  if (levelDistance(bowl.noodle.level, ticket.level) === 1) return 'near';
  return null;
}

// Cari tiket terbaik untuk mangkok ini: exact didahulukan dari near.
export function findServeTarget(tickets, bowl) {
  let nearHit = null;
  for (const t of tickets) {
    const verdict = judgeBowl(bowl, t);
    if (verdict === 'exact') return { ticket: t, verdict };
    if (verdict === 'near' && !nearHit) nearHit = { ticket: t, verdict };
  }
  return nearHit;
}
