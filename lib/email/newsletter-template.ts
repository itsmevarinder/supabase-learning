interface NewsletterEmailParams {
  subject: string;
  message: string;
  siteUrl: string;
  unsubscribeUrl: string;
}

export function renderNewsletterEmail({ subject, message }: NewsletterEmailParams): string {
  const messageHtml = message
    .split("\n")
    .filter((line) => line.trim().length > 0)
    .join("<br>");

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>

  <style>
    body {
      margin: 0;
      padding: 0;
      background: #f3f5f7;
      font-family: Arial, Helvetica, sans-serif;
      color: #1f2937;
    }

    .email-wrapper {
      width: 100%;
      padding: 48px 16px;
      box-sizing: border-box;
    }

    .email-container {
      width: 100%;
      max-width: 600px;
      margin: 0 auto;
      background: #ffffff;
      border: 1px solid #e5e7eb;
      border-radius: 10px;
      overflow: hidden;
    }

    /* Header */
    .email-header {
      padding: 26px 34px;
      border-bottom: 1px solid #eef0f2;
    }

    .header-table {
      width: 100%;
      border-collapse: collapse;
    }

    .brand {
      font-size: 16px;
      font-weight: 700;
      letter-spacing: -0.2px;
      color: #111827;
    }

    .brand-mark {
      display: inline-block;
      width: 8px;
      height: 8px;
      margin-right: 8px;
      background: #2563eb;
      border-radius: 50%;
    }

    .notification-badge {
      display: inline-block;
      padding: 6px 10px;
      border: 1px solid #dbeafe;
      border-radius: 20px;
      background: #eff6ff;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      color: #2563eb;
    }

    /* Main content */
    .email-content {
      padding: 38px 34px 40px;
    }

    .eyebrow {
      margin: 0 0 10px;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.8px;
      text-transform: uppercase;
      color: #9ca3af;
    }

    .title {
      margin: 0 0 12px;
      font-size: 26px;
      font-weight: 600;
      line-height: 1.3;
      letter-spacing: -0.5px;
      color: #111827;
    }

    .intro {
      margin: 0 0 32px;
      font-size: 15px;
      line-height: 1.7;
      color: #6b7280;
    }

    /* Subject */
    .subject-section {
      padding-bottom: 26px;
      border-bottom: 1px solid #eef0f2;
    }

    .label {
      display: block;
      margin-bottom: 9px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.8px;
      text-transform: uppercase;
      color: #9ca3af;
    }

    .subject {
      margin: 0;
      font-size: 19px;
      font-weight: 600;
      line-height: 1.5;
      color: #111827;
    }

    /* Message */
    .message-section {
      padding-top: 26px;
    }

    .message-box {
      padding: 20px 22px;
      background: #fafafa;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
    }

    .message {
      margin: 0;
      font-size: 15px;
      line-height: 1.8;
      color: #4b5563;
    }

    /* Footer */
    .email-footer {
      padding: 22px 34px;
      background: #fafafa;
      border-top: 1px solid #eef0f2;
      text-align: center;
      font-size: 12px;
      line-height: 1.7;
      color: #9ca3af;
    }

    @media only screen and (max-width: 600px) {

      .email-wrapper {
        padding: 20px 10px;
      }

      .email-header,
      .email-content {
        padding-left: 22px;
        padding-right: 22px;
      }

      .email-footer {
        padding-left: 22px;
        padding-right: 22px;
      }

      .notification-badge {
        font-size: 10px;
      }

      .title {
        font-size: 23px;
      }

      .subject {
        font-size: 18px;
      }

    }
  </style>

</head>

<body>

  <div class="email-wrapper">

    <div class="email-container">

      <!-- Header -->
      <div class="email-header">

        <table class="header-table" role="presentation">
          <tr>
            <td align="left">
              <div class="brand">
                <span class="brand-mark"></span>
                CMS
              </div>
            </td>

            <td align="right">
              <span class="notification-badge">
                Notification
              </span>
            </td>
          </tr>
        </table>

      </div>

      <!-- Content -->
      <div class="email-content">

        <p class="eyebrow">
          Admin message
        </p>

        <h1 class="title">
          You have a new notification
        </h1>

        <p class="intro">
          An administrator has sent you a new message. Please review the details below.
        </p>

        <!-- Subject -->
        <div class="subject-section">

          <span class="label">
            Subject
          </span>

          <p class="subject">
            ${subject}
          </p>

        </div>

        <!-- Message -->
        <div class="message-section">

          <span class="label">
            Message
          </span>

          <div class="message-box">

            <p class="message">
              ${messageHtml}
            </p>

          </div>

        </div>

      </div>

      <!-- Footer -->
      <div class="email-footer">

        This is an automated notification from Your Company.<br>
        Please do not reply to this email.

      </div>

    </div>

  </div>

</body>
</html>`;
}

export function renderNewsletterEmailText({ subject, message, siteUrl, unsubscribeUrl }: NewsletterEmailParams): string {
  return [
    subject,
    "",
    message,
    "",
    `Visit our site: ${siteUrl}`,
    "",
    "You're receiving this email because you subscribed on our website.",
    `Unsubscribe: ${unsubscribeUrl}`,
  ].join("\n");
}
