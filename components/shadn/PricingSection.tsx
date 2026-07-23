"use client";

import { useRef } from "react";
import { Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { splitWords } from "@/components/shadn/split-words";
import DrawIcon from "@/components/shadn/DrawIcon";
import { gsap, useGSAP, EASE, prefersReducedMotion } from "@/lib/gsap/config";
import { scrollReveal } from "@/lib/gsap/reveal";

// Shape of a row from the `pricing_plans` Supabase table — always exactly
// the 3 seeded plans (Starter/Pro/Enterprise), edited via the admin panel.
// There's no add/delete for this section, only editing existing rows.
export interface PricingPlanRow {
  id: string;
  slug: string;
  title: string;
  price: string;
  description: string | null;
  features: string[] | null;
  is_featured: boolean;
  button_text: string | null;
  sort_order: number;
}

interface PricingPlan {
  title: string;
  price: string;
  desc: string;
  features: string[];
  featured: boolean;
  buttonText: string;
}

function mapPlanRow(row: PricingPlanRow): PricingPlan {
  return {
    title: row.title,
    price: row.price,
    desc: row.description ?? "",
    features: row.features ?? [],
    featured: row.is_featured,
    buttonText: row.button_text || (row.is_featured ? "Start Free Trial" : "Choose Plan"),
  };
}

interface PricingSectionProps {
  plans?: PricingPlanRow[];
}

export default function PricingSection({ plans: planRows }: PricingSectionProps) {
  const plans = (planRows ?? []).map(mapPlanRow);

  const section = useRef<HTMLElement>(null);
  const eyebrowRef = useRef<HTMLSpanElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const sparkleRef = useRef<HTMLDivElement>(null);

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

      const cards = cardRefs.current.filter((el): el is HTMLDivElement => Boolean(el));
      const featuredIndex = plans.findIndex((plan) => plan.featured);

      if (prefersReducedMotion()) {
        // Simple, safe fallback: each card fades up independently.
        cards.forEach((card) => scrollReveal(card, { trigger: card, direction: "up", distance: 40, start: "top 88%" }));
        return;
      }

      // --- Card-stack entrance: the side plans start tucked behind the
      // featured plan (offset, scaled down, slightly rotated, like a stack
      // of cards) and fan out into their grid positions as the section
      // scrolls into view. One shared timeline (not independent per-card
      // triggers) because the cards move relative to one another. ---
      cards.forEach((card, i) => {
        if (i === featuredIndex) {
          gsap.set(card, { opacity: 0, y: 30 });
        } else {
          const side = i < featuredIndex ? 1 : -1;
          gsap.set(card, { opacity: 0, x: side * 60, y: -24, scale: 0.85, rotate: side * -6 });
        }
      });

      const stackTl = gsap.timeline({
        scrollTrigger: {
          trigger: section.current,
          start: "top 75%",
          toggleActions: "restart reverse restart reverse",
        },
      });

      cards.forEach((card, i) => {
        if (i === featuredIndex) {
          stackTl.to(card, { opacity: 1, y: 0, duration: 0.6, ease: EASE.out }, 0);
        } else {
          stackTl.to(
            card,
            { opacity: 1, x: 0, y: 0, scale: 1, rotate: 0, duration: 0.7, ease: EASE.out },
            0.2 + i * 0.12
          );
        }
      });

      // --- Continuous ambient motion: spotlight glow behind the featured
      // plan, and a gentle wobble on its Sparkles icon. ---
      const glow = section.current?.querySelector<HTMLElement>(".pricing-glow");
      if (glow) {
        gsap.to(glow, { scale: 1.25, opacity: 0.6, duration: 2.2, ease: "linear", yoyo: true, repeat: -1 });
      }

      if (sparkleRef.current) {
        gsap.to(sparkleRef.current, {
          rotate: 12,
          scale: 1.1,
          duration: 1.6,
          ease: "linear",
          yoyo: true,
          repeat: -1,
        });
      }
    },
    { scope: section }
  );

  return (
    <section id="pricing" className="section-tint-fuchsia scroll-mt-28 py-24" ref={section}>
      <div className="container mx-auto px-6">
        {/* Heading */}
        <div className="mx-auto max-w-2xl text-center">
          <span
            ref={eyebrowRef}
            className="rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary"
          >
            Pricing
          </span>

          <h2 ref={titleRef} className="mt-6 text-4xl lg:text-5xl font-bold">
            {splitWords("Simple & Transparent Pricing")}
          </h2>

          <p ref={subRef} className="mt-5 text-muted-foreground">
            Choose a plan that grows with your business.
          </p>
        </div>

        {/* Cards */}
        {plans.length === 0 ? (
          <p className="mx-auto mt-16 max-w-md text-center text-muted-foreground">
            Plans will show up here once they&apos;re added.
          </p>
        ) : (
        <div className="mt-16 grid gap-8 lg:grid-cols-3">
          {plans.map((plan, index) => (
            <div
              key={plan.title}
              ref={(el) => {
                cardRefs.current[index] = el;
              }}
              className={`relative overflow-hidden rounded-[32px] border bg-background p-8 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl ${
                plan.featured
                  ? "scale-105 border-primary shadow-2xl"
                  : ""
              }`}
            >
              {plan.featured && (
                <span className="pricing-glow pointer-events-none absolute left-1/2 top-0 -z-10 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/40 opacity-40 blur-3xl" />
              )}

              {plan.featured && (
                <div className="absolute right-5 top-5 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-white">
                  Most Popular
                </div>
              )}

              {plan.featured && (
                <div ref={sparkleRef} className="mb-6 inline-flex rounded-full bg-primary/10 p-3">
                  <DrawIcon icon={Sparkles} className="h-6 w-6 text-primary" />
                </div>
              )}

              <h3 className="text-3xl font-bold">
                {plan.title}
              </h3>

              <p className="mt-3 text-muted-foreground">
                {plan.desc}
              </p>

              <div className="mt-8">
                <span className="text-6xl font-bold">
                  {plan.price}
                </span>

                {plan.price !== "Custom" && (
                  <span className="text-muted-foreground">
                    /month
                  </span>
                )}
              </div>

              <Button
                className={`mt-8 w-full rounded-full py-6 ${
                  !plan.featured && "bg-secondary text-foreground hover:bg-secondary/80"
                }`}
              >
                {plan.buttonText}
              </Button>

              <div className="my-8 border-t" />

              <div className="space-y-4">
                {plan.features.map((item, itemIndex) => (
                  <div
                    key={item}
                    className="flex items-center gap-3"
                  >
                    <div className="rounded-full bg-primary/10 p-1.5">
                      <DrawIcon icon={Check} delay={itemIndex * 0.1} className="h-4 w-4 text-primary" />
                    </div>

                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        )}
      </div>
    </section>
  );
}
