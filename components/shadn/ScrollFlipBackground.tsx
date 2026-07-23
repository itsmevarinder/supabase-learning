"use client";

import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion, isFinePointer } from "@/lib/gsap/config";

const PARTICLE_COLORS = ["#1e305b", "#00647B", "#a9c2b7", "#4EB6C9"];

const PARTICLE_COUNT = 16;

export default function ScrollFlipBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    (_context, contextSafe) => {
      if (prefersReducedMotion() || !isFinePointer()) return;

      const container = containerRef.current;
      if (!container) return;

      const handlePointerDown = contextSafe!((event: PointerEvent) => {
        const originX = event.clientX;
        const originY = event.clientY;

        for (let i = 0; i < PARTICLE_COUNT; i++) {
          const particle = document.createElement("div");
          const size = gsap.utils.random(6, 22);
          const color = gsap.utils.random(PARTICLE_COLORS);

          particle.style.position = "fixed";
          particle.style.left = "0";
          particle.style.top = "0";
          particle.style.width = `${size}px`;
          particle.style.height = `${size}px`;
          particle.style.borderRadius = "50%";
          particle.style.background = color;
          particle.style.pointerEvents = "none";
          particle.style.willChange = "transform, opacity";

          container.appendChild(particle);

          const angle = gsap.utils.random(0, Math.PI * 2);
          const distance = gsap.utils.random(30, 100);
          const targetX = originX + Math.cos(angle) * distance;
          const targetY = originY + Math.sin(angle) * distance;

          gsap.fromTo(
            particle,
            {
              x: originX,
              y: originY,
              scale: 0,
              opacity: 1,
            },
            {
              x: targetX,
              y: targetY,
              scale: 1,
              opacity: 0,
              duration: gsap.utils.random(0.5, 0.9),
              ease: "power2.out",
              delay: gsap.utils.random(0, 0.08),
              onComplete: () => particle.remove(),
            }
          );
        }
      });

      window.addEventListener("pointerdown", handlePointerDown);

      return () => {
        window.removeEventListener("pointerdown", handlePointerDown);
        container.querySelectorAll("div").forEach((el) => el.remove());
      };
    },
    { scope: containerRef }
  );

  return <div ref={containerRef} className="pointer-events-none fixed inset-0 z-100" />;
}