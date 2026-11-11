import Link from "next/link";
import Image from "next/image";
import { AppWindow, Building2, Users, ShieldCheck, PenTool, ChartNoAxesCombined, MessagesSquare, Cloud, Workflow, CreditCard, Phone, ExternalLink } from "lucide-react";
import type { siteContent } from "@/data/site-content";
import { SOFTWARE_CATEGORIES, type SoftwareClient } from "@/lib/software-clients";
import { MarketingHero, MarketingFAQs, MarketingCTA, MarketingLayout, SectionHeading } from "./MarketingLayout";
import { Reveal } from "./Reveal";

const categoryIcons = {
  os: AppWindow, erp: Building2, crm: Users, security: ShieldCheck,
  design: PenTool, datal: ChartNoAxesCombined, communication: MessagesSquare,
  cloud: Cloud, automation: Workflow, payment: CreditCard, voice: Phone,
};
function SoftwareIcon({ id }: { id: string }) {
  const Icon = categoryIcons[id as keyof typeof categoryIcons] ?? AppWindow;
  return <Icon size={20} strokeWidth={1.5} aria-hidden="true" />;
}

function ClientLogo({ client }: { client: SoftwareClient }) {
  if (!client.imageUrl) return <span className="sw-client-name">{client.title}</span>;
  return <Image src={client.imageUrl} alt={client.title} width={80} height={32} className="sw-client-logo" unoptimized />;
}

export function SoftwarePage({ content: c, clientsByCategory }: {
  content: typeof siteContent.software;
  clientsByCategory: Map<string, SoftwareClient[]>;
}) {
  return <MarketingLayout breadcrumbs={[{ name: "Software & Licenses", path: "/software-licenses/" }]}>
    <MarketingHero data={c.hero} kind="software" />

    {/* 01 / Introduction */}
    <section className="site-width software-intro" id="software-solutions">
      <SectionHeading {...c.intro} />
      <nav className="sw-overview-grid" aria-label="Software categories">
        {SOFTWARE_CATEGORIES.map(cat => (
          <a key={cat.id} href={`#sw-${cat.id}`} className="sw-overview-chip">
            <SoftwareIcon id={cat.id} />
            <span>{cat.fullLabel}</span>
          </a>
        ))}
      </nav>
    </section>

    {/* Per-category sections */}
    {SOFTWARE_CATEGORIES.map((cat, index) => {
      const clients = clientsByCategory.get(cat.id) ?? [];
      return (
        <section key={cat.id} id={`sw-${cat.id}`} style={{scrollMarginTop:"110px"}}><Reveal className={`sw-category-section ${index % 2 === 0 ? "sw-cat-light" : "sw-cat-dark"}`}>
          <div className="site-width sw-cat-inner">
            <div className="sw-cat-header">
              <div>
                <p className="eyebrow"><SoftwareIcon id={cat.id} />{`${String(index + 2).padStart(2, "0")} / ${cat.label.toUpperCase()}`}</p>
                <h2>{cat.fullLabel}</h2>
                <p className="sw-cat-description">{cat.description}</p>
              </div>
            </div>
            {clients.length > 0 ? (
              <div className="sw-client-grid">
                {clients.map(client => (
                  <div key={client.wpId} className="sw-client-card">
                    <div className="sw-client-logo-wrap"><ClientLogo client={client} /></div>
                    <span className="sw-client-title">{client.title}</span>
                    {client.website && (
                      <a href={client.website} target="_blank" rel="noreferrer" className="sw-client-link" aria-label={`Visit ${client.title}`}>
                        <ExternalLink size={12} />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="sw-cat-empty">
                <SoftwareIcon id={cat.id} />
                <p>We source and support leading {cat.fullLabel.toLowerCase()} solutions. <Link href="/contact/">Talk to our team</Link> about your requirements.</p>
              </div>
            )}
          </div>
        </Reveal></section>
      );
    })}

    <MarketingFAQs data={c.faqs} />
    <MarketingCTA data={c.cta} />
  </MarketingLayout>;
}
