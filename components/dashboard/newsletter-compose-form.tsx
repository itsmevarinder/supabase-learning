"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function NewsletterComposeForm() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "sending">("idle");

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setStatus("sending");

    const response = await fetch("/api/admin/newsletter/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject, message }),
    });

    const data = await response.json();

    if (!response.ok) {
      setStatus("idle");
      toast.error(data.error ?? "Something went wrong.");
      return;
    }

    toast.success(`Sent to ${data.sent} of ${data.total} subscriber${data.total === 1 ? "" : "s"}.`);
    setSubject("");
    setMessage("");
    router.push("/admin/newsletter");
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-5">
      <div className="space-y-2">
        <Label htmlFor="newsletter-subject">Subject</Label>
        <Input
          id="newsletter-subject"
          value={subject}
          onChange={(event) => setSubject(event.target.value)}
          placeholder="What's new this month"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="newsletter-message">Message</Label>
        <Textarea
          id="newsletter-message"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Write your update here…"
          rows={8}
          required
        />
      </div>

      <Button type="submit" className="rounded-full" disabled={status === "sending"}>
        {status === "sending" ? "Sending…" : "Send to all subscribers"}
      </Button>
    </form>
  );
}
