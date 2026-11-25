"use client";

import { useState } from "react";

const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=600";

export function UmkmSafeImage({
  src,
  alt,
  className = "",
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const [imgSrc, setImgSrc] = useState(src || FALLBACK_IMG);

  return (
    <img
      src={imgSrc}
      alt={alt}
      loading="lazy"
      onError={() => {
        if (imgSrc !== FALLBACK_IMG) {
          setImgSrc(FALLBACK_IMG);
        }
      }}
      className={className}
    />
  );
}

