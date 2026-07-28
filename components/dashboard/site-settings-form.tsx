"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { LogIn } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
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

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const CONTACT_SECTION_BUCKET = "contact-section";

interface SiteSettingsFormProps {
  settings: SiteSettings | null;
}

export function SiteSettingsForm({ settings }: SiteSettingsFormProps) {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);

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
      showLoginButton: settings?.show_login_button ?? true,
      contactBackgroundImageUrl: settings?.contact_background_image_url ?? "",
    },
  });

  const contactBackgroundImageUrl = useWatch({ control: form.control, name: "contactBackgroundImageUrl" });

  async function handleImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);

    const supabase = createClient();
    const extension = file.name.match(/\.[^.]+$/)?.[0] ?? "";
    const path = `${Date.now()}-${slugify(file.name.replace(/\.[^.]+$/, ""))}${extension}`;

    const { error } = await supabase.storage.from(CONTACT_SECTION_BUCKET).upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });

    if (error) {
      toast.error(error.message);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from(CONTACT_SECTION_BUCKET).getPublicUrl(path);
    form.setValue("contactBackgroundImageUrl", data.publicUrl, { shouldValidate: true });
    setUploading(false);
    toast.success("Image uploaded.");
    event.target.value = "";
  }

  async function onSubmit(values: SiteSettingsFormData) {
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
        show_login_button: values.showLoginButton,
        contact_background_image_url: values.contactBackgroundImageUrl || null,
      })
      .eq("id", 1);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Site settings saved.");
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

        <div className="space-y-3">
          <FormLabel>Contact section background image</FormLabel>

          <div>
            <Input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
            {uploading && <p className="mt-1 text-sm text-muted-foreground">Uploading…</p>}
          </div>

          {contactBackgroundImageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={contactBackgroundImageUrl}
              alt="Preview"
              className="aspect-video w-full rounded-xl border object-cover"
            />
          )}
        </div>

        <FormField
          control={form.control}
          name="showLoginButton"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between gap-4 space-y-0 rounded-xl border bg-muted/30 px-4 py-3">
              <div className="flex items-center gap-3">
                <div
                  className="flex size-9 shrink-0 items-center justify-center rounded-lg"
                  style={{ backgroundColor: "color-mix(in oklch, var(--chart-3) 15%, transparent)" }}
                >
                  <LogIn className="size-4.5" style={{ color: "var(--chart-3)" }} />
                </div>
                <div>
                  <FormLabel className="font-medium">Login button</FormLabel>
                  <p className="text-sm text-muted-foreground">
                    Show the Login button in the site header and mobile menu.
                  </p>
                </div>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-fit rounded-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Saving…" : "Save changes"}
        </Button>
      </form>
    </Form>
  );
}
