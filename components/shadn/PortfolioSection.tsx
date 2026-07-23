"use client";

import { useRef } from "react";
import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { splitWords } from "@/components/shadn/split-words";
import HoverDistortImage from "@/components/shadn/HoverDistortImage";
import DrawIcon from "@/components/shadn/DrawIcon";
import { gsap, useGSAP, EASE, prefersReducedMotion, isFinePointer } from "@/lib/gsap/config";
import { scrollReveal } from "@/lib/gsap/reveal";
import { attachMagneticHover } from "@/lib/gsap/magnetic";

// Shape of a row from the `portfolio_projects` Supabase table — the admin
// panel manages these; this component just renders whatever's active.
export interface PortfolioProjectRow {
  id: string;
  title: string;
  category: string;
  image_url: string;
  project_link: string | null;
  is_active: boolean;
  sort_order: number;
}

interface PortfolioProject {
  title: string;
  category: string;
  image: string;
  link: string;
}

function mapProjectRow(row: PortfolioProjectRow): PortfolioProject {
  const rawLink = row.project_link?.trim();
  // Plain text typed into the link field (spaces and all) shouldn't turn
  // into a URL-encoded mess like "Id%20earum%20quo" — treat it like a slug.
  const link = rawLink ? rawLink.replace(/\s+/g, "-") : "#";

  return {
    title: row.title,
    category: row.category,
    image: row.image_url,
    link,
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
  const projects = (projectRows ?? []).map(mapProjectRow);

  const section = useRef<HTMLElement>(null);
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

      // --- Per-card scroll reveal — each card watches its OWN position, so
      // one bad ScrollTrigger calculation can never hide the whole grid. ---
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

      if (reduced) return;

      // --- Continuous ambient glow behind the grid and the CTA button ---
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

      // --- Interactive 3D tilt + glare sweep, driven by pointer position —
      // fine-pointer only, since touch has no real "hover" and constantly
      // recomputing 3D transforms on scroll/drag is wasted work on mobile. ---
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

      // --- Magnetic hover on the bottom CTA ---
      const detachMagnetic = attachMagneticHover(ctaRef.current, { strength: 0.35 });

      return () => {
        tiltFnsRef.current = [];
        detachMagnetic();
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
      <div className="container relative mx-auto px-6">
        {/* Decorative Blur */}
        <div className="portfolio-blur absolute -left-16 top-0 -z-10 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
        <div className="portfolio-blur absolute -right-16 bottom-0 -z-10 h-80 w-80 rounded-full bg-amber-600/15 blur-3xl" />

        {/* Heading */}
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <span
            ref={eyebrowRef}
            className="rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary"
          >
            Our Portfolio
          </span>

          <h2 ref={titleRef} className="mt-6 text-5xl font-bold">
            {splitWords("Featured Projects")}
          </h2>

          <p ref={subRef} className="mt-5 text-lg text-muted-foreground">
            Explore some of our recent work crafted with creativity,
            innovation, and attention to detail.
          </p>
        </div>

        {/* Projects */}
        {projects.length === 0 ? (
          <p className="mx-auto max-w-md text-center text-muted-foreground">
            Projects will show up here once they&apos;re added.
          </p>
        ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3 perspective-[1000px]">
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
              <div className="relative h-72 overflow-hidden">
                <HoverDistortImage
                  image={project.image}
                  alt={project.title}
                  className="h-full w-full"
                />

                {/* Glare sweep, follows the pointer */}
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
                  <Button className="rounded-full">
                    View Project
                  </Button>
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
                  href={project.link}
                  className="mt-5 inline-flex items-center gap-2 font-medium text-primary"
                >
                  Learn More
                  <DrawIcon icon={ArrowRight} delay={index * 0.12} className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
        )}

        {/* Bottom CTA */}
        <div className="relative mt-16 text-center">
          <span className="cta-glow pointer-events-none absolute left-1/2 top-1/2 -z-10 h-20 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/30 opacity-30 blur-2xl" />
          <Button ref={ctaRef} className="rounded-full px-8 py-5">
            View All Projects
          </Button>
        </div>
      </div>
    </section>
  );
}
