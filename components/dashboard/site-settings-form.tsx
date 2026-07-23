"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { siteSettingsSchema, type SiteSettingsFormData } from "@/schemas/site-settings-schema";
import type { SiteSettings } from "@/types/site-settings";

interface SiteSettingsFormProps {
  settings: SiteSettings | null;
}

export function SiteSettingsForm({ settings }: SiteSettingsFormProps) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const form = useForm<SiteSettingsFormData>({
    resolver: zodResolver(siteSettingsSchema),
    defaultValues: {
      contactPhone: settings?.contact_phone ?? "",
      contactEmail: settings?.contact_email ?? "",
      officeAddress: settings?.office_address ?? "",
      workingHours: settings?.working_hours ?? "",
      facebookUrl: settings?.facebook_url ?? "",
      instagramUrl: settings?.instagram_url ?? "",
      twitterUrl: settings?.twitter_url ?? "",
      linkedinUrl: settings?.linkedin_url ?? "",
    },
  });

  async function onSubmit(values: SiteSettingsFormData) {
    setStatus("idle");
    setErrorMessage(null);

    const supabase = createClient();
    const { error } = await supabase
      .from("site_settings")
      .update({
        contact_phone: values.contactPhone || null,
        contact_email: values.contactEmail || null,
        office_address: values.officeAddress || null,
        working_hours: values.workingHours || null,
        facebook_url: values.facebookUrl || null,
        instagram_url: values.instagramUrl || null,
        twitter_url: values.twitterUrl || null,
        linkedin_url: values.linkedinUrl || null,
      })
      .eq("id", 1);

    if (error) {
      setStatus("error");
      setErrorMessage(error.message);
      return;
    }

    setStatus("saved");
    router.refresh();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="contactPhone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact phone</FormLabel>
                <FormControl>
                  <Input placeholder="+1 (234) 567-8900" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="contactEmail"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact email</FormLabel>
                <FormControl>
                  <Input placeholder="hello@company.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="officeAddress"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Office address</FormLabel>
                <FormControl>
                  <Input placeholder="New York, United States" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="workingHours"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Working hours</FormLabel>
                <FormControl>
                  <Input placeholder="Mon - Fri • 9:00 AM - 6:00 PM" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="facebookUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Facebook URL</FormLabel>
                <FormControl>
                  <Input placeholder="https://facebook.com/…" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="instagramUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Instagram URL</FormLabel>
                <FormControl>
                  <Input placeholder="https://instagram.com/…" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="twitterUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>X / Twitter URL</FormLabel>
                <FormControl>
                  <Input placeholder="https://x.com/…" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="linkedinUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>LinkedIn URL</FormLabel>
                <FormControl>
                  <Input placeholder="https://linkedin.com/…" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {status === "saved" && <p className="text-sm text-green-600">Saved.</p>}
        {status === "error" && errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}

        <Button type="submit" className="w-fit rounded-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Saving…" : "Save changes"}
        </Button>
      </form>
    </Form>
  );
}
