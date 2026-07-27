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
import { getYouTubeThumbnail } from "@/lib/youtube";
import { videoSectionSchema, type VideoSectionFormData } from "@/schemas/video-section-schema";
import type { VideoSectionRow } from "@/components/shadn/VideoSection";

function defaultsFromVideo(video: VideoSectionRow | null): VideoSectionFormData {
  return {
    videoUrl: video?.video_url ?? "",
    title: video?.title ?? "See How We Bring Ideas To Life",
    description:
      video?.description ??
      "A quick look at how our team designs, builds, and ships products our clients love.",
    isActive: video?.is_active ?? true,
  };
}

interface VideoSectionFormProps {
  video: VideoSectionRow | null;
}

export function VideoSectionForm({ video }: VideoSectionFormProps) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const form = useForm<VideoSectionFormData>({
    resolver: zodResolver(videoSectionSchema),
    defaultValues: defaultsFromVideo(video),
  });

  const videoUrl = useWatch({ control: form.control, name: "videoUrl" });
  const thumbnail = getYouTubeThumbnail(videoUrl);

  async function onSubmit(values: VideoSectionFormData) {
    setStatus("idle");
    setErrorMessage(null);

    const supabase = createClient();
    const { error } = await supabase
      .from("video_section")
      .update({
        video_url: values.videoUrl,
        title: values.title,
        description: values.description,
        is_active: values.isActive,
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
        <FormField
          control={form.control}
          name="videoUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>YouTube video link</FormLabel>
              <FormControl>
                <Input placeholder="https://www.youtube.com/watch?v=…" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {thumbnail && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Thumbnail preview</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={thumbnail}
              alt="Video thumbnail preview"
              className="aspect-video w-full rounded-xl border object-cover"
            />
          </div>
        )}

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="See How We Bring Ideas To Life" {...field} />
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
                <Textarea rows={3} placeholder="A quick look at how our team…" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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

        {status === "saved" && <p className="text-sm text-green-600">Saved.</p>}
        {status === "error" && errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}

        <Button type="submit" className="w-fit rounded-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Saving…" : "Save changes"}
        </Button>
      </form>
    </Form>
  );
}
