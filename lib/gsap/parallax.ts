import { gsap, prefersReducedMotion } from "./config";

interface ParallaxOptions {
  trigger: Element | null | undefined;
  /** Total px of travel across the trigger's full scroll range. */
  distance?: number;
  start?: string;
  end?: string;
}

/**
 * True scroll-scrubbed parallax — the target's position is tied 1:1 to
 * scroll progress through `trigger` (scrub: true, ease: "none"), not a
 * one-time reveal. Apply this to a dedicated wrapper element, never the
 * same element/property driven by a continuous idle tween, or the two
 * will fight over the same transform each frame.
 */
export function scrollParallax(target: gsap.TweenTarget, options: ParallaxOptions) {
  const { trigger, distance = 60, start = "top bottom", end = "bottom top" } = options;
  if (!trigger || prefersReducedMotion()) return undefined;

  return gsap.to(target, {
    y: distance,
    ease: "none",
    scrollTrigger: {
      trigger,
      start,
      end,
      scrub: true,
    },
  });
}
