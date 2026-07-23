"use client";

import { useEffect, useRef, useState } from "react";
import { CircleCheck, Clock, Headphones, Music, Pause, Play } from "lucide-react";

import DrawIcon from "@/components/shadn/DrawIcon";
import { splitWords } from "@/components/shadn/split-words";
import { gsap, useGSAP, EASE, prefersReducedMotion } from "@/lib/gsap/config";
import { scrollReveal } from "@/lib/gsap/reveal";

const checklist = [
  { icon: Headphones, label: "New Episodes Weekly" },
  { icon: Clock, label: "Listen On-Demand, Anytime" },
  { icon: Music, label: "Free To Stream" },
  { icon: CircleCheck, label: "No Sign-Up Required" },
];

export interface AudioTrackRow {
  id: string;
  title: string;
  description: string | null;
  audio_url: string;
  cover_image_url: string | null;
  is_active: boolean;
  sort_order: number;
}

interface AudioSectionProps {
  tracks?: AudioTrackRow[];
}

// Cycles through the site's own --chart-1..5 tokens (navy/gold/teal/wine/slate)
// so each track gets a distinct, on-brand accent instead of one flat color.
const ACCENT_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export default function AudioSection({ tracks: trackRows }: AudioSectionProps) {
  const tracks = trackRows ?? [];
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const section = useRef<HTMLElement>(null);
  const eyebrowRef = useRef<HTMLSpanElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const paragraphRef = useRef<HTMLParagraphElement>(null);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);
  const barRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const checklistRefs = useRef<(HTMLDivElement | null)[]>([]);

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
        .from(paragraphRef.current, { y: 20, opacity: 0, duration: 0.5, ease: EASE.soft }, "-=0.4")
        .from(
          checklistRefs.current,
          { x: -20, rotation: -4, opacity: 0, duration: 0.4, stagger: 0.12, ease: EASE.soft },
          "-=0.25"
        );

      scrollReveal(rowRefs.current, {
        trigger: section.current,
        direction: "up",
        distance: 20,
        duration: 0.4,
        stagger: 0.06,
        start: "top 85%",
      });
    },
    { scope: section }
  );

  // "Now playing" equalizer — three bars bouncing out of phase, only while
  // something is actually playing. Skips entirely for reduced motion.
  useEffect(() => {
    if (prefersReducedMotion()) return;
    if (!playingId) return;

    const bars = barRefs.current.filter((el): el is HTMLSpanElement => el !== null);
    if (!bars.length) return;

    const tweens = bars.map((bar, i) =>
      gsap.to(bar, {
        scaleY: 0.35,
        duration: 0.35 + i * 0.08,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      })
    );

    return () => {
      tweens.forEach((tween) => tween.kill());
    };
  }, [playingId]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    function onTimeUpdate() {
      if (audio) setCurrentTime(audio.currentTime);
    }
    function onLoadedMetadata() {
      if (audio) setDuration(audio.duration);
    }
    function onEnded() {
      setPlayingId(null);
      setCurrentTime(0);
    }

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("ended", onEnded);
    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("ended", onEnded);
    };
  }, []);

  function togglePlay(track: AudioTrackRow) {
    const audio = audioRef.current;
    if (!audio) return;

    if (playingId === track.id) {
      audio.pause();
      setPlayingId(null);
      return;
    }

    audio.src = track.audio_url;
    audio.currentTime = 0;
    setCurrentTime(0);
    setDuration(0);
    audio.play();
    setPlayingId(track.id);
  }

  return (
    <section className="py-24" ref={section}>
      <div className="container mx-auto px-6">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          {/* Left — copy */}
          <div>
            <span
              ref={eyebrowRef}
              className="rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary"
            >
              Listen In
            </span>

            <h2 ref={titleRef} className="mt-6 text-4xl font-bold leading-tight lg:text-5xl">
              {splitWords("Sounds From Our Studio")}
            </h2>

            <p ref={paragraphRef} className="mt-6 leading-8 text-muted-foreground max-w-125">
              Podcast episodes, interviews, and audio stories worth a listen — press play and
              listen right here, no app required.
            </p>

            <div className="mt-8 space-y-4">
              {checklist.map((item, index) => (
                <div
                  key={item.label}
                  ref={(el) => {
                    checklistRefs.current[index] = el;
                  }}
                  className="flex items-center gap-3"
                >
                  <DrawIcon icon={item.icon} delay={index * 0.15} className="h-5 w-5 text-primary" />
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right — player */}
          {tracks.length === 0 ? (
            <p className="text-muted-foreground">
              Audio tracks will show up here once they&apos;re added.
            </p>
          ) : (
            <div className="space-y-3">
              {tracks.map((track, index) => {
              const color = ACCENT_COLORS[index % ACCENT_COLORS.length];
              const isActive = playingId === track.id;
              const progress = isActive && duration > 0 ? (currentTime / duration) * 100 : 0;

              return (
                <div
                  key={track.id}
                  ref={(el) => {
                    rowRefs.current[index] = el;
                  }}
                  className="flex items-center gap-4 rounded-xl border p-4 transition-colors duration-300"
                  style={
                    isActive
                      ? {
                          borderColor: `color-mix(in oklch, ${color} 40%, var(--border))`,
                          backgroundColor: `color-mix(in oklch, ${color} 6%, var(--card))`,
                        }
                      : undefined
                  }
                >
                  <div className="relative shrink-0">
                    {track.cover_image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={track.cover_image_url}
                        alt=""
                        className="size-12 rounded-lg object-cover"
                      />
                    ) : (
                      <div
                        className="flex size-12 items-center justify-center rounded-lg"
                        style={{ backgroundColor: `color-mix(in oklch, ${color} 15%, transparent)` }}
                      >
                        <Music className="size-5" style={{ color }} />
                      </div>
                    )}
                    <span
                      className="absolute -bottom-1 -right-1 flex size-5 items-center justify-center rounded-full bg-card text-[10px] font-bold shadow-sm"
                      style={{ color }}
                    >
                      {index + 1}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => togglePlay(track)}
                    aria-label={isActive ? "Pause" : "Play"}
                    className="flex size-11 shrink-0 items-center justify-center rounded-full text-white shadow-md transition-transform duration-200 hover:scale-105"
                    style={{ backgroundColor: color }}
                  >
                    {isActive ? (
                      <Pause className="size-4 fill-white" />
                    ) : (
                      <Play className="size-4 translate-x-0.5 fill-white" />
                    )}
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-3">
                      <h3 className="truncate font-semibold">{track.title}</h3>
                      <div className="flex shrink-0 items-center gap-2">
                        {isActive && (
                          <span className="flex h-3 items-end gap-0.5" aria-hidden="true">
                            {[0, 1, 2].map((i) => (
                              <span
                                key={i}
                                ref={(el) => {
                                  barRefs.current[i] = el;
                                }}
                                className="inline-block w-0.5 origin-bottom rounded-full"
                                style={{ height: "100%", backgroundColor: color }}
                              />
                            ))}
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {isActive ? `${formatTime(currentTime)} / ${formatTime(duration)}` : ""}
                        </span>
                      </div>
                    </div>
                    {track.description && (
                      <p className="truncate text-sm text-muted-foreground">{track.description}</p>
                    )}

                    <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full transition-[width] duration-150"
                        style={{ width: `${progress}%`, backgroundColor: color }}
                      />
                    </div>
                  </div>
                </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <audio ref={audioRef} className="hidden" />
    </section>
  );
}
