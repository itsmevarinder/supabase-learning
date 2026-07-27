"use client";

import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
import { faqSchema, type FaqFormData } from "@/schemas/faq-schema";
import type { FaqRow } from "@/components/shadn/Accordion";

function defaultsFromFaq(faq?: FaqRow): FaqFormData {
  if (!faq) {
    return {
      question: "",
      answer: "",
      isActive: true,
      sortOrder: 0,
    };
  }

  return {
    question: faq.question,
    answer: faq.answer,
    isActive: faq.is_active,
    sortOrder: faq.sort_order,
  };
}

interface FaqFormProps {
  /** Present when editing an existing row — absent means "create new". */
  faq?: FaqRow;
}

export function FaqForm({ faq }: FaqFormProps) {
  const isEditing = Boolean(faq);
  const router = useRouter();

  const form = useForm<FaqFormData>({
    resolver: zodResolver(faqSchema),
    defaultValues: defaultsFromFaq(faq),
  });

  async function onSubmit(values: FaqFormData) {
    const supabase = createClient();
    const record = {
      question: values.question,
      answer: values.answer,
      is_active: values.isActive,
      sort_order: values.sortOrder,
    };

    const { error } = isEditing
      ? await supabase.from("faqs").update(record).eq("id", faq!.id)
      : await supabase.from("faqs").insert(record);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success(isEditing ? "FAQ updated." : "FAQ added.");
    router.push("/admin/faqs");
    router.refresh();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-5">
        <FormField
          control={form.control}
          name="question"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Question</FormLabel>
              <FormControl>
                <Input placeholder="How do I get started?" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="answer"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Answer</FormLabel>
              <FormControl>
                <Textarea rows={4} placeholder="Simply create an account and…" {...field} />
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
              : "Add FAQ"}
        </Button>
      </form>
    </Form>
  );
}
