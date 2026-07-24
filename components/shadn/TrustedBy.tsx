"use client";

import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap/config";

const brands = [
  "Grace Mission Network",
  "Hope Builders Alliance",
  "Faith Outreach Coalition",
  "Living Water Ministries",
  "New Life Partners",
  "Cornerstone Fellowship",
  "Shepherd's Table",
  "Bridge of Hope",
];

export default function TrustedBy() {
  const trackRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion() || !trackRef.current) return;

      // Track holds the brand list duplicated exactly once, so shifting it
      // by 50% of its own width brings the second copy into the first
      // copy's starting position — a seamless, continuously-playing loop.
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
          In partnership with
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
