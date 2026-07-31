"use client";

import { useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { MailCheck, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { splitWords } from "@/components/shadn/split-words";
import { gsap, useGSAP, EASE } from "@/lib/gsap/config";
import { createClient } from "@/lib/supabase/client";
import { newsletterSchema, type NewsletterFormData } from "@/schemas/newsletter-schema";

interface NewsletterSectionProps {
  backgroundImageUrl?: string | null;
}

export default function NewsletterSection({ backgroundImageUrl }: NewsletterSectionProps) {
  const t = useTranslations("Newsletter");
  const bgImage =
    backgroundImageUrl || "https://images.unsplash.com/photo-1596526131083-e8c633c948d2?w=1600&q=80";
  const section = useRef<HTMLElement>(null);
  const eyebrowRef = useRef<HTMLSpanElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const paragraphRef = useRef<HTMLParagraphElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const [status, setStatus] = useState<"idle" | "success" | "duplicate" | "error">("idle");

  const form = useForm<NewsletterFormData>({
    resolver: zodResolver(newsletterSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(values: NewsletterFormData) {
    setStatus("idle");

    const supabase = createClient();
    const { error } = await supabase.from("newsletter_subscribers").insert({ email: values.email });

    if (error) {
      setStatus(error.code === "23505" ? "duplicate" : "error");
      return;
    }

    setStatus("success");
    form.reset();
  }

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
        .from(eyebrowRef.current, { y: 16, scale: 0.7, opacity: 0, duration: 0.6, ease: EASE.bounce })
        .from(
          titleRef.current?.querySelectorAll<HTMLElement>(".word-inner") ?? [],
          { y: 24, opacity: 0, duration: 0.5, stagger: 0.05, ease: EASE.out },
          "-=0.35"
        )
        .from(paragraphRef.current, { y: 20, opacity: 0, duration: 0.5, ease: EASE.soft }, "-=0.4")
        .from(formRef.current, { y: 20, opacity: 0, duration: 0.5, ease: EASE.soft }, "-=0.3");
    },
    { scope: section }
  );

  return (
    <section id="newsletter" className="relative isolate scroll-mt-28 mb-24 overflow-hidden py-24" ref={section}>
      <div
        className="absolute inset-0 -z-20 bg-cover bg-center bg-fixed"
        style={{ backgroundImage: `url(${bgImage})` }}
      />
      <div className="absolute inset-0 -z-10 bg-black/65" />

      <div className="container mx-auto md:px-6 px-4">
        <div className="mx-auto max-w-2xl text-center">
          <span
            ref={eyebrowRef}
            className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm"
          >
            {t("eyebrow")}
          </span>

          <h2 ref={titleRef} className="mt-6 text-4xl font-bold leading-tight text-white lg:text-5xl">
            {splitWords(t("title"))}
          </h2>

          <p ref={paragraphRef} className="mt-6 text-lg leading-8 text-white/80">
            {t("description")}
          </p>

          {status === "success" ? (
            <div className="mt-8 flex items-center justify-center gap-2 rounded-full bg-white/10 px-6 py-3 text-white backdrop-blur-sm">
              <MailCheck className="h-5 w-5" />
              <span className="font-medium">{t("success")}</span>
            </div>
          ) : (
            <form
              ref={formRef}
              onSubmit={form.handleSubmit(onSubmit)}
              className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row"
            >
              <div className="flex-1 text-left">
                <Input
                  type="email"
                  placeholder="you@example.com"
                  className="h-12 rounded-full border-white/15 bg-white/10 px-5 text-white placeholder:text-white/50 backdrop-blur-md"
                  {...form.register("email")}
                />
                {form.formState.errors.email && (
                  <p className="mt-1.5 pl-5 text-sm text-red-300">{form.formState.errors.email.message}</p>
                )}
              </div>
              <Button
                type="submit"
                className="h-12 shrink-0 rounded-full px-8"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? t("subscribing") : t("subscribe")}
                <Send className="h-4 w-4" />
              </Button>
            </form>
          )}

          {status === "duplicate" && (
            <p className="mt-4 text-sm text-white/70">{t("duplicate")}</p>
          )}
          {status === "error" && (
            <p className="mt-4 text-sm text-red-300">{t("error")}</p>
          )}
        </div>
      </div>
    </section>
  );
}
