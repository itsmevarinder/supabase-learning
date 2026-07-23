"use client";

import { useRef } from "react";
import {
  Sparkles,
  ShieldCheck,
  BarChart3,
  Globe,
  Zap,
  Users,
  ArrowUpRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { splitWords } from "@/components/shadn/split-words";
import DrawIcon from "@/components/shadn/DrawIcon";
import { gsap, useGSAP, EASE, prefersReducedMotion } from "@/lib/gsap/config";
import { scrollReveal } from "@/lib/gsap/reveal";

const features = [
  {
    icon: Sparkles,
    title: "AI Automation",
    description:
      "Automate repetitive tasks and save hours every week with intelligent workflows.",
  },
  {
    icon: ShieldCheck,
    title: "Enterprise Security",
    description:
      "Keep your data protected with advanced security and compliance features.",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description:
      "Track performance, revenue, and user engagement from a single dashboard.",
  },
  {
    icon: Globe,
    title: "Global Access",
    description:
      "Access your workspace from anywhere with real-time cloud synchronization.",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description:
      "Optimized for speed with instant loading and smooth user experience.",
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description:
      "Work together seamlessly with shared projects, comments, and notifications.",
  },
];

export default function FeaturesSection() {
  const section = useRef<HTMLElement>(null);
  const eyebrowRef = useRef<HTMLParagraphElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const iconRefs = useRef<(HTMLDivElement | null)[]>([]);

  useGSAP(
    () => {
      const reduced = prefersReducedMotion();

      // --- One-time-per-visit entrance for the heading, replays as you
      // scroll into/out of the section. ---
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

      // --- Card entrance: scale + alternating tilt (not a flat slide),
      // each card watching its own scroll position so a bad ScrollTrigger
      // calculation can never leave the grid stuck hidden. ---
      cardRefs.current.forEach((card, i) => {
        scrollReveal(card, {
          trigger: card,
          direction: "none",
          scale: 0.85,
          rotation: i % 2 === 0 ? -6 : 6,
          duration: 0.7,
          delay: (i % 3) * 0.08,
          start: "top 90%",
        });
      });

      // Cards float continuously once settled — avoids ever getting stuck
      // hidden if a ScrollTrigger position calculation doesn't line up.
      if (reduced) return;

      gsap.to(cardRefs.current, {
        y: -10,
        duration: 3.2,
        ease: "linear",
        yoyo: true,
        repeat: -1,
        stagger: { each: 0.3, from: "random" },
      });

      gsap.to(iconRefs.current, {
        y: -8,
        rotate: 3,
        duration: 2.2,
        ease: "linear",
        yoyo: true,
        repeat: -1,
        stagger: { each: 0.25, from: "random" },
      });
    },
    { scope: section }
  );

  return (
    <section id="services" className="section-tint-fuchsia scroll-mt-28 py-20" ref={section}>
      <div className="container relative mx-auto px-6">
        {/* Heading */}
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <p
            ref={eyebrowRef}
            className="text-sm font-semibold uppercase tracking-widest text-primary"
          >
            Features
          </p>
          <h2 ref={titleRef} className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">
            {splitWords("Everything you need to grow faster")}
          </h2>
          <p ref={subRef} className="mt-4 text-lg text-muted-foreground">
            Powerful tools designed to help teams automate workflows, collaborate
            efficiently, and scale their business with confidence.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <Card
                key={index}
                ref={(el) => {
                  cardRefs.current[index] = el;
                }}
                className="group rounded-2xl border-0 bg-background shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
              >
                <CardHeader>
                  <div
                    ref={(el) => {
                      iconRefs.current[index] = el;
                    }}
                    className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground"
                  >
                    <DrawIcon icon={Icon} delay={index * 0.15} className="h-7 w-7" />
                  </div>

                  <CardTitle className="mt-6 text-xl">
                    {feature.title}
                  </CardTitle>

                  <CardDescription className="text-base leading-7">
                    {feature.description}
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <Button
                    variant="ghost"
                    className="group/btn px-0 text-primary hover:bg-transparent"
                  >
                    Learn more
                    <DrawIcon
                      icon={ArrowUpRight}
                      delay={index * 0.15}
                      className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1"
                    />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
