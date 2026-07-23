"use client";

import { useRef } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { splitWords } from "@/components/shadn/split-words";
import DrawIcon from "@/components/shadn/DrawIcon";
import { gsap, useGSAP, EASE, prefersReducedMotion } from "@/lib/gsap/config";
import { attachMagneticHover } from "@/lib/gsap/magnetic";

export default function CtaBanner() {
  const section = useRef<HTMLElement>(null);
  const badgeRef = useRef<HTMLSpanElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const paragraphRef = useRef<HTMLParagraphElement>(null);
  const magneticButtonRef = useRef<HTMLButtonElement>(null);

  useGSAP(
    () => {
      // --- Heading entrance, replays every visit ---
      gsap
        .timeline({
          scrollTrigger: {
            trigger: section.current,
            start: "top 85%",
            toggleActions: "restart reverse restart reverse",
          },
        })
        .from(badgeRef.current, { scale: 0, opacity: 0, duration: 0.5, ease: EASE.bounce })
        .from(
          titleRef.current?.querySelectorAll<HTMLElement>(".word-inner") ?? [],
          { y: 24, opacity: 0, duration: 0.5, stagger: 0.05, ease: EASE.out },
          "-=0.25"
        )
        .from(paragraphRef.current, { y: 20, opacity: 0, duration: 0.5, ease: EASE.soft }, "-=0.35");

      // Buttons are never scroll-gated — always visible immediately.
      if (prefersReducedMotion()) return;

      // --- Continuous ambient motion ---
      const blurCircles = section.current?.querySelectorAll<HTMLElement>(".cta-blur");
      if (blurCircles?.length) {
        gsap.to(blurCircles, {
          scale: 1.25,
          duration: 5,
          ease: "linear",
          yoyo: true,
          repeat: -1,
          stagger: { each: 1.3, from: "random" },
        });
      }

      const ctaGlow = section.current?.querySelector<HTMLElement>(".cta-glow");
      if (ctaGlow) {
        gsap.to(ctaGlow, { scale: 1.2, opacity: 0.5, duration: 1.5, ease: "linear", yoyo: true, repeat: -1 });
      }

      // Magnetic hover on the primary CTA — drifts toward the cursor.
      const detachMagnetic = attachMagneticHover(magneticButtonRef.current, { strength: 0.35 });

      return () => {
        detachMagnetic();
      };
    },
    { scope: section }
  );

  return (
    <section className="pb-24" ref={section}>
      <div className="container mx-auto px-6">
        <div className="relative overflow-hidden rounded-3xl bg-primary px-8 py-16 text-center text-white shadow-2xl lg:px-20">
          {/* Decorative Blur */}
          <div className="cta-blur absolute -left-20 top-0 h-60 w-60 rounded-full bg-white/10 blur-3xl" />
          <div className="cta-blur absolute -right-20 bottom-0 h-60 w-60 rounded-full bg-white/10 blur-3xl" />

          <div className="relative z-10 mx-auto max-w-3xl">
            <span
              ref={badgeRef}
              className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm backdrop-blur"
            >
              🚀 Let's Build Together
            </span>

            <h2 ref={titleRef} className="mt-6 text-4xl font-bold md:text-5xl">
              {splitWords("Ready to Start Your Next Project?")}
            </h2>

            <p ref={paragraphRef} className="mt-6 text-lg text-white/80">
              Whether you're launching a new business or scaling an existing
              one, we're here to help you create something extraordinary.
            </p>

            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <div className="relative">
                <span className="cta-glow pointer-events-none absolute inset-x-2 top-1/2 -z-10 h-10 -translate-y-1/2 rounded-full bg-white/40 opacity-30 blur-2xl" />
                <Button
                  ref={magneticButtonRef}
                  size="lg"
                  variant="secondary"
                  className="rounded-full px-8 py-5"
                >
                  Get Started
                </Button>
              </div>

              <Button
                size="lg"
                variant="outline"
                className="rounded-full border-white bg-transparent px-8 py-5 text-white hover:bg-white hover:text-black"
              >
                Contact Us
                <DrawIcon icon={ArrowRight} className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
