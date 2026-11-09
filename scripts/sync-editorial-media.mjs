import { readFile, writeFile, mkdir, copyFile, unlink, access } from "node:fs/promises";
import { constants } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { MongoClient } from "mongodb";
import sharp from "sharp";

const appRoot = fileURLToPath(new URL("../", import.meta.url));
const exists = async file => access(file).then(() => true, () => false);
const envFile = path.join(appRoot, ".env.local");
if (await exists(envFile)) process.loadEnvFile(envFile);
const assets = JSON.parse(await readFile(new URL("../data/editorial-media.json", import.meta.url), "utf8"));
const root = path.resolve(appRoot, process.env.UPLOADS_PATH || "../../uploads/uploads");
const apply = process.argv.includes("--apply");
const hash = bytes => createHash("sha256").update(bytes).digest("hex");
const url = file => `/wp-content/uploads/${file}`;
const local = file => {
  if (!/^\d{4}\/\d{2}\/[\w.-]+$/.test(file)) throw new Error(`Invalid media file: ${file}`);
  return path.join(root, ...file.split("/"));
};

// Never overwrite immutable URLs or silently replace an existing file.
async function writeNew(file, bytes) {
  await mkdir(path.dirname(local(file)), { recursive: true });
  try {
    await writeFile(local(file), bytes, { flag: "wx" });
  } catch (error) {
    if (error.code !== "EEXIST") throw error;
    if (hash(await readFile(local(file))) !== hash(bytes)) {
      throw new Error(`Existing file differs: ${file}. Use a new filename.`);
    }
  }
}

async function describe(file) {
  const bytes = await readFile(local(file));
  const meta = await sharp(bytes).metadata();
  return { file, url: url(file), width: meta.width, height: meta.height, bytes: bytes.length, sha256: hash(bytes), mime: `image/${meta.format}` };
}

async function preparePhoto(key, asset) {
  const stem = asset.file.replace(/\.webp$/, "");
  const originalFile = `${stem}-source.jpg`;
  const thumbnailFile = `${stem}-400.webp`;
  let source;
  if (await exists(local(originalFile))) {
    source = await readFile(local(originalFile));
  } else {
    const response = await fetch(asset.source.downloadUrl, { signal: AbortSignal.timeout(60000) });
    if (!response.ok || !response.headers.get("content-type")?.startsWith("image/")) {
      throw new Error(`Photo download failed for ${key}: HTTP ${response.status}`);
    }
    source = Buffer.from(await response.arrayBuffer());
    const metadata = await sharp(source).metadata();
    if (metadata.format !== "jpeg" || metadata.width < 1000) throw new Error(`Unexpected source image for ${key}`);
    await writeNew(originalFile, source);
  }
  await writeNew(asset.file, await sharp(source).rotate().resize({ width: 1920, height: 1920, fit: "inside", withoutEnlargement: true }).webp({ quality: 85, effort: 5 }).toBuffer());
  await writeNew(thumbnailFile, await sharp(source).rotate().resize({ width: 400, height: 400, fit: "inside", withoutEnlargement: true }).webp({ quality: 80 }).toBuffer());
  return {
    mediaId: asset.mediaId, key, title: asset.title, slug: path.basename(stem),
    alt: asset.alt, caption: `Photo: ${asset.source.photographer} / ${asset.source.provider}`,
    description: asset.description, tags: asset.tags, status: "active", kind: "photograph",
    ...await describe(asset.file),
    original: await describe(originalFile), variants: { thumbnail: await describe(thumbnailFile) },
    sizeFiles: [path.basename(thumbnailFile)],
    source: asset.source, collection: "editorial", schemaVersion: 1,
    replaces: url(asset.replaces.file),
  };
}

