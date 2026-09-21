"use client";

import React, { useRef, useState, useCallback } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  AnimatePresence,
  HTMLMotionProps,
} from "framer-motion";
import { cn } from "@/lib/utils";

export interface MagneticLiquidButtonProps
  extends Omit<HTMLMotionProps<"button">, "children"> {
  children?: React.ReactNode;
  variant?:
    | "cosmic"
    | "aurora"
    | "sunset"
    | "electric"
    | "cyberpunk"
    | "glass";
  size?: "sm" | "md" | "lg" | "xl";
  magneticStrength?: number; // 0 (disabled) to 1 (max pull)
  glowRadius?: number;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  /** Keeps the glow ring + border lit without hover (e.g. selected state) */
  active?: boolean;
}

const variantStyles = {
  // Palette: teal #0a9396 · mint #94d2bd · gamboge #ee9b00 · rust #bb3e03 · rufous #ae2012 · vanilla #e9d8a6
  cosmic: {
    base: "text-[#f1ead4] border-[#94d2bd]/30 shadow-[0_0_20px_rgba(148,210,189,0.22)]",
    glow: "bg-[#94d2bd]",
    particle: "bg-[#94d2bd]",
    hoverShadow: "hover:shadow-[0_0_35px_rgba(148,210,189,0.45)]",
    activeShadow: "shadow-[0_0_35px_rgba(148,210,189,0.45)] border-[#94d2bd]/70",
  },
  aurora: {
    base: "text-[#f1ead4] border-[#ee9b00]/30 shadow-[0_0_20px_rgba(238,155,0,0.22)]",
    glow: "bg-[#ee9b00]",
    particle: "bg-[#ee9b00]",
    hoverShadow: "hover:shadow-[0_0_35px_rgba(238,155,0,0.45)]",
    activeShadow: "shadow-[0_0_35px_rgba(238,155,0,0.45)] border-[#ee9b00]/70",
  },
  sunset: {
    base: "text-[#f1ead4] border-[#bb3e03]/35 shadow-[0_0_20px_rgba(187,62,3,0.25)]",
    glow: "bg-[#bb3e03]",
    particle: "bg-[#ca6702]",
    hoverShadow: "hover:shadow-[0_0_35px_rgba(202,103,2,0.45)]",
    activeShadow: "shadow-[0_0_35px_rgba(202,103,2,0.45)] border-[#ca6702]/70",
  },
  electric: {
    base: "text-[#f1ead4] border-[#0a9396]/35 shadow-[0_0_20px_rgba(10,147,150,0.25)]",
    glow: "bg-[#0a9396]",
    particle: "bg-[#0a9396]",
    hoverShadow: "hover:shadow-[0_0_35px_rgba(10,147,150,0.5)]",
    activeShadow: "shadow-[0_0_35px_rgba(10,147,150,0.5)] border-[#0a9396]/70",
  },
  cyberpunk: {
    base: "text-[#f1ead4] border-[#ae2012]/35 shadow-[0_0_20px_rgba(174,32,18,0.25)]",
    glow: "bg-[#ae2012]",
    particle: "bg-[#9b2226]",
    hoverShadow: "hover:shadow-[0_0_35px_rgba(174,32,18,0.45)]",
    activeShadow: "shadow-[0_0_35px_rgba(174,32,18,0.45)] border-[#ae2012]/70",
  },
  glass: {
    base: "text-[#f1ead4] border-[#e9d8a6]/25 bg-[#e9d8a6]/[0.04] backdrop-blur-xl shadow-[0_0_15px_rgba(233,216,166,0.1)]",
    glow: "bg-[#e9d8a6]/40",
    particle: "bg-[#e9d8a6]",
    hoverShadow: "hover:shadow-[0_0_25px_rgba(233,216,166,0.25)]",
    activeShadow: "shadow-[0_0_25px_rgba(233,216,166,0.25)] border-[#e9d8a6]/60",
  },
};

const sizeStyles = {
  sm: "h-9 px-4 text-xs tracking-wide gap-1.5 rounded-xl",
  md: "h-11 px-6 text-sm tracking-wide gap-2 rounded-2xl",
  lg: "h-13 px-8 text-base tracking-wide gap-2.5 rounded-2xl",
  xl: "h-16 px-10 text-lg tracking-wider gap-3 rounded-3xl",
};

interface Ripple {
  x: number;
  y: number;
  id: number;
}

export const MagneticLiquidButton = React.forwardRef<
  HTMLButtonElement,
  MagneticLiquidButtonProps
