interface NewsletterEmailParams {
  subject: string;
  message: string;
  siteUrl: string;
}

export function renderNewsletterEmail({ subject, message, siteUrl }: NewsletterEmailParams): string {
  const bodyHtml = message
    .split("\n")
    .filter((line) => line.trim().length > 0)
    .map(
      (line) =>
        `<p style="margin:0 0 16px;font-size:16px;line-height:1.7;color:#3f3f46;">${line}</p>`
    )
    .join("");

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  </head>
  <body style="margin:0;padding:0;background-color:#ffffff;font-family:Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#ffffff;">
      <tr>
        <td align="center" style="padding:48px 16px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">
            <tr>
              <td style="padding-bottom:28px;">
                <h1 style="margin:0;font-size:22px;line-height:1.3;color:#18181b;">${subject}</h1>
              </td>
            </tr>

            <tr>
              <td>${bodyHtml}</td>
            </tr>

            <tr>
              <td style="padding:12px 0 32px;">
                <a
                  href="${siteUrl}"
                  style="font-size:14px;font-weight:600;color:#d97706;text-decoration:none;"
                >
                  Visit our site &rarr;
                </a>
              </td>
            </tr>

            <tr>
              <td style="padding-top:24px;border-top:1px solid #e4e4e7;">
                <p style="margin:0;font-size:12px;line-height:1.6;color:#a1a1aa;">
                  You&rsquo;re receiving this email because you subscribed on our website.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
