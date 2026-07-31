"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { Image as ImageIcon, Video } from "lucide-react";
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
import { translateGalleryItem } from "@/app/actions/translate-cms";
import { createClient } from "@/lib/supabase/client";
import { getYouTubeId, getYouTubeThumbnail } from "@/lib/youtube";
import { galleryItemSchema, type GalleryItemFormData } from "@/schemas/gallery-item-schema";
import type { GalleryItemRow } from "@/components/shadn/GallerySection";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const GALLERY_BUCKET = "gallery";

function defaultsFromItem(item?: GalleryItemRow): GalleryItemFormData {
  if (!item) {
    return {
      mediaType: "image",
      imageUrl: "",
      videoUrl: "",
      title: "",
      isActive: true,
      sortOrder: 0,
    };
  }

  return {
    mediaType: item.media_type,
    imageUrl: item.image_url ?? "",
    videoUrl: item.video_url ?? "",
    title: item.title ?? "",
    isActive: item.is_active,
    sortOrder: item.sort_order,
  };
}

interface GalleryItemFormProps {
  /** Present when editing an existing row — absent means "create new". */
  item?: GalleryItemRow;
}

export function GalleryItemForm({ item }: GalleryItemFormProps) {
  const isEditing = Boolean(item);
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [videoUploading, setVideoUploading] = useState(false);
  const [videoSource, setVideoSource] = useState<"youtube" | "upload">(() =>
    item?.video_url && !getYouTubeId(item.video_url) ? "upload" : "youtube"
  );

  const form = useForm<GalleryItemFormData>({
    resolver: zodResolver(galleryItemSchema),
    defaultValues: defaultsFromItem(item),
  });

  const mediaType = useWatch({ control: form.control, name: "mediaType" });
  const imageUrl = useWatch({ control: form.control, name: "imageUrl" });
  const videoUrl = useWatch({ control: form.control, name: "videoUrl" });
  const videoThumbnail = getYouTubeThumbnail(videoUrl);
  const isUploadedVideo = videoSource === "upload" && Boolean(videoUrl);

  async function handleImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);

    const supabase = createClient();
    const extension = file.name.match(/\.[^.]+$/)?.[0] ?? "";
    const path = `${Date.now()}-${slugify(file.name.replace(/\.[^.]+$/, ""))}${extension}`;

    const { error } = await supabase.storage.from(GALLERY_BUCKET).upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });

    if (error) {
      toast.error(error.message);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from(GALLERY_BUCKET).getPublicUrl(path);
    form.setValue("imageUrl", data.publicUrl, { shouldValidate: true });
    setUploading(false);
    toast.success("Image uploaded.");
    event.target.value = "";
  }

  async function handleVideoUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setVideoUploading(true);

    const supabase = createClient();
    const extension = file.name.match(/\.[^.]+$/)?.[0] ?? "";
    const path = `${Date.now()}-${slugify(file.name.replace(/\.[^.]+$/, ""))}${extension}`;

    const { error } = await supabase.storage.from(GALLERY_BUCKET).upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });

    if (error) {
      toast.error(error.message);
      setVideoUploading(false);
      return;
    }

    const { data } = supabase.storage.from(GALLERY_BUCKET).getPublicUrl(path);
    form.setValue("videoUrl", data.publicUrl, { shouldValidate: true });
    setVideoUploading(false);
    toast.success("Video uploaded.");
    event.target.value = "";
  }

  async function onSubmit(values: GalleryItemFormData) {
    const supabase = createClient();
    const record = {
      media_type: values.mediaType,
      image_url: values.mediaType === "image" ? values.imageUrl || null : null,
      video_url: values.mediaType === "video" ? values.videoUrl || null : null,
      title: values.title || null,
      is_active: values.isActive,
      sort_order: values.sortOrder,
    };

    const { data, error } = isEditing
      ? await supabase.from("gallery_items").update(record).eq("id", item!.id).select().single()
      : await supabase.from("gallery_items").insert(record).select().single();

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success(isEditing ? "Gallery item updated." : "Gallery item added.");

    if (values.title) {
      translateGalleryItem(data.id, { title: values.title }).catch(() => {});
    }

    router.push("/admin/gallery");
    router.refresh();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-5">
        <FormField
          control={form.control}
          name="mediaType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Media type</FormLabel>
              <FormControl>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => field.onChange("image")}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
                      field.value === "image"
                        ? "border-primary bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <ImageIcon className="size-4" />
                    Image
                  </button>
                  <button
                    type="button"
                    onClick={() => field.onChange("video")}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
                      field.value === "video"
                        ? "border-primary bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <Video className="size-4" />
                    Video
                  </button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {mediaType === "image" ? (
          <div className="space-y-3">
            <FormLabel>Image</FormLabel>

            <div>
              <Input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
              {uploading && <p className="mt-1 text-sm text-muted-foreground">Uploading…</p>}
              {form.formState.errors.imageUrl && (
                <p className="mt-1 text-sm text-destructive">{form.formState.errors.imageUrl.message}</p>
              )}
            </div>

            {imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imageUrl} alt="Preview" className="h-32 w-32 rounded-xl border object-cover" />
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setVideoSource("youtube");
                  form.setValue("videoUrl", "", { shouldValidate: true });
                }}
                className={`flex-1 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                  videoSource === "youtube"
                    ? "border-primary bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                YouTube Link
              </button>
              <button
                type="button"
                onClick={() => {
                  setVideoSource("upload");
                  form.setValue("videoUrl", "", { shouldValidate: true });
                }}
                className={`flex-1 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                  videoSource === "upload"
                    ? "border-primary bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                Upload Video File
              </button>
            </div>

            {videoSource === "youtube" ? (
              <>
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

                {videoThumbnail && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={videoThumbnail}
                    alt="Video thumbnail preview"
                    className="aspect-video w-full rounded-xl border object-cover"
                  />
                )}
              </>
            ) : (
              <div>
                <FormLabel>Video file</FormLabel>
                <div className="mt-1.5">
                  <Input type="file" accept="video/*" onChange={handleVideoUpload} disabled={videoUploading} />
                  {videoUploading && <p className="mt-1 text-sm text-muted-foreground">Uploading…</p>}
                  {form.formState.errors.videoUrl && (
                    <p className="mt-1 text-sm text-destructive">{form.formState.errors.videoUrl.message}</p>
                  )}
                </div>

                {isUploadedVideo && (
                  <video
                    src={videoUrl}
                    controls
                    muted
                    className="mt-3 aspect-video w-full rounded-xl border object-cover"
                  />
                )}
              </div>
            )}
          </div>
        )}

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Caption (optional)</FormLabel>
              <FormControl>
                <Input placeholder="Behind the scenes at our studio" {...field} />
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
              : "Add gallery item"}
        </Button>
      </form>
    </Form>
  );
}
