"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import DrawIcon from "@/components/shadn/DrawIcon";
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
      // --- Per-column reveal, each column watching its OWN scroll position. ---
      columnRefs.current.forEach((column, i) => {
        scrollReveal(column, { trigger: column, direction: "up", distance: 30, duration: 0.6, delay: i * 0.08, start: "top 95%" });
      });
    },
    { scope: footer }
  );

  return (
    <footer className="pb-8" ref={footer}>
      <div className="container mx-auto px-6">

        {/* Main Footer */}
        <div className="rounded-[32px] border bg-background p-10 shadow-sm">
          <div className="grid gap-12 lg:grid-cols-4">

            {/* Logo */}
            <div
              ref={(el) => {
                columnRefs.current[0] = el;
              }}
            >
              <Link
                href="/"
                className="text-3xl font-bold tracking-tight"
              >
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

            {/* Company */}
            <div
              ref={(el) => {
                columnRefs.current[1] = el;
              }}
            >
              <h3 className="mb-5 text-lg font-semibold">
                Company
              </h3>

              <ul className="space-y-3 text-muted-foreground">
                <li>
                  <Link href="/about" className="hover:text-primary">
                    About Us
                  </Link>
                </li>

                <li>
                  <Link href="/services" className="hover:text-primary">
                    Services
                  </Link>
                </li>

                <li>
                  <Link href="/portfolio" className="hover:text-primary">
                    Portfolio
                  </Link>
                </li>

                <li>
                  <Link href="/pricing" className="hover:text-primary">
                    Pricing
                  </Link>
                </li>

                <li>
                  <Link href="/blog" className="hover:text-primary">
                    Blog
                  </Link>
                </li>
              </ul>
            </div>

            {/* Resources */}
            <div
              ref={(el) => {
                columnRefs.current[2] = el;
              }}
            >
              <h3 className="mb-5 text-lg font-semibold">
                Resources
              </h3>

              <ul className="space-y-3 text-muted-foreground">
                <li>
                  <Link href="/faq" className="hover:text-primary">
                    FAQs
                  </Link>
                </li>

                <li>
                  <Link href="/privacy" className="hover:text-primary">
                    Privacy Policy
                  </Link>
                </li>

                <li>
                  <Link href="/terms" className="hover:text-primary">
                    Terms & Conditions
                  </Link>
                </li>

                <li>
                  <Link href="/support" className="hover:text-primary">
                    Support
                  </Link>
                </li>

                <li>
                  <Link href="/contact" className="hover:text-primary">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div
              ref={(el) => {
                columnRefs.current[3] = el;
              }}
            >
              <h3 className="mb-5 text-lg font-semibold">
                Contact
              </h3>

              <div className="space-y-5 text-muted-foreground">
                <div className="flex gap-3">
                  <DrawIcon icon={MapPin} delay={0} className="mt-1 h-5 w-5 text-primary" />
                  <span>{settings?.office_address || "New York, United States"}</span>
                </div>

                <div className="flex items-center gap-3">
                  <DrawIcon icon={Phone} delay={0.15} className="h-5 w-5 text-primary" />
                  <span>{settings?.contact_phone || "+1 (234) 567-8900"}</span>
                </div>

                <div className="flex items-center gap-3">
                  <DrawIcon icon={Mail} delay={0.3} className="h-5 w-5 text-primary" />
                  <span>{settings?.contact_email || "hello@mylogo.com"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom */}
          <div className="mt-10 flex flex-col items-center justify-between gap-5 border-t pt-8 text-sm text-muted-foreground md:flex-row">
            <p>
              © {new Date().getFullYear()} MyLogo. All rights reserved.
              <span className="ml-2 text-xs text-muted-foreground/70">
                (For development purposes only)
              </span>
            </p>

            <div className="flex gap-6">
              <Link href="/privacy" className="hover:text-primary">
                Privacy
              </Link>

              <Link href="/terms" className="hover:text-primary">
                Terms
              </Link>

              <Link href="/cookies" className="hover:text-primary">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
