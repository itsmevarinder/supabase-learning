"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

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
import { audioTrackSchema, type AudioTrackFormData } from "@/schemas/audio-track-schema";
import type { AudioTrackRow } from "@/components/shadn/AudioSection";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const AUDIO_BUCKET = "audio";

function defaultsFromTrack(track?: AudioTrackRow): AudioTrackFormData {
  if (!track) {
    return {
      title: "",
      description: "",
      audioUrl: "",
      coverImageUrl: "",
      isActive: true,
      sortOrder: 0,
    };
  }

  return {
    title: track.title,
    description: track.description ?? "",
    audioUrl: track.audio_url,
    coverImageUrl: track.cover_image_url ?? "",
    isActive: track.is_active,
    sortOrder: track.sort_order,
  };
}

interface AudioTrackFormProps {
  /** Present when editing an existing row — absent means "create new". */
  track?: AudioTrackRow;
}

export function AudioTrackForm({ track }: AudioTrackFormProps) {
  const isEditing = Boolean(track);
  const router = useRouter();
  const [audioUploading, setAudioUploading] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);

  const form = useForm<AudioTrackFormData>({
    resolver: zodResolver(audioTrackSchema),
    defaultValues: defaultsFromTrack(track),
  });

  const audioUrl = useWatch({ control: form.control, name: "audioUrl" });
  const coverImageUrl = useWatch({ control: form.control, name: "coverImageUrl" });

  async function uploadFile(file: File) {
    const supabase = createClient();
    const extension = file.name.match(/\.[^.]+$/)?.[0] ?? "";
    const path = `${Date.now()}-${slugify(file.name.replace(/\.[^.]+$/, ""))}${extension}`;

    const { error } = await supabase.storage.from(AUDIO_BUCKET).upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });

    if (error) throw error;

    const { data } = supabase.storage.from(AUDIO_BUCKET).getPublicUrl(path);
    return data.publicUrl;
  }

  async function handleAudioUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setAudioUploading(true);

    try {
      const url = await uploadFile(file);
      form.setValue("audioUrl", url, { shouldValidate: true });
      toast.success("Audio file uploaded.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setAudioUploading(false);
      event.target.value = "";
    }
  }

  async function handleCoverUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setCoverUploading(true);

    try {
      const url = await uploadFile(file);
      form.setValue("coverImageUrl", url, { shouldValidate: true });
      toast.success("Cover image uploaded.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setCoverUploading(false);
      event.target.value = "";
    }
  }

  async function onSubmit(values: AudioTrackFormData) {
    const supabase = createClient();
    const record = {
      title: values.title,
      description: values.description || null,
      audio_url: values.audioUrl,
      cover_image_url: values.coverImageUrl || null,
      is_active: values.isActive,
      sort_order: values.sortOrder,
    };

    const { error } = isEditing
      ? await supabase.from("audio_tracks").update(record).eq("id", track!.id)
      : await supabase.from("audio_tracks").insert(record);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success(isEditing ? "Track updated." : "Track added.");
    router.push("/admin/audio");
    router.refresh();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-5">
        <div>
          <FormLabel>Audio file (MP3)</FormLabel>
          <div className="mt-1.5">
            <Input type="file" accept="audio/*" onChange={handleAudioUpload} disabled={audioUploading} />
            {audioUploading && <p className="mt-1 text-sm text-muted-foreground">Uploading…</p>}
            {form.formState.errors.audioUrl && (
              <p className="mt-1 text-sm text-destructive">{form.formState.errors.audioUrl.message}</p>
            )}
          </div>

          {audioUrl && <audio src={audioUrl} controls className="mt-3 w-full max-w-sm" />}
        </div>

        <div className="space-y-3">
          <FormLabel>Cover image (optional)</FormLabel>
          <div>
            <Input type="file" accept="image/*" onChange={handleCoverUpload} disabled={coverUploading} />
            {coverUploading && <p className="mt-1 text-sm text-muted-foreground">Uploading…</p>}
          </div>

          {coverImageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={coverImageUrl} alt="Preview" className="size-20 rounded-lg border object-cover" />
          )}
        </div>

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Episode 1: Getting Started" {...field} />
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
              <FormLabel>Description (optional)</FormLabel>
              <FormControl>
                <Textarea rows={2} placeholder="A short intro to what this episode covers…" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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

        <Button type="submit" className="w-fit rounded-full" disabled={form.formState.isSubmitting}>
          {isEditing
            ? form.formState.isSubmitting
              ? "Saving…"
              : "Save changes"
            : form.formState.isSubmitting
              ? "Adding…"
              : "Add track"}
        </Button>
      </form>
    </Form>
  );
}
