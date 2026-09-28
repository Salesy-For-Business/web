"use client";

import { useState } from "react";
import clsx from "clsx";
import { Loader2, Megaphone } from "lucide-react";
import { toast } from "sonner";
import { DashboardEmptyState } from "@/components/dashboard/page-chrome";
import {
  fieldErrorClass,
  fieldLabelClass,
  inputClass,
  primaryButtonClass,
} from "@/components/auth/styles";
import { formatMoney, fromMinorUnits } from "@/lib/currencies";
import {
  getApiError,
  useFeatureProductMutation,
  type FeaturedListingDashboardData,
} from "@/lib/featured-listings-queries";

export function FeaturedListingForm({
  data,
}: {
  data: FeaturedListingDashboardData;
}) {
  const { currency, weeklyPriceMinorUnits, products, currentlyFeatured } = data;
  const [productId, setProductId] = useState(
    currentlyFeatured?.productId ?? "",
  );
  const [weeks, setWeeks] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const feature = useFeatureProductMutation();

  if (products.length === 0) {
    return (
      <DashboardEmptyState
        icon={Megaphone}
        title="Add a product first"
        description="You need at least one product in your catalog before you can pay to feature it."
        primaryHref="/dashboard/products/new"
        primaryLabel="Add product"
      />
    );
  }

  if (weeklyPriceMinorUnits == null) {
    return (
      <p className="text-[14px] text-muted">
        Featured listings aren’t available in {currency} yet — check back
        soon.
      </p>
    );
  }

  const total = fromMinorUnits(weeklyPriceMinorUnits, currency) * weeks;

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    if (!productId) {
      setError("Choose a product to feature.");
      return;
    }
    try {
      const result = await feature.mutateAsync({ productId, weeks });
      window.location.assign(result.authorizationUrl);
    } catch (err) {
      const message = getApiError(err, "Could not start payment.");
      setError(message);
      toast.error(message);
    }
  }

  return (
    <form
      className="grid gap-6 lg:grid-cols-5"
      onSubmit={onSubmit}
      noValidate
    >
      <fieldset className="space-y-3 rounded-xl border border-border bg-background p-5 lg:col-span-3">
        <legend className="px-1 text-[15px] font-medium text-heading">
          Choose a product
        </legend>
        {products.map((product) => {
          const isFeatured =
            currentlyFeatured?.productId === product.id &&
            product.featuredUntil &&
            new Date(product.featuredUntil) > new Date();
          const disabled =
            Boolean(currentlyFeatured) &&
            currentlyFeatured!.productId !== product.id;
          return (
            <label
              key={product.id}
              className={clsx(
                "flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-3 transition",
                productId === product.id
                  ? "border-primary bg-tonal"
                  : "border-border hover:bg-surface",
                disabled && "cursor-not-allowed opacity-50 hover:bg-transparent",
              )}
            >
              <input
                type="radio"
                name="feature-product"
                className="sr-only"
                checked={productId === product.id}
                disabled={disabled}
                onChange={() => setProductId(product.id)}
              />
              {product.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={product.image}
                  alt=""
                  className="size-10 shrink-0 rounded-lg object-cover"
                />
              ) : (
                <div className="size-10 shrink-0 rounded-lg bg-surface" />
              )}
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[14px] font-medium text-heading">
                  {product.name}
                </span>
                <span className="block text-[13px] text-muted">
                  {formatMoney(product.price, currency)}
                </span>
              </span>
              {isFeatured ? (
                <span className="shrink-0 rounded-full bg-tonal px-2.5 py-1 text-[11px] font-medium text-link">
                  Featured until{" "}
                  {new Date(product.featuredUntil!).toLocaleDateString()}
                </span>
              ) : null}
            </label>
          );
        })}
      </fieldset>

      <div className="h-fit space-y-5 rounded-xl border border-border bg-background p-5 lg:col-span-2">
        <div>
          <label htmlFor="feature-weeks" className={fieldLabelClass}>
            Weeks
          </label>
          <input
            id="feature-weeks"
            type="number"
            min={1}
            max={8}
            className={inputClass}
            value={weeks}
            onChange={(e) =>
              setWeeks(Math.min(8, Math.max(1, Number(e.target.value) || 1)))
            }
          />
        </div>

        <p className="text-[14px] text-muted">
          {formatMoney(fromMinorUnits(weeklyPriceMinorUnits, currency), currency)}
          {" "}× {weeks} week{weeks > 1 ? "s" : ""} ={" "}
          <span className="font-medium text-heading">
            {formatMoney(total, currency)}
          </span>
        </p>

        {error ? (
          <p className={fieldErrorClass} role="alert">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={feature.isPending}
          className={clsx(primaryButtonClass, "w-full")}
        >
          {feature.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : null}
          Pay {formatMoney(total, currency)}
        </button>

        {currentlyFeatured ? (
          <p className="text-[13px] text-muted">
            Choosing your currently featured product extends its slot instead
            of starting a new one.
          </p>
        ) : null}
      </div>
    </form>
  );
}
