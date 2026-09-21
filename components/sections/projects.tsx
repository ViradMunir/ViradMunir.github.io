"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowUpRight, ChevronsRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ProjectCover } from "@/components/ui/project-cover";
import { ProjectDialog } from "@/components/ui/project-dialog";
import { RadialScrollGallery } from "@/components/ui/portfolio-and-image-gallery";
import { projects, type Project } from "@/content/site";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";

/**
 * Touch devices and small/short screens get a swipeable strip instead of the
 * scroll-pinned wheel. The wheel relies on GSAP pinning, which is fragile on
 * mobile browsers whose toolbars resize the viewport while scrolling.
 */
const MOBILE_LAYOUT_QUERY =
  "(pointer: coarse), (max-width: 767px), (max-height: 560px)";

function ProjectCard({
  project,
  isActive,
  className,
}: {
  project: Project;
  isActive: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border border-border bg-card shadow-lg",
        className,
      )}
    >
      <div
        className={cn(
          "absolute inset-0 transition-transform duration-700 ease-out",
          isActive ? "scale-110" : "scale-100",
        )}
      >
        <ProjectCover
          image={project.image}
          fit={project.imageFit}
          position={project.imagePosition}
          tint={project.tint}
          alt={project.title}
        />
      </div>

      <div className="absolute inset-0 flex flex-col justify-between p-4">
        <div className="flex items-start justify-between">
          <Badge
            variant="secondary"
            className="h-auto bg-background/80 px-2 py-0.5 text-[0.62rem] backdrop-blur"
          >
            {project.category}
          </Badge>
          <div
            className={cn(
              "flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground transition-all duration-500",
              isActive ? "rotate-0 opacity-100" : "-rotate-45 opacity-0",
            )}
          >
            <ArrowUpRight size={12} />
          </div>
        </div>

        <div
          className={cn(
            "rounded-lg bg-background/80 px-3 py-2.5 backdrop-blur-sm transition-transform duration-500 short:px-2 short:py-1.5",
            isActive ? "translate-y-0" : "translate-y-2",
          )}
        >
          <p className="font-mono text-[0.6rem] uppercase tracking-[0.25em] text-foreground/50">
            {project.year}
          </p>
          <h3 className="mt-1 font-heading text-base font-semibold leading-tight text-foreground sm:text-lg short:text-xs">
            {project.title}
          </h3>
          <div
            className={cn(
              "mt-2 h-0.5 bg-brand transition-all duration-500",
              isActive ? "w-full opacity-100" : "w-0 opacity-0",
            )}
          />
        </div>
      </div>
    </div>
  );
}

export function ProjectsSection() {
  const [selected, setSelected] = useState<Project | null>(null);
  const close = useCallback(() => setSelected(null), []);
  const mobileLayout = useMediaQuery(MOBILE_LAYOUT_QUERY);

  // Any link carrying data-project="<id>" (skills panel, footer) jumps to this
  // section and opens that project's dialog.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      // (SmoothAnchors may already have preventDefault-ed the same click.)
      if (e.button !== 0 || e.metaKey || e.ctrlKey) return;
      const link = (e.target as Element | null)?.closest<HTMLElement>("[data-project]");
      if (!link) return;
      const project = projects.find((p) => p.id === link.dataset.project);
      if (!project) return;
      e.preventDefault();
      document.getElementById("projects")?.scrollIntoView({ behavior: "instant", block: "start" });
      history.pushState(null, "", "#projects");
      setSelected(project);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return (
    <section id="projects" className="relative scroll-mt-24 pt-6 md:pt-8">
      <p className="eyebrow mx-auto max-w-6xl px-6 text-center text-brand sm:px-10">02 — Featured projects</p>

      {mobileLayout ? (
        /* Swipeable strip: plain scroll-snap, no pinning. */
        <div className="mt-8">
          <ul
            className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-4 sm:px-10 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            style={{ scrollPaddingInline: "1.5rem" }}
          >
            {projects.map((project) => (
              <li key={project.id} className="shrink-0 snap-start">
                <button
                  type="button"
                  onClick={() => setSelected(project)}
                  className="block rounded-xl text-left focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  aria-label={`Open ${project.title}`}
                >
                  <ProjectCard
                    project={project}
                    isActive
                    className="h-[300px] w-[224px] short:h-[210px] short:w-[158px]"
                  />
                </button>
              </li>
            ))}
            {/* trailing spacer so the last card can snap fully into view */}
            <li aria-hidden className="w-2 shrink-0 sm:w-6" />
          </ul>
          <p className="mt-2 flex items-center justify-center gap-1 font-mono text-[0.62rem] uppercase tracking-[0.25em] text-foreground/45">
            swipe <ChevronsRight size={12} />
          </p>
        </div>
      ) : (
        <RadialScrollGallery
          className="!min-h-0"
          topSpace={140}
          baseRadius={390}
          mobileRadius={250}
          visiblePercentage={50}
          scrollDuration={2200}
          onItemSelect={(index) => setSelected(projects[index])}
        >
          {(hoveredIndex) =>
            projects.map((project, index) => (
              <ProjectCard
                key={project.id}
                project={project}
                isActive={hoveredIndex === index}
                className="h-[320px] w-[240px]"
              />
            ))
          }
        </RadialScrollGallery>
      )}

      {/* Flat index — keyboard friendly and a quick overview */}
      <div className="mx-auto max-w-6xl px-6 pb-8 pt-6 sm:px-10">
        <ol className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
          {projects.map((project, i) => (
            <li key={project.id}>
              <button
                type="button"
                onClick={() => setSelected(project)}
                className="group flex w-full items-start gap-3 rounded-xl border border-border/60 bg-card/50 px-4 py-3 text-left transition-all hover:-translate-y-0.5 hover:border-brand/50 hover:shadow-md"
              >
                <span className="font-mono text-[0.65rem] text-foreground/40">
                  0{i + 1}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-foreground/90">
                    {project.title}
                  </span>
                  <span className="block text-[0.7rem] text-foreground/50">
                    {project.category}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ol>
      </div>

      <ProjectDialog project={selected} onClose={close} />
    </section>
  );
}
