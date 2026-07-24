"use client";

import { useRef, useState } from "react";
import { Play } from "lucide-react";

import { splitWords } from "@/components/shadn/split-words";
import { gsap, useGSAP, EASE, prefersReducedMotion } from "@/lib/gsap/config";
import { scrollReveal } from "@/lib/gsap/reveal";
import { getYouTubeEmbedUrl, getYouTubeThumbnail } from "@/lib/youtube";

export interface VideoSectionRow {
  id: number;
  video_url: string;
  title: string;
  description: string;
  is_active: boolean;
}

interface VideoSectionProps {
  video?: VideoSectionRow | null;
}

export default function VideoSection({ video }: VideoSectionProps) {
  const [playing, setPlaying] = useState(false);

  const section = useRef<HTMLElement>(null);
  const eyebrowRef = useRef<HTMLSpanElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const paragraphRef = useRef<HTMLParagraphElement>(null);
  const tileRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const ringRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const blurRefs = useRef<(HTMLDivElement | null)[]>([]);

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

      scrollReveal(tileRef.current, { trigger: tileRef.current, direction: "up", distance: 50, scale: 0.96, start: "top 85%" });

      // Floating "Watch Video" badge pops in right after the tile settles.
      gsap.from(badgeRef.current, {
        scale: 0,
        opacity: 0,
        duration: 0.6,
        ease: EASE.bounce,
        delay: 0.3,
        scrollTrigger: {
          trigger: tileRef.current,
          start: "top 85%",
          toggleActions: "restart reverse restart reverse",
        },
      });

      if (prefersReducedMotion()) return;

      // Gentle continuous float on the badge, matching the About section's badge motion.
      gsap.to(badgeRef.current, { y: -8, duration: 2.4, ease: "linear", yoyo: true, repeat: -1 });

      // Ambient drift on the decorative background blurs.
      if (blurRefs.current.length) {
        gsap.to(blurRefs.current, {
          scale: 1.2,
          duration: 6,
          ease: "linear",
          yoyo: true,
          repeat: -1,
          stagger: { each: 1.5, from: "random" },
        });
      }

      // Radar-style ping rings around the play button, staggered so a new
      // ring launches while the previous one is still expanding.
      ringRefs.current.forEach((ring, i) => {
        if (!ring) return;
        gsap.fromTo(
          ring,
          { scale: 0.6, opacity: 0.6 },
          { scale: 1.6, opacity: 0, duration: 2, ease: "power1.out", repeat: -1, delay: i * 0.7 }
        );
      });
    },
    { scope: section }
  );

  if (!video || !video.is_active) return null;

  const thumbnail = getYouTubeThumbnail(video.video_url);
  const embedUrl = getYouTubeEmbedUrl(video.video_url);

  if (!thumbnail || !embedUrl) return null;

  return (
    <section className="relative py-24" ref={section}>
      <div
        ref={(el) => {
          blurRefs.current[0] = el;
        }}
        className="pointer-events-none absolute -left-16 top-10 -z-10 h-80 w-80 rounded-full bg-primary/15 blur-3xl"
      />
      <div
        ref={(el) => {
          blurRefs.current[1] = el;
        }}
        className="pointer-events-none absolute -right-16 bottom-0 -z-10 h-96 w-96 rounded-full bg-amber-600/10 blur-3xl"
      />

      <div className="container mx-auto md:px-6 px-4">
        <div className="mx-auto max-w-2xl text-center">
          <span
            ref={eyebrowRef}
            className="rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary"
          >
            Watch A Message
          </span>

          <h2 ref={titleRef} className="mt-6 text-4xl font-bold leading-tight lg:text-5xl">
            {splitWords(video.title)}
          </h2>

          <p ref={paragraphRef} className="mt-6 leading-8 text-muted-foreground">
            {video.description}
          </p>
        </div>

        <div ref={tileRef} className="relative mx-auto container mt-16 w-full">
          <div className="rounded-2xl md:rounded-[calc(1.5rem+4px)] bg-linear-to-br from-primary/40 via-primary/10 to-transparent p-1 shadow-2xl transition-transform duration-500 hover:-translate-y-1">
            <div className="relative aspect-video overflow-hidden rounded-2xl md:rounded-3xl">
              {playing ? (
                <iframe
                  src={embedUrl}
                  title={video.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="h-full w-full"
                />
              ) : (
                <button
                  type="button"
                  onClick={() => setPlaying(true)}
                  aria-label={`Play video: ${video.title}`}
                  className="group relative h-full w-full"
                >
                  <img src={thumbnail} alt={video.title} className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-black/40 transition-colors duration-300 group-hover:from-black/80" />

                  <span className="absolute inset-0 flex items-center justify-center">
                    {[0, 1].map((i) => (
                      <span
                        key={i}
                        ref={(el) => {
                          ringRefs.current[i] = el;
                        }}
                        className="pointer-events-none absolute size-20 rounded-full border-2 border-white/70"
                      />
                    ))}
                    <span className="relative flex size-20 items-center justify-center rounded-full bg-primary text-white shadow-xl ring-4 ring-white/20 transition-transform duration-300 group-hover:scale-110">
                      <Play className="size-8 translate-x-0.5 fill-white" />
                    </span>
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* <div
            ref={badgeRef}
            className="absolute -bottom-6 left-6 flex items-center gap-3 rounded-2xl bg-card px-5 py-4 shadow-xl md:left-10"
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-white">
              <Play className="size-4 translate-x-0.5 fill-white" />
            </span>
            <div className="text-left leading-tight">
              <p className="font-semibold">Watch Video</p>
              <p className="text-xs text-muted-foreground">See our process</p>
            </div>
          </div> */}
        </div>
      </div>
    </section>
  );
}
