import { useRef, useEffect, type ReactNode, type CSSProperties } from "react";
import { useReveal } from "./useReveal";

/* =================================================================
 * <Reveal> — fades + slides up into place when it enters the viewport
 * ================================================================= */
export function Reveal({
  children,
  delay = 0,
  className = "",
  style,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const ref = useReveal<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={`reveal ${className}`}
      style={{ transitionDelay: `${delay}ms`, ...style }}
    >
      {children}
    </div>
  );
}

/* =================================================================
 * <RevealLines> — masked line-by-line reveal for big display heads.
 * Pass `lines` as HTML strings; each will animate up from below.
 * ================================================================= */
export function RevealLines({
  lines,
  className = "",
  stagger = 90,
  baseDelay = 0,
}: {
  lines: string[];
  className?: string;
  stagger?: number;
  baseDelay?: number;
}) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let fired = false;
    const fire = () => {
      fired = true;
      el.querySelectorAll(".reveal-line").forEach((line) => line.classList.add("in"));
    };
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            fire();
            io.unobserve(el);
          }
        });
      },
      { threshold: 0.2 }
    );
    io.observe(el);
    const fb = window.setTimeout(() => {
      if (!fired) {
        const r = el.getBoundingClientRect();
        if (r.top < window.innerHeight && r.bottom > 0) fire();
      }
    }, 600);
    return () => { io.disconnect(); window.clearTimeout(fb); };
  }, []);

  return (
    <div ref={ref} className={className}>
      {lines.map((line, i) => (
        <span key={i} className="reveal-line">
          <span
            style={{ ["--d" as never]: `${baseDelay + i * stagger}ms` } as CSSProperties}
            dangerouslySetInnerHTML={{ __html: line }}
          />
        </span>
      ))}
    </div>
  );
}

/* =================================================================
 * <DrawRule> — thin section divider that draws itself across in red
 * ================================================================= */
export function DrawRule({ className = "" }: { className?: string }) {
  const ref = useReveal<HTMLDivElement>();
  return <div ref={ref} className={`draw-rule ${className}`} />;
}