async function prepareArchive(key, asset) {
  const originalFile = `2026/10/mdt-design-${key}-source.jpg`;
  const from = path.join(appRoot, asset.replaces.original);
  if (await exists(from)) {
    await mkdir(path.dirname(local(originalFile)), { recursive: true });
    try {
      await copyFile(from, local(originalFile), constants.COPYFILE_EXCL);
    } catch (error) {
      if (error.code !== "EEXIST") throw error;
    }
    if (hash(await readFile(from)) !== hash(await readFile(local(originalFile)))) throw new Error(`Archive copy differs for ${key}`);
  }
  return {
    mediaId: `mdt-legacy-design-${key}`, key: `archived-${key}`, title: `Superseded design: ${asset.title}`,
    alt: `Previous design image for ${asset.title.toLowerCase()}`, caption: null,
    description: "Retained for rollback. Replaced with real photography; not offered as an active media selection.",
    collection: "editorial", status: "archived", kind: "design-image", schemaVersion: 1,
    ...await describe(asset.replaces.file),
    original: await describe(originalFile), sizeFiles: [], tags: ["editorial", "archived", "previous-design"],
    source: { provider: "previous-design", originalPath: asset.replaces.original },
    replacedBy: asset.mediaId,
  };
}

async function main() {
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is required.");
  if (!await exists(root)) throw new Error("The shared uploads directory must exist before importing media.");
  // File preparation can finish even if the database temporarily becomes
  // unavailable. A retry reuses these files and completes registration.
  const documents = [];
  if (apply) {
    for (const [key, asset] of Object.entries(assets)) {
      documents.push(await preparePhoto(key, asset), await prepareArchive(key, asset));
      console.log(`Prepared ${key} in the shared uploads library.`);
    }
  }
  const client = new MongoClient(process.env.MONGODB_URI, {
    tls: true, family: 4, serverSelectionTimeoutMS: 15000, connectTimeoutMS: 15000,
  });
  try {
    await client.connect();
    const media = client.db(process.env.MONGODB_DB || "mdt_hq").collection("media");
    const wordpressCount = await media.countDocuments({ wpId: { $type: "number" } });
    console.log(`${apply ? "Import" : "Plan"}: ${Object.keys(assets).length} photographs; ${wordpressCount} WordPress media records retained.`);
    for (const [key, asset] of Object.entries(assets)) {
      console.log(`${key}: ${url(asset.file)} (${await media.countDocuments({ mediaId: asset.mediaId }) ? "registered" : "new"})`);
    }
    if (!apply) {
      console.log("Dry run only. Use --apply to download, register and archive the selected design media.");
      return;
    }

    // Imported assets keep numeric WordPress IDs. New assets use mediaId.
    // Install the replacement constraint first, preserving numeric uniqueness.
    await media.createIndex({ wpId: 1 }, { name: "wpId_numeric_unique", unique: true, partialFilterExpression: { wpId: { $type: "number" } } });
    for (const index of await media.indexes()) {
      if (index.name !== "wpId_numeric_unique" && index.unique && !index.partialFilterExpression &&
          Object.keys(index.key).length === 1 && index.key.wpId === 1) {
        await media.dropIndex(index.name);
      }
    }
    await media.createIndex({ mediaId: 1 }, { unique: true, partialFilterExpression: { mediaId: { $type: "string" } } });
    const now = new Date();
    for (const document of documents) {
      await media.updateOne({ mediaId: document.mediaId }, {
        $set: { ...document, updatedAt: now },
        $setOnInsert: { uploadedAt: now, createdAt: now },
      }, { upsert: true });
    }
    if (await media.countDocuments({ wpId: { $type: "number" } }) !== wordpressCount) throw new Error("Unexpected change to the WordPress media count.");
    // Remove duplicate public copies only after their archive is registered and
    // its bytes match. The former /wp-content/uploads URLs remain available.
    for (const [key, asset] of Object.entries(assets)) {
      const archive = await media.findOne({ mediaId: `mdt-legacy-design-${key}`, status: "archived" });
      const from = path.join(appRoot, asset.replaces.original);
      if (!archive?.original) throw new Error(`Archive registration missing for ${key}`);
      if (await exists(from)) {
        if (hash(await readFile(from)) !== archive.original.sha256 ||
            hash(await readFile(local(archive.original.file))) !== archive.original.sha256) throw new Error(`Archive verification failed for ${key}`);
        await unlink(from);
      }
    }
    console.log(`Registered ${documents.length} media records: seven active photographs and seven archived design assets. WordPress media unchanged.`);
  } finally {
    await client.close();
  }
}

main().catch(error => {
  // Do not print a driver error that could contain connection details.
  console.error(error.name.startsWith("Mongo") ? `MongoDB registration failed (${error.name}); check network access and the configured connection. Prepared files can be reused on retry.` : error.message);
  process.exitCode = 1;
});
