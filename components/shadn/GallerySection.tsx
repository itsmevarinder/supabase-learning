"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Maximize2, Play, X } from "lucide-react";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { splitWords } from "@/components/shadn/split-words";
import { gsap, useGSAP, EASE } from "@/lib/gsap/config";
import { scrollReveal } from "@/lib/gsap/reveal";
import { getYouTubeEmbedUrl, getYouTubeId, getYouTubeThumbnail } from "@/lib/youtube";

export interface GalleryItemRow {
  id: string;
  media_type: "image" | "video";
  image_url: string | null;
  video_url: string | null;
  title: string | null;
  is_active: boolean;
  sort_order: number;
}

interface GalleryItem {
  id: string;
  type: "image" | "video";
  thumbnail: string | null;
  embedUrl: string | null;
  videoFileUrl: string | null;
  fullImage: string | null;
  title: string | null;
}

const PLACEHOLDER_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

function mapGalleryRow(row: GalleryItemRow): GalleryItem | null {
  if (row.media_type === "video") {
    if (!row.video_url) return null;

    if (getYouTubeId(row.video_url)) {
      const thumbnail = getYouTubeThumbnail(row.video_url);
      const embedUrl = getYouTubeEmbedUrl(row.video_url, { mute: true, loop: true });
      if (!thumbnail || !embedUrl) return null;
      return { id: row.id, type: "video", thumbnail, embedUrl, videoFileUrl: null, fullImage: null, title: row.title };
    }

    return {
      id: row.id,
      type: "video",
      thumbnail: null,
      embedUrl: null,
      videoFileUrl: row.video_url,
      fullImage: null,
      title: row.title,
    };
  }

  if (!row.image_url) return null;
  return {
    id: row.id,
    type: "image",
    thumbnail: row.image_url,
    embedUrl: null,
    videoFileUrl: null,
    fullImage: row.image_url,
    title: row.title,
  };
}

// Uploaded video tiles autoplay muted as a live preview, but every one
// decoding at once is expensive — especially on mobile Safari, which has real
// limits on concurrent video decode. Only the tile actually on-screen plays;
// the rest stay paused until scrolled into view.
function GalleryVideoTile({ src, className }: { src: string; className?: string }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { threshold: 0.25 }
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  return <video ref={videoRef} src={src} loop muted playsInline className={className} />;
}

interface GallerySectionProps {
  items?: GalleryItemRow[];
}

