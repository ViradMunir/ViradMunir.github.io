"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
}: SectionHeadingProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "flex flex-col gap-4",
        align === "center" && "items-center text-center",
        className,
      )}
    >
      <p className="eyebrow text-brand">{eyebrow}</p>
      <h2 className="font-heading text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
        {title}
      </h2>
      <span
        aria-hidden
        className={cn("h-1 w-16 rounded-full bg-brand", align === "center" && "mx-auto")}
      />
      {description ? (
        <p className="max-w-2xl text-lg font-medium leading-relaxed text-brand sm:text-xl">
          {description}
        </p>
      ) : null}
    </motion.div>
  );
}
