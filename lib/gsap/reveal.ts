import { gsap, EASE, prefersReducedMotion, responsiveDistance } from "./config";

type Direction = "up" | "down" | "left" | "right" | "none";

interface RevealOptions {
  trigger: Element | null | undefined;
  direction?: Direction;
  distance?: number;
  duration?: number;
  ease?: string;
  stagger?: number;
  delay?: number;
  start?: string;
  scale?: number;
  rotation?: number;
}

const AXIS: Record<Direction, { prop: "x" | "y"; sign: number } | null> = {
  up: { prop: "y", sign: 1 },
  down: { prop: "y", sign: -1 },
  left: { prop: "x", sign: 1 },
  right: { prop: "x", sign: -1 },
  none: null,
};

export function scrollReveal(targets: gsap.TweenTarget, options: RevealOptions) {
  const {
    trigger,
    direction = "up",
    distance = 40,
    duration = 0.6,
    ease = EASE.out,
    stagger,
    delay,
    start = "top 85%",
    scale,
    rotation,
  } = options;

  if (!trigger) return undefined;

  const axis = AXIS[direction];
  const travel = responsiveDistance(distance);

  if (prefersReducedMotion()) {
    gsap.set(targets, {
      opacity: 1,
      ...(axis ? { [axis.prop]: 0 } : null),
      ...(scale !== undefined ? { scale: 1 } : null),
      ...(rotation !== undefined ? { rotation: 0 } : null),
    });
    return undefined;
  }

  return gsap.from(targets, {
    opacity: 0,
    ...(axis ? { [axis.prop]: axis.sign * travel } : null),
    ...(scale !== undefined ? { scale } : null),
    ...(rotation !== undefined ? { rotation } : null),
    duration,
    delay,
    ease,
    stagger,
    scrollTrigger: {
      trigger,
      start,
      toggleActions: "restart reverse restart reverse",
    },
  });
}
