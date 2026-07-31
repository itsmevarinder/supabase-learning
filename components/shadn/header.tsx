"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { ArrowRight, Code2, Languages, LogIn, Megaphone, Menu, Palette, Smartphone, X } from "lucide-react";

import { setLocale } from "@/app/actions/set-locale";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { LOCALES, type AppLocale } from "@/lib/locales";

const LOCALE_LABELS: Record<AppLocale, string> = {
  en: "English",
  hi: "हिन्दी",
  pa: "ਪੰਜਾਬੀ",
};

const LOCALE_SHORT: Record<AppLocale, string> = {
  en: "EN",
  hi: "हिं",
  pa: "ਪੰ",
};

const SERVICE_LINKS = [
  { href: "#services", key: "webDev", icon: Code2 },
  { href: "#services", key: "mobileApps", icon: Smartphone },
  { href: "#services", key: "uiUx", icon: Palette },
  { href: "#services", key: "marketing", icon: Megaphone },
] as const;

const NAV_LINKS = [
  { href: "#about", key: "about" },
  { href: "#portfolio", key: "portfolio" },
  { href: "#donate", key: "donate" },
  { href: "#contact", key: "contact" },
] as const;

interface HeaderProps {
  showLoginButton?: boolean;
}

function LanguageSwitcher({ variant = "pill" }: { variant?: "pill" | "full" | "icon" }) {
  const locale = useLocale() as AppLocale;
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleSelect(next: AppLocale) {
    startTransition(async () => {
      await setLocale(next);
      router.refresh();
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          variant === "icon" ? (
            <button
              type="button"
              disabled={isPending}
              aria-label={LOCALE_LABELS[locale]}
              className="flex size-9 items-center justify-center rounded-lg border transition-colors hover:bg-primary/10 hover:text-primary disabled:opacity-50"
            >
              <Languages className="size-4" />
            </button>
          ) : (
            <Button
              variant="ghost"
              disabled={isPending}
              className={variant === "full" ? "w-full justify-center rounded-full" : "rounded-full"}
            >
              <Languages className="size-4" />
              {variant === "full" ? LOCALE_LABELS[locale] : LOCALE_SHORT[locale]}
            </Button>
          )
        }
      />
      <DropdownMenuContent align="end">
        {LOCALES.map((code) => (
          <DropdownMenuItem
            key={code}
            className={code === locale ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground" : ""}
            onClick={() => handleSelect(code)}
          >
            {LOCALE_LABELS[code]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function Header({ showLoginButton = true }: HeaderProps) {
  const t = useTranslations("Header");
  const [isOpen, setIsOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const headerRef = useRef<HTMLElement>(null);
  const pillRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  const navLinkRefs = useRef(new Map<string, HTMLAnchorElement>());
  const drawerLinkRefs = useRef(new Map<string, HTMLAnchorElement>());
  
  useEffect(() => {
    const sectionIds = NAV_LINKS.map((link) => link.href.slice(1));
    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "-100px 0px -70% 0px", threshold: 0 }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  useGSAP(
    () => {
      if (!activeId || prefersReducedMotion()) return;

      [navLinkRefs.current.get(activeId), drawerLinkRefs.current.get(activeId)]
        .filter((el): el is HTMLAnchorElement => Boolean(el))
        .forEach((el) => {
          gsap.fromTo(
            el,
            { scale: 0.92 },
            { scale: 1, duration: 0.4, ease: "back.out(2.5)", overwrite: true }
          );
        });
    },
    { dependencies: [activeId], scope: headerRef }
  );

  useGSAP(() => {
    if (prefersReducedMotion()) return;

    const pill = pillRef.current;
    if (!pill) return;

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

    ScrollTrigger.create({
      start: 80,
      onEnter: () => {
        gsap.to(pill, {
          scale: 0.96,
          boxShadow: "0 15px 35px -10px rgba(0,0,0,0.3)",
          duration: 0.4,
          ease: "power2.out",
        });
        gsap.to(headerRef.current, { top: 0, duration: 0.3, ease: "power2.out" });
      },
      onLeaveBack: () => {
        gsap.to(pill, {
          scale: 1,
          boxShadow: "0 10px 25px -8px rgba(0,0,0,0.1)",
          duration: 0.4,
          ease: "power2.out",
        });
        gsap.to(headerRef.current, { top: "1.25rem", duration: 0.3, ease: "power2.out" });
      },
    });
  }, { scope: headerRef });

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

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
      <header ref={headerRef} className="fixed inset-x-0 top-5 z-50">
        <div className="container mx-auto md:px-6 px-4">
          <div
            ref={pillRef}
            className="flex h-17 items-center justify-between rounded-full border bg-card/80 md:px-6 px-4 shadow-xl backdrop-blur-xl"
          >
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 text-2xl font-bold tracking-tight">
              <Image src="/logo.png" alt="" width={48} height={48} priority className="w-12 animate-spin-linear" />
            </Link>

            {/* Navigation */}
            <div className="hidden xl:block">
              <NavigationMenu>
                <NavigationMenuList className="gap-1">
                  <NavigationMenuItem>
                    <NavigationMenuTrigger className="rounded-full font-medium text-foreground/80 data-[state=open]:bg-primary/10 data-[state=open]:text-primary">
                      {t("services")}
                    </NavigationMenuTrigger>

                    <NavigationMenuContent>
                      <div className="grid w-full grid-cols-1 gap-2">
                        {SERVICE_LINKS.map((service) => (
                          <NavigationMenuLink
                            key={service.key}
                            render={
                              <a
                                href={service.href}
                                className="group flex items-start gap-3 rounded-2xl px-3 py-2 transition-colors hover:bg-primary/5"
                              >
                                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                                  <service.icon className="size-3.5" />
                                </span>
                                <span>
                                  <h4 className="font-semibold">{t(`serviceLinks.${service.key}.title`)}</h4>
                                  <p className="mt-0.5 text-sm text-muted-foreground">{t(`serviceLinks.${service.key}.description`)}</p>
                                </span>
                              </a>
                            }
                          />
                        ))}
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuItem>

                  {NAV_LINKS.map((link) => {
                    const id = link.href.slice(1);
                    const isActive = activeId === id;
                    return (
                      <NavigationMenuItem key={link.href}>
                        <NavigationMenuLink className="rounded-full"
                          render={
                            <a
                              ref={(el) => {
                                if (el) navLinkRefs.current.set(id, el);
                                else navLinkRefs.current.delete(id);
                              }}
                              href={link.href}
                              aria-current={isActive ? "true" : undefined}
                              className={`rounded-full px-4 py-2 font-medium transition-colors hover:bg-primary/10 hover:text-primary ${
                                isActive ? "bg-primary/10 text-primary" : "text-foreground/80"
                              }`}
                            >
                              {t(`nav.${link.key}`)}
                            </a>
                          }
                        />
                      </NavigationMenuItem>
                    );
                  })}
                </NavigationMenuList>
              </NavigationMenu>
            </div>

            {/* Right Side */}
            <div className="hidden items-center gap-3 xl:flex">
              <LanguageSwitcher />

              {showLoginButton && (
                <Link href="/login">
                  <Button variant="ghost" className="hover:px-6 py-5">{t("login")}</Button>
                </Link>
              )}

              <a href="#contact">
                <Button className="rounded-full px-6 py-5">{t("getStarted")}</Button>
              </a>
            </div>

            {/* Mobile: language switcher, login, get started, menu toggle — all live outside the drawer */}
            <div className="flex items-center gap-1.5 xl:hidden">
              <LanguageSwitcher variant="icon" />

              {showLoginButton && (
                <Link
                  href="/login"
                  aria-label={t("login")}
                  className="flex size-9 items-center justify-center rounded-lg border transition-colors hover:bg-primary/10 hover:text-primary"
                >
                  <LogIn className="size-4" />
                </Link>
              )}

              <a href="#contact">
                <Button size="sm" className="h-9 gap-1 rounded-full px-3 text-xs">
                  {t("getStarted")}
                  <ArrowRight className="size-3" />
                </Button>
              </a>

              <button
                type="button"
                onClick={() => setIsOpen(true)}
                aria-label={t("openMenu")}
                aria-expanded={isOpen}
                className="flex size-9 items-center justify-center rounded-lg border transition-colors hover:bg-primary/10 hover:text-primary"
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>
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
            className={`absolute inset-y-0 right-0 flex w-full flex-col overflow-y-auto border bg-card/95 p-6 shadow-2xl backdrop-blur-xl transition-all duration-300 ease-in-out ${isOpen ? "translate-x-0 opacity-100" : "translate-x-6 opacity-0"
              }`}
          >
            <div className="mb-6 flex items-center justify-between">
              <Link href="/" onClick={closeDrawer} className="text-2xl font-bold tracking-tight">
                <Image src="/logo.png" alt="" width={48} height={48} className="w-12 animate-spin-linear" />
              </Link>
              <button
                type="button"
                onClick={closeDrawer}
                aria-label={t("closeMenu")}
                className="rounded-full border p-2 transition-colors hover:bg-primary/10 hover:text-primary"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex flex-1 flex-col gap-1">
              <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {t("services")}
              </p>
              {SERVICE_LINKS.map((service, index) => (
                <a
                  key={service.key}
                  href={service.href}
                  onClick={closeDrawer}
                  className="group flex items-center gap-3 rounded-2xl px-3 py-3 transition-colors hover:bg-primary/5"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                    <DrawIcon icon={service.icon} delay={index * 0.15} className="h-5 w-5" />
                  </span>
                  <span>
                    <span className="block font-medium">{t(`serviceLinks.${service.key}.title`)}</span>
                    <span className="block text-xs text-muted-foreground">{t(`serviceLinks.${service.key}.description`)}</span>
                  </span>
                </a>
              ))}

              <div className="my-4 border-t" />

              {NAV_LINKS.map((link) => {
                const id = link.href.slice(1);
                const isActive = activeId === id;
                return (
                  <a
                    key={link.href}
                    ref={(el) => {
                      if (el) drawerLinkRefs.current.set(id, el);
                      else drawerLinkRefs.current.delete(id);
                    }}
                    href={link.href}
                    onClick={closeDrawer}
                    aria-current={isActive ? "true" : undefined}
                    className={`rounded-2xl px-3 py-3 font-medium transition-colors hover:bg-primary/10 hover:text-primary ${
                      isActive ? "bg-primary/10 text-primary" : ""
                    }`}
                  >
                    {t(`nav.${link.key}`)}
                  </a>
                );
              })}
            </nav>
          </div>
        </div>
      </header>
    </>
  );
}