export default function GallerySection({ items: itemRows }: GallerySectionProps) {
  const items = (itemRows ?? []).map(mapGalleryRow).filter((item): item is GalleryItem => item !== null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const section = useRef<HTMLElement>(null);
  const eyebrowRef = useRef<HTMLSpanElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const paragraphRef = useRef<HTMLParagraphElement>(null);
  const tileRefs = useRef<(HTMLButtonElement | null)[]>([]);

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

      // Each tile watches its OWN scroll position (not one shared trigger for
      // the whole, possibly multi-row section) — matches every other grid in
      // this codebase (Portfolio, Pricing, Events). A single tall shared
      // trigger governing a stagger across spatially-separated tiles is what
      // caused tiles to get stuck reversed/hidden even while on-screen.
      tileRefs.current.forEach((tile, i) => {
        scrollReveal(tile, {
          trigger: tile,
          direction: "up",
          distance: 30,
          duration: 0.5,
          delay: (i % 4) * 0.06,
          start: "top 92%",
        });
      });
    },
    { scope: section }
  );

  const activeItem = activeIndex !== null ? items[activeIndex] : null;

  function showPrev() {
    if (activeIndex === null) return;
    setActiveIndex((activeIndex - 1 + items.length) % items.length);
  }

  function showNext() {
    if (activeIndex === null) return;
    setActiveIndex((activeIndex + 1) % items.length);
  }

  return (
    <section className="relative pb-24 pt-8" ref={section}>
      <div className="pointer-events-none absolute -left-24 top-0 -z-10 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-1/3 -z-10 h-80 w-80 rounded-full bg-amber-600/10 blur-3xl" />

      <div className="container mx-auto px-6">
        <div className="mx-auto w-full text-center">
          <span
            ref={eyebrowRef}
            className="rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary"
          >
            Our Gallery
          </span>

          <h2 ref={titleRef} className="mt-6 text-4xl font-bold leading-tight lg:text-5xl">
            {splitWords("Moments Worth Sharing")}
          </h2>

          <p ref={paragraphRef} className="mt-6 leading-8 text-muted-foreground">
            A look behind the scenes — photos and videos from our work, our team, and our events.
          </p>
        </div>

        {items.length === 0 ? (
          <p className="mt-14 text-center text-muted-foreground">
            Gallery items will show up here once they&apos;re added.
          </p>
        ) : (
          <div className="mx-auto mt-16 grid container grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {items.map((item, index) => {
              const color = PLACEHOLDER_COLORS[index % PLACEHOLDER_COLORS.length];
              return (
              <button
                key={item.id}
                type="button"
                ref={(el) => {
                  tileRefs.current[index] = el;
                }}
                onClick={() => setActiveIndex(index)}
                aria-label={item.type === "video" ? "Play video" : "View image"}
                className="group relative aspect-square overflow-hidden rounded-xl bg-muted shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                {item.thumbnail ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.thumbnail}
                    alt={item.title ?? ""}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : item.videoFileUrl ? (
                  // Uploaded video, no auto-derivable thumbnail — preview it inline instead.
                  <GalleryVideoTile
                    src={item.videoFileUrl}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div
                    className="flex h-full w-full items-center justify-center"
                    style={{ backgroundColor: `color-mix(in oklch, ${color} 15%, transparent)` }}
                  >
                    <Play className="size-8" style={{ color }} />
                  </div>
                )}

                <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-300 group-hover:bg-black/40">
                  {item.type === "video" ? (
                    <span className="flex size-11 scale-90 items-center justify-center rounded-full bg-primary text-white opacity-0 shadow-lg transition-all duration-300 group-hover:scale-100 group-hover:opacity-100">
                      <Play className="size-4.5 translate-x-0.5 fill-white" />
                    </span>
                  ) : (
                    <Maximize2 className="size-6 scale-90 text-white opacity-0 transition-all duration-300 group-hover:scale-100 group-hover:opacity-100" />
                  )}
                </div>

                {item.title && (
                  <span className="absolute inset-x-0 bottom-0 translate-y-full bg-linear-to-t from-black/70 to-transparent p-3 text-left text-xs font-medium text-white transition-transform duration-300 group-hover:translate-y-0">
                    {item.title}
                  </span>
                )}
              </button>
              );
            })}
          </div>
        )}
      </div>

      <Dialog open={activeIndex !== null} onOpenChange={(open) => !open && setActiveIndex(null)}>
        <DialogContent className="max-w-4xl border-none bg-transparent p-0 shadow-none" showClose={false}>
          {activeItem && (
            <div className="relative">
              <DialogTitle className="sr-only">{activeItem.title ?? "Gallery item"}</DialogTitle>

              <div className="overflow-hidden rounded-2xl bg-black shadow-2xl">
                {activeItem.type === "video" ? (
                  <div className="aspect-video w-full">
                    {activeItem.embedUrl ? (
                      <iframe
                        src={activeItem.embedUrl}
                        title={activeItem.title ?? "Video"}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="h-full w-full"
                      />
                    ) : (
                      <video
                        src={activeItem.videoFileUrl ?? undefined}
                        controls
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="h-full w-full"
                      />
                    )}
                  </div>
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={activeItem.fullImage ?? undefined}
                    alt={activeItem.title ?? ""}
                    className="max-h-[80vh] w-full object-contain"
                  />
                )}
              </div>

              {activeItem.title && (
                <p className="mt-3 text-center text-sm text-white/80">{activeItem.title}</p>
              )}

              <button
                type="button"
                onClick={() => setActiveIndex(null)}
                aria-label="Close"
                className="absolute -right-3 -top-3 flex size-9 items-center justify-center rounded-full bg-white text-foreground shadow-lg transition-transform hover:scale-105"
              >
                <X className="size-4" />
              </button>

              {items.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={showPrev}
                    aria-label="Previous"
                    className="absolute left-2 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-foreground shadow-lg transition-transform hover:scale-105"
                  >
                    <ChevronLeft className="size-5" />
                  </button>
                  <button
                    type="button"
                    onClick={showNext}
                    aria-label="Next"
                    className="absolute right-2 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-foreground shadow-lg transition-transform hover:scale-105"
                  >
                    <ChevronRight className="size-5" />
                  </button>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
