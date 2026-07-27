import { gsap, isFinePointer, prefersReducedMotion } from "./config";

interface MagneticOptions {
  strength?: number;
  duration?: number;
  ease?: string;
}

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
