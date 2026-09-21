"use client";

import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useMounted } from "@/hooks/use-mounted";

type SvgPathDrawingTextAnimationProps = {
  text: string;
  fromColor?: string;
  toColor?: string;
  strokeWidth?: number;
  /** Seconds for one full draw pass */
  durationSec?: number;
  /** Restart from the beginning after the draw finishes */
  loop?: boolean;
  /** Seconds to hold the fully drawn name before the next pass */
  holdSec?: number;
  viewBoxWidth?: number;
  viewBoxHeight?: number;
  fontSize?: number;
  className?: string;
};

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("svg raster failed"));
    img.src = url;
  });
}

function countOpaque(ctx: CanvasRenderingContext2D, w: number, h: number): number {
  const data = ctx.getImageData(0, 0, w, h).data;
  let n = 0;
  for (let i = 3; i < data.length; i += 4) {
    if (data[i] > 12) n += 1;
  }
  return n;
}

async function rasterInk(
  source: SVGSVGElement,
  apply: (text: SVGTextElement) => void,
): Promise<number> {
  const clone = source.cloneNode(true) as SVGSVGElement;
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  const text = clone.querySelector("text");
  if (!text) return 0;
  apply(text as SVGTextElement);
  text.setAttribute("stroke", "#ffffff");
  (text as SVGTextElement).style.stroke = "#ffffff";
  // Measure the outline only — the on-screen glyph also carries a faint fill.
  text.setAttribute("fill", "none");
  (text as SVGTextElement).style.fill = "none";

  const vb = source.viewBox.baseVal;
  const w = Math.max(1, Math.round(vb.width || 800));
  const h = Math.max(1, Math.round(vb.height || 160));
  clone.setAttribute("width", String(w));
  clone.setAttribute("height", String(h));
  clone.style.visibility = "visible";

  const xml = new XMLSerializer().serializeToString(clone);
  const blob = new Blob([xml], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  try {
    const img = await loadImage(url);
    const cw = Math.max(1, Math.round(w * 0.45));
    const ch = Math.max(1, Math.round(h * 0.45));
    const canvas = document.createElement("canvas");
    canvas.width = cw;
    canvas.height = ch;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return 0;
    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(img, 0, 0, cw, ch);
    return countOpaque(ctx, cw, ch);
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** Smallest dash length that renders the same ink as the finished glyph */
async function measureExactDashLength(svg: SVGSVGElement): Promise<number> {
  const full = await rasterInk(svg, (text) => {
    text.style.strokeDasharray = "none";
    text.style.strokeDashoffset = "0";
  });
  if (full <= 0) {
    throw new Error("empty ink");
  }

  const covered = async (dash: number) => {
    const ink = await rasterInk(svg, (text) => {
      text.style.strokeDasharray = `${dash} 100000`;
      text.style.strokeDashoffset = "0";
    });
    // Near-exact: a looser tolerance leaves the tail of the longest glyph
    // outline (e.g. the "M") undrawn.
    return ink >= full * 0.999;
  };

  let hi = 64;
  while (hi < 24000 && !(await covered(hi))) {
    hi *= 2;
  }

  let lo = 1;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (await covered(mid)) hi = mid;
    else lo = mid + 1;
  }

  // Small safety margin over the measured minimum.
  return Math.max(1, Math.ceil(lo * 1.03));
}

/**
 * Draws SVG text via stroke-dashoffset. The loop restarts exactly when the
 * real glyph is fully drawn, so it never idles on the finished shape.
 */
function SvgPathDrawingTextAnimation({
  text,
  fromColor = "var(--hero-from)",
  toColor = "var(--hero-to)",
  strokeWidth = 2,
  durationSec = 5.5,
  loop = true,
  holdSec = 4,
  viewBoxWidth = 800,
  viewBoxHeight = 160,
  fontSize = 88,
  className,
}: SvgPathDrawingTextAnimationProps) {
  const reactId = useId().replace(/:/g, "");
  const gradientId = `pathGradient-${reactId}`;
  const svgRef = useRef<SVGSVGElement>(null);
  const textRef = useRef<SVGTextElement>(null);
  const [dashLength, setDashLength] = useState(0);
  const reduceMotion = useReducedMotion();
  const display = text.trim();

  useEffect(() => {
    if (!display || reduceMotion) return;
    const svg = svgRef.current;
    if (!svg) return;

    let cancelled = false;
    const run = async () => {
      try {
        await document.fonts.ready;
        if (cancelled || !svgRef.current) return;
        const dash = await measureExactDashLength(svgRef.current);
        if (!cancelled) setDashLength(dash);
      } catch {
        const el = textRef.current;
        if (!el || cancelled) return;
        const width = el.getComputedTextLength() || display.length * fontSize * 0.62;
        setDashLength(Math.max(1, Math.ceil(width * 1.15)));
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [display, fontSize, viewBoxWidth, strokeWidth, reduceMotion]);

  useLayoutEffect(() => {
    const el = textRef.current;
    if (!el) return;
    if (reduceMotion || dashLength <= 0) {
      el.style.strokeDashoffset = "0";
      el.style.strokeDasharray = "none";
      if (reduceMotion) el.setAttribute("data-drawn", "");
      return;
    }

    el.style.strokeDasharray = `${dashLength} ${dashLength}`;
    el.style.strokeDashoffset = String(dashLength);

    const drawMs = Math.max(0.8, durationSec) * 1000;
    const unitsPerMs = dashLength / drawMs;
    let offset = dashLength;
    let last = performance.now();
    let raf = 0;
    let holdUntil = 0;

    const tick = (now: number) => {
      const dt = Math.min(48, now - last);
      last = now;

      // Fully drawn: hold the finished name, then restart if looping.
      if (holdUntil) {
        if (now >= holdUntil) {
          holdUntil = 0;
          offset = dashLength;
          el.removeAttribute("data-drawn");
          el.style.strokeDasharray = `${dashLength} ${dashLength}`;
          el.style.strokeDashoffset = String(offset);
        }
        raf = window.requestAnimationFrame(tick);
        return;
      }

      offset -= unitsPerMs * dt;
      if (offset <= 0) {
        // Drop the dash pattern so the finished outline is always complete,
        // whatever the measurement came out as.
        el.style.strokeDashoffset = "0";
        el.style.strokeDasharray = "none";
        el.setAttribute("data-drawn", "");
        if (!loop) return;
        holdUntil = now + Math.max(0, holdSec) * 1000;
        raf = window.requestAnimationFrame(tick);
        return;
      }
      el.style.strokeDashoffset = String(offset);
      raf = window.requestAnimationFrame(tick);
    };

    raf = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(raf);
  }, [dashLength, durationSec, loop, holdSec, reduceMotion]);

  if (!display) return null;

  const ready = dashLength > 0 || Boolean(reduceMotion);

  return (
    <div
      className={cn(
        "flex w-full items-center justify-center py-4 sm:py-6",
        className,
      )}
    >
      <svg
        ref={svgRef}
        width={viewBoxWidth}
        height={viewBoxHeight}
        viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
        className="h-auto w-full max-w-full"
        role="img"
        aria-label={display}
        style={{ visibility: ready ? "visible" : "hidden" }}
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style={{ stopColor: fromColor }} />
            <stop offset="100%" style={{ stopColor: toColor }} />
          </linearGradient>
        </defs>

        <text
          ref={textRef}
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="middle"
          fill={`url(#${gradientId})`}
          className="path-drawing-glyph"
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
          strokeLinecap="round"
          fontSize={fontSize}
          fontWeight="bold"
          fontFamily="Arial, Helvetica, sans-serif"
          letterSpacing="0.02em"
        >
          {display}
        </text>
      </svg>
    </div>
  );
}

export type PathDrawingPortfolioHeroProps = {
  /** Display name (brand / person) drawn large as an SVG path */
  brand: string;
  /** Short role or tagline under the name */
  tagline?: string;
  /** Small label above the name (e.g. Portfolio) */
  eyebrow?: string;
  /** Gradient start color */
  fromColor?: string;
  /** Gradient end color */
  toColor?: string;
  /** Extra slot rendered under the tagline (CTAs, stats, ...) */
  children?: ReactNode;
  className?: string;
};

/**
 * Portfolio hero: path-drawn name on loop + soft entrance fade.
 * Transparent background — place it over your own page backdrop.
 */
export default function PathDrawingPortfolioHero({
  brand,
  tagline = "Freelance Designer",
  eyebrow = "Portfolio",
  fromColor,
  toColor,
  children,
  className,
}: PathDrawingPortfolioHeroProps) {
  const name = brand.trim();
  const reduceMotion = useReducedMotion();
  const ready = useMounted();

  if (!name) return null;

  const instant = Boolean(reduceMotion) || !ready;
  const ease = [0.22, 1, 0.36, 1] as const;

  return (
    <section
      data-path-drawing-hero
      className={cn(
        "relative flex min-h-screen w-full flex-col items-center justify-center",
        "bg-transparent text-foreground",
        className,
      )}
    >
      <div className="relative z-10 flex w-full max-w-6xl flex-col items-center px-6 pb-24 pt-24 text-center sm:px-10 sm:pb-28">
        {eyebrow ? (
          <motion.p
            className="eyebrow mb-6 sm:mb-8"
            initial={instant ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease }}
          >
            {eyebrow}
          </motion.p>
        ) : null}

        <h1 className="sr-only">{name}</h1>
        <motion.div
          className="w-full"
          initial={instant ? false : { opacity: 0, scale: 0.985 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.12, ease }}
        >
          <SvgPathDrawingTextAnimation
            text={name}
            fromColor={fromColor}
            toColor={toColor}
            className="w-full"
            fontSize={name.length > 12 ? 84 : name.length > 8 ? 112 : 148}
            viewBoxWidth={name.length > 8 ? 1100 : 860}
            viewBoxHeight={name.length > 8 ? 200 : 240}
            strokeWidth={2.6}
            durationSec={4.5}
            holdSec={5}
            loop
          />
        </motion.div>

        {tagline ? (
          <motion.p
            className="mt-1 max-w-xl text-base leading-relaxed text-foreground/70 sm:mt-2 sm:text-lg"
            initial={instant ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.55, ease }}
          >
            {tagline}
          </motion.p>
        ) : null}

        {children ? (
          <motion.div
            className="mt-8 w-full"
            initial={instant ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.8, ease }}
          >
            {children}
          </motion.div>
        ) : null}
      </div>


    </section>
  );
}
