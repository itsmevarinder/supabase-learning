"use client";

import { useRef } from "react";
import { ArrowUpRight, Clock, MapPin } from "lucide-react";

import { splitWords } from "@/components/shadn/split-words";
import { gsap, useGSAP, EASE } from "@/lib/gsap/config";
import { scrollReveal } from "@/lib/gsap/reveal";

export interface EventRow {
  id: string;
  image_url: string | null;
  title: string;
  description: string;
  event_date: string;
  event_time: string | null;
  location: string | null;
  link_url: string | null;
  is_active: boolean;
  sort_order: number;
}

interface Event {
  id: string;
  image: string | null;
  title: string;
  description: string;
  day: string;
  month: string;
  weekday: string;
  time: string | null;
  location: string | null;
  linkUrl: string | null;
}

// Cycles through the site's own --chart-1..5 tokens (navy/gold/teal/wine/slate)
// so each row gets a distinct, on-brand accent instead of one flat color.
const ACCENT_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

function mapEventRow(row: EventRow): Event {
  const date = new Date(`${row.event_date}T00:00:00`);
  return {
    id: row.id,
    image: row.image_url,
    title: row.title,
    description: row.description,
    day: date.toLocaleDateString("en-US", { day: "numeric" }),
    month: date.toLocaleDateString("en-US", { month: "short" }).toUpperCase(),
    weekday: date.toLocaleDateString("en-US", { weekday: "short" }),
    time: row.event_time,
    location: row.location,
    linkUrl: row.link_url,
  };
}

interface EventsSectionProps {
  events?: EventRow[];
}

export default function EventsSection({ events: eventRows }: EventsSectionProps) {
  const events = (eventRows ?? []).map(mapEventRow);

  const section = useRef<HTMLElement>(null);
  const eyebrowRef = useRef<HTMLSpanElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const paragraphRef = useRef<HTMLParagraphElement>(null);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);

  useGSAP(
    () => {
      if (!section.current) return;

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
        .from(paragraphRef.current, { y: 20, opacity: 0, duration: 0.5, ease: EASE.soft }, "-=0.4");

      rowRefs.current.forEach((row, i) => {
        scrollReveal(row, {
          trigger: row,
          direction: "up",
          distance: 24,
          duration: 0.5,
          delay: i * 0.06,
          start: "top 92%",
        });
      });
    },
    { scope: section }
  );

  return (
    <section className="relative pb-24 mb-10" ref={section}>
      <div className="container mx-auto px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span
            ref={eyebrowRef}
            className="rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary"
          >
            Upcoming Events
          </span>

          <h2 ref={titleRef} className="mt-6 text-4xl font-bold leading-tight lg:text-5xl">
            {splitWords("Join Us At Our Next Event")}
          </h2>

          <p ref={paragraphRef} className="mt-6 leading-8 text-muted-foreground">
            Workshops, meetups, and launches — see what we&apos;re hosting next and save your spot.
          </p>
        </div>

        {events.length === 0 ? (
          <p className="mt-14 text-center text-muted-foreground">
            No upcoming events right now — check back soon.
          </p>
        ) : (
          <div className="mx-auto mt-16 max-w-5xl">
            {events.map((event, index) => {
              const color = ACCENT_COLORS[index % ACCENT_COLORS.length];
              return (
                <div
                  key={event.id}
                  ref={(el) => {
                    rowRefs.current[index] = el;
                  }}
                  className="group flex gap-6 border-b py-7 first:pt-0 last:border-0 last:pb-0"
                >
                  {/* Date */}
                  <div className="w-16 shrink-0 text-center">
                    <div className="text-3xl font-bold leading-none" style={{ color }}>
                      {event.day}
                    </div>
                    <div className="mt-1.5 text-xs font-semibold tracking-wide text-muted-foreground">
                      {event.month}
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="w-px shrink-0" style={{ backgroundColor: `color-mix(in oklch, ${color} 35%, var(--border))` }} />

                  {/* Details */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
                      <div className="min-w-0">
                        <h3 className="text-lg font-semibold transition-colors">{event.title}</h3>
                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                          <span>{event.weekday}</span>
                          {event.time && (
                            <span className="flex items-center gap-1">
                              <Clock className="size-3.5" />
                              {event.time}
                            </span>
                          )}
                          {event.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="size-3.5" />
                              {event.location}
                            </span>
                          )}
                        </div>
                      </div>

                      {event.image && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={event.image}
                          alt=""
                          className="hidden size-12 shrink-0 rounded-lg object-cover sm:block"
                        />
                      )}
                    </div>

                    <div className="mt-2 flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
                      <p className="max-w-xl leading-7 text-muted-foreground">{event.description}</p>

                      {event.linkUrl && (
                        <a
                          href={event.linkUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex shrink-0 items-center gap-1 text-sm font-medium hover:underline"
                          style={{ color }}
                        >
                          Learn More
                          <ArrowUpRight className="size-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
