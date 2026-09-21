import Image from "next/image";
import { ImagePlaceholder } from "@/components/ui/image-placeholder";

type ProjectCoverProps = {
  /** Path under /public (e.g. "/projects/ugv.jpg") or a full https:// URL */
  image?: string;
  /** Palette colour for the placeholder when there is no image yet */
  tint: string;
  alt: string;
  /**
   * "cover" (default) fills the frame and crops; "contain" shows the whole
   * image letterboxed on the tint colour — better for landscape charts/screenshots.
   */
  fit?: "cover" | "contain";
  /** CSS object-position, e.g. "center 30%" to keep a subject higher in the crop */
  position?: string;
  /** Load eagerly + at higher priority (use for above-the-fold images) */
  priority?: boolean;
};

/**
 * Cover art for a project card / dialog. Renders the real image when one is
 * set in content/site.ts, otherwise the tinted placeholder.
 */
export function ProjectCover({
  image,
  tint,
  alt,
  fit = "cover",
  position = "center",
  priority,
}: ProjectCoverProps) {
  if (!image) return <ImagePlaceholder tint={tint} label="Project cover" />;

  return (
    <div
      className="absolute inset-0"
      style={{ background: `color-mix(in oklch, ${tint} 35%, var(--card))` }}
    >
      <Image
        src={image}
        alt={alt}
        fill
        // Cards are portrait (240×320) and cover-crops scale the image to the
        // frame's height, so request enough width to stay sharp.
        sizes="(max-width: 768px) 640px, 960px"
        quality={85}
        priority={priority}
        className={fit === "contain" ? "object-contain" : "object-cover"}
        style={{ objectPosition: position }}
      />
    </div>
  );
}
