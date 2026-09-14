"use client";

import { useState } from "react";
import clsx from "clsx";
import { CheckCircle2, Megaphone, Sparkles } from "lucide-react";
import {
  AdCreativeDropzone,
  type AdCreativeFile,
} from "@/components/dashboard/ad-creative-dropzone";
import { DashboardPageHeader } from "@/components/dashboard/page-chrome";
import {
  fieldErrorClass,
  fieldLabelClass,
  primaryButtonClass,
  secondaryButtonClass,
  textareaClass,
} from "@/components/auth/styles";
import { delayMs, planLabel, useAuthStore } from "@/lib/auth-store";
import { formatNaira } from "@/lib/dashboard";
import { growBizDemoMetrics, growBizOffer } from "@/lib/grow-biz";

export default function GrowBizPage() {
  const business = useAuthStore((s) => s.business);
  const plan = business?.plan ?? "free";
  const offer = growBizOffer(plan);
  const storeName = business?.businessName ?? "your store";

  const [files, setFiles] = useState<AdCreativeFile[]>([]);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [launched, setLaunched] = useState(false);
  const [boosted, setBoosted] = useState(false);

  async function payLaunch(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    if (files.length === 0) {
      setError("Upload at least one image or video for your ads.");
      return;
    }
    setLoading(true);
    await delayMs(900);
    setLoading(false);
    setLaunched(true);
  }

  async function payBoost() {
    setError(null);
    setLoading(true);
    await delayMs(900);
    setLoading(false);
    setBoosted(true);
  }

  return (
    <div>
      <DashboardPageHeader
        title="Grow Biz"
        description="Upload creative and run ads that send shoppers to your Salesy storefront."
      />

      {offer.kind === "launch" ? (
        <div className="grid gap-6 lg:grid-cols-5">
          <section className="h-fit rounded-xl border border-border bg-background p-6 lg:col-span-2">
            <div className="flex size-10 items-center justify-center rounded-full bg-tonal text-link">
              <Megaphone className="size-5" aria-hidden />
            </div>
            <h2 className="mt-4 text-[18px] leading-7 text-heading">
              Launch ads on Free
            </h2>
            <p className="mt-2 text-[14px] leading-6 text-muted">
              Upload your images or short videos, tell us the goal, and pay{" "}
              <span className="font-medium text-heading">
                {formatNaira(offer.price)}
              </span>{" "}
              for Grow Biz. We run the ads that drive traffic to your store.
            </p>
            <p className="mt-4 text-[13px] text-muted">
              Plan: {planLabel(plan)}. Boutique and Pro include automatic ads —
              Free uses Grow Biz to get the same lift.
            </p>
          </section>

          <section className="rounded-xl border border-border bg-background p-6 lg:col-span-3">
            {launched ? (
              <div className="py-6 text-center sm:py-10">
                <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-500">
                  <CheckCircle2 className="size-6" aria-hidden />
                </div>
                <h2 className="mt-4 text-[20px] text-heading">
                  Creative submitted
                </h2>
                <p className="mx-auto mt-2 max-w-md text-[14px] leading-6 text-muted">
                  Payment of {formatNaira(offer.price)} recorded. Our
                  team will run your Grow Biz ads using the creative you
                  uploaded.
                </p>
                <button
                  type="button"
                  className={clsx(secondaryButtonClass, "mx-auto mt-6 w-auto px-5")}
                  onClick={() => {
                    setLaunched(false);
                    setFiles([]);
                    setNotes("");
                  }}
                >
                  Submit another campaign
                </button>
              </div>
            ) : (
              <form className="flex flex-col gap-5" onSubmit={payLaunch} noValidate>
                <AdCreativeDropzone files={files} onChange={setFiles} />
                <div>
                  <label htmlFor="grow-notes" className={fieldLabelClass}>
                    Goal / notes{" "}
                    <span className="font-normal text-muted">(optional)</span>
                  </label>
                  <textarea
                    id="grow-notes"
                    className={clsx(textareaClass, "min-h-24")}
                    placeholder="e.g. Promote the Ankara tote this weekend — Lagos audience"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
                  {error && (
                    <p className={fieldErrorClass} role="alert">
                      {error}
                    </p>
                  ) }
                <button
                  type="submit"
                  disabled={loading}
                  className={clsx(primaryButtonClass, "w-auto min-w-52 px-6")}
                >
                  {loading
                    ? "Processing…"
                    : `Pay ${formatNaira(offer.price)} & submit`}
                </button>
              </form>
            )}
          </section>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-5">
          <section className="rounded-xl border border-border bg-background p-6 lg:col-span-3">
            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-500">
                <Sparkles className="size-5" aria-hidden />
              </div>
              <div>
                <h2 className="text-[18px] leading-7 text-heading">
                  Automatic ads are running
                </h2>
                <p className="mt-1 text-[14px] leading-6 text-muted">
                  Your {planLabel(plan)} plan includes ongoing ads for{" "}
                  {storeName}. No launch fee required.
                </p>
              </div>
            </div>

            <dl className="mt-6 grid gap-3 sm:grid-cols-3">
              {(
                [
                  ["Impressions", growBizDemoMetrics.impressions],
                  ["Clicks", growBizDemoMetrics.clicks],
                  ["Store visits", growBizDemoMetrics.storeVisits],
                ] as const
              ).map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-lg border border-border bg-surface px-4 py-3"
                >
                  <dt className="text-[12px] uppercase tracking-wide text-muted">
                    {label}
                  </dt>
                  <dd className="mt-1 text-[22px] font-medium tabular-nums text-heading">
                    {value.toLocaleString("en-NG")}
                  </dd>
                </div>
              ))}
            </dl>
            <p className="mt-3 text-[12px] text-muted">
              Demo metrics for the last 30 days.
            </p>
          </section>

          <section className="h-fit rounded-xl border border-border bg-background p-6 lg:col-span-2">
            <h2 className="text-[18px] leading-7 text-heading">Improve ads</h2>
            <p className="mt-2 text-[14px] leading-6 text-muted">
              Boost budget and creative refresh for{" "}
              <span className="font-medium text-heading">
                {formatNaira(offer.price)}
              </span>
              . Optional — your automatic ads keep running either way.
            </p>

            {boosted ? (
              <div className="mt-5 rounded-lg border border-green-600/30 bg-green-50 px-4 py-3 text-[14px] text-heading dark:bg-green-950/30">
                <p className="font-medium">Boost applied</p>
                <p className="mt-1 text-[13px] text-muted">
                  {formatNaira(offer.price)} recorded (demo). We’ll tighten
                  targeting and creative for the next cycle.
                </p>
                <button
                  type="button"
                  className="mt-3 text-[13px] font-medium text-link hover:underline"
                  onClick={() => setBoosted(false)}
                >
                  Boost again
                </button>
              </div>
            ) : (
              <>
                <p className="mt-4 text-[13px] text-muted">
                  Demo checkout — no real charge.
                </p>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => void payBoost()}
                  className={clsx(primaryButtonClass, "mt-4")}
                >
                  {loading
                    ? "Processing…"
                    : `Improve ads — ${formatNaira(offer.price)}`}
                </button>
              </>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
