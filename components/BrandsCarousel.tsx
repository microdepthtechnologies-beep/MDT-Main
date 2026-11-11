"use client";
import Link from "next/link";
import Image from "next/image";
import type { Brand } from "@/lib/brands";

interface Props { brands: Brand[]; }

export function BrandsCarousel({ brands }: Props) {
  if (!brands.length) return null;
  const track = [...brands, ...brands];
  return (
    <section className="brands-carousel-section" aria-label="Our technology brands and partners">
      <div className="brands-carousel-header site-width">
        <p className="brands-carousel-label"><span className="red-dash" />Our Brands &amp; Partners</p>
      </div>
      <div className="brands-carousel-wrap">
        <div className="brands-track">
          {track.map((brand, i) => (
            <Link
              key={`${brand.wpId}-${i}`}
              href={`/shop/?brand=${encodeURIComponent(brand.title)}`}
              className="brand-logo-tile"
              title={`Browse ${brand.title} products`}
              tabIndex={i < brands.length ? 0 : -1}
              aria-hidden={i >= brands.length}
            >
              {brand.imageUrl ? (
                <Image src={brand.imageUrl} alt={brand.title} width={120} height={48} className="brand-logo-img" unoptimized />
              ) : (
                <span className="brand-logo-fallback">{brand.title}</span>
              )}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
