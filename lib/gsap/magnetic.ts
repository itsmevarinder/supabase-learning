import { gsap, isFinePointer, prefersReducedMotion } from "./config";

interface MagneticOptions {
  /** How much of the pointer offset is applied (0-1). */
  strength?: number;
  duration?: number;
  ease?: string;
}

/**
 * Attaches a magnetic hover effect to a single element: it drifts toward
 * the cursor, snapping back on pointer-leave, via gsap.quickTo (reused
 * setter functions, not a new tween per pointer-move event). Skips entirely
 * on touch devices and prefers-reduced-motion.
 *
 * Returns a cleanup function that removes the listeners — since this
 * attaches raw DOM listeners rather than creating GSAP objects during the
 * main useGSAP() callback, it is NOT auto-tracked by gsap context; always
 * call the returned cleanup (or wrap the call in contextSafe()).
 */
export function attachMagneticHover(el: HTMLElement | null, options: MagneticOptions = {}) {
  if (!el || !isFinePointer() || prefersReducedMotion()) return () => {};

  const { strength = 0.35, duration = 0.4, ease = "power3" } = options;
  const setX = gsap.quickTo(el, "x", { duration, ease });
  const setY = gsap.quickTo(el, "y", { duration, ease });

  const handleMove = (event: PointerEvent) => {
    const rect = el.getBoundingClientRect();
    const px = event.clientX - rect.left - rect.width / 2;
    const py = event.clientY - rect.top - rect.height / 2;
    setX(px * strength);
    setY(py * strength);
  };
  const handleLeave = () => {
    setX(0);
    setY(0);
  };

  el.addEventListener("pointermove", handleMove);
  el.addEventListener("pointerleave", handleLeave);

  return () => {
    el.removeEventListener("pointermove", handleMove);
    el.removeEventListener("pointerleave", handleLeave);
  };
}
