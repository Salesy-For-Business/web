import { createHmac, timingSafeEqual } from "crypto";
import { jsonError, jsonOk } from "@/lib/api/http";
import { markOrderPaid } from "@/lib/orders";

export async function POST(request: Request) {
  try {
    const secret = process.env.PAYSTACK_WEBHOOK_SECRET;
    const raw = await request.text();

    if (secret) {
      const signature = request.headers.get("x-paystack-signature") ?? "";
      const hash = createHmac("sha512", secret).update(raw).digest("hex");
      const a = Buffer.from(hash);
      const b = Buffer.from(signature);
      if (a.length !== b.length || !timingSafeEqual(a, b)) {
        return jsonError("Invalid signature.", 401);
      }
    }

    const event = JSON.parse(raw) as {
      event?: string;
      data?: { reference?: string; status?: string };
    };

    if (
      event.event === "charge.success" &&
      event.data?.reference &&
      event.data.status === "success"
    ) {
      await markOrderPaid(event.data.reference);
    }

    return jsonOk({ received: true });
  } catch (err) {
    console.error("[paystack/webhook]", err);
    return jsonError("Webhook failed.", 500);
  }
}
