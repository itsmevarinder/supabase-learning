"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight, CircleCheck, Clock, Headphones, Music, Pause, Play } from "lucide-react";

import DrawIcon from "@/components/shadn/DrawIcon";
import { splitWords } from "@/components/shadn/split-words";
import { gsap, useGSAP, EASE, prefersReducedMotion } from "@/lib/gsap/config";
import { scrollReveal } from "@/lib/gsap/reveal";

const checklist = [
  { icon: Headphones, key: "newEpisodes" },
  { icon: Clock, key: "onDemand" },
  { icon: Music, key: "free" },
  { icon: CircleCheck, key: "noSignUp" },
] as const;

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
  backgroundImageUrl?: string | null;
}

const ACCENT_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

const TRACKS_PER_PAGE = 4;

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export default function AudioSection({ tracks: trackRows, backgroundImageUrl }: AudioSectionProps) {
  const t = useTranslations("Audio");
  const tracks = trackRows ?? [];
  const bgImage =
    backgroundImageUrl || "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=1600&q=80";
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [page, setPage] = useState(0);

  const totalPages = Math.ceil(tracks.length / TRACKS_PER_PAGE);
  const pagedTracks = tracks.slice(page * TRACKS_PER_PAGE, page * TRACKS_PER_PAGE + TRACKS_PER_PAGE);

  function goToPage(next: number) {
    setPage(Math.min(Math.max(next, 0), totalPages - 1));
  }

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
    <section className="relative isolate scroll-mt-28 overflow-hidden py-24" ref={section}>
      <div
        className="absolute inset-0 -z-20 bg-cover bg-center bg-fixed"
        style={{ backgroundImage: `url(${bgImage})` }}
      />
      <div className="absolute inset-0 -z-10 bg-black/65" />

      <div className="container mx-auto md:px-6 px-4">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          {/* Left — copy */}
          <div>
            <span
              ref={eyebrowRef}
              className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm"
            >
              {t("eyebrow")}
            </span>

            <h2 ref={titleRef} className="mt-6 text-4xl font-bold leading-tight text-white lg:text-5xl">
              {splitWords(t("title"))}
            </h2>

            <p ref={paragraphRef} className="mt-6 leading-8 text-white/80 max-w-125">
              {t("description")}
            </p>

            <div className="mt-8 space-y-4">
              {checklist.map((item, index) => (
                <div
                  key={item.key}
                  ref={(el) => {
                    checklistRefs.current[index] = el;
                  }}
                  className="flex items-center gap-3 text-white"
                >
                  <DrawIcon icon={item.icon} delay={index * 0.15} className="h-5 w-5 text-white" />
                  <span>{t(`checklist.${item.key}`)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right — player */}
          {tracks.length === 0 ? (
            <p className="text-white/70">
              {t("empty")}
            </p>
          ) : (
            <div className="space-y-3">
              {pagedTracks.map((track, localIndex) => {
              const index = page * TRACKS_PER_PAGE + localIndex;
              const color = ACCENT_COLORS[index % ACCENT_COLORS.length];
              const isActive = playingId === track.id;
              const progress = isActive && duration > 0 ? (currentTime / duration) * 100 : 0;

              return (
                <div
                  key={track.id}
                  ref={(el) => {
                    rowRefs.current[index] = el;
                  }}
                  className="flex items-center gap-4 rounded-xl border border-white/15 bg-white/10 p-4 backdrop-blur-md transition-colors duration-300"
                  style={
                    isActive
                      ? {
                          borderColor: `color-mix(in oklch, ${color} 50%, white)`,
                          backgroundColor: `color-mix(in oklch, ${color} 18%, white 10%)`,
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
                        style={{ backgroundColor: `color-mix(in oklch, ${color} 25%, transparent)` }}
                      >
                        <Music className="size-5" style={{ color }} />
                      </div>
                    )}
                    <span
                      className="absolute -bottom-1 -right-1 flex size-5 items-center justify-center rounded-full bg-white text-[10px] font-bold shadow-sm"
                      style={{ color }}
                    >
                      {index + 1}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => togglePlay(track)}
                    aria-label={isActive ? t("pause") : t("play")}
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
                      <h3 className="truncate font-semibold text-white">{track.title}</h3>
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
                        <span className="text-xs text-white/70">
                          {isActive ? `${formatTime(currentTime)} / ${formatTime(duration)}` : ""}
                        </span>
                      </div>
                    </div>
                    {track.description && (
                      <p className="truncate text-sm text-white/70">{track.description}</p>
                    )}

                    <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/20">
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

          {totalPages > 1 && (
            <div className="mt-5 flex items-center justify-between">
              <button
                type="button"
                onClick={() => goToPage(page - 1)}
                disabled={page === 0}
                aria-label={t("previousTracks")}
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
                    aria-label={t("page", { number: i + 1 })}
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
                aria-label={t("nextTracks")}
                className="flex size-9 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white backdrop-blur-md transition-colors hover:bg-white/20 disabled:opacity-30 disabled:hover:bg-white/10"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      <audio ref={audioRef} className="hidden" />
    </section>
  );
}
