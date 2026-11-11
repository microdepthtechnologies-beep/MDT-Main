import type { Testimonial } from "@/lib/brands";
import { Reveal } from "./Reveal";

interface Props {
  testimonials: Testimonial[];
  eyebrow?: string;
}

export function TestimonialsSection({ testimonials, eyebrow = "What clients say" }: Props) {
  if (!testimonials.length) return null;

  return (
    <section className="testimonials-section site-width" aria-label="Client testimonials">
      <div className="testimonials-header">
        <p className="eyebrow"><span className="red-dash" />{eyebrow}</p>
        <h2 className="testimonials-title">Real results,<br /><span>real clients.</span></h2>
      </div>
      <div className="testimonials-grid">
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
    </section>
  );
}
