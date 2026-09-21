# Virad Munir — Portfolio

Interactive single-page portfolio built with **Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · shadcn/ui**, plus `framer-motion` and `gsap` for the motion work.

## Run it

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm run lint
```

## What's on the page

| Section | Component | Notes |
| --- | --- | --- |
| Navbar | `components/ui/tubelight-navbar.tsx` | Floating glass pill; the highlight + "tube light" slides to the active section (tracked via IntersectionObserver). Bottom-docked icon bar on mobile. Contains the dark/light toggle (`theme-toggle.tsx`) — a sun/moon morph with a circular View-Transitions sweep on supported browsers. |
| Hero | `components/ui/path-drawing-portfolio-hero.tsx` | The name is stroke-drawn as an SVG path on a loop (draw → hold → redraw). Proof strip with headline numbers and a tech ticker underneath. |
| About | `components/sections/about.tsx` | Bio, terminal-style status card, education timeline, awards. |
| Featured projects | `components/ui/portfolio-and-image-gallery.tsx` | GSAP scroll-pinned radial wheel. Hover to focus a card, click (or use the index list below it) to open a detail dialog. |
| Skills | `components/ui/magnetic-liquid-button.tsx` | Magnetic, cursor-following buttons grouped by category. Clicking a skill lists the projects it shipped in. |
| Contact | `components/ui/glassmorphism-portfolio-block-shadcnui.tsx` | Glass card with highlights, CTA and social links. No portrait by design — an abstract "signal" mark sits in its place. |
| Footer | `components/ui/reveal-footer.tsx` | Curtain reveal: the page slides up to expose the footer pinned underneath (`position: sticky; bottom: 0`). |

All copy, projects, skills and links live in **`content/site.ts`** — edit that one file to change what the site says.

## Placeholders to replace

Search for `PLACEHOLDER_LINK` in `content/site.ts`:

- `profile.email`, `profile.phone`, `profile.resumeUrl` (e.g. `mailto:…`, `/resume.pdf` in `public/`)
- `profile.socials.linkedin`, `profile.socials.github`, `profile.socials.kaggle`
- Per-project `links` (GitHub / demo) — the Bitcoin project already points at its real repo
- Footer legal links (`app/page.tsx`)
- Social handles shown in the contact card (`components/sections/contact.tsx`)

Project cover art uses `components/ui/image-placeholder.tsx`. Swap it for an `<img>` / `next/image` inside the card in `components/sections/projects.tsx` and the dialog in `components/ui/project-dialog.tsx` when artwork is ready.

## Theming

Colour tokens are CSS variables in `app/globals.css` (`:root` for light, `.dark` for dark), built on the palette `#001219 #005f73 #0a9396 #94d2bd #e9d8a6 #ee9b00 #ca6702 #bb3e03 #ae2012 #9b2226`. Brand accents: `--brand` (teal), `--brand-2` (gamboge), `--hero-from/--hero-to` for the drawn name, `--footer` for the reveal footer. Skill-button variant colours live in `components/ui/magnetic-liquid-button.tsx`; project cover tints in `content/site.ts`.

## Notes

- `prompts/` holds the original component briefs the sections were built from.
- `scroll-behavior: smooth` is intentionally **not** set in CSS (it fights GSAP ScrollTrigger pinning); in-page anchors are smoothed in `components/smooth-anchors.tsx`.
