'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Lightweight IntersectionObserver hook.
 * Returns a ref to attach and a boolean `isInView`.
 * Triggers only once (animate-in, don't animate-out).
 */
export function useInView(options?: IntersectionObserverInit) {
  const ref = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.15, ...options },
    );

    observer.observe(el);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { ref, isInView };
}
