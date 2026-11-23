// Package Harbor Bay's offline 3D build and in-engine captures for make.fun.
import { cpSync, mkdirSync, mkdtempSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const GAME_ID = 'harbor-bay-3d';
const repository = fileURLToPath(new URL('.', import.meta.url));
const output = resolve(process.env.MAKEFUN_OUTPUT_DIR ?? '/output');
const directories = ['game', 'screenshots'] as const;

mkdirSync(output, { recursive: true });
const staging = mkdtempSync(join(output, '.' + GAME_ID + '-'));
try {
  for (const directory of directories) {
    cpSync(join(repository, directory), join(staging, directory), { recursive: true });
  }
  const dossier = buildDossier(staging, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  });
  writeFileSync(join(staging, 'dossier.json'), dossier);
  for (const name of [...directories, 'dossier.json']) {
    const destination = join(output, name);
    rmSync(destination, { recursive: true, force: true });
    renameSync(join(staging, name), destination);
  }
  console.log(GAME_ID + ' hand-in written to ' + output);
} finally {
  rmSync(staging, { recursive: true, force: true });
}
