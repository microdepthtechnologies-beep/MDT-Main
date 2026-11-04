"use client";
import React, { useState } from 'react';
import { ArrowUpRightIcon, SearchIcon, StoreIcon, WrenchIcon } from 'lucide-react';
import { repairServices, retailCategories } from '../data/company';

export function Ecosystem() {
  const [jobCard, setJobCard] = useState('');

  const trackRepair = (e: React.FormEvent) => {
    e.preventDefault();
    window.open('https://www.mdtrepairs.co.ke/', '_blank', 'noopener');
  };

  return (
    <section id="platforms" className="bg-ink text-white">
      <div className="mx-auto max-w-site px-6 py-24 lg:px-10 lg:py-32">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-end">
          <h2 className="text-4xl font-semibold leading-[1.05] tracking-[-0.02em] sm:text-5xl lg:col-span-7 lg:text-6xl">
            One company.
            <br />
            <span className="text-white/45">A growing family of platforms.</span>
          </h2>
          <p className="text-lg leading-relaxed text-white/65 lg:col-span-5">
            mdt.co.ke is home base. Each MDT platform is purpose-built for one job, so customers get straight to what
            they came for.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-5 lg:grid-cols-12">
          {/* Retail */}
          <article className="flex flex-col rounded-[28px] bg-white p-8 text-ink lg:col-span-7 lg:p-12">
            <div className="flex items-center justify-between">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-azure-soft text-azure">
                <StoreIcon className="h-6 w-6" strokeWidth={1.6} aria-hidden="true" />
              </span>
              <span className="text-sm text-muted">mdtretail.co.ke</span>
            </div>
            <h3 className="mt-10 text-4xl font-semibold tracking-[-0.01em] lg:text-5xl">MDT Retail</h3>
            <p className="mt-4 max-w-md text-lg leading-relaxed text-muted">
              Shop hardware, accessories and genuine licences online — clear pricing, live stock and delivery across Kenya.
            </p>
            <ul className="mt-8 flex flex-wrap gap-2" aria-label="Retail categories">
              {retailCategories.map((c) =>
              <li key={c}>
                  <a
                  href="https://mdtretail.co.ke/"
                  target="_blank"
                  rel="noreferrer"
                  className="block rounded-full border border-line px-4 py-2 text-sm transition-colors duration-150 hover:border-ink hover:bg-ink hover:text-white">
                  
                    {c}
                  </a>
                </li>
              )}
            </ul>
            <a
              href="https://mdtretail.co.ke/"
              target="_blank"
              rel="noreferrer"
              className="group mt-auto inline-flex w-fit items-center gap-2 pt-12 text-lg font-medium">
              
              Visit the store
              <ArrowUpRightIcon className="h-5 w-5 text-azure transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </a>
          </article>

          {/* Repairs */}
          <article className="flex flex-col rounded-[28px] bg-ink-800 p-8 ring-1 ring-white/10 lg:col-span-5 lg:p-12">
            <div className="flex items-center justify-between">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand text-white">
                <WrenchIcon className="h-6 w-6" strokeWidth={1.6} aria-hidden="true" />
              </span>
              <span className="text-sm text-white/50">mdtrepairs.co.ke</span>
            </div>
            <h3 className="mt-10 text-4xl font-semibold tracking-[-0.01em] lg:text-5xl">MDT Repairs</h3>
            <p className="mt-4 leading-relaxed text-white/65">
              Intake, diagnostics and customer updates in one pipeline — from the moment a device walks in to the moment
              it walks back out.
            </p>
            <ul className="mt-6 grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-white/75">
              {repairServices.map((r) =>
              <li key={r} className="flex items-center gap-2">
                  <span className="h-1 w-1 rounded-full bg-brand" aria-hidden="true" />
                  {r}
                </li>
              )}
            </ul>

            <form onSubmit={trackRepair} className="mt-auto pt-10">
              <label htmlFor="job-card" className="text-sm text-white/55">
                Track a repair
              </label>
              <div className="mt-2 flex rounded-full bg-white/5 p-1.5 ring-1 ring-white/10 focus-within:ring-white/40">
                <div className="flex flex-1 items-center gap-2 pl-4">
                  <SearchIcon className="h-4 w-4 text-white/40" aria-hidden="true" />
                  <input
                    id="job-card"
                    value={jobCard}
                    onChange={(e) => setJobCard(e.target.value)}
                    placeholder="Job card, e.g. JC-2026-158"
                    className="w-full bg-transparent text-[15px] text-white placeholder:text-white/35 focus:outline-none" />
                  
                </div>
                <button
                  type="submit"
                  className="rounded-full bg-brand px-5 py-2.5 text-sm font-medium text-white transition-colors duration-150 hover:bg-brand-dark">
                  
                  Track
                </button>
              </div>
              <a
                href="https://www.mdtrepairs.co.ke/"
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex items-center gap-1 text-sm text-white/70 transition-colors duration-150 hover:text-white">
                
                Or book a new repair <ArrowUpRightIcon className="h-3.5 w-3.5" />
              </a>
            </form>
          </article>
        </div>

        <div className="mt-5 flex flex-col gap-3 rounded-[28px] border border-dashed border-white/20 px-8 py-7 sm:flex-row sm:items-center sm:justify-between lg:px-12">
          <p className="text-lg font-medium">More MDT platforms are on the way.</p>
          <p className="text-white/55">New business systems launching under the MDT family — announced here first.</p>
        </div>
      </div>
    </section>);

}