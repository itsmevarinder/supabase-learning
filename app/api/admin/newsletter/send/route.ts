import { NextResponse } from "next/server";
import { Resend } from "resend";

import { renderNewsletterEmail } from "@/lib/email/newsletter-template";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.app_metadata?.role !== "admin") {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const { subject, message } = await request.json();

  if (typeof subject !== "string" || !subject.trim() || typeof message !== "string" || !message.trim()) {
    return NextResponse.json({ error: "Subject and message are required" }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Email sending isn't set up yet" }, { status: 503 });
  }

  const { data: subscribers, error } = await supabase
    .from("newsletter_subscribers")
    .select("email")
    .eq("is_active", true);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!subscribers?.length) {
    return NextResponse.json({ error: "No subscribers to send to" }, { status: 400 });
  }

  const resend = new Resend(apiKey);
  const from = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
  const html = renderNewsletterEmail({ subject, message, siteUrl: new URL(request.url).origin });

  const results = [];
  for (const { email } of subscribers) {
    results.push(await resend.emails.send({ from, to: email, subject, html }));
  }

  const sent = results.filter((result) => !result.error).length;
  const failed = results.length - sent;

  return NextResponse.json({ sent, failed, total: results.length });
}
