import Link from "next/link";
import { ArrowUpRight, Mail, MapPin, Phone } from "lucide-react";
import { contact } from "@/data/company";
import { Logo } from "./Logo";
export function SiteFooter() {
  return (
    <footer className="site-footer"><div className="site-width">
      <div className="footer-intro">
        <div><p className="eyebrow">GOOD TECHNOLOGY STARTS WITH A CONVERSATION.</p><h2>Your next move<span>?</span><br />Let’s make it count.</h2></div>
        <Link className="footer-circle-link" href="/contact/" aria-label="Start a conversation"><ArrowUpRight size={40} /></Link>
      </div>
      <div className="footer-columns">
        <div className="footer-brand"><Link href="/" aria-label="MDT home"><Logo tone="light" /></Link><p>Technology, considered in depth. <br />From the first conversation to the <br />support that comes after.</p><a href={contact.linkedin} target="_blank" rel="noreferrer">Find us on LinkedIn <ArrowUpRight size={14} /></a></div>
        <div><h3>Explore MDT</h3><Link href="/about/">About our company</Link><Link href="/shop/">Product catalogue</Link><Link href="/software-licenses/">Software & Licenses</Link><Link href="/our-services/">Our services</Link><Link href="/blog/">The MDT journal</Link><Link href="/contact/">Contact us</Link></div>
        <div><h3>The MDT family</h3><a href="https://mdtretail.co.ke/" target="_blank" rel="noreferrer">MDT Retail <ArrowUpRight size={14} /></a><a href="https://www.mdtrepairs.co.ke/" target="_blank" rel="noreferrer">MDT Repairs <ArrowUpRight size={14} /></a><Link href="/#platforms">Our connected platforms</Link></div>
        <div className="footer-contact"><h3>Let’s connect</h3><a href={`tel:${contact.phoneIntl}`}><Phone size={16} />{contact.phoneDisplay}</a><a href={`mailto:${contact.email}`}><Mail size={16} />{contact.email}</a><a href={contact.mapUrl} target="_blank" rel="noreferrer"><MapPin size={16} /><span>{contact.address}<br />{contact.addressLine2}</span></a></div>
      </div>
      <div className="footer-bottom"><span>© {new Date().getFullYear()} Micro Depth Technologies. All rights reserved.</span><span>Consult. Supply. Support.</span><a href="#main-content">Back to top ↑</a></div>
    </div></footer>
  );
}
