/**
 * Builds favicon.ico (16x16 + 32x32) from Tehilla_logo_new.svg using Playwright.
 * ICO format: header + directory + PNG image data (modern .ico allows embedded PNG).
 */
import { chromium } from "@playwright/test";
import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, "../public");

const svgContent = readFileSync(join(publicDir, "Tehilla_logo_new.svg"), "utf8");
const dataUrl = "data:image/svg+xml;base64," + Buffer.from(svgContent).toString("base64");

const browser = await chromium.launch();
const pngs = [];

for (const size of [16, 32]) {
  const page = await browser.newPage();
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(`<!DOCTYPE html><html><head><style>*{margin:0;padding:0}body{width:${size}px;height:${size}px;overflow:hidden;background:#b4a8ce}</style></head><body><img src="${dataUrl}" width="${size}" height="${size}" style="display:block;width:${size}px;height:${size}px" /></body></html>`);
  await page.waitForTimeout(200);
  const buf = await page.screenshot({ clip: { x: 0, y: 0, width: size, height: size } });
  pngs.push({ size, buf });
  await page.close();
}

await browser.close();

// Build ICO: ICONDIR + ICONDIRENTRY[] + PNG data blobs
// Modern ICO allows PNG data directly (Vista+)
const count = pngs.length;
const headerSize = 6;          // ICONDIR
const entrySize = 16;          // ICONDIRENTRY each
const dataOffset = headerSize + entrySize * count;

const entries = [];
let offset = dataOffset;
for (const { size, buf } of pngs) {
  entries.push({ size, buf, offset });
  offset += buf.length;
}

const totalSize = offset;
const out = Buffer.alloc(totalSize);
let pos = 0;

// ICONDIR
out.writeUInt16LE(0, pos);       pos += 2; // reserved
out.writeUInt16LE(1, pos);       pos += 2; // type = 1 (ICO)
out.writeUInt16LE(count, pos);   pos += 2; // count

// ICONDIRENTRY for each image
for (const { size, buf, offset: imgOff } of entries) {
  out.writeUInt8(size === 256 ? 0 : size, pos); pos += 1; // width (0=256)
  out.writeUInt8(size === 256 ? 0 : size, pos); pos += 1; // height
  out.writeUInt8(0, pos);                        pos += 1; // color count
  out.writeUInt8(0, pos);                        pos += 1; // reserved
  out.writeUInt16LE(1, pos);                     pos += 2; // planes
  out.writeUInt16LE(32, pos);                    pos += 2; // bit count
  out.writeUInt32LE(buf.length, pos);            pos += 4; // size of image data
  out.writeUInt32LE(imgOff, pos);                pos += 4; // offset of image data
}

// PNG data
for (const { buf } of entries) {
  buf.copy(out, pos);
  pos += buf.length;
}

writeFileSync(join(publicDir, "favicon.ico"), out);
console.log("✓ favicon.ico (16×16 + 32×32)");
