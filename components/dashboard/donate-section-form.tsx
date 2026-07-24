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
import { donateSectionSchema, type DonateSectionFormData } from "@/schemas/donate-section-schema";
import type { DonateSectionRow } from "@/components/shadn/DonateSection";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const DONATE_SECTION_BUCKET = "donate-section";

function defaultsFromDonate(donate: DonateSectionRow | null): DonateSectionFormData {
  return {
    backgroundImageUrl: donate?.background_image_url ?? "",
    title: donate?.title ?? "Support Our Mission",
    subtitle: donate?.subtitle ?? "Give Back Today",
    description:
      donate?.description ??
      "Your generosity helps us keep building things that matter — every contribution, big or small, makes a real difference.",
    buttonText: donate?.button_text ?? "Donate Now",
    settlementNote: donate?.phone_number ?? "",
    defaultAmount: donate?.default_amount ?? 1,
  };
}

interface DonateSectionFormProps {
  donate: DonateSectionRow | null;
}

export function DonateSectionForm({ donate }: DonateSectionFormProps) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const form = useForm<DonateSectionFormData>({
    resolver: zodResolver(donateSectionSchema),
    defaultValues: defaultsFromDonate(donate),
  });

  const backgroundImageUrl = useWatch({ control: form.control, name: "backgroundImageUrl" });

  async function handleImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError(null);

    const supabase = createClient();
    const extension = file.name.match(/\.[^.]+$/)?.[0] ?? "";
    const path = `${Date.now()}-${slugify(file.name.replace(/\.[^.]+$/, ""))}${extension}`;

    const { error } = await supabase.storage.from(DONATE_SECTION_BUCKET).upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });

    if (error) {
      setUploadError(error.message);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from(DONATE_SECTION_BUCKET).getPublicUrl(path);
    form.setValue("backgroundImageUrl", data.publicUrl, { shouldValidate: true });
    setUploading(false);
    event.target.value = "";
  }

  async function onSubmit(values: DonateSectionFormData) {
    setStatus("idle");
    setErrorMessage(null);

    const supabase = createClient();
    const { error } = await supabase
      .from("donate_section")
      .update({
        background_image_url: values.backgroundImageUrl || null,
        title: values.title,
        subtitle: values.subtitle,
        description: values.description || null,
        button_text: values.buttonText,
        phone_number: values.settlementNote || null,
        default_amount: values.defaultAmount,
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
          <FormLabel>Background image</FormLabel>

          <div>
            <Input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
            {uploading && <p className="mt-1 text-sm text-muted-foreground">Uploading…</p>}
            {uploadError && <p className="mt-1 text-sm text-destructive">{uploadError}</p>}
          </div>

          {backgroundImageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={backgroundImageUrl} alt="Preview" className="h-32 w-52 rounded-xl border object-cover" />
          )}
        </div>

        <FormField
          control={form.control}
          name="subtitle"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subtitle (small label above the title)</FormLabel>
              <FormControl>
                <Input placeholder="Give Back Today" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Support Our Mission" {...field} />
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
                <Textarea rows={4} placeholder="Your generosity helps us…" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="buttonText"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Button text</FormLabel>
                <FormControl>
                  <Input placeholder="Donate Now" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="defaultAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Default amount (₹)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={50}
                    value={field.value}
                    onChange={(event) => field.onChange(event.target.valueAsNumber || 0)}
                  />
                </FormControl>
                <p className="text-sm text-muted-foreground">
                  The QR code is generated for this exact amount — visitors don&apos;t choose one.
                  Stripe requires at least ₹50 for UPI payments.
                </p>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="settlementNote"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Settlement UPI ID (reference only)</FormLabel>
              <FormControl>
                <Input placeholder="9876543210@okhdfcbank" {...field} />
              </FormControl>
              <p className="text-sm text-muted-foreground">
                For your own records only — donations always settle to whichever bank account is
                linked to your Stripe account. Changing this field does not change where money is
                received; to do that, update it in your Stripe dashboard.
              </p>
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
