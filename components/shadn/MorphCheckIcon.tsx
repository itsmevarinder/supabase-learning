"use client";

import { useRef } from "react";
import { MorphSVGPlugin } from "gsap/MorphSVGPlugin";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap/config";

gsap.registerPlugin(MorphSVGPlugin);

const CHECK_PATH =
  "M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z";
const STAR_PATH =
  "M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z";

interface MorphCheckIconProps {
  className?: string;
  delay?: number;
}

export default function MorphCheckIcon({ className, delay = 0 }: MorphCheckIconProps) {
  const pathRef = useRef<SVGPathElement>(null);

  useGSAP(
    () => {
      if (!pathRef.current || prefersReducedMotion()) return;

      gsap.timeline({ delay, repeat: -1, defaults: { duration: 1.4, ease: "expo.inOut" } })
        .to(pathRef.current, { morphSVG: STAR_PATH, delay: 1.6 })
        .to(pathRef.current, { morphSVG: CHECK_PATH, delay: 1.6 });
    },
    { scope: pathRef }
  );

  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path ref={pathRef} d={CHECK_PATH} />
    </svg>
  );
}
