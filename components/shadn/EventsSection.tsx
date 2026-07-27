"use client";

import { useRef, useState } from "react";
import { ArrowUpRight, Calendar, ChevronLeft, ChevronRight, Clock, MapPin } from "lucide-react";

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

const ACCENT_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

const EVENTS_PER_PAGE = 4;

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
  backgroundImageUrl?: string | null;
}

export default function EventsSection({ events: eventRows, backgroundImageUrl }: EventsSectionProps) {
  const events = (eventRows ?? []).map(mapEventRow);
  const bgImage =
    backgroundImageUrl || "https://images.unsplash.com/photo-1511578314322-379afb476865?w=1600&q=80";

  const [page, setPage] = useState(0);
  const totalPages = Math.ceil(events.length / EVENTS_PER_PAGE);
  const pagedEvents = events.slice(page * EVENTS_PER_PAGE, page * EVENTS_PER_PAGE + EVENTS_PER_PAGE);

  function goToPage(next: number) {
    setPage(Math.min(Math.max(next, 0), totalPages - 1));
  }

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
    <section className="relative isolate scroll-mt-28 overflow-hidden py-24" ref={section}>
      <div
        className="absolute inset-0 -z-20 bg-cover bg-center bg-fixed"
        style={{ backgroundImage: `url(${bgImage})` }}
      />
      <div className="absolute inset-0 -z-10 bg-black/65" />

      <div className="container mx-auto md:px-6 px-4">
        <div className="mx-auto max-w-2xl text-center">
          <span
            ref={eyebrowRef}
            className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm"
          >
            Upcoming Events
          </span>

          <h2 ref={titleRef} className="mt-6 text-4xl font-bold leading-tight text-white lg:text-5xl">
            {splitWords("Join Us At Our Next Event")}
          </h2>

          <p ref={paragraphRef} className="mt-6 leading-8 text-white/80">
            Workshops, meetups, and launches — see what we&apos;re hosting next and save your spot.
          </p>
        </div>

        {events.length === 0 ? (
          <p className="mt-14 text-center text-white/70">
            No upcoming events right now — check back soon.
          </p>
        ) : (
          <div className="mx-auto mt-16 max-w-5xl rounded-3xl bg-black/20 p-5 backdrop-blur-md sm:p-8">
            {pagedEvents.map((event, localIndex) => {
              const index = page * EVENTS_PER_PAGE + localIndex;
              const color = ACCENT_COLORS[index % ACCENT_COLORS.length];
              return (
                <div
                  key={event.id}
                  ref={(el) => {
                    rowRefs.current[index] = el;
                  }}
                  className="group flex gap-4 border-b border-white/15 py-5 first:pt-0 last:border-0 last:pb-0 sm:gap-6 sm:py-7"
                >
                  {/* Date */}
                  <div className="flex w-12 shrink-0 flex-col justify-center text-center sm:w-16">
                    <div className="text-2xl font-bold leading-none sm:text-3xl" style={{ color }}>
                      {event.day}
                    </div>
                    <div className="mt-1 text-[10px] font-semibold tracking-wide text-white/60 sm:mt-1.5 sm:text-xs">
                      {event.month}
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="w-px shrink-0" style={{ backgroundColor: `color-mix(in oklch, ${color} 45%, white)` }} />

                  {/* Details */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3 sm:flex-wrap sm:gap-x-6 sm:gap-y-3">
                      <div className="min-w-0">
                        <h3 className="text-base font-semibold text-white transition-colors sm:text-lg">
                          {event.title}
                        </h3>
                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-white/70 sm:text-sm">
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

                      {event.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={event.image}
                          alt=""
                          className="size-10 shrink-0 rounded-lg object-cover sm:size-12"
                        />
                      ) : (
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-white/10 sm:size-12">
                          <Calendar className="size-5 sm:size-6" style={{ color }} />
                        </div>
                      )}
                    </div>

                    <div className="mt-2 flex flex-col items-start gap-2 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between sm:gap-x-6 sm:gap-y-2">
                      <p className="text-sm leading-6 text-white/70 sm:max-w-xl sm:text-base sm:leading-7">
                        {event.description}
                      </p>

                      {event.linkUrl && (
                        <a
                          href={event.linkUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex shrink-0 text-white items-center gap-1 text-sm font-medium hover:underline"
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

        {totalPages > 1 && (
          <div className="mx-auto mt-6 flex max-w-5xl items-center justify-between">
            <button
              type="button"
              onClick={() => goToPage(page - 1)}
              disabled={page === 0}
              aria-label="Previous events"
              className="flex size-9 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white backdrop-blur-md transition-colors hover:bg-white/20 disabled:opacity-30 disabled:hover:bg-white/10"
            >
              <ChevronLeft className="size-4" />
            </button>

            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => goToPage(i)}
                  aria-label={`Page ${i + 1}`}
                  aria-current={page === i ? "true" : undefined}
                  className={`size-2 rounded-full transition-all ${
                    page === i ? "w-5 bg-white" : "bg-white/30 hover:bg-white/50"
                  }`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={() => goToPage(page + 1)}
              disabled={page === totalPages - 1}
              aria-label="Next events"
              className="flex size-9 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white backdrop-blur-md transition-colors hover:bg-white/20 disabled:opacity-30 disabled:hover:bg-white/10"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
