"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useGSAP } from "@/lib/gsap/config";
import { scrollReveal } from "@/lib/gsap/reveal";
import type { SiteSettings } from "@/types/site-settings";

function Social({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      target={href === "#" ? undefined : "_blank"}
      rel={href === "#" ? undefined : "noopener noreferrer"}
      className="flex h-11 w-11 items-center justify-center rounded-full border bg-background transition-all duration-300 hover:-translate-y-1 hover:border-primary hover:bg-primary hover:text-white"
    >
      {children}
    </Link>
  );
}

interface FooterProps {
  settings?: SiteSettings | null;
}

export default function Footer({ settings }: FooterProps) {
  const footer = useRef<HTMLElement>(null);
  const columnRefs = useRef<(HTMLDivElement | null)[]>([]);

  useGSAP(
    () => {
      // --- Per-block reveal, each watching its OWN scroll position. ---
      columnRefs.current.forEach((column, i) => {
        scrollReveal(column, { trigger: column, direction: "up", distance: 30, duration: 0.6, delay: i * 0.08, start: "top 95%" });
      });
    },
    { scope: footer }
  );

  return (
    <footer className="pb-5" ref={footer}>
      <div className="container mx-auto md:px-6 px-4">

        {/* Main Footer */}
        <div className="rounded-[32px] border bg-background px-10 pb-5 pt-8 shadow-sm">
          <div
            ref={(el) => {
              columnRefs.current[0] = el;
            }}
            className="mx-auto flex max-w-xl flex-col items-center text-center"
          >
            <Link href="/" className="text-3xl font-bold tracking-tight">
              <Image src="/logo.png" alt="" width={120} height={120} className="w-30 animate-spin-linear" />
            </Link>

            <p className="mt-5 leading-7 text-muted-foreground">
              We build modern digital experiences that help businesses
              grow through innovation, creativity, and technology.
            </p>

            <div className="mt-8 flex gap-3">
              <Social href={settings?.facebook_url || "#"}>F</Social>
              <Social href={settings?.instagram_url || "#"}>I</Social>
              <Social href={settings?.twitter_url || "#"}>X</Social>
              <Social href={settings?.linkedin_url || "#"}>in</Social>
            </div>
          </div>

          {/* Bottom */}
          <div
            ref={(el) => {
              columnRefs.current[1] = el;
            }}
            className="mt-8 border-t pt-5 text-center text-sm text-muted-foreground"
          >
            <p>© {new Date().getFullYear()} CMS. All rights reserved.
              <span className="ml-2 text-xs text-muted-foreground/70">
                (For development purposes only)
              </span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
