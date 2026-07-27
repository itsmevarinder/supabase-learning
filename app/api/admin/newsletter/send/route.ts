import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

import { renderNewsletterEmail, renderNewsletterEmailText } from "@/lib/email/newsletter-template";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.app_metadata?.role !== "admin") {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const { data: cooldownRow } = await supabase
    .from("newsletter_section")
    .select("last_sent_at")
    .eq("id", 1)
    .single();

  const cooldownMs = 5 * 60 * 1000;
  if (cooldownRow?.last_sent_at) {
    const elapsed = Date.now() - new Date(cooldownRow.last_sent_at).getTime();
    if (elapsed < cooldownMs) {
      const waitSeconds = Math.ceil((cooldownMs - elapsed) / 1000);
      return NextResponse.json(
        { error: `Please wait ${waitSeconds}s before sending another newsletter.` },
        { status: 429 }
      );
    }
  }

  const { subject, message, emails } = await request.json();

  if (typeof subject !== "string" || !subject.trim() || typeof message !== "string" || !message.trim()) {
    return NextResponse.json({ error: "Subject and message are required" }, { status: 400 });
  }

  const gmailUser = process.env.GMAIL_USER;
  const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;
  if (!gmailUser || !gmailAppPassword) {
    return NextResponse.json({ error: "Email sending isn't set up yet" }, { status: 503 });
  }

  let subscribersQuery = supabase.from("newsletter_subscribers").select("email").eq("is_active", true);
  if (Array.isArray(emails) && emails.length > 0) {
    subscribersQuery = subscribersQuery.in("email", emails);
  }
  const { data: subscribers, error } = await subscribersQuery;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!subscribers?.length) {
    return NextResponse.json({ error: "No subscribers to send to" }, { status: 400 });
  }

  // Mark the cooldown as started before sending (not after) so two rapid
  // requests can't both slip past the check while the first is still in flight.
  await supabase.from("newsletter_section").update({ last_sent_at: new Date().toISOString() }).eq("id", 1);

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: gmailUser, pass: gmailAppPassword },
  });
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;

  let sent = 0;
  let firstError: string | undefined;

  for (const { email } of subscribers) {
    const unsubscribeUrl = `${siteUrl}/api/newsletter/unsubscribe?email=${encodeURIComponent(email)}`;

    try {
      await transporter.sendMail({
        from: `"Newsletter" <${gmailUser}>`,
        to: email,
        subject,
        text: renderNewsletterEmailText({ subject, message, siteUrl, unsubscribeUrl }),
        html: renderNewsletterEmail({ subject, message, siteUrl, unsubscribeUrl }),
        headers: { "List-Unsubscribe": `<${unsubscribeUrl}>` },
      });
      sent += 1;
    } catch (sendError) {
      const messageText = sendError instanceof Error ? sendError.message : "Failed to send";
      console.error(`Failed to send newsletter to ${email}:`, messageText);
      firstError ??= messageText;
    }
  }

  const failed = subscribers.length - sent;

  await supabase.from("newsletter_sends").insert({
    subject,
    sent_count: sent,
    failed_count: failed,
    total_count: subscribers.length,
  });

  return NextResponse.json({ sent, failed, total: subscribers.length, firstError });
}
