"use client";
import Image, { type ImageProps } from "next/image";
import { ImageOff } from "lucide-react";
import { useState } from "react";
export function MediaImage(props: ImageProps) {
  const [failed, setFailed] = useState(false);
  if (failed || !props.src) return <div className="image-placeholder" role="img" aria-label={props.alt}><ImageOff size={28} strokeWidth={1} /><span>Image unavailable</span></div>;
  return <Image {...props} alt={props.alt} onError={() => setFailed(true)} />;
}
