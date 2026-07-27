"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function NewsletterComposeForm() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [resultText, setResultText] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setStatus("sending");
    setResultText(null);

    const response = await fetch("/api/admin/newsletter/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject, message }),
    });

    const data = await response.json();

    if (!response.ok) {
      setStatus("error");
      setResultText(data.error ?? "Something went wrong.");
      return;
    }

    setStatus("sent");
    setResultText(`Sent to ${data.sent} of ${data.total} subscriber${data.total === 1 ? "" : "s"}.`);
    setSubject("");
    router.push("/admin/newsletter");
    setMessage("");
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

      {status === "sent" && resultText && <p className="text-sm text-green-600">{resultText}</p>}
      {status === "error" && resultText && <p className="text-sm text-destructive">{resultText}</p>}

      <Button type="submit" className="rounded-full" disabled={status === "sending"}>
        {status === "sending" ? "Sending…" : "Send to all subscribers"}
      </Button>
    </form>
  );
}
