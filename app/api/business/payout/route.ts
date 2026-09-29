import { connectDb, Business, User } from "@/lib/db";
import { requireOwnedBusiness } from "@/lib/auth/owned-business";
import { createSubaccount } from "@/lib/paystack";
import { commissionPercentFor } from "@/lib/plan-config";
import { payoutSchema } from "@/lib/payout-schemas";
import { jsonError, jsonOk } from "@/lib/api/http";
import { statusFor, toPublicBusiness, toPublicUser } from "@/lib/auth/session-user";

/**
 * One-time setup: saves a business's bank details and creates its Paystack
 * subaccount, charged at the current plan's admin-configured commission
 * (plan changes later update it via `updateSubaccountPercentageCharge`). Required before a store can accept orders — see the
 * `paystackSubaccountCode` gate in `/api/checkout/initialize`.
 */
export async function POST(request: Request) {
  try {
    const owned = await requireOwnedBusiness();
    if (!owned.ok) return jsonError(owned.error, owned.status);

    if (owned.business.paystackSubaccountCode) {
      return jsonError("Payout details are already set up.", 409);
    }

    const body = await request.json();
    const parsed = payoutSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(
        parsed.error.issues[0]?.message ?? "Invalid payout details",
      );
    }
    const values = parsed.data;
    const billingCurrency = values.syncCurrencies
      ? values.storeCurrency
      : values.billingCurrency;

    await connectDb();

    const percentageCharge = await commissionPercentFor(owned.business.plan);
    const subaccount = await createSubaccount({
      businessName: owned.business.businessName,
      bankCode: values.bankCode,
      accountNumber: values.accountNumber,
      percentageCharge,
    });

    const updated = await Business.findByIdAndUpdate(
      owned.business._id,
      {
        storeCurrency: values.storeCurrency,
        billingCurrency,
        syncCurrencies: values.syncCurrencies,
        bankAccountName: values.accountName,
        bankAccountNumber: values.accountNumber,
        bankCode: values.bankCode,
        bankCountry: values.bankCountry.toUpperCase(),
        paystackSubaccountCode: subaccount.subaccount_code,
        paystackSubaccountPercentageCharge: percentageCharge,
      },
      { new: true },
    ).lean();
    if (!updated) return jsonError("Business not found.", 404);

    const user = await User.findById(owned.userId).lean();
    if (!user) return jsonError("Sign in to continue.", 401);

    return jsonOk({
      next: statusFor(user, updated),
      user: toPublicUser(user),
      business: toPublicBusiness(updated),
    });
  } catch (err) {
    console.error("[business/payout]", err);
    const message =
      err instanceof Error ? err.message : "Could not save payout details.";
    return jsonError(message, 500);
  }
}
