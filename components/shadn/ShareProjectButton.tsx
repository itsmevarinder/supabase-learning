"use client";

import { useState } from "react";
import { Check, Share2 } from "lucide-react";

export function ShareProjectButton() {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access can be blocked (permissions, insecure context, etc.)
      // — failing silently is fine, the button just won't confirm the copy.
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className="flex w-full items-center justify-between border-t pt-4 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
    >
      {copied ? "Link copied!" : "Share this project"}
      {copied ? <Check className="h-4 w-4 text-green-600" /> : <Share2 className="h-4 w-4" />}
    </button>
  );
}
