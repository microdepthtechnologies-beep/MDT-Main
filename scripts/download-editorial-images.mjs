/**
 * Downloads the 7 editorial replacement images from Pexels and converts them
 * to WebP under public/wp-content/uploads/2026/11/.
 * Run once: node scripts/download-editorial-images.mjs
 */
import sharp from "sharp";
import { createWriteStream } from "node:fs";
import { mkdir, unlink, access } from "node:fs/promises";
import { join } from "node:path";
import { get } from "node:https";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const dest = join(root, "public", "wp-content", "uploads", "2026", "11");

await mkdir(dest, { recursive: true });

const images = [
  { id: "442150",    file: "mdt-network-installation-442150.webp" },
  { id: "2072060",  file: "mdt-desktop-workspace-2072060.webp" },
  { id: "2881232",  file: "mdt-network-switch-2881232.webp" },
  { id: "10902545", file: "mdt-security-cameras-10902545.webp" },
  { id: "19805876", file: "mdt-nairobi-software-workspace-19805876.webp" },
  { id: "3184418",  file: "mdt-team-collaboration-3184418.webp" },
  { id: "6754846",  file: "mdt-computer-diagnostics-6754846.webp" },
];

function fetch(url) {
  return new Promise((resolve, reject) => {
    get(url, { headers: { "User-Agent": "MDT-Site-Build/1.0" } }, res => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        fetch(res.headers.location).then(resolve, reject);
      } else if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode} for ${url}`));
      } else {
        const chunks = [];
        res.on("data", c => chunks.push(c));
        res.on("end", () => resolve(Buffer.concat(chunks)));
        res.on("error", reject);
      }
    }).on("error", reject);
  });
}

for (const { id, file } of images) {
  const outPath = join(dest, file);
  try {
    await access(outPath);
    console.log(`skip  ${file} (already exists)`);
    continue;
  } catch { /* download it */ }

  const url = `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=1920`;
  console.log(`fetch ${id} → ${file}`);
  const buf = await fetch(url);
  await sharp(buf).webp({ quality: 85 }).toFile(outPath);
  console.log(`done  ${file}`);
}

console.log("\nAll editorial images ready.");
