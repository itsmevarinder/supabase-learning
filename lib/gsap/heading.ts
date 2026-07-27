import { scrollReveal } from "./reveal";
import { EASE } from "./config";

interface HeadingRevealOptions {
  trigger: Element | null | undefined;
  start?: string;
  distance?: number;
  staggerEach?: number;
  delay?: number;
}

export function revealHeadingWords(
  headingEl: Element | null | undefined,
  { trigger, start, distance = 24, staggerEach = 0.05, delay }: HeadingRevealOptions
) {
  const words = headingEl?.querySelectorAll<HTMLElement>(".word-inner") ?? [];
  return scrollReveal(words, {
    trigger,
    direction: "up",
    distance,
    duration: 0.5,
    ease: EASE.out,
    stagger: staggerEach,
    delay,
    start,
  });
}
