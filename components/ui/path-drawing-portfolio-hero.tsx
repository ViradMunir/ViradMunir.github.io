"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useMounted } from "@/hooks/use-mounted";

/* ------------------------------------------------------------------------ */
/* Canvas path-drawing text                                                  */
/*                                                                           */
/* The name's glyph outlines are read from a bundled font (opentype.js) and  */
/* stroked on a <canvas> as a Path2D with an animated line-dash offset.      */
/* Canvas 2D is GPU-backed on iOS/iPadOS, so this stays smooth where an      */
/* animated SVG stroke stutters — and, unlike strokeText(), a real path      */
/* honours setLineDash in every browser (Safari ignores dashes on text).     */
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
  /** Fraction of the viewBox width the text should span */
  widthFraction?: number;
  className?: string;
};

const FONT_URL = "/fonts/SpaceGrotesk-Bold.ttf";
const FILL_FADE_SEC = 1;
const DIM_FILL_ALPHA = 0.05; // faint fill that stays on in dark mode

type Glyphs = {
  path: Path2D;
  /** translation that centres the outlines in the viewBox */
  tx: number;
  ty: number;
  /** longest single contour — the dash must cover it to finish the draw */
  maxContour: number;
};

/** Resolve "var(--name)" against the document, else return the value as-is. */
function resolveColor(value: string) {
  const m = value.match(/^var\((--[\w-]+)\)$/);
  if (!m) return value;
  return getComputedStyle(document.documentElement).getPropertyValue(m[1]).trim() || "#888";
}

type Cmd = {
  type: string;
  x?: number;
  y?: number;
  x1?: number;
  y1?: number;
  x2?: number;
  y2?: number;
};

/** Length of the longest closed contour, flattening curves. */
function longestContour(cmds: Cmd[]) {
  let max = 0;
  let cur = 0;
  let px = 0;
  let py = 0;
  let sx = 0;
  let sy = 0;
  const seg = (x: number, y: number) => {
    cur += Math.hypot(x - px, y - py);
    px = x;
    py = y;
  };
  for (const c of cmds) {
    if (c.type === "M") {
      max = Math.max(max, cur);
      cur = 0;
      px = sx = c.x ?? 0;
      py = sy = c.y ?? 0;
    } else if (c.type === "L") {
      seg(c.x ?? 0, c.y ?? 0);
    } else if (c.type === "Q" || c.type === "C") {
      const x0 = px;
      const y0 = py;
      const N = 12;
      for (let i = 1; i <= N; i++) {
        const t = i / N;
        const u = 1 - t;
        let x: number;
        let y: number;
        if (c.type === "Q") {
          x = u * u * x0 + 2 * u * t * (c.x1 ?? 0) + t * t * (c.x ?? 0);
          y = u * u * y0 + 2 * u * t * (c.y1 ?? 0) + t * t * (c.y ?? 0);
        } else {
          x = u ** 3 * x0 + 3 * u * u * t * (c.x1 ?? 0) + 3 * u * t * t * (c.x2 ?? 0) + t ** 3 * (c.x ?? 0);
          y = u ** 3 * y0 + 3 * u * u * t * (c.y1 ?? 0) + 3 * u * t * t * (c.y2 ?? 0) + t ** 3 * (c.y ?? 0);
        }
        seg(x, y);
      }
    } else if (c.type === "Z") {
      seg(sx, sy);
      max = Math.max(max, cur);
      cur = 0;
    }
  }
  return Math.max(max, cur);
}

/** Load the font and build centred glyph outlines for the text. */
async function buildGlyphs(
  text: string,
  vbW: number,
  vbH: number,
  widthFraction: number,
): Promise<Glyphs> {
  const [{ parse }, buffer] = await Promise.all([
    import("opentype.js"),
    fetch(FONT_URL).then((r) => r.arrayBuffer()),
  ]);
  const font = parse(buffer);
  const opts = { kerning: true, letterSpacing: 0.02 };

  // Size the text to the requested width (and never taller than the box).
  const probe = font.getPath(text, 0, 0, 100, opts).getBoundingBox();
  const probeW = probe.x2 - probe.x1;
  const probeH = probe.y2 - probe.y1;
  const size = Math.min((vbW * widthFraction * 100) / probeW, (vbH * 0.8 * 100) / probeH);

  const glyphPath = font.getPath(text, 0, 0, size, opts);
  const box = glyphPath.getBoundingBox();
  const tx = vbW / 2 - (box.x1 + box.x2) / 2;
  const ty = vbH / 2 - (box.y1 + box.y2) / 2;

  return {
    path: new Path2D(glyphPath.toPathData(3)),
    tx,
    ty,
    maxContour: longestContour(glyphPath.commands as Cmd[]),
  };
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
  widthFraction = 0.9,
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
    let glyphs: Glyphs | null = null;
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
      if (!glyphs) return;
      const key = `${offsetUnits.toFixed(2)}|${dashNow}|${fillAlpha.toFixed(3)}|${isDark}`;
      if (key === lastKey) return; // nothing changed — skip the repaint
      lastKey = key;

      const k = scale * dpr;
      ctx.setTransform(k, 0, 0, k, 0, 0);
      ctx.clearRect(0, 0, viewBoxWidth, viewBoxHeight);
      ctx.translate(glyphs.tx, glyphs.ty);

      const grad = ctx.createLinearGradient(-glyphs.tx, 0, viewBoxWidth - glyphs.tx, 0);
      grad.addColorStop(0, colors.from);
      grad.addColorStop(1, colors.to);

      if (fillAlpha > 0) {
        ctx.globalAlpha = fillAlpha;
        ctx.fillStyle = grad;
        ctx.fill(glyphs.path);
        ctx.globalAlpha = 1;
      }

      ctx.lineWidth = strokeWidth;
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      ctx.strokeStyle = grad;
      ctx.setLineDash(dashNow === null ? [] : [dashNow, dashNow]);
      ctx.lineDashOffset = offsetUnits;
      ctx.stroke(glyphs.path);
    };

    const paintFinished = () => paint(0, null, isDark ? DIM_FILL_ALPHA : 1);

    const tick = (now: number) => {
      if (cancelled || !glyphs) return;
      if (!startTime) startTime = now;
      const t = (now - startTime) / 1000;
      const phase = loop ? t % cycleSec : Math.min(t, drawSec);
      const dash = glyphs.maxContour * 1.05; // a little longer than the longest contour → always completes

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
        glyphs = await buildGlyphs(display, viewBoxWidth, viewBoxHeight, widthFraction);
      } catch {
        return; // font unavailable — the sr-only <h1> still carries the name
      }
      if (cancelled) return;
      layout();
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
    widthFraction,
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
            viewBoxWidth={name.length > 8 ? 1100 : 860}
            viewBoxHeight={name.length > 8 ? 200 : 240}
            widthFraction={0.86}
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
