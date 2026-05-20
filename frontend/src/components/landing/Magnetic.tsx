import { useRef, type ReactNode, type MouseEvent } from "react";

/**
 * <Magnetic> — button that subtly follows the cursor on hover,
 * with a sliding "→" arrow on hover-out.
 */
export function Magnetic({
  children,
  href,
  to,
  onClick,
  variant = "solid",
  className = "",
}: {
  children: ReactNode;
  href?: string;
  to?: string;
  onClick?: () => void;
  variant?: "solid" | "ghost";
  className?: string;
}) {
  const ref = useRef<HTMLAnchorElement | HTMLButtonElement | null>(null);

  function onMove(e: MouseEvent) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    el.style.transform = `translate(${x * 0.18}px, ${y * 0.25}px)`;
  }
  function onLeave() {
    const el = ref.current;
    if (el) el.style.transform = "translate(0,0)";
  }

  const cls = `magnetic ${variant === "ghost" ? "ghost" : ""} ${className}`;

  if (href || to) {
    return (
      <a
        ref={ref as React.MutableRefObject<HTMLAnchorElement>}
        href={href ?? to}
        onClick={onClick}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        className={cls}
      >
        {children}
      </a>
    );
  }
  return (
    <button
      ref={ref as React.MutableRefObject<HTMLButtonElement>}
      type="button"
      onClick={onClick}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={cls}
    >
      {children}
    </button>
  );
}
