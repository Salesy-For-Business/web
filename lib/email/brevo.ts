type BrevoSendResult = { ok: true } | { ok: false; error: string };

/**
 * Send transactional email via Brevo.
 * Falls back to console log in development when BREVO_API_KEY is missing.
 */
export async function sendBrevoEmail(input: {
  toEmail: string;
  toName?: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
}): Promise<BrevoSendResult> {
  const apiKey = process.env.BREVO_API_KEY;
  const from = process.env.EMAIL_FROM || "Salesy <noreply@salesy.link>";

  if (!apiKey) {
    if (process.env.NODE_ENV !== "production") {
      console.info("[email:dev]", {
        to: input.toEmail,
        subject: input.subject,
        text: input.textContent,
      });
      return { ok: true };
    }
    return { ok: false, error: "Email is not configured." };
  }

  const match = from.match(/^(.*)<([^>]+)>$/);
  const senderName = match?.[1]?.trim() || "Salesy";
  const senderEmail = match?.[2]?.trim() || from.trim();

  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "api-key": apiKey,
    },
    body: JSON.stringify({
      sender: { name: senderName, email: senderEmail },
      to: [{ email: input.toEmail, name: input.toName }],
      subject: input.subject,
      htmlContent: input.htmlContent,
      textContent: input.textContent,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error("[brevo]", res.status, body);
    return { ok: false, error: "Could not send email. Try again." };
  }

  return { ok: true };
}

export async function sendOtpEmail(
  email: string,
  code: string,
  purpose: "signup" | "reset",
) {
  const subject =
    purpose === "signup"
      ? `${code} is your Salesy verification code`
      : `${code} is your Salesy password reset code`;

  const htmlContent = `
    <div style="font-family:Arial,sans-serif;line-height:1.5;color:#202124">
      <p>Your Salesy code is:</p>
      <p style="font-size:28px;letter-spacing:4px;font-weight:bold">${code}</p>
      <p>This code expires in 15 minutes. If you didn’t request it, you can ignore this email.</p>
    </div>
  `;

  return sendBrevoEmail({
    toEmail: email,
    subject,
    htmlContent,
    textContent: `Your Salesy code is ${code}. It expires in 15 minutes.`,
  });
}

export async function sendSubscriptionRenewalReminderEmail(input: {
  email: string;
  businessName: string;
  planLabel: string;
  renewsAt: Date;
  amountLabel: string;
}) {
  const dateLabel = input.renewsAt.toLocaleDateString("en-NG", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const subject = `Your ${input.planLabel} plan renews on ${dateLabel}`;
  const htmlContent = `
    <div style="font-family:Arial,sans-serif;line-height:1.5;color:#202124">
      <p>Hi ${input.businessName},</p>
      <p>Your Salesy ${input.planLabel} subscription renews on <strong>${dateLabel}</strong> for ${input.amountLabel}.</p>
      <p>No action needed if your card on file is up to date. If it's expired or you'd like to update it, visit your dashboard's billing settings before then.</p>
    </div>
  `;
  return sendBrevoEmail({
    toEmail: input.email,
    subject,
    htmlContent,
    textContent: `Your Salesy ${input.planLabel} subscription renews on ${dateLabel} for ${input.amountLabel}.`,
  });
}

export async function sendSubscriptionPaymentFailedEmail(input: {
  email: string;
  businessName: string;
  planLabel: string;
}) {
  const subject = `Your ${input.planLabel} payment failed — you're back on the Free plan`;
  const htmlContent = `
    <div style="font-family:Arial,sans-serif;line-height:1.5;color:#202124">
      <p>Hi ${input.businessName},</p>
      <p>We couldn't charge your card for your ${input.planLabel} subscription, so your store has moved back to the Free plan (5% platform fee on sales).</p>
      <p>You can retry anytime from your dashboard's billing settings once your card is ready — your store keeps selling in the meantime, just on Free-plan terms.</p>
    </div>
  `;
  return sendBrevoEmail({
    toEmail: input.email,
    subject,
    htmlContent,
    textContent: `We couldn't charge your card for your ${input.planLabel} subscription, so your store has moved back to the Free plan. Retry anytime from your dashboard.`,
  });
}
