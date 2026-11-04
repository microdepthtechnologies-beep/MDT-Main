"use client";
import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpRightIcon, CheckIcon } from 'lucide-react';
import { SolutionIcon } from './SolutionIcon';
import { solutions } from '../data/solutions';

const ease = [0.23, 1, 0.32, 1] as const;

export function CapabilityExplorer() {
  const [activeId, setActiveId] = useState(solutions[0].id);
  const active = solutions.find((s) => s.id === activeId) ?? solutions[0];

  return (
    <section id="solutions" className="bg-paper">
      <div className="mx-auto max-w-site px-6 py-24 lg:px-10 lg:py-32">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <h2 className="max-w-2xl text-4xl font-semibold leading-[1.05] tracking-[-0.02em] text-ink sm:text-5xl lg:text-6xl">
            Six disciplines.
            <br />
            One accountable partner.
          </h2>
          <p className="max-w-sm text-lg leading-relaxed text-muted">
            End-to-end ICT under one roof, so nothing falls between vendors.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
          {/* Selector */}
          <div role="tablist" aria-label="Solutions" aria-orientation="vertical" className="flex gap-2 overflow-x-auto pb-2 lg:col-span-4 lg:flex-col lg:gap-0 lg:overflow-visible lg:pb-0">
            {solutions.map((s) => {
              const selected = s.id === activeId;
              return (
                <button
                  key={s.id}
                  type="button"
                  role="tab"
                  id={`tab-${s.id}`}
                  aria-selected={selected}
                  aria-controls="solution-panel"
                  onClick={() => setActiveId(s.id)}
                  onMouseEnter={() => setActiveId(s.id)}
                  className={`relative flex shrink-0 items-center gap-4 rounded-full px-5 py-3 text-left transition-colors duration-150 lg:rounded-none lg:border-b lg:border-line lg:px-0 lg:py-5 ${
                  selected ? 'bg-ink text-white lg:bg-transparent lg:text-ink' : 'bg-white text-ink/60 hover:text-ink lg:bg-transparent'}`
                  }>
                  
                  {selected &&
                  <motion.span
                    layoutId="solution-indicator"
                    className="absolute -left-px bottom-[-1px] hidden h-0.5 w-full bg-brand lg:block"
                    transition={{ duration: 0.25, ease }} />

                  }
                  <span
                    className={`hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors duration-150 lg:flex ${
                    selected ? 'bg-brand text-white' : 'bg-white text-ink/50'}`
                    }>
                    
                    <SolutionIcon name={s.icon} />
                  </span>
                  <span className="whitespace-nowrap text-[15px] font-medium lg:text-xl">{s.title}</span>
                </button>);

            })}
          </div>

          {/* Panel */}
          <div
            id="solution-panel"
            role="tabpanel"
            aria-labelledby={`tab-${active.id}`}
            className="overflow-hidden rounded-[28px] bg-white lg:col-span-8">
            
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={active.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2, ease }}
                className="grid h-full grid-cols-1 md:grid-cols-2">
                
                <div className="relative aspect-[4/3] md:aspect-auto md:min-h-[480px]">
                  <motion.img
                    src={active.image}
                    alt={active.imageAlt}
                    initial={{ scale: 1.04 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3, ease }}
                    className="absolute inset-0 h-full w-full object-cover" />
                  
                </div>
                <div className="flex flex-col p-8 lg:p-10">
                  <h3 className="text-3xl font-semibold leading-tight tracking-[-0.01em] text-ink">{active.title}</h3>
                  <p className="mt-2 font-medium text-brand">{active.tagline}</p>
                  <p className="mt-5 leading-relaxed text-muted">{active.description}</p>
                  <ul className="mt-7 space-y-3">
                    {active.capabilities.map((c) =>
                    <li key={c} className="flex items-start gap-3 text-ink">
                        <CheckIcon className="mt-1 h-4 w-4 shrink-0 text-brand" aria-hidden="true" />
                        {c}
                      </li>
                    )}
                  </ul>
                  <div className="mt-auto flex flex-wrap items-center gap-5 pt-10">
                    <a
                      href="#contact"
                      className="rounded-full bg-ink px-6 py-3 font-medium text-white transition-colors duration-150 hover:bg-ink-700">
                      
                      Discuss a project
                    </a>
                    <a
                      href={active.link.href}
                      target="_blank"
                      rel="noreferrer"
                      className="group inline-flex items-center gap-1 font-medium text-ink">
                      
                      {active.link.label}
                      <ArrowUpRightIcon className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </a>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>);

}