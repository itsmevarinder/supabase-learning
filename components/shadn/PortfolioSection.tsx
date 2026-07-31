"use client";

import { useRef } from "react";
import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { splitWords } from "@/components/shadn/split-words";
import HoverDistortImage from "@/components/shadn/HoverDistortImage";
import DrawIcon from "@/components/shadn/DrawIcon";
import { gsap, useGSAP, ScrollTrigger, EASE, prefersReducedMotion, isFinePointer } from "@/lib/gsap/config";
import { scrollReveal } from "@/lib/gsap/reveal";
import { attachMagneticHover } from "@/lib/gsap/magnetic";

export interface PortfolioProjectRow {
  id: string;
  title: string;
  category: string;
  image_url: string;
  project_link: string | null;
  description: string | null;
  client_name: string | null;
  project_year: string | null;
  role: string | null;
  is_active: boolean;
  sort_order: number;
  created_at?: string;
}

interface PortfolioProject {
  id: string;
  title: string;
  category: string;
  image: string;
}

function mapProjectRow(row: PortfolioProjectRow): PortfolioProject {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    image: row.image_url,
  };
}

const GLARE_STYLE: CSSProperties = {
  ["--x" as string]: "50%",
  ["--y" as string]: "50%",
  background: "radial-gradient(circle at var(--x) var(--y), rgba(255,255,255,0.4), transparent 55%)",
};

type TiltSetters = {
  rotateX: (value: number) => void;
  rotateY: (value: number) => void;
  lift: (value: number) => void;
};

interface PortfolioSectionProps {
  projects?: PortfolioProjectRow[];
}

