"use client";

import { useParams } from "next/navigation";
import { StorefrontMissing } from "@/components/storefront/storefront-missing";

export default function StoreHandleNotFound() {
  const params = useParams<{ storeHandle?: string }>();
  const handle =
    typeof params?.storeHandle === "string" ? params.storeHandle : undefined;
  return <StorefrontMissing handle={handle} />;
}
