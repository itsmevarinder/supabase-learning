"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

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
import { pricingPlanSchema, type PricingPlanFormData } from "@/schemas/pricing-plan-schema";
import type { PricingPlanRow } from "@/components/shadn/PricingSection";

interface PricingPlanFormProps {
  plan: PricingPlanRow;
}

export function PricingPlanForm({ plan }: PricingPlanFormProps) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const form = useForm<PricingPlanFormData>({
    resolver: zodResolver(pricingPlanSchema),
    defaultValues: {
      title: plan.title,
      price: plan.price,
      description: plan.description ?? "",
      features: (plan.features ?? []).join("\n"),
      isFeatured: plan.is_featured,
      buttonText: plan.button_text ?? "",
    },
  });

  async function onSubmit(values: PricingPlanFormData) {
    setStatus("idle");
    setErrorMessage(null);

    const supabase = createClient();
    const features = (values.features ?? "")
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    const { error } = await supabase
      .from("pricing_plans")
      .update({
        title: values.title,
        price: values.price,
        description: values.description || null,
        features,
        is_featured: values.isFeatured,
        button_text: values.buttonText || null,
      })
      .eq("id", plan.id);

    if (error) {
      setStatus("error");
      setErrorMessage(error.message);
      return;
    }

    router.push("/admin/pricing");
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
                  <Input placeholder="Pro" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price</FormLabel>
                <FormControl>
                  <Input placeholder="$59 or Custom" {...field} />
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
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input placeholder="Best for growing businesses" {...field} />
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
              <FormLabel>Features (one per line)</FormLabel>
              <FormControl>
                <Textarea rows={6} placeholder={"Unlimited Projects\nPriority Support"} {...field} />
              </FormControl>
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
                <Input placeholder="Start Free Trial" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isFeatured"
          render={({ field }) => (
            <FormItem className="group flex flex-row items-center gap-2 space-y-0">
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <FormLabel className="font-normal">Featured (highlighted as &ldquo;Most Popular&rdquo;)</FormLabel>
              <FormMessage />
            </FormItem>
          )}
        />

        {status === "error" && errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}

        <Button type="submit" className="w-fit rounded-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Saving…" : "Save changes"}
        </Button>
      </form>
    </Form>
  );
}
