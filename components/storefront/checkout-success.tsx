"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2, Star, XCircle } from "lucide-react";
import clsx from "clsx";
import { toast } from "sonner";
import { ContactChannels } from "@/components/storefront/contact-channels";
import { useStorefront } from "@/components/storefront/store-context";
import {
  fieldErrorClass,
  fieldLabelClass,
  primaryButtonClass,
  secondaryButtonClass,
  textareaClass,
} from "@/components/auth/styles";
import { api, getApiError, type ApiOk } from "@/lib/api/client";
import { useCartStore } from "@/lib/cart-store";
import { formatMoney, storePath } from "@/lib/storefront";

type OrderLine = { productId: string; name: string };

export function CheckoutSuccess() {
  const store = useStorefront();
  const params = useSearchParams();
  const reference = params.get("reference") ?? params.get("trxref") ?? "";
  const clear = useCartStore((s) => s.clear);

  const [state, setState] = useState<"loading" | "paid" | "error">("loading");
  const [orderId, setOrderId] = useState("");
  const [total, setTotal] = useState(0);
  const [error, setError] = useState("");
  const [lines, setLines] = useState<OrderLine[]>([]);

  const [productId, setProductId] = useState("");
  const [rating, setRating] = useState(5);
  const [body, setBody] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewDone, setReviewDone] = useState(false);

  useEffect(() => {
    if (!reference) {
      setState("error");
      setError("Missing payment reference.");
      return;
    }

    let cancelled = false;
    void (async () => {
      try {
        const { data } = await api.get<
          ApiOk<{
            status: string;
            orderId: string;
            total: number;
            reference: string;
            items?: { productId: string; name: string }[];
          }>
        >("/checkout/verify", { params: { reference } });
        if (cancelled) return;
        if (data.status === "paid") {
          clear();
          setOrderId(data.orderId);
          setTotal(data.total);
          const items = data.items ?? [];
          setLines(items);
          if (items.length === 1) setProductId(items[0].productId);
          setState("paid");
        } else {
          setState("error");
          setError("Payment was not confirmed.");
        }
      } catch (err) {
        if (cancelled) return;
        setState("error");
        setError(getApiError(err, "Could not verify payment."));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [reference, clear]);

  async function submitReview(event: React.FormEvent) {
    event.preventDefault();
    if (!reference) return;
    if (lines.length > 1 && !productId) {
      toast.error("Choose which product you’re reviewing.");
      return;
    }
    if (body.trim().length < 8) {
      toast.error("Write a short review (at least 8 characters).");
      return;
    }

    setReviewSubmitting(true);
    try {
      await api.post("/reviews", {
        orderReference: reference,
        productId: productId || undefined,
        rating,
        body: body.trim(),
      });
      setReviewDone(true);
      toast.success("Thanks for your review!");
    } catch (err) {
      toast.error(getApiError(err, "Could not submit review."));
    } finally {
      setReviewSubmitting(false);
    }
  }

  if (state === "loading") {
    return (
      <div className="mx-auto max-w-lg py-16 text-center">
        <Loader2 className="mx-auto size-8 animate-spin text-link" />
        <p className="mt-4 text-[14px] text-muted">Confirming your payment…</p>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="mx-auto max-w-lg text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-red-50 text-red-600 dark:bg-red-950/40">
          <XCircle className="size-8" aria-hidden />
        </div>
        <h1 className="mt-5 font-display text-[32px] tracking-tight text-heading">
          Payment not confirmed
        </h1>
        <p className="mt-3 text-[15px] leading-6 text-muted">{error}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href={storePath(store.handle, "/checkout")}
            className={clsx(primaryButtonClass, "w-auto px-6")}
          >
            Try again
          </Link>
          <Link
            href={storePath(store.handle, "/cart")}
            className={clsx(secondaryButtonClass, "w-auto px-5")}
          >
            Back to cart
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg">
      <div className="text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-500">
          <CheckCircle2 className="size-8" aria-hidden />
        </div>
        <h1 className="mt-5 font-display text-[32px] tracking-tight text-heading">
          Order placed
        </h1>
        <p className="mt-3 text-[15px] leading-6 text-muted">
          Thanks for shopping at {store.businessName}. Your payment of{" "}
          <span className="font-medium text-heading">{formatMoney(total, store.currency)}</span>{" "}
          is confirmed.
        </p>
        <p className="mt-2 text-[14px] text-muted">
          Order ref:{" "}
          <span className="font-medium text-heading">{reference || orderId}</span>
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href={storePath(store.handle)}
            className={clsx(primaryButtonClass, "w-auto px-6")}
          >
            Back to store
          </Link>
        </div>
      </div>

      <section className="mt-10 rounded-xl border border-border bg-background p-5 text-left">
        <h2 className="text-[16px] font-medium text-heading">Leave a review</h2>
        <p className="mt-1 text-[13px] text-muted">
          Help the next shopper — rate what you bought.
        </p>
        {reviewDone ? (
          <p className="mt-4 text-[14px] text-emerald-700 dark:text-emerald-400">
            Review submitted. Thank you!
          </p>
        ) : (
          <form className="mt-4 space-y-4" onSubmit={submitReview} noValidate>
            {lines.length > 1 ? (
              <div>
                <label htmlFor="review-product" className={fieldLabelClass}>
                  Product
                </label>
                <select
                  id="review-product"
                  className="h-12 w-full rounded-lg border border-border bg-background px-4 text-[16px] text-foreground"
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                >
                  <option value="">Select a product</option>
                  {lines.map((line) => (
                    <option key={line.productId} value={line.productId}>
                      {line.name}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}

            <div>
              <p className={fieldLabelClass}>Rating</p>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setRating(n)}
                    className={clsx(
                      "rounded-md p-1.5",
                      n <= rating
                        ? "text-yellow-600 dark:text-yellow-500"
                        : "text-muted",
                    )}
                    aria-label={`${n} stars`}
                  >
                    <Star
                      className={clsx(
                        "size-6",
                        n <= rating && "fill-current",
                      )}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="review-body" className={fieldLabelClass}>
                Your review
              </label>
              <textarea
                id="review-body"
                rows={3}
                className={textareaClass}
                placeholder="How was the product and delivery?"
                value={body}
                onChange={(e) => setBody(e.target.value)}
              />
              {body.trim().length > 0 && body.trim().length < 8 ? (
                <p className={fieldErrorClass}>At least 8 characters.</p>
              ) : null}
            </div>

            <button
              type="submit"
              disabled={reviewSubmitting}
              className={clsx(secondaryButtonClass, "w-full")}
            >
              {reviewSubmitting ? "Submitting…" : "Submit review"}
            </button>
          </form>
        )}
      </section>

      <div className="mt-10">
        <ContactChannels />
      </div>
    </div>
  );
}
