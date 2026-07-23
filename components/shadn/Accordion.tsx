"use client";

import { useRef } from "react";
import { CircleCheck, Headphones, ShieldCheck, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { splitWords } from "@/components/shadn/split-words";
import DrawIcon from "@/components/shadn/DrawIcon";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { gsap, useGSAP, EASE, prefersReducedMotion } from "@/lib/gsap/config";
import { scrollReveal } from "@/lib/gsap/reveal";

export interface FaqRow {
  id: string;
  question: string;
  answer: string;
  is_active: boolean;
  sort_order: number;
}

interface Faq {
  value: string;
  question: string;
  answer: string;
}

function mapFaqRow(row: FaqRow): Faq {
  return {
    value: row.id,
    question: row.question,
    answer: row.answer,
  };
}

const checklist = [
  { icon: CircleCheck, label: "24/7 Customer Support" },
  { icon: ShieldCheck, label: "100% Secure Platform" },
  { icon: Clock, label: "Fast Response Time" },
  { icon: Headphones, label: "Dedicated Support Team" },
];

interface FAQSectionProps {
  faqs?: FaqRow[];
}

export default function FAQSection({ faqs: faqRows }: FAQSectionProps) {
  const faqs = (faqRows ?? []).map(mapFaqRow);
  const section = useRef<HTMLElement>(null);
  const eyebrowRef = useRef<HTMLSpanElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const paragraphRef = useRef<HTMLParagraphElement>(null);
  const checklistRefs = useRef<(HTMLDivElement | null)[]>([]);
  const accordionItemRefs = useRef<(HTMLDivElement | null)[]>([]);

  useGSAP(
    () => {
      // --- Left column entrance, replays every visit ---
      gsap
        .timeline({
          scrollTrigger: {
            trigger: section.current,
            start: "top 75%",
            toggleActions: "restart reverse restart reverse",
          },
        })
        .from(eyebrowRef.current, { y: 16, scale: 0.7, opacity: 0, duration: 0.6, ease: EASE.bounce })
        .from(
          titleRef.current?.querySelectorAll<HTMLElement>(".word-inner") ?? [],
          { y: 24, opacity: 0, duration: 0.5, stagger: 0.05, ease: EASE.out },
          "-=0.35"
        )
        .from(paragraphRef.current, { y: 20, opacity: 0, duration: 0.5, ease: EASE.soft }, "-=0.4")
        .from(
          checklistRefs.current,
          { x: -20, rotation: -4, opacity: 0, duration: 0.4, stagger: 0.12, ease: EASE.soft },
          "-=0.25"
        );

      // The button is never scroll-gated — it's visible immediately and
      // just glows continuously, so it can never end up stuck hidden.

      // --- Per-item reveal for the FAQ accordion, each item watching its
      // OWN scroll position. ---
      accordionItemRefs.current.forEach((item, i) => {
        scrollReveal(item, {
          trigger: item,
          direction: "right",
          distance: 40,
          rotation: 3,
          duration: 0.6,
          delay: i * 0.06,
          start: "top 92%",
        });
      });

      if (prefersReducedMotion()) return;

      // --- Continuous ambient motion ---
      const blurCircles = section.current?.querySelectorAll<HTMLElement>(".faq-blur");
      if (blurCircles?.length) {
        gsap.to(blurCircles, {
          scale: 1.2,
          duration: 6,
          ease: "linear",
          yoyo: true,
          repeat: -1,
          stagger: { each: 1.5, from: "random" },
        });
      }

      const ctaGlow = section.current?.querySelector<HTMLElement>(".cta-glow");
      if (ctaGlow) {
        gsap.to(ctaGlow, { scale: 1.25, opacity: 0.5, duration: 1.6, ease: "linear", yoyo: true, repeat: -1 });
      }
    },
    { scope: section }
  );

  return (
    <section className="section-tint-cyan relative py-24" ref={section}>
      <div className="faq-blur absolute -left-20 top-10 -z-10 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
      <div className="faq-blur absolute -right-20 bottom-0 -z-10 h-80 w-80 rounded-full bg-amber-600/15 blur-3xl" />

      <div className="container mx-auto px-6">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          {/* Left Side */}
          <div>
            <span
              ref={eyebrowRef}
              className="rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary"
            >
              Frequently Asked Questions
            </span>

            <h2 ref={titleRef} className="mt-6 text-4xl font-bold leading-tight lg:text-5xl">
              {splitWords("Everything You Need To Know")}
            </h2>

            <p ref={paragraphRef} className="mt-6 text-lg leading-8 text-muted-foreground">
              Find answers to the most common questions about our services.
              Can&apos;t find what you&apos;re looking for? Our team is always ready to
              help.
            </p>

            <div className="mt-10 space-y-5">
              {checklist.map((item, index) => {
                return (
                  <div
                    key={item.label}
                    ref={(el) => {
                      checklistRefs.current[index] = el;
                    }}
                    className="flex items-center gap-3"
                  >
                    <DrawIcon
                      icon={item.icon}
                      delay={index * 0.15}
                      className="h-5 w-5 text-green-600"
                    />
                    <span>{item.label}</span>
                  </div>
                );
              })}
            </div>

            <div className="relative mt-10 inline-block">
              <span className="cta-glow pointer-events-none absolute left-1/2 top-1/2 -z-10 h-16 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/30 opacity-30 blur-2xl" />
              <Button className="rounded-full px-8 py-5">
                Contact Support
              </Button>
            </div>
          </div>

          {/* Right Side */}
          <div>
            {faqs.length === 0 ? (
              <p className="text-muted-foreground">FAQs will show up here once they&apos;re added.</p>
            ) : (
              <Accordion
                defaultValue={[faqs[0].value]}
                className="space-y-4"
              >
                {faqs.map((faq, index) => (
                  <AccordionItem
                    key={faq.value}
                    value={faq.value}
                    ref={(el) => {
                      accordionItemRefs.current[index] = el;
                    }}
                    className="rounded-2xl border bg-white p-2 shadow-sm transition-all hover:shadow-lg"
                  >
                    <AccordionTrigger className="px-5 py-4 text-left text-lg font-semibold">
                      {faq.question}
                    </AccordionTrigger>

                    <AccordionContent className="px-5 pb-5 text-muted-foreground leading-7">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
