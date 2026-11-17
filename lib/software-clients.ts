import { getDb } from "./mongodb";

export interface SoftwareClient {
  wpId: number | string;
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

// How future clients opt into this page — set any of these fields on a
// `clients` document (status "publish") and it appears automatically,
// enquiry email included:
//   softwareCategories: ["security"]   — category id, label or fullLabel;
//                                        an unrecognised value creates a
//                                        brand-new section on the page
//   termIds / wpTermIds / terms: [293] — migrated WordPress taxonomy ids
//   categories / groups: ["Security"]  — matched by name only if it maps
//                                        to a known category (never creates
//                                        a section, so "Our Brands" stays out)

const norm = (v: string) => v.toLowerCase().replace(/[^a-z0-9]+/g, "");
const slugify = (v: string) => v.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
const titleize = (v: string) => v.trim().replace(/\s+/g, " ").replace(/(^|\s)\w/g, c => c.toUpperCase());

const KNOWN_ID: Record<string, string> = {};
const KNOWN_TERM = new Map<number, string>();
for (const c of SOFTWARE_CATEGORIES) {
  for (const key of [c.id, c.label, c.fullLabel]) KNOWN_ID[norm(key)] = c.id;
  for (const t of c.termIds) KNOWN_TERM.set(t, c.id);
}

const asStrings = (v: unknown): string[] =>
  Array.isArray(v) ? v.map(x => String(x ?? "").trim()).filter(Boolean) : [];
const asNumbers = (v: unknown): number[] =>
  Array.isArray(v) ? v.map(Number).filter(Number.isFinite) : [];

// Snapshot of migrated client relationships so the mapping is available in deployments,
// which do not include the sibling migration extraction directory.
const MIGRATED_CLIENT_IDS_BY_TERM: Record<number, number[]> = {
  289: [2649, 2653, 2654],
  291: [2659, 2667, 2668, 2669, 2670, 2671, 2672],
  292: [2669, 2673, 2678, 2679],
  293: [2702, 2725, 2726, 2727, 2728, 2729, 2730, 2731, 2732, 2733, 2734, 2735, 2736, 2737, 2738, 2739, 2740, 2741, 2742, 2743, 2744, 2745],
  294: [2680, 2686, 2687, 2688, 2689],
  295: [2690, 2696, 2697, 2698, 2699, 2701],
  296: [2760, 2761],
  297: [2762, 2764, 2769, 2770, 2771],
  298: [2772, 2776],
  299: [2777, 2782],
  300: [2783],
};

let _clientsByCategory: Map<number, number[]> | null = null;

function getClientsByTerm(): Map<number, number[]> {
  if (_clientsByCategory) return _clientsByCategory;
  const map = new Map<number, number[]>();
  for (const [termId, clientIds] of Object.entries(MIGRATED_CLIENT_IDS_BY_TERM)) {
    map.set(Number(termId), [...clientIds]);
  }
  _clientsByCategory = map;
  return map;
}

export interface SoftwarePageData {
  categories: SoftwareCategory[];
  clientsByCategory: Map<string, SoftwareClient[]>;
}

export async function getSoftwarePageData(): Promise<SoftwarePageData> {
  const termMap = getClientsByTerm();
  const db = await getDb();
  const docs = await db.collection("clients")
    .find({ status: "publish" })
    .project({
      wpId: 1, title: 1, slug: 1, featuredImage: 1, website: 1,
      softwareCategories: 1, categories: 1, groups: 1,
      termIds: 1, wpTermIds: 1, terms: 1,
    })
    .sort({ title: 1 })
    .toArray();

  const byCat = new Map<string, Map<string, SoftwareClient>>();
  const extraCats = new Map<string, SoftwareCategory>();
  const put = (catId: string, client: SoftwareClient) => {
    if (!byCat.has(catId)) byCat.set(catId, new Map());
    byCat.get(catId)!.set(client.title.toLowerCase(), client);
  };

  for (const d of docs) {
    if (!d.title) continue;
    const catIds = new Set<string>();
    for (const cat of SOFTWARE_CATEGORIES) {
      const wpIds = cat.termIds.flatMap(tid => termMap.get(tid) ?? []);
      if (wpIds.includes(Number(d.wpId))) catIds.add(cat.id);
    }
    for (const v of asStrings(d.softwareCategories)) {
      const id = KNOWN_ID[norm(v)] ?? slugify(v);
      if (!id) continue;
      catIds.add(id);
      if (!KNOWN_ID[norm(v)] && !extraCats.has(id)) {
        extraCats.set(id, {
          id, label: titleize(v), fullLabel: titleize(v), icon: "",
          description: `Sourced and licensed through MDT. Talk to our team about ${titleize(v).toLowerCase()} solutions.`,
          termIds: [],
        });
      }
    }
    for (const field of ["termIds", "wpTermIds", "terms"]) {
      for (const t of asNumbers(d[field])) {
        const id = KNOWN_TERM.get(t);
        if (id) catIds.add(id);
      }
    }
    for (const field of ["categories", "groups"]) {
      for (const v of asStrings(d[field])) {
        const id = KNOWN_ID[norm(v)];
        if (id) catIds.add(id);
      }
    }
    if (!catIds.size) continue;
    const client: SoftwareClient = {
      wpId: d.wpId ?? String(d._id),
      title: String(d.title),
      slug: String(d.slug ?? d._id),
      imageUrl: d.featuredImage?.url ?? null,
      website: d.website ?? null,
    };
    for (const id of catIds) put(id, client);
  }

  const categories = [
    ...SOFTWARE_CATEGORIES,
    ...[...extraCats.values()].sort((a, b) => a.fullLabel.localeCompare(b.fullLabel)),
  ];
  const clientsByCategory = new Map(
    categories.map(c => [c.id, [...(byCat.get(c.id)?.values() ?? [])]])
  );
  return { categories, clientsByCategory };
}
