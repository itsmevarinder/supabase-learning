import gsap from "gsap";

interface AnimateCounterOptions {
  prefix?: string;
  suffix?: string;
  duration?: number;
  ease?: string;
}

export function animateCounter(
  el: Element | null | undefined,
  target: number,
  { prefix = "", suffix = "", duration = 1.6, ease = "power2.out" }: AnimateCounterOptions = {}
) {
  if (!el) return undefined;

  const counter = { value: 0 };
  return gsap.to(counter, {
    value: target,
    duration,
    ease,
    onUpdate: () => {
      el.textContent = `${prefix}${Math.round(counter.value)}${suffix}`;
    },
  });
}
