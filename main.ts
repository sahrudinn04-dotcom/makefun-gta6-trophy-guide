// Leonida Platinum — the hand-in program for gta6-trophy-guide-01 (Node 22, standard
// library only). The guide itself is app/: plain static files a browser opens at
// app/index.html, with the trophy list and our guides in app/data/trophies.json. This
// program copies app/ and screenshots/ beside it into the output directory and writes
// /output/dossier.json with the vendored make.fun library, which is the summary the
// judge reads: the screenshots, the first load's files and bytes, and the source.
//
// vendor/makefun-frontend.ts is the scorer's own copy — leave it exactly as the kit
// shipped it, or the dossier will not match the one the scorer builds.
//
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

function copyTree(from, to) {
  if (!existsSync(from)) return;
  mkdirSync(to, { recursive: true });
  cpSync(from, to, { recursive: true });
}

mkdirSync(outDir, { recursive: true });
copyTree(join(repoRoot, 'app'), join(outDir, 'app'));
copyTree(join(repoRoot, 'screenshots'), join(outDir, 'screenshots'));

// The scorer's own caps for this competition: the dossier's text is capped at
// 163,840 bytes, at most 4 screenshots of at most 256 KiB each, app/ at most 993
// files and directories and 48 MiB in all. buildDossier refuses anything past them,
// which is the same refusal the gate gives.
writeFileSync(
  join(outDir, 'dossier.json'),
  buildDossier(outDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
  }),
);
