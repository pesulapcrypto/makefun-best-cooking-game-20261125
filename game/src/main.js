// main.js — loop utama Ramen Rush: jam shift berjalan, tiket masuk,
// keranjang merebus, mangkok dirakit, disajikan, koin masuk.
// Mode screenshot: ?shot=cover|rush|serve&seed=N membekukan satu adegan
// tertata (semua unsur dapur terlihat) untuk lembar kontak juri.

import { TIP_MAX } from './recipes.js';
import { spawnTicket, ageTickets, findServeTarget } from './orders.js';
import { createBaskets, startBasket, stepBaskets, liftBasket } from './stations.js';
import { drawKitchen } from './render.js';
import { attachInput } from './input.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const SHIFT_SECONDS = 180;
const MAX_TICKETS = 4;

// RNG deterministik (mulberry32) supaya adegan screenshot stabil per seed.
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function freshState(rng) {
  return {
    phase: 'play',
    shot: null,
    clock: SHIFT_SECONDS,
    clockTotal: SHIFT_SECONDS,
    coins: 0,
    servedCount: 0,
    strikes: 0,
    tickets: [],
    baskets: createBaskets(),
    bowl: { noodle: null, broth: null, toppings: [] },
    pass: null,
    flash: '',
    flashColor: null,
    flashT: 0,
    elapsed: 0,
    nextTicketIn: 0,
    selected: 0,
    rng,
  };
}

const params = new URLSearchParams(location.search);
const shotKind = params.get('shot');
const seed = Number(params.get('seed') || 7);
const rng = mulberry32(seed * 1000 + 17);
let state = freshState(rng);

function flash(msg, color, seconds = 2.2) {
  state.flash = msg;
  state.flashColor = color;
  state.flashT = seconds;
}

function heat() {
  return 1 - state.clock / state.clockTotal; // 0 di awal shift → 1 di akhir
}

function maybeSpawn(dt) {
  state.nextTicketIn -= dt;
  if (state.nextTicketIn > 0) return;
  if (state.tickets.length < MAX_TICKETS) {
    state.tickets.push(spawnTicket(state.rng, heat()));
  }
  // jeda antar pelanggan menyusut seiring shift berjalan — akhir shift
  // terasa paling menekan: tiket baru datang hampir dua kali lebih cepat.
  state.nextTicketIn = 6.8 - heat() * 3.8 + state.rng() * 2.2;
}

const actions = {
  basket(i) {
    const basket = state.baskets[i];
    if (basket.pct === null) {
      startBasket(basket);
      flash(`Keranjang ${i + 1}: mie masuk! Pantau zona warnanya.`, '#ffb020', 1.4);
      return;
    }
    if (state.bowl.noodle) {
      flash('Mangkok sudah berisi mie — sajikan atau buang dulu.', '#ff4757');
      return;
    }
    const noodle = liftBasket(basket);
    state.bowl.noodle = noodle;
    if (noodle.level === 'gosong') flash('Mie GOSONG! Tetap bisa disajikan, tapi nilainya jatuh.', '#ff4757');
    else if (noodle.level === 'mentah') flash('Mie masih MENTAH — keranjang diangkat terlalu cepat!', '#ff4757');
    else flash(`Mie terangkat: ${noodle.level.toUpperCase()}! Tuang kuah + topping.`, '#3ddc84', 1.6);
  },
  broth(id) {
    if (!state.bowl.noodle) {
      flash('Angkat mie dari keranjang dulu sebelum menuang kuah.', '#ff4757');
      return;
    }
    state.bowl.broth = id;
  },
  topping(id) {
    if (!state.bowl.noodle) {
      flash('Belum ada mie di mangkok — rebus dulu di keranjang.', '#ff4757');
      return;
    }
    const idx = state.bowl.toppings.indexOf(id);
    if (idx >= 0) state.bowl.toppings.splice(idx, 1);
    else state.bowl.toppings.push(id);
  },
  ticket(i) {
    state.selected = i;
  },
  trash() {
    state.bowl = { noodle: null, broth: null, toppings: [] };
    flash('Mangkok dikosongkan.', '#8fa3c8', 1.2);
  },
  serve() {
    if (!state.bowl.noodle || !state.bowl.broth) {
      flash('Mangkok belum lengkap: perlu mie + kuah.', '#ff4757');
      return;
    }
    const hit = findServeTarget(state.tickets, state.bowl);
    if (!hit) {
      flash('Tidak ada tiket yang cocok dengan mangkok ini!', '#ff4757');
      return;
    }
    const { ticket, verdict } = hit;
    const tip = Math.round((ticket.patience / ticket.patienceMax) * TIP_MAX);
    const pay = verdict === 'exact' ? ticket.price + tip : Math.round(ticket.price / 2);
    state.coins += pay;
    state.servedCount += 1;
    state.pass = {
      broth: state.bowl.broth,
      toppings: [...state.bowl.toppings],
      level: state.bowl.noodle.level,
    };
    state.tickets = state.tickets.filter((t) => t !== ticket);
    if (state.selected >= state.tickets.length) state.selected = 0;
    state.bowl = { noodle: null, broth: null, toppings: [] };
    flash(
      verdict === 'exact'
        ? `SEMPURNA! +Rp${pay.toLocaleString('id-ID')} (termasuk tip Rp${tip.toLocaleString('id-ID')})`
        : `Kematangan meleset satu tingkat — dibayar setengah: +Rp${pay.toLocaleString('id-ID')}`,
      verdict === 'exact' ? '#3ddc84' : '#ffb020',
      2.6,
    );
  },
  restart() {
    const keepRng = state.rng;
    state = freshState(keepRng);
    state.tickets.push(spawnTicket(state.rng, 0));
  },
};

