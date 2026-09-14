"use client";

import Link from "next/link";
import { useStorefront } from "@/components/storefront/store-context";
import { primaryButtonClass } from "@/components/auth/styles";
import { storePath } from "@/lib/storefront";
import clsx from "clsx";

/** Product slug missing inside an existing store. */
export default function StoreProductNotFound() {
  const store = useStorefront();
  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <h1 className="font-display text-[28px] text-heading">Product not found</h1>
      <p className="mt-3 text-[15px] text-muted">
        That item isn’t in {store.businessName} anymore, or the link is wrong.
      </p>
      <Link
        href={storePath(store.handle)}
        className={clsx(primaryButtonClass, "mx-auto mt-6 w-auto px-6")}
      >
        Back to store
      </Link>
    </div>
  );
}
