// Membuat ikon aplikasi Bunayo dari public/brand/bunayo-mark.png.
// Jalankan: node scripts/brand-icons.mjs
// Keluaran: ikon PWA 192/512 (latar putih), apple-icon 180, icon 64, favicon.ico (PNG di dalam ICO).
import sharp from "sharp";
import { writeFile } from "node:fs/promises";

const SRC = "public/brand/bunayo-mark.png";
const WHITE = { r: 255, g: 255, b: 255, alpha: 1 };

/** Ikon persegi: mark di tengah dengan ruang kosong `pad` (rasio sisi), latar putih atau transparan. */
async function square(size, pad, background) {
  const inner = Math.round(size * (1 - pad * 2));
  const mark = await sharp(SRC).resize(inner, inner, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).toBuffer();
  return sharp({ create: { width: size, height: size, channels: 4, background } })
    .composite([{ input: mark, gravity: "center" }])
    .png()
    .toBuffer();
}

function ico(pngs) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(pngs.length, 4);
  const dir = Buffer.alloc(16 * pngs.length);
  let offset = 6 + dir.length;
  pngs.forEach(({ size, buf }, i) => {
    const o = i * 16;
    dir.writeUInt8(size >= 256 ? 0 : size, o);
    dir.writeUInt8(size >= 256 ? 0 : size, o + 1);
    dir.writeUInt16LE(1, o + 4);
    dir.writeUInt16LE(32, o + 6);
    dir.writeUInt32LE(buf.length, o + 8);
    dir.writeUInt32LE(offset, o + 12);
    offset += buf.length;
  });
  return Buffer.concat([header, dir, ...pngs.map((p) => p.buf)]);
}

const out = {
  "public/brand/icon-192.png": await square(192, 0.12, WHITE),
  "public/brand/icon-512.png": await square(512, 0.12, WHITE),
  "public/brand/icon-maskable-512.png": await square(512, 0.2, WHITE),
  "src/app/apple-icon.png": await square(180, 0.12, WHITE),
  "src/app/icon.png": await square(64, 0.04, { r: 0, g: 0, b: 0, alpha: 0 }),
};
for (const [file, buf] of Object.entries(out)) await writeFile(file, buf);

const fav = await Promise.all([16, 32, 48].map(async (size) => ({ size, buf: await square(size, 0.02, { r: 0, g: 0, b: 0, alpha: 0 }) })));
await writeFile("public/favicon.ico", ico(fav));
console.log("ikon dibuat:", [...Object.keys(out), "public/favicon.ico"].join(", "));