// ---------- adegan screenshot deterministik ----------
function buildShotScene(kind) {
  const r = mulberry32(seed * 977 + kind.length * 131);
  const s = freshState(r);
  s.shot = kind;
  const mk = (broth, level, toppings, patienceFrac) => {
    const t = spawnTicket(r, 0.4);
    t.broth = broth; t.level = level; t.toppings = toppings;
    t.patience = Math.round(t.patienceMax * patienceFrac);
    return t;
  };
  // harga tiket dihitung ulang dari resep setelah diubah manual
  const reprice = (t) => {
    const prices = { telur: 3000, chashu: 5000, nori: 2000, bawang: 1500, jagung: 2000 };
    t.price = 18000 + t.toppings.reduce((sum, id) => sum + prices[id], 0);
  };
  if (kind === 'cover') {
    s.clock = 132; s.coins = 24500; s.servedCount = 3;
    s.tickets = [
      mk('shoyu', 'futsuu', ['telur', 'bawang'], 0.82),
      mk('miso', 'katame', ['chashu'], 0.64),
      mk('pedas', 'yawame', ['nori', 'jagung'], 0.47),
    ];
    s.baskets[0].pct = 0.68;
    s.baskets[2].pct = 0.35;
    s.bowl = { noodle: { level: 'futsuu', pct: 0.68 }, broth: 'shoyu', toppings: ['telur', 'bawang'] };
    s.pass = { broth: 'miso', toppings: ['chashu', 'nori'], level: 'katame' };
  } else if (kind === 'rush') {
    s.clock = 47; s.coins = 68500; s.servedCount = 9; s.strikes = 1; s.elapsed = 3.2;
    s.tickets = [
      mk('pedas', 'katame', ['telur', 'chashu', 'jagung'], 0.22),
      mk('shoyu', 'yawame', ['bawang'], 0.55),
      mk('miso', 'futsuu', ['nori', 'telur'], 0.71),
      mk('pedas', 'futsuu', ['chashu'], 0.9),
    ];
    s.baskets[0].pct = 0.2;
    s.baskets[1].pct = 0.55;
    s.baskets[2].pct = 0.85;
    s.baskets[3].pct = 1.1;
    s.bowl = { noodle: { level: 'katame', pct: 0.42 }, broth: null, toppings: ['telur'] };
    s.pass = { broth: 'shoyu', toppings: ['bawang', 'jagung'], level: 'futsuu' };
    s.flash = 'RUSH MALAM! 4 tiket menunggu — jangan sampai ada yang hangus!';
    s.flashColor = '#ffb020';
    s.flashT = 999;
  } else { // serve
    s.clock = 88; s.coins = 41200; s.servedCount = 6; s.elapsed = 1.4;
    s.tickets = [
      mk('miso', 'futsuu', ['telur', 'chashu'], 0.78),
      mk('shoyu', 'katame', ['nori'], 0.6),
      mk('pedas', 'yawame', ['bawang', 'jagung'], 0.44),
    ];
    s.baskets[1].pct = 0.62;
    s.baskets[3].pct = 0.3;
    s.bowl = { noodle: { level: 'futsuu', pct: 0.66 }, broth: 'miso', toppings: ['telur', 'chashu'] };
    s.pass = { broth: 'pedas', toppings: ['nori'], level: 'yawame' };
    s.flash = 'Mangkok cocok dengan TIKET pertama — tekan SAJIKAN!';
    s.flashColor = '#3ddc84';
    s.flashT = 999;
  }
  s.tickets.forEach(reprice);
  return s;
}

if (shotKind) {
  state = buildShotScene(shotKind);
  drawKitchen(ctx, state);
} else {
  attachInput(canvas, () => state, actions);
  state.tickets.push(spawnTicket(state.rng, 0));
  state.tickets.push(spawnTicket(state.rng, 0));
  state.nextTicketIn = 5;

  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (state.phase === 'play') {
      state.elapsed += dt;
      state.clock -= dt;
      state.flashT = Math.max(0, state.flashT - dt);
      maybeSpawn(dt);
      stepBaskets(state.baskets, dt);
      const expired = ageTickets(state.tickets, dt);
      for (const t of expired) {
        state.tickets = state.tickets.filter((x) => x !== t);
        state.strikes += 1;
        flash(`Tiket #${t.id} HANGUS — pelanggan pergi! Strike ${state.strikes}/3`, '#ff4757', 2.6);
      }
      if (state.selected >= state.tickets.length) state.selected = 0;
      if (state.strikes >= 3 || state.clock <= 0) {
        state.phase = 'over';
        state.clock = Math.max(0, state.clock);
      }
    }
    drawKitchen(ctx, state);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
