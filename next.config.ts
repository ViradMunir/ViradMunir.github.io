import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export for GitHub Pages: `next build` writes plain HTML/CSS/JS to ./out
  output: "export",
  images: {
    // GitHub Pages has no image-optimisation server, so serve images as-is.
    unoptimized: true,
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

export default nextConfig;
