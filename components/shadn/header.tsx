"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Code2, Megaphone, Menu, Palette, Smartphone, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import DrawIcon from "@/components/shadn/DrawIcon";
import { gsap, useGSAP, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap/config";

const SERVICE_LINKS = [
  { href: "#services", title: "Web Development", description: "Modern websites built with Next.js.", icon: Code2 },
  { href: "#services", title: "Mobile Apps", description: "Android & iOS applications.", icon: Smartphone },
  { href: "#services", title: "UI / UX Design", description: "Beautiful user experiences.", icon: Palette },
  { href: "#services", title: "Digital Marketing", description: "Grow your online business.", icon: Megaphone },
];

const NAV_LINKS = [
  { href: "#about", label: "About" },
  { href: "#portfolio", label: "Portfolio" },
  { href: "#pricing", label: "Pricing" },
  { href: "#contact", label: "Contact" },
];

interface HeaderProps {
  showLoginButton?: boolean;
}

export default function Header({ showLoginButton = true }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const pillRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (prefersReducedMotion()) return;

    const pill = pillRef.current;
    if (!pill) return;

    // --- Scroll-driven progress bar, tied 1:1 to how far down the page
    // you've scrolled (a true scrub, not a one-time reveal). ---
    if (progressRef.current) {
      gsap.to(progressRef.current, {
        scaleX: 1,
        ease: "none",
        scrollTrigger: {
          trigger: document.body,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
        },
      });
    }

    // --- Compact the pill and deepen its shadow once scrolled past the top ---
    ScrollTrigger.create({
      start: 80,
      onEnter: () =>
        gsap.to(pill, {
          scale: 0.96,
          boxShadow: "0 15px 35px -10px rgba(0,0,0,0.3)",
          duration: 0.3,
          ease: "power2.out",
        }),
      onLeaveBack: () =>
        gsap.to(pill, {
          scale: 1,
          boxShadow: "0 10px 25px -8px rgba(0,0,0,0.1)",
          duration: 0.3,
          ease: "power2.out",
        }),
    });
  }, { scope: headerRef });

  // Lock background scroll while the full-height mobile drawer is open.
  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  // Close on Escape for keyboard/accessibility support.
  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const closeDrawer = () => setIsOpen(false);

  return (
    <>
      {/* Scroll progress bar — scrubbed 1:1 to page scroll position */}
      {/* <div
        ref={progressRef}
        className="fixed inset-x-0 top-0 z-60 h-1 origin-left scale-x-0 bg-primary"
      /> */}

      <header ref={headerRef} className="fixed inset-x-0 top-5 z-50">
        <div className="container mx-auto px-6">
          <div
            ref={pillRef}
            className="flex h-16 items-center justify-between rounded-full border border-gray-200 bg-white/90 px-6 shadow-xl backdrop-blur-xl"
          >
            {/* Logo */}
            <Link href="/" className="text-2xl font-bold tracking-tight">
              <Image src="/logo.png" alt="" width={48} height={48} priority className="w-12 animate-spin-linear" />
            </Link>

            {/* Navigation */}
            <div className="hidden xl:block">
              <NavigationMenu>
                <NavigationMenuList className="gap-2">
                  <NavigationMenuItem>
                    <NavigationMenuTrigger className="rounded-full">
                      Services
                    </NavigationMenuTrigger>

                    <NavigationMenuContent>
                      <div className="grid w-full grid-cols-2 gap-3 p-5">
                        {SERVICE_LINKS.map((service) => (
                          <NavigationMenuLink
                            key={service.title}
                            render={
                              <a
                                href={service.href}
                                className="rounded-full flex-col items-start gap-2 p-4 transition hover:bg-muted"
                              >
                                <h4 className="font-semibold">{service.title}</h4>
                                <p className="mt-1 text-sm text-muted-foreground">{service.description}</p>
                              </a>
                            }
                          />
                        ))}
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuItem>

                  {NAV_LINKS.map((link) => (
                    <NavigationMenuItem key={link.href}>
                      <NavigationMenuLink className="rounded-full"
                        render={
                          <a href={link.href} className="rounded-full px-4 py-2 font-medium hover:bg-muted">
                            {link.label}
                          </a>
                        }
                      />
                    </NavigationMenuItem>
                  ))}
                </NavigationMenuList>
              </NavigationMenu>
            </div>

            {/* Right Side */}
            <div className="hidden items-center gap-3 xl:flex">
              {showLoginButton && (
                <Link href="/login">
                  <Button variant="ghost" className="hover:px-6 py-5">Login</Button>
                </Link>
              )}

              <a href="#contact">
                <Button className="rounded-full px-6 py-5">Get Started</Button>
              </a>
            </div>

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              aria-label="Open menu"
              aria-expanded={isOpen}
              className="rounded-lg border p-2 xl:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div
          className={`fixed inset-0 z-50 xl:hidden ${isOpen ? "pointer-events-auto" : "pointer-events-none"}`}
          aria-hidden={!isOpen}
        >
          {/* Backdrop — frosted, matching the pill nav's own glass treatment */}
          <div
            onClick={closeDrawer}
            className={`absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-300 ease-in-out ${isOpen ? "opacity-100" : "opacity-0"
              }`}
          />

          {/* Panel — floating rounded card (full height), not a flush-edge rectangle */}
          <div
            className={`absolute inset-y-0 right-0 flex w-full flex-col overflow-y-auto border border-gray-200 bg-white/95 p-6 shadow-2xl backdrop-blur-xl transition-all duration-300 ease-in-out ${isOpen ? "translate-x-0 opacity-100" : "translate-x-6 opacity-0"
              }`}
          >
            <div className="mb-6 flex items-center justify-between">
              <Link href="/" onClick={closeDrawer} className="text-2xl font-bold tracking-tight">
                <Image src="/logo.png" alt="" width={48} height={48} className="w-12 animate-spin-linear" />
              </Link>
              <button
                type="button"
                onClick={closeDrawer}
                aria-label="Close menu"
                className="rounded-full border border-gray-200 p-2 transition hover:bg-muted"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex flex-1 flex-col gap-1">
              <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Services
              </p>
              {SERVICE_LINKS.map((service, index) => (
                <a
                  key={service.title}
                  href={service.href}
                  onClick={closeDrawer}
                  className="group flex items-center gap-3 rounded-2xl px-3 py-3 transition hover:bg-muted"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-white">
                    <DrawIcon icon={service.icon} delay={index * 0.15} className="h-5 w-5" />
                  </span>
                  <span>
                    <span className="block font-medium">{service.title}</span>
                    <span className="block text-xs text-muted-foreground">{service.description}</span>
                  </span>
                </a>
              ))}

              <div className="my-4 border-t border-gray-100" />

              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={closeDrawer}
                  className="rounded-2xl px-3 py-3 font-medium transition hover:bg-muted"
                >
                  {link.label}
                </a>
              ))}
            </nav>

            <div className="mt-auto flex flex-col gap-3 border-t border-gray-100 pt-6">
              {showLoginButton && (
                <Link href="/login" onClick={closeDrawer}>
                  <Button variant="ghost" className="w-full rounded-full">
                    Login
                  </Button>
                </Link>
              )}
              <a href="#contact" onClick={closeDrawer}>
                <Button className="w-full rounded-full">Get Started</Button>
              </a>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
