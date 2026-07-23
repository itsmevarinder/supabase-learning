"use client";

import { useRef, useState } from "react";
import { HeartHandshake } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { splitWords } from "@/components/shadn/split-words";
import { gsap, useGSAP, EASE, prefersReducedMotion } from "@/lib/gsap/config";

// Singleton row from the `donate_section` Supabase table — one row (id=1),
// edited via the admin panel, mirroring about_section/video_section.
export interface DonateSectionRow {
  id: number;
  background_image_url: string | null;
  title: string;
  subtitle: string;
  description: string | null;
  button_text: string;
  phone_number: string | null;
}

interface DonateSectionProps {
  donate?: DonateSectionRow | null;
  // Pre-rendered (server-side) data-URI PNG of the UPI QR code for
  // donate.phone_number — generated once in the page Server Component so the
  // `qrcode` library never has to ship to the client bundle.
  qrCodeDataUrl?: string | null;
}

export default function DonateSection({ donate, qrCodeDataUrl }: DonateSectionProps) {
  const backgroundImageUrl =
    donate?.background_image_url ||
    "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=1600&q=80";
  const title = donate?.title ?? "Support Our Mission";
  const subtitle = donate?.subtitle ?? "Give Back Today";
  const description =
    donate?.description ??
    "Your generosity helps us keep building things that matter — every contribution, big or small, makes a real difference.";
  const buttonText = donate?.button_text || "Donate Now";

  const [qrOpen, setQrOpen] = useState(false);

  const section = useRef<HTMLElement>(null);
  const subtitleRef = useRef<HTMLSpanElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap
        .timeline({
          scrollTrigger: {
            trigger: section.current,
            start: "top 80%",
            toggleActions: "restart reverse restart reverse",
          },
        })
        .from(subtitleRef.current, { y: 16, scale: 0.7, opacity: 0, duration: 0.6, ease: EASE.bounce })
        .from(
          titleRef.current?.querySelectorAll<HTMLElement>(".word-inner") ?? [],
          { y: 28, opacity: 0, duration: 0.55, stagger: 0.05, ease: EASE.out },
          "-=0.35"
        )
        .from(descRef.current, { y: 20, opacity: 0, duration: 0.5, ease: EASE.soft }, "-=0.4");

      // Independent trigger tied to the button's own position, rather than
      // chained onto the section-level timeline above — guarantees it reveals
      // even if that shared trigger never fires for this element.
      gsap.from(buttonRef.current, {
        y: 16,
        opacity: 0,
        duration: 0.5,
        ease: EASE.bounce,
        scrollTrigger: {
          trigger: buttonRef.current,
          start: "top 95%",
          toggleActions: "restart reverse restart reverse",
        },
      });

      if (prefersReducedMotion()) return;


      gsap.to(bgRef.current, { scale: 1.12, duration: 12, ease: "linear", yoyo: true, repeat: -1 });
    },
    { scope: section }
  );

  return (
    <section id="donate" className="scroll-mt-28" ref={section}>
      <div className="relative isolate overflow-hidden py-32">
        <div ref={bgRef} className="absolute inset-0 -z-20 scale-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={backgroundImageUrl} alt="" className="h-full w-full object-cover" />
        </div>
        <div className="absolute inset-0 -z-10 bg-black/65" />

        <div className="container relative mx-auto px-6 text-center text-white">
          <span
            ref={subtitleRef}
            className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold backdrop-blur-sm"
          >
            {subtitle}
          </span>

          <h2 ref={titleRef} className="mx-auto mt-6 max-w-2xl text-4xl font-bold lg:text-5xl">
            {splitWords(title)}
          </h2>

          <p ref={descRef} className="mx-auto mt-6 max-w-xl leading-8 text-white/80">
            {description}
          </p>

          <Button
            ref={buttonRef}
            size="lg"
            onClick={() => setQrOpen(true)}
            className="mt-10 rounded-full bg-white px-10 py-6 text-base text-black hover:bg-white/90"
          >
            <HeartHandshake className="h-5 w-5" />
            {buttonText}
          </Button>
        </div>
      </div>

      <Dialog open={qrOpen} onOpenChange={setQrOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Scan to Donate</DialogTitle>
            <DialogDescription>
              Scan this QR code with any UPI app to complete your donation.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center gap-4 py-4">
            {qrCodeDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={qrCodeDataUrl} alt="Donation QR code" className="h-56 w-56 rounded-xl border" />
            ) : (
              <p className="text-sm text-muted-foreground">
                QR code isn&apos;t set up yet — add a phone number in the admin Donate section.
              </p>
            )}

            <DialogClose render={<Button variant="outline">Close</Button>} />
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
