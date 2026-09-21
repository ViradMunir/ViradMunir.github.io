import { SiteBackdrop } from "@/components/site-backdrop";
import { SmoothAnchors } from "@/components/smooth-anchors";
import { TubelightNavBar } from "@/components/ui/tubelight-navbar";
import { RevealFooter } from "@/components/ui/reveal-footer";
import { HeroSection } from "@/components/sections/hero";
import { AboutSection } from "@/components/sections/about";
import { ProjectsSection } from "@/components/sections/projects";
import { SkillsSection } from "@/components/sections/skills";
import { ContactSection } from "@/components/sections/contact";
import { footerColumns, navItems, profile, PLACEHOLDER_LINK } from "@/content/site";

export default function Home() {
  return (
    <>
      <SmoothAnchors />
      <TubelightNavBar items={navItems} />

      {/* <main> sits above the sticky footer so the footer is revealed as the page scrolls off it. */}
      <main className="relative z-10 bg-background shadow-[0_40px_80px_-20px_rgba(0,0,0,0.45)]">
        <SiteBackdrop />
        <HeroSection />
        <AboutSection />
        <ProjectsSection />
        <SkillsSection />
        <ContactSection />
      </main>

      <RevealFooter
        brand={profile.name}
        tagline={profile.tagline}
        columns={footerColumns}
        legal={[
          { label: "Privacy", href: PLACEHOLDER_LINK },
          { label: "Colophon", href: PLACEHOLDER_LINK },
          { label: "Back to top", href: "#home" },
        ]}
        copyright={`© ${new Date().getFullYear()} ${profile.name}. All rights reserved.`}
      />
    </>
  );
}
