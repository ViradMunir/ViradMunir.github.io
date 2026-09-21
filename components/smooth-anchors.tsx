"use client";

import { useEffect } from "react";

/**
 * Smooth-scrolls same-page anchor links (`<a href="#section">`) in JS.
 * CSS `scroll-behavior: smooth` is avoided on purpose: GSAP ScrollTrigger
 * sets scroll positions programmatically while pinning and the CSS property
 * turns those into animated jumps.
 */
export function SmoothAnchors() {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey) return;
      const anchor = (e.target as Element | null)?.closest<HTMLAnchorElement>('a[href^="#"]');
      if (!anchor) return;
      const id = decodeURIComponent(anchor.getAttribute("href")!.slice(1));
      if (!id) return;
      const target = document.getElementById(id);
      if (!target) return;

      e.preventDefault();
      target.scrollIntoView({ behavior: reduce.matches ? "auto" : "smooth", block: "start" });
      history.pushState(null, "", `#${id}`);
    };

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return null;
}