>(
  (
    {
      children,
      className,
      variant = "cosmic",
      size = "md",
      magneticStrength = 0.35,
      glowRadius = 160,
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      onClick,
      active = false,
      ...props
    },
    ref,
  ) => {
    const buttonRef = useRef<HTMLButtonElement | null>(null);
    const [isHovered, setIsHovered] = useState(false);
    const [ripples, setRipples] = useState<Ripple[]>([]);

    // Motion coordinates for magnetic physics
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    // Spring physics configuration for tactile responsiveness
    const springConfig = { damping: 18, stiffness: 220, mass: 0.1 };
    const springX = useSpring(mouseX, springConfig);
    const springY = useSpring(mouseY, springConfig);

    // Dynamic rotation tilt on hover
    const rotateX = useTransform(springY, [-40, 40], [8, -8]);
    const rotateY = useTransform(springX, [-40, 40], [-8, 8]);

    // Track relative pointer for spotlight gradient
    const [spotlightPos, setSpotlightPos] = useState({ x: 0, y: 0 });

    const handleMouseMove = useCallback(
      (e: React.MouseEvent<HTMLButtonElement>) => {
        if (disabled || isLoading) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const deltaX = (e.clientX - centerX) * magneticStrength;
        const deltaY = (e.clientY - centerY) * magneticStrength;

        mouseX.set(deltaX);
        mouseY.set(deltaY);

        setSpotlightPos({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      },
      [disabled, isLoading, magneticStrength, mouseX, mouseY],
    );

    const handleMouseEnter = () => {
      if (disabled || isLoading) return;
      setIsHovered(true);
    };

    const handleMouseLeave = () => {
      setIsHovered(false);
      mouseX.set(0);
      mouseY.set(0);
    };

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled || isLoading) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const newRipple = { x, y, id: Date.now() };
      setRipples((prev) => [...prev.slice(-3), newRipple]);

      onClick?.(e);
    };

    const currentVariant = variantStyles[variant];

    return (
      <motion.button
        ref={(node) => {
          buttonRef.current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) ref.current = node;
        }}
        style={{
          x: springX,
          y: springY,
          rotateX,
          rotateY,
          transformPerspective: 800,
        }}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        whileTap={{ scale: disabled || isLoading ? 1 : 0.95 }}
        disabled={disabled || isLoading}
        data-active={active || undefined}
        className={cn(
          "relative group inline-flex items-center justify-center font-medium select-none overflow-hidden",
          "border border-solid transition-all duration-300 ease-out",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0a9396] focus-visible:ring-offset-[#001219]",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none",
          "bg-[#001219]/90",
          sizeStyles[size],
          currentVariant.base,
          currentVariant.hoverShadow,
          active && currentVariant.activeShadow,
          className,
        )}
        {...props}
      >
        {/* Ambient Gradient Background Glow */}
        <div
          className="pointer-events-none absolute -inset-px rounded-[inherit] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: `radial-gradient(${glowRadius}px circle at ${spotlightPos.x}px ${spotlightPos.y}px, rgba(255,255,255,0.18), transparent 80%)`,
          }}
        />

        {/* Solid glow ring on hover / active */}
        <div
          className={cn(
            "pointer-events-none absolute -inset-1 rounded-[inherit] opacity-0 blur-md transition-opacity duration-500 group-hover:opacity-60",
            currentVariant.glow,
            active && "opacity-60",
          )}
        />

        {/* Dark core overlay to isolate inner content */}
        <div className="absolute inset-[1px] rounded-[inherit] bg-[#001219]/95 -z-0" />

        {/* Interactive Dynamic Spot Glow */}
        <motion.div
          className="pointer-events-none absolute inset-0 z-0 opacity-0 group-hover:opacity-30 transition-opacity duration-300"
          style={{
            background: `radial-gradient(120px circle at ${spotlightPos.x}px ${spotlightPos.y}px, var(--spotlight-color, rgba(255, 255, 255, 0.4)), transparent 70%)`,
          }}
        />

        {/* Dynamic Click Wave Ripples */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
          <AnimatePresence>
            {ripples.map((ripple) => (
              <motion.span
                key={ripple.id}
                initial={{ scale: 0, opacity: 0.7 }}
                animate={{ scale: 4, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.75, ease: "easeOut" }}
                onAnimationComplete={() =>
                  setRipples((prev) => prev.filter((r) => r.id !== ripple.id))
                }
                style={{
                  position: "absolute",
                  left: ripple.x,
                  top: ripple.y,
                  width: 30,
                  height: 30,
                  marginLeft: -15,
                  marginTop: -15,
                  borderRadius: "50%",
                  background:
                    "radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 70%)",
                }}
              />
            ))}
          </AnimatePresence>
        </div>

        {/* Button Content */}
        <span className="relative z-20 flex items-center justify-center gap-2 transition-transform duration-200">
          {isLoading ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2"
            >
              <svg
                className="animate-spin h-4 w-4 text-current"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                />
              </svg>
              <span>Loading...</span>
            </motion.div>
          ) : (
            <>
              {leftIcon && (
                <motion.span
                  className="inline-flex shrink-0 transition-transform duration-300 group-hover:scale-110"
                  animate={isHovered ? { x: -2 } : { x: 0 }}
                >
                  {leftIcon}
                </motion.span>
              )}

              <span className="font-semibold tracking-wide">{children}</span>

              {rightIcon && (
                <motion.span
                  className="inline-flex shrink-0 transition-transform duration-300 group-hover:scale-110"
                  animate={isHovered ? { x: 3 } : { x: 0 }}
                >
                  {rightIcon}
                </motion.span>
              )}
            </>
          )}
        </span>
      </motion.button>
    );
  },
);

MagneticLiquidButton.displayName = "MagneticLiquidButton";
