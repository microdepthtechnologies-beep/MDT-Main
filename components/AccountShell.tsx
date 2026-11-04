import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Check, FileText, Headphones, Layers } from "lucide-react";
import type { ReactNode } from "react";
import { Logo } from "./Logo";
import { contact } from "@/data/company";

export function AccountShell({ children, register = false }: { children: ReactNode; register?: boolean }) {
  return <div className="account-experience">
    <header className="account-header">
      <Link href="/" aria-label="Micro Depth Technologies home"><Logo /></Link>
      <Link href="/shop/" className="account-back"><ArrowLeft size={16} /> Back to catalogue</Link>
    </header>
    <main className="account-layout">
      <aside className="account-story" aria-label="Your MDT account">
        <div className="account-story-top"><span className="account-kicker"><span /> YOUR MDT CONNECTION</span><span className="account-edition">PRODUCTS. PEOPLE. POSSIBILITIES.</span></div>
        <div className="account-story-copy">
          <h2>Good technology.<br />Great people.<br /><span>Your next move.</span></h2>
          <p>A direct connection to the technology and expertise that move your business forward.</p>
        </div>
        <div className="account-visual" aria-hidden="true">
          <div className="account-orbit" />
          <div className="account-request">
            <div className="account-request-heading"><span className="account-request-icon"><Layers size={22} /></span><span>BUILT AROUND YOUR BUSINESS<small>Your next project starts here.</small></span><ArrowUpRight size={20} /></div>
            <div className="account-request-line"><span>01</span><div><strong>Find your technology</strong><small>Explore. Compare. Make it yours.</small></div><Check size={17} /></div>
            <div className="account-request-line"><span>02</span><div><strong>Build your quote request</strong><small>Your products, in one place.</small></div><Check size={17} /></div>
            <div className="account-request-line"><span>03</span><div><strong>Let’s work out the details</strong><small>Personal advice from our team.</small></div><ArrowUpRight size={17} /></div>
          </div>
        </div>
        <div className="account-story-foot"><span><FileText size={16} /> Quotes tailored to you</span><span><Headphones size={16} /> People you can talk to</span></div>
      </aside>
      <section className="account-form-panel" aria-labelledby="account-title">
        <div className="account-form-wrap">
          <span className="account-kicker account-form-kicker">MDT / {register ? "GET STARTED" : "WELCOME BACK"}</span>
          <h1 id="account-title">{register ? <>Your next chapter<br />starts here<span>.</span></> : <>Good to have<br />you back<span>.</span></>}</h1>
          <p className="account-intro">{register ? "Create your account to request quotations, keep track of your requests and stay connected with MDT." : "Sign in to follow your quote requests and pick up where you left off."}</p>
          {children}
        </div>
      </section>
    </main>
    <footer className="account-footer"><span>Micro Depth Technologies <span className="account-footer-divider">/</span> Your partner in technology.</span><a href={`mailto:${contact.email}`}>Need a hand? Talk to our team <ArrowUpRight size={14} /></a></footer>
  </div>;
}
