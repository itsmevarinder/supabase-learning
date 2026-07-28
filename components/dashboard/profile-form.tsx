"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { Camera, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { profileSchema, type ProfileFormData } from "@/schemas/profile-schema";
import { useProfileSync } from "@/components/dashboard/profile-sync-context";

interface ProfileFormProps {
  defaultFullName: string;
  defaultAvatarUrl: string;
}

const AVATARS_BUCKET = "avatars";

function initialsFor(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function ProfileForm({ defaultFullName, defaultAvatarUrl }: ProfileFormProps) {
  const router = useRouter();
  const { setProfile } = useProfileSync();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: { fullName: defaultFullName, avatarUrl: defaultAvatarUrl },
  });

  const fullName = useWatch({ control: form.control, name: "fullName" });
  const avatarUrl = useWatch({ control: form.control, name: "avatarUrl" });

  async function handleAvatarUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);

    const supabase = createClient();
    const extension = file.name.match(/\.[^.]+$/)?.[0] ?? "";
    const path = `${Date.now()}-${slugify(file.name.replace(/\.[^.]+$/, ""))}${extension}`;

    const { error } = await supabase.storage.from(AVATARS_BUCKET).upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });

    if (error) {
      toast.error(error.message);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from(AVATARS_BUCKET).getPublicUrl(path);
    form.setValue("avatarUrl", data.publicUrl, { shouldValidate: true });
    setUploading(false);
    toast.success("Photo uploaded.");
    event.target.value = "";
  }

  async function onSubmit(values: ProfileFormData) {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      toast.error("You must be signed in.");
      return;
    }

    const [authResult, profileResult] = await Promise.all([
      supabase.auth.updateUser({
        data: { full_name: values.fullName, avatar_url: values.avatarUrl },
      }),
      supabase
        .from("profiles")
        .update({ full_name: values.fullName, avatar_url: values.avatarUrl || null })
        .eq("id", user.id),
    ]);

    if (authResult.error || profileResult.error) {
      toast.error(authResult.error?.message ?? profileResult.error?.message ?? "Something went wrong.");
      return;
    }

    setProfile({ fullName: values.fullName, avatarUrl: values.avatarUrl ?? "" });
    toast.success("Profile updated.");
    router.refresh();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-md space-y-5">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => !uploading && fileInputRef.current?.click()}
            disabled={uploading}
            className="group relative size-18 shrink-0 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Avatar className="size-18 border">
              <AvatarImage src={avatarUrl || undefined} alt="" />
              <AvatarFallback className="text-lg">{initialsFor(fullName || defaultFullName || "?")}</AvatarFallback>
            </Avatar>

            <span
              className={`absolute inset-0 flex items-center justify-center rounded-full bg-black/50 text-white transition-opacity ${
                uploading ? "opacity-100" : "opacity-0 group-hover:opacity-100"
              }`}
            >
              {uploading ? <Loader2 className="size-5 animate-spin" /> : <Camera className="size-5" />}
            </span>

            <span className="absolute -right-0.5 -bottom-0.5 flex size-6 items-center justify-center rounded-full border-2 border-background bg-primary text-primary-foreground">
              <Camera className="size-3" />
            </span>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarUpload}
            disabled={uploading}
            className="hidden"
          />

          <div>
            <p className="text-sm font-medium">Profile photo</p>
            <p className="text-sm text-muted-foreground">Click the photo to upload a new one.</p>
          </div>
        </div>

        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full name</FormLabel>
              <FormControl>
                <Input placeholder="Jane Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="rounded-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Saving…" : "Save changes"}
        </Button>
      </form>
    </Form>
  );
}
