"use client";

import { ArrowDown, FileText, MapPin } from "lucide-react";
import PathDrawingPortfolioHero from "@/components/ui/path-drawing-portfolio-hero";
import { Button } from "@/components/ui/button";
import { profile, ticker } from "@/content/site";

export function HeroSection() {
  return (
    <section id="home" className="relative scroll-mt-24">
      <PathDrawingPortfolioHero
        brand={profile.brand}
        eyebrow={`Portfolio  ·  ${profile.location}`}
        tagline={profile.role}
      >
        <div className="flex flex-col items-center gap-8">
          <p className="max-w-2xl text-sm leading-relaxed text-foreground/60 sm:text-base">
            {profile.tagline}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button
              size="lg"
              className="h-11 rounded-full px-6 text-sm"
              nativeButton={false}
              render={<a href="#projects" />}
            >
              View projects
              <ArrowDown data-icon="inline-end" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-11 rounded-full px-6 text-sm"
              nativeButton={false}
              render={<a href={profile.resumeUrl} target="_blank" rel="noreferrer" />}
            >
              <FileText data-icon="inline-start" />
              Résumé
            </Button>
            <span className="inline-flex items-center gap-1.5 px-2 text-xs text-foreground/50">
              <MapPin size={13} />
              {profile.location}
            </span>
          </div>

        </div>
      </PathDrawingPortfolioHero>

      {/* Tech ticker */}
      <div
        aria-hidden
        className="relative overflow-hidden border-y border-border/60 bg-background/60 py-3 backdrop-blur [mask-image:linear-gradient(90deg,transparent,black_12%,black_88%,transparent)]"
      >
        <div className="animate-marquee flex w-max gap-10 whitespace-nowrap font-mono text-[0.7rem] uppercase tracking-[0.3em] text-foreground/55">
          {[...ticker, ...ticker].map((item, i) => (
            <span key={`${item}-${i}`} className="flex items-center gap-10">
              {item}
              <span className="h-1 w-1 rounded-full bg-brand" />
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
