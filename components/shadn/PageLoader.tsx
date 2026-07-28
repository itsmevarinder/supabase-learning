"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, useGSAP, EASE, prefersReducedMotion } from "@/lib/gsap/config";

const COLS = 6;
const ROWS = 5;
const TILES = Array.from({ length: COLS * ROWS });

const ORBIT_COUNT = 5;
const ORBIT_COLORS = ["bg-primary", "bg-amber-500", "bg-primary" ,"bg-amber-500", "bg-primary"];

export default function PageLoader() {
  const [isLoading, setIsLoading] = useState(true);
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const tileRefs = useRef<(HTMLDivElement | null)[]>([]);
  const orbitRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const taglineRef = useRef<HTMLParagraphElement>(null);

  useGSAP(
    () => {
      const reduced = prefersReducedMotion();
      if (reduced) return;

      gsap.from(contentRef.current, { scale: 0.8, opacity: 0, duration: 0.5, ease: EASE.bounce });

      orbitRefs.current.forEach((el, i) => {
        if (!el) return;
        gsap.set(el, { rotation: i * (360 / ORBIT_COUNT) });
        gsap.to(el, { rotation: `+=360`, duration: 2.6, ease: "none", repeat: -1 });
      });

      gsap.from(
        taglineRef.current?.querySelectorAll<HTMLElement>(".word-inner") ?? [],
        { y: 10, opacity: 0, duration: 0.4, stagger: 0.05, ease: EASE.soft, delay: 0.2 }
      );

      const glow = overlayRef.current?.querySelector<HTMLElement>(".loader-glow");
      if (glow) {
        gsap.to(glow, { scale: 1.3, opacity: 0.6, duration: 2.2, ease: "sine.inOut", yoyo: true, repeat: -1 });
      }
    },
    { scope: overlayRef }
  );

  useEffect(() => {

    const reduced = prefersReducedMotion();
    const minDelay = new Promise<void>((resolve) => setTimeout(resolve, reduced ? 150 : 1400));
    const pageReady =
      document.readyState === "complete"
        ? Promise.resolve()
        : new Promise<void>((resolve) => {
            window.addEventListener("load", () => resolve(), { once: true });
          });

    Promise.all([minDelay, pageReady]).then(() => {
      document.body.style.overflow = "";

      const tiles = tileRefs.current;
      const content = contentRef.current;

      if (!tiles.length || !content || reduced) {
        setIsLoading(false);
        return;
      }

      gsap
        .timeline({ onComplete: () => setIsLoading(false) })
        .to(content, { opacity: 0, scale: 0.8, duration: 0.3, ease: EASE.soft })
        .to(
          tiles,
          {
            scale: 0,
            duration: 0.6,
            ease: EASE.inOut,
            stagger: { each: 0.025, from: "center", grid: [ROWS, COLS] },
          },
          "-=0.1"
        );
    });

    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  if (!isLoading) return null;

  return (
    <div ref={overlayRef} className="fixed inset-0 z-100" aria-hidden="true">
      <div className="absolute inset-0 grid" style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)`, gridTemplateRows: `repeat(${ROWS}, 1fr)` }}>
        {TILES.map((_, i) => (
          <div
            key={i}
            ref={(el) => {
              tileRefs.current[i] = el;
            }}
            className={i % 2 === 0 ? "bg-background" : "bg-muted"}
          />
        ))}
      </div>

      <div ref={contentRef} className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center gap-5 overflow-hidden">
        <span className="loader-glow pointer-events-none absolute h-72 w-72 rounded-full bg-primary/20 blur-3xl" />

        <div className="relative h-36 w-36">
          {Array.from({ length: ORBIT_COUNT }).map((_, i) => (
            <span
              key={i}
              ref={(el) => {
                orbitRefs.current[i] = el;
              }}
              className="absolute inset-0 flex items-start justify-center"
            >
              <span className={`h-3 w-3 rounded-full ${ORBIT_COLORS[i]}`} />
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
