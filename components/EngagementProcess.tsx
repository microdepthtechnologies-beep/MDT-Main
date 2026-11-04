"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { processSteps } from '../data/company';

const ease = [0.23, 1, 0.32, 1] as const;

export function EngagementProcess() {
  return (
    <section id="approach" className="bg-white">
      <div className="mx-auto max-w-site px-6 py-24 lg:px-10 lg:py-32">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <h2 className="text-4xl font-semibold leading-[1.05] tracking-[-0.02em] text-ink sm:text-5xl lg:col-span-6 lg:text-6xl">
            How we work with you.
          </h2>
          <p className="text-lg leading-relaxed text-muted lg:col-span-5 lg:col-start-8 lg:self-end">
            Whether you are a startup fitting out a first office or an established enterprise modernising
            infrastructure, every engagement follows the same disciplined path.
          </p>
        </div>

        <ol className="relative mt-20 grid grid-cols-1 gap-12 md:grid-cols-4 md:gap-8">
          <span className="absolute left-0 right-0 top-[11px] hidden h-px bg-line md:block" aria-hidden="true" />
          {processSteps.map((step, i) =>
          <motion.li
            key={step.title}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.3, ease, delay: i * 0.05 }}
            className="relative pl-10 md:pl-0">
            
              <span className="absolute left-0 top-0 flex h-6 w-6 items-center justify-center rounded-full bg-white ring-1 ring-line md:relative">
                <span className={`h-2.5 w-2.5 rounded-full ${i === processSteps.length - 1 ? 'bg-brand' : 'bg-ink'}`} />
              </span>
              <h3 className="text-2xl font-semibold text-ink md:mt-8">{step.title}</h3>
              <p className="mt-3 leading-relaxed text-muted">{step.description}</p>
            </motion.li>
          )}
        </ol>
      </div>
    </section>);

}