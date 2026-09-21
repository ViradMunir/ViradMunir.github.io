"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion, type Variants } from "framer-motion";
import type { ComponentType } from "react";
import { ArrowUpRight } from "lucide-react";
import { opensInNewTab } from "@/lib/utils";

export type Highlight = {
  title: string;
  description: string;
};

export type SocialLink = {
  label: string;
  handle: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
};

export type GlassmorphismPortfolioBlockProps = {
  badge: string;
  heading: string;
  intro: string;
  highlights: Highlight[];
  cta: { label: string; href: string };
  card: {
    name: string;
    role: string;
    blurb: string;
    statusLabel: string;
  };
  socialLinks: SocialLink[];
};

const listVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      staggerChildren: 0.08,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.35,
    },
  },
};

/** Abstract "signal" mark used in place of a portrait. */
function SignalMark() {
  return (
    <div className="relative h-32 w-32" aria-hidden>
      <div className="absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand/20 blur-2xl" />
      <div className="absolute inset-0 rounded-full border border-foreground/20" />
      <div className="absolute inset-4 rounded-full border border-foreground/20" />
      <div className="absolute inset-8 rounded-full border border-foreground/20" />
      <div className="absolute inset-[3.4rem] rounded-full bg-brand" />
      <motion.div
        className="absolute inset-0"
        animate={{ rotate: 360 }}
        transition={{ duration: 12, ease: "linear", repeat: Infinity }}
      >
        <span className="absolute left-1/2 top-0 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand shadow-[0_0_12px_var(--brand)]" />
      </motion.div>
      <motion.div
        className="absolute inset-4"
        animate={{ rotate: -360 }}
        transition={{ duration: 8, ease: "linear", repeat: Infinity }}
      >
        <span className="absolute bottom-0 left-1/2 h-2 w-2 -translate-x-1/2 translate-y-1/2 rounded-full bg-brand-2 shadow-[0_0_10px_var(--brand-2)]" />
      </motion.div>
    </div>
  );
}

export function GlassmorphismPortfolioBlock({
  badge,
  heading,
  intro,
  highlights,
  cta,
  card,
  socialLinks,
}: GlassmorphismPortfolioBlockProps) {
  return (
    <div className="mx-auto max-w-6xl">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative overflow-hidden rounded-3xl border border-border/50 bg-background/45 p-8 backdrop-blur-2xl md:p-12"
      >

        <div className="relative grid gap-12 lg:grid-cols-2">
          {/* Left column - Main content */}
          <div className="space-y-8">
            <Badge
              variant="outline"
              className="inline-flex h-auto items-center gap-2 rounded-full border-border/50 bg-background/55 px-4 py-1.5 text-xs uppercase tracking-[0.3em] text-foreground/70 backdrop-blur transition-colors hover:bg-background/70"
            >
              {badge}
            </Badge>

            <div className="space-y-4">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="font-heading text-2xl font-semibold tracking-tight text-foreground md:text-3xl"
              >
                {heading}
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="max-w-xl text-base leading-relaxed text-foreground/70"
              >
                {intro}
              </motion.p>
            </div>

            {/* Highlights grid */}
            <div className="grid gap-4 sm:grid-cols-1">
              {highlights.map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.1 * index }}
                  whileHover={{ y: -4 }}
                  className="group relative overflow-hidden rounded-2xl border border-border/40 bg-background/60 p-5 backdrop-blur transition-all hover:border-border/60 hover:shadow-lg"
                >
                  <div className="absolute inset-0 -z-10 bg-foreground/[0.03] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <div className="relative space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-foreground/40">
                      {item.title}
                    </p>
                    <p className="text-sm leading-relaxed text-foreground/70">
                      {item.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="grid grid-cols-1 gap-4"
            >
              <Button
                size="lg"
                className="h-12 w-full gap-2 rounded-full px-8 text-sm uppercase tracking-[0.25em] transition-all hover:shadow-lg sm:w-auto"
                nativeButton={false}
                render={<a href={cta.href} />}
              >
                {cta.label}
                <ArrowUpRight className="h-4 w-4" />
              </Button>
            </motion.div>
          </div>

          {/* Right column - Profile card (no portrait by design) */}
          <div className="relative">
            <div className="absolute inset-x-8 top-0 h-40 rounded-full bg-brand/15 blur-3xl" />
            <div className="relative flex h-full flex-col justify-between overflow-hidden rounded-[28px] border border-border/50 bg-background/60 p-8 backdrop-blur-xl">
              <div className="flex flex-col items-center text-center">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  className="relative mb-6"
                >
                  <SignalMark />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="space-y-1"
                >
                  <h3 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
                    {card.name}
                  </h3>
                  <p className="text-xs font-semibold uppercase tracking-[0.35em] text-foreground/45">
                    {card.role}
                  </p>
                </motion.div>

                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="mt-4 max-w-sm text-sm leading-relaxed text-foreground/70"
                >
                  {card.blurb}
                </motion.p>

                <motion.span
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="mt-4 inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/10 px-3 py-1 text-[0.7rem] font-medium text-brand"
                >
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-brand" />
                  </span>
                  {card.statusLabel}
                </motion.span>
              </div>

              {/* Social links */}
              <motion.div
                variants={listVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-80px" }}
                className="mt-8 flex flex-col gap-3"
              >
                {socialLinks.map((social) => {
                  const Icon = social.icon;
                  return (
                    <motion.a
                      key={social.label}
                      variants={itemVariants}
                      href={social.href}
                      target={opensInNewTab(social.href) ? "_blank" : undefined}
                      rel="noopener noreferrer"
                      className="group flex items-center justify-between rounded-2xl border border-border/40 bg-background/70 px-4 py-3 text-left transition-all hover:-translate-y-0.5 hover:border-border/60 hover:bg-background/80 hover:shadow-md"
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.985 }}
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-full border border-border/40 bg-background/70 text-foreground/80 shadow-[0_10px_30px_rgba(15,23,42,0.2)] transition-all group-hover:shadow-[0_10px_30px_rgba(15,23,42,0.3)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.4)] dark:group-hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                          <Icon className="h-4 w-4" />
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-foreground">
                            {social.label}
                          </p>
                          <p className="text-xs text-foreground/60">{social.handle}</p>
                        </div>
                      </div>
                      <ArrowUpRight className="h-4 w-4 text-foreground/40 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground/70" />
                    </motion.a>
                  );
                })}
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
