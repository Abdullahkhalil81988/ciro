export function Marquee({ items, className = "" }: { items: string[]; className?: string }) {
  // Triple the list so the loop never shows a seam
  const list = [...items, ...items, ...items];
  return (
    <div className={`overflow-hidden ${className}`}>
      <div className="marquee">
        {list.map((t, i) => (
          <span
            key={i}
            className="font-mono text-[11px] tracking-[0.22em] uppercase opacity-70 flex items-center gap-4"
          >
            {t} <span className="opacity-40">◇</span>
          </span>
        ))}
      </div>
    </div>
  );
}
