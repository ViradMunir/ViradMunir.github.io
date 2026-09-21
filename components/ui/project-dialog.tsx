"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProjectCover } from "@/components/ui/project-cover";
import type { Project } from "@/content/site";
import { useMounted } from "@/hooks/use-mounted";
import { opensInNewTab } from "@/lib/utils";

type ProjectDialogProps = {
  project: Project | null;
  onClose: () => void;
};

export function ProjectDialog({ project, onClose }: ProjectDialogProps) {
  const mounted = useMounted();

  // Esc to close + lock page scroll while open
  useEffect(() => {
    if (!project) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [project, onClose]);

  // Portal to <body> so the overlay escapes <main>'s stacking context and
  // sits above the fixed navbar.
  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {project && (
        <motion.div
          key="backdrop"
          className="fixed inset-0 z-[80] flex items-end justify-center bg-black/60 p-0 backdrop-blur-sm sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="project-dialog-title"
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, y: 40, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 260, damping: 26 }}
            className="relative grid max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-t-3xl border border-border/70 bg-background shadow-2xl sm:rounded-3xl md:grid-cols-[0.9fr_1.1fr]"
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-border/70 bg-background/80 text-foreground/70 backdrop-blur transition-colors hover:text-foreground"
            >
              <X size={16} />
            </button>

            <div className="relative h-56 md:h-full">
              <ProjectCover
                image={project.image}
                fit={project.imageFit}
                position={project.imagePosition}
                tint={project.tint}
                alt={project.title}
              />
            </div>

            <div className="space-y-6 p-6 sm:p-8">
              <div className="space-y-2">
                <p className="eyebrow">
                  {project.category} · {project.year}
                </p>
                <h3
                  id="project-dialog-title"
                  className="font-heading text-2xl font-semibold leading-tight sm:text-3xl"
                >
                  {project.title}
                </h3>
                <p className="text-sm leading-relaxed text-foreground/65 sm:text-base">
                  {project.tagline}
                </p>
              </div>

              <ul className="space-y-2.5">
                {project.bullets.map((bullet) => (
                  <li key={bullet.slice(0, 32)} className="flex gap-3 text-sm leading-relaxed text-foreground/80">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>

              <div className="flex flex-wrap gap-1.5">
                {project.stack.map((tech) => (
                  <Badge
                    key={tech}
                    variant="secondary"
                    className="h-auto rounded-full px-2.5 py-0.5 text-[0.7rem] font-medium"
                  >
                    {tech}
                  </Badge>
                ))}
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                {project.links.map((link, i) => (
                  <Button
                    key={link.label}
                    variant={i === 0 ? "default" : "outline"}
                    className="rounded-full"
                    nativeButton={false}
                    render={
                      <a
                        href={link.href}
                        target={opensInNewTab(link.href) ? "_blank" : undefined}
                        rel="noreferrer"
                      />
                    }
                  >
                    {link.label}
                    <ArrowUpRight data-icon="inline-end" />
                  </Button>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
