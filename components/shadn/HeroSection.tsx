"use client";

import { useRef, useState } from "react";
import Autoplay from "embla-carousel-autoplay";

import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { animateCounter } from "@/lib/animate-counter";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap/config";
import { scrollParallax } from "@/lib/gsap/parallax";
import { attachMagneticHover } from "@/lib/gsap/magnetic";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(SplitText);

const RIPPLE_MOVE_THROTTLE_MS = 120;

function spawnRipple(layer: HTMLElement, x: number, y: number, size: number) {
  const ripple = document.createElement("span");
  ripple.className = "absolute rounded-full";
  ripple.style.left = `${x}px`;
  ripple.style.top = `${y}px`;
  ripple.style.width = `${size}px`;
  ripple.style.height = `${size}px`;
  ripple.style.transform = "translate(-50%, -50%)";
  ripple.style.border = "2px solid rgba(255, 255, 255, 0.65)";
  ripple.style.boxShadow = "0 0 20px 4px rgba(255, 255, 255, 0.25) inset";
  layer.appendChild(ripple);

  gsap.fromTo(
    ripple,
    { scale: 0, opacity: 0.9 },
    {
      scale: 6,
      opacity: 0,
      duration: 1.1,
      ease: "power2.out",
      onComplete: () => ripple.remove(),
    }
  );
}

interface HeroStat {
  target: number;
  suffix: string;
  label: string;
}

// Shape of a row from the `hero_banners` Supabase table — the admin panel
// manages these; this component just renders whatever's active.
export interface HeroBannerRow {
  id: string;
  slug: string;
  image_url: string;
  image_alt: string | null;
  badge_emoji: string | null;
  badge_text: string;
  title: string;
  description: string | null;
  primary_button_text: string | null;
  primary_button_link: string | null;
  secondary_button_text: string | null;
  secondary_button_link: string | null;
  stats: { target: number; suffix?: string; label: string }[] | null;
  is_active: boolean;
  sort_order: number;
}

interface HeroSlide {
  image: string;
  badge: string;
  title: string;
  subtitle: string;
  primaryButtonText: string;
  primaryButtonLink: string;
  secondaryButtonText: string;
  secondaryButtonLink: string;
  stats: HeroStat[];
}

const DEFAULT_STATS: HeroStat[] = [
  { target: 500, suffix: "+", label: "Projects Delivered" },
  { target: 120, suffix: "+", label: "Team Members" },
  { target: 98, suffix: "%", label: "Client Satisfaction" },
];

// Used when no active rows exist yet in `hero_banners` (fresh installs,
// or the table not seeded) — the section still renders something real.
const FALLBACK_SLIDES: HeroSlide[] = [
  {
    image:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1800&q=80",
    badge: "✨ Trusted by 10,000+ Clients",
    title: "Create Experiences That Inspire",
    subtitle:
      "Build beautiful digital products that engage customers and grow your business.",
    primaryButtonText: "Get Started",
    primaryButtonLink: "#contact",
    secondaryButtonText: "Learn More",
    secondaryButtonLink: "#about",
    stats: DEFAULT_STATS,
  },
  {
    image:
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1800&q=80",
    badge: "🚀 Innovative Solutions",
    title: "Turn Your Ideas Into Reality",
    subtitle:
      "Modern websites, scalable applications, and premium digital experiences.",
    primaryButtonText: "Get Started",
    primaryButtonLink: "#contact",
    secondaryButtonText: "Learn More",
    secondaryButtonLink: "#about",
    stats: DEFAULT_STATS,
  },
  {
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1800&q=80",
    badge: "💡 Smart Digital Agency",
    title: "We Design. We Develop. We Deliver.",
    subtitle:
      "Helping startups and enterprises build the next generation of digital products.",
    primaryButtonText: "Get Started",
    primaryButtonLink: "#contact",
    secondaryButtonText: "Learn More",
    secondaryButtonLink: "#about",
    stats: DEFAULT_STATS,
  },
];

function mapBannerToSlide(banner: HeroBannerRow): HeroSlide {
  const stats =
    Array.isArray(banner.stats) && banner.stats.length > 0
      ? banner.stats.map((stat) => ({ target: stat.target, suffix: stat.suffix ?? "", label: stat.label }))
      : DEFAULT_STATS;

  return {
    image: banner.image_url,
    badge: [banner.badge_emoji, banner.badge_text].filter(Boolean).join(" "),
    title: banner.title,
    subtitle: banner.description ?? "",
    primaryButtonText: banner.primary_button_text || "Get Started",
    primaryButtonLink: banner.primary_button_link || "#contact",
    secondaryButtonText: banner.secondary_button_text || "Learn More",
    secondaryButtonLink: banner.secondary_button_link || "#about",
    stats,
  };
}

