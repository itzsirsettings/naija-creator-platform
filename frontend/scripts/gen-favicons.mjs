/**
 * Generates favicon PNG files from Tehilla_logo_new.svg using Playwright.
 * Run: node scripts/gen-favicons.mjs
 */
import { chromium } from "@playwright/test";
import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, "../public");

const svgContent = readFileSync(join(publicDir, "Tehilla_logo_new.svg"), "utf8");
const dataUrl = "data:image/svg+xml;base64," + Buffer.from(svgContent).toString("base64");

const SIZES = [
  { size: 96,  file: "favicon-96x96.png" },
  { size: 180, file: "apple-touch-icon.png" },
  { size: 192, file: "web-app-manifest-192x192.png" },
  { size: 512, file: "web-app-manifest-512x512.png" },
];

const browser = await chromium.launch();

for (const { size, file } of SIZES) {
  const page = await browser.newPage();
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(`<!DOCTYPE html><html><head><style>*{margin:0;padding:0;box-sizing:border-box}body{width:${size}px;height:${size}px;overflow:hidden;background:#b4a8ce}</style></head><body><img src="${dataUrl}" width="${size}" height="${size}" style="display:block;width:${size}px;height:${size}px;border-radius:${Math.round(size * 0.09)}px;overflow:hidden" /></body></html>`);
  await page.waitForTimeout(300);
  const buf = await page.screenshot({ clip: { x: 0, y: 0, width: size, height: size } });
  writeFileSync(join(publicDir, file), buf);
  console.log(`✓ ${file} (${size}×${size})`);
  await page.close();
}

await browser.close();
console.log("Done.");
