"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useGSAP } from "@/lib/gsap/config";
import { scrollReveal } from "@/lib/gsap/reveal";
import type { SiteSettings } from "@/types/site-settings";

function FacebookIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M22 12.06C22 6.51 17.52 2 12 2S2 6.51 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.51 1.49-3.9 3.77-3.9 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.44 2.91h-2.34v7.03C18.34 21.24 22 17.08 22 12.06Z" />
    </svg>
  );
}

function InstagramIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37Z" />
      <line x1="17.5" y1="6.5" x2="17.5" y2="6.5" />
    </svg>
  );
}

function XIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231ZM17.083 19.77h1.833L7.084 4.126H5.117Z" />
    </svg>
  );
}

function LinkedinIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286ZM5.337 7.433a2.062 2.062 0 1 1 0-4.124 2.062 2.062 0 0 1 0 4.124ZM7.114 20.452H3.558V9h3.556v11.452Z" />
    </svg>
  );
}

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
              <Social href={settings?.facebook_url || "#"}>
                <FacebookIcon className="size-4.5" />
              </Social>
              <Social href={settings?.instagram_url || "#"}>
                <InstagramIcon className="size-4.5" />
              </Social>
              <Social href={settings?.twitter_url || "#"}>
                <XIcon className="size-4" />
              </Social>
              <Social href={settings?.linkedin_url || "#"}>
                <LinkedinIcon className="size-4.5" />
              </Social>
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