interface HeroSectionProps {
  banners?: HeroBannerRow[];
}

export default function HeroSection({ banners }: HeroSectionProps) {
  const slides = banners && banners.length > 0 ? banners.map(mapBannerToSlide) : FALLBACK_SLIDES;

  const container = useRef<HTMLElement>(null);
  const [api, setApi] = useState<CarouselApi>();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [autoplayPlugin] = useState(() => Autoplay({ delay: 6000, stopOnInteraction: false }));

  const bgRefs = useRef<(HTMLDivElement | null)[]>([]);
  const badgeRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const titleRefs = useRef<(HTMLHeadingElement | null)[]>([]);
  const subtitleRefs = useRef<(HTMLParagraphElement | null)[]>([]);
  const buttonsRefs = useRef<(HTMLDivElement | null)[]>([]);
  const statsRefs = useRef<(HTMLDivElement | null)[]>([]);
  // Nested per-slide — [slideIndex][statIndex] — since each banner can
  // carry its own number of stats, unlike the old fixed-length heroStats.
  const statNumberRefs = useRef<(HTMLHeadingElement | null)[][]>([]);
  const rippleLayerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const magneticButtonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const isPointerDownRef = useRef(false);
  const lastRippleAtRef = useRef(0);
  const titleSplitsRef = useRef<SplitText[]>([]);

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>, index: number) => {
    isPointerDownRef.current = true;
    const layer = rippleLayerRefs.current[index];
    if (!layer) return;
    const rect = event.currentTarget.getBoundingClientRect();
    lastRippleAtRef.current = event.timeStamp;
    spawnRipple(layer, event.clientX - rect.left, event.clientY - rect.top, 24);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>, index: number) => {
    if (!isPointerDownRef.current) return;
    if (event.timeStamp - lastRippleAtRef.current < RIPPLE_MOVE_THROTTLE_MS) return;
    const layer = rippleLayerRefs.current[index];
    if (!layer) return;
    const rect = event.currentTarget.getBoundingClientRect();
    lastRippleAtRef.current = event.timeStamp;
    spawnRipple(layer, event.clientX - rect.left, event.clientY - rect.top, 16);
  };

  const handlePointerUp = () => {
    isPointerDownRef.current = false;
  };

  useGSAP(
    (_context, contextSafe) => {
      if (!api) return;

      const reduced = prefersReducedMotion();

      const buttonChildren = (index: number) => {
        const el = buttonsRefs.current[index];
        return el ? Array.from(el.children) : [];
      };
      const statChildren = (index: number) => {
        const el = statsRefs.current[index];
        return el ? Array.from(el.children) : [];
      };
      // Split each slide's title into characters once, so the timeline can
      // flip them in individually (3D rotation) on every slide change.
      titleSplitsRef.current.forEach((split) => split.revert());
      titleSplitsRef.current = titleRefs.current.map((el) => {
        gsap.set(el, { perspective: 400 });
        return SplitText.create(el, { type: "chars,words" });
      });

      const titleChars = (index: number) => titleSplitsRef.current[index]?.chars ?? [];

      const resetSlides = () => {
        gsap.set(badgeRefs.current, { y: -16, opacity: 0 });
        gsap.set(subtitleRefs.current, { y: 24, opacity: 0 });
        slides.forEach((_, index) => {
          gsap.set(titleChars(index), { autoAlpha: 0, scale: 4, rotationX: -180 });
          gsap.set(buttonChildren(index), { y: 20, opacity: 0, scale: 0.9 });
          gsap.set(statChildren(index), { y: 20, opacity: 0 });
        });
      };

      // Counter animations are kicked off from a deferred timeline callback
      // (it fires later, when the playhead reaches it — not synchronously
      // during this effect), so it needs contextSafe() to be tracked and
      // cleaned up by gsap's context like everything else here.
      const playCounters = contextSafe!((index: number) => {
        slides[index].stats.forEach((stat, statIndex) => {
          const el = statNumberRefs.current[index]?.[statIndex];
          animateCounter(el, stat.target, { suffix: stat.suffix, duration: 3 });
        });
      });

      const animateSlide = (index: number) => {
        const tl = gsap.timeline();

        if (reduced) {
          gsap.set(badgeRefs.current[index], { y: 0, opacity: 1 });
          gsap.set(titleChars(index), { autoAlpha: 1, scale: 1, rotationX: 0 });
          gsap.set(subtitleRefs.current[index], { y: 0, opacity: 1 });
          gsap.set(buttonChildren(index), { y: 0, opacity: 1, scale: 1 });
          gsap.set(statChildren(index), { y: 0, opacity: 1 });
          slides[index].stats.forEach((stat, statIndex) => {
            const el = statNumberRefs.current[index]?.[statIndex];
            if (el) el.textContent = `${stat.target}${stat.suffix}`;
          });
          return tl;
        }

        // Cinematic entrance: badge pops, title chars flip in with a 3D
        // rotation, subtitle and CTAs follow, stats stagger in and count up
        // — each beat overlapping the previous slightly so it reads as one
        // continuous motion rather than a checklist of separate animations.
        tl.to(badgeRefs.current[index], { y: 0, opacity: 1, duration: 0.5, ease: "back.out(1.7)" }, 0.1)
          .to(
            titleChars(index),
            {
              duration: 1,
              scale: 1,
              autoAlpha: 1,
              rotationX: 0,
              transformOrigin: "100% 50%",
              ease: "back",
              stagger: 0.02,
            },
            0.25
          )
          .to(subtitleRefs.current[index], { y: 0, opacity: 1, duration: 0.6, ease: "power2.out" }, 0.45)
          .to(
            buttonChildren(index),
            { y: 0, opacity: 1, scale: 1, duration: 0.5, stagger: 0.1, ease: "back.out(1.7)" },
            0.55
          )
          .to(
            statChildren(index),
            { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: "power2.out" },
            0.65
          )
          .call(() => playCounters(index), undefined, 0.65);

        return tl;
      };

      const handleSelect = (emblaApi: CarouselApi) => {
        if (!emblaApi) return;
        setSelectedIndex(emblaApi.selectedScrollSnap());
        resetSlides();
        animateSlide(emblaApi.selectedScrollSnap());
      };

      handleSelect(api);
      api.on("select", handleSelect);

      if (!reduced) {
        // Gentle, continuous ambient motion on the decorative blur circles —
        // independent of slide transitions so it never resets/pops.
        const blurCircles = container.current?.querySelectorAll<HTMLElement>(".hero-blur");
        if (blurCircles?.length) {
          gsap.to(blurCircles, {
            scale: 1.15,
            duration: 6,
            ease: "linear",
            yoyo: true,
            repeat: -1,
            stagger: { each: 1.5, from: "random" },
          });
        }

        // Continuous Ken Burns loop on every slide's background — always
        // playing, never tied to slide selection, so it never resets/pops.
        if (bgRefs.current.length) {
          gsap.to(bgRefs.current, {
            scale: 1.12,
            xPercent: "+=2",
            duration: 12,
            ease: "linear",
            yoyo: true,
            repeat: -1,
            stagger: { each: 2, from: "start" },
          });

          // Cinematic exit parallax: the backgrounds drift as you scroll
          // from the hero into the rest of the page — a different
          // property (y) from the Ken Burns scale/xPercent above, so the
          // two motions layer instead of fighting over the same transform.
          scrollParallax(bgRefs.current, {
            trigger: container.current,
            distance: 120,
            start: "top top",
            end: "bottom top",
          });
        }

        // Magnetic hover on every CTA — one gsap.quickTo pair per button.
        const detachMagnetic = magneticButtonRefs.current
          .filter((button): button is HTMLButtonElement => Boolean(button))
          .map((button) => attachMagneticHover(button, { strength: 0.35 }));

        return () => {
          api.off("select", handleSelect);
          detachMagnetic.forEach((detach) => detach());
          titleSplitsRef.current.forEach((split) => split.revert());
          titleSplitsRef.current = [];
        };
      }

      return () => {
        api.off("select", handleSelect);
        titleSplitsRef.current.forEach((split) => split.revert());
        titleSplitsRef.current = [];
      };
    },
    { scope: container, dependencies: [api] }
  );

  return (
    <section className="relative w-full" ref={container}>
      <Carousel opts={{ loop: true }} plugins={[autoplayPlugin]} setApi={setApi} className="w-full">
        <CarouselContent>
          {slides.map((slide, index) => (
            <CarouselItem key={index}>
              <div
                className="relative flex h-screen overflow-hidden items-center justify-center pt-20"
                onPointerDown={(event) => handlePointerDown(event, index)}
                onPointerMove={(event) => handlePointerMove(event, index)}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
                onPointerCancel={handlePointerUp}
              >
                {/* Background (animated independently so Ken Burns zoom never affects text) */}
                <div
                  ref={(el) => {
                    bgRefs.current[index] = el;
                  }}
                  className="absolute inset-0 isolate bg-cover bg-center will-change-transform"
                  style={{ backgroundImage: `url(${slide.image})` }}
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-linear-to-r from-black/80 via-black/60 to-black/70" />

                {/* Water-ripple layer — spans created imperatively on pointer down/move */}
                <div
                  ref={(el) => {
                    rippleLayerRefs.current[index] = el;
                  }}
                  className="pointer-events-none absolute inset-0 overflow-hidden"
                />

                {/* Decorative Blur */}
                <div className="hero-blur absolute left-10 top-10 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
                <div className="hero-blur absolute bottom-10 right-10 h-80 w-80 rounded-full bg-amber-600/15 blur-3xl" />

                {/* Content */}
                <div className="relative z-10 mx-auto max-w-4xl px-6 text-center text-white">
                  {/* Badge */}
                  <span
                    ref={(el) => {
                      badgeRefs.current[index] = el;
                    }}
                    className="mb-6 inline-flex rounded-full border border-white/20 bg-white/10 px-5 py-2 text-sm backdrop-blur"
                  >
                    {slide.badge}
                  </span>

                  {/* Title */}
                  <h1
                    ref={(el) => {
                      titleRefs.current[index] = el;
                    }}
                    className="text-5xl font-extrabold leading-tight md:text-7xl"
                  >
                    {slide.title}
                  </h1>

                  {/* Subtitle */}
                  <p
                    ref={(el) => {
                      subtitleRefs.current[index] = el;
                    }}
                    className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-gray-200 md:text-xl"
                  >
                    {slide.subtitle}
                  </p>

                  {/* Buttons */}
                  <div
                    ref={(el) => {
                      buttonsRefs.current[index] = el;
                    }}
                    className="mt-6 flex flex-wrap justify-center gap-4"
                  >
                    <a href={slide.primaryButtonLink}>
                      <Button
                        ref={(el) => {
                          magneticButtonRefs.current[index * 2] = el;
                        }}
                        size="lg"
                        className="rounded-full px-8 py-6"
                      >
                        {slide.primaryButtonText}
                      </Button>
                    </a>

                    <a href={slide.secondaryButtonLink}>
                      <Button
                        ref={(el) => {
                          magneticButtonRefs.current[index * 2 + 1] = el;
                        }}
                        size="lg"
                        variant="outline"
                        className="rounded-full border-white bg-transparent px-8 py-6 text-white hover:bg-white hover:text-black"
                      >
                        {slide.secondaryButtonText}
                      </Button>
                    </a>
                  </div>

                  {/* Stats */}
                  <div
                    ref={(el) => {
                      statsRefs.current[index] = el;
                    }}
                    className="mt-6 flex flex-wrap justify-center gap-10 md:mt-16 md:gap-20"
                  >
                    {slide.stats.map((stat, statIndex) => (
                      <div key={stat.label}>
                        <h3
                          ref={(el) => {
                            if (!statNumberRefs.current[index]) statNumberRefs.current[index] = [];
                            statNumberRefs.current[index][statIndex] = el;
                          }}
                          className="text-4xl font-bold"
                        >
                          0{stat.suffix}
                        </h3>
                        <p className="mt-2 text-gray-300">{stat.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        {/* Navigation Arrows */}
        <CarouselPrevious className="left-6 border-white bg-white/20 text-white backdrop-blur hover:bg-white hover:text-black" />
        <CarouselNext className="right-6 border-white bg-white/20 text-white backdrop-blur hover:bg-white hover:text-black" />

        {/* Dot indicators — the active one fills smoothly over the autoplay
            delay, so it doubles as a progress indicator for the next slide. */}
        <div className="absolute inset-x-0 bottom-8 z-10 flex justify-center gap-2.5">
          {slides.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => api?.scrollTo(index)}
              aria-label={`Go to slide ${index + 1}`}
              aria-current={selectedIndex === index}
              className={`relative h-2 overflow-hidden rounded-full bg-white/30 transition-[width] duration-300 ${
                selectedIndex === index ? "w-10" : "w-2 hover:bg-white/50"
              }`}
            >
              {selectedIndex === index && (
                <span key={selectedIndex} className="hero-dot-fill absolute inset-0 rounded-full bg-white" />
              )}
            </button>
          ))}
        </div>
      </Carousel>
    </section>
  );
}
