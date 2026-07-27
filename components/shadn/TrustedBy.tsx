"use client";

import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap/config";

const brands = [
  "Nova Labs",
  "Vertex Digital",
  "Bright Peak",
  "Northwind Studio",
  "Cedar & Co",
  "Lumen Works",
  "Solstice Group",
  "Anchor Point",
];

export default function TrustedBy() {
  const trackRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion() || !trackRef.current) return;
      gsap.to(trackRef.current, {
        xPercent: -50,
        duration: 25,
        ease: "linear",
        repeat: -1,
      });
    },
    { scope: trackRef }
  );

  return (
    <section className="section-tint-indigo border-y py-10">
      <div className="container mx-auto md:px-6 px-4">
        <p className="mb-6 text-center text-sm font-semibold uppercase tracking-widest">
          Trusted by teams at
        </p>
      </div>

      <div className="relative overflow-hidden">
        <div ref={trackRef} className="flex w-max gap-16">
          {[...brands, ...brands].map((brand, index) => (
            <span
              key={`${brand}-${index}`}
              className="whitespace-nowrap text-2xl font-bold text-muted-foreground"
            >
              {brand}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
