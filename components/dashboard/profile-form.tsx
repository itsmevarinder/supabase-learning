"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

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

interface ProfileFormProps {
  defaultFullName: string;
}

export function ProfileForm({ defaultFullName }: ProfileFormProps) {
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: { fullName: defaultFullName },
  });

  async function onSubmit(values: ProfileFormData) {
    setStatus("idle");
    setErrorMessage(null);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setStatus("error");
      setErrorMessage("You must be signed in.");
      return;
    }

    const [authResult, profileResult] = await Promise.all([
      supabase.auth.updateUser({ data: { full_name: values.fullName } }),
      supabase.from("profiles").update({ full_name: values.fullName }).eq("id", user.id),
    ]);

    if (authResult.error || profileResult.error) {
      setStatus("error");
      setErrorMessage(authResult.error?.message ?? profileResult.error?.message ?? "Something went wrong.");
      return;
    }

    setStatus("saved");
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-md space-y-5">
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

        {status === "saved" && <p className="text-sm text-green-600">Saved.</p>}
        {status === "error" && errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}

        <Button type="submit" className="rounded-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Saving…" : "Save changes"}
        </Button>
      </form>
    </Form>
  );
}
