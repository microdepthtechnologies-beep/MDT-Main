"use client";

import { useEffect, useRef, useState } from "react";
import type { Testimonial } from "@/lib/brands";
import { Reveal } from "./Reveal";

interface Props {
  testimonials: Testimonial[];
  eyebrow?: string;
}

const stepOf = (el: HTMLElement) => {
  const card = el.querySelector<HTMLElement>(".reveal");
  return (card?.offsetWidth || el.clientWidth) + (parseFloat(getComputedStyle(el).columnGap) || 0);
};

export function TestimonialsSection({ testimonials, eyebrow = "What clients say" }: Props) {
  const track = useRef<HTMLDivElement>(null);
  const hovering = useRef(false);
  const holding = useRef(false);
  const resumeAt = useRef(0);
  const [canSlide, setCanSlide] = useState(false);
  const [activeDot, setActiveDot] = useState(0);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const measure = () => setCanSlide(el.scrollWidth > el.clientWidth + 8);
    const onScroll = () => setActiveDot(Math.min(testimonials.length - 1, Math.max(0, Math.round(el.scrollLeft / stepOf(el)))));
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    el.addEventListener("scroll", onScroll, { passive: true });
    measure();
    onScroll();
    return () => { observer.disconnect(); el.removeEventListener("scroll", onScroll); };
  }, [testimonials.length]);

  useEffect(() => {
    const el = track.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const pause = (ms = 0) => { resumeAt.current = Date.now() + ms; };
    const enter = () => { hovering.current = true; };
    const leave = () => { hovering.current = false; pause(1600); };
    const hold = () => { holding.current = true; };
    const release = () => { holding.current = false; pause(1600); };
    el.addEventListener("pointerenter", enter);
    el.addEventListener("pointerleave", leave);
    el.addEventListener("pointerdown", hold);
    el.addEventListener("pointerup", release);
    el.addEventListener("pointercancel", release);
    el.addEventListener("focusin", enter);
    el.addEventListener("focusout", leave);
    const tick = setInterval(() => {
      if (hovering.current || holding.current || document.hidden || Date.now() < resumeAt.current) return;
      // Only slide when there are more cards than fit in view.
      if (el.scrollWidth <= el.clientWidth + 8) return;
      const step = stepOf(el);
      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 8;
      el.scrollTo({ left: atEnd ? 0 : Math.round(el.scrollLeft + step), behavior: "smooth" });
    }, 4500);
    return () => {
      clearInterval(tick);
      el.removeEventListener("pointerenter", enter);
      el.removeEventListener("pointerleave", leave);
      el.removeEventListener("pointerdown", hold);
      el.removeEventListener("pointerup", release);
      el.removeEventListener("pointercancel", release);
      el.removeEventListener("focusin", enter);
      el.removeEventListener("focusout", leave);
    };
  }, []);

  if (!testimonials.length) return null;

  return (
    <section className="testimonials-section site-width" aria-label="Client testimonials">
      <div className="testimonials-header">
        <p className="eyebrow"><span className="red-dash" />{eyebrow}</p>
        <h2 className="testimonials-title">Real results,<br /><span>real clients.</span></h2>
      </div>
      <div className="testimonials-grid" ref={track} role="region" aria-roledescription="carousel" aria-label="Client testimonials" tabIndex={0}>
        {testimonials.map((t, i) => (
          <Reveal key={t.wpId}><blockquote className={`testimonial-card${i === 0 ? " testimonial-card-featured" : ""}`}>
            <span className="testimonial-quote-mark" aria-hidden="true">&ldquo;</span>
            <p className="testimonial-body">{t.content}</p>
            <footer className="testimonial-footer">
              <span className="testimonial-service">{t.title}</span>
            </footer>
          </blockquote></Reveal>
        ))}
      </div>
      {canSlide && <div className="testimonial-dots" role="group" aria-label="Choose testimonial">
        {testimonials.map((t, i) => (
          <button
            key={t.wpId}
            type="button"
            className={`testimonial-dot${i === activeDot ? " is-active" : ""}`}
            aria-label={`Go to testimonial ${i + 1}`}
            aria-current={i === activeDot || undefined}
            onClick={() => track.current?.scrollTo({ left: i * stepOf(track.current), behavior: "smooth" })}
          />
        ))}
      </div>}
    </section>
  );
}
