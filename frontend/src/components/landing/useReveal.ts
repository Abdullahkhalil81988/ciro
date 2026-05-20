import { useRef, useEffect } from "react";

interface RevealOpts {
  threshold?: number;
  rootMargin?: string;
  once?: boolean;
}

/**
 * IntersectionObserver-backed fade-up reveal.
 * Returns a ref to attach to the element you want to reveal.
 */
export function useReveal<T extends HTMLElement = HTMLElement>(opts: RevealOpts = {}) {
  const ref = useRef<T | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let fired = false;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            el.classList.add("in");
            fired = true;
            if (opts.once !== false) io.unobserve(el);
          } else if (opts.once === false) {
            el.classList.remove("in");
          }
        });
      },
      {
        threshold: opts.threshold ?? 0.18,
        rootMargin: opts.rootMargin ?? "0px 0px -10% 0px",
      }
    );
    io.observe(el);

    // Fallback — force reveal if observer hasn't fired in 600ms
    // (handles iframe load / page-transition edge cases).
    const fallback = window.setTimeout(() => {
      if (!fired) {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) el.classList.add("in");
      }
    }, 600);

    return () => {
      io.disconnect();
      window.clearTimeout(fallback);
    };
  }, []);
  return ref;
}
