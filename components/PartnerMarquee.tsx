"use client";
import React from 'react';
import { partners } from '../data/company';

export function PartnerMarquee() {
  const loop = [...partners, ...partners];
  return (
    <section id="partners" aria-label="Technology partners and brands" className="border-b border-line bg-white">
      <div className="mx-auto flex max-w-site flex-col gap-6 px-6 py-10 md:flex-row md:items-center md:gap-10 lg:px-10">
        <p className="shrink-0 text-sm leading-snug text-muted md:w-44">
          Technology partners &amp; brands we supply and support
        </p>
        <div className="mdt-marquee-wrap relative flex-1 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
          <ul className="mdt-marquee flex w-max items-center gap-14">
            {loop.map((name, i) =>
            <li
              key={`${name}-${i}`}
              aria-hidden={i >= partners.length}
              className="whitespace-nowrap text-2xl font-semibold tracking-tight text-ink/35 transition-colors duration-150 hover:text-ink">
              
                {name}
              </li>
            )}
          </ul>
        </div>
      </div>
    </section>);

}