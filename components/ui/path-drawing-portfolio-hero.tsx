"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useMounted } from "@/hooks/use-mounted";

/* ------------------------------------------------------------------------ */
/* Canvas path-drawing text                                                  */
/*                                                                           */
/* The name is stroked on a <canvas> with an animated line-dash offset.      */
/* Canvas 2D is GPU-backed on iOS/iPadOS, so this stays smooth where an      */
/* animated SVG stroke (software-rasterised every frame in WebKit) stutters. */
/* ------------------------------------------------------------------------ */

type CanvasPathDrawingTextProps = {
  text: string;
  /** Gradient colours; CSS custom properties (var(--x)) are resolved at runtime */
  fromColor?: string;
  toColor?: string;
  /** Stroke width in layout units (viewBox space) */
  strokeWidth?: number;
  /** Seconds for one draw pass */
  durationSec?: number;
  /** Seconds to hold the finished name before redrawing */
  holdSec?: number;
  loop?: boolean;
  /** Layout space the text is designed in; scales to the container width */
  viewBoxWidth?: number;
  viewBoxHeight?: number;
  fontSize?: number;
  className?: string;
};

const FONT_FAMILY = "Arial, Helvetica, sans-serif";
const FILL_FADE_SEC = 1;
const DIM_FILL_ALPHA = 0.05; // faint fill that stays on in dark mode

function fontString(px: number) {
  return `bold ${px}px ${FONT_FAMILY}`;
}

/** Resolve "var(--name)" against the document, else return the value as-is. */
function resolveColor(value: string) {
  const m = value.match(/^var\((--[\w-]+)\)$/);
  if (!m) return value;
  return getComputedStyle(document.documentElement).getPropertyValue(m[1]).trim() || "#888";
}

function countOpaque(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const data = ctx.getImageData(0, 0, w, h).data;
  let n = 0;
  for (let i = 3; i < data.length; i += 4) if (data[i] > 12) n += 1;
  return n;
}

/**
 * Smallest dash (in viewBox units) whose stroke renders the same ink as the
 * finished glyphs. Dashes restart per glyph, so this is the longest outline.
 */
