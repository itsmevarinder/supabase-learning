"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";

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
import { eventSchema, type EventFormData } from "@/schemas/event-schema";
import type { EventRow } from "@/components/shadn/EventsSection";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const EVENTS_BUCKET = "events";

function defaultsFromEvent(event?: EventRow): EventFormData {
  if (!event) {
    return {
      imageUrl: "",
      title: "",
      description: "",
      eventDate: "",
      eventTime: "",
      location: "",
      linkUrl: "",
      isActive: true,
      sortOrder: 0,
    };
  }

  return {
    imageUrl: event.image_url ?? "",
    title: event.title,
    description: event.description,
    eventDate: event.event_date,
    eventTime: event.event_time ?? "",
    location: event.location ?? "",
    linkUrl: event.link_url ?? "",
    isActive: event.is_active,
    sortOrder: event.sort_order,
  };
}

interface EventFormProps {
  /** Present when editing an existing row — absent means "create new". */
  event?: EventRow;
}

export function EventForm({ event }: EventFormProps) {
  const isEditing = Boolean(event);
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const form = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: defaultsFromEvent(event),
  });

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const imageUrl = useWatch({ control: form.control, name: "imageUrl" });

  async function handleImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError(null);

    const supabase = createClient();
    const extension = file.name.match(/\.[^.]+$/)?.[0] ?? "";
    const path = `${Date.now()}-${slugify(file.name.replace(/\.[^.]+$/, ""))}${extension}`;

    const { error } = await supabase.storage.from(EVENTS_BUCKET).upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });

    if (error) {
      setUploadError(error.message);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from(EVENTS_BUCKET).getPublicUrl(path);
    form.setValue("imageUrl", data.publicUrl, { shouldValidate: true });
    setUploading(false);
    event.target.value = "";
  }

  async function onSubmit(values: EventFormData) {
    setStatus("idle");
    setErrorMessage(null);

    const supabase = createClient();
    const record = {
      image_url: values.imageUrl || null,
      title: values.title,
      description: values.description,
      event_date: values.eventDate,
      event_time: values.eventTime || null,
      location: values.location || null,
      link_url: values.linkUrl || null,
      is_active: values.isActive,
      sort_order: values.sortOrder,
    };

    const { error } = isEditing
      ? await supabase.from("events").update(record).eq("id", event!.id)
      : await supabase.from("events").insert(record);

    if (error) {
      setStatus("error");
      setErrorMessage(error.message);
      return;
    }

    router.push("/admin/events");
    router.refresh();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-5">
        <div className="space-y-3">
          <FormLabel>Thumbnail (optional)</FormLabel>

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

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Design Systems Workshop" {...field} />
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
                <Textarea rows={3} placeholder="A hands-on session covering…" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="eventDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="eventTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Time (optional)</FormLabel>
                <FormControl>
                  <Input placeholder="10:00 AM - 2:00 PM" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location (optional)</FormLabel>
                <FormControl>
                  <Input placeholder="New York, United States" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="linkUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Link (optional)</FormLabel>
                <FormControl>
                  <Input placeholder="https://…" {...field} />
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

        {status === "error" && errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}

        <Button type="submit" className="w-fit rounded-full" disabled={form.formState.isSubmitting}>
          {isEditing
            ? form.formState.isSubmitting
              ? "Saving…"
              : "Save changes"
            : form.formState.isSubmitting
              ? "Adding…"
              : "Add event"}
        </Button>
      </form>
    </Form>
  );
}
