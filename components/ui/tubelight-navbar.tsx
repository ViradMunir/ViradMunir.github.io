"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Cpu, FolderKanban, Home, Mail, User, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import type { NavIcon } from "@/content/site";

export type NavItem = {
  name: string;
  href: string;
  icon: NavIcon;
};

const icons: Record<NavIcon, LucideIcon> = {
  home: Home,
  user: User,
  folder: FolderKanban,
  cpu: Cpu,
  mail: Mail,
};

type TubelightNavBarProps = {
  items: NavItem[];
  className?: string;
};

/**
 * Floating glass pill navigation. The active item gets a sliding highlight
 * and a glowing "tube light" on the pill's top edge that follows it.
 * Desktop: pinned to the top. Mobile: pinned to the bottom, icons only.
 */
export function TubelightNavBar({ items, className }: TubelightNavBarProps) {
  const [active, setActive] = useState(items[0]?.name ?? "");

  // Keep the lamp in sync with the section under the top 40% of the viewport.
  useEffect(() => {
    const sections = items
      .map((item) => ({ item, el: document.querySelector<HTMLElement>(item.href) }))
      .filter((s): s is { item: NavItem; el: HTMLElement } => Boolean(s.el));
    if (sections.length === 0) return;

    let raf = 0;
    const update = () => {
      raf = 0;
      const line = window.innerHeight * 0.4;
      let current = sections[0].item.name;
      for (const { item, el } of sections) {
        if (el.getBoundingClientRect().top <= line) current = item.name;
      }
      setActive((prev) => (prev === current ? prev : current));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [items]);

  return (
    <nav
      aria-label="Primary"
      className={cn(
        "fixed bottom-0 left-1/2 z-50 mb-5 -translate-x-1/2 sm:top-0 sm:bottom-auto sm:mb-0 sm:pt-6 short:pt-2",
        className,
      )}
    >
      <div
        className={cn(
          "flex items-center gap-1 rounded-full border border-border/70 px-1.5 py-1.5",
          "bg-background/60 shadow-[0_10px_40px_-12px_rgba(0,0,0,0.35)] backdrop-blur-xl",
          "supports-[backdrop-filter]:bg-background/50",
        )}
      >
        {items.map((item) => {
          const Icon = icons[item.icon];
          const isActive = active === item.name;

          return (
            <a
              key={item.name}
              href={item.href}
              onClick={() => setActive(item.name)}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "relative cursor-pointer rounded-full px-4 py-2 text-sm font-semibold transition-colors sm:px-5",
                "text-foreground/75 hover:text-foreground",
                isActive && "text-foreground",
              )}
            >
              <span className="hidden md:inline">{item.name}</span>
              <span className="md:hidden">
                <Icon size={18} strokeWidth={2.5} aria-label={item.name} />
              </span>

              {isActive && (
                <motion.span
                  layoutId="tubelight-lamp"
                  className="absolute inset-0 -z-10 w-full rounded-full bg-muted"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                  {/* The tube light on the pill's top edge + its glow */}
                  <span className="absolute -top-2 left-1/2 h-1 w-8 -translate-x-1/2 rounded-t-full bg-primary">
                    <span className="absolute -top-2 -left-2 h-6 w-12 rounded-full bg-primary/25 blur-md" />
                    <span className="absolute -top-1 h-6 w-8 rounded-full bg-primary/25 blur-md" />
                    <span className="absolute top-0 left-2 h-4 w-4 rounded-full bg-primary/25 blur-sm" />
                  </span>
                </motion.span>
              )}
            </a>
          );
        })}

        <span aria-hidden className="mx-1 h-5 w-px bg-border" />
        <ThemeToggle />
      </div>
    </nav>
  );
}
