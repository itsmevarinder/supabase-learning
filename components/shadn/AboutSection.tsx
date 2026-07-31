"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import MorphCheckIcon from "@/components/shadn/MorphCheckIcon";
import { animateCounter } from "@/lib/animate-counter";
import { splitWords } from "@/components/shadn/split-words";
import HoverDistortImage from "@/components/shadn/HoverDistortImage";
import { gsap, useGSAP, EASE, prefersReducedMotion } from "@/lib/gsap/config";
import { scrollParallax } from "@/lib/gsap/parallax";

export interface AboutSectionRow {
  id: number;
  image_url: string | null;
  image_url_2: string | null;
  eyebrow_text: string;
  title: string;
  description: string;
  years_experience: number;
  button_text: string;
  features: string[] | null;
}

interface AboutSectionProps {
  about?: AboutSectionRow | null;
}

export default function AboutSection({ about }: AboutSectionProps) {
  const t = useTranslations("About");
  const imageUrl = about?.image_url || "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=900&q=80";
  const imageUrl2 = about?.image_url_2 || "https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&q=80";
  const eyebrowText = about?.eyebrow_text ?? t("fallback.eyebrow");
  const title = about?.title ?? t("fallback.title");
  const description = about?.description ?? t("fallback.description");
  const yearsExperience = about?.years_experience ?? 10;
  const buttonText = about?.button_text ?? t("fallback.buttonText");
  const features: string[] = about?.features?.length ? about.features : t.raw("fallback.features");

  const section = useRef<HTMLElement>(null);
  const imageWrapperRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const floatingImageRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const badgeNumberRef = useRef<HTMLHeadingElement>(null);
  const eyebrowRef = useRef<HTMLSpanElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const paragraphRef = useRef<HTMLParagraphElement>(null);
  const featureRefs = useRef<(HTMLDivElement | null)[]>([]);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useGSAP(
    (_context, contextSafe) => {
      const reduced = prefersReducedMotion();

      const playCounter = contextSafe!(() => {
        animateCounter(badgeNumberRef.current, yearsExperience, { suffix: "+", duration: 1.2 });
      });

      gsap
        .timeline({
          scrollTrigger: {
            trigger: section.current,
            start: "top 75%",
            toggleActions: "restart reverse restart reverse",
          },
        })
        .from(imageWrapperRef.current, { x: -60, opacity: 0, duration: 0.9, ease: EASE.out })
        .from(floatingImageRef.current, { scale: 0.7, opacity: 0, rotate: -6, duration: 0.7, ease: EASE.bounce }, "-=0.5")
        .from(badgeRef.current, { scale: 0, opacity: 0, duration: 0.6, ease: EASE.bounce }, "-=0.4")
        .call(playCounter, undefined, "<")
        .from(eyebrowRef.current, { y: 16, opacity: 0, duration: 0.5, ease: EASE.soft }, "-=0.5")
        .from(
          titleRef.current?.querySelectorAll<HTMLElement>(".word-inner") ?? [],
          { y: 24, opacity: 0, duration: 0.5, stagger: 0.05, ease: EASE.out },
          "-=0.3"
        )
        .from(paragraphRef.current, { y: 20, opacity: 0, duration: 0.5, ease: EASE.soft }, "-=0.35")
        .from(
          featureRefs.current,
          { x: -20, opacity: 0, duration: 0.4, stagger: 0.12, ease: EASE.soft },
          "-=0.25"
        )
        .from(buttonRef.current, { y: 16, opacity: 0, duration: 0.5, ease: EASE.bounce }, "-=0.2");

      if (reduced) return;

      scrollParallax(imageRef.current, { trigger: section.current, distance: 70 });

      gsap.to(imageWrapperRef.current, { y: -14, duration: 3.5, ease: "linear", yoyo: true, repeat: -1 });
      gsap.to(floatingImageRef.current, {
        y: 12,
        rotate: -3,
        duration: 3,
        ease: "linear",
        yoyo: true,
        repeat: -1,
        delay: 0.15,
      });
      gsap.to(badgeRef.current, {
        y: 10,
        rotate: 2,
        duration: 2.6,
        ease: "linear",
        yoyo: true,
        repeat: -1,
        delay: 0.3,
      });

      const blurCircles = section.current?.querySelectorAll<HTMLElement>(".about-blur");
      if (blurCircles?.length) {
        gsap.to(blurCircles, {
          scale: 1.2,
          duration: 5,
          ease: "linear",
          yoyo: true,
          repeat: -1,
          stagger: { each: 1.2, from: "random" },
        });
      }
    },
    { scope: section }
  );

  return (
    <section id="about" className="scroll-mt-28 py-24" ref={section}>
      <div className="container mx-auto md:px-6 px-4">
        <div className="grid items-center grid-cols-1 gap-16 lg:grid-cols-2">
          {/* Left Image */}
          <div className="relative pt-10 md:pl-10 pl-5 md:pr-0 pr-3" ref={imageWrapperRef}>
            {/* Decorative Blur */}
            <div className="about-blur absolute -left-8 top-2 -z-10 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
            <div className="about-blur absolute -bottom-10 -right-10 -z-10 h-72 w-72 rounded-full bg-amber-600/15 blur-3xl" />

            {/* Main image */}
            <div ref={imageRef}>
              <HoverDistortImage
                image={imageUrl}
                alt="About"
                className="h-104 w-full rounded-3xl shadow-2xl"
              />
            </div>

            <div
              ref={floatingImageRef}
              className="absolute -left-1 md:left-0 -top-15 z-10 overflow-hidden rounded-2xl border-4 border-background shadow-2xl"
            >
              <HoverDistortImage
                image={imageUrl2}
                alt="About — detail"
                className="sm:h-50 sm:w-100 w-full max-w-50 sm:max-w-full rounded-xl"
              />
            </div>

            <div
              ref={badgeRef}
              className="absolute -bottom-8 -right-1 z-10 rounded-2xl bg-primary p-6 text-white shadow-xl md:-right-8"
            >
              <h3 ref={badgeNumberRef} className="text-4xl font-bold">0+</h3>
              <p className="mt-1">{t("yearsExperience")}</p>
            </div>
          </div>

          {/* Right Content */}
          <div>
            <span
              ref={eyebrowRef}
              className="rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary"
            >
              {eyebrowText}
            </span>

            <h2 ref={titleRef} className="mt-6 text-4xl lg:text-5xl font-bold leading-tight">
              {splitWords(title)}
            </h2>

            <p ref={paragraphRef} className="mt-6 leading-8 text-muted-foreground">
              {description}
            </p>

            <div className="mt-8 space-y-4">
              {features.map((item, index) => (
                <div
                  key={item}
                  ref={(el) => {
                    featureRefs.current[index] = el;
                  }}
                  className="flex items-center gap-3"
                >
                  <MorphCheckIcon className="h-5 w-5 shrink-0 text-primary" delay={index * 0.4} />
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <Button ref={buttonRef} className="mt-10 rounded-full px-8 py-5">
              {buttonText}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
