"use client";

import { motion } from "framer-motion";
import { Award, GraduationCap } from "lucide-react";
import { SectionHeading } from "@/components/section-heading";
import { Badge } from "@/components/ui/badge";
import { awards, education, profile } from "@/content/site";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: 0.08 * i, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

export function AboutSection() {
  return (
    <section id="about" className="relative scroll-mt-24 px-6 pb-10 pt-24 sm:px-10 md:pb-12 md:pt-32">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow="01 — About"
          title="Software that has to work in the real world."
          description="Engineer by training, builder by habit. I like the messy part where a model meets a camera, a motor and a deadline."
        />

        <div className="mt-14 grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          {/* Left: bio */}
          <div className="space-y-8">
            <div className="space-y-5 text-base leading-relaxed text-foreground/75 sm:text-lg">
              {profile.summary.map((para) => (
                <motion.p
                  key={para.slice(0, 24)}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                >
                  {para}
                </motion.p>
              ))}
            </div>
          </div>

          {/* Right: education + awards */}
          <div className="space-y-10">
            <div>
              <p className="eyebrow mb-6 flex items-center gap-2">
                <GraduationCap size={14} /> Education
              </p>
              <ol className="relative space-y-8 border-l border-border/70 pl-6">
                {education.map((edu, i) => (
                  <motion.li
                    key={edu.school}
                    custom={i}
                    variants={fadeUp}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.15 }}
                    className="relative"
                  >
                    <span className="absolute -left-[31px] top-1.5 h-2.5 w-2.5 rounded-full bg-brand ring-4 ring-background" />
                    <p className="font-mono text-[0.65rem] uppercase tracking-[0.25em] text-foreground/45">
                      {edu.period}
                    </p>
                    <h3 className="mt-1.5 font-heading text-lg font-semibold">
                      {edu.school}
                    </h3>
                    <p className="mt-1 text-sm text-foreground/75">{edu.degree}</p>
                    <p className="mt-1 text-sm text-brand">{edu.detail}</p>
                    {edu.courses.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {edu.courses.map((course) => (
                          <Badge
                            key={course}
                            variant="outline"
                            className="h-auto rounded-full border-border/70 bg-background/60 px-2.5 py-0.5 text-[0.68rem] font-normal text-foreground/70"
                          >
                            {course}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </motion.li>
                ))}
              </ol>
            </div>

            <div>
              <p className="eyebrow mb-5 flex items-center gap-2">
                <Award size={14} /> Honours & awards
              </p>
              <ul className="grid gap-2 sm:grid-cols-2">
                {awards.map((award, i) => (
                  <motion.li
                    key={award}
                    custom={i}
                    variants={fadeUp}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="group flex items-start gap-3 rounded-xl border border-border/60 bg-card/60 px-4 py-3 text-sm text-foreground/80 transition-colors hover:border-brand/50"
                  >
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-2 transition-transform group-hover:scale-150" />
                    {award}
                  </motion.li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
