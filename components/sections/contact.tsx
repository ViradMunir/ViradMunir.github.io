"use client";

import { FileText, Mail } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/icons";
import { SectionHeading } from "@/components/section-heading";
import {
  GlassmorphismPortfolioBlock,
  type SocialLink,
} from "@/components/ui/glassmorphism-portfolio-block-shadcnui";
import { contactHighlights, profile } from "@/content/site";

const socialLinks: SocialLink[] = [
  {
    label: "Email",
    handle: "virad.munir1189@gmail.com",
    href: profile.email,
    icon: Mail,
  },
  {
    label: "LinkedIn",
    handle: "linkedin.com/in/viradmunir12",
    href: profile.socials.linkedin,
    icon: LinkedinIcon,
  },
  {
    label: "GitHub",
    handle: "github.com/ViradMunir",
    href: profile.socials.github,
    icon: GithubIcon,
  },
  {
    label: "Résumé",
    handle: "PDF · one page",
    href: profile.resumeUrl,
    icon: FileText,
  },
];

export function ContactSection() {
  return (
    <section id="contact" className="relative scroll-mt-24 px-6 pb-28 pt-8 sm:px-10 md:pb-36 md:pt-10">
      <div className="mx-auto mb-14 max-w-6xl">
        <SectionHeading
          eyebrow="04 — Contact"
          title="Let's build something that runs."
          description="Internships, research collaborations, or a hard perception problem you want a second pair of eyes on — my inbox is open."
        />
      </div>

      <GlassmorphismPortfolioBlock
        badge="Get in touch"
        heading={`${profile.name}, ${profile.shortRole}`}
        intro="I work best on problems where AI and software engineering come together: building intelligent applications, developing machine learning solutions, and designing the reliable software systems that make them useful in practice."
        highlights={contactHighlights}
        cta={{ label: "Email me", href: profile.email }}
        card={{
          name: profile.name,
          role: "Software · AI",
          blurb:
            "BS Electrical Engineering at LUMS, minor in Computer Science. Based in Lahore.",
          statusLabel: "Available",
        }}
        socialLinks={socialLinks}
      />
    </section>
  );
}
