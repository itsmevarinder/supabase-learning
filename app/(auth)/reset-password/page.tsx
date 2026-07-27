"use client";

import { useState } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { MailCheck } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

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
import {
  resetPasswordSchema,
  type ResetPasswordFormData,
} from "@/schemas/reset-password-schema";

export default function ResetPasswordPage() {
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { email: "" },
  });

  function onSubmit(values: ResetPasswordFormData) {
    setSubmittedEmail(values.email);
    toast.success("Reset link sent, if that account exists.");
  }

  if (submittedEmail) {
    return (
      <div className="text-center">
        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <MailCheck className="size-6" />
        </div>
        <h1 className="text-4xl font-bold">Check your email</h1>
        <p className="mt-2 text-muted-foreground">
          If an account exists for <span className="font-medium text-foreground">{submittedEmail}</span>,
          we&apos;ve sent a link to reset your password.
        </p>

        <p className="mt-8 text-sm">
          <Link href="/login" className="font-medium text-primary hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Reset your password</h1>
        <p className="mt-2 text-muted-foreground">
          Enter the email address associated with your account and we&apos;ll send you a link to reset your
          password.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="you@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full rounded-full py-5"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? "Sending link…" : "Send reset link"}
          </Button>
        </form>
      </Form>

      <p className="mt-8 text-center text-sm">
        <span className="text-muted-foreground">Remember your password?</span>{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
