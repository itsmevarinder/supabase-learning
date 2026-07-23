"use client";

import { useRef, useState } from "react";
import Autoplay from "embla-carousel-autoplay";
import { Star } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { splitWords } from "@/components/shadn/split-words";
import DrawIcon from "@/components/shadn/DrawIcon";
import { gsap, useGSAP, EASE, prefersReducedMotion } from "@/lib/gsap/config";

const AUTOPLAY_DELAY_MS = 4000;

// Shape of a row from the `testimonials` Supabase table — the admin panel
// manages these; this component just renders whatever's active.
export interface TestimonialRow {
  id: string;
  name: string;
  role: string;
  image_url: string | null;
  review: string;
  rating: number;
  is_active: boolean;
  sort_order: number;
}

interface Testimonial {
  id: string;
  name: string;
  role: string;
  image: string;
  review: string;
  rating: number;
}

function mapTestimonialRow(row: TestimonialRow): Testimonial {
  return {
    id: row.id,
    name: row.name,
    role: row.role,
    image: row.image_url ?? "",
    review: row.review,
    rating: row.rating,
  };
}

interface TestimonialSectionProps {
  testimonials?: TestimonialRow[];
}

export default function TestimonialSection({ testimonials: testimonialRows }: TestimonialSectionProps) {
  const testimonials = (testimonialRows ?? []).map(mapTestimonialRow);
  const section = useRef<HTMLElement>(null);
  const eyebrowRef = useRef<HTMLSpanElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const dotFillRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const dotFillTweenRef = useRef<gsap.core.Tween>(undefined);
  const [api, setApi] = useState<CarouselApi>();
  const [autoplay] = useState(() =>
    Autoplay({ delay: AUTOPLAY_DELAY_MS, stopOnInteraction: false, stopOnMouseEnter: true })
  );

  useGSAP(
    () => {
      if (!api) return;

      // --- Progress dots: the active dot's fill bar animates in step with
      // the autoplay timer, resetting and restarting on every slide change
      // (including manual prev/next/dot clicks, since those fire "select" too). ---
      const startDotFill = (index: number) => {
        dotFillTweenRef.current?.kill();
        gsap.set(dotFillRefs.current, { scaleX: 0 });
        const fill = dotFillRefs.current[index];
        if (!fill) return;
        dotFillTweenRef.current = gsap.to(fill, {
          scaleX: 1,
          duration: AUTOPLAY_DELAY_MS / 1000,
          ease: "linear",
        });
      };

      const handleDotSelect = (emblaApi: CarouselApi) => {
        if (!emblaApi) return;
        startDotFill(emblaApi.selectedScrollSnap());
      };

      handleDotSelect(api);
      api.on("select", handleDotSelect);

      // --- One-time heading entrance, played once it scrolls into view ---
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

      if (prefersReducedMotion()) {
        return () => {
          api.off("select", handleDotSelect);
          dotFillTweenRef.current?.kill();
        };
      }

      // --- Continuous ambient motion ---
      const blurCircles = section.current?.querySelectorAll<HTMLElement>(".testimonial-blur");
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

      return () => {
        api.off("select", handleDotSelect);
        dotFillTweenRef.current?.kill();
      };
    },
    { scope: section, dependencies: [api] }
  );

  return (
    <section className="section-tint-cyan relative py-24" ref={section}>
      <div className="testimonial-blur absolute -left-16 top-10 -z-10 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
      <div className="testimonial-blur absolute -right-16 bottom-0 -z-10 h-80 w-80 rounded-full bg-amber-600/15 blur-3xl" />

      <div className="container mx-auto px-6">
        {/* Heading */}
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <span
            ref={eyebrowRef}
            className="rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary"
          >
            Testimonials
          </span>

          <h2 ref={titleRef} className="mt-6 text-5xl font-bold">
            {splitWords("What Our Clients Say")}
          </h2>

          <p ref={subRef} className="mt-4 text-muted-foreground">
            Trusted by hundreds of happy customers around the world.
          </p>
        </div>

        {testimonials.length === 0 ? (
          <p className="mx-auto max-w-md text-center text-muted-foreground">
            Testimonials will show up here once they&apos;re added.
          </p>
        ) : (
        <>
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          plugins={[autoplay]}
          setApi={setApi}
          className="w-full"
        >
          <CarouselContent className="-ml-4 py-3!">
            {testimonials.map((item) => (
              <CarouselItem
                key={item.id}
                className="pl-4 md:basis-1/2 lg:basis-1/3"
              >
                <Card className="h-full rounded-2xl transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
                  <CardContent className="flex h-full flex-col p-8">
                    {/* Stars */}
                    <div className="mb-5 flex">
                      {[...Array(5)].map((_, i) =>
                        i < item.rating ? (
                          <DrawIcon
                            key={i}
                            icon={Star}
                            revealFill
                            delay={i * 0.15}
                            className="h-5 w-5 fill-yellow-400 text-yellow-400"
                          />
                        ) : (
                          <Star key={i} className="h-5 w-5 text-muted-foreground/30" />
                        )
                      )}
                    </div>

                    {/* Review */}
                    <p className="flex-1 leading-7 text-muted-foreground">
                      &ldquo;{item.review}&rdquo;
                    </p>

                    {/* User */}
                    <div className="mt-8 flex items-center gap-4 border-t pt-6">
                      <Avatar className="h-14 w-14 isolate">
                        <AvatarImage src={item.image} />
                        <AvatarFallback>
                          {item.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>

                      <div>
                        <h4 className="font-semibold">
                          {item.name}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {item.role}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>

          <CarouselPrevious className="-left-5" />
          <CarouselNext className="-right-5" />
        </Carousel>

        {/* Progress dots — click to jump, fill animates with the autoplay timer */}
        <div className="mt-8 flex items-center justify-center gap-2">
          {testimonials.map((item, index) => (
            <button
              key={item.id}
              type="button"
              aria-label={`Go to testimonial ${index + 1}`}
              onClick={() => api?.scrollTo(index)}
              className="h-1.5 w-8 overflow-hidden rounded-full bg-muted"
            >
              <span
                ref={(el) => {
                  dotFillRefs.current[index] = el;
                }}
                className="block h-full w-full origin-left scale-x-0 rounded-full bg-primary"
              />
            </button>
          ))}
        </div>
        </>
        )}
      </div>
    </section>
  );
}
