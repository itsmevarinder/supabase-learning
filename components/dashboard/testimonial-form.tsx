"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { Star } from "lucide-react";
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
import { testimonialSchema, type TestimonialFormData } from "@/schemas/testimonial-schema";
import type { TestimonialRow } from "@/components/shadn/TestimonialSection";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const TESTIMONIALS_BUCKET = "testimonials";

function defaultsFromTestimonial(testimonial?: TestimonialRow): TestimonialFormData {
  if (!testimonial) {
    return {
      name: "",
      role: "",
      imageUrl: "",
      review: "",
      rating: 5,
      isActive: true,
      sortOrder: 0,
    };
  }

  return {
    name: testimonial.name,
    role: testimonial.role,
    imageUrl: testimonial.image_url ?? "",
    review: testimonial.review,
    rating: testimonial.rating,
    isActive: testimonial.is_active,
    sortOrder: testimonial.sort_order,
  };
}

interface TestimonialFormProps {
  /** Present when editing an existing row — absent means "create new". */
  testimonial?: TestimonialRow;
}

export function TestimonialForm({ testimonial }: TestimonialFormProps) {
  const isEditing = Boolean(testimonial);
  const router = useRouter();
  const [uploading, setUploading] = useState(false);

  const form = useForm<TestimonialFormData>({
    resolver: zodResolver(testimonialSchema),
    defaultValues: defaultsFromTestimonial(testimonial),
  });

  const imageUrl = useWatch({ control: form.control, name: "imageUrl" });
  const rating = useWatch({ control: form.control, name: "rating" });

  async function handleImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);

    const supabase = createClient();
    const extension = file.name.match(/\.[^.]+$/)?.[0] ?? "";
    const path = `${Date.now()}-${slugify(file.name.replace(/\.[^.]+$/, ""))}${extension}`;

    const { error } = await supabase.storage.from(TESTIMONIALS_BUCKET).upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });

    if (error) {
      toast.error(error.message);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from(TESTIMONIALS_BUCKET).getPublicUrl(path);
    form.setValue("imageUrl", data.publicUrl, { shouldValidate: true });
    setUploading(false);
    toast.success("Image uploaded.");
    event.target.value = "";
  }

  async function onSubmit(values: TestimonialFormData) {
    const supabase = createClient();
    const record = {
      name: values.name,
      role: values.role,
      image_url: values.imageUrl || null,
      review: values.review,
      rating: values.rating,
      is_active: values.isActive,
      sort_order: values.sortOrder,
    };

    const { error } = isEditing
      ? await supabase.from("testimonials").update(record).eq("id", testimonial!.id)
      : await supabase.from("testimonials").insert(record);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success(isEditing ? "Testimonial updated." : "Testimonial added.");
    router.push("/admin/testimonials");
    router.refresh();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="John Anderson" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Role</FormLabel>
                <FormControl>
                  <Input placeholder="CEO, TechCorp" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-3">
            <FormLabel>Avatar</FormLabel>

          <div>
            <Input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
            {uploading && <p className="mt-1 text-sm text-muted-foreground">Uploading…</p>}
          </div>

          {imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageUrl} alt="Preview" className="h-16 w-16 rounded-full border object-cover" />
          )}
        </div>

        <FormField
          control={form.control}
          name="review"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Review</FormLabel>
              <FormControl>
                <Textarea rows={4} placeholder="Working with this team has been…" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="rating"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Rating</FormLabel>
              <FormControl>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => field.onChange(value)}
                      aria-label={`${value} star${value === 1 ? "" : "s"}`}
                    >
                      <Star
                        className={
                          value <= rating
                            ? "h-6 w-6 fill-yellow-400 text-yellow-400"
                            : "h-6 w-6 text-muted-foreground/30"
                        }
                      />
                    </button>
                  ))}
                </div>
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
              : "Add testimonial"}
        </Button>
      </form>
    </Form>
  );
}
