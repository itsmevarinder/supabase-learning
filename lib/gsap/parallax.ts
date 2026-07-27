import { gsap, prefersReducedMotion } from "./config";

interface ParallaxOptions {
  trigger: Element | null | undefined;
  distance?: number;
  start?: string;
  end?: string;
}

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
