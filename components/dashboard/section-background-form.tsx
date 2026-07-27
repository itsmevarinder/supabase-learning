"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

interface SectionBackgroundFormProps {
  title: string;
  description: string;
  table: string;
  bucket: string;
  imageUrl: string | null;
}

export function SectionBackgroundForm({ title, description, table, bucket, imageUrl }: SectionBackgroundFormProps) {
  const router = useRouter();
  const [preview, setPreview] = useState(imageUrl ?? "");
  const [uploading, setUploading] = useState(false);

  async function handleImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);

    const supabase = createClient();
    const extension = file.name.match(/\.[^.]+$/)?.[0] ?? "";
    const path = `${Date.now()}-${slugify(file.name.replace(/\.[^.]+$/, ""))}${extension}`;

    const { error: uploadError } = await supabase.storage.from(bucket).upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });

    if (uploadError) {
      toast.error(uploadError.message);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(path);

    const { error: updateError } = await supabase
      .from(table)
      .update({ background_image_url: data.publicUrl })
      .eq("id", 1);

    setUploading(false);
    event.target.value = "";

    if (updateError) {
      toast.error(updateError.message);
      return;
    }

    setPreview(data.publicUrl);
    toast.success("Background image updated.");
    router.refresh();
  }

  return (
    <div className="space-y-3">
      <div>
        <h3 className="font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        {preview && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="Preview" className="h-20 w-36 rounded-lg border object-cover" />
        )}

        <div>
          <Label htmlFor={`${table}-bg`} className="sr-only">
            Background image
          </Label>
          <Input id={`${table}-bg`} type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
          {uploading && <p className="mt-1 text-sm text-muted-foreground">Uploading…</p>}
        </div>
      </div>
    </div>
  );
}
