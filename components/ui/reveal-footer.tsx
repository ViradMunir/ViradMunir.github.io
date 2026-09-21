"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { cn, opensInNewTab } from "@/lib/utils";

export type FooterColumn = {
  title: string;
  links: { label: string; href: string; projectId?: string }[];
};

type RevealFooterProps = {
  brand: string;
  tagline: string;
  columns: FooterColumn[];
  legal?: { label: string; href: string }[];
  copyright: string;
  className?: string;
};

/**
 * "Curtain" footer: it sits behind the page (sticky to the viewport bottom,
 * z-index 0) and is revealed as the main content scrolls up and off it.
 * The page's <main> must be `relative z-10` with an opaque background.
 */
export function RevealFooter({
  brand,
  tagline,
  columns,
  legal = [],
  copyright,
  className,
}: RevealFooterProps) {
  const ref = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end end"],
  });
  const y = useTransform(scrollYProgress, [0, 1], reduceMotion ? [0, 0] : [48, 0]);
  const opacity = useTransform(scrollYProgress, [0, 0.6, 1], [0.35, 0.8, 1]);

  return (
    <footer
      ref={ref}
      className={cn(
        "sticky bottom-0 z-0 w-full bg-footer text-footer-foreground",
        className,
      )}
    >
      <motion.div
        style={{ y, opacity }}
        className="mx-auto flex w-full max-w-6xl flex-col gap-14 px-6 pb-24 pt-16 sm:px-10 sm:pb-8 md:gap-20 md:pt-20"
      >
        {/* Brand */}
        <div className="max-w-sm">
          <p className="font-heading text-lg font-semibold">{brand}</p>
          <p className="mt-3 text-sm leading-relaxed text-footer-foreground/70">
            {tagline}
          </p>
        </div>

        {/* Link columns */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-3">
          {columns.map((column) => (
            <div key={column.title}>
              <p className="mb-4 font-mono text-[0.65rem] uppercase tracking-[0.3em] text-footer-foreground/60">
                {column.title}
              </p>
              <ul className="space-y-2.5">
                {column.links.map((link) => (
                  <li key={`${column.title}-${link.label}`}>
                    <a
                      href={link.href}
                      data-project={link.projectId}
                      target={opensInNewTab(link.href) ? "_blank" : undefined}
                      rel={opensInNewTab(link.href) ? "noreferrer" : undefined}
                      className="group inline-flex items-center text-sm text-footer-foreground/85 transition-colors hover:text-footer-foreground"
                    >
                      <span className="relative">
                        {link.label}
                        <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-footer-foreground transition-all duration-300 group-hover:w-full" />
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col gap-4 border-t border-footer-foreground/15 pt-6 font-mono text-[0.65rem] uppercase tracking-[0.22em] text-footer-foreground/60 sm:flex-row sm:items-center sm:justify-between">
          <p>{copyright}</p>
          {legal.length > 0 && (
            <ul className="flex flex-wrap gap-6">
              {legal.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    className="transition-colors hover:text-footer-foreground"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </motion.div>
    </footer>
  );
}
