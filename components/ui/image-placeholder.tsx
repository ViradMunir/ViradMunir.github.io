import { ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type ImagePlaceholderProps = {
  /** Palette colour used to tint the placeholder so cards stay distinguishable */
  tint?: string;
  label?: string;
  className?: string;
};

/**
 * Stand-in for real artwork. Swap the component for an <img> / next/image
 * once assets are ready — the parent layout does not need to change.
 */
export function ImagePlaceholder({
  tint = "#0a9396",
  label = "Image placeholder",
  className,
}: ImagePlaceholderProps) {
  return (
    <div
      role="img"
      aria-label={label}
      className={cn(
        "relative flex h-full w-full items-center justify-center overflow-hidden",
        className,
      )}
      style={{
        background: `color-mix(in oklch, ${tint} 55%, var(--card))`,
      }}
    >
      {/* Diagonal hatch */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, rgba(255,255,255,0.22) 0 2px, transparent 2px 14px)",
        }}
      />
      {/* Corner ticks */}
      <div aria-hidden className="absolute inset-3 rounded-lg border border-dashed border-white/40" />
      <div className="relative flex flex-col items-center gap-2 text-white/85">
        <ImageIcon size={22} strokeWidth={1.75} />
        <span className="font-mono text-[0.6rem] uppercase tracking-[0.25em]">
          {label}
        </span>
      </div>
    </div>
  );
}
