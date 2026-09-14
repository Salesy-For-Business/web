"use client";

import Link from "next/link";
import clsx from "clsx";
import {
  DashboardEmptyState,
  DashboardPageHeader,
} from "@/components/dashboard/page-chrome";
import { primaryButtonClass, secondaryButtonClass } from "@/components/auth/styles";
import { useAuthStore, planLabel } from "@/lib/auth-store";
import { Store } from "lucide-react";

export default function StoreProfilePage() {
  const business = useAuthStore((s) => s.business);
  const user = useAuthStore((s) => s.user);

  if (!business) {
    return (
      <DashboardEmptyState
        icon={Store}
        title="No store profile yet"
        description="Finish business setup to manage your storefront details."
        primaryHref="/signup/business"
        primaryLabel="Finish setup"
      />
    );
  }

  return (
    <div>
      <DashboardPageHeader
        title="Store profile"
        description="Public details buyers see on your storefront."
        actions={
          <>
            <Link
              href={`https://salesy.link/${business.storeHandle}`}
              target="_blank"
              rel="noreferrer"
              className={clsx(secondaryButtonClass, "w-auto px-5")}
            >
              Preview store
            </Link>
            <button
              type="button"
              className={clsx(primaryButtonClass, "w-auto px-5")}
              disabled
              title="Editing comes next"
            >
              Edit profile
            </button>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="rounded-xl border border-border bg-background p-6 lg:col-span-2">
          <div className="flex items-start gap-4">
            {business.logoDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={business.logoDataUrl}
                alt=""
                className="size-16 rounded-xl object-cover"
              />
            ) : (
              <div className="flex size-16 items-center justify-center rounded-xl bg-tonal text-[24px] font-medium text-link">
                {business.businessName[0]?.toUpperCase()}
              </div>
            )}
            <div>
              <h2 className="text-[22px] leading-8">{business.businessName}</h2>
              <p className="mt-1 text-[14px] text-muted">
                salesy.link/{business.storeHandle} · {planLabel(business.plan)}
              </p>
            </div>
          </div>
          <p className="mt-6 text-[15px] leading-7 text-foreground">
            {business.description}
          </p>
          <dl className="mt-8 grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-[12px] uppercase tracking-wide text-muted">Email</dt>
              <dd className="mt-1 text-[14px] text-heading">{business.businessEmail}</dd>
            </div>
            <div>
              <dt className="text-[12px] uppercase tracking-wide text-muted">Phone</dt>
              <dd className="mt-1 text-[14px] text-heading">{business.businessPhone}</dd>
            </div>
            {business.hasPhysicalAddress ? (
              <div className="sm:col-span-2">
                <dt className="text-[12px] uppercase tracking-wide text-muted">
                  Address
                </dt>
                <dd className="mt-1 text-[14px] text-heading">
                  {[business.street, business.city, business.state]
                    .filter(Boolean)
                    .join(", ")}
                </dd>
              </div>
            ) : null}
            {business.isRegistered ? (
              <div>
                <dt className="text-[12px] uppercase tracking-wide text-muted">CAC</dt>
                <dd className="mt-1 text-[14px] text-heading">{business.cacNumber}</dd>
              </div>
            ) : null}
          </dl>
        </section>

        <section className="rounded-xl border border-border bg-background p-6">
          <h3 className="text-[16px] font-medium text-heading">Owner on file</h3>
          <p className="mt-3 text-[14px] text-heading">
            {business.ownerFirstName} {business.ownerLastName}
          </p>
          <p className="mt-1 text-[13px] text-muted">{business.ownerRole}</p>
          <p className="mt-4 text-[13px] text-muted">{business.ownerEmail}</p>
          <p className="text-[13px] text-muted">{business.ownerPhone}</p>
          <p className="mt-6 border-t border-border pt-4 text-[13px] text-muted">
            Signed in as {user?.firstName} {user?.lastName}
          </p>
        </section>
      </div>
    </div>
  );
}
