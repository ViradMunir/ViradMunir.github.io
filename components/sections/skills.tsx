"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowUpRight,
  Atom,
  Bot,
  Braces,
  BrainCircuit,
  Camera,
  ChartLine,
  Cloud,
  Code,
  Cpu,
  Database,
  Eye,
  FileCode,
  FileSearch,
  Flame,
  GitBranch,
  Layers,
  Map,
  Microchip,
  Network,
  NotebookPen,
  PanelsTopLeft,
  ScanEye,
  ScanSearch,
  Sparkles,
  Tags,
  Terminal,
  Trophy,
  Webhook,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { SectionHeading } from "@/components/section-heading";
import { MagneticLiquidButton } from "@/components/ui/magnetic-liquid-button";
import { projects, skillGroups } from "@/content/site";

type SelectedSkill = { name: string; usedIn: string[] } | null;

/** Icon shown inside each skill button (falls back to a sparkle). */
const skillIcons: Record<string, LucideIcon> = {
  Python: Code,
  "C++": Braces,
  SQL: Database,
  JavaScript: FileCode,
  YOLO: ScanEye,
  CNNs: Layers,
  "Deep Learning": BrainCircuit,
  PyTorch: Flame,
  TensorFlow: Network,
  "Scikit-learn": ChartLine,
  RAG: FileSearch,
  "Computer Vision": Eye,
  "Object Detection": ScanSearch,
  OpenCV: Camera,
  ROS: Bot,
  SLAM: Map,
  "Edge Deployment": Cpu,
  "React.js": Atom,
  "Next.js": PanelsTopLeft,
  "REST APIs": Webhook,
  PostgreSQL: Database,
  Git: GitBranch,
  Linux: Terminal,
  Jupyter: NotebookPen,
  "Google Colab": Cloud,
  Kaggle: Trophy,
  Roboflow: Tags,
  CUDA: Microchip,
};

export function SkillsSection() {
  const [selected, setSelected] = useState<SelectedSkill>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Bring the "shipped in" panel on screen when a skill is picked — it sits
  // below the button grid and is easy to miss on shorter viewports.
  useEffect(() => {
    if (!selected) return;
    const panel = panelRef.current;
    if (!panel) return;
    const id = window.setTimeout(() => {
      const rect = panel.getBoundingClientRect();
      const margin = 96; // keep clear of the bottom-docked nav on mobile
      if (rect.bottom > window.innerHeight - margin || rect.top < 0) {
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        panel.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "end" });
      }
    }, 60);
    return () => window.clearTimeout(id);
  }, [selected]);

  const usedInProjects = useMemo(
    () =>
      selected
        ? projects.filter((p) => selected.usedIn.includes(p.id))
        : [],
    [selected],
  );

  return (
    <section id="skills" className="relative scroll-mt-24 px-6 pb-4 pt-24 sm:px-10 md:pb-6 md:pt-32">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow="03 — Skills"
          title="The toolbox."
          description="Tap any skill to see where it has actually shipped."
        />

        <div className="mt-14 space-y-10">
          {skillGroups.map((group, gi) => (
            <motion.div
              key={group.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.5, delay: gi * 0.05 }}
              className="grid gap-4 md:grid-cols-[200px_1fr] md:gap-8"
            >
              <p className="eyebrow pt-3">{group.title}</p>
              <div className="flex flex-wrap gap-3">
                {group.skills.map((skill) => {
                  const isSelected = selected?.name === skill.name;
                  const Icon = skillIcons[skill.name] ?? Zap;
                  return (
                    <MagneticLiquidButton
                      key={skill.name}
                      variant={group.variant}
                      size="sm"
                      magneticStrength={0.3}
                      leftIcon={<Icon className="h-3.5 w-3.5 opacity-80" />}
                      active={isSelected}
                      aria-pressed={isSelected}
                      onClick={() =>
                        setSelected(isSelected ? null : { name: skill.name, usedIn: skill.usedIn })
                      }
                    >
                      {skill.name}
                    </MagneticLiquidButton>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>

        {/* "Used in" panel */}
        <div ref={panelRef} className="mt-10 min-h-[72px] scroll-mb-28 sm:scroll-mb-10">
          <AnimatePresence mode="wait">
            {selected ? (
              <motion.div
                key={selected.name}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col gap-3 rounded-2xl border border-brand/40 bg-brand/5 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <p className="flex items-center gap-2 text-sm">
                  <Sparkles size={15} className="text-brand" />
                  <span className="font-semibold">{selected.name}</span>
                  <span className="text-foreground/60">
                    shipped in {usedInProjects.length}{" "}
                    {usedInProjects.length === 1 ? "project" : "projects"}
                  </span>
                </p>
                <ul className="flex flex-wrap gap-2">
                  {usedInProjects.map((p) => (
                    <li key={p.id}>
                      <a
                        href="#projects"
                        data-project={p.id}
                        className="group inline-flex items-center gap-1 rounded-full border border-border/70 bg-background/70 px-3 py-1 text-xs text-foreground/80 transition-colors hover:border-brand hover:text-foreground"
                      >
                        {p.title.length > 34 ? `${p.title.slice(0, 32)}…` : p.title}
                        <ArrowUpRight
                          size={12}
                          className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                        />
                      </a>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
