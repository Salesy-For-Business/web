"use client";

import { useState } from "react";
import clsx from "clsx";
import { CheckCircle2, Circle, Loader2, Megaphone } from "lucide-react";
import { toast } from "sonner";
import { DashboardEmptyState } from "@/components/dashboard/page-chrome";
import {
  fieldErrorClass,
  fieldLabelClass,
  inputClass,
  primaryButtonClass,
  secondaryButtonClass,
} from "@/components/auth/styles";
import { formatMoney, fromMinorUnits } from "@/lib/currencies";
import {
  getApiError,
  useFeatureProductMutation,
  type FeaturedListingDashboardData,
} from "@/lib/featured-listings-queries";

function CurrentlyFeaturedCard({
  data,
}: {
  data: FeaturedListingDashboardData;
}) {
  const { currentlyFeatured, products, currency } = data;
  const product = currentlyFeatured
    ? products.find((p) => p.id === currentlyFeatured.productId)
    : null;

  if (!currentlyFeatured || !product) {
    return (
      <p className="text-[14px] text-muted">
        You don’t have a featured product right now.
      </p>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-background px-4 py-3">
      {product.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={product.image}
          alt=""
          className="size-12 shrink-0 rounded-lg object-cover"
        />
      ) : (
        <div className="size-12 shrink-0 rounded-lg bg-surface" />
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-[14px] font-medium text-heading">
          {product.name}
        </p>
        <p className="text-[13px] text-muted">
          {formatMoney(product.price, currency)}
        </p>
      </div>
      <span className="shrink-0 rounded-full bg-tonal px-2.5 py-1 text-[11px] font-medium text-link">
        Featured until {new Date(currentlyFeatured.featuredUntil).toLocaleDateString()}
      </span>
    </div>
  );
}

function FeaturedListingOverview({
  data,
  onStartFeaturing,
}: {
  data: FeaturedListingDashboardData;
  onStartFeaturing: () => void;
}) {
  return (
    <div className="rounded-xl border border-border bg-background p-5">
      <h2 className="text-[15px] font-medium text-heading">
        Featured products
      </h2>
      <div className="mt-4">
        <CurrentlyFeaturedCard data={data} />
      </div>
      <button
        type="button"
        onClick={onStartFeaturing}
        className={clsx(primaryButtonClass, "mt-5 w-auto min-w-52 px-6")}
      >
        {data.currentlyFeatured ? "Feature another product" : "Feature a product"}
      </button>
    </div>
  );
}

function FeatureProductPicker({
  data,
  onBack,
}: {
  data: FeaturedListingDashboardData;
  onBack: () => void;
}) {
  const { currency, weeklyPriceMinorUnits, products, currentlyFeatured } = data;
  // The active featured product isn't offered here — it's already taken.
  const selectable = products.filter(
    (p) => p.id !== currentlyFeatured?.productId,
  );
  const [productId, setProductId] = useState("");
  const [weeks, setWeeks] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const feature = useFeatureProductMutation();

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
    <form className="grid gap-6 lg:grid-cols-5" onSubmit={onSubmit} noValidate>
      <fieldset className="space-y-3 rounded-xl border border-border bg-background p-5 lg:col-span-3">
        <div className="flex items-center justify-between px-1">
          <legend className="text-[15px] font-medium text-heading">
            Choose a product
          </legend>
          <button
            type="button"
            onClick={onBack}
            className="text-[13px] font-medium text-link hover:underline"
          >
            Back
          </button>
        </div>

        {selectable.length === 0 ? (
          <p className="px-1 text-[14px] text-muted">
            No other products available to feature right now.
          </p>
        ) : (
          selectable.map((product) => {
            const selected = productId === product.id;
            return (
              <button
                key={product.id}
                type="button"
                onClick={() => setProductId(product.id)}
                className={clsx(
                  "flex w-full items-center gap-3 rounded-lg border px-3 py-3 text-left transition",
                  selected
                    ? "border-primary bg-tonal"
                    : "border-border hover:bg-surface",
                )}
              >
                {selected ? (
                  <CheckCircle2
                    className="size-5 shrink-0 text-link"
                    aria-hidden
                  />
                ) : (
                  <Circle className="size-5 shrink-0 text-muted" aria-hidden />
                )}
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
              </button>
            );
          })
        )}
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
          disabled={feature.isPending || !productId}
          className={clsx(primaryButtonClass, "w-full")}
        >
          {feature.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : null}
          Pay {formatMoney(total, currency)}
        </button>

        <button
          type="button"
          onClick={onBack}
          className={clsx(secondaryButtonClass, "w-full")}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export function FeaturedListingForm({
  data,
}: {
  data: FeaturedListingDashboardData;
}) {
  const [view, setView] = useState<"overview" | "select">("overview");

  if (data.products.length === 0) {
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

  if (view === "select") {
    return (
      <FeatureProductPicker data={data} onBack={() => setView("overview")} />
    );
  }

  return (
    <FeaturedListingOverview
      data={data}
      onStartFeaturing={() => setView("select")}
    />
  );
}
