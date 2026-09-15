"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import clsx from "clsx";
import { ContactChannels } from "@/components/storefront/contact-channels";
import { useStorefront } from "@/components/storefront/store-context";
import { primaryButtonClass, secondaryButtonClass } from "@/components/auth/styles";
import { api, getApiError, type ApiOk } from "@/lib/api/client";
import { useCartStore } from "@/lib/cart-store";
import { formatNaira, storePath } from "@/lib/storefront";

export function CheckoutSuccess() {
  const store = useStorefront();
  const params = useSearchParams();
  const reference = params.get("reference") ?? params.get("trxref") ?? "";
  const clear = useCartStore((s) => s.clear);

  const [state, setState] = useState<"loading" | "paid" | "error">("loading");
  const [orderId, setOrderId] = useState("");
  const [total, setTotal] = useState(0);
  const [error, setError] = useState("");

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
          }>
        >("/checkout/verify", { params: { reference } });
        if (cancelled) return;
        if (data.status === "paid") {
          clear();
          setOrderId(data.orderId);
          setTotal(data.total);
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
    <div className="mx-auto max-w-lg text-center">
      <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-500">
        <CheckCircle2 className="size-8" aria-hidden />
      </div>
      <h1 className="mt-5 font-display text-[32px] tracking-tight text-heading">
        Order placed
      </h1>
      <p className="mt-3 text-[15px] leading-6 text-muted">
        Thanks for shopping at {store.businessName}. Your payment of{" "}
        <span className="font-medium text-heading">{formatNaira(total)}</span>{" "}
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
      <div className="mt-10 text-left">
        <ContactChannels />
      </div>
    </div>
  );
}
