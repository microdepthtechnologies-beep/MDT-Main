"use client";
import React from 'react';
import { pillarsOfEngagement, teamDisciplines } from '../data/company';

export function AboutStatement() {
  return (
    <section id="about" className="bg-white">
      <div className="mx-auto max-w-site px-6 py-24 lg:px-10 lg:py-32">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          <h2 className="text-sm font-medium text-brand lg:col-span-3">About MDT</h2>
          <div className="lg:col-span-9">
            <p className="text-3xl font-medium leading-[1.2] tracking-[-0.01em] text-ink sm:text-4xl lg:text-[46px]">
              We help businesses of every size choose, deploy and run the technology they depend on —{' '}
              <span className="text-ink/40">
                with tailor-made strategies, superior products and service that builds long-term trust.
              </span>
            </p>
          </div>
        </div>

        <div className="mt-20 grid grid-cols-1 border-t border-line md:grid-cols-3">
          {pillarsOfEngagement.map((p) =>
          <div key={p.title} className="border-b border-line py-10 md:border-b-0 md:border-r md:px-10 md:first:pl-0 md:last:border-r-0">
              <h3 className="text-2xl font-semibold text-ink">{p.title}</h3>
              <p className="mt-3 max-w-sm leading-relaxed text-muted">{p.description}</p>
            </div>
          )}
        </div>

        <div className="mt-6 flex flex-col gap-5 rounded-3xl bg-paper p-8 md:flex-row md:items-center md:justify-between lg:p-10">
          <p className="max-w-md text-lg font-medium text-ink">
            A certified team covering every discipline your technology touches.
          </p>
          <ul className="flex flex-wrap gap-2 md:max-w-xl md:justify-end">
            {teamDisciplines.map((d) =>
            <li key={d} className="rounded-full border border-line bg-white px-4 py-2 text-sm text-ink">
                {d}
              </li>
            )}
          </ul>
        </div>
      </div>
    </section>);

}