"use client";
import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Expand, X } from "lucide-react";
import { MediaImage } from "./MediaImage";
type GalleryImage = { url: string; alt: string };
export function ProductGallery({ images, productName }: { images: GalleryImage[]; productName: string }) {
  const [active, setActive] = useState(0);
  const dialog = useRef<HTMLDialogElement>(null);
  const current = images[active];
  const move = (delta: number) => setActive(i => (i + delta + images.length) % images.length);
  return (
    <div className="product-gallery">
      <div className="gallery-stage">
        <MediaImage key={current?.url} src={current?.url || ""} alt={current?.alt || productName} fill preload sizes="(max-width: 800px) 90vw, 50vw" className="object-contain" />
        {current && <button className="gallery-expand icon-button" onClick={() => dialog.current?.showModal()} aria-label="Enlarge product image"><Expand size={18} /></button>}
        <span className="gallery-counter">{images.length ? `${String(active + 1).padStart(2, "0")} / ${String(images.length).padStart(2, "0")}` : "No image supplied"}</span>
      </div>
      {images.length > 1 && <div className="gallery-thumbnails" aria-label="Product images">{images.map((image, i) => <button key={image.url} className={i === active ? "selected" : ""} onClick={() => setActive(i)} aria-label={`View product image ${i + 1}`} aria-pressed={i === active}><MediaImage src={image.url} alt="" fill sizes="80px" className="object-contain" /></button>)}</div>}
      <p className="gallery-caption">Product images for reference. Confirm your configuration with our team.</p>
      <dialog ref={dialog} className="gallery-dialog" aria-label={`${productName} image viewer`} onKeyDown={e => { if (e.key === "ArrowRight") move(1); if (e.key === "ArrowLeft") move(-1); }} onClick={e => { if (e.target === e.currentTarget) dialog.current?.close(); }}>
        <div className="dialog-heading"><span>{productName}</span><button className="icon-button" aria-label="Close image viewer" onClick={() => dialog.current?.close()}><X /></button></div>
        <div className="gallery-enlarged"><MediaImage key={current?.url} src={current?.url || ""} alt={current?.alt || productName} fill sizes="85vw" className="object-contain" /></div>
        {images.length > 1 && <div className="gallery-controls"><button className="icon-button" aria-label="Previous image" onClick={() => move(-1)}><ArrowLeft /></button><span>{active + 1} / {images.length}</span><button className="icon-button" aria-label="Next image" onClick={() => move(1)}><ArrowRight /></button></div>}
      </dialog>
    </div>
  );
}
