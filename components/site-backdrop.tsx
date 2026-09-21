"use client";

import { useEffect, useRef } from "react";

/**
 * Fixed page backdrop: dotted grid, two brand glows and a soft spotlight
 * that follows the pointer. Sits behind all section content.
 */
export function SiteBackdrop() {
  const spotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = spotRef.current;
    if (!el) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    let raf = 0;
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 3;

    const paint = () => {
      el.style.setProperty("--mx", `${x}px`);
      el.style.setProperty("--my", `${y}px`);
      raf = 0;
    };
    const onMove = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      if (!raf) raf = requestAnimationFrame(paint);
    };

    paint();
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="bg-dots absolute inset-0 opacity-60 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />
      <div className="absolute -top-40 left-1/2 h-[60vh] w-[80vw] -translate-x-1/2 rounded-full bg-brand/20 blur-[120px]" />
      <div className="absolute -bottom-32 right-[-10vw] h-[50vh] w-[50vw] rounded-full bg-brand-2/15 blur-[120px]" />
      <div
        ref={spotRef}
        className="absolute inset-0 transition-opacity duration-500"
        style={{
          background:
            "radial-gradient(520px circle at var(--mx, 50%) var(--my, 30%), color-mix(in oklch, var(--brand) 14%, transparent), transparent 70%)",
        }}
      />
    </div>
  );
}
