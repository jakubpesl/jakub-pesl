// Converts a source photo into the web image set used by the site.
//
//   node tools/make-images.cjs <source.jpg> img/work/<key>-<n>       → .webp, -thumb.webp, -wall.webp
//   node tools/make-images.cjs <source.jpg> img/personal/<key>-<n>   → .webp, -thumb.webp
//
// Sizes match the existing assets: full image fits 1200×1600 (q80), thumb is
// 160×160 cover crop (q75), photo-wall image is 360px tall (q76, work only).
// Article PDFs use JPEGs in img/clanek/ (webp/PNG bloat Chromium PDFs):
//   node tools/make-images.cjs img/work/tv-1.webp img/clanek/tv-1 --jpeg
// Originals live in picture2/ (gitignored).

const sharp = require('sharp');

(async () => {
  const [src, out, flag] = process.argv.slice(2);
  if (!src || !out) { console.error('usage: node tools/make-images.cjs <source> <out-base> [--jpeg]'); process.exit(1); }

  if (flag === '--jpeg') {
    const i = await sharp(src).rotate().flatten({ background: '#ffffff' }).resize({ width: 760, withoutEnlargement: true })
      .jpeg({ quality: 80, mozjpeg: true }).toFile(out + '.jpg');
    console.log(out + '.jpg', i.width + '×' + i.height);
    return;
  }

  const full = await sharp(src).rotate().resize({ width: 1200, height: 1600, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 80 }).toFile(out + '.webp');
  await sharp(src).rotate().resize(160, 160, { fit: 'cover', position: 'attention' }).webp({ quality: 75 }).toFile(out + '-thumb.webp');
  console.log(out + '.webp', full.width + '×' + full.height, '+ thumb');

  if (out.includes('img/work/')) {
    const wall = await sharp(src).rotate().resize({ height: 360, withoutEnlargement: true }).webp({ quality: 76 }).toFile(out + '-wall.webp');
    console.log(out + '-wall.webp', wall.width + '×' + wall.height);
  }
})().catch(e => { console.error(e); process.exit(1); });
