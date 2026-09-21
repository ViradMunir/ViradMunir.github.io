"use client";

import type { MouseEvent } from "react";
import { flushSync } from "react-dom";
import { useTheme } from "next-themes";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMounted } from "@/hooks/use-mounted";

type DocumentWithVT = Document & {
  startViewTransition?: (cb: () => void) => { ready: Promise<void> };
};

/**
 * Sun / moon toggle. On browsers that support the View Transitions API the
 * new theme sweeps across the page as a circle growing out of the button.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const reduceMotion = useReducedMotion();
  const mounted = useMounted();

  const isDark = resolvedTheme === "dark";

  const toggle = (e: MouseEvent<HTMLButtonElement>) => {
    const next = isDark ? "light" : "dark";
    const doc = document as DocumentWithVT;

    if (!doc.startViewTransition || reduceMotion) {
      setTheme(next);
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const radius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y),
    );

    const transition = doc.startViewTransition(() => {
      // Apply the class synchronously so the snapshot captures the new theme.
      document.documentElement.classList.toggle("dark", next === "dark");
      flushSync(() => setTheme(next));
    });

    transition.ready.then(() => {
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${radius}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration: 650,
          easing: "cubic-bezier(0.22, 1, 0.36, 1)",
          pseudoElement: "::view-transition-new(root)",
        },
      );
    });
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={mounted ? `Switch to ${isDark ? "light" : "dark"} mode` : "Toggle theme"}
      title={mounted ? `Switch to ${isDark ? "light" : "dark"} mode` : undefined}
      className={cn(
        "relative flex h-9 w-9 items-center justify-center rounded-full",
        "text-foreground/80 transition-colors hover:bg-muted hover:text-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60",
        className,
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        {mounted && isDark ? (
          <motion.span
            key="sun"
            initial={{ rotate: -90, scale: 0.4, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            exit={{ rotate: 90, scale: 0.4, opacity: 0 }}
            transition={{ type: "spring", stiffness: 380, damping: 22 }}
            className="flex"
          >
            <Sun size={17} strokeWidth={2.25} />
          </motion.span>
        ) : (
          <motion.span
            key="moon"
            initial={{ rotate: 90, scale: 0.4, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            exit={{ rotate: -90, scale: 0.4, opacity: 0 }}
            transition={{ type: "spring", stiffness: 380, damping: 22 }}
            className="flex"
          >
            <Moon size={17} strokeWidth={2.25} />
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}
