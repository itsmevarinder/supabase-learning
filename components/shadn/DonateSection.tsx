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

      <Dialog open={qrOpen} onOpenChange={setQrOpen }>
        <DialogContent className="w-[calc(100%-30px)] max-w-4xl gap-0 overflow-hidden p-0">
  
          <DialogHeader className="sr-only">
            <DialogTitle>Scan to Donate</DialogTitle>
            <DialogDescription>
              Scan this QR code with any UPI app to complete your donation.
            </DialogDescription>
          </DialogHeader>

          <div className="grid md:grid-cols-2">
 
            <div className="relative isolate hidden overflow-hidden md:block">
              <div className="absolute inset-0 -z-20">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={backgroundImageUrl} alt="" className="h-full w-full object-cover" />
              </div>
              <div className="absolute inset-0 -z-10 bg-black/70" />

              <div className="flex h-full flex-col justify-between p-8 text-white">
                <span className="inline-flex w-fit items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold backdrop-blur-sm">
                  <HeartHandshake className="h-4 w-4" />
                  {subtitle}
                </span>

                <div>
                  <h3 className="text-2xl font-bold leading-tight">{title}</h3>
                  <p className="mt-3 text-sm leading-6 text-white/75">{description}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center gap-5 p-8 text-center sm:p-10">
              <div>
                <h3 className="text-2xl font-semibold">Scan to Donate</h3>
                <p className="mx-auto mt-2 max-w-56 text-sm text-muted-foreground">
                  Scan this QR code with any UPI app to complete your donation.
                </p>
              </div>

              {qrCodeDataUrl ? (
                <div className="relative h-70 w-70">

                  <span className="absolute left-0 top-0 h-8 w-8 rounded-tl-2xl border-l-4 border-t-4 border-primary" />
                  <span className="absolute right-0 top-0 h-8 w-8 rounded-tr-2xl border-r-4 border-t-4 border-primary" />
                  <span className="absolute bottom-0 left-0 h-8 w-8 rounded-bl-2xl border-b-4 border-l-4 border-primary" />
                  <span className="absolute bottom-0 right-0 h-8 w-8 rounded-br-2xl border-b-4 border-r-4 border-primary" />

                  <div className="absolute inset-3 overflow-hidden rounded-xl bg-white p-2 shadow-inner">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={qrCodeDataUrl} alt="Donation QR code" className="h-full w-full" />
                    <span className="qr-scan-line pointer-events-none absolute inset-x-2 h-0.5 rounded-full bg-primary/80 shadow-[0_0_10px_2px_var(--primary)]" />
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  QR code isn&apos;t set up yet — add a phone number in the admin Donate section.
                </p>
              )}

              <DialogClose render={<Button variant="default" className="w-full max-w-fit px-5 rounded-full">Close</Button>} />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
