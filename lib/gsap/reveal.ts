import { gsap, EASE, prefersReducedMotion, responsiveDistance } from "./config";

type Direction = "up" | "down" | "left" | "right" | "none";

interface RevealOptions {
  /** Element (or selector) whose position on screen drives the trigger. */
  trigger: Element | null | undefined;
  direction?: Direction;
  /** Desktop travel distance in px; scaled down automatically on mobile. */
  distance?: number;
  duration?: number;
  ease?: string;
  stagger?: number;
  delay?: number;
  /** Viewport position that starts the reveal, e.g. "top 85%". */
  start?: string;
  /** Optional from-scale for a combined scale+fade+slide entrance. */
  scale?: number;
  /** Optional from-rotation (deg) that settles to 0 — adds a bit of tilt/spin to the entrance instead of a flat slide. */
  rotation?: number;
}

const AXIS: Record<Direction, { prop: "x" | "y"; sign: number } | null> = {
  up: { prop: "y", sign: 1 },
  down: { prop: "y", sign: -1 },
  left: { prop: "x", sign: 1 },
  right: { prop: "x", sign: -1 },
  none: null,
};

/**
 * The one fade/translate entrance pattern reused by every section, so each
 * component stops hand-rolling its own ScrollTrigger + toggleActions
 * boilerplate. Replays every time `trigger` scrolls into or out of view (in
 * both directions) rather than firing once — matches this project's chosen
 * behavior. Skips the animation (snapping straight to the final state) for
 * prefers-reduced-motion.
 *
 * Note: when called synchronously inside a useGSAP() callback, the returned
 * tween/ScrollTrigger is automatically tracked and reverted by gsap's
 * context on cleanup — no need to manually .kill() the return value.
 */
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
    // Only reset the properties this reveal actually animates — forcing
    // scale:1 unconditionally would stomp on an element's own CSS-driven
    // resting scale (e.g. a "featured" card styled larger via a class)
    // when this particular reveal never touched scale to begin with.
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
