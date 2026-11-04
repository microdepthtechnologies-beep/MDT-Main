import { cache } from "react";
import { siteContent, type SitePageKey } from "@/data/site-content";
import { getDb } from "./mongodb";

export function safeContentLink(value: string) {
  return !/[\u0000-\u001f\\]/.test(value) && /^(?:\/(?!\/)|https:\/\/|mailto:|tel:|#)/.test(value);
}

// Copy only fields defined by the template. Invalid fields retain their defaults.
// Fixed object keys also prevent arbitrary fields or prototype keys reaching templates.
export function mergeContent<T>(base: T, value: unknown, field = ""): T {
  if (typeof base === "string") {
    if (typeof value !== "string" || value.length > 12000) return base;
    if (/(?:href|url)$/i.test(field) && !safeContentLink(value)) return base;
    if (/^(?:image|src)$/i.test(field) && !/^\/wp-content\/uploads\/[^?#]+$/.test(value)) return base;
    if (field === "icon" && !["network", "security", "hardware", "software", "av", "support"].includes(value)) return base;
    return value as T;
  }
  if (typeof base === "number") return (typeof value === "number" && Number.isFinite(value) ? value : base) as T;
  if (Array.isArray(base)) {
    if (!Array.isArray(value)) return base;
    return value.slice(0, 100).map((item, index) => mergeContent(base[index] ?? base[0], item, field)) as T;
  }
  if (base && typeof base === "object") {
    if (!value || typeof value !== "object" || Array.isArray(value)) return base;
    return Object.fromEntries(Object.entries(base).map(([key, fallback]) => [key, mergeContent(fallback, Object.hasOwn(value, key) ? (value as Record<string, unknown>)[key] : undefined, key)])) as T;
  }
  return base;
}

export async function getPublishedTemplate<T>(key: string, defaults: T): Promise<T> {
  try {
    const db = await getDb();
    const page = await db.collection("sitePages").findOne(
      { key, status: "published", schemaVersion: 1 },
      { projection: { _id: 0, content: 1 }, sort: { updatedAt: -1 } },
    );
    return page ? mergeContent(defaults, page.content) : defaults;
  } catch {
    // Corporate copy remains available during a database outage; no drafts are served.
    console.warn(`Using bundled content for ${key}: published content is unavailable.`);
    return defaults;
  }
}

export const getSiteContent = cache(async <K extends SitePageKey>(key: K): Promise<(typeof siteContent)[K]> => getPublishedTemplate(key, siteContent[key]));
