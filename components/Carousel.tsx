'use client';

import Image from 'next/image';
import { useState, useEffect, useCallback } from 'react';

export default function Carousel({
  images,
  alt,
  aspect = 'h-[55vh]', // can pass 'aspect-video' on other pages
}: {
  images: { url: string }[];
  alt: string;
  aspect?: string;
}) {
  const [i, setI] = useState(0);
  const has = images.length > 0;

  const next = useCallback(() => setI((p) => (p + 1) % images.length), [images.length]);
  const prev = useCallback(() => setI((p) => (p - 1 + images.length) % images.length), [images.length]);

  // keyboard arrows
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!has) return;
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [has, next, prev]);

  if (!has) {
    return (
      <div className={`relative w-full ${aspect} bg-slate-100`}>
        <div className="absolute inset-0 grid place-items-center text-slate-500">No image</div>
      </div>
    );
  }

  return (
    <div className="relative w-full">
      {/* main image */}
      <div className={`relative w-full ${aspect} bg-slate-100`}>
        <Image
          key={images[i].url}
          src={images[i].url}
          alt={alt}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        {/* controls */}
        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/60 text-white px-3 py-2"
              aria-label="Previous image"
            >
              ‹
            </button>
            <button
              onClick={next}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/60 text-white px-3 py-2"
              aria-label="Next image"
            >
              ›
            </button>
          </>
        )}
      </div>

      {/* thumbnails */}
      {images.length > 1 && (
        <div className="mt-2 grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2">
          {images.map((img, idx) => (
            <button
              key={img.url + idx}
              onClick={() => setI(idx)}
              className={`relative aspect-video rounded overflow-hidden border ${i === idx ? 'ring-2 ring-black' : ''}`}
            >
              <Image src={img.url} alt={`${alt} ${idx + 1}`} fill sizes="10vw" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
