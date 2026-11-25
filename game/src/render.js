// render.js — semua gambar canvas Ramen Rush: dapur malam neon, papan
// pesanan, panci rebusan dengan empat keranjang, mangkok rakitan, meja
// bahan, dan pass hidangan siap saji. Tanpa aset luar; semua digambar kode.

import { BROTHS, LEVELS, TOPPINGS, brothById, toppingById, levelName } from './recipes.js';

export const W = 1280;
export const H = 800;

const NAVY = '#0d1526';
const PANEL = '#14213c';
const PANEL_LINE = '#2b3f66';
const CREAM = '#ffe9c9';
const NEON_RED = '#ff4757';
const NEON_AMBER = '#ffb020';
const NEON_GREEN = '#3ddc84';
const MUTED = '#8fa3c8';

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

function text(ctx, str, x, y, size, color, align = 'left', bold = false) {
  ctx.fillStyle = color;
  ctx.font = `${bold ? '700 ' : ''}${size}px 'Segoe UI', Arial, sans-serif`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(str, x, y);
}

function fmtClock(sec) {
  const s = Math.max(0, Math.ceil(sec));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

function fmtMoney(n) {
  return 'Rp' + n.toLocaleString('id-ID');
}

// Wilayah klik — dipakai input.js; gambar di bawah memakai koordinat sama.
export function hitRegions(state) {
  if (state.phase === 'over') return [{ kind: 'restart', x: 0, y: 0, w: W, h: H }];
  const regions = [];
  state.tickets.forEach((t, i) => {
    regions.push({ kind: 'ticket', index: i, x: 28 + i * 308, y: 84, w: 296, h: 112 });
  });
  for (let i = 0; i < 4; i++) {
    regions.push({ kind: 'basket', index: i, x: 56 + i * 122, y: 258, w: 110, h: 96 });
  }
  BROTHS.forEach((b, i) => {
    regions.push({ kind: 'broth', id: b.id, x: 632 + i * 132, y: 232, w: 120, h: 50 });
  });
  TOPPINGS.forEach((t, i) => {
    regions.push({ kind: 'topping', id: t.id, x: 56 + i * 236, y: 592, w: 224, h: 92 });
  });
  regions.push({ kind: 'serve', x: 632, y: 500, w: 190, h: 44 });
  regions.push({ kind: 'trash', x: 834, y: 500, w: 130, h: 44 });
  return regions;
}

function drawLantern(ctx, x, y, phase) {
  ctx.strokeStyle = '#3a2c18';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x, 64);
  ctx.lineTo(x, y - 16);
  ctx.stroke();
  const glow = ctx.createRadialGradient(x, y, 4, x, y, 34);
  glow.addColorStop(0, 'rgba(255,176,32,0.5)');
  glow.addColorStop(1, 'rgba(255,176,32,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(x - 34, y - 34, 68, 68);
  ctx.fillStyle = phase % 2 === 0 ? '#ffcf5e' : '#ffb020';
  ctx.beginPath();
  ctx.ellipse(x, y, 15, 19, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#8a5a17';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - 15, y - 6);
  ctx.lineTo(x + 15, y - 6);
  ctx.moveTo(x - 15, y + 6);
  ctx.lineTo(x + 15, y + 6);
  ctx.stroke();
}

function drawSteam(ctx, x, y, seed, t) {
  ctx.save();
  for (let i = 0; i < 4; i++) {
    const drift = Math.sin(t * 1.3 + seed * 2.1 + i * 1.7) * 7;
    const px = x + (i - 1.5) * 12 + drift;
    const py = y - i * 11 - ((t * 9 + seed * 7) % 10);
    ctx.fillStyle = `rgba(230,240,255,${0.13 - i * 0.02})`;
    ctx.beginPath();
    ctx.ellipse(px, py, 8 + i * 1.4, 11 + i * 1.8, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

// Satu topping digambar sebagai bentuk kecil di permukaan mangkok.
function drawToppingShape(ctx, id, x, y) {
  if (id === 'telur') {
    ctx.fillStyle = '#fff6e8';
    ctx.beginPath(); ctx.ellipse(x, y, 13, 9, 0.4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#f59b1d';
    ctx.beginPath(); ctx.ellipse(x + 1, y, 6, 5, 0, 0, Math.PI * 2); ctx.fill();
  } else if (id === 'chashu') {
    ctx.fillStyle = '#b06a44';
    rr(ctx, x - 13, y - 7, 26, 14, 6); ctx.fill();
    ctx.strokeStyle = '#7c4526'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x - 8, y); ctx.lineTo(x + 8, y); ctx.stroke();
  } else if (id === 'nori') {
    ctx.fillStyle = '#1d4a34';
    rr(ctx, x - 8, y - 14, 16, 22, 2); ctx.fill();
    ctx.strokeStyle = '#0f2c1e'; ctx.lineWidth = 1.5; ctx.stroke();
  } else if (id === 'bawang') {
    ctx.fillStyle = '#58b368';
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.ellipse(x - 9 + i * 4.5, y - 3 + (i % 2) * 6, 3.4, 2.2, i, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (id === 'jagung') {
    ctx.fillStyle = '#ffd94d';
    for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) {
      ctx.beginPath();
      ctx.arc(x - 8 + c * 8, y - 6 + r * 7, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

// Mangkok ramen lengkap: badan mangkok, kuah, gundukan mie, topping.
export function drawBowl(ctx, cx, cy, r, bowl) {
  // badan mangkok
  ctx.fillStyle = '#20355c';
  ctx.beginPath();
  ctx.moveTo(cx - r, cy - r * 0.25);
  ctx.quadraticCurveTo(cx, cy + r * 1.05, cx + r, cy - r * 0.25);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = NEON_RED;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(cx - r, cy - r * 0.25);
  ctx.quadraticCurveTo(cx, cy + r * 1.05, cx + r, cy - r * 0.25);
  ctx.stroke();
  ctx.fillStyle = '#16263f';
  ctx.fillRect(cx - r * 0.3, cy + r * 0.62, r * 0.6, 7);
  // permukaan kuah / isi
  const hasBroth = !!bowl.broth;
  const hasNoodle = !!bowl.noodle;
  ctx.fillStyle = hasBroth ? brothById(bowl.broth).color : hasNoodle ? '#d9b878' : '#2a3c5f';
  ctx.beginPath();
  ctx.ellipse(cx, cy - r * 0.25, r * 0.94, r * 0.34, 0, 0, Math.PI * 2);
  ctx.fill();
  if (hasBroth) {
    ctx.fillStyle = brothById(bowl.broth).light;
    ctx.beginPath();
    ctx.ellipse(cx - r * 0.2, cy - r * 0.32, r * 0.4, r * 0.12, -0.2, 0, Math.PI * 2);
    ctx.fill();
  }
  if (hasNoodle) {
    // gundukan mie: lengkung-lengkung kuning
    ctx.strokeStyle = bowl.noodle.level === 'gosong' ? '#5a4632' : '#f0d089';
    ctx.lineWidth = 3;
    for (let i = 0; i < 6; i++) {
      ctx.beginPath();
      ctx.arc(cx - r * 0.45 + i * r * 0.17, cy - r * 0.3, r * 0.13, Math.PI * 1.05, Math.PI * 1.95);
      ctx.stroke();
    }
  }
  // topping tersusun melingkar di atas permukaan
  const tops = bowl.toppings || [];
  tops.forEach((id, i) => {
    const ang = (i / Math.max(1, tops.length)) * Math.PI * 2 - Math.PI / 2;
    const tx = cx + Math.cos(ang) * r * 0.5;
    const ty = cy - r * 0.25 + Math.sin(ang) * r * 0.17;
    drawToppingShape(ctx, id, tx, ty);
  });
}

function drawTicket(ctx, t, i, selected) {
  const x = 28 + i * 308;
  const y = 84;
  ctx.fillStyle = '#fdf6e0';
  rr(ctx, x, y, 296, 112, 8); ctx.fill();
  ctx.strokeStyle = selected ? NEON_AMBER : '#c9b98a';
  ctx.lineWidth = selected ? 4 : 2;
  rr(ctx, x, y, 296, 112, 8); ctx.stroke();
  const broth = brothById(t.broth);
  ctx.fillStyle = broth.color;
  ctx.beginPath(); ctx.arc(x + 24, y + 26, 11, 0, Math.PI * 2); ctx.fill();
  text(ctx, `TIKET #${t.id} — ${broth.name.toUpperCase()}`, x + 44, y + 26, 19, '#26324a', 'left', true);
  const lv = LEVELS.find((l) => l.id === t.level);
  text(ctx, `Mie: ${lv ? lv.name : t.level}`, x + 16, y + 54, 16, '#26324a', 'left', true);
  const tops = t.toppings.map((id) => toppingById(id).short).join(' + ') || '—';
  text(ctx, tops, x + 16, y + 76, 15, '#5a6a86');
  text(ctx, fmtMoney(t.price), x + 282, y + 54, 17, '#1c7a43', 'right', true);
  // bar kesabaran
  const frac = Math.max(0, t.patience / t.patienceMax);
  text(ctx, 'SABAR', x + 16, y + 99, 11, '#8a7c55', 'left', true);
  ctx.fillStyle = '#e3d9bd';
  rr(ctx, x + 66, y + 93, 216, 12, 6); ctx.fill();
  ctx.fillStyle = frac > 0.5 ? NEON_GREEN : frac > 0.25 ? NEON_AMBER : NEON_RED;
  if (frac > 0) { rr(ctx, x + 66, y + 93, 216 * frac, 12, 6); ctx.fill(); }
}

function drawBasket(ctx, basket, i, t) {
  const x = 56 + i * 122;
  const y = 258;
  // keranjang kawat
  ctx.fillStyle = basket.pct !== null ? '#3d5a80' : '#26395a';
  rr(ctx, x, y, 110, 96, 8); ctx.fill();
  ctx.strokeStyle = '#7f9cc4';
  ctx.lineWidth = 2;
  rr(ctx, x, y, 110, 96, 8); ctx.stroke();
  ctx.strokeStyle = 'rgba(160,190,230,0.5)';
  ctx.lineWidth = 1;
  for (let gx = x + 14; gx < x + 110; gx += 16) {
    ctx.beginPath(); ctx.moveTo(gx, y + 6); ctx.lineTo(gx, y + 90); ctx.stroke();
  }
  text(ctx, `${i + 1}`, x + 12, y + 15, 13, '#aebfe0', 'left', true);
  if (basket.pct === null) {
    text(ctx, 'KOSONG', x + 55, y + 40, 15, MUTED, 'center', true);
    text(ctx, 'klik: rebus mie', x + 55, y + 64, 12, MUTED, 'center');
    return;
  }
  // mie di dalam keranjang + gelembung air
  const pct = basket.pct;
  ctx.fillStyle = 'rgba(90,160,255,0.35)';
  rr(ctx, x + 6, y + 34, 98, 56, 6); ctx.fill();
  ctx.strokeStyle = pct >= 1.18 ? '#6b543c' : '#f0d089';
  ctx.lineWidth = 3;
  for (let s = 0; s < 4; s++) {
    ctx.beginPath();
    ctx.arc(x + 24 + s * 20, y + 58, 11, Math.PI * 1.05, Math.PI * 1.95);
    ctx.stroke();
  }
  drawSteam(ctx, x + 55, y - 24, i + 1, t);
  // bar kemajuan dengan zona kematangan berwarna
  const bx = x; const by = y + 108; const bw = 110;
  ctx.fillStyle = '#0a1120';
  rr(ctx, bx, by, bw, 14, 7); ctx.fill();
  const zones = [['#e8c96a', 0.3, 0.55], ['#3ddc84', 0.55, 0.8], ['#ffb020', 0.8, 1.05], ['#ff4757', 1.05, 1.3]];
  for (const [color, from, to] of zones) {
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.35;
    ctx.fillRect(bx + (from / 1.3) * bw, by + 2, ((to - from) / 1.3) * bw, 10);
    ctx.globalAlpha = 1;
  }
  const fillW = Math.min(1, pct / 1.3) * bw;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(bx, by + 5, fillW, 4);
  ctx.fillStyle = '#fff';
  ctx.fillRect(bx + fillW - 2, by, 3, 14);
  const label = pct < 0.3 ? 'MENTAH…' : pct < 0.55 ? 'KATAME' : pct < 0.8 ? 'FUTSUU' : pct < 1.05 ? 'YAWAME' : pct < 1.18 ? 'TERLALU LEMBEK' : 'GOSONG!';
  text(ctx, label, x + 55, by + 28, 13, pct >= 1.18 ? NEON_RED : CREAM, 'center', true);
}

export function drawKitchen(ctx, state) {
  const t = state.elapsed;
  // dinding malam + lantai meja
  const wall = ctx.createLinearGradient(0, 0, 0, H);
  wall.addColorStop(0, '#0a1122');
  wall.addColorStop(0.72, NAVY);
  wall.addColorStop(0.73, '#1a1410');
  wall.addColorStop(1, '#241a10');
  ctx.fillStyle = wall;
  ctx.fillRect(0, 0, W, H);
  drawLantern(ctx, 120, 96, 0);
  drawLantern(ctx, 1160, 96, 1);

  // ---- header: papan nama neon + jam shift + koin ----
  ctx.fillStyle = 'rgba(6,9,18,0.85)';
  ctx.fillRect(0, 0, W, 64);
  ctx.strokeStyle = NEON_RED;
  ctx.lineWidth = 2;
  ctx.shadowColor = NEON_RED;
  ctx.shadowBlur = 12;
  text(ctx, 'RAMEN RUSH', 24, 26, 30, NEON_RED, 'left', true);
  ctx.shadowBlur = 0;
  text(ctx, 'Kedai Mie Malam', 24, 52, 13, NEON_AMBER);
  text(ctx, `SISA SHIFT ${fmtClock(state.clock)}`, 640, 26, 30, state.clock < 30 ? NEON_RED : CREAM, 'center', true);
  const clockFrac = Math.max(0, state.clock / state.clockTotal);
  ctx.fillStyle = '#1c2a47';
  ctx.fillRect(490, 46, 300, 7);
  ctx.fillStyle = NEON_AMBER;
  ctx.fillRect(490, 46, 300 * clockFrac, 7);
  text(ctx, `KOIN ${fmtMoney(state.coins)}`, 1256, 22, 20, NEON_AMBER, 'right', true);
  text(ctx, `Terjual ${state.servedCount}  ·  Strike ${state.strikes}/3`, 1256, 48, 15,
    state.strikes > 0 ? NEON_RED : MUTED, 'right', true);

  // ---- papan pesanan ----
  ctx.fillStyle = PANEL;
  rr(ctx, 16, 72, 1248, 132, 10); ctx.fill();
  ctx.strokeStyle = PANEL_LINE; ctx.lineWidth = 2;
  rr(ctx, 16, 72, 1248, 132, 10); ctx.stroke();
  if (state.tickets.length === 0) {
    text(ctx, 'Belum ada pesanan — pelanggan sedang jalan ke kedai…', 640, 140, 20, MUTED, 'center');
  }
  state.tickets.forEach((ticket, i) => drawTicket(ctx, ticket, i, i === state.selected));

  // ---- panel stasiun rebusan ----
  ctx.fillStyle = PANEL;
  rr(ctx, 16, 220, 584, 340, 10); ctx.fill();
  ctx.strokeStyle = PANEL_LINE; ctx.lineWidth = 2;
  rr(ctx, 16, 220, 584, 340, 10); ctx.stroke();
  text(ctx, 'PANCI REBUSAN — 4 KERANJANG', 32, 240, 16, CREAM, 'left', true);
  // badan panci
  ctx.fillStyle = '#31435f';
  rr(ctx, 40, 330, 544, 190, 14); ctx.fill();
  ctx.strokeStyle = '#7f9cc4'; ctx.lineWidth = 3;
  rr(ctx, 40, 330, 544, 190, 14); ctx.stroke();
  ctx.fillStyle = 'rgba(120,180,255,0.25)';
  rr(ctx, 48, 338, 528, 26, 10); ctx.fill();
  text(ctx, 'air mendidih · angkat mie tepat di zona warnanya', 312, 492, 14, MUTED, 'center');
  state.baskets.forEach((b, i) => drawBasket(ctx, b, i, t));

  // ---- panel rakitan ----
  ctx.fillStyle = PANEL;
  rr(ctx, 616, 220, 648, 340, 10); ctx.fill();
  ctx.strokeStyle = PANEL_LINE; ctx.lineWidth = 2;
  rr(ctx, 616, 220, 648, 340, 10); ctx.stroke();
  text(ctx, 'MEJA RAKIT', 632, 240, 16, CREAM, 'left', true);
  // tombol kuah (sendok sayur di atas panci kuah mini)
  BROTHS.forEach((b, i) => {
    const x = 632 + i * 132;
    const active = state.bowl.broth === b.id;
    ctx.fillStyle = b.color;
    rr(ctx, x, 232, 120, 50, 10); ctx.fill();
    ctx.strokeStyle = active ? '#ffffff' : b.light;
    ctx.lineWidth = active ? 4 : 2;
    rr(ctx, x, 232, 120, 50, 10); ctx.stroke();
    text(ctx, `KUAH ${b.name.toUpperCase()}`, x + 60, 250, 14, '#ffffff', 'center', true);
    text(ctx, `tombol ${i + 1}`, x + 60, 270, 11, 'rgba(255,255,255,0.75)', 'center');
  });
  // isi mangkok saat ini (teks)
  const bowlBits = [];
  if (state.bowl.noodle) bowlBits.push(`mie ${levelName(state.bowl.noodle.level)}`);
  if (state.bowl.broth) bowlBits.push(`kuah ${brothById(state.bowl.broth).name}`);
  if (state.bowl.toppings.length) bowlBits.push(state.bowl.toppings.map((id) => toppingById(id).short.toLowerCase()).join(', '));
  text(ctx, bowlBits.length ? `Mangkok: ${bowlBits.join(' + ')}` : 'Mangkok kosong — angkat mie dari keranjang',
    800, 306, 15, bowlBits.length ? CREAM : MUTED, 'center');
  drawBowl(ctx, 800, 408, 92, state.bowl);
  if (state.bowl.noodle || state.bowl.broth) drawSteam(ctx, 800, 330, 9, t);
  // tombol sajikan / buang
  const canServe = state.bowl.noodle && state.bowl.broth;
  ctx.fillStyle = canServe ? '#1c7a43' : '#33503f';
  rr(ctx, 632, 500, 190, 44, 10); ctx.fill();
  ctx.strokeStyle = NEON_GREEN; ctx.lineWidth = 2;
  rr(ctx, 632, 500, 190, 44, 10); ctx.stroke();
  text(ctx, 'SAJIKAN (Space)', 727, 522, 16, '#ffffff', 'center', true);
  ctx.fillStyle = '#4a2430';
  rr(ctx, 834, 500, 130, 44, 10); ctx.fill();
  ctx.strokeStyle = NEON_RED; ctx.lineWidth = 2;
  rr(ctx, 834, 500, 130, 44, 10); ctx.stroke();
  text(ctx, 'BUANG', 899, 522, 16, '#ffffff', 'center', true);
  // pass: hidangan siap saji
  ctx.fillStyle = '#0e1930';
  rr(ctx, 1024, 232, 224, 312, 10); ctx.fill();
  ctx.strokeStyle = NEON_AMBER; ctx.lineWidth = 2;
  rr(ctx, 1024, 232, 224, 312, 10); ctx.stroke();
  text(ctx, 'PASS — SIAP SAJI', 1136, 256, 15, NEON_AMBER, 'center', true);
  if (state.pass) {
    drawBowl(ctx, 1136, 356, 60, state.pass);
    drawSteam(ctx, 1136, 300, 4, t);
    text(ctx, `${brothById(state.pass.broth).name} · ${levelName(state.pass.level)}`, 1136, 448, 14, CREAM, 'center', true);
    text(ctx, state.pass.toppings.map((id) => toppingById(id).short).join(' + ') || 'tanpa topping', 1136, 472, 13, MUTED, 'center');
    text(ctx, 'baru saja disajikan!', 1136, 504, 13, NEON_GREEN, 'center', true);
  } else {
    text(ctx, 'belum ada hidangan', 1136, 360, 15, MUTED, 'center');
    text(ctx, 'yang selesai', 1136, 384, 15, MUTED, 'center');
  }

  // ---- meja bahan: topping ----
  ctx.fillStyle = PANEL;
  rr(ctx, 16, 572, 1248, 128, 10); ctx.fill();
  ctx.strokeStyle = PANEL_LINE; ctx.lineWidth = 2;
  rr(ctx, 16, 572, 1248, 128, 10); ctx.stroke();
  TOPPINGS.forEach((tp, i) => {
    const x = 56 + i * 236;
    const inBowl = state.bowl.toppings.includes(tp.id);
    ctx.fillStyle = inBowl ? '#274b34' : '#0e1930';
    rr(ctx, x, 592, 224, 92, 10); ctx.fill();
    ctx.strokeStyle = inBowl ? NEON_GREEN : PANEL_LINE;
    ctx.lineWidth = inBowl ? 3 : 2;
    rr(ctx, x, 592, 224, 92, 10); ctx.stroke();
    // wadah bahan kecil
    ctx.fillStyle = '#20355c';
    ctx.beginPath();
    ctx.ellipse(x + 42, 632, 30, 16, 0, 0, Math.PI * 2);
    ctx.fill();
    drawToppingShape(ctx, tp.id, x + 42, 626);
    text(ctx, tp.name, x + 82, 620, 16, CREAM, 'left', true);
    text(ctx, `${fmtMoney(tp.price)} · tombol ${i + 4}`, x + 82, 646, 12, MUTED);
    if (inBowl) text(ctx, 'di mangkok ✓', x + 82, 668, 12, NEON_GREEN);
  });

  // ---- footer: pesan + bantuan ----
  ctx.fillStyle = 'rgba(6,9,18,0.85)';
  ctx.fillRect(0, 712, W, 88);
  if (state.flashT > 0 && state.flash) {
    text(ctx, state.flash, 640, 742, 24, state.flashColor || NEON_AMBER, 'center', true);
  } else {
    text(ctx, 'Klik keranjang untuk merebus · klik lagi untuk mengangkat · tuang kuah · klik topping · SAJIKAN',
      640, 742, 18, CREAM, 'center');
  }
  text(ctx, 'Tombol: Q/W/E/R keranjang · 1–3 kuah · 4–8 topping · Space sajikan · Backspace buang · klik tiket untuk memilih target',
    640, 774, 14, MUTED, 'center');

  // ---- spanduk cover ----
  if (state.shot === 'cover') {
    ctx.fillStyle = 'rgba(5,8,16,0.78)';
    rr(ctx, 60, 386, 484, 118, 14); ctx.fill();
    ctx.strokeStyle = NEON_RED; ctx.lineWidth = 3;
    ctx.shadowColor = NEON_RED; ctx.shadowBlur = 16;
    rr(ctx, 60, 386, 484, 118, 14); ctx.stroke();
    ctx.shadowBlur = 0;
    text(ctx, 'RAMEN RUSH', 302, 428, 52, NEON_RED, 'center', true);
    text(ctx, 'Kedai Mie Malam — angkat mie tepat waktu!', 302, 472, 17, NEON_AMBER, 'center', true);
  }

  // ---- game over ----
  if (state.phase === 'over') {
    ctx.fillStyle = 'rgba(4,6,12,0.82)';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = PANEL;
    rr(ctx, 340, 250, 600, 300, 16); ctx.fill();
    ctx.strokeStyle = NEON_AMBER; ctx.lineWidth = 3;
    rr(ctx, 340, 250, 600, 300, 16); ctx.stroke();
    text(ctx, state.strikes >= 3 ? 'KEDAI DITUTUP — TERLALU BANYAK STRIKE' : 'SHIFT SELESAI!', 640, 310, 28, NEON_RED, 'center', true);
    text(ctx, `Koin terkumpul: ${fmtMoney(state.coins)}`, 640, 372, 24, CREAM, 'center', true);
    text(ctx, `Mangkok terjual: ${state.servedCount} · Strike: ${state.strikes}`, 640, 412, 19, MUTED, 'center');
    text(ctx, 'Klik atau tekan Enter untuk shift berikutnya', 640, 486, 18, NEON_GREEN, 'center', true);
  }
}
