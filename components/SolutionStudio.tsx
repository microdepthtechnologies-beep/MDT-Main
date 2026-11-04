"use client";
import Link from "next/link";
import { useRef, useState } from "react";
import { ArrowUpRight, Check } from "lucide-react";
import { solutions } from "@/data/solutions";
import type { Solution } from "@/types/content";
import { MediaImage } from "./MediaImage";

const destinations = ["networking-infrastructure", "security-solutions", "pcs-desktops", "software-products", "audio-visual-solutions"];
export function SolutionStudio({ items = solutions }: { items?: Solution[] }) {
  const [selected, setSelected] = useState(0);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const available = items.length ? items : solutions;
  const active = available[selected] || available[0];
  function select(index: number) { setSelected(index); buttons.current[index]?.focus(); }
  return <div className="solution-studio">
    <div className="solution-tabs" role="tablist" aria-label="MDT solutions" aria-orientation="vertical">
      {available.map((solution, i) => <button key={solution.id} id={`solution-tab-${i}`} ref={el => { buttons.current[i] = el; }} role="tab" aria-selected={i === selected} aria-controls="solution-content" tabIndex={selected === i ? 0 : -1} onClick={() => setSelected(i)} onKeyDown={e => {
        if (["ArrowDown", "ArrowUp", "Home", "End"].includes(e.key)) {
          e.preventDefault();
          select(e.key === "Home" ? 0 : e.key === "End" ? available.length - 1 : (i + (e.key === "ArrowDown" ? 1 : -1) + available.length) % available.length);
        }
      }}><span className="solution-number">0{i + 1}</span><span>{solution.title}</span><ArrowUpRight size={20} /></button>)}
    </div>
    <div className="solution-panel" id="solution-content" role="tabpanel" aria-labelledby={`solution-tab-${selected}`} tabIndex={0}>
      <div className="solution-photo"><MediaImage key={active.image} src={active.image} alt={active.imageAlt} fill sizes="(max-width:800px) 90vw, 55vw" className="object-cover" /><span className="photo-index">MDT / 0{selected + 1}</span></div>
      <div className="solution-copy"><span className="eyebrow">ENGINEERED AROUND YOUR BUSINESS</span><h3>{active.tagline}</h3><p>{active.description}</p><ul>{active.capabilities.map(c => <li key={c}><Check size={14} />{c}</li>)}</ul><div><Link className="text-link" href="/#contact">Let’s discuss your project <ArrowUpRight size={17} /></Link>{selected < 5 ? <Link className="text-link solution-shop-link" href={`/shop/?category=${destinations[selected]}`}>Explore products <ArrowUpRight size={17} /></Link> : <a className="text-link solution-shop-link" href="https://www.mdtrepairs.co.ke/" target="_blank" rel="noreferrer">Visit MDT Repairs <ArrowUpRight size={17} /></a>}</div></div>
    </div>
  </div>;
}
