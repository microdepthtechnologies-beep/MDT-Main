"use client";
import Image from "next/image";
import type { Brand } from "@/lib/brands";

interface Props {
  brands: Brand[];
}

export function BrandsCarousel({ brands }: Props) {
  if (!brands.length) return null;
  // Duplicate the track for seamless infinite loop (animate -50%)
  const track = [...brands, ...brands];

  return (
    <section className="brands-carousel-section" aria-label="Our technology brands and partners">
      <div className="brands-carousel-header site-width">
        <p className="brands-carousel-label">
          <span className="red-dash" />
          Our Brands &amp; Partners
        </p>
      </div>
      {/* overflow is hidden on the wrap; mask fades edges */}
      <div className="brands-carousel-wrap">
        <div className="brands-track">
          {track.map((brand, i) => (
            <div
              key={`${brand.wpId}-${i}`}
              className="brand-logo-tile"
              title={brand.title}
            >
              {brand.imageUrl ? (
                <Image
                  src={brand.imageUrl}
                  alt={brand.title}
                  width={120}
                  height={48}
                  className="brand-logo-img"
                  unoptimized
                />
              ) : (
                <span className="brand-logo-fallback">{brand.title}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
