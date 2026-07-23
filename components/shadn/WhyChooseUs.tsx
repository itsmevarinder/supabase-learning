"use client";

import { useRef } from "react";
import {
  Award,
  ShieldCheck,
  Clock3,
  Users,
} from "lucide-react";
import { splitWords } from "@/components/shadn/split-words";
import DrawIcon from "@/components/shadn/DrawIcon";
import { gsap, useGSAP, EASE, prefersReducedMotion } from "@/lib/gsap/config";
import { scrollReveal } from "@/lib/gsap/reveal";

const features = [
  {
    icon: Award,
    title: "Premium Quality",
    description:
      "We deliver high-quality solutions with attention to every detail.",
  },
  {
    icon: ShieldCheck,
    title: "Trusted & Secure",
    description:
      "Your data and business are protected with enterprise-grade security.",
  },
  {
    icon: Clock3,
    title: "Fast Delivery",
    description:
      "Projects are completed on time without compromising quality.",
  },
  {
    icon: Users,
    title: "Expert Team",
    description:
      "Our experienced professionals are dedicated to your success.",
  },
];

export default function WhyChooseUs() {
  const section = useRef<HTMLElement>(null);
  const eyebrowRef = useRef<HTMLSpanElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const ringRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useGSAP(
    () => {
      // --- Heading entrance, replays every visit ---
      gsap
        .timeline({
          scrollTrigger: {
            trigger: section.current,
            start: "top 80%",
            toggleActions: "restart reverse restart reverse",
          },
        })
        .from(eyebrowRef.current, { y: 16, scale: 0.7, opacity: 0, duration: 0.6, ease: EASE.bounce })
        .from(
          titleRef.current?.querySelectorAll<HTMLElement>(".word-inner") ?? [],
          { y: 24, opacity: 0, duration: 0.5, stagger: 0.05, ease: EASE.out },
          "-=0.35"
        )
        .from(subRef.current, { y: 20, opacity: 0, duration: 0.5, ease: EASE.soft }, "-=0.4");

      // --- Per-item reveal, alternating sides by column, each item
      // watching its OWN scroll position. ---
      itemRefs.current.forEach((item, i) => {
        scrollReveal(item, {
          trigger: item,
          direction: i % 2 === 0 ? "left" : "right",
          distance: 50,
          rotation: i % 2 === 0 ? -5 : 5,
          duration: 0.7,
          start: "top 90%",
        });
      });

      if (prefersReducedMotion()) return;

      // --- Continuous radar-ping pulse behind every icon, plays indefinitely ---
      const rings = ringRefs.current.filter((el): el is HTMLSpanElement => Boolean(el));
      gsap.to(rings, {
        scale: 1.5,
        opacity: 0,
        duration: 1.8,
        ease: "power1.out",
        repeat: -1,
        stagger: { each: 0.5, from: "start" },
      });
    },
    { scope: section }
  );

  return (
    <section className="section-tint-indigo py-24" ref={section}>
      <div className="container mx-auto px-6">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <span
            ref={eyebrowRef}
            className="rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary"
          >
            Why Choose Us
          </span>

          <h2 ref={titleRef} className="mt-6 text-5xl font-bold">
            {splitWords("Built to Help Your Business Grow")}
          </h2>

          <p ref={subRef} className="mt-4 text-muted-foreground">
            We combine creativity, technology, and strategy to deliver
            exceptional results for every client.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {features.map((item, index) => {
            return (
              <div
                key={index}
                ref={(el) => {
                  itemRefs.current[index] = el;
                }}
                className="flex gap-5 rounded-2xl border bg-background p-8 transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <span
                    ref={(el) => {
                      ringRefs.current[index] = el;
                    }}
                    className="pointer-events-none absolute inset-0 rounded-xl border-2 border-primary/50"
                  />
                  <DrawIcon icon={item.icon} delay={index * 0.15} className="h-7 w-7 text-primary" />
                </div>

                <div>
                  <h3 className="text-xl font-semibold">
                    {item.title}
                  </h3>

                  <p className="leading-7 text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
