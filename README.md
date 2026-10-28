# tana-extensions

[Tana（棚）](https://github.com/dobachi/tana) ファイラのダウンロード型拡張機能カタログです。
本体を軽く保つため、重い描画エンジンなどはここから**必要な人にだけ配布**します
（仕組みは [fude-extensions](https://github.com/dobachi/fude-extensions) と同じ）。

Tana の 設定 →「拡張機能」で有効にすると、`manifest.json` を取得し、各ファイルを
SHA-256 で検証してダウンロード・キャッシュします。初回ダウンロード後はオフラインで動きます。

## カタログ (`manifest.json`)

`manifest.json` はリポジトリ root に置き、Tana 本体は
`https://raw.githubusercontent.com/dobachi/tana-extensions/main/manifest.json`
を参照します。各拡張のファイル実体は GitHub リリースのアセットとして配布します。

## 提供中の拡張

### PDF Preview (`pdfjs`)

- プレビュー欄で PDF をページごとに表示します（Mozilla の [pdf.js](https://github.com/mozilla/pdf.js)）。
- 埋め込みフォントの無い日本語などの PDF も表示できるよう、CMap と標準フォントを同梱しています。
- 配布ファイル:
  - `pdf.min.mjs` — pdf.js 本体（legacy ビルド、ES モジュール）
  - `pdf.worker.js` — 解析用 worker。Tana は sandbox iframe（不透明オリジン）で動かすため、
    blob: から起動できる classic スクリプトに変換したもの
  - `cmaps.json` / `standard_fonts.json` — `cmaps/*.bcmap` と `standard_fonts/*` を名前 → base64 で1ファイルにまとめたもの
  - `LICENSE*` — 各ライセンス
- 取得元: npm `pdfjs-dist`
- バージョン: 4.10.38

ライセンス・著作権は各上流に従います。[NOTICE.md](NOTICE.md) を参照してください。

## リリース手順（メンテナ向け）

### PDF Preview

1. 配布ファイルを作る（npm から `pdfjs-dist` を取得して変換し、manifest に貼る項目を表示する）:
   ```
   node scripts/build-pdfjs.mjs <version> dist/pdfjs
   ```
2. `dist/pdfjs/` の全ファイルを `pdfjs-<version>` タグのリリースにアップロード。
3. 表示された version / total_size / files を `manifest.json` に反映して main にコミット。
