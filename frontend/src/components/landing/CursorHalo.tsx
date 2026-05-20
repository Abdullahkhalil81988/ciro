import { useRef, useEffect } from "react";

/**
 * Soft red halo that follows the cursor on fine-pointer devices.
 * Hidden on touch / coarse-pointer.
 */
export function CursorHalo() {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    const el = ref.current;
    if (!el) return;

    let raf = 0;
    let tx = 0, ty = 0, x = 0, y = 0;

    const loop = () => {
      x += (tx - x) * 0.18;
      y += (ty - y) * 0.18;
      el.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
      raf = requestAnimationFrame(loop);
    };
    const onMove = (e: MouseEvent) => {
      tx = e.clientX; ty = e.clientY;
      el.classList.add("active");
    };
    const onOver = (e: MouseEvent) => {
      const target = e.target as Element;
      const grow = !!target.closest("a, button, [data-halo='grow']");
      el.classList.toggle("grow", grow);
    };
    const onLeave = () => el.classList.remove("active");

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseover", onOver);
    window.addEventListener("mouseleave", onLeave);
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
      window.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return <div ref={ref} className="cursor-halo" />;
}
