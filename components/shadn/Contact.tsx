"use client";

import { useRef, useState } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  contactSchema,
  ContactFormData,
} from "@/schemas/contact-schema";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { splitWords } from "@/components/shadn/split-words";
import DrawIcon from "@/components/shadn/DrawIcon";
import { gsap, useGSAP, EASE, prefersReducedMotion } from "@/lib/gsap/config";
import { scrollReveal } from "@/lib/gsap/reveal";
import { createClient } from "@/lib/supabase/client";
import type { SiteSettings } from "@/types/site-settings";

const processSteps = [
  {
    number: 1,
    title: "Reach Out",
    description: "Send us a message and let us know how we can pray for you or help you get connected.",
  },
  {
    number: 2,
    title: "We'll Connect With You",
    description:
      "Our pastoral team will personally follow up to welcome you and answer any questions.",
  },
  {
    number: 3,
    title: "Find Your Place Here",
    description:
      "We'll help you find a ministry, small group, or service time that fits your life.",
  },
];

interface ContactSectionProps {
  settings?: SiteSettings | null;
}

export default function ContactSection({ settings }: ContactSectionProps) {
  const backgroundImageUrl =
    settings?.contact_background_image_url ||
    "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1200&q=80";

  const contactInfo = [
    { icon: Phone, label: "Phone", value: settings?.contact_phone || "+1 (234) 567-8900" },
    { icon: Mail, label: "Email", value: settings?.contact_email || "hello@gracecommunity.church" },
    { icon: MapPin, label: "Office", value: settings?.office_address || "New York, United States" },
    { icon: Clock, label: "Service Times", value: settings?.working_hours || "Sundays 9:00 AM & 11:00 AM" },
  ];

  const section = useRef<HTMLElement>(null);
  const eyebrowRef = useRef<HTMLSpanElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const paragraphRef = useRef<HTMLParagraphElement>(null);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      fullName: "",
      email: "",
      company: "",
      phone: "",
      message: "",
    },
  });

  const [status, setStatus] = useState<"idle" | "sent" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const onSubmit = async (data: ContactFormData) => {
    setStatus("idle");
    setErrorMessage(null);

    const supabase = createClient();
    const { error } = await supabase.from("contact_submissions").insert({
      full_name: data.fullName,
      email: data.email,
      company: data.company || null,
      phone: data.phone,
      message: data.message,
    });

    if (error) {
      setStatus("error");
      setErrorMessage(error.message);
      return;
    }

    setStatus("sent");
    form.reset();
  };

  useGSAP(
    () => {
      // --- Heading entrance, replays every visit ---
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
        .from(paragraphRef.current, { y: 20, opacity: 0, duration: 0.5, ease: EASE.soft }, "-=0.4");

      // --- Per-step reveal for the process timeline, each step watching
      // its OWN scroll position. ---
      stepRefs.current.forEach((step, i) => {
        scrollReveal(step, { trigger: step, direction: "right", distance: 30, rotation: 3, duration: 0.6, delay: i * 0.1, start: "top 90%" });
      });

      if (prefersReducedMotion()) return;

      // --- Continuous ambient motion ---
      const blurCircles = section.current?.querySelectorAll<HTMLElement>(".contact-blur");
      if (blurCircles?.length) {
        gsap.to(blurCircles, {
          scale: 1.2,
          duration: 5,
          ease: "linear",
          yoyo: true,
          repeat: -1,
          stagger: { each: 1.2, from: "random" },
        });
      }

      const ctaGlow = section.current?.querySelector<HTMLElement>(".cta-glow");
      if (ctaGlow) {
        gsap.to(ctaGlow, { scale: 1.15, opacity: 0.45, duration: 1.5, ease: "linear", yoyo: true, repeat: -1 });
      }
    },
    { scope: section }
  );

  return (
    <section id="contact" className="scroll-mt-28 pb-24" ref={section}>
      <div className="container mx-auto md:px-6 px-4">
        <div className="rounded-[32px] border bg-background shadow-xl">
          <div className="grid lg:grid-cols-2 self-start items-start">
            {/* Left Side - Form */}
            <div className="p-8 lg:p-14 self-start lg:sticky lg:top-10">
              <span
                ref={eyebrowRef}
                className="rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary"
              >
                Contact Us
              </span>

              <h2 ref={titleRef} className="mt-6 text-4xl font-bold">
                {splitWords("We'd Love To Connect With You")}
              </h2>

              <p ref={paragraphRef} className="mt-4 leading-7 text-muted-foreground">
                Have questions, need prayer, or want to get involved? Fill out
                the form and someone from our church family will reach out
                within one business day.
              </p>

              <form onSubmit={form.handleSubmit(onSubmit)} className="mt-10 space-y-5">
                <div>
                  <Input placeholder="Full Name"  {...form.register("fullName")} />

                  {form.formState.errors.fullName && (
                    <p className="mt-1 text-sm text-red-500">
                      {form.formState.errors.fullName.message}
                    </p>
                  )}
                </div>

                <div>
                  <Input type="email" placeholder="Email Address" {...form.register("email")} />

                  <p className="text-sm text-red-500">
                    {form.formState.errors.email?.message}
                  </p>
                </div>

                <Input placeholder="Organization (optional)"  {...form.register("company")}/>

                <div>
                  <Input  placeholder="Phone Number"  {...form.register("phone")}  />

                  <p className="text-sm text-red-500">
                    {form.formState.errors.phone?.message}
                  </p>
                </div>

                <div>
                  <Textarea rows={6}  placeholder="Share your prayer request or message..."  {...form.register("message")} />

                  <p className="text-sm text-red-500">
                    {form.formState.errors.message?.message}
                  </p>
                </div>

                {status === "sent" && (
                  <p className="text-sm text-green-600">
                    Thank you! We&apos;ll be in touch within one business day.
                  </p>
                )}
                {status === "error" && errorMessage && (
                  <p className="text-sm text-red-500">{errorMessage}</p>
                )}

                <div className="relative">
                  <span className="cta-glow pointer-events-none absolute inset-x-6 top-1/2 -z-10 h-10 -translate-y-1/2 rounded-full bg-primary/30 opacity-25 blur-2xl" />
                  <Button type="submit" className="w-full rounded-full py-6" disabled={form.formState.isSubmitting} >
                    {form.formState.isSubmitting  ? "Sending..."  : "Send Message"}
                  </Button>
                </div>
              </form>
            </div>

            {/* Right Side */}
            <div className="relative isolate overflow-hidden rounded-b-[32px] p-8 text-white lg:rounded-bl-none lg:rounded-tr-[32px] lg:p-14">
              {/* Background image */}
              <div className="absolute inset-0 -z-20">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={backgroundImageUrl} alt="" className="h-full w-full object-cover" />
              </div>
              <div className="absolute inset-0 -z-10 bg-primary/60" />

              {/* Background Blur */}
              <div className="contact-blur absolute -right-20 top-0 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
              <div className="contact-blur absolute -bottom-24 -left-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />

              <div className="relative z-10">
                <span className="rounded-full bg-white/15 px-4 py-2 text-sm backdrop-blur">
                  We&apos;d Love To Meet You
                </span>

                <h2 className="mt-6 text-4xl font-bold leading-tight">
                  New Here?
                  <br />
                  We&apos;d Love To Welcome You.
                </h2>

                <p className="mt-6 leading-8 text-white/80">
                  Whether you&apos;re exploring faith for the first time or
                  looking for a church home, our community is here to walk
                  alongside you.
                </p>

                {/* Process */}
                <div className="mt-10 space-y-6">
                  {processSteps.map((step, index) => (
                    <div
                      key={step.number}
                      ref={(el) => {
                        stepRefs.current[index] = el;
                      }}
                      className="flex items-start gap-4"
                    >
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/15 font-bold backdrop-blur">
                        {step.number}
                      </div>

                      <div>
                        <h4 className="font-semibold">
                          {step.title}
                        </h4>

                        <p className="mt-1 text-white/70">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Contact Card */}
                <div className="mt-12 rounded-3xl bg-white/10 p-6 backdrop-blur-md">
                  <h3 className="text-xl font-semibold">
                    Contact Information
                  </h3>

                  <div className="mt-6 space-y-5">
                    {contactInfo.map((item, index) => {
                      return (
                        <div key={item.label} className="flex items-center gap-4">
                          <DrawIcon icon={item.icon} delay={index * 0.15} className="h-5 w-5" />

                          <div>
                            <p className="text-sm text-white/60">
                              {item.label}
                            </p>

                            <p className="font-medium">
                              {item.value}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
