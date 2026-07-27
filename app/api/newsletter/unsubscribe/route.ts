import { NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";

function htmlPage(message: string) {
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Unsubscribe</title>
  </head>
  <body style="margin:0;padding:0;font-family:Helvetica,Arial,sans-serif;background-color:#ffffff;">
    <div style="max-width:420px;margin:80px auto;padding:0 24px;text-align:center;">
      <p style="font-size:16px;line-height:1.6;color:#18181b;">${message}</p>
    </div>
  </body>
</html>`;
}

export async function GET(request: Request) {
  const email = new URL(request.url).searchParams.get("email");

  if (!email) {
    return new NextResponse(htmlPage("Missing email address."), {
      status: 400,
      headers: { "Content-Type": "text/html" },
    });
  }

  const supabase = createAdminClient();
  await supabase.from("newsletter_subscribers").update({ is_active: false }).eq("email", email);

  return new NextResponse(htmlPage(`You&rsquo;ve been unsubscribed (${email}). You won&rsquo;t receive any more emails from us.`), {
    status: 200,
    headers: { "Content-Type": "text/html" },
  });
}
