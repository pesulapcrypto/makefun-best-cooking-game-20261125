// Entrypoint bundel Ramen Rush untuk make.fun.
// Tugas file ini sempit: kumpulkan folder game/ dan screenshots/ ke
// direktori output, lalu tulis dossier.json memakai buildDossier dari
// vendor kit — supaya yang dinilai scorer persis sama dengan isi repo.
import { cpSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const rootDir = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(process.env.MAKEFUN_OUTPUT_DIR ?? join(rootDir, 'out'));

mkdirSync(outDir, { recursive: true });
cpSync(join(rootDir, 'game'), join(outDir, 'game'), { recursive: true });
cpSync(join(rootDir, 'screenshots'), join(outDir, 'screenshots'), { recursive: true });

const caps = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
};

writeFileSync(join(outDir, 'dossier.json'), buildDossier(outDir, caps));
console.log(`dossier tertulis di ${join(outDir, 'dossier.json')}`);