export default function PortfolioSection({ projects: projectRows }: PortfolioSectionProps) {
  const t = useTranslations("Portfolio");
  const projects = (projectRows ?? []).map(mapProjectRow);

  const section = useRef<HTMLElement>(null);
  const leftColRef = useRef<HTMLDivElement>(null);
  const rightColRef = useRef<HTMLDivElement>(null);
  const eyebrowRef = useRef<HTMLSpanElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const glareRefs = useRef<(HTMLDivElement | null)[]>([]);
  const ctaRef = useRef<HTMLButtonElement>(null);
  const tiltFnsRef = useRef<(TiltSetters | null)[]>([]);
  const tiltEnabledRef = useRef(false);

  useGSAP(
    () => {
      const reduced = prefersReducedMotion();
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

      const cards = cardRefs.current.filter((el): el is HTMLDivElement => Boolean(el));
      cards.forEach((card, i) => {
        scrollReveal(card, {
          trigger: card,
          direction: "up",
          distance: 60,
          rotation: i % 2 === 0 ? -4 : 4,
          duration: 0.7,
          delay: (i % 3) * 0.08,
          start: "top 92%",
        });
      });

  
      const mm = gsap.matchMedia();
      mm.add("(min-width: 1024px)", () => {
        const left = leftColRef.current;
        const right = rightColRef.current;
        if (!left || !right) return;

        const st = ScrollTrigger.create({
          trigger: right,
          start: "top 145px",
          end: () => `+=${right.offsetHeight - left.offsetHeight}`,
          pin: left,
          pinSpacing: false,
        });

        return () => st.kill();
      });

      if (reduced) return;

      const blurCircles = section.current?.querySelectorAll<HTMLElement>(".portfolio-blur");
      if (blurCircles?.length) {
        gsap.to(blurCircles, {
          scale: 1.2,
          duration: 5.5,
          ease: "linear",
          yoyo: true,
          repeat: -1,
          stagger: { each: 1.4, from: "random" },
        });
      }

      const ctaGlow = section.current?.querySelector<HTMLElement>(".cta-glow");
      if (ctaGlow) {
        gsap.to(ctaGlow, { scale: 1.25, opacity: 0.5, duration: 1.6, ease: "linear", yoyo: true, repeat: -1 });
      }


      tiltEnabledRef.current = isFinePointer();
      if (tiltEnabledRef.current) {
        cards.forEach((card, i) => {
          gsap.set(card, { transformPerspective: 800 });
          tiltFnsRef.current[i] = {
            rotateX: gsap.quickTo(card, "rotateX", { duration: 0.4, ease: "power3" }),
            rotateY: gsap.quickTo(card, "rotateY", { duration: 0.4, ease: "power3" }),
            lift: gsap.quickTo(card, "y", { duration: 0.4, ease: "power3" }),
          };
        });
      }


      const detachMagnetic = attachMagneticHover(ctaRef.current, { strength: 0.35 });

      return () => {
        tiltFnsRef.current = [];
        detachMagnetic();
        mm.revert();
      };
    },
    { scope: section }
  );

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>, index: number) => {
    if (!tiltEnabledRef.current) return;
    const tilt = tiltFnsRef.current[index];
    if (!tilt) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;

    tilt.rotateY(px * 14);
    tilt.rotateX(py * -14);
    tilt.lift(-6);

    const glare = glareRefs.current[index];
    if (glare) {
      gsap.to(glare, {
        "--x": `${(px + 0.5) * 100}%`,
        "--y": `${(py + 0.5) * 100}%`,
        opacity: 1,
        duration: 0.3,
        overwrite: true,
      });
    }
  };

  const handlePointerLeave = (index: number) => {
    if (!tiltEnabledRef.current) return;
    const tilt = tiltFnsRef.current[index];
    if (tilt) {
      tilt.rotateX(0);
      tilt.rotateY(0);
      tilt.lift(0);
    }
    const glare = glareRefs.current[index];
    if (glare) {
      gsap.to(glare, { opacity: 0, duration: 0.5 });
    }
  };

  return (
    <section id="portfolio" className="scroll-mt-28 py-24" ref={section}>
      <div className="container relative mx-auto md:px-6 px-4">
        {/* Decorative Blur */}
        <div className="portfolio-blur absolute -left-16 top-0 -z-10 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
        <div className="portfolio-blur absolute -right-16 bottom-0 -z-10 h-80 w-80 rounded-full bg-amber-600/15 blur-3xl" />

        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.6fr)] lg:items-start lg:px-10">

          <div ref={leftColRef}>
            <span
              ref={eyebrowRef}
              className="rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary"
            >
              {t("eyebrow")}
            </span>

            <h2 ref={titleRef} className="mt-6 text-4xl lg:text-5xl font-bold leading-tight">
              {splitWords(t("title"))}
            </h2>

            <p ref={subRef} className="mt-5 text-lg text-muted-foreground">
              {t("subtitle")}
            </p>

            <div className="relative mt-10 inline-block">
              <span className="cta-glow pointer-events-none absolute left-1/2 top-1/2 -z-10 h-16 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/30 opacity-30 blur-2xl" />
              <Link href="/portfolio">
                <Button ref={ctaRef} className="rounded-full px-8 py-5">
                  {t("viewAll")}
                </Button>
              </Link>
            </div>
          </div>

          {projects.length === 0 ? (
            <p className="text-muted-foreground">
              {t("empty")}
            </p>
          ) : (
          <div ref={rightColRef} className="flex flex-col gap-6 perspective-[1000px]">
            {projects.map((project, index) => (
              <div
                key={index}
                ref={(el) => {
                  cardRefs.current[index] = el;
                }}
                onPointerMove={(event) => handlePointerMove(event, index)}
                onPointerLeave={() => handlePointerLeave(index)}
                className="group overflow-hidden rounded-3xl border bg-background shadow-sm transition-shadow duration-300 hover:shadow-2xl will-change-transform"
              >
                {/* Image */}
                <div className="relative h-80 overflow-hidden">
                  <HoverDistortImage
                    image={project.image}
                    alt={project.title}
                    className="h-full w-full"
                  />

                  <div
                    ref={(el) => {
                      glareRefs.current[index] = el;
                    }}
                    className="pointer-events-none absolute inset-0 opacity-0"
                    style={GLARE_STYLE}
                  />

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/0 transition duration-300 group-hover:bg-black/40" />

                  <div className="absolute inset-0 flex items-center justify-center opacity-0 transition duration-300 group-hover:opacity-100">
                    <Link href={`/portfolio/${project.id}`}>
                      <Button className="rounded-full">
                        {t("viewProject")}
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <span className="text-sm font-medium text-primary">
                    {project.category}
                  </span>

                  <h3 className="mt-2 text-2xl font-semibold">
                    {project.title}
                  </h3>

                  <Link
                    href={`/portfolio/${project.id}`}
                    className="mt-5 inline-flex items-center gap-2 font-medium text-primary"
                  >
                    {t("learnMore")}
                    <DrawIcon icon={ArrowRight} delay={index * 0.12} className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
          )}
        </div>
      </div>
    </section>
  );
}
