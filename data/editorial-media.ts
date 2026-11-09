import assets from "./editorial-media.json";

// One manifest supplies the frontend defaults and the MongoDB media importer.
// Files are served locally; source URLs are provenance, never image hotlinks.
type MediaKey = keyof typeof assets;
export const editorialMedia = Object.fromEntries(
  Object.entries(assets).map(([key, asset]) => [key, `/wp-content/uploads/${asset.file}`]),
) as Record<MediaKey, string>;
export const editorialMediaAlt = Object.fromEntries(
  Object.entries(assets).map(([key, asset]) => [key, asset.alt]),
) as Record<MediaKey, string>;
