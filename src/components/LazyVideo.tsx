"use client";

import { useEffect, useRef } from "react";

// A looping, muted video that only starts downloading when it's about to scroll
// into view, so it doesn't compete with the rest of the page on first load.
export default function LazyVideo({ src, poster, label, className }: { src: string; poster: string; label: string; className?: string }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        video.src = src;
        if (reduceMotion) {
          video.controls = true; // Let the visitor choose to play it.
          return;
        }
        video.muted = true;
        // Browsers can refuse autoplay (e.g. low-power mode); the poster stays.
        video.play().catch(() => {});
      },
      { rootMargin: "400px 0px" },
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, [src]);

  return <video ref={ref} className={className} poster={poster} muted loop playsInline preload="none" aria-label={label} />;
}
