"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import EmojiPicker from "emoji-picker-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import { heroBannerSchema, type HeroBannerFormData } from "@/schemas/hero-banner-schema";
import type { HeroBannerRow } from "@/components/shadn/HeroSection";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const HERO_BANNERS_BUCKET = "hero-banners";

function defaultsFromBanner(banner?: HeroBannerRow): HeroBannerFormData {
  if (!banner) {
    return {
      slug: "",
      imageUrl: "",
      imageAlt: "",
      badgeEmoji: "🚀",
      badgeText: "",
      title: "",
      description: "",
      primaryButtonText: "Get Started",
      primaryButtonLink: "#contact",
      secondaryButtonText: "Learn More",
      secondaryButtonLink: "#about",
      isActive: true,
      sortOrder: 0,
    };
  }

  return {
    slug: banner.slug,
    imageUrl: banner.image_url,
    imageAlt: banner.image_alt ?? "",
    badgeEmoji: banner.badge_emoji ?? "",
    badgeText: banner.badge_text,
    title: banner.title,
    description: banner.description ?? "",
    primaryButtonText: banner.primary_button_text ?? "",
    primaryButtonLink: banner.primary_button_link ?? "",
    secondaryButtonText: banner.secondary_button_text ?? "",
    secondaryButtonLink: banner.secondary_button_link ?? "",
    isActive: banner.is_active,
    sortOrder: banner.sort_order,
  };
}

interface HeroBannerFormProps {
  /** Present when editing an existing row — absent means "create new". */
  banner?: HeroBannerRow;
}

export function HeroBannerForm({ banner }: HeroBannerFormProps) {
  const isEditing = Boolean(banner);
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [slugTouched, setSlugTouched] = useState(isEditing);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const form = useForm<HeroBannerFormData>({
    resolver: zodResolver(heroBannerSchema),
    defaultValues: defaultsFromBanner(banner),
  });

  const imageUrl = useWatch({ control: form.control, name: "imageUrl" });

  async function handleImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError(null);

    const supabase = createClient();
    const extension = file.name.match(/\.[^.]+$/)?.[0] ?? "";
    const path = `${Date.now()}-${slugify(file.name.replace(/\.[^.]+$/, ""))}${extension}`;

    const { error } = await supabase.storage.from(HERO_BANNERS_BUCKET).upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });

    if (error) {
      setUploadError(error.message);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from(HERO_BANNERS_BUCKET).getPublicUrl(path);
    form.setValue("imageUrl", data.publicUrl, { shouldValidate: true });
    setUploading(false);
    event.target.value = "";
  }

  async function onSubmit(values: HeroBannerFormData) {
    setStatus("idle");
    setErrorMessage(null);

    const supabase = createClient();
    const record = {
      slug: values.slug,
      image_url: values.imageUrl,
      image_alt: values.imageAlt || null,
      badge_emoji: values.badgeEmoji || null,
      badge_text: values.badgeText,
      title: values.title,
      description: values.description || null,
      primary_button_text: values.primaryButtonText || null,
      primary_button_link: values.primaryButtonLink || null,
      secondary_button_text: values.secondaryButtonText || null,
      secondary_button_link: values.secondaryButtonLink || null,
      is_active: values.isActive,
      sort_order: values.sortOrder,
    };

    const { error } = isEditing
      ? await supabase.from("hero_banners").update(record).eq("id", banner!.id)
      : await supabase.from("hero_banners").insert(record);

    if (error) {
      setStatus("error");
      setErrorMessage(error.message);
      return;
    }

    if (isEditing) {
      router.push("/admin/hero-banners");
      router.refresh();
      return;
    }

    form.reset();
    setSlugTouched(false);
    router.refresh();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-5">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input
                  placeholder="Create Experiences That Inspire"
                  {...field}
                  onChange={(event) => {
                    field.onChange(event);
                    if (!slugTouched) {
                      form.setValue("slug", slugify(event.target.value));
                    }
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Slug</FormLabel>
              <FormControl>
                <Input
                  placeholder="home-hero"
                  {...field}
                  onChange={(event) => {
                    setSlugTouched(true);
                    field.onChange(event);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-5 sm:grid-cols-2 items-start">
          <div className="space-y-3">
            <FormLabel>Image</FormLabel>
            <div>
              <Input type="file" accept="image/*" className="flex items-center" onChange={handleImageUpload} disabled={uploading} />
              {uploading && <p className="mt-1 text-sm text-muted-foreground">Uploading…</p>}
              {uploadError && <p className="mt-1 text-sm text-destructive">{uploadError}</p>}
            </div>

            {imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageUrl}
                alt="Preview"
                className="aspect-video rounded-lg border object-cover"
              />
            )}
          </div>

          <FormField
            control={form.control}
            name="imageAlt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Image alt text</FormLabel>
                <FormControl>
                  <Input placeholder="Team collaborating in a modern office" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-[6rem_1fr]">
          <FormField
            control={form.control}
            name="badgeEmoji"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Badge emoji</FormLabel>

                <Popover>
                  <PopoverTrigger>
                   <p className="text-2xl text-left"> {field.value || "🚀"}</p>
                  </PopoverTrigger>

                  <PopoverContent className="w-auto p-0">
                    <EmojiPicker
                      onEmojiClick={(emojiData) => {
                        field.onChange(emojiData.emoji);
                      }}
                    />
                  </PopoverContent>
                </Popover>

                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="badgeText"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Badge text</FormLabel>
                <FormControl>
                  <Input placeholder="Trusted by 10,000+ Clients" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea rows={3} placeholder="Build beautiful digital products that…" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="primaryButtonText"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Primary button text</FormLabel>
                <FormControl>
                  <Input placeholder="Get Started" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="primaryButtonLink"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Primary button link</FormLabel>
                <FormControl>
                  <Input placeholder="#contact" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="secondaryButtonText"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Secondary button text</FormLabel>
                <FormControl>
                  <Input placeholder="Learn More" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="secondaryButtonLink"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Secondary button link</FormLabel>
                <FormControl>
                  <Input placeholder="#about" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-[1fr_8rem]">
          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem className="group flex flex-row items-center gap-2 space-y-0">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <FormLabel className="font-normal">Active (visible on the homepage)</FormLabel>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="sortOrder"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sort order</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    value={field.value}
                    onChange={(event) => field.onChange(event.target.valueAsNumber || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {status === "error" && errorMessage && (
          <p className="text-sm text-destructive">{errorMessage}</p>
        )}

        <Button type="submit" className="w-fit rounded-full" disabled={form.formState.isSubmitting}>
          {isEditing
            ? form.formState.isSubmitting
              ? "Saving…"
              : "Save changes"
            : form.formState.isSubmitting
              ? "Adding…"
              : "Add banner"}
        </Button>
      </form>
    </Form>
  );
}
