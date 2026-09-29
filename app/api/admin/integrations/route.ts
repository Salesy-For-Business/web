import { requireAdmin } from "@/lib/admin/require-admin";
import { connectDb } from "@/lib/db";
import { jsonError, jsonOk } from "@/lib/api/http";
import { CURRENCIES } from "@/lib/currencies";
import { envVarFor, type PaidPlanTier } from "@/lib/plan-codes";
import { getAdminPlanConfigs } from "@/lib/plan-config";
import type { IntegrationCheck, IntegrationGroup } from "@/lib/admin/integrations-queries";

function has(name: string) {
  return Boolean(process.env[name]?.trim());
}

function envCheck(
  name: string,
  label: string,
  hint: string,
  { optional = false, okDetail = "Configured" } = {},
): IntegrationCheck {
  if (has(name)) return { id: name, label, status: "ok", detail: okDetail };
  return {
    id: name,
    label,
    status: optional ? "warning" : "missing",
    detail: optional ? `${name} not set — using the default` : `${name} is not set`,
    hint,
  };
}

async function databaseCheck(): Promise<IntegrationCheck> {
  if (!has("MONGODB_URI")) {
    return {
      id: "MONGODB_URI",
      label: "MongoDB",
      status: "missing",
      detail: "MONGODB_URI is not set",
      hint: "Add your MongoDB Atlas connection string as MONGODB_URI.",
    };
  }
  try {
    const mongoose = await connectDb();
    const started = Date.now();
    await mongoose.connection.db?.admin().ping();
    return {
      id: "MONGODB_URI",
      label: "MongoDB",
      status: "ok",
      detail: `Connected · ping ${Date.now() - started} ms`,
    };
  } catch {
    return {
      id: "MONGODB_URI",
      label: "MongoDB",
      status: "missing",
      detail: "Configured, but the database did not respond",
      hint: "Check the connection string and that this server's IP is allowed in Atlas Network Access.",
    };
  }
}

function paystackChecks(): IntegrationCheck[] {
  const key = process.env.PAYSTACK_SECRET_KEY?.trim() ?? "";
  const mode = key.startsWith("sk_live_") ? "live" : key.startsWith("sk_test_") ? "test" : null;
  const secretCheck: IntegrationCheck = !key
    ? {
        id: "PAYSTACK_SECRET_KEY",
        label: "Secret key",
        status: "missing",
        detail: "PAYSTACK_SECRET_KEY is not set — checkout, payouts, and billing are off",
        hint: "Copy the secret key from Paystack → Settings → API Keys & Webhooks.",
      }
    : !mode
      ? {
          id: "PAYSTACK_SECRET_KEY",
          label: "Secret key",
          status: "warning",
          detail: "Set, but it doesn't look like a Paystack secret key (sk_test_… / sk_live_…)",
          hint: "Make sure you pasted the secret key, not the public key.",
        }
      : mode === "test"
        ? {
            id: "PAYSTACK_SECRET_KEY",
            label: "Secret key",
            status: "warning",
            detail: "Test mode — no real money moves",
            hint: "Switch to the sk_live_ key before launch.",
          }
        : { id: "PAYSTACK_SECRET_KEY", label: "Secret key", status: "ok", detail: "Live mode" };

  // Paystack signs webhooks with the account's Secret Key itself — there's
  // no separate webhook secret to generate — so this mirrors `secretCheck`
  // rather than checking its own env var.
  const webhookCheck: IntegrationCheck = !key
    ? {
        id: "PAYSTACK_WEBHOOK_SIGNING",
        label: "Webhook signing",
        status: "missing",
        detail: "No secret key set — every webhook is rejected, so upgrades never activate",
        hint: "Set PAYSTACK_SECRET_KEY above, then point Paystack's webhook URL at /api/paystack/webhook.",
      }
    : {
        id: "PAYSTACK_WEBHOOK_SIGNING",
        label: "Webhook signing",
        status: "ok",
        detail: "Verified using the secret key above",
        hint: "Make sure Paystack's webhook URL (Settings → API Keys & Webhooks) points at /api/paystack/webhook.",
      };

  return [secretCheck, webhookCheck];
}

async function planCodeChecks(): Promise<IntegrationCheck[]> {
  const plans = await getAdminPlanConfigs();
  const checks: IntegrationCheck[] = [];
  for (const plan of plans) {
    if (plan.id === "free") continue;
    for (const { code } of CURRENCIES) {
      const price = plan.prices[code]?.monthly;
      const resolved = plan.planCodes[code];
      const label = `${plan.name} · ${code}`;
      const id = `plan-${plan.id}-${code}`;
      if (!price) {
        checks.push({ id, label, status: "off", detail: "No monthly price — not offered" });
      } else if (!plan.active) {
        checks.push({ id, label, status: "off", detail: "Plan is hidden from sellers" });
      } else if (resolved?.code) {
        checks.push({
          id,
          label,
          status: "ok",
          detail: resolved.source === "env" ? `From ${envVarFor(plan.id as PaidPlanTier, code)}` : "Saved from admin",
        });
      } else {
        checks.push({
          id,
          label,
          status: "missing",
          detail: "Priced, but no Paystack plan — sellers can't subscribe in this currency",
          hint: `Open Plans → ${plan.name} and click "Sync to Paystack".`,
        });
      }
    }
  }
  return checks;
}

