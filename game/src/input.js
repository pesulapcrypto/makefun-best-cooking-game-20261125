// input.js — mouse dan keyboard untuk Ramen Rush.
// Klik diterjemahkan lewat hitRegions dari render.js; keyboard:
// Q/W/E/R keranjang, 1–3 kuah, 4–8 topping, Space/Enter sajikan,
// Backspace buang mangkok, Enter juga untuk mulai lagi saat game over.

import { hitRegions } from './render.js';
import { BROTHS, TOPPINGS } from './recipes.js';

export function attachInput(canvas, getState, actions) {
  canvas.addEventListener('click', (ev) => {
    const state = getState();
    const rect = canvas.getBoundingClientRect();
    const x = (ev.clientX - rect.left) * (canvas.width / rect.width);
    const y = (ev.clientY - rect.top) * (canvas.height / rect.height);
    for (const r of hitRegions(state)) {
      if (x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h) {
        dispatch(r, actions);
        return;
      }
    }
  });

  window.addEventListener('keydown', (ev) => {
    const state = getState();
    if (state.phase === 'over') {
      if (ev.key === 'Enter' || ev.key === ' ') {
        ev.preventDefault();
        actions.restart();
      }
      return;
    }
    const basketKeys = { q: 0, w: 1, e: 2, r: 3 };
    const k = ev.key.toLowerCase();
    if (k in basketKeys) {
      actions.basket(basketKeys[k]);
      return;
    }
    if (ev.key >= '1' && ev.key <= '3') {
      actions.broth(BROTHS[Number(ev.key) - 1].id);
      return;
    }
    if (ev.key >= '4' && ev.key <= '8') {
      actions.topping(TOPPINGS[Number(ev.key) - 4].id);
      return;
    }
    if (ev.key === ' ' || ev.key === 'Enter') {
      ev.preventDefault();
      actions.serve();
      return;
    }
    if (ev.key === 'Backspace') {
      ev.preventDefault();
      actions.trash();
    }
  });
}

function dispatch(region, actions) {
  switch (region.kind) {
    case 'restart': actions.restart(); break;
    case 'ticket': actions.ticket(region.index); break;
    case 'basket': actions.basket(region.index); break;
    case 'broth': actions.broth(region.id); break;
    case 'topping': actions.topping(region.id); break;
    case 'serve': actions.serve(); break;
    case 'trash': actions.trash(); break;
  }
}
