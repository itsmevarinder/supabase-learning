"use client";

import { useEffect, useRef, useState, type Ref } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight, Maximize2, Play, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { splitWords } from "@/components/shadn/split-words";
import { gsap, useGSAP, EASE, prefersReducedMotion } from "@/lib/gsap/config";
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

interface GalleryTileProps {
  item: GalleryItem;
  index: number;
  color: string;
  onOpen: () => void;
  ref?: Ref<HTMLButtonElement>;
}

function GalleryTile({ item, index, color, onOpen, ref }: GalleryTileProps) {
  const t = useTranslations("Gallery");
  const tileRef = useRef<HTMLButtonElement | null>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      scrollReveal(tileRef.current, {
        trigger: tileRef.current,
        direction: "up",
        distance: 36,
        scale: 0.88,
        rotation: index % 2 === 0 ? -3 : 3,
        duration: 0.6,
        delay: (index % 4) * 0.07,
        start: "top 92%",
      });

      if (item.type === "video") {
        gsap.to(ringRef.current, {
          scale: 1.7,
          opacity: 0,
          duration: 1.8,
          ease: "power1.out",
          repeat: -1,
        });
      }

      if (prefersReducedMotion()) return;

      const tile = tileRef.current;
      if (!tile) return;

      const rotateX = gsap.quickTo(tile, "rotateX", { duration: 0.5, ease: "power3.out" });
      const rotateY = gsap.quickTo(tile, "rotateY", { duration: 0.5, ease: "power3.out" });
      const mediaX = gsap.quickTo(mediaRef.current, "x", { duration: 0.6, ease: "power3.out" });
      const mediaY = gsap.quickTo(mediaRef.current, "y", { duration: 0.6, ease: "power3.out" });
      const glowOpacity = gsap.quickTo(glowRef.current, "opacity", { duration: 0.25 });

      function handleMove(event: MouseEvent) {
        const rect = tile!.getBoundingClientRect();
        const px = (event.clientX - rect.left) / rect.width;
        const py = (event.clientY - rect.top) / rect.height;
        rotateY((px - 0.5) * 18);
        rotateX(-(py - 0.5) * 18);
        mediaX(-(px - 0.5) * 20);
        mediaY(-(py - 0.5) * 20);
        glowRef.current?.style.setProperty("--x", `${px * 100}%`);
        glowRef.current?.style.setProperty("--y", `${py * 100}%`);
        glowOpacity(1);
      }

      function handleLeave() {
        rotateX(0);
        rotateY(0);
        mediaX(0);
        mediaY(0);
        glowOpacity(0);
      }

      tile.addEventListener("mousemove", handleMove);
      tile.addEventListener("mouseleave", handleLeave);
      return () => {
        tile.removeEventListener("mousemove", handleMove);
        tile.removeEventListener("mouseleave", handleLeave);
      };
    },
    { scope: tileRef, dependencies: [item.type, index] }
  );

  return (
    <div style={{ perspective: "800px" }}>
      <button
        ref={(el) => {
          tileRef.current = el;
          if (typeof ref === "function") ref(el);
          else if (ref) ref.current = el;
        }}
        type="button"
        onClick={onOpen}
        aria-label={item.type === "video" ? t("playVideo") : t("viewImage")}
        className="group relative w-full overflow-hidden rounded-2xl bg-muted shadow-sm transition-shadow duration-300 transform-3d will-change-transform hover:shadow-2xl"
      >
        <div ref={mediaRef} className="relative inset-0 scale-110">
          {item.thumbnail ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.thumbnail}
              alt={item.title ?? ""}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : item.videoFileUrl ? (
            <GalleryVideoTile
              src={item.videoFileUrl}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div
              className="flex h-full w-full items-center justify-center"
              style={{ backgroundColor: `color-mix(in oklch, ${color} 15%, transparent)` }}
            >
              <Play className="size-8" style={{ color }} />
            </div>
          )}
        </div>

        {/* Cursor-following spotlight glare */}
        <div
          ref={glowRef}
          className="pointer-events-none absolute inset-0 opacity-0"
          style={{
            background: "radial-gradient(circle at var(--x, 50%) var(--y, 50%), rgba(255,255,255,0.35), transparent 55%)",
          }}
        />

        <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-300 group-hover:bg-black/40">
          {item.type === "video" ? (
            <span className="relative flex size-11 items-center justify-center">
              <span ref={ringRef} className="absolute inset-0 rounded-full bg-primary/70" />
              <span className="relative flex size-11 scale-90 items-center justify-center rounded-full bg-primary text-white opacity-0 shadow-lg transition-all duration-300 group-hover:scale-100 group-hover:opacity-100">
                <Play className="size-4.5 translate-x-0.5 fill-white" />
              </span>
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
    </div>
  );
}

interface GallerySectionProps {
  items?: GalleryItemRow[];
  /** When set, shows a "View All Gallery" button below the grid linking here
   * — used on the homepage, which only shows a capped subset of items. */
  viewAllHref?: string;
}

