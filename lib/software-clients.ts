import { getDb } from "./mongodb";

export interface SoftwareClient {
  wpId: number;
  title: string;
  slug: string;
  imageUrl: string | null;
  website: string | null;
}

export interface SoftwareCategory {
  id: string;
  label: string;
  fullLabel: string;
  description: string;
  termIds: number[];
  icon: string;
}

export const SOFTWARE_CATEGORIES: SoftwareCategory[] = [
  { id: "os", label: "OS", fullLabel: "Operating Systems", description: "Desktop and server operating system licensing for every scale of deployment.", termIds: [289], icon: "🖥" },
  { id: "erp", label: "ERP", fullLabel: "Enterprise Resource Planning", description: "Integrated business management platforms connecting finance, operations and supply chain.", termIds: [291], icon: "⚙" },
  { id: "crm", label: "CRM", fullLabel: "Customer Relationship Management", description: "Sales and customer data tools that help teams manage pipelines and service clients effectively.", termIds: [292], icon: "👥" },
  { id: "security", label: "Security", fullLabel: "Security Software", description: "Endpoint protection, threat detection, backup and recovery to keep your business safe.", termIds: [293], icon: "🔒" },
  { id: "design", label: "Design", fullLabel: "Design & Development Software", description: "Creative, engineering and development tools for teams doing visual and technical work.", termIds: [294], icon: "✏" },
  { id: "datal", label: "DataL", fullLabel: "Data Analytics Software", description: "Reporting, business intelligence and analytics platforms turning data into decisions.", termIds: [295], icon: "📊" },
  { id: "communication", label: "Communication", fullLabel: "Communications Software", description: "Unified communications, messaging and collaboration tools keeping teams connected.", termIds: [296], icon: "💬" },
  { id: "cloud", label: "Cloud Computing", fullLabel: "Cloud Computing Software", description: "Cloud infrastructure, platform services and hybrid solutions for scalable operations.", termIds: [297], icon: "☁" },
  { id: "automation", label: "Automation", fullLabel: "Automation Software", description: "Workflow automation, RPA and process optimisation tools reducing manual overhead.", termIds: [298], icon: "⚡" },
  { id: "payment", label: "Payment Systems", fullLabel: "Payment Systems", description: "Point-of-sale, online payment processing and financial transaction software.", termIds: [299], icon: "💳" },
  { id: "voice", label: "Voice Networking", fullLabel: "Voice Networking (Media Processing)", description: "VoIP, unified communications gateways and media processing software for enterprise telephony.", termIds: [300], icon: "📞" },
];

// wpIds of clients mapped to each software category term.
// Derived from wpur_term_relationships.jsonl — maintained here to avoid a join query.
let _clientsByCategory: Map<number, number[]> | null = null;

async function getClientsByTerm(): Promise<Map<number, number[]>> {
  if (_clientsByCategory) return _clientsByCategory;
  const fs = await import("node:fs/promises");
  const path = await import("node:path");
  const allTermIds = SOFTWARE_CATEGORIES.flatMap(c => c.termIds);
  const relPath = path.resolve(process.cwd(), "../migration/extracted/wpur_term_relationships.jsonl");
  let raw: string;
  try { raw = await fs.readFile(relPath, "utf8"); } catch { return new Map(); }
  const map = new Map<number, number[]>();
  for (const line of raw.split("\n")) {
    if (!line.trim()) continue;
    try {
      const { object_id, term_taxonomy_id } = JSON.parse(line);
      const tid = Number(term_taxonomy_id);
      if (allTermIds.includes(tid)) {
        const existing = map.get(tid) ?? [];
        existing.push(Number(object_id));
        map.set(tid, existing);
      }
    } catch { /* skip malformed lines */ }
  }
  _clientsByCategory = map;
  return map;
}

export async function getSoftwareClientsByCategory(): Promise<Map<string, SoftwareClient[]>> {
  const termMap = await getClientsByTerm();
  const allWpIds = [...new Set([...termMap.values()].flat())];
  if (!allWpIds.length) return new Map();
  const db = await getDb();
  const docs = await db.collection("clients")
    .find({ wpId: { $in: allWpIds }, status: "publish" })
    .project({ wpId: 1, title: 1, slug: 1, featuredImage: 1, website: 1 })
    .sort({ title: 1 })
    .toArray();
  const byWpId = new Map(docs.map(d => [Number(d.wpId), d]));
  const result = new Map<string, SoftwareClient[]>();
  for (const cat of SOFTWARE_CATEGORIES) {
    const wpIds = cat.termIds.flatMap(tid => termMap.get(tid) ?? []);
    const clients: SoftwareClient[] = [...new Map(
      wpIds.map(id => byWpId.get(id)).filter(Boolean).map(d => [
        String(d!.title).toLowerCase(),
        { wpId: Number(d!.wpId), title: String(d!.title), slug: String(d!.slug), imageUrl: d!.featuredImage?.url ?? null, website: d!.website ?? null }
      ])
    ).values()];
    result.set(cat.id, clients);
  }
  return result;
}
