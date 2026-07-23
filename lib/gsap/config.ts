import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export { gsap, ScrollTrigger, useGSAP };

// Shared ease vocabulary — keeps every section's motion feeling like one
// consistent system instead of each file picking its own ad-hoc curve.
export const EASE = {
  out: "power3.out",
  soft: "power2.out",
  inOut: "power2.inOut",
  premium: "expo.out",
  bounce: "back.out(1.7)",
} as const;

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function isFinePointer(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(pointer: fine)").matches;
}

export function isDesktopViewport(minWidth = 1024): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia(`(min-width: ${minWidth}px)`).matches;
}

// Mobile gets shorter travel distances and no stagger cascade — cheaper to
// composite and reads as "snappy" rather than "sluggish" on smaller,
// often lower-powered devices.
export function responsiveDistance(desktopPx: number): number {
  return isDesktopViewport(768) ? desktopPx : Math.round(desktopPx * 0.6);
}