export default function GallerySection({ items: itemRows, viewAllHref }: GallerySectionProps) {
  const t = useTranslations("Gallery");
  const items = (itemRows ?? []).map(mapGalleryRow).filter((item): item is GalleryItem => item !== null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const lightboxMediaRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (activeIndex === null || !lightboxMediaRef.current) return;

      if (prefersReducedMotion()) {
        gsap.set(lightboxMediaRef.current, { opacity: 1, scale: 1 });
        return;
      }

      gsap.fromTo(
        lightboxMediaRef.current,
        { opacity: 0, scale: 0.92 },
        { opacity: 1, scale: 1, duration: 0.45, ease: "power3.out" }
      );
    },
    { dependencies: [activeIndex] }
  );

  const section = useRef<HTMLElement>(null);
  const eyebrowRef = useRef<HTMLSpanElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const paragraphRef = useRef<HTMLParagraphElement>(null);

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

      if (prefersReducedMotion()) return;

      const blurCircles = section.current.querySelectorAll<HTMLElement>(".gallery-blur");
      if (blurCircles.length) {
        gsap.to(blurCircles, {
          scale: 1.2,
          duration: 6,
          ease: "linear",
          yoyo: true,
          repeat: -1,
          stagger: { each: 1.5, from: "random" },
        });
      }
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
    <section id="gallery" className="relative scroll-mt-28 pb-24 pt-8" ref={section}>
      <div className="gallery-blur pointer-events-none absolute -left-24 top-0 -z-10 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
      <div className="gallery-blur pointer-events-none absolute -right-24 bottom-1/3 -z-10 h-80 w-80 rounded-full bg-amber-600/10 blur-3xl" />

      <div className="container mx-auto md:px-6 px-4">
        <div className="mx-auto w-full text-center">
          <span
            ref={eyebrowRef}
            className="rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary"
          >
            {t("eyebrow")}
          </span>

          <h2 ref={titleRef} className="mt-6 text-4xl font-bold leading-tight lg:text-5xl">
            {splitWords(t("title"))}
          </h2>

          <p ref={paragraphRef} className="mt-6 leading-8 text-muted-foreground">
            {t("description")}
          </p>
        </div>

        {items.length === 0 ? (
          <p className="mt-14 text-center text-muted-foreground">
            {t("empty")}
          </p>
        ) : (
          <div className="mx-auto mt-16 columns-1 sm:columns-2 space-y-2.5 lg:columns-3 xl:columns-4">
            {items.map((item, index) => (
              <GalleryTile
                key={item.id}
                item={item}
                index={index}
                color={PLACEHOLDER_COLORS[index % PLACEHOLDER_COLORS.length]}
                onOpen={() => setActiveIndex(index)}
              />
            ))}
          </div>
        )}

        {viewAllHref && (
          <div className="mt-12 text-center">
            <Link href={viewAllHref}>
              <Button className="rounded-full px-8 py-5">{t("viewAll")}</Button>
            </Link>
          </div>
        )}
      </div>

      <Dialog open={activeIndex !== null} onOpenChange={(open) => !open && setActiveIndex(null)}>
        <DialogContent
          className="top-0 left-0 h-screen w-screen max-w-none translate-x-0 translate-y-0 rounded-none border-none bg-black/95 p-0 shadow-none"
          showClose={false}
        >
          {activeItem && (
            <div className="relative flex h-full w-full min-h-0 min-w-0 items-center justify-center p-4 sm:p-16">
              <DialogTitle className="sr-only">{activeItem.title ?? t("galleryItem")}</DialogTitle>

              {/* Counter */}
              {items.length > 1 && activeIndex !== null && (
                <span className="fixed left-4 top-4 z-10 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-sm font-medium text-white backdrop-blur-md">
                  {activeIndex + 1} / {items.length}
                </span>
              )}

              <div ref={lightboxMediaRef} className="flex h-full w-full items-center justify-center">
                {activeItem.type === "video" ? (
                  <div className="aspect-video max-h-[calc(100vh-2rem)] w-full max-w-6xl overflow-hidden rounded-2xl bg-black shadow-2xl ring-1 ring-white/10 sm:max-h-[calc(100vh-8rem)]">
                    {activeItem.embedUrl ? (
                      <iframe
                        src={activeItem.embedUrl}
                        title={activeItem.title ?? t("video")}
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
                    className="max-h-[calc(100vh-2rem)] max-w-[calc(100vw-2rem)] rounded-2xl object-contain shadow-2xl ring-1 ring-white/10 sm:max-h-[calc(100vh-8rem)] sm:max-w-[calc(100vw-8rem)]"
                  />
                )}
              </div>

              {activeItem.title && (
                <span className="fixed bottom-6 left-1/2 -translate-x-1/2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-white backdrop-blur-md">
                  {activeItem.title}
                </span>
              )}

              <button
                type="button"
                onClick={() => setActiveIndex(null)}
                aria-label={t("close")}
                className="fixed right-4 top-4 z-10 flex size-11 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white backdrop-blur-md transition-colors hover:bg-white/20"
              >
                <X className="size-5" />
              </button>

              {items.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={showPrev}
                    aria-label={t("previous")}
                    className="fixed left-4 top-1/2 z-10 flex size-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white backdrop-blur-md transition-colors hover:bg-white/20"
                  >
                    <ChevronLeft className="size-6" />
                  </button>
                  <button
                    type="button"
                    onClick={showNext}
                    aria-label={t("next")}
                    className="fixed right-4 top-1/2 z-10 flex size-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white backdrop-blur-md transition-colors hover:bg-white/20"
                  >
                    <ChevronRight className="size-6" />
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
