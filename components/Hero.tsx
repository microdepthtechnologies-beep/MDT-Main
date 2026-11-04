"use client";
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowRightIcon, ArrowUpRightIcon, MapPinIcon } from 'lucide-react';
import { platforms } from '../data/company';
import { solutions } from '../data/solutions';
import { editorialMedia } from '../data/editorial-media';

const ease = [0.23, 1, 0.32, 1] as const;

export function Hero() {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reduce) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % solutions.length), 2800);
    return () => window.clearInterval(id);
  }, [reduce]);

  const current = solutions[index];

  return (
    <section id="top" className="relative overflow-hidden bg-ink text-white">
      <div className="mx-auto grid max-w-site grid-cols-1 gap-14 px-6 pb-16 pt-16 md:pt-24 lg:grid-cols-12 lg:gap-10 lg:px-10 lg:pb-24">
        <div className="flex flex-col lg:col-span-7">
          <p className="flex items-center gap-2 text-[15px] text-white/60">
            <MapPinIcon className="h-4 w-4 text-brand" aria-hidden="true" />
            Information &amp; communication technology · Nairobi, Kenya
          </p>

          <h1 className="mt-7 text-[44px] font-semibold leading-[1.02] tracking-[-0.02em] sm:text-6xl lg:text-[80px]">
            Technology for business,
            <br />
            engineered <span className="text-brand">in depth.</span>
          </h1>

          <p className="mt-7 max-w-xl text-lg leading-relaxed text-white/70">
            Micro Depth Technologies is the trusted ICT partner for organisations that need more than a supplier — from
            network infrastructure and cybersecurity to hardware, licensing and on-site support.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <a
              href="#solutions"
              className="group inline-flex items-center gap-2 rounded-full bg-brand px-7 py-4 font-medium text-white transition-colors duration-150 hover:bg-brand-dark">
              
              Explore solutions
              <ArrowRightIcon className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </a>
            <a
              href="#contact"
              className="inline-flex items-center rounded-full border border-white/25 px-7 py-4 font-medium text-white transition-colors duration-150 hover:border-white hover:bg-white hover:text-ink">
              
              Request a consultation
            </a>
          </div>

          {/* Ecosystem doors */}
          <div className="mt-auto pt-16">
            <p className="text-sm text-white/50">One company, every way in</p>
            <ul className="mt-4 grid grid-cols-1 border-t border-white/10 sm:grid-cols-3">
              {platforms.map((p) => {
                const isHq = p.id === 'hq';
                return (
                  <li key={p.id} className="border-b border-white/10 sm:border-b-0 sm:border-r sm:last:border-r-0">
                    <a
                      href={p.href}
                      target={isHq ? undefined : '_blank'}
                      rel={isHq ? undefined : 'noreferrer'}
                      className="group flex h-full flex-col py-5 sm:px-5 sm:first:pl-0">
                      
                      <span className="flex items-center justify-between gap-2">
                        <span className="font-medium">{p.domain}</span>
                        {isHq ?
                        <span className="text-xs text-brand">You are here</span> :

                        <ArrowUpRightIcon className="h-4 w-4 text-white/40 transition-[transform,color] duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white" />
                        }
                      </span>
                      <span className="mt-1 text-sm text-white/55">{p.role}</span>
                    </a>
                  </li>);

              })}
            </ul>
          </div>
        </div>

        <div className="relative lg:col-span-5">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[28px]">
            <Image
              src={editorialMedia.hero}
              alt="Inspecting server racks in a data centre"
              fill
              sizes="(max-width: 1024px) 90vw, 40vw"
              preload
              className="h-full w-full object-cover" />
            
            <div className="absolute inset-0 bg-ink/10" aria-hidden="true" />
          </div>

          <div
            className="absolute -bottom-6 left-4 right-4 rounded-2xl border border-white/10 bg-ink-800/95 p-5 backdrop-blur sm:left-[-32px] sm:right-auto sm:w-80"
            aria-live="polite">
            
            <div className="flex items-center gap-2 text-xs text-white/55">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-60 motion-reduce:hidden" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-brand" />
              </span>
              What we deliver
            </div>
            <div className="relative mt-2 h-14 overflow-hidden">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={current.id}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -14 }}
                  transition={{ duration: 0.25, ease }}>
                  
                  <p className="text-lg font-medium leading-tight">{current.title}</p>
                  <p className="mt-1 truncate text-sm text-white/55">{current.tagline}</p>
                </motion.div>
              </AnimatePresence>
            </div>
            <div className="mt-3 flex gap-1.5" aria-hidden="true">
              {solutions.map((s, i) =>
              <span
                key={s.id}
                className={`h-0.5 flex-1 rounded-full transition-colors duration-200 ${
                i === index ? 'bg-brand' : 'bg-white/15'}`
                } />

              )}
            </div>
          </div>
        </div>
      </div>
    </section>);

}