"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";

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
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import { aboutSectionSchema, type AboutSectionFormData } from "@/schemas/about-section-schema";
import type { AboutSectionRow } from "@/components/shadn/AboutSection";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const ABOUT_SECTION_BUCKET = "about-section";

function defaultsFromAbout(about: AboutSectionRow | null): AboutSectionFormData {
  return {
    imageUrl: about?.image_url ?? "",
    eyebrowText: about?.eyebrow_text ?? "About Us",
    title: about?.title ?? "Building Digital Experiences That Inspire",
    description:
      about?.description ??
      "We specialize in creating beautiful websites, scalable applications, and innovative digital products that help businesses grow faster and stand out in today's competitive market.",
    yearsExperience: about?.years_experience ?? 10,
    buttonText: about?.button_text ?? "Learn More",
    features: (about?.features?.length
      ? about.features
      : ["Experienced & Professional Team", "Fast Project Delivery", "Modern UI/UX Design", "24/7 Customer Support"]
    ).join("\n"),
  };
}

interface AboutSectionFormProps {
  about: AboutSectionRow | null;
}

export function AboutSectionForm({ about }: AboutSectionFormProps) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const form = useForm<AboutSectionFormData>({
    resolver: zodResolver(aboutSectionSchema),
    defaultValues: defaultsFromAbout(about),
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

    const { error } = await supabase.storage.from(ABOUT_SECTION_BUCKET).upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });

    if (error) {
      setUploadError(error.message);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from(ABOUT_SECTION_BUCKET).getPublicUrl(path);
    form.setValue("imageUrl", data.publicUrl, { shouldValidate: true });
    setUploading(false);
    event.target.value = "";
  }

  async function onSubmit(values: AboutSectionFormData) {
    setStatus("idle");
    setErrorMessage(null);

    const supabase = createClient();
    const { error } = await supabase
      .from("about_section")
      .update({
        image_url: values.imageUrl || null,
        eyebrow_text: values.eyebrowText,
        title: values.title,
        description: values.description,
        years_experience: values.yearsExperience,
        button_text: values.buttonText,
        features: values.features
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean),
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
        <div className="space-y-3">
          <FormLabel>Image</FormLabel>

          <div>
            <Input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
            {uploading && <p className="mt-1 text-sm text-muted-foreground">Uploading…</p>}
            {uploadError && <p className="mt-1 text-sm text-destructive">{uploadError}</p>}
          </div>

          {imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageUrl} alt="Preview" className="h-32 w-52 rounded-xl border object-cover" />
          )}
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="eyebrowText"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Eyebrow text</FormLabel>
                <FormControl>
                  <Input placeholder="About Us" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="yearsExperience"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Years experience (badge)</FormLabel>
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

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Building Digital Experiences That Inspire" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea rows={4} placeholder="We specialize in creating…" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="features"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Feature checklist</FormLabel>
              <FormControl>
                <Textarea rows={4} placeholder={"One feature per line"} {...field} />
              </FormControl>
              <p className="text-sm text-muted-foreground">One feature per line.</p>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="buttonText"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Button text</FormLabel>
              <FormControl>
                <Input placeholder="Learn More" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {status === "saved" && <p className="text-sm text-green-600">Saved.</p>}
        {status === "error" && errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}

        <Button type="submit" className="w-fit rounded-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Saving…" : "Save changes"}
        </Button>
      </form>
    </Form>
  );
}