function authSecretCheck(): IntegrationCheck {
  const secret = process.env.AUTH_SECRET ?? "";
  if (!secret) {
    return {
      id: "AUTH_SECRET",
      label: "Session signing secret",
      status: "missing",
      detail: "AUTH_SECRET is not set — nobody can sign in",
      hint: "Generate one with `openssl rand -base64 32` and set AUTH_SECRET.",
    };
  }
  if (secret.length < 32) {
    return {
      id: "AUTH_SECRET",
      label: "Session signing secret",
      status: "warning",
      detail: `Only ${secret.length} characters`,
      hint: "Use at least 32 random characters (`openssl rand -base64 32`).",
    };
  }
  return { id: "AUTH_SECRET", label: "Session signing secret", status: "ok", detail: "Configured" };
}

export async function GET() {
  try {
    const admin = await requireAdmin(["superadmin"]);
    if (!admin.ok) return jsonError(admin.error, admin.status);

    const database = await databaseCheck();
    const planCodes =
      database.status === "ok"
        ? await planCodeChecks()
        : [
            {
              id: "plan-codes",
              label: "Plan codes",
              status: "warning" as const,
              detail: "Can't read plan settings until the database is reachable",
            },
          ];

    const googleConfigured = has("GOOGLE_CLIENT_ID") && has("GOOGLE_CLIENT_SECRET");
    const cloudinaryVars = ["CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET"];
    const missingCloudinary = cloudinaryVars.filter((v) => !has(v));

    const groups: IntegrationGroup[] = [
      {
        id: "payments",
        title: "Paystack",
        description: "Checkout, seller payouts, featured listings, and subscriptions.",
        checks: paystackChecks(),
      },
      {
        id: "plan-codes",
        title: "Subscription plan codes",
        description: "One Paystack plan per paid tier and currency.",
        checks: planCodes,
      },
      {
        id: "core",
        title: "Core",
        description: "Database, sessions, and the public app URL.",
        checks: [
          database,
          authSecretCheck(),
          envCheck(
            "NEXT_PUBLIC_APP_URL",
            "Public app URL",
            "Set NEXT_PUBLIC_APP_URL to your production domain so emails and share links point to it.",
            { optional: true, okDetail: process.env.NEXT_PUBLIC_APP_URL },
          ),
        ],
      },
      {
        id: "services",
        title: "Services",
        description: "Image uploads, transactional email, and Google sign-in.",
        checks: [
          missingCloudinary.length === 0
            ? { id: "cloudinary", label: "Cloudinary", status: "ok", detail: "Configured" }
            : {
                id: "cloudinary",
                label: "Cloudinary",
                status: "missing",
                detail: `Missing ${missingCloudinary.join(", ")} — product image uploads fail`,
                hint: "Copy the cloud name, API key, and API secret from the Cloudinary console.",
              },
          envCheck(
            "BREVO_API_KEY",
            "Brevo email",
            "Create an API key in Brevo → SMTP & API and set BREVO_API_KEY. Without it, verification, reset, and billing emails aren't sent.",
          ),
          envCheck(
            "EMAIL_FROM",
            "Email sender",
            "Set EMAIL_FROM to a sender verified in Brevo, e.g. Salesy <noreply@yourdomain>.",
            { optional: true, okDetail: process.env.EMAIL_FROM },
          ),
          googleConfigured
            ? {
                id: "google",
                label: "Google sign-in",
                status: "ok",
                detail: has("GOOGLE_REDIRECT_URI")
                  ? "Configured with a fixed redirect URI"
                  : "Configured · redirect URI derived from the request",
              }
            : {
                id: "google",
                label: "Google sign-in",
                status: "warning",
                detail: "Not configured — the Google button won't work",
                hint: "Create an OAuth client in Google Cloud Console and set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.",
              },
        ],
      },
      {
        id: "jobs",
        title: "Scheduled jobs",
        description: "Daily subscription reminder emails.",
        checks: [
          envCheck(
            "CRON_SECRET",
            "Cron secret",
            "Set CRON_SECRET (Vercel Cron sends it automatically as a Bearer token). Without it anyone can trigger /api/cron/subscription-reminders.",
          ),
        ],
      },
    ];

    return jsonOk({ groups, checkedAt: new Date().toISOString() });
  } catch (err) {
    console.error("[admin/integrations GET]", err);
    return jsonError("Could not check integrations.", 500);
  }
}
