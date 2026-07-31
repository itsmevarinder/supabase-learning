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
import { translatePortfolioProject } from "@/app/actions/translate-cms";
import { createClient } from "@/lib/supabase/client";
import { portfolioProjectSchema, type PortfolioProjectFormData } from "@/schemas/portfolio-project-schema";
import type { PortfolioProjectRow } from "@/components/shadn/PortfolioSection";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const PORTFOLIO_PROJECTS_BUCKET = "portfolio-projects";

function defaultsFromProject(project?: PortfolioProjectRow): PortfolioProjectFormData {
  if (!project) {
    return {
      title: "",
      category: "",
      imageUrl: "",
      projectLink: "#",
      description: "",
      clientName: "",
      projectYear: "",
      role: "",
      isActive: true,
      sortOrder: 0,
    };
  }

  return {
    title: project.title,
    category: project.category,
    imageUrl: project.image_url,
    projectLink: project.project_link ?? "#",
    description: project.description ?? "",
    clientName: project.client_name ?? "",
    projectYear: project.project_year ?? "",
    role: project.role ?? "",
    isActive: project.is_active,
    sortOrder: project.sort_order,
  };
}

interface PortfolioProjectFormProps {
  /** Present when editing an existing row — absent means "create new". */
  project?: PortfolioProjectRow;
}

export function PortfolioProjectForm({ project }: PortfolioProjectFormProps) {
  const isEditing = Boolean(project);
  const router = useRouter();
  const [uploading, setUploading] = useState(false);

  const form = useForm<PortfolioProjectFormData>({
    resolver: zodResolver(portfolioProjectSchema),
    defaultValues: defaultsFromProject(project),
  });

  const imageUrl = useWatch({ control: form.control, name: "imageUrl" });

  async function handleImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);

    const supabase = createClient();
    const extension = file.name.match(/\.[^.]+$/)?.[0] ?? "";
    const path = `${Date.now()}-${slugify(file.name.replace(/\.[^.]+$/, ""))}${extension}`;

    const { error } = await supabase.storage.from(PORTFOLIO_PROJECTS_BUCKET).upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });

    if (error) {
      toast.error(error.message);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from(PORTFOLIO_PROJECTS_BUCKET).getPublicUrl(path);
    form.setValue("imageUrl", data.publicUrl, { shouldValidate: true });
    setUploading(false);
    toast.success("Image uploaded.");
    event.target.value = "";
  }

  async function onSubmit(values: PortfolioProjectFormData) {
    const supabase = createClient();
    const record = {
      title: values.title,
      category: values.category,
      image_url: values.imageUrl,
      project_link: values.projectLink || null,
      description: values.description || null,
      client_name: values.clientName || null,
      project_year: values.projectYear || null,
      role: values.role || null,
      is_active: values.isActive,
      sort_order: values.sortOrder,
    };

    const { data, error } = isEditing
      ? await supabase.from("portfolio_projects").update(record).eq("id", project!.id).select().single()
      : await supabase.from("portfolio_projects").insert(record).select().single();

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success(isEditing ? "Project updated." : "Project added.");

    translatePortfolioProject(data.id, {
      title: values.title,
      description: values.description || null,
      role: values.role || null,
    }).catch(() => {});

    router.push("/admin/portfolio");
    router.refresh();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Business Website" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <FormControl>
                  <Input placeholder="Web Development" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-3">

          <FormLabel>Image</FormLabel>
          <div>
            <Input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
            {uploading && <p className="mt-1 text-sm text-muted-foreground">Uploading…</p>}
          </div>

          {imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageUrl} alt="Preview" className="aspect-video rounded-lg border object-cover" />
          )}
        </div>

        <FormField
          control={form.control}
          name="projectLink"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project link</FormLabel>
              <FormControl>
                <Input placeholder="https://example.com or #" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-5 sm:grid-cols-3">
          <FormField
            control={form.control}
            name="clientName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Client</FormLabel>
                <FormControl>
                  <Input placeholder="Acme Inc." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="projectYear"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Year</FormLabel>
                <FormControl>
                  <Input placeholder="2026" {...field} />
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
                <FormLabel>Our role</FormLabel>
                <FormControl>
                  <Input placeholder="Design & Development" {...field} />
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
              <FormLabel>Description (shown on the project&apos;s detail page)</FormLabel>
              <FormControl>
                <Textarea rows={6} placeholder="What the project involved, the approach, the outcome…" {...field} />
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
              : "Add project"}
        </Button>
      </form>
    </Form>
  );
}
