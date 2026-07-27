"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Subscriber {
  id: string;
  email: string;
}

interface NewsletterComposeFormProps {
  subscribers: Subscriber[];
}

export function NewsletterComposeForm({ subscribers }: NewsletterComposeFormProps) {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [selectedEmails, setSelectedEmails] = useState<Set<string>>(
    () => new Set(subscribers.map((s) => s.email))
  );
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "sending">("idle");

  const allSelected = selectedEmails.size === subscribers.length && subscribers.length > 0;
  const noneSelected = selectedEmails.size === 0;

  function toggleAll(checked: boolean) {
    setSelectedEmails(checked ? new Set(subscribers.map((s) => s.email)) : new Set());
  }

  function toggleOne(email: string, checked: boolean) {
    setSelectedEmails((prev) => {
      const next = new Set(prev);
      if (checked) next.add(email);
      else next.delete(email);
      return next;
    });
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (noneSelected) {
      toast.error("Select at least one subscriber to send to.");
      return;
    }

    setStatus("sending");

    const response = await fetch("/api/admin/newsletter/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject, message, emails: Array.from(selectedEmails) }),
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
    <form onSubmit={handleSubmit} className="w-full space-y-5">
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

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Recipients</Label>
          <span className="text-xs text-muted-foreground">
            {selectedEmails.size} of {subscribers.length} selected
          </span>
        </div>

        {subscribers.length === 0 ? (
          <p className="text-sm text-muted-foreground">No active subscribers yet.</p>
        ) : (
          <div className="rounded-lg border">
            <label className="flex items-center gap-2.5 border-b px-3 py-2.5 text-sm font-medium">
              <Checkbox checked={allSelected} onCheckedChange={(checked) => toggleAll(Boolean(checked))} />
              Select all
            </label>
            <div className="max-h-48 space-y-0.5 overflow-y-auto p-1.5">
              {subscribers.map((subscriber) => (
                <label
                  key={subscriber.id}
                  className="flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm hover:bg-muted/50"
                >
                  <Checkbox
                    checked={selectedEmails.has(subscriber.email)}
                    onCheckedChange={(checked) => toggleOne(subscriber.email, Boolean(checked))}
                  />
                  {subscriber.email}
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      <Button type="submit" className="rounded-full" disabled={status === "sending" || subscribers.length === 0}>
        {status === "sending" ? "Sending…" : `Send to ${selectedEmails.size} subscriber${selectedEmails.size === 1 ? "" : "s"}`}
      </Button>
    </form>
  );
}
