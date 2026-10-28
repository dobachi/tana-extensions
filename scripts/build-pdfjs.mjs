#!/usr/bin/env node
// build-pdfjs.mjs — pdfjs-dist から PDF プレビュー拡張（id "pdfjs"）の配布ファイルを作る。
//
//   node scripts/build-pdfjs.mjs <version> <outDir>
//
// 1. npm から pdfjs-dist@<version> を取得
// 2. legacy ビルドの pdf.min.mjs（ESM のまま）と、worker を classic スクリプトへ変換した
//    pdf.worker.js を出す。Tana は不透明オリジンの sandbox iframe で動かすため、blob: の
//    module worker を起動できない（classic worker なら起動できる）。
// 3. cmaps/*.bcmap と standard_fonts/* を、名前 → base64 の JSON 1 ファイルずつにまとめる
//    （ファイル数を抑え、iframe 内で fetch せずに渡せるようにする）
// 4. ライセンスを同梱し、manifest.json に貼る項目（sha256 / size）を表示する
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const [version, outDir] = process.argv.slice(2);
if (!version || !outDir) {
  console.error('usage: node scripts/build-pdfjs.mjs <version> <outDir>');
  process.exit(2);
}

const work = fs.mkdtempSync(path.join(os.tmpdir(), 'pdfjs-'));
execFileSync('npm', ['pack', `pdfjs-dist@${version}`, '--silent'], { cwd: work });
const tgz = fs.readdirSync(work).find((f) => f.endsWith('.tgz'));
execFileSync('tar', ['xzf', tgz], { cwd: work });
const pkg = path.join(work, 'package');

fs.mkdirSync(outDir, { recursive: true });
const out = (name) => path.join(outDir, name);

fs.copyFileSync(path.join(pkg, 'legacy/build/pdf.min.mjs'), out('pdf.min.mjs'));

const worker = fs.readFileSync(path.join(pkg, 'legacy/build/pdf.worker.min.mjs'), 'utf8');
const tail = worker.match(/export\{(\w+) as WorkerMessageHandler\};\s*$/);
if (!tail) throw new Error('worker の末尾が想定と違います（export 行が見つからない）');
// ESM の export を外し、Worker を作れない環境向けに本スレッド用の入口を残す
fs.writeFileSync(
  out('pdf.worker.js'),
  `${worker.slice(0, tail.index)}globalThis.pdfjsWorker={WorkerMessageHandler:${tail[1]}};\n`,
);

function packDir(dir, keep, key = (f) => f) {
  const o = {};
  for (const f of fs.readdirSync(dir).sort()) {
    if (keep(f)) o[key(f)] = fs.readFileSync(path.join(dir, f)).toString('base64');
  }
  return o;
}
fs.writeFileSync(
  out('cmaps.json'),
  JSON.stringify(
    packDir(
      path.join(pkg, 'cmaps'),
      (f) => f.endsWith('.bcmap'),
      (f) => f.replace(/\.bcmap$/, ''),
    ),
  ),
);
fs.writeFileSync(
  out('standard_fonts.json'),
  JSON.stringify(packDir(path.join(pkg, 'standard_fonts'), (f) => /\.(pfb|ttf)$/.test(f))),
);

fs.copyFileSync(path.join(pkg, 'LICENSE'), out('LICENSE'));
fs.copyFileSync(path.join(pkg, 'cmaps/LICENSE'), out('LICENSE_CMAPS'));
fs.copyFileSync(path.join(pkg, 'standard_fonts/LICENSE_FOXIT'), out('LICENSE_FOXIT'));
fs.copyFileSync(path.join(pkg, 'standard_fonts/LICENSE_LIBERATION'), out('LICENSE_LIBERATION'));

fs.rmSync(work, { recursive: true, force: true });

const files = [
  'pdf.min.mjs',
  'pdf.worker.js',
  'cmaps.json',
  'standard_fonts.json',
  'LICENSE',
  'LICENSE_CMAPS',
  'LICENSE_FOXIT',
  'LICENSE_LIBERATION',
].map((rel) => {
  const buf = fs.readFileSync(out(rel));
  return {
    rel,
    url: `https://github.com/dobachi/tana-extensions/releases/download/pdfjs-${version}/${rel}`,
    sha256: createHash('sha256').update(buf).digest('hex'),
    size: buf.length,
  };
});
const totalSize = files.reduce((n, f) => n + f.size, 0);
console.log(JSON.stringify({ version, total_size: totalSize, files }, null, 2));