function measureDashLength(
  text: string,
  fontSize: number,
  strokeWidth: number,
  vbW: number,
  vbH: number,
) {
  const scale = 0.45;
  const w = Math.max(1, Math.round(vbW * scale));
  const h = Math.max(1, Math.round(vbH * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return Math.ceil(text.length * fontSize * 0.7);

  const paint = (dash: number | null) => {
    ctx.clearRect(0, 0, w, h);
    ctx.save();
    ctx.scale(scale, scale);
    ctx.font = fontString(fontSize);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.lineWidth = strokeWidth;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.strokeStyle = "#fff";
    ctx.setLineDash(dash === null ? [] : [dash, 100000]);
    ctx.lineDashOffset = 0;
    ctx.strokeText(text, vbW / 2, vbH / 2);
    ctx.restore();
    return countOpaque(ctx, w, h);
  };

  const full = paint(null);
  if (full <= 0) return Math.ceil(text.length * fontSize * 0.7);
  const covered = (dash: number) => paint(dash) >= full * 0.999;

  let hi = 64;
  while (hi < 24000 && !covered(hi)) hi *= 2;
  let lo = 1;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (covered(mid)) hi = mid;
    else lo = mid + 1;
  }
  return Math.ceil(lo * 1.03);
}

function CanvasPathDrawingText({
  text,
  fromColor = "var(--hero-from)",
  toColor = "var(--hero-to)",
  strokeWidth = 2,
  durationSec = 5.5,
  holdSec = 4,
  loop = true,
  viewBoxWidth = 800,
  viewBoxHeight = 160,
  fontSize = 88,
  className,
}: CanvasPathDrawingTextProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduceMotion = useReducedMotion();
  const display = text.trim();

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap || !display) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let cancelled = false;
    let raf = 0;
    let dashUnits = 0; // measured outline length in viewBox units
    let scale = 1; // css px per viewBox unit
    let dpr = 1;
    let colors = { from: resolveColor(fromColor), to: resolveColor(toColor) };
    let isDark = document.documentElement.classList.contains("dark");
    let startTime = 0;
    let lastKey = "";

    const drawSec = Math.max(0.8, durationSec);
    const cycleSec = loop ? drawSec + Math.max(0, holdSec) : Infinity;

    const layout = () => {
      const cssW = wrap.clientWidth;
      if (cssW <= 0) return;
      scale = cssW / viewBoxWidth;
      const cssH = viewBoxHeight * scale;
      dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.style.width = `${cssW}px`;
      canvas.style.height = `${cssH}px`;
      canvas.width = Math.round(cssW * dpr);
      canvas.height = Math.round(cssH * dpr);
      lastKey = ""; // force a repaint at the new size
    };

    /** Paint one frame. offset/dash in viewBox units; fillAlpha 0..1 */
    const paint = (offsetUnits: number, dashNow: number | null, fillAlpha: number) => {
      const key = `${offsetUnits.toFixed(2)}|${dashNow}|${fillAlpha.toFixed(3)}|${isDark}`;
      if (key === lastKey) return; // nothing changed — skip the repaint
      lastKey = key;

      const k = scale * dpr;
      ctx.setTransform(k, 0, 0, k, 0, 0);
      ctx.clearRect(0, 0, viewBoxWidth, viewBoxHeight);
      ctx.font = fontString(fontSize);
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const grad = ctx.createLinearGradient(0, 0, viewBoxWidth, 0);
      grad.addColorStop(0, colors.from);
      grad.addColorStop(1, colors.to);

      if (fillAlpha > 0) {
        ctx.globalAlpha = fillAlpha;
        ctx.fillStyle = grad;
        ctx.fillText(display, viewBoxWidth / 2, viewBoxHeight / 2);
        ctx.globalAlpha = 1;
      }

      ctx.lineWidth = strokeWidth;
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      ctx.strokeStyle = grad;
      ctx.setLineDash(dashNow === null ? [] : [dashNow, dashNow]);
      ctx.lineDashOffset = offsetUnits;
      ctx.strokeText(display, viewBoxWidth / 2, viewBoxHeight / 2);
    };

    const paintFinished = () => paint(0, null, isDark ? DIM_FILL_ALPHA : 1);

    const tick = (now: number) => {
      if (cancelled) return;
      if (!startTime) startTime = now;
      const t = (now - startTime) / 1000;
      const phase = loop ? t % cycleSec : Math.min(t, drawSec);
      const dash = dashUnits * 1.08; // a little longer than the outline → always completes

      if (phase < drawSec) {
        // Drawing: outline only in light mode (fill fades out over the first
        // second of a redraw), faint constant fill in dark mode.
        const firstPass = t < drawSec;
        const fill = isDark
          ? DIM_FILL_ALPHA
          : firstPass
            ? 0
            : Math.max(0, 1 - phase / FILL_FADE_SEC);
        paint(dash * (1 - phase / drawSec), dash, fill);
      } else {
        // Holding: fade the fill in (light mode), then sit still.
        const held = phase - drawSec;
        const fill = isDark ? DIM_FILL_ALPHA : Math.min(1, held / FILL_FADE_SEC);
        paint(0, null, fill);
        if (!loop && held > FILL_FADE_SEC) return; // finished, stop the loop
      }
      raf = requestAnimationFrame(tick);
    };

    const start = async () => {
      try {
        await document.fonts.ready;
      } catch {
        /* ignore */
      }
      if (cancelled) return;
      layout();
      dashUnits = measureDashLength(display, fontSize, strokeWidth, viewBoxWidth, viewBoxHeight);
      canvas.style.visibility = "visible";
      if (reduceMotion) {
        paintFinished();
        return;
      }
      raf = requestAnimationFrame(tick);
    };

    const ro = new ResizeObserver(() => {
      layout();
      if (reduceMotion) paintFinished();
    });
    ro.observe(wrap);

    // Re-resolve palette colours when the theme class flips.
    const mo = new MutationObserver(() => {
      isDark = document.documentElement.classList.contains("dark");
      colors = { from: resolveColor(fromColor), to: resolveColor(toColor) };
      lastKey = "";
      if (reduceMotion) paintFinished();
    });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    void start();
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      mo.disconnect();
    };
  }, [
    display,
    fromColor,
    toColor,
    strokeWidth,
    durationSec,
    holdSec,
    loop,
    viewBoxWidth,
    viewBoxHeight,
    fontSize,
    reduceMotion,
  ]);

  if (!display) return null;

  return (
    <div
      ref={wrapRef}
      className={cn("flex w-full items-center justify-center py-4 sm:py-6", className)}
    >
      <canvas
        ref={canvasRef}
        role="img"
        aria-label={display}
        className="block max-w-full"
        style={{ visibility: "hidden", aspectRatio: `${viewBoxWidth} / ${viewBoxHeight}`, width: "100%" }}
      />
    </div>
  );
}

/* ------------------------------------------------------------------------ */

export type PathDrawingPortfolioHeroProps = {
  /** Display name (brand / person) drawn large as a stroked path */
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
      <div className="relative z-10 flex w-full max-w-6xl flex-col items-center px-6 pb-24 pt-24 text-center sm:px-10 sm:pb-28 short:pb-12 short:pt-20">
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
          <CanvasPathDrawingText
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
