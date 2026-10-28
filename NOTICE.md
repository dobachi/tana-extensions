# NOTICE

このリポジトリが配布するファイルは、それぞれの上流のライセンスに従います。

## pdf.js (`pdfjs`)

- pdf.js — Copyright Mozilla Foundation and contributors. Apache License 2.0（`LICENSE`）
- CMaps — Copyright Adobe Systems Incorporated. BSD 3-Clause License（`LICENSE_CMAPS`）
- 標準フォント（Foxit） — Copyright 2014 PDFium Authors. BSD 3-Clause 形式（`LICENSE_FOXIT`）
- 標準フォント（Liberation） — SIL Open Font License 1.1（`LICENSE_LIBERATION`）

`pdf.worker.js` は `pdf.worker.min.mjs` の末尾の ES モジュールの export を外した改変版です
（`scripts/build-pdfjs.mjs`）。`cmaps.json` / `standard_fonts.json` は元ファイルを base64 で
まとめただけで、内容は変えていません。
